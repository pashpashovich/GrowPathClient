import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Download,
  Refresh,
  FilterList,
  ExpandMore,
  PersonSearch,
  Star,
  WorkspacePremium,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRatingsAsync,
  recalculateRanks,
  setSelectedInternship,
} from '../../store/slices/ratingSlice';
import { designTokens } from '../../theme';

const TABLE_HEAD_BG = 'rgba(243, 244, 246, 0.5)';
const FILTER_PILL_BORDER = 'rgba(195, 198, 214, 0.5)';

const DIRECTION_CHIP_STYLES = [
  { bg: '#dae2ff', color: '#0040a2' },
  { bg: '#82f9be', color: '#005235' },
  { bg: '#ffddb3', color: '#624000' },
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function getProgressPercent(rating) {
  const tc = rating.tasksCompleted ?? 0;
  if (tc > 0) {
    return Math.min(100, Math.round(((rating.tasksOnTime ?? 0) / tc) * 100));
  }
  const or = Number(rating.overallRating) || 0;
  return Math.min(100, Math.round((or / 10) * 100));
}

function avgProgress(list) {
  if (!list.length) return 0;
  return Math.round(list.reduce((a, r) => a + getProgressPercent(r), 0) / list.length);
}

const RatingTable = () => {
  const dispatch = useDispatch();

  const { ratings = [], selectedInternshipId, isLoading } = useSelector((state) => state.rating || {});
  const { internships = [] } = useSelector((state) => state.roadmap || {});
  const programs = useSelector((state) => state.internshipProgram?.programs || []);

  const internshipOptions = useMemo(() => {
    if (programs.length > 0) {
      return programs.map((p) => ({
        id: p.id,
        title: p.title || p.name || `Программа ${p.id}`,
      }));
    }
    return internships.map((i) => ({
      id: i.id,
      title: i.title || i.name || `Стажировка ${i.id}`,
    }));
  }, [programs, internships]);

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('rank');

  const [draftDirection, setDraftDirection] = useState('all');
  const [draftMentor, setDraftMentor] = useState('all');
  const [draftRank, setDraftRank] = useState('all');
  const [appliedDirection, setAppliedDirection] = useState('all');
  const [appliedMentor, setAppliedMentor] = useState('all');
  const [appliedRank, setAppliedRank] = useState('all');

  useEffect(() => {
    dispatch(fetchRatingsAsync(selectedInternshipId ? { internshipId: selectedInternshipId } : undefined));
  }, [dispatch, selectedInternshipId]);

  const filteredRatings = useMemo(() => {
    if (!selectedInternshipId) return ratings;
    return ratings.filter((rating) => rating.internshipId === selectedInternshipId);
  }, [ratings, selectedInternshipId]);

  const sortedRatings = useMemo(() => {
    const sorted = [...filteredRatings];
    switch (sortBy) {
      case 'rank':
        return sorted.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
      case 'rating':
        return sorted.sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));
      case 'experience':
        return sorted.sort((a, b) => (a.experience ?? 0) - (b.experience ?? 0));
      case 'tasks':
        return sorted.sort((a, b) => (b.tasksCompleted ?? 0) - (a.tasksCompleted ?? 0));
      default:
        return sorted;
    }
  }, [filteredRatings, sortBy]);

  const directionOptions = useMemo(() => {
    const set = new Set();
    sortedRatings.forEach((r) => {
      if (r.position) set.add(r.position);
    });
    return ['all', ...Array.from(set).sort()];
  }, [sortedRatings]);

  const mentorOptions = useMemo(() => {
    const set = new Set();
    sortedRatings.forEach((r) => {
      if (r.mentorName) set.add(r.mentorName);
    });
    return ['all', ...Array.from(set).sort()];
  }, [sortedRatings]);

  const displayRows = useMemo(() => {
    let rows = sortedRatings;

    if (appliedDirection !== 'all') {
      rows = rows.filter((r) => r.position === appliedDirection);
    }
    if (appliedMentor !== 'all') {
      rows = rows.filter((r) => r.mentorName === appliedMentor);
    }
    if (appliedRank === 'top') {
      rows = rows.filter((r) => (r.rank ?? 99) <= 15 || (r.overallRating ?? 0) >= 4.5);
    }

    return rows;
  }, [sortedRatings, appliedDirection, appliedMentor, appliedRank]);

  const activeCount = displayRows.length;
  const completedCount = displayRows.filter((r) => getProgressPercent(r) >= 90).length;
  const avgProgressVal = avgProgress(displayRows);
  const topTalentCount = displayRows.filter((r) => (r.overallRating ?? 0) >= 4.5).length;

  const pageCount = Math.max(1, Math.ceil(displayRows.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = displayRows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const from = displayRows.length === 0 ? 0 : safePage * rowsPerPage + 1;
  const to = Math.min((safePage + 1) * rowsPerPage, displayRows.length);

  useEffect(() => {
    setPage(0);
  }, [appliedDirection, appliedMentor, appliedRank, selectedInternshipId]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'secondary.main' }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlat sx={{ color: 'text.secondary' }} />;
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Стажер', 'Рейтинг', 'Ментор', 'Направление', 'Прогресс %', 'Тренд'],
      ...displayRows.map((rating) => [
        rating.internName,
        rating.overallRating,
        rating.mentorName,
        rating.position,
        getProgressPercent(rating),
        rating.trend,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rating_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    dispatch(fetchRatingsAsync(selectedInternshipId ? { internshipId: selectedInternshipId } : undefined));
    dispatch(recalculateRanks());
  };

  const applyFilters = () => {
    setAppliedDirection(draftDirection);
    setAppliedMentor(draftMentor);
    setAppliedRank(draftRank);
  };

  const resetFilters = () => {
    setDraftDirection('all');
    setDraftMentor('all');
    setDraftRank('all');
    setAppliedDirection('all');
    setAppliedMentor('all');
    setAppliedRank('all');
    dispatch(setSelectedInternship(null));
  };

  const filterSelectSx = {
    minWidth: 0,
    fontSize: '0.875rem',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { py: 0.5, pr: 3 },
  };

  const pillOuterSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: 1,
    bgcolor: 'grey.100',
    borderRadius: 2,
    border: 1,
    borderColor: FILTER_PILL_BORDER,
  };

  if (isLoading && !ratings.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            gridColumn: { md: 'span 2' },
            p: 3,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 200,
          }}
        >
          <Box>
            <Typography variant="h1" component="h1" sx={{ mb: 1, fontSize: '1.875rem' }}>
              Рейтинг стажеров
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Отслеживайте прогресс и эффективность подготовки будущих ИТ-специалистов в реальном времени.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {activeCount} активных
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {completedCount} завершили
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <TrendingUp sx={{ fontSize: 40, mb: 2, opacity: 0.95 }} />
          <Typography variant="h2" sx={{ color: 'inherit' }}>
            {avgProgressVal}%
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Средний прогресс
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <WorkspacePremium sx={{ fontSize: 40, mb: 2, color: 'warning.dark' }} />
          <Typography variant="h2">{Math.min(topTalentCount, 15)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Топ-талантов
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={selectedInternshipId || ''}
            displayEmpty
            onChange={(e) => dispatch(setSelectedInternship(e.target.value || null))}
            sx={filterSelectSx}
          >
            <MenuItem value="">
              <em>Все программы</em>
            </MenuItem>
            {internshipOptions.map((internship) => (
              <MenuItem key={internship.id} value={internship.id}>
                {internship.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ ...pillOuterSx, py: 0.5 }}>
          <FilterList sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Направление:
          </Typography>
          <FormControl size="small" variant="standard">
            <Select
              value={draftDirection}
              onChange={(e) => setDraftDirection(e.target.value)}
              sx={filterSelectSx}
              IconComponent={ExpandMore}
            >
              {directionOptions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d === 'all' ? 'Все' : d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...pillOuterSx, py: 0.5 }}>
          <PersonSearch sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Ментор:
          </Typography>
          <FormControl size="small" variant="standard">
            <Select
              value={draftMentor}
              onChange={(e) => setDraftMentor(e.target.value)}
              sx={filterSelectSx}
              IconComponent={ExpandMore}
            >
              {mentorOptions.map((m) => (
                <MenuItem key={m} value={m}>
                  {m === 'all' ? 'Любой' : m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ...pillOuterSx, py: 0.5 }}>
          <Star sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Ранг:
          </Typography>
          <FormControl size="small" variant="standard">
            <Select
              value={draftRank}
              onChange={(e) => setDraftRank(e.target.value)}
              sx={filterSelectSx}
              IconComponent={ExpandMore}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="top">Топ-15 / 4.5+</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={filterSelectSx}>
            <MenuItem value="rank">По рангу</MenuItem>
            <MenuItem value="rating">По баллу</MenuItem>
            <MenuItem value="experience">По опыту</MenuItem>
            <MenuItem value="tasks">По задачам</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, md: 'auto' } }}>
          <Tooltip title="Обновить">
            <IconButton onClick={handleRefresh} size="small" aria-label="Обновить">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт CSV">
            <IconButton onClick={handleExportCSV} size="small" aria-label="Экспорт CSV">
              <Download />
            </IconButton>
          </Tooltip>
          <Button variant="text" color="primary" onClick={resetFilters} sx={{ fontWeight: 600 }}>
            Сбросить
          </Button>
          <Button variant="contained" color="primary" onClick={applyFilters} sx={{ fontWeight: 700 }}>
            Применить
          </Button>
        </Box>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: TABLE_HEAD_BG,
                borderBottom: 1,
                borderColor: 'divider',
                '& th': {
                  typography: 'caption',
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  py: 2,
                  px: 3,
                },
              }}
            >
              <TableCell>Ранг</TableCell>
              <TableCell>Стажер</TableCell>
              <TableCell>Ментор</TableCell>
              <TableCell>Направление</TableCell>
              <TableCell>Ср. балл</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Прогресс</TableCell>
              <TableCell>Тренд</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.map((rating) => {
              const rank = rating.rank ?? 0;
              const progress = getProgressPercent(rating);
              const chipStyle = DIRECTION_CHIP_STYLES[hashStr(rating.position || '') % 3];
              const score = Number(rating.overallRating);
              const safeScore = Number.isFinite(score) ? score : 0;

              return (
                <TableRow
                  key={rating.id || rating.internId}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'rgba(12, 86, 208, 0.06)' },
                    '&:hover .profile-btn': { opacity: 1 },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        bgcolor: rank === 1 ? '#ffddb3' : 'grey.200',
                        color: rank === 1 ? '#624000' : 'text.secondary',
                      }}
                    >
                      {rank}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={rating.avatarUrl}
                        variant="rounded"
                        sx={{ width: 40, height: 40, fontSize: '0.875rem' }}
                      >
                        {(rating.internName || '?')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {rating.internName || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {rating.internId ?? rating.id ?? '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Typography variant="body2">{rating.mentorName || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 999,
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        bgcolor: chipStyle.bg,
                        color: chipStyle.color,
                      }}
                    >
                      {rating.position || '—'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Typography fontWeight={700} color="secondary.main">
                      {safeScore.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2, minWidth: 180 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 999,
                          bgcolor: 'grey.300',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${progress}%`,
                            bgcolor: progress >= 80 ? 'secondary.main' : 'primary.dark',
                            borderRadius: 999,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>{getTrendIcon(rating.trend)}</TableCell>
                  <TableCell align="right" sx={{ px: 3, py: 2 }}>
                    <Button
                      size="small"
                      className="profile-btn"
                      sx={{ opacity: 0, fontWeight: 700, transition: 'opacity 0.15s' }}
                    >
                      Профиль
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Показано {from}–{to} из {displayRows.length} стажеров
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                ‹
              </Typography>
            </IconButton>
            {Array.from({ length: pageCount }, (_, i) => i)
              .slice(Math.max(0, safePage - 1), Math.min(pageCount, safePage + 2))
              .map((i) => (
                <Button
                  key={i}
                  size="small"
                  onClick={() => setPage(i)}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 2,
                    fontWeight: 700,
                    ...(safePage === i
                      ? { bgcolor: 'primary.dark', color: 'primary.contrastText' }
                      : { border: 1, borderColor: 'divider', color: 'text.primary' }),
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            <IconButton
              size="small"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                ›
              </Typography>
            </IconButton>
          </Box>
        </Box>
      </TableContainer>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'grey.200',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h3" gutterBottom>
            Инсайт по качеству подготовки
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Текущий поток показывает на 12% выше результаты по Backend-компетенциям по сравнению с прошлым
            кварталом. Используйте фильтры и экспорт для детального разбора по направлениям.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {[designTokens.colors.primaryContainer, designTokens.colors.secondary, designTokens.colors.tertiary].map(
            (bg, idx) => (
              <Avatar
                key={idx}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: bg,
                  color: 'common.white',
                  border: 2,
                  borderColor: 'background.paper',
                  ml: idx === 0 ? 0 : -1.5,
                  fontSize: '0.75rem',
                }}
              >
                {idx + 1}
              </Avatar>
            )
          )}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              border: 2,
              borderColor: 'background.paper',
              ml: -1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            +
            {Math.max(0, displayRows.length - 3)}
          </Avatar>
        </Box>
      </Paper>
    </Box>
  );
};

export default RatingTable;
