import React, { useState, useEffect } from 'react';
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
  Snackbar,
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
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteStageAsync,
  changeStageStatusAsync,
  reorderStagesAsync,
  clearError,
} from '../../store/slices/roadmapSlice';
import ConfirmDialog from '../ui/ConfirmDialog';
import { getApiErrorMessage } from '../../utils/apiResponse';

const RoadmapView = ({ onEdit, canEdit = true, useIpr = false }) => {
  const dispatch = useDispatch();
  const { stages, currentInternshipId, internships, isLoading, error } = useSelector((state) => state.roadmap);

  const currentStages = currentInternshipId ? stages[currentInternshipId] || [] : [];
  const currentInternship = internships.find(i => i.id === currentInternshipId);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComments, setStatusComments] = useState('');
  const [stageToDelete, setStageToDelete] = useState(null);
  const [deletingStage, setDeletingStage] = useState(false);
  const [localError, setLocalError] = useState('');

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
    if (selectedStage) {
      setStageToDelete(selectedStage);
    }
    handleMenuClose();
  };

  const handleConfirmDeleteStage = async () => {
    if (!stageToDelete || !currentInternshipId) return;
    setDeletingStage(true);
    setLocalError('');
    try {
      await dispatch(
        deleteStageAsync({
          internshipId: currentInternshipId,
          stageId: stageToDelete.id,
          useIpr,
        })
      ).unwrap();
      setStageToDelete(null);
    } catch (e) {
      setLocalError(getApiErrorMessage(e, 'Не удалось удалить этап'));
    } finally {
      setDeletingStage(false);
    }
  };

  const openStatusDialog = (stage) => {
    if (!stage) return;
    setSelectedStage(stage);
    setNewStatus(stage.status);
    setStatusComments(stage.comments || '');
    setStatusDialogOpen(true);
    setAnchorEl(null);
  };

  const handleStatusUpdate = async () => {
    if (selectedStage && newStatus) {
      await dispatch(changeStageStatusAsync({
        internshipId: currentInternshipId,
        stageId: selectedStage.id,
        status: newStatus,
        comments: statusComments,
        useIpr,
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

  const handleReorderByOrder = async (orderedStages) => {
    if (!currentInternshipId) return;
    await dispatch(
      reorderStagesAsync({
        internshipId: currentInternshipId,
        stageIds: orderedStages.map((s) => s.id),
        useIpr,
      })
    );
  };

  const moveStage = async (stageId, direction) => {
    const idx = currentStages.findIndex((s) => s.id === stageId);
    if (idx === -1) return;
    const next = idx + direction;
    if (next < 0 || next >= currentStages.length) return;
    const reordered = [...currentStages];
    const [item] = reordered.splice(idx, 1);
    reordered.splice(next, 0, item);
    await handleReorderByOrder(reordered);
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'pending': return '#9e9e9e';
      case 'in_progress': return '#1976d2';
      case 'completed': return '#2e7d32';
      case 'delayed': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Общий прогресс
            </Typography>
            {canEdit && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => onEdit(null)}
                disabled={!currentInternshipId}
              >
                Добавить этап
              </Button>
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{ height: 10, borderRadius: 5 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {Math.round(getProgressPercentage())}% завершено
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentStages.filter(s => s.status === 'completed').length} из {currentStages.length} этапов
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {['pending', 'in_progress', 'completed', 'delayed'].map(status => {
              const count = currentStages.filter(s => s.status === status).length;
              const statusInfo = getStatusInfo(status);
              return (
                <Chip
                  key={status}
                  label={`${statusInfo.label}: ${count}`}
                  color={statusInfo.color}
                  icon={statusInfo.icon}
                  size="small"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {!currentInternshipId ? (
        <Alert severity="info">
          Выберите стажировку для просмотра дорожной карты.
        </Alert>
      ) : isLoading && currentStages.length === 0 ? (
        <Alert severity="info">Загрузка этапов...</Alert>
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
                  borderLeft: 6,
                  borderColor: getStatusBorderColor(stage.status),
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
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
                          variant="outlined"
                        />
                        {stage.isCheckpoint && (
                          <Chip
                            label="Контрольная точка"
                            color="primary"
                            icon={<Flag />}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {stage.description && (
                        <Typography variant="body2" color="text.secondary">
                          {stage.description}
                        </Typography>
                      )}
                    </Box>

                    {canEdit && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, stage)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      <Schedule sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {formatDate(stage.startDate)} – {formatDate(stage.endDate)}
                    </Typography>
                    {daysRemaining !== null && (
                      <Typography
                        variant="caption"
                        color={isOverdue ? 'error.main' : daysRemaining <= 3 ? 'warning.main' : 'text.secondary'}
                        fontWeight={isOverdue || daysRemaining <= 3 ? 700 : 400}
                      >
                        {isOverdue
                          ? `Просрочено на ${Math.abs(daysRemaining)} дн.`
                          : daysRemaining === 0
                          ? 'Завершается сегодня'
                          : `Осталось ${daysRemaining} дн.`}
                      </Typography>
                    )}
                  </Box>

                  {stage.comments && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {stage.comments}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>

                {canEdit && (
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => openStatusDialog(stage)}
                      startIcon={<Timeline />}
                    >
                      Изменить статус
                    </Button>
                    <IconButton size="small" onClick={() => moveStage(stage.id, -1)}>
                      <KeyboardArrowUp />
                    </IconButton>
                    <IconButton size="small" onClick={() => moveStage(stage.id, 1)}>
                      <KeyboardArrowDown />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            );
          })}
        </Box>
      )}

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
        <MenuItem onClick={() => openStatusDialog(selectedStage)}>
          <Timeline sx={{ mr: 1 }} />
          Изменить статус
        </MenuItem>
        <MenuItem onClick={handleDeleteStage} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

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

      <ConfirmDialog
        open={Boolean(stageToDelete)}
        title="Удаление этапа"
        message={stageToDelete ? `Удалить этап «${stageToDelete.title}»?` : ''}
        detail="Действие нельзя отменить."
        confirmLabel="Удалить"
        confirmColor="error"
        confirming={deletingStage}
        onClose={() => !deletingStage && setStageToDelete(null)}
        onConfirm={handleConfirmDeleteStage}
      />

      <Snackbar
        open={!!(error || localError)}
        autoHideDuration={4000}
        onClose={() => {
          dispatch(clearError());
          setLocalError('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            dispatch(clearError());
            setLocalError('');
          }}
          severity="error"
          sx={{ width: '100%' }}
        >
          {localError || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoadmapView;
