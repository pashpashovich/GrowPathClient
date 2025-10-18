import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import HRRatingPage from './HRRatingPage';

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box>
      {/* Глобальный хедер */}
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Logo size="medium" />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Выйти"
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', mt: 8 }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: sidebarOpen ? '280px' : '80px',
            transition: 'margin-left 0.3s ease',
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#f5f5f5',
          }}
        >
          {/* Верхняя панель */}
          <Box sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            mt: 2
          }}>
            <Typography variant="h6" component="div">
              Рейтинг стажеров
            </Typography>
          </Box>

          {/* Основной контент */}
          <Box sx={{ py: 3, px: 3, overflowX: 'auto' }}>
            <HRRatingPage />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HRDashboard;

