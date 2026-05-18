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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProgramsStatsChart = ({ data, compact = false, chartsOnly = false }) => {
  const barHeight = chartsOnly ? 90 : compact ? 140 : 180;
  const minHeight = chartsOnly ? 120 : compact ? 200 : 300;
  const popularPrograms = useMemo(
    () => (data?.mostPopularPrograms || []).map((p) => ({
      name: p.programName?.length > 20 ? p.programName.slice(0, 18) + '...' : p.programName,
      Стажеры: p.totalInterns ?? 0,
    })),
    [data]
  );

  const bestPrograms = useMemo(
    () => (data?.bestPerformingPrograms || []).map((p) => ({
      name: p.programName?.length > 20 ? p.programName.slice(0, 18) + '...' : p.programName,
      'Выполнение %': Math.round((p.completionRate ?? 0) * 100) / 100,
      'Рейтинг': Math.round((p.averageRating ?? 0) * 10) / 10,
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
    <Card variant={chartsOnly ? 'outlined' : 'elevation'} elevation={chartsOnly ? 0 : 1} sx={{ height: '100%' }}>
      <CardContent sx={{ py: chartsOnly ? 1 : compact ? 1.5 : 2, '&:last-child': { pb: chartsOnly ? 1 : compact ? 1.5 : 2 } }}>
        <Typography variant={chartsOnly ? 'body2' : compact ? 'subtitle1' : 'h6'} fontWeight="bold" sx={{ mb: chartsOnly ? 0.5 : 1 }}>
          Статистика программ
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: chartsOnly ? 0.75 : 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Всего: ${data.totalPrograms ?? 0}`} size="small" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          <Chip label={`Активных: ${data.activePrograms ?? 0}`} size="small" color="primary" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          {!chartsOnly && (
            <>
              <Chip label={`Завершено: ${data.completedPrograms ?? 0}`} size="small" color="success" variant="outlined" />
              {data.averageCompletionRate != null && (
                <Chip label={`Ср. выполнение: ${data.averageCompletionRate.toFixed(0)}%`} size="small" color="info" variant="outlined" />
              )}
            </>
          )}
        </Stack>

        {popularPrograms.length > 0 && (
          <Box sx={{ mb: chartsOnly ? 0 : 2 }}>
            {!chartsOnly && (
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Популярные программы
              </Typography>
            )}
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart data={popularPrograms} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={140} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                <Bar dataKey="Стажеры" fill="#0052cc" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {!chartsOnly && bestPrograms.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Лучшие программы
            </Typography>
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart data={bestPrograms} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={140} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Выполнение %" fill="#36B37E" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Рейтинг" fill="#FFAB00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {popularPrograms.length === 0 && bestPrograms.length === 0 && (
          <Typography variant="body2" color="text.secondary">Нет данных для отображения</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramsStatsChart;
