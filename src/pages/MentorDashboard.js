import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import TaskList from '../components/tasks/TaskList';

const MentorDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Панель ментора
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Управление задачами и прогрессом стажеров
        </Typography>
      </Box>
      
      <TaskList />
    </Container>
  );
};

export default MentorDashboard;
