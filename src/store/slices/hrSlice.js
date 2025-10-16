import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  internshipPrograms: [],
  currentProgram: null,
  reports: [],
  dashboardData: null,
  isLoading: false,
  error: null,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    },
    setReports: (state, action) => {
      state.reports = action.payload;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
  },
});

export const { clearError, setCurrentProgram, setReports, setDashboardData } = hrSlice.actions;
export default hrSlice.reducer;


