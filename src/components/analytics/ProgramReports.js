import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
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
  IconButton,
  Tooltip,
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
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Download,
  Visibility,
  Search,
  PictureAsPdf,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProgramReportsAsync } from '../../store/slices/analyticsSlice';
import { analyticsAPI, hrAPI, internAPI } from '../../services/api';
import {
  getAxiosBlobErrorMessage,
  saveAxiosBlobResponse,
  triggerBlobDownload,
} from '../../utils/downloadBlob';
import ActionSnackbar from '../mailings/ActionSnackbar';

const PROGRAMS_PER_PAGE = 10;

const ProgramReports = () => {
  const dispatch = useDispatch();
  const programReports = useSelector((state) => state.analytics?.programReports || []);
  const isLoading = useSelector((state) => state.analytics?.isLoading);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [detailReport, setDetailReport] = useState(null);
  const [programSearch, setProgramSearch] = useState('');
  const [programPage, setProgramPage] = useState(0);
  const [pdfLoadingKey, setPdfLoadingKey] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

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

  useEffect(() => {
    dispatch(fetchProgramReportsAsync({ period: selectedPeriod }));
  }, [dispatch, selectedPeriod]);

  const filteredReports = useMemo(
    () =>
      selectedProgram
        ? programReports.filter((report) => String(report.programId) === String(selectedProgram))
        : programReports,
    [programReports, selectedProgram]
  );

  const filteredProgramOptions = useMemo(() => {
    const q = programSearch.toLowerCase();
    return q
      ? programReports.filter((r) => r.programTitle?.toLowerCase().includes(q))
      : programReports;
  }, [programReports, programSearch]);

  const pagedProgramOptions = useMemo(
    () => filteredProgramOptions.slice(programPage * PROGRAMS_PER_PAGE, (programPage + 1) * PROGRAMS_PER_PAGE),
    [filteredProgramOptions, programPage]
  );

  const totalProgramPages = Math.ceil(filteredProgramOptions.length / PROGRAMS_PER_PAGE);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExport = async (report) => {
    try {
      const response = await analyticsAPI.getReportsExport({ programId: report.programId, period: selectedPeriod });
      triggerBlobDownload(response.data, `program-report-${report.programId}.csv`);
    } catch (error) {
      console.error('Export report error', error);
      showSnackbar('Не удалось экспортировать CSV', 'error');
    }
  };

  const handleExportAll = async () => {
    try {
      const response = await analyticsAPI.getReportsExport({ period: selectedPeriod });
      triggerBlobDownload(response.data, `program-reports-${selectedPeriod}.csv`);
    } catch (error) {
      console.error('Export all reports error', error);
      showSnackbar('Не удалось экспортировать отчёты', 'error');
    }
  };

  const handleDownloadProgramPdf = async (programId, programTitle) => {
    const key = `program-${programId}`;
    setPdfLoadingKey(key);
    try {
      const response = await hrAPI.downloadInternshipEfficiencyReport(programId);
      await saveAxiosBlobResponse(
        response,
        `efficiency-report-${programId}.pdf`
      );
      showSnackbar(`PDF «${programTitle || 'программа'}» скачан`);
    } catch (error) {
      showSnackbar(await getAxiosBlobErrorMessage(error, 'Не удалось сформировать PDF'), 'error');
    } finally {
      setPdfLoadingKey(null);
    }
  };

  const handleDownloadInternPdf = async (internId, internName) => {
    const key = `intern-${internId}`;
    setPdfLoadingKey(key);
    try {
      const response = await internAPI.downloadInternshipResultReport(internId);
      await saveAxiosBlobResponse(
        response,
        `intern-result-${internId}.pdf`
      );
      showSnackbar(`PDF «${internName || 'стажёр'}» скачан`);
    } catch (error) {
      showSnackbar(await getAxiosBlobErrorMessage(error, 'Не удалось сформировать PDF'), 'error');
    } finally {
      setPdfLoadingKey(null);
    }
  };

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel shrink>Программа</InputLabel>
                <Select
                  value={selectedProgram}
                  label="Программа"
                  displayEmpty
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  renderValue={(value) => {
                    if (!value) return <em>Все программы</em>;
                    const report = programReports.find((r) => String(r.programId) === String(value));
                    return report ? report.programTitle : '';
                  }}
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
                  {pagedProgramOptions.map((report) => (
                    <MenuItem key={report.programId} value={report.programId}>
                      {report.programTitle}
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Период</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Период"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <MenuItem value="weekly">По неделям</MenuItem>
                  <MenuItem value="monthly">По месяцам</MenuItem>
                  <MenuItem value="program">За всю программу</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportAll}
                fullWidth
              >
                Экспорт отчетов
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary table */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && filteredReports.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Нет данных для отображения
        </Typography>
      )}

      {!isLoading && filteredReports.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Программа</TableCell>
                <TableCell align="center">Всего задач</TableCell>
                <TableCell align="center">Завершено</TableCell>
                <TableCell align="center">В работе</TableCell>
                <TableCell align="center">Просрочено</TableCell>
                <TableCell align="center">Выполнение</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.programId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {report.programTitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{report.totalTasks}</TableCell>
                  <TableCell align="center">
                    <Chip label={report.completedTasks} color="success" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={report.inProgressTasks} color="warning" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={report.overdueTasks}
                      color={report.overdueTasks > 0 ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={report.completionRate}
                        color={getCompletionRateColor(report.completionRate)}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" fontWeight={500} sx={{ minWidth: 36 }}>
                        {report.completionRate}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Детальный просмотр">
                      <IconButton size="small" onClick={() => setDetailReport(report)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт CSV">
                      <IconButton size="small" onClick={() => handleExport(report)}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Отчёт эффективности (PDF, GP-RPT-2)">
                      <span>
                        <IconButton
                          size="small"
                          disabled={pdfLoadingKey === `program-${report.programId}`}
                          onClick={() => handleDownloadProgramPdf(report.programId, report.programTitle)}
                        >
                          {pdfLoadingKey === `program-${report.programId}` ? (
                            <CircularProgress size={18} />
                          ) : (
                            <PictureAsPdf />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={!!detailReport}
        onClose={() => setDetailReport(null)}
        maxWidth="lg"
        fullWidth
      >
        {detailReport && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>{detailReport.programTitle}</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  pdfLoadingKey === `program-${detailReport.programId}` ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PictureAsPdf />
                  )
                }
                disabled={pdfLoadingKey === `program-${detailReport.programId}`}
                onClick={() => handleDownloadProgramPdf(detailReport.programId, detailReport.programTitle)}
              >
                PDF (GP-RPT-2)
              </Button>
              <IconButton onClick={() => setDetailReport(null)}>
                &#x2715;
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">{detailReport.totalTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Всего задач</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">{detailReport.completedTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Завершено</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">{detailReport.inProgressTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">В работе</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">{detailReport.overdueTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Просрочено</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Completion bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Процент выполнения</Typography>
                  <Typography variant="body2" fontWeight="bold">{detailReport.completionRate}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={detailReport.completionRate}
                  color={getCompletionRateColor(detailReport.completionRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="h6" gutterBottom>Статистика по стажерам</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Стажер</TableCell>
                      <TableCell align="center">Завершено</TableCell>
                      <TableCell align="center">Всего</TableCell>
                      <TableCell align="center">Процент</TableCell>
                      <TableCell align="center">Компетенции</TableCell>
                      <TableCell align="center">Отчёт</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(detailReport.internStats || []).map((intern) => {
                      const competencies = intern.competencies || {};
                      const achievedCount = Array.isArray(competencies.achieved) ? competencies.achieved.length : 0;
                      const currentCount = Array.isArray(competencies.current) ? competencies.current.length : 0;
                      return (
                        <TableRow key={intern.internId}>
                          <TableCell>{intern.internName}</TableCell>
                          <TableCell align="center">
                            <Chip icon={<CheckCircle />} label={intern.completedTasks} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">{intern.totalTasks}</TableCell>
                          <TableCell align="center">
                            <Chip label={`${intern.completionRate}%`} color={getCompletionRateColor(intern.completionRate)} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                              <Chip label={`${achievedCount} освоено`} color="success" size="small" variant="outlined" />
                              <Chip label={`${currentCount} текущих`} color="primary" size="small" variant="outlined" />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {intern.internId ? (
                              <Tooltip title="Итоги стажировки (PDF, GP-RPT-1)">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={pdfLoadingKey === `intern-${intern.internId}`}
                                    onClick={() => handleDownloadInternPdf(intern.internId, intern.internName)}
                                  >
                                    {pdfLoadingKey === `intern-${intern.internId}` ? (
                                      <CircularProgress size={18} />
                                    ) : (
                                      <PictureAsPdf fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Mentor stats */}
              <Typography variant="h6" gutterBottom>Статистика по менторам</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {(detailReport.mentorStats || []).map((mentor) => (
                  <Grid item xs={12} sm={6} md={4} key={mentor.mentorId}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>{mentor.mentorName}</Typography>
                        <Typography variant="body2" color="text.secondary">Стажеров: {mentor.assignedInterns}</Typography>
                        <Typography variant="body2" color="text.secondary">Активных задач: {mentor.activeTasks}</Typography>
                        <Typography variant="body2" color="text.secondary">Завершенных ревью: {mentor.completedReviews}</Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip label={getWorkloadLabel(mentor.workload)} color={getWorkloadColor(mentor.workload)} size="small" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Period stats */}
              <Typography variant="h6" gutterBottom>Динамика выполнения</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Период</TableCell>
                      <TableCell align="center">Завершено</TableCell>
                      <TableCell align="center">Создано</TableCell>
                      <TableCell align="center">Просрочено</TableCell>
                      <TableCell align="center">Тренд</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(detailReport.periodStats?.[selectedPeriod] || []).map((period, index) => {
                      const prevCompleted = detailReport.periodStats?.[selectedPeriod]?.[index - 1]?.completed ?? 0;
                      const isUp = period.completed > prevCompleted;
                      return (
                        <TableRow key={index}>
                          <TableCell>{period.week || period.month}</TableCell>
                          <TableCell align="center">
                            <Chip icon={<CheckCircle />} label={period.completed} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">{period.created}</TableCell>
                          <TableCell align="center">
                            {period.overdue > 0 ? (
                              <Chip icon={<Warning />} label={period.overdue} color="error" size="small" />
                            ) : (
                              <Chip label="0" color="success" size="small" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {index > 0 && (
                              <Chip
                                icon={isUp ? <TrendingUp /> : <TrendingDown />}
                                label={isUp ? '\u2197' : '\u2198'}
                                color={isUp ? 'success' : 'error'}
                                size="small"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        )}
      </Dialog>

      <ActionSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
};

export default ProgramReports;
