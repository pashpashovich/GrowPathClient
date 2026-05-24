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
  InputLabel,
  Avatar,
  CircularProgress,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  Grid,
  ListSubheader,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Download,
  Refresh,
  Search,
  PictureAsPdf,
  Gavel,
} from '@mui/icons-material';
import { internAPI } from '../../services/api';
import InternHiringDecisionDialog from '../hiring/InternHiringDecisionDialog';
import {
  canRecordHiringDecision,
  isProgramEligibleForHiring,
} from '../../utils/hiringDecision';
import { getAxiosBlobErrorMessage, saveAxiosBlobResponse } from '../../utils/downloadBlob';
import ActionSnackbar from '../mailings/ActionSnackbar';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRatingsAsync,
  recalculateRanks,
  setSelectedInternship,
} from '../../store/slices/ratingSlice';
import { fetchInternshipProgramsAsync } from '../../store/slices/internshipProgramSlice';

const DIRECTION_CHIP_STYLES = [
  { bg: '#dae2ff', color: '#0040a2' },
  { bg: '#82f9be', color: '#005235' },
  { bg: '#ffddb3', color: '#624000' },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];
const DROPDOWN_PER_PAGE = 10;

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

const RatingTable = () => {
  const dispatch = useDispatch();

  const { ratings = [], selectedInternshipId, isLoading } = useSelector((state) => state.rating || {});
  const { internships = [] } = useSelector((state) => state.roadmap || {});
  const programs = useSelector((state) => state.internshipProgram?.programs || []);
  const userRole = useSelector((state) => state.auth?.user?.role);
  const mayApproveHiring = canRecordHiringDecision(userRole);

  const internshipOptions = useMemo(() => {
    if (programs.length > 0) {
      return programs.map((p) => ({
        id: Number(p.id),
        title: p.title || p.name || `Программа ${p.id}`,
      }));
    }
    return internships.map((i) => ({
      id: Number(i.id),
      title: i.title || i.name || `Стажировка ${i.id}`,
    }));
  }, [programs, internships]);

  const programMap = useMemo(() => {
    const map = new Map();
    programs.forEach((p) => map.set(Number(p.id), p));
    internships.forEach((i) => {
      const numId = Number(i.id);
      if (!map.has(numId)) map.set(numId, i);
    });
    return map;
  }, [programs, internships]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('rank');
  const [searchInput, setSearchInput] = useState('');

  const [filterDirection, setFilterDirection] = useState('all');
  const [filterMentor, setFilterMentor] = useState('all');
  const [filterRank, setFilterRank] = useState('all');

  // Dropdown search & pagination
  const [programSearch, setProgramSearch] = useState('');
  const [programPage, setProgramPage] = useState(0);
  const [directionSearch, setDirectionSearch] = useState('');
  const [directionPage, setDirectionPage] = useState(0);
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorPage, setMentorPage] = useState(0);
  const [pdfLoadingInternId, setPdfLoadingInternId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hiringTarget, setHiringTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchRatingsAsync(selectedInternshipId ? { internshipId: selectedInternshipId } : undefined));
  }, [dispatch, selectedInternshipId]);

  useEffect(() => {
    if (programs.length === 0) {
      dispatch(fetchInternshipProgramsAsync());
    }
  }, [dispatch, programs]);

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
      const program = programMap.get(Number(r.internshipId));
      const direction = program?.itDirectionRef?.displayName || program?.itDirection || r.position;
      if (direction) set.add(direction);
    });
    return Array.from(set).sort();
  }, [sortedRatings, programMap]);

  const mentorOptions = useMemo(() => {
    const set = new Set();
    sortedRatings.forEach((r) => {
      if (r.mentorName) set.add(r.mentorName);
    });
    return Array.from(set).sort();
  }, [sortedRatings]);

  const displayRows = useMemo(() => {
    let rows = sortedRatings;

    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      rows = rows.filter((r) => {
        const program = programMap.get(Number(r.internshipId));
        const programTitle = program?.title || '';
        const directionName = program?.itDirectionRef?.displayName || program?.itDirection || r.position || '';
        return (
          r.internName?.toLowerCase().includes(q) ||
          r.mentorName?.toLowerCase().includes(q) ||
          r.position?.toLowerCase().includes(q) ||
          programTitle.toLowerCase().includes(q) ||
          directionName.toLowerCase().includes(q)
        );
      });
    }

    if (filterDirection !== 'all') {
      rows = rows.filter((r) => {
        const program = programMap.get(Number(r.internshipId));
        const direction = program?.itDirectionRef?.displayName || program?.itDirection || r.position;
        return direction === filterDirection;
      });
    }
    if (filterMentor !== 'all') {
      rows = rows.filter((r) => r.mentorName === filterMentor);
    }
    if (filterRank === 'top') {
      rows = rows.filter((r) => (r.rank ?? 99) <= 15 || (r.overallRating ?? 0) >= 4.5);
    }

    return rows;
  }, [sortedRatings, searchInput, filterDirection, filterMentor, filterRank, programMap]);

  // Dropdown paged options
  const filteredProgramOptions = useMemo(() => {
    const q = programSearch.toLowerCase();
    return q ? internshipOptions.filter((o) => o.title.toLowerCase().includes(q)) : internshipOptions;
  }, [internshipOptions, programSearch]);

  const pagedProgramOptions = useMemo(
    () => filteredProgramOptions.slice(programPage * DROPDOWN_PER_PAGE, (programPage + 1) * DROPDOWN_PER_PAGE),
    [filteredProgramOptions, programPage]
  );
  const totalProgramPages = Math.ceil(filteredProgramOptions.length / DROPDOWN_PER_PAGE);

  const filteredDirectionOptions = useMemo(() => {
    const q = directionSearch.toLowerCase();
    return q ? directionOptions.filter((d) => d.toLowerCase().includes(q)) : directionOptions;
  }, [directionOptions, directionSearch]);

  const pagedDirectionOptions = useMemo(
    () => filteredDirectionOptions.slice(directionPage * DROPDOWN_PER_PAGE, (directionPage + 1) * DROPDOWN_PER_PAGE),
    [filteredDirectionOptions, directionPage]
  );
  const totalDirectionPages = Math.ceil(filteredDirectionOptions.length / DROPDOWN_PER_PAGE);

  const filteredMentorOptions = useMemo(() => {
    const q = mentorSearch.toLowerCase();
    return q ? mentorOptions.filter((m) => m.toLowerCase().includes(q)) : mentorOptions;
  }, [mentorOptions, mentorSearch]);

  const pagedMentorOptions = useMemo(
    () => filteredMentorOptions.slice(mentorPage * DROPDOWN_PER_PAGE, (mentorPage + 1) * DROPDOWN_PER_PAGE),
    [filteredMentorOptions, mentorPage]
  );
  const totalMentorPages = Math.ceil(filteredMentorOptions.length / DROPDOWN_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [filterDirection, filterMentor, filterRank, selectedInternshipId, searchInput]);

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
      ['Ранг', 'Стажер', 'Рейтинг', 'Ментор', 'Программа', 'Направление', 'Прогресс %', 'Тренд'],
      ...displayRows.map((rating) => {
        const program = programMap.get(Number(rating.internshipId));
        return [
          rating.rank,
          rating.internName,
          rating.overallRating,
          rating.mentorName,
          program?.title || '—',
          program?.itDirectionRef?.displayName || program?.itDirection || rating.position || '—',
          getProgressPercent(rating),
          rating.trend,
        ];
      }),
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

  const resetFilters = () => {
    setSearchInput('');
    setFilterDirection('all');
    setFilterMentor('all');
    setFilterRank('all');
    setSortBy('rank');
    dispatch(setSelectedInternship(null));
  };

  const openHiringDialog = (rating) => {
    const programId = rating.internshipId ?? selectedInternshipId;
    if (!programId) {
      setSnackbar({
        open: true,
        message: 'Не указана программа стажировки для решения о найме',
        severity: 'warning',
      });
      return;
    }
    const program = programMap.get(Number(programId));
    if (!isProgramEligibleForHiring(program)) {
      setSnackbar({
        open: true,
        message: 'Решение доступно только для завершённых программ',
        severity: 'warning',
      });
      return;
    }
    setHiringTarget({
      internId: rating.internId,
      programId: Number(programId),
      internName: rating.internName,
      programTitle: program?.title || program?.name || rating.programName,
    });
  };

  const handleDownloadInternPdf = async (internId, internName) => {
    setPdfLoadingInternId(internId);
    try {
      const response = await internAPI.downloadInternshipResultReport(internId);
      await saveAxiosBlobResponse(response, `intern-result-${internId}.pdf`);
      setSnackbar({ open: true, message: `PDF «${internName || 'стажёр'}» скачан`, severity: 'success' });
    } catch (error) {
      const message = await getAxiosBlobErrorMessage(error, 'Не удалось сформировать PDF');
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setPdfLoadingInternId(null);
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const dropdownNav = (page, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <ListSubheader sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 0.5 }}>
        <Button size="small" disabled={page === 0} onClick={(e) => { e.stopPropagation(); setPage((p) => p - 1); }}>
          Назад
        </Button>
        <Typography variant="caption" sx={{ alignSelf: 'center' }}>
          {page + 1} / {totalPages}
        </Typography>
        <Button size="small" disabled={page >= totalPages - 1} onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}>
          Далее
        </Button>
      </ListSubheader>
    );
  };

  const searchableSelectHeader = (value, onChange, placeholder) => (
    <ListSubheader>
      <TextField
        size="small"
        placeholder={placeholder}
        fullWidth
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation(); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />
    </ListSubheader>
  );

  if (isLoading && !ratings.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Рейтинг стажеров
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Обновить">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт CSV">
            <IconButton onClick={handleExportCSV} size="small">
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="medium"
        placeholder="Поиск по имени, ментору или направлению..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel shrink>Программа</InputLabel>
            <Select
              value={selectedInternshipId || ''}
              label="Программа"
              displayEmpty
              onChange={(e) => dispatch(setSelectedInternship(Number(e.target.value) || null))}
              renderValue={(value) => {
                if (!value) return <em>Все программы</em>;
                const option = internshipOptions.find((o) => o.id === value);
                return option ? option.title : '';
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 600 } } }}
            >
              {searchableSelectHeader(programSearch, (v) => { setProgramSearch(v); setProgramPage(0); }, 'Поиск программы...')}
              <MenuItem value="">
                <em>Все программы</em>
              </MenuItem>
              {pagedProgramOptions.map((internship) => (
                <MenuItem key={internship.id} value={internship.id}>
                  {internship.title}
                </MenuItem>
              ))}
              {dropdownNav(programPage, totalProgramPages, setProgramPage)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Направление</InputLabel>
            <Select
              value={filterDirection}
              label="Направление"
              onChange={(e) => setFilterDirection(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 600 } } }}
            >
              {searchableSelectHeader(directionSearch, (v) => { setDirectionSearch(v); setDirectionPage(0); }, 'Поиск...')}
              <MenuItem value="all">Все</MenuItem>
              {pagedDirectionOptions.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
              {dropdownNav(directionPage, totalDirectionPages, setDirectionPage)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Ментор</InputLabel>
            <Select
              value={filterMentor}
              label="Ментор"
              onChange={(e) => setFilterMentor(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 600 } } }}
            >
              {searchableSelectHeader(mentorSearch, (v) => { setMentorSearch(v); setMentorPage(0); }, 'Поиск...')}
              <MenuItem value="all">Любой</MenuItem>
              {pagedMentorOptions.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
              {dropdownNav(mentorPage, totalMentorPages, setMentorPage)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Ранг</InputLabel>
            <Select
              value={filterRank}
              label="Ранг"
              onChange={(e) => setFilterRank(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="top">Топ-15 / 4.5+</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={1.5}>
          <FormControl fullWidth>
            <InputLabel>Сортировка</InputLabel>
            <Select value={sortBy} label="Сортировка" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="rank">По рангу</MenuItem>
              <MenuItem value="rating">По баллу</MenuItem>
              <MenuItem value="experience">По опыту</MenuItem>
              <MenuItem value="tasks">По задачам</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={1.5}>
          <Button fullWidth variant="outlined" onClick={resetFilters} sx={{ height: '56px' }}>
            Сбросить
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100', '& th': { typography: 'caption', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' } }}>
              <TableCell sx={{ py: 2, px: 3 }}>Ранг</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Стажер</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Ментор</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Программа</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Направление</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Ср. балл</TableCell>
              <TableCell sx={{ py: 2, px: 3, minWidth: 180 }}>Прогресс</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Тренд</TableCell>
              <TableCell sx={{ py: 2, px: 3 }} align="center">Отчёт</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rating) => {
              const rank = rating.rank ?? 0;
              const progress = getProgressPercent(rating);
              const program = programMap.get(Number(rating.internshipId));
              const directionName = program?.itDirectionRef?.displayName || program?.itDirection || rating.position || '';
              const chipStyle = DIRECTION_CHIP_STYLES[hashStr(directionName) % 3];
              const score = Number(rating.overallRating);
              const safeScore = Number.isFinite(score) ? score : 0;

              return (
                <TableRow key={rating.id || rating.internId} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
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
                      <Avatar src={rating.avatarUrl} sx={{ width: 40, height: 40 }}>
                        {(rating.internName || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
                    <Typography variant="body2">{program?.title || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    {directionName ? (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 999,
                          fontSize: '11px',
                          fontWeight: 700,
                          bgcolor: chipStyle.bg,
                          color: chipStyle.color,
                        }}
                      >
                        {directionName}
                      </Box>
                    ) : '—'}
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
                  <TableCell sx={{ px: 3, py: 2 }} align="center">
                    {rating.internId ? (
                      <Box sx={{ display: 'inline-flex', gap: 0.25 }}>
                        <Tooltip title="Итоги стажировки (PDF, GP-RPT-1)">
                          <span>
                            <IconButton
                              size="small"
                              disabled={pdfLoadingInternId === rating.internId}
                              onClick={() => handleDownloadInternPdf(rating.internId, rating.internName)}
                            >
                              {pdfLoadingInternId === rating.internId ? (
                                <CircularProgress size={18} />
                              ) : (
                                <PictureAsPdf fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                        {mayApproveHiring &&
                          isProgramEligibleForHiring(
                            programMap.get(Number(rating.internshipId ?? selectedInternshipId))
                          ) && (
                            <Tooltip title="Принять решение о найме (UC-14)">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openHiringDialog(rating)}
                              >
                                <Gavel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={displayRows.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`}
          sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}
        />
      </TableContainer>

      <InternHiringDecisionDialog
        open={Boolean(hiringTarget)}
        onClose={() => setHiringTarget(null)}
        internId={hiringTarget?.internId}
        programId={hiringTarget?.programId}
        internName={hiringTarget?.internName}
        programTitle={hiringTarget?.programTitle}
        onRecorded={() => handleRefresh()}
      />

      <ActionSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
};

export default RatingTable;
