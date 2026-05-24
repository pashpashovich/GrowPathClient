import React, { useState } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import DashboardAppBar, { DASHBOARD_APP_BAR_HEIGHT } from '../components/DashboardAppBar';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import TaskReviewPanel from '../components/tasks/TaskReviewPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import RoadmapPage from './RoadmapPage';
import ProfilePage from './ProfilePage';
import MailingsPage from './MailingsPage';
import Sidebar from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import { deleteTaskAsync, fetchTaskProfileAsync } from '../store/slices/taskSlice';
import { logoutAsync } from '../store/slices/authSlice';
import { useLocation } from 'react-router-dom';

const MentorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openForm, setOpenForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenForm = (task = null) => {
    setTaskToEdit(task);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
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

  const handleTaskCreated = () => {
    dispatch(fetchTaskProfileAsync({ page: 1, limit: 100 }));
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
    } else if (location.pathname === '/mentor/stats') {
      return (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Статистика
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Здесь будет отображаться статистика по заданиям, прогрессу стажеров и аналитика.
          </Typography>
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
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>
              Создать задание
            </Button>
          </Box>
          <KanbanBoard
            onEdit={handleOpenForm}
            onDelete={handleDeleteTask}
            onView={handleViewTask}
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
                    handleOpenForm(selectedTask);
                  }}
                  canEdit={true} 
                />
              )}
        </Box>
      </Modal>

      <Modal
        open={openForm}
        onClose={handleCloseForm}
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
          <TaskForm
            open={openForm}
            taskToEdit={taskToEdit}
            onClose={handleCloseForm}
            onCreated={handleTaskCreated}
          />
        </Box>
      </Modal>
      </Box>
    </Box>
  );
};

export default MentorDashboard;
