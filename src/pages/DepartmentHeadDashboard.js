import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { logoutAsync } from '../store/slices/authSlice';
import {
  fetchInternshipProgramsAsync,
  fetchInternshipProgramByIdAsync,
} from '../store/slices/internshipProgramSlice';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import Sidebar from '../components/Sidebar';
import ProfilePage from './ProfilePage';
import HRRatingPage from './HRRatingPage';
import InternshipProgramsList from '../components/internshipPrograms/InternshipProgramsList';
import InternshipProgramForm from '../components/internshipPrograms/InternshipProgramForm';
import InternshipProgramDetails from '../components/internshipPrograms/InternshipProgramDetails';
import AnalyticsPage from './AnalyticsPage';
import TaskDetails from '../components/tasks/TaskDetails';
import TaskReviewPanel from '../components/tasks/TaskReviewPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import RoadmapPage from './RoadmapPage';
import DashboardPage from './DashboardPage';
import HRMentorsPage from './HRMentorsPage';
import HRInternsPage from './HRInternsPage';

const DepartmentHeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [isProgramDetailsOpen, setIsProgramDetailsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [viewingProgram, setViewingProgram] = useState(null);

  const [taskFormRequest, setTaskFormRequest] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
  const isProgramsTab = normalizedPath === '/department-head/programs';
  const shouldLoadProgramList =
    isProgramsTab ||
    location.pathname.startsWith('/department-head/rating') ||
    location.pathname.startsWith('/department-head/analytics') ||
    location.pathname.startsWith('/department-head/mentors') ||
    location.pathname.startsWith('/department-head/interns');

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

  const handleOpenCreateTask = () => {
    setTaskFormRequest({ mode: 'create' });
  };

  const handleOpenEditTask = (task) => {
    setTaskFormRequest({ mode: 'edit', task });
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const getCurrentPage = () => {
    if (location.pathname.startsWith('/department-head/rating')) {
      return <HRRatingPage />;
    }

    if (location.pathname.startsWith('/department-head/analytics')) {
      return <AnalyticsPage />;
    }

    if (location.pathname.startsWith('/department-head/mentors')) {
      return <HRMentorsPage />;
    }

    if (location.pathname.startsWith('/department-head/interns')) {
      return <HRInternsPage />;
    }

    if (location.pathname === '/department-head/programs') {
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

    if (location.pathname === '/department-head/tasks') {
      return (
        <KanbanBoard
          formRequest={taskFormRequest}
          onFormRequestHandled={() => setTaskFormRequest(null)}
        />
      );
    }

    if (location.pathname === '/department-head/roadmap') {
      return (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Дорожная карта
            </Typography>
          </Box>
          <RoadmapPage canEdit={true} />
        </Box>
      );
    }

    if (location.pathname === '/department-head/review') {
      return (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Проверка заданий
            </Typography>
          </Box>
          <TaskReviewPanel onViewTask={handleViewTask} />
        </Box>
      );
    }

    if (location.pathname === '/department-head/dashboard') {
      return <DashboardPage variant="departmentHead" />;
    }

    return <ProfilePage />;
  };

  const showTaskButton =
    location.pathname === '/department-head/tasks';

  const isDashboardPage = location.pathname === '/department-head/dashboard';

  const getPageTitle = () => {
    if (location.pathname === '/department-head/roadmap') return 'Дорожная карта';
    if (location.pathname === '/department-head/review') return 'Проверка заданий';
    if (location.pathname === '/department-head/dashboard') return 'Дашборд';
    if (location.pathname === '/department-head/tasks') return 'Доска задач';
    if (location.pathname === '/department-head/programs') return 'Программы стажировок';
    if (location.pathname.startsWith('/department-head/rating')) return 'Рейтинг стажеров';
    if (location.pathname.startsWith('/department-head/analytics')) return 'Аналитика и отчеты';
    if (location.pathname.startsWith('/department-head/mentors')) return 'Менторы';
    if (location.pathname.startsWith('/department-head/interns')) return 'Стажёры';
    return 'Профиль';
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
            py: isDashboardPage ? 1 : 3,
            px: isDashboardPage ? 2 : 3,
            overflowX: 'auto',
            minWidth: 0,
            width: '100%',
          }}
        >
          {showTaskButton && (
            <Box sx={{
              backgroundColor: 'background.paper',
              color: 'text.primary',
              boxShadow: 1,
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Typography variant="h6" component="div">
                {getPageTitle()}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreateTask}
              >
                Создать задание
              </Button>
            </Box>
          )}

          <Box sx={{ width: '100%', minWidth: 0 }}>{getCurrentPage()}</Box>
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

      <Modal
        open={!!selectedTask}
        onClose={handleCloseTaskDetails}
        aria-labelledby="task-details-modal-title"
        aria-describedby="task-details-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 800 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 2,
          }}
        >
          {selectedTask && (
            <TaskDetails
              open={!!selectedTask}
              onClose={handleCloseTaskDetails}
              onEdit={() => {
                handleCloseTaskDetails();
                handleOpenEditTask(selectedTask);
              }}
              canEdit={true}
            />
          )}
        </Box>
      </Modal>

    </Box>
  );
};

export default DepartmentHeadDashboard;
