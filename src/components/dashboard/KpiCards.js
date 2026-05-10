import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  People,
  School,
  Assignment,
  CheckCircle,
  Warning,
  Star,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const TREND_COLORS = {
  positive: '#36B37E',
  negative: '#BA1A1A',
  neutral: '#737685',
};

const TrendBadge = ({ value }) => {
  if (!value) return null;
  const str = String(value);
  const isPositive = str.startsWith('+');
  const isNegative = str.startsWith('-');
  const color = isPositive ? TREND_COLORS.positive : isNegative ? TREND_COLORS.negative : TREND_COLORS.neutral;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.3,
        px: 0.8,
        py: 0.1,
        borderRadius: 2,
        bgcolor: `${color}14`,
        color,
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      {isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : isNegative ? <TrendingDown sx={{ fontSize: 14 }} /> : null}
      {str}
    </Box>
  );
};

const KpiCard = ({ icon, value, label, trend, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: `${color}14`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {trend && <TrendBadge value={trend} />}
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const KpiCards = ({ data }) => {
  const stats = data?.stats || {};
  const trends = data?.trends || {};

  const cards = [
    {
      icon: <People />,
      value: stats.activeInterns ?? 0,
      label: 'Активных стажеров',
      trend: trends.internsGrowth,
      color: '#0052cc',
    },
    {
      icon: <School />,
      value: stats.activePrograms ?? 0,
      label: 'Активных программ',
      color: '#006c47',
    },
    {
      icon: <CheckCircle />,
      value: stats.completedTasks ?? 0,
      label: 'Завершено задач',
      trend: trends.tasksCompletionGrowth,
      color: '#36B37E',
    },
    {
      icon: <Warning />,
      value: stats.overdueTasks ?? 0,
      label: 'Просрочено задач',
      color: '#BA1A1A',
    },
    {
      icon: <Star />,
      value: stats.averageTaskRating != null ? stats.averageTaskRating.toFixed(1) : '—',
      label: 'Ср. рейтинг задач',
      trend: trends.averageRatingChange,
      color: '#FFAB00',
    },
    {
      icon: <Schedule />,
      value: stats.taskCompletionRate != null ? `${Math.round(stats.taskCompletionRate)}%` : '—',
      label: 'Выполнение в срок',
      color: '#6554C0',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
          <KpiCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;
