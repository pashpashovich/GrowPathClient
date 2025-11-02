import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addStage, updateStage } from '../../store/slices/roadmapSlice';

const StageForm = ({ open, onClose, stageToEdit }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { currentInternshipId } = useSelector((state) => state.roadmap);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    isCheckpoint: false,
    comments: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (stageToEdit) {
      setFormData({
        title: stageToEdit.title || '',
        description: stageToEdit.description || '',
        startDate: stageToEdit.startDate ? new Date(stageToEdit.startDate).toISOString().split('T')[0] : '',
        endDate: stageToEdit.endDate ? new Date(stageToEdit.endDate).toISOString().split('T')[0] : '',
        priority: stageToEdit.priority || 'medium',
        isCheckpoint: stageToEdit.isCheckpoint || false,
        comments: stageToEdit.comments || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        isCheckpoint: false,
        comments: '',
      });
    }
    setErrors({});
  }, [stageToEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название этапа обязательно';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Описание этапа обязательно';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Дата завершения обязательна';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Дата завершения не может быть раньше даты начала';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (stageToEdit) {
        const updatedStage = {
          ...stageToEdit,
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          priority: formData.priority,
          isCheckpoint: formData.isCheckpoint,
          comments: formData.comments,
        };

        dispatch(updateStage({
          ...updatedStage,
          internshipId: currentInternshipId,
        }));
      } else {
        const newStage = {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          priority: formData.priority,
          isCheckpoint: formData.isCheckpoint,
          comments: formData.comments,
          status: 'pending',
          createdBy: currentUser?.id || 'mentor-1',
          internshipId: currentInternshipId,
        };

        dispatch(addStage(newStage));
      }

      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        isCheckpoint: false,
        comments: '',
      });
      setErrors({});

      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'medium',
      isCheckpoint: false,
      comments: '',
    });
    setErrors({});
    onClose();
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {stageToEdit ? 'Редактировать этап' : 'Добавить этап'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Название этапа */}
          <TextField
            label="Название этапа"
            fullWidth
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* Описание */}
          <TextField
            label="Описание этапа"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Даты */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Дата начала"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />
            <TextField
              label="Дата завершения"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              error={!!errors.endDate}
              helperText={errors.endDate}
            />
          </Box>

          {/* Приоритет */}
          <FormControl fullWidth error={!!errors.priority}>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={formData.priority}
              label="Приоритет"
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
            {errors.priority && <Typography color="error" variant="caption">{errors.priority}</Typography>}
          </FormControl>

          {/* Контрольная точка */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isCheckpoint}
                onChange={(e) => handleInputChange('isCheckpoint', e.target.checked)}
              />
            }
            label="Контрольная точка"
          />

          {/* Комментарии */}
          <TextField
            label="Комментарии"
            fullWidth
            multiline
            rows={2}
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            placeholder="Дополнительные заметки по этапу..."
          />

          {/* Предварительный просмотр */}
          {formData.title && (
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Предварительный просмотр:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6">{formData.title}</Typography>
                <Chip
                  label={getPriorityLabel(formData.priority)}
                  color={getPriorityColor(formData.priority)}
                  size="small"
                />
                {formData.isCheckpoint && (
                  <Chip label="Контрольная точка" color="primary" size="small" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formData.description}
              </Typography>
              {formData.startDate && formData.endDate && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(formData.startDate).toLocaleDateString('ru-RU')} - {new Date(formData.endDate).toLocaleDateString('ru-RU')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained">
          {stageToEdit ? 'Сохранить изменения' : 'Добавить этап'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StageForm;
