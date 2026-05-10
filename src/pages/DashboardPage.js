import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardDataAsync,
  fetchTasksStatsAsync,
  fetchProgramsStatsAsync,
  fetchMentorsStatsAsync,
  fetchInternsStatsAsync,
  fetchUpcomingDeadlinesAsync,
  setFilters,
  clearFilters as clearDashboardFilters,
} from '../store/slices/dashboardSlice';
import { hrAPI } from '../services/api';
import { mentorAPI } from '../services/api';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import KpiCards from '../components/dashboard/KpiCards';
import TrendsChart from '../components/dashboard/TrendsChart';
import TasksStatsCharts from '../components/dashboard/TasksStatsCharts';
import ProgramsStatsChart from '../components/dashboard/ProgramsStatsChart';
import MentorsStatsChart from '../components/dashboard/MentorsStatsChart';
import InternsStatsChart from '../components/dashboard/InternsStatsChart';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';

const DEFAULT_PERIOD_DAYS = 30;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const {
    data,
    tasksStats,
    programsStats,
    mentorsStats,
    internsStats,
    deadlines,
    filters,
    isLoading,
    error,
  } = useSelector((state) => state.dashboard);

  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    hrAPI.getInternshipPrograms({ page: 1, limit: 100 })
      .then((res) => setPrograms(res.data?.data || res.data || []))
      .catch(() => {});
    mentorAPI.getMentors({ page: 1, limit: 100 })
      .then((res) => setMentors(res.data?.data || res.data || []))
      .catch(() => {});
  }, []);

  const buildParams = useCallback(
    (overrideFilters = {}) => {
      const f = { ...filters, ...overrideFilters };
      const params = {};
      if (f.dateFrom) {
        const d = new Date(f.dateFrom);
        params.dateFrom = d.toISOString();
      }
      if (f.dateTo) {
        const d = new Date(f.dateTo);
        d.setHours(23, 59, 59, 999);
        params.dateTo = d.toISOString();
      }
      if (f.programId) params.programId = f.programId;
      if (f.mentorId) params.mentorId = f.mentorId;
      if (f.departmentId) params.departmentId = f.departmentId;
      if (f.status) params.status = f.status;
      return params;
    },
    [filters]
  );

  const fetchAll = useCallback(
    (params) => {
      dispatch(fetchDashboardDataAsync(params));
      dispatch(fetchTasksStatsAsync(params));
      dispatch(fetchProgramsStatsAsync(params));
      dispatch(fetchMentorsStatsAsync(params));
      dispatch(fetchInternsStatsAsync(params));
      dispatch(fetchUpcomingDeadlinesAsync({ days: 7, ...params }));
    },
    [dispatch]
  );

  useEffect(() => {
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - DEFAULT_PERIOD_DAYS);
    const initialFilters = {
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
      programId: null,
      mentorId: null,
      departmentId: null,
      status: null,
    };
    dispatch(setFilters(initialFilters));
    fetchAll(buildParams(initialFilters));
  }, []);

  const handleApply = (newFilters) => {
    dispatch(setFilters(newFilters));
    fetchAll(buildParams(newFilters));
  };

  const handleReset = () => {
    dispatch(clearDashboardFilters());
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - DEFAULT_PERIOD_DAYS);
    const resetFilters = {
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
      programId: null,
      mentorId: null,
      departmentId: null,
      status: null,
    };
    dispatch(setFilters(resetFilters));
    fetchAll(buildParams(resetFilters));
  };

  const dateFromISO = filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined;
  const dateToISO = filters.dateTo ? new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999)).toISOString() : undefined;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DashboardFilters
        filters={filters}
        programs={programs}
        mentors={mentors}
        onApply={handleApply}
        onReset={handleReset}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <KpiCards data={data} />

      <Box sx={{ mb: 3 }}>
        <TrendsChart dateFrom={dateFromISO} dateTo={dateToISO} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TasksStatsCharts data={tasksStats} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgramsStatsChart data={programsStats} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <MentorsStatsChart data={mentorsStats} />
        </Grid>
        <Grid item xs={12} md={6}>
          <InternsStatsChart data={internsStats} />
        </Grid>
      </Grid>

      <UpcomingDeadlines data={deadlines} />
    </Box>
  );
};

export default DashboardPage;
