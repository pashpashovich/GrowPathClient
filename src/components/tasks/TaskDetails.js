import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Link,
  Paper,
  Grid,
} from '@mui/material';
import {
  Close,
  Assignment,
  Person,
  Schedule,
  Flag,
  CheckCircle,
  RadioButtonUnchecked,
  AttachFile,
  Link as LinkIcon,
  Edit,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const TaskDetails = ({ open, onClose, onEdit }) => {
  const { currentTask } = useSelector((state) => state.task);

  if (!currentTask) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'primary';
      case 'submitted': return 'warning';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Доступно';
      case 'in_progress': return 'В работе';
      case 'submitted': return 'На ревью';
      case 'completed': return 'Завершено';
      case 'rejected': return 'Требует доработки';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {currentTask.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Основная информация */}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Flag fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Приоритет:
                  </Typography>
                  <Chip
                    label={getPriorityLabel(currentTask.priority)}
                    color={getPriorityColor(currentTask.priority)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Assignment fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Статус:
                  </Typography>
                  <Chip
                    label={getStatusLabel(currentTask.status)}
                    color={getStatusColor(currentTask.status)}
                    size="small"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Создано:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(currentTask.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
                
                {currentTask.takenBy && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Взято в работу:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(currentTask.takenAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Описание */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Описание
            </Typography>
            <Typography variant="body1">
              {currentTask.description}
            </Typography>
          </Paper>

          {/* Назначенные стажеры */}
          {currentTask.assignedInterns && currentTask.assignedInterns.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Назначенные стажеры
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTask.assignedInterns.length} стажер(ов) назначено
              </Typography>
            </Paper>
          )}


          {/* Чек-лист */}
          {currentTask.checklist && currentTask.checklist.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Чек-лист приемки
              </Typography>
              <List dense>
                {currentTask.checklist.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <RadioButtonUnchecked color="action" />
                    </ListItemIcon>
                    <ListItemText primary={typeof item === 'string' ? item : item.text || item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Прикрепленные файлы */}
          {currentTask.attachments && currentTask.attachments.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Прикрепленные файлы
              </Typography>
              <List dense>
                {currentTask.attachments.map((attachment, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AttachFile color="action" />
                    </ListItemIcon>
                    <ListItemText primary={typeof attachment === 'string' ? attachment : attachment.name || attachment} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Полезные ссылки */}
          {currentTask.links && currentTask.links.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Полезные ссылки
              </Typography>
              <List dense>
                {currentTask.links.map((link, index) => {
                  const linkUrl = typeof link === 'string' ? link : link.url || link;
                  const linkTitle = typeof link === 'string' ? link : link.title || link;
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
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
        <Button variant="contained" startIcon={<Edit />} onClick={onEdit}>
          Редактировать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetails;
