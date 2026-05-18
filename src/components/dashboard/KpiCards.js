import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  People,
  School,
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

const TrendBadge = ({ value, compact }) => {
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
        gap: 0.2,
        px: 0.5,
        py: 0,
        borderRadius: 1,
        bgcolor: `${color}14`,
        color,
        fontSize: compact ? '0.65rem' : '0.7rem',
        fontWeight: 700,
      }}
    >
      {isPositive ? <TrendingUp sx={{ fontSize: 11 }} /> : isNegative ? <TrendingDown sx={{ fontSize: 11 }} /> : null}
      {str}
    </Box>
  );
};

const KpiCard = ({ icon, value, label, trend, color, compact }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 1 : 1.5,
        py: compact ? 0.75 : 2,
        px: compact ? 1 : 2,
        '&:last-child': { pb: compact ? 0.75 : 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? 32 : 48,
          height: compact ? 32 : 48,
          borderRadius: 1.5,
          bgcolor: `${color}14`,
          color,
          flexShrink: 0,
          '& .MuiSvgIcon-root': { fontSize: compact ? 18 : 24 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
          <Typography
            variant={compact ? 'h6' : 'h4'}
            fontWeight="bold"
            sx={{ color, lineHeight: 1.1 }}
          >
            {value}
          </Typography>
          {trend && <TrendBadge value={trend} compact={compact} />}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            lineHeight: 1.2,
            fontSize: compact ? '0.65rem' : undefined,
          }}
        >
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const KpiCards = ({ data, compact = false }) => {
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

  const gridSize = compact
    ? { xs: 6, sm: 4, md: 2 }
    : { xs: 12, sm: 6, md: 4, lg: 2 };

  return (
    <Grid container spacing={compact ? 1 : 2}>
      {cards.map((card) => (
        <Grid size={gridSize} key={card.label}>
          <KpiCard {...card} compact={compact} />
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;
