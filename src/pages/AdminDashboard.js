import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Logout,
  PersonAdd,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAsync } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import UserManagementTable from '../components/userManagement/UserManagementTable';
import AddUserForm from '../components/userManagement/AddUserForm';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/');
  };

  const handleAddUser = () => {
    setIsAddUserFormOpen(true);
  };

  const getCurrentPage = () => {
    if (location.pathname === '/admin/settings') {
      return (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Настройки системы
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будут настройки системы (в разработке)
          </Typography>
        </Paper>
      );
    }
    
    return <UserManagementTable />;
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin/settings') {
      return 'Настройки системы';
    }
    return 'Управление пользователями';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Боковое меню */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Основной контент */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flexGrow: 1,
        ml: '80px', // Отступ для бокового меню
      }}>
        {/* Глобальный заголовок */}
        <AppBar position="fixed" sx={{ zIndex: 1300, ml: '80px', width: 'calc(100% - 80px)' }}>
          <Toolbar>
            <Logo size="small" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
              Панель администратора
            </Typography>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </Toolbar>
        </AppBar>

        {/* Контент с отступом для заголовка */}
        <Box sx={{ 
          mt: 8, // Отступ для фиксированного заголовка
          p: 3,
        }}>
          {/* Панель управления */}
          {location.pathname === '/admin' && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1">
                  {getPageTitle()}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleAddUser}
                >
                  Добавить пользователя
                </Button>
              </Box>
            </Paper>
          )}

          {/* Контент страницы */}
          {getCurrentPage()}
        </Box>
      </Box>

      {/* Форма добавления пользователя */}
      <AddUserForm
        open={isAddUserFormOpen}
        onClose={() => setIsAddUserFormOpen(false)}
      />
    </Box>
  );
};

export default AdminDashboard;
