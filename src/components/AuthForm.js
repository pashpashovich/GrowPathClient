import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setTokens } from '../store/slices/authSlice';

const AuthForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Моковые данные для авторизации
  const mockUsers = {
    'mentor@example.com': {
      password: 'mentor123',
      user: {
        id: 'mentor-1',
        name: 'Алексей Менторов',
        email: 'mentor@example.com',
        role: 'mentor',
        department: 'Разработка',
        avatar: null,
      },
      tokens: {
        accessToken: 'mock-access-token-mentor',
        refreshToken: 'mock-refresh-token-mentor',
      }
    },
    'intern@example.com': {
      password: 'intern123',
      user: {
        id: 'intern-1',
        name: 'Иван Стажеров',
        email: 'intern@example.com',
        role: 'intern',
        department: 'Frontend',
        avatar: null,
      },
      tokens: {
        accessToken: 'mock-access-token-intern',
        refreshToken: 'mock-refresh-token-intern',
      }
    },
    'hr@example.com': {
      password: 'hr123',
      user: {
        id: 'hr-1',
        name: 'Мария HR',
        email: 'hr@example.com',
        role: 'hr',
        department: 'HR',
        avatar: null,
      },
      tokens: {
        accessToken: 'mock-access-token-hr',
        refreshToken: 'mock-refresh-token-hr',
      }
    },
    'admin@example.com': {
      password: 'admin123',
      user: {
        id: 'admin-1',
        name: 'Админ Админов',
        email: 'admin@example.com',
        role: 'admin', // Админ имеет свою роль
        department: 'Управление',
        avatar: null,
      },
      tokens: {
        accessToken: 'mock-access-token-admin',
        refreshToken: 'mock-refresh-token-admin',
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = mockUsers[formData.email];
      
      if (!userData || userData.password !== formData.password) {
        setError('Неверный email или пароль');
        setLoading(false);
        return;
      }

      // Сохраняем данные пользователя и токены в Redux
      dispatch(setUser(userData.user));
      dispatch(setTokens(userData.tokens));

      // Перенаправляем в зависимости от роли
      if (userData.user.role === 'mentor') {
        navigate('/mentor');
      } else if (userData.user.role === 'intern') {
        navigate('/intern');
      } else if (userData.user.role === 'hr') {
        navigate('/mentor'); // HR пока использует менторский интерфейс
      } else if (userData.user.role === 'admin') {
        navigate('/mentor'); // Админ пока использует менторский интерфейс
      } else {
        navigate('/mentor'); // По умолчанию для других ролей
      }

    } catch (err) {
      setError('Произошла ошибка при авторизации');
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
        backgroundColor: '#f5f5f5',
        px: 2,
      }}
    >
      {/* Заголовок */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 1,
          }}
        >
          Войдите
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#7f8c8d',
            fontWeight: 400,
          }}
        >
          В свой аккаунт
        </Typography>
      </Box>

      {/* Форма */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: 2,
          p: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Email поле */}
        <TextField
          fullWidth
          type="email"
          label="E-mail"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={loading}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#f8f9fa',
              '& fieldset': {
                borderColor: '#e9ecef',
              },
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#6c757d',
              '&.Mui-focused': {
                color: '#007bff',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: '#6c757d' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Пароль поле */}
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          disabled={loading}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#f8f9fa',
              '& fieldset': {
                borderColor: '#e9ecef',
              },
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#6c757d',
              '&.Mui-focused': {
                color: '#007bff',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: '#6c757d' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Кнопка входа */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !formData.email || !formData.password}
          sx={{
            py: 1.5,
            borderRadius: 1,
            backgroundColor: '#2c3e50',
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#34495e',
            },
            '&:disabled': {
              backgroundColor: '#6c757d',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Войти'
          )}
        </Button>

        {/* Подсказка для тестирования */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Тестовые аккаунты:
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • mentor@example.com / mentor123 (Ментор)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • intern@example.com / intern123 (Стажер)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • hr@example.com / hr123 (HR менеджер)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • admin@example.com / admin123 (Админ)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
