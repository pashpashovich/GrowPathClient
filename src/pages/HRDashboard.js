import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutAsync } from '../store/slices/authSlice';
import {
  fetchInternshipProgramsAsync,
  fetchInternshipProgramByIdAsync,
} from '../store/slices/internshipProgramSlice';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import Sidebar from '../components/Sidebar';
import HRRatingPage from './HRRatingPage';
import InternshipProgramsList from '../components/internshipPrograms/InternshipProgramsList';
import InternshipProgramForm from '../components/internshipPrograms/InternshipProgramForm';
import InternshipProgramDetails from '../components/internshipPrograms/InternshipProgramDetails';
import AnalyticsPage from './AnalyticsPage';
import ProfilePage from './ProfilePage';
import MailingsPage from './MailingsPage';
import HRMentorsPage from './HRMentorsPage';
import HRInternsPage from './HRInternsPage';

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [isProgramDetailsOpen, setIsProgramDetailsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [viewingProgram, setViewingProgram] = useState(null);

  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
  const isProgramsTab = normalizedPath === '/hr';
  const shouldLoadProgramList =
    isProgramsTab ||
    location.pathname.startsWith('/hr/programs') ||
    location.pathname.startsWith('/hr/rating') ||
    location.pathname.startsWith('/hr/analytics') ||
    location.pathname.startsWith('/hr/mentors') ||
    location.pathname.startsWith('/hr/interns');

  useEffect(() => {
    if (shouldLoadProgramList) {
      dispatch(
        fetchInternshipProgramsAsync({
          page: 1,
          limit: 100,
          includeArchived: false,
        })
      );
    }
  }, [dispatch, shouldLoadProgramList]);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  };

  const handleCreateProgram = () => {
    setEditingProgram(null);
    setIsProgramFormOpen(true);
  };

  const handleEditProgram = async (program) => {
    const result = await dispatch(fetchInternshipProgramByIdAsync(program.id));
    if (fetchInternshipProgramByIdAsync.fulfilled.match(result)) {
      setEditingProgram(result.payload);
    } else {
      setEditingProgram(program);
    }
    setIsProgramFormOpen(true);
  };

  const handleViewProgram = async (program) => {
    const result = await dispatch(fetchInternshipProgramByIdAsync(program.id));
    if (fetchInternshipProgramByIdAsync.fulfilled.match(result)) {
      setViewingProgram(result.payload);
    } else {
      setViewingProgram(program);
    }
    setIsProgramDetailsOpen(true);
  };

  const getCurrentPage = () => {
    if (location.pathname.startsWith('/hr/rating')) {
      return <HRRatingPage />;
    }

    if (location.pathname.startsWith('/hr/analytics')) {
      return <AnalyticsPage />;
    }

    if (location.pathname.startsWith('/hr/mailings')) {
      return <MailingsPage />;
    }

    if (location.pathname.startsWith('/hr/mentors')) {
      return <HRMentorsPage />;
    }

    if (location.pathname.startsWith('/hr/interns')) {
      return <HRInternsPage />;
    }

    if (location.pathname === '/hr/programs') {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              Программы стажировок
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCreateProgram} sx={{ fontWeight: 700 }}>
              Создать программу
            </Button>
          </Box>
          <InternshipProgramsList onEdit={handleEditProgram} onView={handleViewProgram} />
        </Box>
      );
    }

    return <ProfilePage />;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardAppBar onLogout={handleLogout} />

      <Box sx={{ display: 'flex', mt: `${DASHBOARD_APP_BAR_HEIGHT}px` }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: sidebarOpen ? '280px' : '80px',
            transition: 'margin-left 0.3s ease',
            minHeight: `calc(100vh - ${DASHBOARD_APP_BAR_HEIGHT}px)`,
            backgroundColor: 'background.default',
            py: 3,
            px: 3,
            overflowX: 'auto',
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>{getCurrentPage()}</Box>
        </Box>
      </Box>

      <InternshipProgramForm
        open={isProgramFormOpen}
        onClose={() => setIsProgramFormOpen(false)}
        programToEdit={editingProgram}
      />

      <InternshipProgramDetails
        open={isProgramDetailsOpen}
        onClose={() => setIsProgramDetailsOpen(false)}
        program={viewingProgram}
      />
    </Box>
  );
};

export default HRDashboard;
