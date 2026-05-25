import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
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
import {
  Circle,
  AccessTime,
  Warning,
} from '@mui/icons-material';

const PRIORITY_COLORS = {
  critical: '#BA1A1A',
  high: '#FF8B00',
  medium: '#FFAB00',
  low: '#00B8D9',
};

const PRIORITY_LABELS = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const STATUS_LABELS = {
  pending: 'Ожидание',
  in_progress: 'В работе',
  submitted: 'Отправлено',
  on_review: 'На проверке',
  needs_rework: 'Требует доработки',
  rejected: 'Отклонено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const UpcomingDeadlines = ({ data }) => {
  const deadlinesByDay = useMemo(
    () => (data?.deadlinesByDay || []).map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    })),
    [data]
  );

  const deadlines = data?.deadlines || [];

  if (!data) {
    return (
      <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <Typography color="text.secondary">Нет данных</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Ближайшие дедлайны
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Chip icon={<AccessTime />} label={`Всего: ${data.totalDeadlines ?? 0}`} size="small" variant="outlined" />
          {data.criticalDeadlines > 0 && (
            <Chip icon={<Warning />} label={`Критических: ${data.criticalDeadlines}`} size="small" color="error" variant="outlined" />
          )}
          {data.overdueTasks > 0 && (
            <Chip label={`Просрочено: ${data.overdueTasks}`} size="small" color="error" />
          )}
        </Stack>

        {deadlinesByDay.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Дедлайны по дням
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={deadlinesByDay} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e2e4' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0052cc" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {deadlines.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Задачи
            </Typography>
            <List dense disablePadding>
              {deadlines.slice(0, 10).map((task) => (
                <ListItem key={task.taskId} disableGutters sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Circle sx={{ fontSize: 10, color: PRIORITY_COLORS[task.priority] || '#737685' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ flex: 1, minWidth: 0 }} noWrap>
                          {task.title}
                        </Typography>
                        <Chip
                          label={PRIORITY_LABELS[task.priority] || task.priority}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: `${PRIORITY_COLORS[task.priority] || '#737685'}18`,
                            color: PRIORITY_COLORS[task.priority] || '#737685',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })} · {STATUS_LABELS[String(task.status).toLowerCase()] || task.status}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {deadlinesByDay.length === 0 && deadlines.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Нет предстоящих дедлайнов
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
