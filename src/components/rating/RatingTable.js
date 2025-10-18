import React, { useState, useMemo } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TablePagination,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Download,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedInternship, recalculateRanks } from '../../store/slices/ratingSlice';

const RatingTable = () => {
  const dispatch = useDispatch();
  const { ratings, selectedInternshipId } = useSelector((state) => state.rating);
  const { internships } = useSelector((state) => state.roadmap);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('rank');

  // Фильтруем рейтинги по выбранной стажировке
  const filteredRatings = useMemo(() => {
    if (!selectedInternshipId) return ratings;
    return ratings.filter(rating => rating.internshipId === selectedInternshipId);
  }, [ratings, selectedInternshipId]);

  // Сортируем рейтинги
  const sortedRatings = useMemo(() => {
    const sorted = [...filteredRatings];
    switch (sortBy) {
      case 'rank':
        return sorted.sort((a, b) => a.rank - b.rank);
      case 'rating':
        return sorted.sort((a, b) => b.overallRating - a.overallRating);
      case 'experience':
        return sorted.sort((a, b) => a.experience - b.experience);
      case 'tasks':
        return sorted.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
      default:
        return sorted;
    }
  }, [filteredRatings, sortBy]);

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'success';
    if (rating >= 7.0) return 'warning';
    return 'error';
  };

  const getExperienceColor = (experience) => {
    if (experience <= 2) return 'success';
    if (experience <= 4) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Стажер', 'Рейтинг', 'Опыт (мес)', 'Должность', 'Ментор', 'Задач выполнено', 'Вовремя', 'Среднее время (дни)'],
      ...sortedRatings.map(rating => [
        rating.internName,
        rating.overallRating,
        rating.experience,
        rating.position,
        rating.mentorName,
        rating.tasksCompleted,
        rating.tasksOnTime,
        rating.averageTaskTime
      ])
    ].map(row => row.join(',')).join('\n');

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
    dispatch(recalculateRanks());
  };

  return (
    <Box>
      {/* Заголовок и фильтры */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Рейтинг стажеров
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Стажировка</InputLabel>
            <Select
              value={selectedInternshipId || ''}
              label="Стажировка"
              onChange={(e) => dispatch(setSelectedInternship(e.target.value))}
            >
              <MenuItem value="">
                <em>Все стажировки</em>
              </MenuItem>
              {internships.map((internship) => (
                <MenuItem key={internship.id} value={internship.id}>
                  {internship.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortBy}
              label="Сортировка"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="rank">По месту</MenuItem>
              <MenuItem value="rating">По рейтингу</MenuItem>
              <MenuItem value="experience">По опыту</MenuItem>
              <MenuItem value="tasks">По задачам</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Обновить рейтинги">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
          >
            Экспорт CSV
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="primary">
            {filteredRatings.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Всего стажеров
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="success.main">
            {filteredRatings.length > 0 ? (filteredRatings.reduce((sum, r) => sum + r.overallRating, 0) / filteredRatings.length).toFixed(1) : 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Средний рейтинг
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="warning.main">
            {filteredRatings.filter(r => r.trend === 'up').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Растет рейтинг
          </Typography>
        </Paper>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Место</TableCell>
              <TableCell>Стажер</TableCell>
              <TableCell align="center">Рейтинг</TableCell>
              <TableCell align="center">Опыт</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Ментор</TableCell>
              <TableCell align="center">Задач</TableCell>
              <TableCell align="center">Вовремя</TableCell>
              <TableCell align="center">Среднее время</TableCell>
              <TableCell align="center">Тренд</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRatings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((rating) => (
                <TableRow key={rating.id} hover>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      #{rating.rank}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {rating.internName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {rating.internName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rating.internId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={rating.overallRating.toFixed(1)}
                      color={getRatingColor(rating.overallRating)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${rating.experience} мес`}
                      color={getExperienceColor(rating.experience)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rating.position}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rating.mentorName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {rating.tasksCompleted}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {rating.tasksOnTime}/{rating.tasksCompleted}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(rating.tasksOnTime / rating.tasksCompleted) * 100}
                        sx={{ width: 40, height: 4 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {rating.averageTaskTime} дн
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`Предыдущий рейтинг: ${rating.previousRating}`}>
                      <IconButton size="small">
                        {getTrendIcon(rating.trend)}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedRatings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
        }
      />
    </Box>
  );
};

export default RatingTable;

