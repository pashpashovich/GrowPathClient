import React, { useState, useEffect } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Button, Paper } from '@mui/material';
import { Logout, Add } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { setPrograms } from '../store/slices/internshipProgramSlice';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import HRRatingPage from './HRRatingPage';
import InternshipProgramsList from '../components/internshipPrograms/InternshipProgramsList';
import InternshipProgramForm from '../components/internshipPrograms/InternshipProgramForm';
import InternshipProgramDetails from '../components/internshipPrograms/InternshipProgramDetails';
import AnalyticsPage from './AnalyticsPage';

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const programs = useSelector((state) => state.internshipProgram.programs);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [isProgramDetailsOpen, setIsProgramDetailsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [viewingProgram, setViewingProgram] = useState(null);

  // Инициализация программ стажировок при загрузке
  useEffect(() => {
    if (programs.length === 0) {
      // Программы уже инициализированы в slice, но можно добавить дополнительную логику
      console.log('HR Dashboard loaded, programs:', programs.length);
    }
  }, [programs.length]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateProgram = () => {
    setEditingProgram(null);
    setIsProgramFormOpen(true);
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setIsProgramFormOpen(true);
  };

  const handleViewProgram = (program) => {
    setViewingProgram(program);
    setIsProgramDetailsOpen(true);
  };

  const getCurrentPage = () => {
    if (location.pathname === '/hr/rating') {
      return <HRRatingPage />;
    }
    
    if (location.pathname === '/hr/analytics') {
      return <AnalyticsPage />;
    }
    
    return (
      <Box>
        {/* Панель управления */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              Программы стажировок
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateProgram}
            >
              Создать программу
            </Button>
          </Box>
        </Paper>

        {/* Список программ */}
        <InternshipProgramsList
          onEdit={handleEditProgram}
          onView={handleViewProgram}
        />
      </Box>
    );
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
          {/* Основной контент */}
          <Box sx={{ py: 3, px: 3, overflowX: 'auto' }}>
            {getCurrentPage()}
          </Box>
        </Box>
      </Box>

      {/* Форма создания/редактирования программы */}
      <InternshipProgramForm
        open={isProgramFormOpen}
        onClose={() => setIsProgramFormOpen(false)}
        programToEdit={editingProgram}
      />

      {/* Детальный просмотр программы */}
      <InternshipProgramDetails
        open={isProgramDetailsOpen}
        onClose={() => setIsProgramDetailsOpen(false)}
        program={viewingProgram}
      />
    </Box>
  );
};

export default HRDashboard;



