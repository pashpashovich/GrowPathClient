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
import { deleteTaskAsync } from '../store/slices/taskSlice';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import Sidebar from '../components/Sidebar';
import ProfilePage from './ProfilePage';
import HRRatingPage from './HRRatingPage';
import InternshipProgramsList from '../components/internshipPrograms/InternshipProgramsList';
import InternshipProgramForm from '../components/internshipPrograms/InternshipProgramForm';
import InternshipProgramDetails from '../components/internshipPrograms/InternshipProgramDetails';
import AnalyticsPage from './AnalyticsPage';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import TaskReviewPanel from '../components/tasks/TaskReviewPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import RoadmapPage from './RoadmapPage';
import DashboardPage from './DashboardPage';

const DepartmentHeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [isProgramDetailsOpen, setIsProgramDetailsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [viewingProgram, setViewingProgram] = useState(null);

  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
  const isProgramsTab = normalizedPath === '/department-head/programs';
  const shouldLoadProgramList =
    isProgramsTab ||
    location.pathname.startsWith('/department-head/rating') ||
    location.pathname.startsWith('/department-head/analytics');

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

  const handleOpenTaskForm = (task = null) => {
    setTaskToEdit(task);
    setOpenTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setOpenTaskForm(false);
    setTaskToEdit(null);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить это задание?')) {
      dispatch(deleteTaskAsync(taskId));
    }
  };

  const getCurrentPage = () => {
    if (location.pathname.startsWith('/department-head/rating')) {
      return <HRRatingPage />;
    }

    if (location.pathname.startsWith('/department-head/analytics')) {
      return <AnalyticsPage />;
    }

    if (location.pathname.startsWith('/department-head/mentors')) {
      return (
        <Box sx={{ maxWidth: 720, mx: 'auto', py: 2 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Менторы
          </Typography>
          <Typography color="text.secondary" variant="body1">
            Раздел в разработке. Здесь появится работа с менторами и назначениями.
          </Typography>
        </Box>
      );
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
          onEdit={handleOpenTaskForm}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      );
    }

    if (location.pathname === '/department-head/roadmap') {
      return <RoadmapPage canEdit={true} />;
    }

    if (location.pathname === '/department-head/review') {
      return <TaskReviewPanel onViewTask={handleViewTask} />;
    }

    if (location.pathname === '/department-head/dashboard') {
      return <DashboardPage />;
    }

    if (location.pathname === '/department-head/stats') {
      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Статистика заданий
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будет отображаться статистика по заданиям, прогрессу стажеров и аналитика.
          </Typography>
        </Box>
      );
    }

    return <ProfilePage />;
  };

  const showTaskButton =
    location.pathname === '/department-head/tasks' ||
    location.pathname === '/department-head/roadmap' ||
    location.pathname === '/department-head/review' ||
    location.pathname === '/department-head/stats';

  const getPageTitle = () => {
    if (location.pathname === '/department-head/roadmap') return 'Дорожная карта';
    if (location.pathname === '/department-head/review') return 'Проверка заданий';
    if (location.pathname === '/department-head/dashboard') return 'Дашборд';
    if (location.pathname === '/department-head/stats') return 'Статистика';
    if (location.pathname === '/department-head/tasks') return 'Доска задач';
    if (location.pathname === '/department-head/programs') return 'Программы стажировок';
    if (location.pathname.startsWith('/department-head/rating')) return 'Рейтинг стажеров';
    if (location.pathname.startsWith('/department-head/analytics')) return 'Аналитика и отчеты';
    if (location.pathname.startsWith('/department-head/mentors')) return 'Менторы';
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
            display: 'flex',
            flexDirection: 'column',
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
              mt: 2,
              mx: 3,
              flexShrink: 0,
            }}>
              <Typography variant="h6" component="div">
                {getPageTitle()}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenTaskForm()}
              >
                Создать задание
              </Button>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              py: showTaskButton ? 0 : 3,
              px: 3,
              overflowY: 'auto',
            }}
          >
            <Box sx={{ maxWidth: 1280, mx: 'auto' }}>{getCurrentPage()}</Box>
          </Box>
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
                handleOpenTaskForm(selectedTask);
              }}
              canEdit={true}
            />
          )}
        </Box>
      </Modal>

      <Modal
        open={openTaskForm}
        onClose={handleCloseTaskForm}
        aria-labelledby="task-form-modal-title"
        aria-describedby="task-form-modal-description"
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
          <TaskForm open={openTaskForm} taskToEdit={taskToEdit} onClose={handleCloseTaskForm} />
        </Box>
      </Modal>
    </Box>
  );
};

export default DepartmentHeadDashboard;
