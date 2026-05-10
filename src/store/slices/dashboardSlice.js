import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

export const fetchDashboardDataAsync = createAsyncThunk(
  'dashboard/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки данных дашборда');
    }
  }
);

export const fetchDashboardTrendsAsync = createAsyncThunk(
  'dashboard/fetchTrends',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTrends(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки трендов');
    }
  }
);

export const fetchTasksStatsAsync = createAsyncThunk(
  'dashboard/fetchTasksStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTasksStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики задач');
    }
  }
);

export const fetchProgramsStatsAsync = createAsyncThunk(
  'dashboard/fetchProgramsStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getProgramsStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики программ');
    }
  }
);

export const fetchMentorsStatsAsync = createAsyncThunk(
  'dashboard/fetchMentorsStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getMentorsStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики менторов');
    }
  }
);

export const fetchInternsStatsAsync = createAsyncThunk(
  'dashboard/fetchInternsStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getInternsStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики стажеров');
    }
  }
);

export const fetchUpcomingDeadlinesAsync = createAsyncThunk(
  'dashboard/fetchUpcomingDeadlines',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getUpcomingDeadlines(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки дедлайнов');
    }
  }
);

const initialState = {
  data: null,
  trends: null,
  tasksStats: null,
  programsStats: null,
  mentorsStats: null,
  internsStats: null,
  deadlines: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    programId: null,
    mentorId: null,
    departmentId: null,
    status: null,
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchDashboardDataAsync.pending, handlePending)
      .addCase(fetchDashboardDataAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardDataAsync.rejected, handleRejected)

      .addCase(fetchDashboardTrendsAsync.pending, handlePending)
      .addCase(fetchDashboardTrendsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchDashboardTrendsAsync.rejected, handleRejected)

      .addCase(fetchTasksStatsAsync.pending, handlePending)
      .addCase(fetchTasksStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasksStats = action.payload;
      })
      .addCase(fetchTasksStatsAsync.rejected, handleRejected)

      .addCase(fetchProgramsStatsAsync.pending, handlePending)
      .addCase(fetchProgramsStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programsStats = action.payload;
      })
      .addCase(fetchProgramsStatsAsync.rejected, handleRejected)

      .addCase(fetchMentorsStatsAsync.pending, handlePending)
      .addCase(fetchMentorsStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentorsStats = action.payload;
      })
      .addCase(fetchMentorsStatsAsync.rejected, handleRejected)

      .addCase(fetchInternsStatsAsync.pending, handlePending)
      .addCase(fetchInternsStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internsStats = action.payload;
      })
      .addCase(fetchInternsStatsAsync.rejected, handleRejected)

      .addCase(fetchUpcomingDeadlinesAsync.pending, handlePending)
      .addCase(fetchUpcomingDeadlinesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deadlines = action.payload;
      })
      .addCase(fetchUpcomingDeadlinesAsync.rejected, handleRejected);
  },
});

export const { setFilters, clearFilters } = dashboardSlice.actions;
export default dashboardSlice.reducer;
