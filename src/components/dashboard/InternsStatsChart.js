import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Star, Warning, TrendingUp } from '@mui/icons-material';

const STATUS_COLORS = {
  active: '#36B37E',
  completed: '#0052cc',
  on_hold: '#FFAB00',
};

const STATUS_LABELS = {
  active: 'Активные',
  completed: 'Завершенные',
  on_hold: 'На паузе',
};

const CHART_COLORS = ['#0052cc', '#36B37E', '#FFAB00', '#BA1A1A', '#6554C0', '#00B8D9', '#FF8B00', '#737685'];

const InternsStatsChart = ({ data, compact = false, chartsOnly = false }) => {
  const chartHeight = chartsOnly ? 88 : compact ? 150 : 180;
  const minHeight = chartsOnly ? 120 : compact ? 200 : 300;
  const listLimit = chartsOnly ? 0 : compact ? 3 : 5;
  const statusDistribution = useMemo(() => {
    const dist = data?.distributionByStatus || {};
    return Object.entries(dist).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || '#737685',
    }));
  }, [data]);

  const programDistribution = useMemo(
    () => (data?.distributionByProgram || []).map((p) => ({
      name: p.programName?.length > 18 ? p.programName.slice(0, 16) + '...' : (p.programName || '—'),
      Количество: p.count ?? 0,
    })),
    [data]
  );

  const programChartHeight = chartsOnly
    ? Math.max(110, programDistribution.length * 34 + 20)
    : chartHeight;

  if (!data) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight }}>
        <Typography color="text.secondary">Нет данных</Typography>
      </Card>
    );
  }

  return (
    <Card variant={chartsOnly ? 'outlined' : 'elevation'} elevation={chartsOnly ? 0 : 1} sx={{ height: '100%', overflow: 'visible' }}>
      <CardContent sx={{ py: chartsOnly ? 1 : compact ? 1.5 : 2, '&:last-child': { pb: chartsOnly ? 1 : compact ? 1.5 : 2 } }}>
        <Typography variant={chartsOnly ? 'body2' : compact ? 'subtitle1' : 'h6'} fontWeight="bold" sx={{ mb: chartsOnly ? 0.5 : 1 }}>
          Статистика стажеров
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: chartsOnly ? 0.75 : 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Всего: ${data.totalInterns ?? 0}`} size="small" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          <Chip label={`Активных: ${data.activeInterns ?? 0}`} size="small" color="primary" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          {!chartsOnly && data.averageProgress != null && (
            <Chip label={`Ср. прогресс: ${data.averageProgress.toFixed(0)}%`} size="small" color="success" variant="outlined" />
          )}
          {!chartsOnly && data.averageRating != null && (
            <Chip label={`Ср. рейтинг: ${data.averageRating.toFixed(1)}`} size="small" variant="outlined" />
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: chartsOnly ? 1 : 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: chartsOnly ? 140 : { xs: '100%', md: 200 } }}>
            {!chartsOnly && (
              <Typography variant="body2" fontWeight={600} gutterBottom>
                По статусам
              </Typography>
            )}
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={chartsOnly ? 22 : 30}
                    outerRadius={chartsOnly ? 38 : 55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {!chartsOnly && (
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            {chartsOnly && statusDistribution.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 0.5, justifyContent: 'center' }}
              >
                {statusDistribution.map((entry) => (
                  <Box
                    key={entry.name}
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: entry.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      {entry.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              statusDistribution.length === 0 && (
                <Typography variant="body2" color="text.secondary">Нет данных</Typography>
              )
            )}
          </Box>

          {!chartsOnly && (
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              По программам
            </Typography>
            {programDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={programChartHeight}>
                <BarChart data={programDistribution} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                  <Bar dataKey="Количество" radius={[0, 4, 4, 0]}>
                    {programDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Нет данных</Typography>
            )}
          </Box>
          )}
        </Box>

        {listLimit > 0 && data.topPerformers && data.topPerformers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#36B37E' }} />
              Лучшие стажеры
            </Typography>
            <List dense disablePadding>
              {data.topPerformers.slice(0, listLimit).map((intern) => (
                <ListItem key={intern.internId} disableGutters sx={{ px: 0 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#36B37E', fontSize: 12 }}>
                      {intern.firstName?.[0]}{intern.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {intern.firstName} {intern.lastName}
                        </Typography>
                        {intern.averageRating != null && (
                          <Chip icon={<Star sx={{ fontSize: 10 }} />} label={intern.averageRating.toFixed(1)} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    }
                    secondary={`${intern.completedTasks} задач · ${intern.programName || ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {listLimit > 0 && data.needsAttention && data.needsAttention.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#BA1A1A' }} />
              Требуют внимания
            </Typography>
            <List dense disablePadding>
              {data.needsAttention.slice(0, listLimit).map((intern) => (
                <ListItem key={intern.internId} disableGutters sx={{ px: 0 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#BA1A1A', fontSize: 12 }}>
                      {intern.firstName?.[0]}{intern.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${intern.firstName} ${intern.lastName}`}
                    secondary={`${intern.completedTasks} задач · ${intern.programName || ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InternsStatsChart;
