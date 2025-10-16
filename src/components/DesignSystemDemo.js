import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Paper,
  TextField,
  Button as MuiButton,
} from '@mui/material';
import { Search, Email, Lock, Person, Business } from '@mui/icons-material';

const DesignSystemDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [departmentValue, setDepartmentValue] = useState('');

  const tableColumns = [
    { field: 'name', headerName: 'Стажер', type: 'avatar' },
    { field: 'rating', headerName: 'Рейтинг', type: 'rating' },
    { field: 'experience', headerName: 'Опыт', type: 'experience' },
    { field: 'position', headerName: 'Должность' },
    { field: 'mentor', headerName: 'Ментор' },
    { field: 'actions', headerName: 'Действия', type: 'actions' },
  ];

  const tableData = [
    {
      id: 1,
      name: 'Иван Иванов',
      rating: 9.0,
      experience: 2,
      position: 'Java разработчик',
      mentor: 'Иван Иванов',
      avatar: '',
    },
    {
      id: 2,
      name: 'Петр Петров',
      rating: 7.6,
      experience: 5,
      position: 'ML инженер',
      mentor: 'Иван Иванов',
      avatar: '',
    },
    {
      id: 3,
      name: 'Анна Сидорова',
      rating: 9.4,
      experience: 3,
      position: 'QA тестировщик',
      mentor: 'Иван Иванов',
      avatar: '',
    },
    {
      id: 4,
      name: 'Мария Козлова',
      rating: 5.6,
      experience: 1,
      position: 'Frontend разработчик',
      mentor: 'Иван Иванов',
      avatar: '',
    },
  ];

  const departmentOptions = [
    { value: 'development', label: 'Разработка' },
    { value: 'qa', label: 'Тестирование' },
    { value: 'design', label: 'Дизайн' },
    { value: 'marketing', label: 'Маркетинг' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>
        GrowPath Design System
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Демонстрация компонентов с использованием Material-UI и Redux
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Кнопки
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <MuiButton variant="contained" size="small">Сохранить</MuiButton>
          </Grid>
          <Grid item>
            <MuiButton variant="contained" size="medium">Войти</MuiButton>
          </Grid>
          <Grid item>
            <MuiButton variant="contained" size="large">Большая кнопка</MuiButton>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <MuiButton variant="outlined">Вторичная</MuiButton>
          </Grid>
          <Grid item>
            <MuiButton variant="outlined" color="primary">Контурная</MuiButton>
          </Grid>
          <Grid item>
            <MuiButton variant="contained" color="success">Успех</MuiButton>
          </Grid>
          <Grid item>
            <MuiButton variant="contained" color="error">Опасность</MuiButton>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <MuiButton variant="contained" disabled>Отключена</MuiButton>
          </Grid>
        </Grid>
        
        <MuiButton variant="contained" fullWidth sx={{ mb: 2 }}>
          Полная ширина
        </MuiButton>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Поля ввода
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Имя"
              placeholder="Введите ваше имя"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              type="email"
              label="E-mail"
              placeholder="example@email.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              required
              fullWidth
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Поиск стажера"
              placeholder="Искать стажера"
              fullWidth
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Выберите департамент"
              value={departmentValue}
              onChange={(e) => setDepartmentValue(e.target.value)}
              fullWidth
            >
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Поле с ошибкой"
              placeholder="Должен включать минимум 8 символов"
              value={errorValue}
              onChange={(e) => setErrorValue(e.target.value)}
              error
              helperText="Должен включать минимум 8 символов"
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Отключенное поле"
              placeholder="Это поле отключено"
              disabled
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Типографика
        </Typography>
        
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h1" gutterBottom>
              Заголовок H1 - Montserrat 30px Bold
            </Typography>
            <Typography variant="h2" gutterBottom>
              Заголовок H2 - Montserrat 24px Bold
            </Typography>
            <Typography variant="h3" gutterBottom>
              Заголовок H3 - Montserrat 20px Semibold
            </Typography>
            <Typography variant="h4" gutterBottom>
              Заголовок H4 - Montserrat 18px Semibold
            </Typography>
            <Typography variant="h5" gutterBottom>
              Заголовок H5 - Montserrat 16px Semibold
            </Typography>
            <Typography variant="h6" gutterBottom>
              Заголовок H6 - Montserrat 14px Semibold
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Размеры текста
            </Typography>
            <Typography variant="h6" gutterBottom>
              Большой текст - Source Sans Pro 18px
            </Typography>
            <Typography variant="body1" gutterBottom>
              Основной текст - Source Sans Pro 16px
            </Typography>
            <Typography variant="body2" gutterBottom>
              Малый текст - Source Sans Pro 14px
            </Typography>
            <Typography variant="caption" display="block">
              Очень малый текст - Source Sans Pro 12px
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Цветовая палитра
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#1A7AE0', color: 'white', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Primary Blue<br/>#1A7AE0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#92C0FA', color: '#212121', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Light Blue<br/>#92C0FA
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#31F0A4', color: '#212121', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Bright Green<br/>#31F0A4
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#99E6D8', color: '#212121', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Light Green<br/>#99E6D8
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#F6F7F9', color: '#212121', border: '1px solid #E0E0E0', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Off-white<br/>#F6F7F9
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#212121', color: 'white', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                Dark Gray<br/>#212121
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Цвета рейтингов
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Высокий рейтинг 9.0" 
              sx={{ 
                backgroundColor: '#31F0A4', 
                color: '#212121',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Средний рейтинг 7.6" 
              sx={{ 
                backgroundColor: '#FFC107', 
                color: '#212121',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Низкий рейтинг 5.6" 
              sx={{ 
                backgroundColor: '#FF5252', 
                color: 'white',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Цвета опыта
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Начинающий 2 мес" 
              sx={{ 
                backgroundColor: '#92C0FA', 
                color: '#212121',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Средний 5 мес" 
              sx={{ 
                backgroundColor: '#FF9800', 
                color: 'white',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Chip 
              label="Продвинутый 3 мес" 
              sx={{ 
                backgroundColor: '#31F0A4', 
                color: '#212121',
                fontWeight: 'bold',
                width: '100%',
                height: '48px'
              }} 
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Таблица стажеров
        </Typography>
        
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {tableData.map((intern) => (
                <Grid item xs={12} sm={6} md={4} key={intern.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Avatar />
                        <Typography variant="h6">{intern.name}</Typography>
                      </Box>
                      <Chip 
                        label={`Рейтинг: ${intern.rating}`}
                        sx={{ 
                          backgroundColor: intern.rating >= 8 ? '#31F0A4' : intern.rating >= 6 ? '#FFC107' : '#FF5252',
                          color: intern.rating >= 6 ? '#212121' : 'white',
                          mb: 1
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {intern.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ментор: {intern.mentor}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DesignSystemDemo;

