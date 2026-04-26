import React, { useState } from 'react';
import { Box, Typography, Button, Modal, AppBar, Toolbar, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import Logo from '../components/Logo';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import TaskReviewPanel from '../components/tasks/TaskReviewPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import RoadmapPage from './RoadmapPage';
import Sidebar from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import { deleteTaskAsync } from '../store/slices/taskSlice';
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

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  };


  const getCurrentPage = () => {
    if (location.pathname === '/mentor/roadmap') {
      return <RoadmapPage canEdit={true} />;
    } else if (location.pathname === '/mentor/review') {
      return <TaskReviewPanel onViewTask={handleViewTask} />;
    } else if (location.pathname === '/mentor/stats') {
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
    } else {
      return (
        <KanbanBoard
          onEdit={handleOpenForm}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      );
    }
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
            maxHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
          mt: 2,
          flexShrink: 0,
        }}>
          <Typography variant="h6" component="div">
            {location.pathname === '/mentor/roadmap' ? 'Дорожная карта' :
             location.pathname === '/mentor/review' ? 'Проверка заданий' :
             location.pathname === '/mentor/stats' ? 'Статистика' :
             'Доска задач'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
          >
            Создать задание
          </Button>
        </Box>

        {/* Основной контент: flex-1 чтобы дочерние экраны (канбан) могли занять высоту и скроллить внутри себя */}
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
                  canEdit={true} // Ментор может редактировать задачи
                />
              )}
        </Box>
      </Modal>

      {/* Модальное окно для создания/редактирования задачи */}
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
          <TaskForm open={openForm} taskToEdit={taskToEdit} onClose={handleCloseForm} />
        </Box>
      </Modal>
      </Box>
    </Box>
  );
};

export default MentorDashboard;
