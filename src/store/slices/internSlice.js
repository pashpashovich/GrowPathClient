import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  interns: [],
  currentIntern: null,
  internProgress: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    department: '',
    status: '',
    rating: '',
  },
};

const internSlice = createSlice({
  name: 'intern',
  initialState,
  reducers: {
    setInterns: (state, action) => {
      state.interns = action.payload;
    },
    setCurrentIntern: (state, action) => {
      state.currentIntern = action.payload;
    },
    addIntern: (state, action) => {
      state.interns.unshift(action.payload);
    },
    updateIntern: (state, action) => {
      const index = state.interns.findIndex(intern => intern.id === action.payload.id);
      if (index !== -1) {
        state.interns[index] = action.payload;
      }
      if (state.currentIntern && state.currentIntern.id === action.payload.id) {
        state.currentIntern = action.payload;
      }
    },
    removeIntern: (state, action) => {
      state.interns = state.interns.filter(intern => intern.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        department: '',
        status: '',
        rating: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setInterns, 
  setCurrentIntern, 
  addIntern, 
  updateIntern, 
  removeIntern,
  clearError, 
  setFilters, 
  clearFilters, 
  setPagination,
  setLoading 
} = internSlice.actions;
export default internSlice.reducer;