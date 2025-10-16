import React, { useState } from 'react';
import { Box, Typography, Container, Modal, Tabs, Tab } from '@mui/material';
import InternTaskList from '../components/tasks/InternTaskList';
import TaskSubmissionForm from '../components/tasks/TaskSubmissionForm';
import TaskDetails from '../components/tasks/TaskDetails';

const InternDashboard = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionTask, setSubmissionTask] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleViewTask = (task) => {
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" component="h1">
          Панель стажера
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Мои задания" />
          <Tab label="Статистика" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <InternTaskList
          onViewTask={handleViewTask}
          onSubmitTask={handleSubmitTask}
        />
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Статистика выполнения
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будет отображаться статистика выполнения заданий, прогресс и достижения.
          </Typography>
        </Box>
      )}

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
              task={selectedTask}
              onClose={handleCloseTaskDetails}
              onEdit={() => {}} // Стажер не может редактировать задачи
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
    </Container>
  );
};

export default InternDashboard;
