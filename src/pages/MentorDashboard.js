import React, { useState } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import TaskDetails from '../components/tasks/TaskDetails';
import TaskReviewPanel from '../components/tasks/TaskReviewPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import RoadmapPage from './RoadmapPage';
import ProfilePage from './ProfilePage';
import MailingsPage from './MailingsPage';
import Sidebar from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import { logoutAsync } from '../store/slices/authSlice';
import { useLocation } from 'react-router-dom';

const MentorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [taskFormRequest, setTaskFormRequest] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  };


  const getCurrentPage = () => {
    if (location.pathname === '/mentor/roadmap') {
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
    } else if (location.pathname === '/mentor/review') {
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
    } else if (location.pathname === '/mentor/mailings') {
      return <MailingsPage />;
    } else if (location.pathname === '/mentor/tasks') {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              Доска задач
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreateTask}>
              Создать задание
            </Button>
          </Box>
          <KanbanBoard
            formRequest={taskFormRequest}
            onFormRequestHandled={() => setTaskFormRequest(null)}
          />
        </Box>
      );
    } else {
      return <ProfilePage />;
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
            maxHeight: `calc(100vh - ${DASHBOARD_APP_BAR_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'background.default',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              py: 3,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
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
    </Box>
  );
};

export default MentorDashboard;
