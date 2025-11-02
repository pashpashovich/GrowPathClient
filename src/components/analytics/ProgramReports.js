import React, { useState } from 'react';
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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Schedule,
  Warning,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const ProgramReports = () => {
  const programReports = useSelector((state) => state.analytics.programReports);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

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

  const filteredReports = selectedProgram 
    ? programReports.filter(report => report.programId === selectedProgram)
    : programReports;

  const handleExport = (report) => {
    console.log('Exporting report for program:', report.programTitle);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Программа</InputLabel>
                <Select
                  value={selectedProgram}
                  label="Программа"
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <MenuItem value="">Все программы</MenuItem>
                  {programReports.map((report) => (
                    <MenuItem key={report.programId} value={report.programId}>
                      {report.programTitle}
                    </MenuItem>
                  ))}
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
                onClick={() => console.log('Export all reports')}
                fullWidth
              >
                Экспорт отчетов
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {filteredReports.map((report) => (
        <Card key={report.programId} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{report.programTitle}</Typography>
              <Box>
                <Tooltip title="Экспорт отчета">
                  <IconButton onClick={() => handleExport(report)}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Детальный просмотр">
                  <IconButton>
                    <Visibility />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {report.totalTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего задач
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {report.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {report.inProgressTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    В работе
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {report.overdueTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Просрочено
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Процент выполнения</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {report.completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={report.completionRate}
                color={getCompletionRateColor(report.completionRate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Статистика по стажерам
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Стажер</TableCell>
                    <TableCell align="center">Завершено</TableCell>
                    <TableCell align="center">Всего</TableCell>
                    <TableCell align="center">Процент</TableCell>
                    <TableCell align="center">Компетенции</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.internStats.map((intern) => (
                    <TableRow key={intern.internId}>
                      <TableCell>{intern.internName}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircle />}
                          label={intern.completedTasks}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{intern.totalTasks}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${intern.completionRate}%`}
                          color={getCompletionRateColor(intern.completionRate)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${intern.competencies.achieved.length} освоено`}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${intern.competencies.current.length} текущих`}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom>
              Статистика по менторам
            </Typography>
            <Grid container spacing={2}>
              {report.mentorStats.map((mentor) => (
                <Grid item xs={12} sm={6} md={4} key={mentor.mentorId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {mentor.mentorName}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Стажеров: {mentor.assignedInterns}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Активных задач: {mentor.activeTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Завершенных ревью: {mentor.completedReviews}
                        </Typography>
                      </Box>
                      <Chip
                        label={getWorkloadLabel(mentor.workload)}
                        color={getWorkloadColor(mentor.workload)}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Динамика выполнения
            </Typography>
            <TableContainer component={Paper}>
              <Table>
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
                  {report.periodStats[selectedPeriod]?.map((period, index) => (
                    <TableRow key={index}>
                      <TableCell>{period.week || period.month}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircle />}
                          label={period.completed}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{period.created}</TableCell>
                      <TableCell align="center">
                        {period.overdue > 0 ? (
                          <Chip
                            icon={<Warning />}
                            label={period.overdue}
                            color="error"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircle />}
                            label="0"
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {index > 0 && (
                          <Chip
                            icon={period.completed > report.periodStats[selectedPeriod][index - 1].completed ? <TrendingUp /> : <TrendingDown />}
                            label={period.completed > report.periodStats[selectedPeriod][index - 1].completed ? '↗' : '↘'}
                            color={period.completed > report.periodStats[selectedPeriod][index - 1].completed ? 'success' : 'error'}
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ProgramReports;






