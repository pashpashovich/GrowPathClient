import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Link,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close,
  Assignment,
  Person,
  Schedule,
  Flag,
  RadioButtonUnchecked,
  AttachFile,
  Link as LinkIcon,
  Edit,
  School,
  TrackChanges,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  normalizeTaskFromApi,
  resolveTaskChecklist,
  resolveTaskFileAttachments,
  resolveTaskGoalLabel,
} from '../../utils/mapTaskToForm';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const TaskDetails = ({ open, onClose, onEdit, canEdit = true, loading = false }) => {
  const { currentTask } = useSelector((state) => state.task);

  if (!open) return null;

  const task = normalizeTaskFromApi(currentTask) || currentTask;
  const checklist = resolveTaskChecklist(task).filter((item) => item.text?.trim());
  const attachments = resolveTaskFileAttachments(task);
  const goalLabel = resolveTaskGoalLabel(task);
  const links = Array.isArray(task?.links) ? task.links : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return priority || '—';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'on_review':
      case 'submitted':
        return 'warning';
      case 'completed':
      case 'done':
        return 'success';
      case 'needs_rework':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Доступно';
      case 'in_progress':
        return 'В работе';
      case 'on_review':
        return 'На проверке';
      case 'submitted':
        return 'На ревью';
      case 'completed':
      case 'done':
        return 'Завершено';
      case 'needs_rework':
        return 'Требует доработки';
      case 'rejected':
        return 'Отклонено';
      default:
        return status || '—';
    }
  };

  const mentorName =
    task?.mentorName ?? task?.mentor?.fullName ?? task?.mentor?.name ?? null;
  const programName =
    task?.programName ??
    task?.internshipName ??
    task?.internship?.name ??
    task?.program?.name ??
    null;
  const assigneeName =
    task?.assigneeName ?? task?.assignee?.fullName ?? task?.assignee?.name ?? null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h5" component="div" sx={{ pr: 1 }}>
            {task?.title || 'Задание'}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Закрыть">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !task && (
          <Alert severity="warning">Не удалось загрузить данные задания</Alert>
        )}

        {!loading && task && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Flag fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Приоритет:
                    </Typography>
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Assignment fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Статус:
                    </Typography>
                    <Chip
                      label={getStatusLabel(task.status)}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </Box>

                  {task.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Срок:
                      </Typography>
                      <Typography variant="body2">{formatDate(task.dueDate)}</Typography>
                    </Box>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Создано:
                    </Typography>
                    <Typography variant="body2">{formatDate(task.createdAt)}</Typography>
                  </Box>

                  {assigneeName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Исполнитель:
                      </Typography>
                      <Typography variant="body2">{assigneeName}</Typography>
                    </Box>
                  )}

                  {mentorName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Ментор:
                      </Typography>
                      <Typography variant="body2">{mentorName}</Typography>
                    </Box>
                  )}

                  {programName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <School fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Программа:
                      </Typography>
                      <Typography variant="body2">{programName}</Typography>
                    </Box>
                  )}

                  {goalLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrackChanges fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Цель программы:
                      </Typography>
                      <Typography variant="body2">{goalLabel}</Typography>
                    </Box>
                  )}

                  {task.takenAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Взято в работу:
                      </Typography>
                      <Typography variant="body2">{formatDate(task.takenAt)}</Typography>
                    </Box>
                  )}

                  {task.submittedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Сдано:
                      </Typography>
                      <Typography variant="body2">{formatDate(task.submittedAt)}</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.description?.trim() || 'Описание не указано'}
              </Typography>
            </Paper>

            {checklist.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Чек-лист приёмки
                </Typography>
                <List dense>
                  {checklist.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <RadioButtonUnchecked color="action" />
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {attachments.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Материалы от ментора
                </Typography>
                <List dense>
                  {attachments.map((attachment, index) => {
                    const name =
                      typeof attachment === 'string'
                        ? attachment
                        : attachment.name || attachment.fileName || 'Файл';
                    const url =
                      typeof attachment === 'object' ? attachment.url || attachment.downloadUrl : null;
                    return (
                      <ListItem key={attachment.id ?? index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AttachFile color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            url ? (
                              <Link href={url} target="_blank" rel="noopener noreferrer">
                                {name}
                              </Link>
                            ) : (
                              name
                            )
                          }
                          secondary={
                            attachment.size
                              ? `${Math.round(Number(attachment.size) / 1024)} КБ`
                              : undefined
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}

            {links.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Полезные ссылки
                </Typography>
                <List dense>
                  {links.map((linkItem, index) => {
                    const linkUrl =
                      typeof linkItem === 'string' ? linkItem : linkItem.url || linkItem.href || '';
                    const linkTitle =
                      typeof linkItem === 'string'
                        ? linkItem
                        : linkItem.title || linkItem.label || linkUrl;
                    return (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <LinkIcon color="action" />
                        </ListItemIcon>
                        <ListItemText>
                          <Link href={linkUrl} target="_blank" rel="noopener noreferrer">
                            {linkTitle}
                          </Link>
                        </ListItemText>
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}

            {task.submissionComment && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Комментарий при сдаче
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.submissionComment}
                </Typography>
              </Paper>
            )}

            {task.reviewComment && (
              <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="h6" gutterBottom>
                  Комментарий ментора
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.reviewComment}
                </Typography>
              </Paper>
            )}

            {task.assignedInterns && task.assignedInterns.length > 0 && canEdit && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Назначенные стажеры
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.assignedInterns.length} стажер(ов) назначено
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {canEdit && !loading && (
          <Button variant="contained" startIcon={<Edit />} onClick={onEdit}>
            Редактировать
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetails;
