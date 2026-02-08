import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Assessment,
  People,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import ProgramReports from '../components/analytics/ProgramReports';
import MentorWorkload from '../components/analytics/MentorWorkload';
import { useSelector } from 'react-redux';

const AnalyticsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const programReports = useSelector((state) => state.analytics?.programReports || []);
  const mentorWorkload = useSelector((state) => state.analytics?.mentorWorkload || []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const totalTasks = programReports.reduce((sum, report) => sum + report.totalTasks, 0);
  const completedTasks = programReports.reduce((sum, report) => sum + report.completedTasks, 0);
  const overdueTasks = programReports.reduce((sum, report) => sum + report.overdueTasks, 0);
  const overloadedMentors = mentorWorkload.filter(mentor => 
    mentor.workload === 'high' || mentor.workload === 'overload'
  ).length;

  const getCurrentPage = () => {
    switch (currentTab) {
      case 0:
        return <ProgramReports />;
      case 1:
        return <MentorWorkload />;
      default:
        return <ProgramReports />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Аналитика и отчеты
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{totalTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего задач
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{completedTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{overdueTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Просрочено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{overloadedMentors}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Перегружено менторов
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Отчеты по программам" 
            icon={<Assessment />}
            iconPosition="start"
          />
          <Tab 
            label="Загрузка менторов" 
            icon={<People />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {getCurrentPage()}
    </Box>
  );
};

export default AnalyticsPage;
