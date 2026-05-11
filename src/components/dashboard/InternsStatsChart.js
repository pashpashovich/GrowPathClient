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

const InternsStatsChart = ({ data }) => {
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

  if (!data) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Typography color="text.secondary">Нет данных</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', overflow: 'visible' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Статистика стажеров
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Всего: ${data.totalInterns ?? 0}`} size="small" variant="outlined" />
          <Chip label={`Активных: ${data.activeInterns ?? 0}`} size="small" color="primary" variant="outlined" />
          {data.averageProgress != null && (
            <Chip label={`Ср. прогресс: ${data.averageProgress.toFixed(0)}%`} size="small" color="success" variant="outlined" />
          )}
          {data.averageRating != null && (
            <Chip label={`Ср. рейтинг: ${data.averageRating.toFixed(1)}`} size="small" variant="outlined" />
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              По статусам
            </Typography>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Нет данных</Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 200 } }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              По программам
            </Typography>
            {programDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
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
        </Box>

        {data.topPerformers && data.topPerformers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#36B37E' }} />
              Лучшие стажеры
            </Typography>
            <List dense disablePadding>
              {data.topPerformers.slice(0, 5).map((intern) => (
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

        {data.needsAttention && data.needsAttention.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#BA1A1A' }} />
              Требуют внимания
            </Typography>
            <List dense disablePadding>
              {data.needsAttention.slice(0, 5).map((intern) => (
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
