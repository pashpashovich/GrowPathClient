import React, { useState, useEffect } from 'react';
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
import {
  Lock,
  Visibility,
  VisibilityOff,
  Mail,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync } from '../store/slices/authSlice';
import { getNormalizedRole } from '../utils/resolveAppRole';
import Logo from './Logo';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error: authError } = useSelector((state) => state.auth);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  useEffect(() => {
    const s = location.state;
    if (!s?.registrationComplete && !s?.passwordReset) return;
    if (s.registrationComplete) setRegistrationSuccess(true);
    if (s.passwordReset) setPasswordResetSuccess(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const result = await dispatch(
        loginAsync({
          username: formData.email,
          password: formData.password,
        })
      );

      if (loginAsync.fulfilled.match(result)) {
        const user = result.payload.user;
        const resolvedRole = getNormalizedRole(user);
        if (resolvedRole === 'mentor') {
          navigate('/mentor');
        } else if (resolvedRole === 'intern') {
          navigate('/intern');
        } else if (resolvedRole === 'hr') {
          navigate('/hr');
        } else if (resolvedRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setLocalError(result.payload || 'Неверный email или пароль');
      }
    } catch (err) {
      setLocalError('Произошла ошибка при авторизации');
    }
  };

  const error = localError || authError;
  const loading = isLoading;

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
              Войти в аккаунт
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Добро пожаловать в портал управления стажировками
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {registrationSuccess && (
              <Alert severity="success" onClose={() => setRegistrationSuccess(false)}>
                Регистрация завершена. Войдите с указанным в письме email и новым паролем.
              </Alert>
            )}
            {passwordResetSuccess && (
              <Alert severity="success" onClose={() => setPasswordResetSuccess(false)}>
                Пароль успешно изменён. Войдите, используя новый пароль.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography
                component="label"
                htmlFor="login-email"
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'grey.600',
                  mb: 1,
                }}
              >
                Электронная почта или логин
              </Typography>
              <TextField
                id="login-email"
                name="email"
                fullWidth
                type="text"
                autoComplete="username"
                placeholder="ivanov@company.ru"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                sx={getFieldSx()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                      <Mail sx={{ color: 'grey.600', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  gap: 1,
                }}
              >
                <Typography
                  component="label"
                  htmlFor="login-password"
                  variant="caption"
                  sx={{ color: 'grey.600' }}
                >
                  Пароль
                </Typography>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Забыли пароль?
                </Link>
              </Box>
              <TextField
                id="login-password"
                name="password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
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
                        onClick={handleTogglePasswordVisibility}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || !formData.email || !formData.password}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.7 }}>
            Нет учетной записи?{' '}
            <Link
              component={RouterLink}
              to="/contact-hr"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Свяжитесь с HR отделом
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
