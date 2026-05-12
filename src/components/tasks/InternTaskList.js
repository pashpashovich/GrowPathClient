import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import { 
  PlayArrow, 
  CheckCircle, 
  Pending, 
  Assignment, 
  Person,
  Schedule,
  Visibility 
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { takeTaskAsync } from '../../store/slices/taskSlice';

const InternTaskList = ({ onViewTask, onSubmitTask }) => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Доступно', 
          color: 'default', 
          icon: <Pending />,
          description: 'Задача доступна для взятия в работу'
        };
      case 'in_progress':
        return { 
          label: 'В работе', 
          color: 'primary', 
          icon: <PlayArrow />,
          description: 'Задача выполняется'
        };
      case 'submitted':
        return { 
          label: 'На ревью', 
          color: 'warning', 
          icon: <CheckCircle />,
          description: 'Задача отправлена на проверку'
        };
      case 'completed':
        return { 
          label: 'Завершено', 
          color: 'success', 
          icon: <CheckCircle />,
          description: 'Задача выполнена и принята'
        };
      case 'on_review':
        return {
          label: 'На проверке',
          color: 'info',
          icon: <CheckCircle />,
          description: 'Задача на проверке у ментора',
        };
      case 'needs_rework':
        return { 
          label: 'Требует доработки', 
          color: 'error', 
          icon: <Assignment />,
          description: 'Задача требует доработки'
        };
      case 'rejected':
        return {
          label: 'Отклонена',
          color: 'error',
          icon: <Assignment />,
          description: 'Задача отклонена',
        };
      default:
        return { 
          label: status, 
          color: 'default', 
          icon: <Assignment />,
          description: 'Неизвестный статус'
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTakeTask = (taskId) => {
    if (window.confirm('Вы уверены, что хотите взять эту задачу в работу?')) {
      dispatch(takeTaskAsync(taskId));
    }
  };

  const isAssignee = (task) =>
    task.assigneeId == null ||
    currentUserId == null ||
    Number(task.assigneeId) === Number(currentUserId);

  const canTakeTask = (task) => task.status === 'pending';

  const canSubmitTask = (task) =>
    (task.status === 'in_progress' || task.status === 'needs_rework') && isAssignee(task);

  const assignedTasks = tasks;

  if (assignedTasks.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Вам пока не назначено ни одного задания
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Обратитесь к ментору для получения заданий
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {assignedTasks.map((task) => {
          const statusInfo = getStatusInfo(task.status);
          const isTakenByMe = isAssignee(task) && task.status !== 'pending';
          
          return (
            <Card 
              key={task.id} 
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {statusInfo.icon}
                  <Chip 
                    label={statusInfo.label} 
                    color={statusInfo.color} 
                    size="small"
                  />
                </Box>
                
                <Typography variant="h6" component="div" gutterBottom>
                  {task.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {(task.description || '').substring(0, 100)}
                  {(task.description || '').length > 100 ? '...' : ''}
                </Typography>

                {task.status !== 'pending' && task.assigneeName && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {isTakenByMe ? 'Вы в работе' : task.assigneeName}
                    </Typography>
                  </Box>
                )}

                {task.takenAt && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(task.takenAt)}
                    </Typography>
                  </Box>
                )}

                {task.submittedAt && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircle fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Сдано: {formatDate(task.submittedAt)}
                    </Typography>
                  </Box>
                )}

                {task.checklist && task.checklist.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Чек-лист: {task.checklist.length} пунктов
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onViewTask(task)}
                >
                  Подробнее
                </Button>

                {canTakeTask(task) && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleTakeTask(task.id)}
                  >
                    Взять в работу
                  </Button>
                )}

                {canSubmitTask(task) && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => onSubmitTask(task)}
                  >
                    Сдать задание
                  </Button>
                )}

                {(task.status === 'needs_rework' || task.status === 'rejected') && isTakenByMe && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onSubmitTask(task)}
                  >
                    Доработать
                  </Button>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default InternTaskList;
