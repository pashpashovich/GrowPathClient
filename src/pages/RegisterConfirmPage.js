import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';

const fieldSx = {
  mb: 3,
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: '#f5f5f5',
    height: '56px',
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    padding: '16px 14px',
    fontSize: '16px',
    '&::placeholder': { color: '#999', opacity: 1 },
  },
};

const MIN_PASSWORD_LENGTH = 8;

const RegisterConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Ссылка недействительна: отсутствует токен. Запросите новое приглашение.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await authAPI.completeRegistration({ token, newPassword: password });
      navigate('/login', { replace: true, state: { registrationComplete: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Не удалось завершить регистрацию';
      setError(typeof msg === 'string' ? msg : 'Не удалось завершить регистрацию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        px: 2,
      }}
    >
      <Box sx={{ mb: 5, textAlign: 'center', width: '100%', maxWidth: 420 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 'bold', color: '#000', mb: 1, fontSize: { xs: '1.85rem', sm: '2.5rem' } }}
        >
          Завершение регистрации
        </Typography>
        <Typography variant="h6" sx={{ color: '#000', fontWeight: 400, fontSize: '1.05rem' }}>
          Придумайте пароль для входа в GrowPath
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 420 }}>
        {!token && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            В ссылке нет токена. Откройте страницу из письма с приглашением или{' '}
            <Link component={RouterLink} to="/login">
              перейдите ко входу
            </Link>
            .
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="Пароль"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          disabled={loading || !token}
          autoComplete="new-password"
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <Lock sx={{ color: '#000', fontSize: '20px' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 1 }}>
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  disabled={loading}
                  sx={{ color: '#000' }}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type={showConfirm ? 'text' : 'password'}
          label="Подтвердите пароль"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          disabled={loading || !token}
          autoComplete="new-password"
          sx={{ ...fieldSx, mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <Lock sx={{ color: '#000', fontSize: '20px' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 1 }}>
                <IconButton
                  onClick={() => setShowConfirm((v) => !v)}
                  edge="end"
                  disabled={loading}
                  sx={{ color: '#000' }}
                  aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !token || !password || !confirmPassword}
          sx={{
            py: 2,
            borderRadius: 3,
            backgroundColor: '#1976d2',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'none',
            height: '56px',
            '&:hover': { backgroundColor: '#1565c0' },
            '&:disabled': { backgroundColor: '#ccc', color: '#666' },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить пароль и войти'}
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
              Войти
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterConfirmPage;
