import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Mail, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';

const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Укажите электронную почту');
      return;
    }
    if (!emailValid(email)) {
      setError('Введите корректный адрес email');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        (err.response?.status >= 500
          ? 'Сервер временно недоступен. Попробуйте позже.'
          : 'Не удалось отправить запрос. Попробуйте ещё раз.');
      setError(typeof msg === 'string' ? msg : 'Не удалось отправить запрос.');
    } finally {
      setLoading(false);
    }
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
          <Typography variant="h2" component="h1" sx={{ mb: 1.25 }}>
            Сброс пароля
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Введите email, указанный при регистрации. Мы отправим ссылку для установки нового пароля.
          </Typography>

          {done ? (
            <Alert severity="success">
              Если этот адрес есть в системе, на него отправлено письмо со ссылкой. Проверьте почту и папку
              «Спам».
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <Box>
                <Typography
                  component="label"
                  htmlFor="forgot-email"
                  variant="caption"
                  sx={{ display: 'block', color: 'grey.600', mb: 1 }}
                >
                  Электронная почта
                </Typography>
                <TextField
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  placeholder="ivanov@company.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail sx={{ color: 'grey.600', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'grey.100',
                      '& fieldset': { borderWidth: 2, borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderWidth: 2 },
                    },
                    '& .MuiInputBase-input': { py: 2.25 },
                  }}
                />
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ py: 2.25, typography: 'h3', fontWeight: 600, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Отправить ссылку'}
              </Button>
            </Box>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" fontWeight={600}>
            Войти в аккаунт
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
