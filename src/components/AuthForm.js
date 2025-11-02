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
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync } from '../store/slices/authSlice';

const AuthForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error: authError } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      const result = await dispatch(loginAsync({
        username: formData.email,
        password: formData.password,
      }));

      if (loginAsync.fulfilled.match(result)) {
        const user = result.payload.user;
        const role = user?.role;

        if (role === 'mentor') {
          navigate('/mentor');
        } else if (role === 'intern') {
          navigate('/intern');
        } else if (role === 'hr') {
          navigate('/hr');
        } else if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/mentor');
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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

      </Box>
    </Box>
  );
};

export default AuthForm;
