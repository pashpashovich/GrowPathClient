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
        navigate('/hr'); // HR перенаправляется на свой дашборд
      } else if (userData.user.role === 'admin') {
        navigate('/admin'); // Админ перенаправляется на свой дашборд
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
        backgroundColor: 'white',
        px: 2,
      }}
    >
      {/* Заголовок формы */}
      <Box sx={{ mb: 6, textAlign: 'center', width: '100%', maxWidth: 400 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#000',
            mb: 1,
            fontSize: '2.5rem',
          }}
        >
          Войдите
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#000',
            fontWeight: 400,
            fontSize: '1.1rem',
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
          placeholder="@ E-mail"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={loading}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
              height: '56px',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '16px 14px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <Typography sx={{ color: '#000', fontSize: '18px', fontWeight: 'bold' }}>
                  @
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        {/* Пароль поле */}
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          disabled={loading}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
              height: '56px',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '16px 14px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <Lock sx={{ color: '#000', fontSize: '20px' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 1 }}>
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  disabled={loading}
                  sx={{ color: '#000' }}
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
            py: 2,
            borderRadius: 3,
            backgroundColor: '#1976d2',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'none',
            height: '56px',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666',
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
        <Box sx={{ mt: 4, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="#666" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>
            Тестовые аккаунты:
          </Typography>
          <Typography variant="caption" color="#666" display="block" sx={{ fontSize: '12px' }}>
            • mentor@example.com / mentor123 (Ментор)
          </Typography>
          <Typography variant="caption" color="#666" display="block" sx={{ fontSize: '12px' }}>
            • intern@example.com / intern123 (Стажер)
          </Typography>
          <Typography variant="caption" color="#666" display="block" sx={{ fontSize: '12px' }}>
            • hr@example.com / hr123 (HR менеджер)
          </Typography>
          <Typography variant="caption" color="#666" display="block" sx={{ fontSize: '12px' }}>
            • admin@example.com / admin123 (Админ)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
