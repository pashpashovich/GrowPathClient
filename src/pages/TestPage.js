import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';

const TestPage = () => {
  const programs = useSelector((state) => state.internshipProgram.programs);
  const tasks = useSelector((state) => state.task.tasks);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тестовая страница
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Программы стажировок: {programs.length}
      </Typography>
      
      {programs.map(program => (
        <Box key={program.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc' }}>
          <Typography variant="h6">{program.title}</Typography>
          <Typography variant="body2">Целей: {program.goals?.length || 0}</Typography>
          <Typography variant="body2">Стажировок: {program.internships?.length || 0}</Typography>
        </Box>
      ))}

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Задачи: {tasks.length}
      </Typography>
      
      {tasks.map(task => (
        <Box key={task.id} sx={{ mb: 1, p: 1, border: '1px solid #eee' }}>
          <Typography variant="body2">{task.title}</Typography>
          <Typography variant="caption">Цель: {task.goalId || 'не выбрана'}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default TestPage;



