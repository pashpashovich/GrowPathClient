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

const TrendsChart = ({ dateFrom, dateTo }) => {
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Динамика показателей
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
                <ToggleButton key={g.value} value={g.value} sx={{ px: 1.5, py: 0.3, fontSize: '0.75rem' }}>
                  {g.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'text.secondary' }}>
            Нет данных для отображения
          </Box>
        )}

        {summary && (
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
