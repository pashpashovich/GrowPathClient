import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const MIN_LEN = 8;
const REDIRECT_AFTER_MS = 2000;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => {
    const raw = searchParams.get('token');
    if (!raw) return '';
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  }, [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return undefined;
    const id = window.setTimeout(() => {
      navigate('/login', { replace: true, state: { passwordReset: true } });
    }, REDIRECT_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Ссылка недействительна: отсутствует токен. Запросите новое письмо на странице сброса пароля.');
      return;
    }
    if (password.length < MIN_LEN) {
      setError(`Пароль должен быть не короче ${MIN_LEN} символов`);
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        (err.response?.status === 400
          ? 'Ссылка устарела или недействительна. Запросите новый сброс пароля.'
          : err.response?.status >= 500
            ? 'Сервер временно недоступен. Попробуйте позже.'
            : 'Не удалось сменить пароль. Попробуйте ещё раз.');
      setError(typeof msg === 'string' ? msg : 'Не удалось сменить пароль.');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'grey.100',
      '& fieldset': { borderWidth: 2, borderColor: 'transparent' },
      '&.Mui-focused fieldset': { borderWidth: 2 },
    },
    '& .MuiInputBase-input': { py: 2.25 },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 3,
        bgcolor: 'background.default',
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
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          {success ? (
            <>
              <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
                Готово
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                Пароль успешно изменён. Сейчас вы будете перенаправлены на страницу входа.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Перенаправление…</Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h2" component="h1" sx={{ mb: 1.25 }}>
                Новый пароль
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                Придумайте новый пароль и введите его дважды.
              </Typography>

              {!token && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  В ссылке нет токена. Откройте ссылку из письма или{' '}
                  <Link component={RouterLink} to="/forgot-password" fontWeight={600}>
                    запросите сброс пароля
                  </Link>{' '}
                  заново.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box>
              <Typography
                component="label"
                htmlFor="reset-password"
                variant="caption"
                sx={{ display: 'block', color: 'grey.600', mb: 1 }}
              >
                Новый пароль
              </Typography>
              <TextField
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                placeholder={`Не менее ${MIN_LEN} символов`}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'grey.600', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Скрыть' : 'Показать'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
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
                htmlFor="reset-password-confirm"
                variant="caption"
                sx={{ display: 'block', color: 'grey.600', mb: 1 }}
              >
                Повторите пароль
              </Typography>
              <TextField
                id="reset-password-confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading || !token}
                placeholder="Тот же пароль ещё раз"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'grey.600', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirm ? 'Скрыть' : 'Показать'}
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        size="small"
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
              disabled={loading || !token}
              sx={{ py: 2.25, typography: 'h3', fontWeight: 600, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить пароль'}
            </Button>
          </Box>
            </>
          )}
        </Paper>

        {!success && (
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.7 }}>
              Вспомнили пароль?{' '}
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
        )}
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
