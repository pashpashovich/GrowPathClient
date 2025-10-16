import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Visibility,
  CheckCircle,
  Cancel,
  Comment,
  Person,
  Schedule,
  AttachFile,
  Link as LinkIcon,
  FilterList,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { reviewTask, addTaskComment, setCurrentTask } from '../../store/slices/taskSlice';

const TaskReviewPanel = ({ onViewTask }) => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const currentUser = useSelector((state) => state.auth.user);
  const interns = useSelector((state) => state.intern.interns);

  const [selectedTask, setSelectedTask] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState('');
  const [newComment, setNewComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [internFilter, setInternFilter] = useState('all');

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Доступно', color: 'default' };
      case 'in_progress':
        return { label: 'В работе', color: 'primary' };
      case 'submitted':
        return { label: 'На ревью', color: 'warning' };
      case 'completed':
        return { label: 'Завершено', color: 'success' };
      case 'rejected':
        return { label: 'Требует доработки', color: 'error' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const getInternName = (internId) => {
    const intern = interns.find(i => i.id === internId);
    return intern ? intern.name : 'Неизвестный стажер';
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

  const handleReviewTask = (task) => {
    setSelectedTask(task);
    setReviewStatus(task.status === 'submitted' ? 'completed' : task.status);
    setReviewComment('');
    setReviewRating('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewStatus) {
      alert('Выберите статус для задачи');
      return;
    }

    if (reviewStatus === 'completed' && !reviewRating) {
      alert('При принятии задания необходимо поставить оценку');
      return;
    }

    dispatch(reviewTask({
      taskId: selectedTask.id,
      mentorId: currentUser?.id || 'current-mentor-id',
      status: reviewStatus,
      comment: reviewComment,
      rating: reviewStatus === 'completed' ? parseInt(reviewRating) : undefined
    }));

    setReviewDialogOpen(false);
    setSelectedTask(null);
    setReviewStatus('');
    setReviewComment('');
    setReviewRating('');
  };

  const handleAddComment = (task) => {
    setSelectedTask(task);
    setNewComment('');
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      alert('Введите комментарий');
      return;
    }

    dispatch(addTaskComment({
      taskId: selectedTask.id,
      userId: currentUser?.id || 'current-mentor-id',
      comment: newComment.trim()
    }));

    setCommentDialogOpen(false);
    setSelectedTask(null);
    setNewComment('');
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const internMatch = internFilter === 'all' || 
      (task.takenBy && task.takenBy === internFilter) ||
      (task.submittedBy && task.submittedBy === internFilter) ||
      (task.assignedInterns && task.assignedInterns.includes(internFilter));
    return statusMatch && internMatch;
  });

  const submittedTasks = filteredTasks.filter(task => task.status === 'submitted');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Проверка заданий
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="submitted">На ревью</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="completed">Завершено</MenuItem>
              <MenuItem value="rejected">Требует доработки</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Стажер</InputLabel>
            <Select
              value={internFilter}
              label="Стажер"
              onChange={(e) => setInternFilter(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              {interns.map((intern) => (
                <MenuItem key={intern.id} value={intern.id}>
                  {intern.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {submittedTasks.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            У вас {submittedTasks.length} заданий на ревью, требующих проверки
          </Typography>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Задание</TableCell>
              <TableCell>Стажер</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Взято в работу</TableCell>
              <TableCell>Сдано</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => {
              const statusInfo = getStatusInfo(task.status);
              const internName = getInternName(task.takenBy || task.submittedBy);
              
              return (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {internName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {internName}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={statusInfo.label} 
                      color={statusInfo.color} 
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    {task.takenAt ? (
                      <Typography variant="caption">
                        {formatDate(task.takenAt)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Не взято
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {task.submittedAt ? (
                      <Typography variant="caption">
                        {formatDate(task.submittedAt)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Не сдано
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Подробнее">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            dispatch(setCurrentTask(task));
                            onViewTask(task);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Добавить комментарий">
                        <IconButton 
                          size="small" 
                          onClick={() => handleAddComment(task)}
                        >
                          <Comment />
                        </IconButton>
                      </Tooltip>
                      
                      {task.status === 'submitted' && (
                        <Tooltip title="Проверить">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleReviewTask(task)}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTasks.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Заданий не найдено
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить фильтры
          </Typography>
        </Paper>
      )}

      {/* Диалог проверки задачи */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Проверка задания: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedTask.description}
              </Typography>

              {selectedTask.submissionComment && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Комментарий стажера:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedTask.submissionComment}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {selectedTask.submissionFiles && selectedTask.submissionFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Прикрепленные файлы:
                  </Typography>
                  <List dense>
                    {selectedTask.submissionFiles.map((file, index) => (
                      <ListItem key={index}>
                        <AttachFile sx={{ mr: 1 }} />
                        <ListItemText 
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTask.submissionLinks && selectedTask.submissionLinks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Ссылки:
                  </Typography>
                  <List dense>
                    {selectedTask.submissionLinks.map((link, index) => (
                      <ListItem key={index}>
                        <LinkIcon sx={{ mr: 1 }} />
                        <ListItemText primary={link} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Статус проверки</InputLabel>
                <Select
                  value={reviewStatus}
                  label="Статус проверки"
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  <MenuItem value="completed">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle color="success" />
                      Принять
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Cancel color="error" />
                      Требует доработки
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {reviewStatus === 'completed' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Оценка (обязательно при принятии)</InputLabel>
                  <Select
                    value={reviewRating}
                    label="Оценка (обязательно при принятии)"
                    onChange={(e) => setReviewRating(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                      <MenuItem key={score} value={score}>
                        {score} баллов
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Комментарий к проверке"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Оставьте комментарий о качестве выполнения задания..."
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReview}
            disabled={!reviewStatus || (reviewStatus === 'completed' && !reviewRating)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления комментария */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Добавить комментарий к заданию: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Комментарий"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Оставьте комментарий для стажера..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskReviewPanel;
