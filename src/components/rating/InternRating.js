import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Star,
  Assignment,
  Schedule,
  CheckCircle,
  EmojiEvents,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const InternRating = () => {
  const { ratings } = useSelector((state) => state.rating);
  const currentUser = useSelector((state) => state.auth.user);
  const { internships } = useSelector((state) => state.roadmap);

  const internRating = useMemo(() => {
    return ratings.find(rating => rating.internId === currentUser?.id);
  }, [ratings, currentUser?.id]);

  const internInternship = useMemo(() => {
    if (!internRating) return null;
    return internships.find(internship => internship.id === internRating.internshipId);
  }, [internRating, internships]);

  const overallStats = useMemo(() => {
    const totalInterns = ratings.length;
    const betterThan = ratings.filter(r => r.overallRating < internRating?.overallRating).length;
    const percentile = totalInterns > 0 ? Math.round((betterThan / totalInterns) * 100) : 0;
    
    return {
      totalInterns,
      betterThan,
      percentile,
      averageRating: totalInterns > 0 ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalInterns : 0
    };
  }, [ratings, internRating]);

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'success';
    if (rating >= 7.0) return 'warning';
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

  const getTrendText = (trend) => {
    switch (trend) {
      case 'up':
        return 'Растет';
      case 'down':
        return 'Снижается';
      default:
        return 'Стабильный';
    }
  };

  if (!internRating) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Рейтинг не найден. Обратитесь к ментору.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мой рейтинг
      </Typography>

      <Grid container spacing={3} sx={{ maxWidth: 'none' }}>
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                  {internRating.internName.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2">
                    {internRating.internName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {internRating.position}
                  </Typography>
                  {internInternship && (
                    <Typography variant="body2" color="text.secondary">
                      Стажировка: {internInternship.title}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    #{internRating.rank}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    место из {overallStats.totalInterns}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h4" component="span">
                  {internRating.overallRating.toFixed(1)}
                </Typography>
                <Chip
                  label={`${overallStats.percentile}% лучше других`}
                  color={getRatingColor(internRating.overallRating)}
                  icon={<Star />}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon(internRating.trend)}
                  <Typography variant="body2" color="text.secondary">
                    {getTrendText(internRating.trend)}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {internRating.qualityRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Качество
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      {internRating.speedRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Скорость
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      {internRating.tasksCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Задач выполнено
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {internRating.experience} мес
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Опыт
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика выполнения задач
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Выполнено вовремя</Typography>
                  <Typography variant="body2">
                    {internRating.tasksOnTime} из {internRating.tasksCompleted}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(internRating.tasksOnTime / internRating.tasksCompleted) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Среднее время выполнения</Typography>
                  <Typography variant="body2">
                    {internRating.averageTaskTime} дней
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((internRating.averageTaskTime / 7) * 100, 100)}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Рекомендации
              </Typography>
              
              <List dense>
                {internRating.overallRating < 8.0 && (
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Улучшить качество"
                      secondary="Сосредоточьтесь на деталях и тестировании"
                    />
                  </ListItem>
                )}
                {internRating.averageTaskTime > 5 && (
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ускорить выполнение"
                      secondary="Планируйте время более эффективно"
                    />
                  </ListItem>
                )}
                {internRating.tasksOnTime / internRating.tasksCompleted < 0.8 && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Повысить пунктуальность"
                      secondary="Ставьте более реалистичные сроки"
                    />
                  </ListItem>
                )}
                {internRating.overallRating >= 8.0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Star color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Отличная работа!"
                      secondary="Продолжайте в том же духе"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сравнение с другими
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmojiEvents color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Место в рейтинге"
                    secondary={`${internRating.rank} из ${overallStats.totalInterns}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ваш рейтинг"
                    secondary={`${internRating.overallRating.toFixed(1)} / 10`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Средний рейтинг"
                    secondary={`${overallStats.averageRating.toFixed(1)} / 10`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Лучше чем"
                    secondary={`${overallStats.percentile}% стажеров`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Достижения
              </Typography>
              
              <List dense>
                {internRating.overallRating >= 9.0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Star color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Отличный результат"
                      secondary="Рейтинг выше 9.0"
                    />
                  </ListItem>
                )}
                {internRating.tasksOnTime / internRating.tasksCompleted >= 0.9 && (
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Пунктуальность"
                      secondary="90%+ задач вовремя"
                    />
                  </ListItem>
                )}
                {internRating.tasksCompleted >= 10 && (
                  <ListItem>
                    <ListItemIcon>
                      <Assignment color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Активность"
                      secondary="10+ выполненных задач"
                    />
                  </ListItem>
                )}
                {internRating.rank <= 3 && (
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Топ-3"
                      secondary="Входите в тройку лучших"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Дополнительная статистика
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Изменение рейтинга"
                    secondary={`${internRating.trend === 'up' ? '+' : ''}${(internRating.overallRating - internRating.previousRating).toFixed(1)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Последнее обновление"
                    secondary={new Date(internRating.lastUpdated).toLocaleDateString('ru-RU')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Процент вовремя"
                    secondary={`${Math.round((internRating.tasksOnTime / internRating.tasksCompleted) * 100)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmojiEvents color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Средний рейтинг команды"
                    secondary={`${overallStats.averageRating.toFixed(1)}/10`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Детальная статистика
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Качество работы
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(internRating.qualityRating || 0) * 10}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {(internRating.qualityRating || 0).toFixed(1)}/10
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Скорость выполнения
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(internRating.speedRating || 0) * 10}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {(internRating.speedRating || 0).toFixed(1)}/10
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Коммуникация
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(internRating.communicationRating || 0) * 10}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {(internRating.communicationRating || 0).toFixed(1)}/10
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогресс по компетенциям
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="React.js"
                    secondary="Освоено"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="JavaScript"
                    secondary="Освоено"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="TypeScript"
                    secondary="В процессе"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="CSS/SASS"
                    secondary="В процессе"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InternRating;