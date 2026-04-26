import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import InternTaskList from '../components/tasks/InternTaskList';
import TaskSubmissionForm from '../components/tasks/TaskSubmissionForm';
import TaskDetails from '../components/tasks/TaskDetails';
import RoadmapPage from './RoadmapPage';
import InternRatingPage from './InternRatingPage';
import Sidebar from '../components/Sidebar';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutAsync } from '../store/slices/authSlice';
import { setCurrentTask, fetchMyTasksAsync } from '../store/slices/taskSlice';

const InternDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionTask, setSubmissionTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTasksAsync({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleViewTask = (task) => {
    dispatch(setCurrentTask(task));
    setSelectedTask(task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleSubmitTask = (task) => {
    setSubmissionTask(task);
  };

  const handleCloseSubmissionForm = () => {
    setSubmissionTask(null);
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  };


  const getCurrentPage = () => {
    if (location.pathname === '/intern/roadmap') {
      return <RoadmapPage canEdit={false} />;
    } else if (location.pathname === '/intern/rating') {
      return <InternRatingPage />;
    } else if (location.pathname === '/intern/stats') {
      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Статистика выполнения
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будет отображаться статистика выполнения заданий, прогресс и достижения.
          </Typography>
        </Box>
      );
    } else {
      return (
        <InternTaskList
          onViewTask={handleViewTask}
          onSubmitTask={handleSubmitTask}
        />
      );
    }
  };

  return (
    <Box>
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
          }}
        >
        {/* Верхняя панель */}
        <Box sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          mt: 2
        }}>
          <Typography variant="h6" component="div">
            {location.pathname === '/intern/roadmap' ? 'Дорожная карта' :
             location.pathname === '/intern/rating' ? 'Мой рейтинг' :
             location.pathname === '/intern/stats' ? 'Статистика' : 'Мои задания'}
          </Typography>
        </Box>

        {/* Основной контент */}
        <Box sx={{ py: 3, px: 3, overflowX: 'auto', width: '100%', maxWidth: 'none' }}>
          {getCurrentPage()}
        </Box>
      </Box>

      {/* Модальное окно для просмотра деталей задачи */}
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
                  onEdit={() => {}} // Стажер не может редактировать задачи
                  canEdit={false} // Стажер не может редактировать задачи
                />
              )}
        </Box>
      </Modal>

      {/* Модальное окно для сдачи задачи */}
      <Modal
        open={!!submissionTask}
        onClose={handleCloseSubmissionForm}
        aria-labelledby="task-submission-modal-title"
        aria-describedby="task-submission-modal-description"
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
          {submissionTask && (
            <TaskSubmissionForm
              task={submissionTask}
              onClose={handleCloseSubmissionForm}
            />
          )}
        </Box>
      </Modal>
      </Box>
    </Box>
  );
};

export default InternDashboard;

