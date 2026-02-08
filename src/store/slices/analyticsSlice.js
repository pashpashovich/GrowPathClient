import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  programReports: [],
  mentorWorkload: [],
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
  }
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










