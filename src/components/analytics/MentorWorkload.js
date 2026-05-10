import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  ListSubheader,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Person,
  Warning,
  CheckCircle,
  Download,
  Visibility,
  TrendingUp,
  TrendingDown,
  Search,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentorWorkloadAsync } from '../../store/slices/analyticsSlice';
import { analyticsAPI } from '../../services/api';

const PROGRAMS_PER_PAGE = 10;
const MENTORS_TABLE_PER_PAGE = 10;

const MentorWorkload = () => {
  const dispatch = useDispatch();
  const mentorWorkload = useSelector((state) => state.analytics?.mentorWorkload || []);
  const isLoading = useSelector((state) => state.analytics?.isLoading);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState('all');
  const [programSearch, setProgramSearch] = useState('');
  const [programPage, setProgramPage] = useState(0);
  const [mentorPage, setMentorPage] = useState(1);
  const [detailMentor, setDetailMentor] = useState(null);

  const getWorkloadColor = (workload) => {
    switch (workload) {
      case 'normal': return 'success';
      case 'high': return 'warning';
      case 'overload': return 'error';
      default: return 'default';
    }
  };

  const getWorkloadLabel = (workload) => {
    switch (workload) {
      case 'normal': return 'Нормальная';
      case 'high': return 'Высокая';
      case 'overload': return 'Перегрузка';
      default: return workload;
    }
  };

  const getWorkloadIcon = (workload) => {
    switch (workload) {
      case 'normal': return <CheckCircle />;
      case 'high': return <Warning />;
      case 'overload': return <Warning />;
      default: return <Person />;
    }
  };

  useEffect(() => {
    dispatch(fetchMentorWorkloadAsync());
  }, [dispatch]);

  const uniquePrograms = useMemo(
    () => Array.from(new Set((mentorWorkload || []).flatMap((m) => m.programs || []))),
    [mentorWorkload]
  );

  const filteredProgramOptions = useMemo(() => {
    const q = programSearch.toLowerCase();
    return q ? uniquePrograms.filter((p) => p.toLowerCase().includes(q)) : uniquePrograms;
  }, [uniquePrograms, programSearch]);

  const pagedProgramOptions = useMemo(
    () => filteredProgramOptions.slice(programPage * PROGRAMS_PER_PAGE, (programPage + 1) * PROGRAMS_PER_PAGE),
    [filteredProgramOptions, programPage]
  );

  const totalProgramPages = Math.ceil(filteredProgramOptions.length / PROGRAMS_PER_PAGE);

  const filteredMentors = useMemo(
    () =>
      mentorWorkload.filter((mentor) => {
        const programs = mentor.programs || [];
        const programMatch = !selectedProgram || programs.includes(selectedProgram);
        const workloadMatch = workloadFilter === 'all' || mentor.workload === workloadFilter;
        return programMatch && workloadMatch;
      }),
    [mentorWorkload, selectedProgram, workloadFilter]
  );

  const overloadedMentors = mentorWorkload.filter(
    (mentor) => mentor.workload === 'high' || mentor.workload === 'overload'
  );

  const totalMentorPages = Math.ceil(filteredMentors.length / MENTORS_TABLE_PER_PAGE);
  const paginatedMentors = useMemo(
    () => filteredMentors.slice((mentorPage - 1) * MENTORS_TABLE_PER_PAGE, mentorPage * MENTORS_TABLE_PER_PAGE),
    [filteredMentors, mentorPage]
  );

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.getMentorWorkloadExport();
      downloadBlob(response.data, 'mentor-workload.csv');
    } catch (error) {
      console.error('Export mentor workload error', error);
    }
  };

  return (
    <Box>
      {overloadedMentors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Внимание! {overloadedMentors.length} ментор(ов) в зоне перегрузки
          </Typography>
          {overloadedMentors.map((mentor) => (
            <Typography key={mentor.mentorId} variant="body2">
              &bull; {mentor.mentorName}: {mentor.totalInterns} стажеров, {mentor.activeTasks} активных задач
            </Typography>
          ))}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Программа</InputLabel>
                <Select
                  value={selectedProgram}
                  label="Программа"
                  displayEmpty
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  renderValue={(value) => value || <em>Все программы</em>}
                  MenuProps={{
                    PaperProps: { sx: { maxHeight: 600 } },
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Поиск программы..."
                      fullWidth
                      value={programSearch}
                      onChange={(e) => {
                        setProgramSearch(e.target.value);
                        setProgramPage(0);
                      }}
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
                  <MenuItem value="">Все программы</MenuItem>
                  {pagedProgramOptions.map((program) => (
                    <MenuItem key={program} value={program}>
                      {program}
                    </MenuItem>
                  ))}
                  {totalProgramPages > 1 && (
                    <ListSubheader sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 0.5 }}>
                      <Button
                        size="small"
                        disabled={programPage === 0}
                        onClick={(e) => { e.stopPropagation(); setProgramPage((p) => p - 1); }}
                      >
                        Назад
                      </Button>
                      <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                        {programPage + 1} / {totalProgramPages}
                      </Typography>
                      <Button
                        size="small"
                        disabled={programPage >= totalProgramPages - 1}
                        onClick={(e) => { e.stopPropagation(); setProgramPage((p) => p + 1); }}
                      >
                        Далее
                      </Button>
                    </ListSubheader>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Загрузка</InputLabel>
                <Select
                  value={workloadFilter}
                  label="Загрузка"
                  onChange={(e) => setWorkloadFilter(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  <MenuItem value="normal">Нормальная</MenuItem>
                  <MenuItem value="high">Высокая</MenuItem>
                  <MenuItem value="overload">Перегрузка</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" startIcon={<Download />} onClick={handleExport} fullWidth>
                Экспорт данных
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Всего менторов: {filteredMentors.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Compact table */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && filteredMentors.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Нет данных для отображения
        </Typography>
      )}

      {!isLoading && filteredMentors.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ментор</TableCell>
                  <TableCell align="center">Стажеры</TableCell>
                  <TableCell align="center">Активные задачи</TableCell>
                  <TableCell align="center">Ожидают ревью</TableCell>
                  <TableCell align="center">Время ответа</TableCell>
                  <TableCell align="center">Загрузка</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMentors.map((mentor) => (
                  <TableRow key={mentor.mentorId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {mentor.mentorName.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{mentor.mentorName}</Typography>
                          <Typography variant="caption" color="text.secondary">{mentor.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={mentor.totalInterns} color={mentor.totalInterns > 5 ? 'error' : 'primary'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={mentor.activeTasks} color={mentor.activeTasks > 10 ? 'error' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={mentor.pendingReviews} color={mentor.pendingReviews > 5 ? 'error' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>{mentor.averageReviewTime} дн.</Typography>
                        {mentor.averageReviewTime < 2 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getWorkloadIcon(mentor.workload)}
                        label={getWorkloadLabel(mentor.workload)}
                        color={getWorkloadColor(mentor.workload)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Детальный просмотр">
                        <IconButton size="small" onClick={() => setDetailMentor(mentor)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalMentorPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalMentorPages}
                page={mentorPage}
                onChange={(_, val) => setMentorPage(val)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!detailMentor}
        onClose={() => setDetailMentor(null)}
        maxWidth="sm"
        fullWidth
      >
        {detailMentor && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                  {detailMentor.mentorName.split(' ').map((n) => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{detailMentor.mentorName}</Typography>
                  <Typography variant="body2" color="text.secondary">{detailMentor.email}</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailMentor(null)}>
                &#x2715;
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={getWorkloadIcon(detailMentor.workload)}
                  label={getWorkloadLabel(detailMentor.workload)}
                  color={getWorkloadColor(detailMentor.workload)}
                  size="small"
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">{detailMentor.totalInterns}</Typography>
                    <Typography variant="caption" color="text.secondary">Стажеров</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">{detailMentor.activeTasks}</Typography>
                    <Typography variant="caption" color="text.secondary">Активных задач</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Загрузка ментора</Typography>
                <LinearProgress
                  variant="determinate"
                  value={detailMentor.workload === 'normal' ? 40 : detailMentor.workload === 'high' ? 70 : 90}
                  color={getWorkloadColor(detailMentor.workload)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Ожидают ревью: {detailMentor.pendingReviews}</Typography>
                <Typography variant="body2" color="text.secondary">Завершено ревью: {detailMentor.completedReviews}</Typography>
                <Typography variant="body2" color="text.secondary">Среднее время ответа: {detailMentor.averageReviewTime} дн.</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Производительность</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Качество: ${detailMentor.performance?.qualityScore ?? 0}/5`} size="small" variant="outlined" />
                  <Chip label={`Удовлетворенность: ${detailMentor.performance?.internSatisfaction ?? 0}/5`} size="small" variant="outlined" />
                </Box>
              </Box>

              {detailMentor.programs && detailMentor.programs.length > 0 && (
                <Box>
                  <Typography variant="body2" gutterBottom>Программы</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {detailMentor.programs.map((program) => (
                      <Chip key={program} label={program} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MentorWorkload;
