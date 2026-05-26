import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardDataAsync,
  fetchTasksStatsAsync,
  fetchProgramsStatsAsync,
  fetchMentorsStatsAsync,
  fetchInternsStatsAsync,
  fetchDashboardChartsAsync,
  setFilters,
  clearFilters as clearDashboardFilters,
} from '../store/slices/dashboardSlice';
import { hrAPI, mentorAPI, profileAPI } from '../services/api';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import KpiCards from '../components/dashboard/KpiCards';
import TrendsChart from '../components/dashboard/TrendsChart';
import TasksStatsCharts from '../components/dashboard/TasksStatsCharts';
import ProgramsStatsChart from '../components/dashboard/ProgramsStatsChart';
import MentorsStatsChart from '../components/dashboard/MentorsStatsChart';
import InternsStatsChart from '../components/dashboard/InternsStatsChart';
import DashboardChartsGrid from '../components/dashboard/DashboardChartsGrid';

const DEFAULT_PERIOD_DAYS = 30;

const programsHasCharts = (data) =>
  (data?.mostPopularPrograms?.length ?? 0) > 0 || (data?.bestPerformingPrograms?.length ?? 0) > 0;

const buildDefaultDateFilters = () => {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - DEFAULT_PERIOD_DAYS);
  return {
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
    programId: null,
    mentorId: null,
    departmentId: null,
    status: null,
    groupBy: null,
  };
};

const DashboardPage = ({ compact = false, variant = 'default' }) => {
  const isDepartmentHead = variant === 'departmentHead';
  const dispatch = useDispatch();
  const {
    data,
    charts,
    tasksStats,
    programsStats,
    mentorsStats,
    internsStats,
    filters,
    isLoading,
    chartsLoading,
    error,
  } = useSelector((state) => state.dashboard);

  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [departmentLabel, setDepartmentLabel] = useState(null);
  const profileLoadedRef = useRef(false);

  useEffect(() => {
    hrAPI
      .getInternshipPrograms({ page: 1, limit: 100 })
      .then((res) => setPrograms(res.data?.data || res.data || []))
      .catch(() => {});
    mentorAPI
      .getMentors({ page: 1, limit: 100 })
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
      if (f.groupBy) params.groupBy = f.groupBy;
      return params;
    },
    [filters]
  );

  const fetchLegacyAll = useCallback(
    (params) => {
      dispatch(fetchDashboardDataAsync(params));
      dispatch(fetchTasksStatsAsync(params));
      dispatch(fetchProgramsStatsAsync(params));
      dispatch(fetchMentorsStatsAsync(params));
      dispatch(fetchInternsStatsAsync(params));
    },
    [dispatch]
  );

  const fetchDepartmentHeadData = useCallback(
    (params) => {
      dispatch(fetchDashboardDataAsync(params));
      dispatch(fetchDashboardChartsAsync(params));
    },
    [dispatch]
  );

  const applyFilters = useCallback(
    (nextFilters) => {
      const params = buildParams(nextFilters);
      if (isDepartmentHead) {
        fetchDepartmentHeadData(params);
      } else {
        fetchLegacyAll(params);
      }
    },
    [buildParams, fetchDepartmentHeadData, fetchLegacyAll, isDepartmentHead]
  );

  useEffect(() => {
    const init = async () => {
      let initialFilters = buildDefaultDateFilters();

      if (isDepartmentHead && !profileLoadedRef.current) {
        profileLoadedRef.current = true;
        try {
          const res = await profileAPI.getProfile();
          const profile = res.data;
          if (profile?.departmentId) {
            initialFilters = { ...initialFilters, departmentId: profile.departmentId };
            const deptName = profile.departmentName || profile.department;
            if (deptName) {
              setDepartmentLabel(`Отдел: ${deptName}`);
            }
          }
        } catch {
          /* profile optional for charts */
        }
      }

      dispatch(setFilters(initialFilters));
      applyFilters(initialFilters);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDepartmentHead]);

  const handleApply = (newFilters) => {
    dispatch(setFilters(newFilters));
    applyFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters = buildDefaultDateFilters();
    if (isDepartmentHead && filters.departmentId) {
      resetFilters.departmentId = filters.departmentId;
    }
    dispatch(clearDashboardFilters());
    dispatch(setFilters(resetFilters));
    applyFilters(resetFilters);
  };

  const dateFromISO = filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined;
  const dateToISO = filters.dateTo
    ? new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999)).toISOString()
    : undefined;

  const showProgramsChart = useMemo(
    () => !compact || programsHasCharts(programsStats),
    [compact, programsStats]
  );

  const chartPanels = compact && !isDepartmentHead
    ? [
        { key: 'tasks', node: <TasksStatsCharts data={tasksStats} compact chartsOnly /> },
        showProgramsChart
          ? { key: 'programs', node: <ProgramsStatsChart data={programsStats} compact chartsOnly /> }
          : null,
        { key: 'mentors', node: <MentorsStatsChart data={mentorsStats} compact chartsOnly /> },
        { key: 'interns', node: <InternsStatsChart data={internsStats} compact chartsOnly /> },
      ].filter(Boolean)
    : null;

  const sectionSpacing = compact || isDepartmentHead ? 1.5 : 3;
  const pageLoading = isLoading && !charts;
  const gridLoading = chartsLoading;

  if (isDepartmentHead) {
    return (
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Дашборд отдела
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Аналитика по стажировкам, задачам и команде за выбранный период
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1, py: 0 }}>
            {error}
          </Alert>
        )}

        <DashboardFilters
          filters={filters}
          programs={programs}
          mentors={mentors}
          onApply={handleApply}
          onReset={handleReset}
          compact
          showGroupBy
          departmentLabel={departmentLabel}
        />

        {pageLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        <Box sx={{ mb: sectionSpacing }}>
          <KpiCards data={data} compact />
        </Box>

        <DashboardChartsGrid charts={charts} loading={gridLoading} />
      </Box>
    );
  }

  if (compact) {
    return (
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Дашборд
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1, py: 0 }}>
            {error}
          </Alert>
        )}

        <DashboardFilters
          filters={filters}
          programs={programs}
          mentors={mentors}
          onApply={handleApply}
          onReset={handleReset}
          compact
        />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        <Box sx={{ mb: sectionSpacing }}>
          <TrendsChart dateFrom={dateFromISO} dateTo={dateToISO} compact chartsOnly />
        </Box>

        <Grid container spacing={sectionSpacing} sx={{ mb: sectionSpacing }}>
          {chartPanels.map((panel) => (
            <Grid key={panel.key} size={{ xs: 12, md: 6 }}>
              {panel.node}
            </Grid>
          ))}
        </Grid>

        <KpiCards data={data} compact />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'left' }}>
          Дашборд
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Сводка по стажировкам, задачам и команде за выбранный период
        </Typography>
      </Box>

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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      <KpiCards data={data} />

      <Box sx={{ mb: sectionSpacing }}>
        <TrendsChart dateFrom={dateFromISO} dateTo={dateToISO} />
      </Box>

      <Grid container spacing={sectionSpacing} sx={{ mb: sectionSpacing }}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <TasksStatsCharts data={tasksStats} />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <ProgramsStatsChart data={programsStats} />
        </Grid>
      </Grid>
      <Grid container spacing={sectionSpacing}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <MentorsStatsChart data={mentorsStats} />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <InternsStatsChart data={internsStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
