import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Person,
  Schedule,
  Flag,
  Add,
  DragIndicator,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTask, updateTask } from '../../store/slices/taskSlice';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';

const KanbanBoard = ({ onEdit, onDelete, onView }) => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const interns = useSelector((state) => state.intern.interns);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const columns = [
    { id: 'pending', title: 'Доступно', color: '#9E9E9E' },
    { id: 'in_progress', title: 'В работе', color: '#2196F3' },
    { id: 'submitted', title: 'На ревью', color: '#FF9800' },
    { id: 'completed', title: 'Завершено', color: '#4CAF50' },
    { id: 'rejected', title: 'Требует доработки', color: '#F44336' },
  ];

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

  const getInternName = (internId) => {
    const intern = interns.find(i => i.id === internId);
    return intern ? intern.name : `Стажер ${internId}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
  };

  const handleEditTask = () => {
    setEditingTask(selectedTask);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = () => {
    if (window.confirm('Вы уверены, что хотите удалить это задание?')) {
      onDelete(selectedTask.id);
    }
  };

  const handleChangeStatus = () => {
    setNewStatus(selectedTask.status);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (newStatus && newStatus !== selectedTask.status) {
      dispatch(updateTask({
        ...selectedTask,
        status: newStatus
      }));
    }
    setIsStatusDialogOpen(false);
    setNewStatus('');
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const TaskCard = ({ task }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={() => {
        dispatch(setCurrentTask(task));
        setIsTaskDetailsOpen(true);
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Заголовок и меню */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flexGrow: 1, mr: 1, fontSize: '0.8rem' }}>
            {task.title}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, task);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Описание */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.7rem' }}>
          {task.description.substring(0, 60)}...
        </Typography>

        {/* Приоритет */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={getPriorityLabel(task.priority || 'medium')}
            color={getPriorityColor(task.priority || 'medium')}
            size="small"
            sx={{ fontSize: '0.65rem', height: 18 }}
          />
        </Box>

        {/* Назначенные стажеры */}
        {task.assignedInterns && task.assignedInterns.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Person fontSize="small" color="action" />
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 9 } }}>
              {task.assignedInterns.slice(0, 3).map((internId) => (
                <Avatar key={internId} alt={getInternName(internId)}>
                  {getInternName(internId).split(' ').map(n => n[0]).join('')}
                </Avatar>
              ))}
            </AvatarGroup>
            {task.assignedInterns.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                +{task.assignedInterns.length - 3}
              </Typography>
            )}
          </Box>
        )}

        {/* Взято в работу */}
        {task.takenBy && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              {getInternName(task.takenBy)}
            </Typography>
          </Box>
        )}

        {/* Дата создания */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Schedule fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            {formatDate(task.createdAt)}
          </Typography>
        </Box>

        {/* Рейтинг (если есть) */}
        {task.rating && (
          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Flag fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Оценка: {task.rating}/10
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Доска задач
      </Typography>

      {/* Канбан доска */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        pb: 2, 
        minWidth: 'fit-content',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}>
        {columns.map((column) => (
          <Box
            key={column.id}
            sx={{
              minWidth: 250,
              width: 250,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              p: 1.5,
              border: `2px solid ${column.color}20`,
              flexShrink: 0,
            }}
          >
            {/* Заголовок колонки */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: column.color,
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  {column.title}
                </Typography>
                <Chip
                  label={getTasksByStatus(column.id).length}
                  size="small"
                  sx={{ backgroundColor: column.color, color: 'white', fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            {/* Задачи в колонке */}
            <Box sx={{ minHeight: 300 }}>
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <Box
                  sx={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Нет задач
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleViewTask();
        }}>
          <Visibility sx={{ mr: 1 }} />
          Просмотр
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleEditTask();
        }}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleChangeStatus();
        }}>
          <DragIndicator sx={{ mr: 1 }} />
          Изменить статус
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleDeleteTask();
        }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {/* Диалог изменения статуса */}
      <Dialog open={isStatusDialogOpen} onClose={() => setIsStatusDialogOpen(false)}>
        <DialogTitle>Изменить статус задачи</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Новый статус</InputLabel>
            <Select
              value={newStatus}
              label="Новый статус"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: column.color,
                      }}
                    />
                    {column.title}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStatusDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStatusUpdate}
            disabled={!newStatus || newStatus === selectedTask?.status}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

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
        onEdit={() => {
          setIsTaskDetailsOpen(false);
          setEditingTask(selectedTask);
          setIsTaskFormOpen(true);
        }}
      />
    </Box>
  );
};

export default KanbanBoard;
