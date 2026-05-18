import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
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
  AreaChart,
  Area,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#0052cc',
  in_progress: '#FFAB00',
  submitted: '#6554C0',
  on_review: '#00B8D9',
  completed: '#36B37E',
  cancelled: '#737685',
};

const STATUS_LABELS = {
  pending: 'Ожидание',
  in_progress: 'В работе',
  submitted: 'Отправлено',
  on_review: 'На проверке',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const PRIORITY_COLORS = {
  low: '#00B8D9',
  medium: '#FFAB00',
  high: '#FF8B00',
  critical: '#BA1A1A',
};

const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

const TasksStatsCharts = ({ data, compact = false, chartsOnly = false }) => {
  const pieHeight = chartsOnly ? 100 : compact ? 160 : 200;
  const areaHeight = compact ? 120 : 150;
  const minHeight = chartsOnly ? 120 : compact ? 200 : 300;
  const statusDistribution = useMemo(() => {
    const dist = data?.distributionByStatus || {};
    return Object.entries(dist).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || '#737685',
    }));
  }, [data]);

  const priorityDistribution = useMemo(() => {
    const dist = data?.distributionByPriority || {};
    return Object.entries(dist).map(([key, value]) => ({
      name: PRIORITY_LABELS[key] || key,
      count: value,
      fill: PRIORITY_COLORS[key] || '#737685',
    }));
  }, [data]);

  const completionTrend = useMemo(
    () =>
      (data?.completionTrend || []).map((dp) => ({
        ...dp,
        label: dp.label || new Date(dp.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      })),
    [data]
  );

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
          Статистика задач
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: chartsOnly ? 0.75 : 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Всего: ${data.totalTasks ?? 0}`} size="small" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          <Chip label={`Просрочено: ${data.overdueTasks ?? 0}`} size="small" color="error" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          {!chartsOnly && data.averageCompletionTime != null && (
            <Chip label={`Ср. время: ${data.averageCompletionTime.toFixed(1)} дн.`} size="small" variant="outlined" />
          )}
          {!chartsOnly && data.onTimeCompletionRate != null && (
            <Chip label={`В срок: ${data.onTimeCompletionRate.toFixed(0)}%`} size="small" color="success" variant="outlined" />
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: chartsOnly ? 1 : 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: chartsOnly ? 120 : { xs: '100%', md: 200 } }}>
            <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.25 }}>
              По статусам
            </Typography>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={pieHeight}>
                <PieChart margin={{ top: 10 }}>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={chartsOnly ? 22 : 40}
                    outerRadius={chartsOnly ? 38 : 55}
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
                    wrapperStyle={{ fontSize: chartsOnly ? 9 : 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Нет данных</Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: chartsOnly ? 120 : { xs: '100%', md: 200 } }}>
            <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.25 }}>
              По приоритету
            </Typography>
            {priorityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={pieHeight}>
                <BarChart data={priorityDistribution} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: chartsOnly ? 10 : 12 }} width={chartsOnly ? 56 : 80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {priorityDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Нет данных</Typography>
            )}
          </Box>
        </Box>

        {!chartsOnly && completionTrend.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Тренд выполнения
            </Typography>
            <ResponsiveContainer width="100%" height={areaHeight}>
              <AreaChart data={completionTrend} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                <Area type="monotone" dataKey="value" stroke="#36B37E" fill="#36B37E" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksStatsCharts;
