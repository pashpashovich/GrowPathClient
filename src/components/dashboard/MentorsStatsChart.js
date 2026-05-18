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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Star } from '@mui/icons-material';

const WORKLOAD_COLORS = {
  low: '#00B8D9',
  normal: '#36B37E',
  high: '#FFAB00',
  overloaded: '#BA1A1A',
};

const WORKLOAD_LABELS = {
  low: 'Низкая',
  normal: 'Нормальная',
  high: 'Высокая',
  overloaded: 'Перегрузка',
};

const MentorsStatsChart = ({ data, compact = false, chartsOnly = false }) => {
  const barHeight = chartsOnly ? 100 : compact ? 160 : 200;
  const minHeight = chartsOnly ? 120 : compact ? 200 : 300;
  const topMentorsLimit = chartsOnly ? 0 : compact ? 3 : undefined;
  const workloadData = useMemo(
    () => (data?.workloadDistribution || []).map((m) => ({
      name: m.mentorName?.split(' ').slice(0, 2).join(' ') || '—',
      Стажеры: m.activeInterns ?? 0,
      Задачи: m.activeTasks ?? 0,
      workload: m.workloadLevel,
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
          Статистика менторов
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: chartsOnly ? 0.75 : 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Всего: ${data.totalMentors ?? 0}`} size="small" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          <Chip label={`Активных: ${data.activeMentors ?? 0}`} size="small" color="primary" variant="outlined" sx={chartsOnly ? { height: 22, fontSize: '0.65rem' } : undefined} />
          {!chartsOnly && data.averageInternsPerMentor != null && (
            <Chip label={`Ср. стажеров: ${data.averageInternsPerMentor.toFixed(1)}`} size="small" variant="outlined" />
          )}
          {!chartsOnly && data.averageReviewTime != null && (
            <Chip label={`Ср. время проверки: ${data.averageReviewTime.toFixed(1)} ч`} size="small" variant="outlined" />
          )}
        </Stack>

        {workloadData.length > 0 && (
          <Box sx={{ mb: chartsOnly ? 0 : 2 }}>
            {!chartsOnly && (
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Нагрузка менторов
              </Typography>
            )}
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart data={workloadData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="name" tick={{ fontSize: chartsOnly ? 9 : 11 }} interval={0} angle={chartsOnly ? -20 : 0} textAnchor={chartsOnly ? 'end' : 'middle'} height={chartsOnly ? 48 : 30} />
                <YAxis tick={{ fontSize: chartsOnly ? 10 : 12 }} width={chartsOnly ? 24 : undefined} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                <Bar dataKey="Стажеры" radius={[4, 4, 0, 0]}>
                  {workloadData.map((entry, i) => (
                    <Cell key={i} fill={WORKLOAD_COLORS[entry.workload] || '#737685'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {!chartsOnly && topMentorsLimit !== 0 && data.topMentors && data.topMentors.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Топ менторов
            </Typography>
            <List dense disablePadding>
              {(topMentorsLimit ? data.topMentors.slice(0, topMentorsLimit) : data.topMentors).map((mentor) => (
                <ListItem key={mentor.mentorId} disableGutters sx={{ px: 0 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#0052cc', fontSize: 14 }}>
                      {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {mentor.firstName} {mentor.lastName}
                        </Typography>
                        {mentor.averageRating != null && (
                          <Chip
                            icon={<Star sx={{ fontSize: 12 }} />}
                            label={mentor.averageRating.toFixed(1)}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {mentor.activeInterns} стажеров · {mentor.completedTasks} задач · {mentor.departmentName || ''}
                      </Typography>
                    }
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

export default MentorsStatsChart;
