import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addUser } from '../../store/slices/userManagementSlice';

const AddUserForm = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'intern',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.role) {
      newErrors.role = 'Выберите роль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch(addUser({
        ...formData,
        invitedBy: 'current-admin-id',
        invitationSentAt: new Date().toISOString(),
      }));

      setFormData({
        name: '',
        email: '',
        role: 'intern',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        role: 'intern',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить нового пользователя</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Новый пользователь будет создан со статусом "Ожидает активации". 
            Приглашение будет отправлено автоматически.
          </Alert>

          <TextField
            fullWidth
            label="ФИО"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Роль</InputLabel>
            <Select
              value={formData.role}
              label="Роль"
              onChange={(e) => handleInputChange('role', e.target.value)}
              error={!!errors.role}
            >
              <MenuItem value="mentor">Ментор</MenuItem>
              <MenuItem value="intern">Стажер</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Создание...' : 'Создать пользователя'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserForm;
