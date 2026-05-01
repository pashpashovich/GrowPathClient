import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useDispatch } from 'react-redux';
import { logoutAsync } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import Sidebar from '../components/Sidebar';
import UserManagementTable from '../components/userManagement/UserManagementTable';
import AddUserForm from '../components/userManagement/AddUserForm';
import ProfilePage from './ProfilePage';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  };

  const handleAddUser = () => {
    setIsAddUserFormOpen(true);
  };

  const getCurrentPage = () => {
    if (location.pathname === '/admin/settings') {
      return (
        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Настройки системы
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будут настройки системы (в разработке)
          </Typography>
        </Paper>
      );
    }

    if (location.pathname === '/admin' || location.pathname === '/admin/profile') {
      return <ProfilePage />;
    }

    return <UserManagementTable onAddUser={handleAddUser} />;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardAppBar onLogout={handleLogout} />

      <Box sx={{ display: 'flex', mt: `${DASHBOARD_APP_BAR_HEIGHT}px`, flex: 1, width: '100%' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: sidebarOpen ? '280px' : '80px',
            transition: 'margin-left 0.3s ease',
            p: { xs: 2, md: 4 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>{getCurrentPage()}</Box>
        </Box>
      </Box>

      <AddUserForm open={isAddUserFormOpen} onClose={() => setIsAddUserFormOpen(false)} />
    </Box>
  );
};

export default AdminDashboard;
