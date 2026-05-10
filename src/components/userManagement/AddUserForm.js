import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createUserAsync } from '../../store/slices/userManagementSlice';
import { departmentAPI } from '../../services/api';

const AddUserForm = ({ open, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymicName: '',
    email: '',
    role: 'intern',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

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

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.role) {
      newErrors.role = 'Выберите роль';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Выберите департамент';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const patronymic = formData.patronymicName.trim();
    const payload = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      role: formData.role,
      departmentId: parseInt(formData.departmentId, 10),
    };
    if (patronymic) {
      payload.patronymicName = patronymic;
    }

    const result = await dispatch(createUserAsync(payload));

    if (createUserAsync.fulfilled.match(result)) {
      setFormData({
        firstName: '',
        lastName: '',
        patronymicName: '',
        email: '',
        role: 'intern',
        departmentId: '',
      });
      setErrors({});
      onClose();
      if (onSuccess) {
        onSuccess('Пользователь успешно создан');
      }
    } else {
      setSubmitError(result.payload || 'Не удалось создать пользователя');
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '',
        lastName: '',
        patronymicName: '',
        email: '',
        role: 'intern',
        departmentId: '',
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
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            Новый пользователь будет создан со статусом "Ожидает активации". 
            Приглашение будет отправлено автоматически.
          </Alert>

          <TextField
            fullWidth
            label="Фамилия"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Имя"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Отчество"
            value={formData.patronymicName}
            onChange={(e) => handleInputChange('patronymicName', e.target.value)}
            margin="normal"
            helperText="Необязательно"
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
              <MenuItem value="department_head">Руководитель отдела</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Департамент</InputLabel>
            <Select
              value={formData.departmentId}
              label="Департамент"
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              error={!!errors.departmentId}
              disabled={loadingDepartments}
            >
              {loadingDepartments ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Загрузка...
                </MenuItem>
              ) : departments.length === 0 ? (
                <MenuItem disabled>Нет доступных департаментов</MenuItem>
              ) : (
                departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.departmentId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.departmentId}
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
