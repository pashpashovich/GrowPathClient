import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsAPI } from '../../services/api';

export const fetchProgramReportsAsync = createAsyncThunk(
  'analytics/fetchProgramReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getReports(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке отчетов');
    }
  }
);

export const fetchMentorWorkloadAsync = createAsyncThunk(
  'analytics/fetchMentorWorkload',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getMentorWorkload(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при загрузке загрузки менторов'
      );
    }
  }
);

export const fetchDashboardAsync = createAsyncThunk(
  'analytics/fetchDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при загрузке данных дашборда'
      );
    }
  }
);

const initialState = {
  programReports: [],
  mentorWorkload: [],
  dashboard: null,
  dashboardStats: {
    totalUsers: 0,
    activeInterns: 0,
    activePrograms: 0,
    pendingTasks: 0,
    completedTasks: 0,
  },
  filters: {
    programId: '',
    mentorId: '',
    period: 'monthly', // weekly, monthly, program
    dateRange: {
      start: '',
      end: ''
    }
  },
  isLoading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setProgramReports: (state, action) => {
      state.programReports = action.payload;
    },
    setMentorWorkload: (state, action) => {
      state.mentorWorkload = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        programId: '',
        mentorId: '',
        period: 'monthly',
        dateRange: {
          start: '',
          end: ''
        }
      };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateMentorWorkload: (state, action) => {
      const { mentorId, updates } = action.payload;
      const index = state.mentorWorkload.findIndex(mentor => mentor.mentorId === mentorId);
      if (index !== -1) {
        state.mentorWorkload[index] = { ...state.mentorWorkload[index], ...updates };
      }
    },
    addProgramReport: (state, action) => {
      state.programReports.push(action.payload);
    },
    updateProgramReport: (state, action) => {
      const { programId, updates } = action.payload;
      const index = state.programReports.findIndex(report => report.programId === programId);
      if (index !== -1) {
        state.programReports[index] = { ...state.programReports[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgramReportsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramReportsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programReports = action.payload.data || [];
      })
      .addCase(fetchProgramReportsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMentorWorkloadAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMentorWorkloadAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentorWorkload = action.payload.data || [];
      })
      .addCase(fetchMentorWorkloadAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const stats = action.payload?.stats || {};
        state.dashboard = action.payload || null;
        state.dashboardStats = {
          totalUsers: stats.totalUsers ?? 0,
          activeInterns: stats.activeInterns ?? 0,
          activePrograms: stats.activePrograms ?? 0,
          pendingTasks: stats.pendingTasks ?? 0,
          completedTasks: stats.completedTasks ?? 0,
        };
      })
      .addCase(fetchDashboardAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProgramReports,
  setMentorWorkload,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
  updateMentorWorkload,
  addProgramReport,
  updateProgramReport
} = analyticsSlice.actions;

export default analyticsSlice.reducer;










