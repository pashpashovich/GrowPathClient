import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  CheckCircle,
  Schedule,
  PlayArrow,
  Warning,
  Flag,
  Timeline,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { removeStage, updateStageStatus, setCurrentStage } from '../../store/slices/roadmapSlice';

const RoadmapView = ({ onEdit, canEdit = true }) => {
  const dispatch = useDispatch();
  const { stages, currentInternshipId, internships } = useSelector((state) => state.roadmap);
  const currentUser = useSelector((state) => state.auth.user);
  
  // Получаем этапы текущей стажировки
  const currentStages = currentInternshipId ? stages[currentInternshipId] || [] : [];
  const currentInternship = internships.find(i => i.id === currentInternshipId);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComments, setStatusComments] = useState('');

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Ожидает', 
          color: 'default', 
          icon: <Schedule />,
          bgColor: '#f5f5f5'
        };
      case 'in_progress':
        return { 
          label: 'В процессе', 
          color: 'primary', 
          icon: <PlayArrow />,
          bgColor: '#e3f2fd'
        };
      case 'completed':
        return { 
          label: 'Завершено', 
          color: 'success', 
          icon: <CheckCircle />,
          bgColor: '#e8f5e9'
        };
      case 'delayed':
        return { 
          label: 'Задержка', 
          color: 'error', 
          icon: <Warning />,
          bgColor: '#ffebee'
        };
      default:
        return { 
          label: status, 
          color: 'default', 
          icon: <Schedule />,
          bgColor: '#f5f5f5'
        };
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getProgressPercentage = () => {
    const completedStages = currentStages.filter(stage => stage.status === 'completed').length;
    return currentStages.length > 0 ? (completedStages / currentStages.length) * 100 : 0;
  };

  const handleMenuOpen = (event, stage) => {
    setAnchorEl(event.currentTarget);
    setSelectedStage(stage);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStage(null);
  };

  const handleEditStage = () => {
    if (selectedStage) {
      onEdit(selectedStage);
    }
    handleMenuClose();
  };

  const handleDeleteStage = () => {
    if (selectedStage && window.confirm('Вы уверены, что хотите удалить этот этап?')) {
      dispatch(removeStage({ 
        internshipId: currentInternshipId, 
        stageId: selectedStage.id 
      }));
    }
    handleMenuClose();
  };

  const handleChangeStatus = () => {
    if (selectedStage) {
      setNewStatus(selectedStage.status);
      setStatusComments(selectedStage.comments || '');
      setStatusDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleStatusUpdate = () => {
    if (selectedStage && newStatus) {
      dispatch(updateStageStatus({
        internshipId: currentInternshipId,
        stageId: selectedStage.id,
        status: newStatus,
        comments: statusComments,
      }));
    }
    setStatusDialogOpen(false);
    setNewStatus('');
    setStatusComments('');
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      {/* Заголовок и статистика */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Дорожная карта стажировки
            </Typography>
            {currentInternship && (
              <Typography variant="subtitle1" color="text.secondary">
                {currentInternship.title}
              </Typography>
            )}
          </Box>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onEdit(null)}
              disabled={!currentInternshipId}
            >
              Добавить этап
            </Button>
          )}
        </Box>

        {/* Общий прогресс */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Общий прогресс</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentStages.filter(s => s.status === 'completed').length} из {currentStages.length} этапов завершено
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Math.round(getProgressPercentage())}% завершено
          </Typography>
        </Box>

        {/* Статистика по статусам */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {['pending', 'in_progress', 'completed', 'delayed'].map(status => {
            const count = currentStages.filter(s => s.status === status).length;
            const statusInfo = getStatusInfo(status);
            return (
              <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${statusInfo.label}: ${count}`}
                  color={statusInfo.color}
                  icon={statusInfo.icon}
                  size="small"
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Список этапов */}
      {!currentInternshipId ? (
        <Alert severity="info">
          Выберите стажировку для просмотра дорожной карты.
        </Alert>
      ) : currentStages.length === 0 ? (
        <Alert severity="info">
          Дорожная карта пуста. Добавьте первый этап стажировки.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentStages.map((stage, index) => {
            const statusInfo = getStatusInfo(stage.status);
            const daysRemaining = getDaysRemaining(stage.endDate);
            const isOverdue = daysRemaining !== null && daysRemaining < 0 && stage.status !== 'completed';

            return (
              <Card
                key={stage.id}
                sx={{
                  border: `2px solid ${statusInfo.bgColor}`,
                  backgroundColor: statusInfo.bgColor,
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {index + 1}. {stage.title}
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          icon={statusInfo.icon}
                          size="small"
                        />
                        <Chip
                          label={getPriorityLabel(stage.priority)}
                          color={getPriorityColor(stage.priority)}
                          size="small"
                        />
                        {stage.isCheckpoint && (
                          <Chip
                            label="Контрольная точка"
                            color="primary"
                            icon={<Flag />}
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {stage.description}
                      </Typography>
                    </Box>

                    {canEdit && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, stage)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        <Schedule sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                      </Typography>
                      {daysRemaining !== null && (
                        <Typography 
                          variant="caption" 
                          color={isOverdue ? 'error.main' : daysRemaining <= 3 ? 'warning.main' : 'text.secondary'}
                        >
                          {isOverdue ? `Просрочено на ${Math.abs(daysRemaining)} дн.` : 
                           daysRemaining === 0 ? 'Завершается сегодня' :
                           `Осталось ${daysRemaining} дн.`}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {stage.comments && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {stage.comments}
                      </Typography>
                    </>
                  )}
                </CardContent>

                {canEdit && (
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleChangeStatus()}
                      startIcon={<Timeline />}
                    >
                      Изменить статус
                    </Button>
                  </CardActions>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditStage}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        <MenuItem onClick={handleChangeStatus}>
          <Timeline sx={{ mr: 1 }} />
          Изменить статус
        </MenuItem>
        <MenuItem onClick={handleDeleteStage} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {/* Диалог изменения статуса */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Изменить статус этапа: {selectedStage?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={newStatus}
                label="Статус"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="pending">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" /> Ожидает
                  </Box>
                </MenuItem>
                <MenuItem value="in_progress">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayArrow fontSize="small" /> В процессе
                  </Box>
                </MenuItem>
                <MenuItem value="completed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" /> Завершено
                  </Box>
                </MenuItem>
                <MenuItem value="delayed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning fontSize="small" /> Задержка
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Комментарии"
              value={statusComments}
              onChange={(e) => setStatusComments(e.target.value)}
              placeholder="Добавьте комментарии к изменению статуса..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoadmapView;
