import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Person,
  Schedule,
  Flag,
  DragIndicator,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentTask,
  setFilters,
  fetchTasksAsync,
  patchTaskStatusAsync,
} from '../../store/slices/taskSlice';
import { useTheme } from '@mui/material/styles';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';

const KanbanBoard = ({ onEdit, onDelete, onView }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const tasks = useSelector((state) => state.task?.tasks || []);
  const interns = useSelector((state) => state.intern?.interns || []);
  const internships = useSelector((state) => state.roadmap?.internships || []);
  const programs = useSelector((state) => state.internshipProgram?.programs || []);
  const filters = useSelector((state) => state.task?.filters || {});

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const buttonRef = useRef(null);

  const columns = [
    { id: 'pending', title: 'Доступно', color: theme.palette.grey[500] },
    { id: 'in_progress', title: 'В работе', color: theme.palette.info.main },
    { id: 'submitted', title: 'Сдано', color: theme.palette.warning.light },
    { id: 'on_review', title: 'На проверке', color: theme.palette.warning.main },
    { id: 'needs_rework', title: 'Доработка', color: theme.palette.error.light },
    { id: 'completed', title: 'Завершено', color: theme.palette.success.main },
    { id: 'rejected', title: 'Отклонено', color: theme.palette.error.dark },
  ];

  const loadTasks = useCallback(() => {
    const params = { page: 1, limit: 100 };
    if (filters.internshipId) {
      params.internshipId = String(filters.internshipId);
    }
    dispatch(fetchTasksAsync(params));
  }, [dispatch, filters.internshipId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const getInternshipName = (internshipId) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship ? internship.title : `Стажировка ${internshipId}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleMenuOpen = (event, task) => {
    event.preventDefault();
    event.stopPropagation();
    buttonRef.current = event.currentTarget;
    if (document.contains(event.currentTarget)) {
      setAnchorEl(event.currentTarget);
      setSelectedTask(task);
    }
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

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus || newStatus === selectedTask.status) {
      setIsStatusDialogOpen(false);
      setNewStatus('');
      return;
    }
    try {
      await dispatch(
        patchTaskStatusAsync({ id: selectedTask.id, body: { to: newStatus } })
      ).unwrap();
      loadTasks();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Переход недоступен. Проверьте статус и роль.');
    }
    setIsStatusDialogOpen(false);
    setNewStatus('');
  };

  const handleInternshipFilterChange = (internshipId) => {
    dispatch(setFilters({
      ...filters,
      internshipId: internshipId
    }));
  };

  const getTasksByStatus = (status) => {
    const list = tasks.filter((task) => {
      const statusMatch = task.status === status;
      const internshipMatch =
        !filters.internshipId ||
        Number(task.internshipId) === Number(filters.internshipId);
      return statusMatch && internshipMatch;
    });
    return [...list].sort((a, b) => {
      const ao = a.sortOrder ?? 0;
      const bo = b.sortOrder ?? 0;
      if (ao !== bo) return ao - bo;
      return Number(a.id) - Number(b.id);
    });
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (columnId) => async (e) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('application/x-task-id'), 10);
    const fromStatus = e.dataTransfer.getData('application/x-from-status');
    if (!id || !fromStatus) return;

    if (fromStatus === columnId) {
      return;
    }

    try {
      await dispatch(patchTaskStatusAsync({ id, body: { to: columnId } })).unwrap();
      loadTasks();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Перемещение в эту колонку сейчас недоступно');
    }
  };

  const handleTaskDragStart = (task) => (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/x-task-id', String(task.id));
    e.dataTransfer.setData('application/x-from-status', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getTaskGoal = (task) => {
    if (!task.goalId) return null;
    
    for (const program of programs) {
      const goal = program.goals?.find(
        (g) => Number(g.id) === Number(task.goalId)
      );
      if (goal) return goal;
    }
    return null;
  };

  const TaskCard = ({ task }) => {
    const taskGoal = getTaskGoal(task);
    
    return (
    <Card
      draggable
      onDragStart={handleTaskDragStart(task)}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
        '&:active': { cursor: 'grabbing' },
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
            id={`task-menu-button-${task.id}`}
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMenuOpen(e, task);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Описание */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.7rem' }}>
          {(task.description || '').slice(0, 60)}
          {(task.description || '').length > 60 ? '…' : ''}
        </Typography>

        {/* Приоритет и стажировка */}
        <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={getPriorityLabel(task.priority || 'medium')}
            color={getPriorityColor(task.priority || 'medium')}
            size="small"
            sx={{ fontSize: '0.65rem', height: 18 }}
          />
          {task.internshipId && (
            <Chip
              label={getInternshipName(task.internshipId)}
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          )}
        </Box>

        {/* Цель программы стажировки */}
        {taskGoal && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={taskGoal.title}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        )}

        {task.assigneeName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Person fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              {task.assigneeName}
            </Typography>
          </Box>
        )}

        {task.assignedInterns && task.assignedInterns.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Person fontSize="small" color="action" />
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 9 } }}>
              {task.assignedInterns.slice(0, 3).map((internId) => (
                <Avatar key={internId} alt={getInternName(internId)}>
                  {getInternName(internId).split(' ').map((n) => n[0]).join('')}
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
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="h4" gutterBottom>
          Доска задач
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Перетащите карточку в другую колонку, чтобы запросить смену статуса на сервере (доступные переходы
          зависят от роли и текущего состояния задачи).
        </Typography>
      </Box>

      {/* Фильтр по стажировкам */}
      <Paper sx={{ p: 2, mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Фильтр по стажировкам:
          </Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Выберите стажировку</InputLabel>
            <Select
              value={filters.internshipId || ''}
              label="Выберите стажировку"
              onChange={(e) => handleInternshipFilterChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Все стажировки</em>
              </MenuItem>
              {internships.map((internship) => (
                <MenuItem key={internship.id} value={internship.id}>
                  {internship.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {filters.internshipId && (
            <Chip
              label={`Активен: ${getInternshipName(filters.internshipId)}`}
              color="primary"
              onDelete={() => handleInternshipFilterChange('')}
            />
          )}
        </Box>
      </Paper>

      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: { xs: 'calc(100dvh - 288px)', sm: 'calc(100dvh - 268px)', md: 'calc(100dvh - 248px)' },
          minHeight: { xs: 280, sm: 300, md: 320 },
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
          scrollbarGutter: 'stable',
          '&::-webkit-scrollbar': {
            height: 10,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'action.hover',
            borderRadius: 5,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.selected',
            borderRadius: 5,
            '&:hover': {
              backgroundColor: 'text.disabled',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'stretch',
            height: '100%',
            minHeight: '100%',
            width: 'max-content',
            minWidth: '100%',
            pr: 1,
          }}
        >
        {columns.map((column) => (
          <Box
            key={column.id}
            onDragOver={handleColumnDragOver}
            onDrop={handleColumnDrop(column.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 250,
              width: 250,
              maxHeight: '100%',
              backgroundColor: 'background.paper',
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

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pr: 0.5,
                '&::-webkit-scrollbar': {
                  width: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'divider',
                  borderRadius: 4,
                },
              }}
            >
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {getTasksByStatus(column.id).length === 0 && (
                <Box
                  sx={{
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
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
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 180,
              zIndex: 1300,
              mt: 0.5,
            }
          }
        }}
        disableScrollLock={true}
        disablePortal={true}
        keepMounted={false}
        MenuListProps={{
          'aria-labelledby': 'task-menu-button',
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
