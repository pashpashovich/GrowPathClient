import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Person,
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  Download,
  Visibility,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const MentorWorkload = () => {
  const mentorWorkload = useSelector((state) => state.analytics.mentorWorkload);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState('all');

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

  const filteredMentors = mentorWorkload.filter(mentor => {
    const programMatch = !selectedProgram || mentor.programs.includes(selectedProgram);
    const workloadMatch = workloadFilter === 'all' || mentor.workload === workloadFilter;
    return programMatch && workloadMatch;
  });

  const overloadedMentors = mentorWorkload.filter(mentor => 
    mentor.workload === 'high' || mentor.workload === 'overload'
  );

  const handleExport = () => {
    console.log('Exporting mentor workload data');
  };

  const handleViewMentor = (mentorId) => {
    console.log('Viewing mentor profile:', mentorId);
  };

  return (
    <Box>
      {overloadedMentors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Внимание! {overloadedMentors.length} ментор(ов) в зоне перегрузки
          </Typography>
          {overloadedMentors.map(mentor => (
            <Typography key={mentor.mentorId} variant="body2">
              • {mentor.mentorName}: {mentor.totalInterns} стажеров, {mentor.activeTasks} активных задач
            </Typography>
          ))}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Программа</InputLabel>
                <Select
                  value={selectedProgram}
                  label="Программа"
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <MenuItem value="">Все программы</MenuItem>
                  <MenuItem value="program-1">Frontend разработка</MenuItem>
                  <MenuItem value="program-2">Backend разработка</MenuItem>
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
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExport}
                fullWidth
              >
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {filteredMentors.map((mentor) => (
          <Grid item xs={12} md={6} lg={4} key={mentor.mentorId}>
            <Card 
              sx={{ 
                height: '100%',
                border: mentor.workload === 'overload' ? '2px solid' : '1px solid',
                borderColor: mentor.workload === 'overload' ? 'error.main' : 'divider'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {mentor.mentorName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{mentor.mentorName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mentor.email}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getWorkloadIcon(mentor.workload)}
                    label={getWorkloadLabel(mentor.workload)}
                    color={getWorkloadColor(mentor.workload)}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {mentor.totalInterns}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Стажеров
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main">
                        {mentor.activeTasks}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Активных задач
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Загрузка ментора
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={mentor.workload === 'normal' ? 40 : mentor.workload === 'high' ? 70 : 90}
                    color={getWorkloadColor(mentor.workload)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ожидают ревью: {mentor.pendingReviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено ревью: {mentor.completedReviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Среднее время ответа: {mentor.averageReviewTime} дн.
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Производительность
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Качество: ${mentor.performance.qualityScore}/5`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Удовлетворенность: ${mentor.performance.internSatisfaction}/5`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewMentor(mentor.mentorId)}
                    fullWidth
                  >
                    Профиль
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Детальная информация по менторам
          </Typography>
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
                {filteredMentors.map((mentor) => (
                  <TableRow key={mentor.mentorId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {mentor.mentorName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {mentor.mentorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {mentor.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={mentor.totalInterns}
                        color={mentor.totalInterns > 5 ? 'error' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={mentor.activeTasks}
                        color={mentor.activeTasks > 10 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={mentor.pendingReviews}
                        color={mentor.pendingReviews > 5 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {mentor.averageReviewTime} дн.
                        </Typography>
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
                      <Tooltip title="Просмотр профиля">
                        <IconButton
                          size="small"
                          onClick={() => handleViewMentor(mentor.mentorId)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorWorkload;






