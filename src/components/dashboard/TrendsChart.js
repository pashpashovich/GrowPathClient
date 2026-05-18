import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardTrendsAsync } from '../../store/slices/dashboardSlice';

const METRICS = [
  { value: 'new_interns', label: 'Новые стажеры' },
  { value: 'completed_tasks', label: 'Завершенные задачи' },
  { value: 'average_rating', label: 'Средний рейтинг' },
  { value: 'task_completion_rate', label: 'Выполнение задач %' },
  { value: 'active_users', label: 'Активные пользователи' },
];

const GROUP_OPTIONS = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
];

const TREND_LABELS = {
  increasing: 'Рост',
  decreasing: 'Снижение',
  stable: 'Стабильно',
};

const TrendsChart = ({ dateFrom, dateTo, compact = false, chartsOnly = false }) => {
  const chartHeight = chartsOnly ? 140 : compact ? 220 : 300;
  const dispatch = useDispatch();
  const trends = useSelector((state) => state.dashboard.trends);
  const [metric, setMetric] = useState('completed_tasks');
  const [groupBy, setGroupBy] = useState('week');

  useEffect(() => {
    if (dateFrom && dateTo) {
      dispatch(fetchDashboardTrendsAsync({ metric, dateFrom, dateTo, groupBy }));
    }
  }, [dispatch, metric, groupBy, dateFrom, dateTo]);

  const dataPoints = useMemo(
    () => (trends?.dataPoints || []).map((dp) => ({
      ...dp,
      label: dp.label || new Date(dp.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    })),
    [trends]
  );

  const summary = trends?.summary;

  return (
    <Card variant={chartsOnly ? 'outlined' : 'elevation'} elevation={chartsOnly ? 0 : 1}>
      <CardContent sx={{ py: chartsOnly ? 1 : compact ? 1.5 : 2, '&:last-child': { pb: chartsOnly ? 1 : compact ? 1.5 : 2 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: chartsOnly ? 0.75 : compact ? 1.5 : 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant={chartsOnly ? 'body2' : compact ? 'subtitle1' : 'h6'} fontWeight="bold">
            Динамика показателей
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: chartsOnly ? 130 : compact ? 140 : 180 }}>
              <InputLabel>Метрика</InputLabel>
              <Select value={metric} label="Метрика" onChange={(e) => setMetric(e.target.value)}>
                {METRICS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              size="small"
              value={groupBy}
              exclusive
              onChange={(_, val) => val && setGroupBy(val)}
            >
              {GROUP_OPTIONS.map((g) => (
                <ToggleButton key={g.value} value={g.value} sx={{ px: 1, py: 0.2, fontSize: chartsOnly ? '0.7rem' : '0.75rem' }}>
                  {g.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
              <XAxis dataKey="label" tick={{ fontSize: chartsOnly ? 10 : 12 }} />
              <YAxis tick={{ fontSize: chartsOnly ? 10 : 12 }} width={chartsOnly ? 28 : undefined} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, '']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0052cc"
                strokeWidth={2}
                dot={{ fill: '#0052cc', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight, color: 'text.secondary' }}>
            Нет данных для отображения
          </Box>
        )}

        {summary && !chartsOnly && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Chip label={`Всего: ${summary.total?.toFixed(0) ?? '—'}`} size="small" variant="outlined" />
            <Chip label={`Среднее: ${summary.average?.toFixed(1) ?? '—'}`} size="small" variant="outlined" />
            <Chip
              label={`Тренд: ${TREND_LABELS[summary.trend] || summary.trend || '—'}`}
              size="small"
              color={summary.trend === 'increasing' ? 'success' : summary.trend === 'decreasing' ? 'error' : 'default'}
            />
            {summary.changePercentage != null && (
              <Chip
                label={`Изменение: ${summary.changePercentage > 0 ? '+' : ''}${summary.changePercentage.toFixed(1)}%`}
                size="small"
                color={summary.changePercentage > 0 ? 'success' : summary.changePercentage < 0 ? 'error' : 'default'}
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
