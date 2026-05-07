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
  Paper,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';

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

  const getFieldSx = (extra = {}) => ({
    ...extra,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'grey.100',
      pl: 0.5,
      '& fieldset': {
        borderWidth: 2,
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: 'transparent',
      },
      '&.Mui-focused fieldset': {
        borderWidth: 2,
      },
    },
    '& .MuiInputBase-input': {
      typography: 'body2',
      py: 2.25,
      '&::placeholder': {
        color: 'grey.600',
        opacity: 1,
      },
    },
  });

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 2,
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.03,
            filter: 'blur(120px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '5%',
            right: '5%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.03,
            filter: 'blur(100px)',
          }}
        />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 448, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1,
              color: 'primary.main',
            }}
          >
            <Logo size="large" />
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h2" component="h1" sx={{ mb: 1.25 }}>
              Завершение регистрации
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Придумайте пароль для входа в GrowPath
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!token && (
              <Alert severity="warning">
                В ссылке нет токена. Откройте страницу из письма с приглашением или{' '}
                <Link component={RouterLink} to="/login">
                  перейдите ко входу
                </Link>
                .
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography
                component="label"
                htmlFor="register-password"
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'grey.600',
                  mb: 1,
                }}
              >
                Пароль
              </Typography>
              <TextField
                id="register-password"
                name="password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                disabled={loading || !token}
                sx={getFieldSx()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                      <Lock sx={{ color: 'grey.600', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 0.5 }}>
                      <IconButton
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        disabled={loading}
                        size="small"
                        sx={{
                          color: 'grey.600',
                          '&:hover': { color: 'text.primary' },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="register-confirm-password"
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'grey.600',
                  mb: 1,
                }}
              >
                Подтвердите пароль
              </Typography>
              <TextField
                id="register-confirm-password"
                name="confirmPassword"
                fullWidth
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                disabled={loading || !token}
                sx={getFieldSx()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                      <Lock sx={{ color: 'grey.600', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 0.5 }}>
                      <IconButton
                        aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        disabled={loading}
                        size="small"
                        sx={{
                          color: 'grey.600',
                          '&:hover': { color: 'text.primary' },
                        }}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || !token || !password || !confirmPassword}
              sx={{
                mt: 0.5,
                py: 2.25,
                typography: 'h3',
                borderRadius: 2,
                boxShadow: 1,
                transition: 'transform 0.15s ease, filter 0.15s ease',
                '&:hover:not(:disabled)': {
                  filter: 'brightness(1.1)',
                },
                '&:active:not(:disabled)': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить пароль и войти'}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.7 }}>
            Уже есть аккаунт?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Войти
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterConfirmPage;
