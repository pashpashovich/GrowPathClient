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

const TaskDetails = ({ open, onClose }) => {
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
      case 'assigned': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'assigned': return 'Назначено';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
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
                    Срок выполнения:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(currentTask.dueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Создано:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(currentTask.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
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
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Назначенные стажеры
            </Typography>
            <AvatarGroup max={4}>
              {currentTask.assignees.map((assignee) => (
                <Avatar key={assignee.id} alt={assignee.name}>
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {currentTask.assignees.map(a => a.name).join(', ')}
            </Typography>
          </Paper>

          {/* Прогресс */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Прогресс выполнения
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={currentTask.progress} 
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary">
                {currentTask.progress}%
              </Typography>
            </Box>
          </Paper>

          {/* Чек-лист */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Чек-лист приемки
            </Typography>
            <List dense>
              {currentTask.checklist.map((item, index) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {item.completed ? (
                      <CheckCircle color="success" />
                    ) : (
                      <RadioButtonUnchecked color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'text.secondary' : 'text.primary'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Прикрепленные файлы */}
          {currentTask.attachments.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Прикрепленные файлы
              </Typography>
              <List dense>
                {currentTask.attachments.map((attachment) => (
                  <ListItem key={attachment.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AttachFile color="action" />
                    </ListItemIcon>
                    <ListItemText primary={attachment.name} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Полезные ссылки */}
          {currentTask.links.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Полезные ссылки
              </Typography>
              <List dense>
                {currentTask.links.map((link) => (
                  <ListItem key={link.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <LinkIcon color="action" />
                    </ListItemIcon>
                    <ListItemText>
                      <Link href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.title}
                      </Link>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
        <Button variant="contained" startIcon={<Edit />}>
          Редактировать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetails;
