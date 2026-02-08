import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Assignment,
  Person,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setFilters, setCurrentTask, fetchTasksAsync } from '../../store/slices/taskSlice';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks, filters, isLoading } = useSelector((state) => state.task);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    dispatch(fetchTasksAsync(filters));
  }, [dispatch, filters.status, filters.priority, filters.assignee, filters.internshipId]);


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

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleViewTask = () => {
    dispatch(setCurrentTask(selectedTask));
    setIsTaskDetailsOpen(true);
    handleMenuClose();
  };

  const handleEditTask = () => {
    setEditingTask(selectedTask);
    setIsTaskFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteTask = () => {
    console.log('Delete task:', selectedTask.id);
    handleMenuClose();
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignee && task.assigneeId !== filters.assignee) return false;
    if (filters.internshipId && task.internshipId !== filters.internshipId) return false;
    return true;
  });

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Управление задачами
        </Typography>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Статус"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="assigned">Назначено</MenuItem>
                <MenuItem value="in_progress">В работе</MenuItem>
                <MenuItem value="completed">Завершено</MenuItem>
                <MenuItem value="cancelled">Отменено</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Приоритет"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="low">Низкий</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Стажер</InputLabel>
              <Select
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                label="Стажер"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="1">Иван Иванов</MenuItem>
                <MenuItem value="2">Петр Петров</MenuItem>
                <MenuItem value="3">Анна Сидорова</MenuItem>
                <MenuItem value="4">Мария Козлова</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск по названию..."
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Список задач */}
      <Grid container spacing={2}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Заголовок и меню */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                    {task.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Описание */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>

                {/* Теги */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={getPriorityLabel(task.priority)}
                    color={getPriorityColor(task.priority)}
                    size="small"
                    icon={<Flag />}
                  />
                  <Chip
                    label={getStatusLabel(task.status)}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </Box>

                {/* Прогресс */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Прогресс
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={task.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Назначенные стажеры */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person fontSize="small" color="action" />
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                    {task.assignees.map((assignee) => (
                      <Avatar key={assignee.id} alt={assignee.name}>
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="body2" color="text.secondary">
                    {task.assignees.length} стажер(ов)
                  </Typography>
                </Box>

                {/* Срок выполнения */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    До {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewTask}>
          <Visibility sx={{ mr: 1 }} />
          Просмотр
        </MenuItem>
        <MenuItem onClick={handleEditTask}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {/* Форма создания/редактирования задачи */}
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />

      {/* Детали задачи */}
      <TaskDetails
        open={isTaskDetailsOpen}
        onClose={() => setIsTaskDetailsOpen(false)}
      />
    </Box>
  );
};

export default TaskList;
