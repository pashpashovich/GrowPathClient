import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { internAPI } from '../../services/api';

// Async Thunks
export const fetchInternsAsync = createAsyncThunk(
  'intern/fetchInterns',
  async (params, { rejectWithValue }) => {
    try {
      const response = await internAPI.getInterns(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке стажеров');
    }
  }
);

export const fetchInternByIdAsync = createAsyncThunk(
  'intern/fetchInternById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await internAPI.getInternById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке стажера');
    }
  }
);

export const createInternAsync = createAsyncThunk(
  'intern/createIntern',
  async (data, { rejectWithValue }) => {
    try {
      const response = await internAPI.createIntern(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при создании стажера');
    }
  }
);

export const updateInternAsync = createAsyncThunk(
  'intern/updateIntern',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await internAPI.updateIntern(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении стажера');
    }
  }
);

export const deleteInternAsync = createAsyncThunk(
  'intern/deleteIntern',
  async (id, { rejectWithValue }) => {
    try {
      await internAPI.deleteIntern(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении стажера');
    }
  }
);

export const fetchInternProgressAsync = createAsyncThunk(
  'intern/fetchProgress',
  async (id, { rejectWithValue }) => {
    try {
      const response = await internAPI.getInternProgress(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке прогресса');
    }
  }
);

export const fetchInternTasksAsync = createAsyncThunk(
  'intern/fetchTasks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await internAPI.getInternTasks(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке задач стажера');
    }
  }
);

export const fetchInternAssessmentsAsync = createAsyncThunk(
  'intern/fetchAssessments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await internAPI.getInternAssessments(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке оценок стажера');
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      // Fetch Interns
      .addCase(fetchInternsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interns = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchInternsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Intern By ID
      .addCase(fetchInternByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentIntern = action.payload;
        const index = state.interns.findIndex(intern => intern.id === action.payload.id);
        if (index !== -1) {
          state.interns[index] = action.payload;
        }
      })
      .addCase(fetchInternByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Intern
      .addCase(createInternAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInternAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interns.unshift(action.payload);
      })
      .addCase(createInternAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Intern
      .addCase(updateInternAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInternAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.interns.findIndex(intern => intern.id === action.payload.id);
        if (index !== -1) {
          state.interns[index] = action.payload;
        }
        if (state.currentIntern && state.currentIntern.id === action.payload.id) {
          state.currentIntern = action.payload;
        }
      })
      .addCase(updateInternAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Intern
      .addCase(deleteInternAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInternAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interns = state.interns.filter(intern => intern.id !== action.payload);
        if (state.currentIntern && state.currentIntern.id === action.payload) {
          state.currentIntern = null;
        }
      })
      .addCase(deleteInternAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Intern Progress
      .addCase(fetchInternProgressAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternProgressAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internProgress = action.payload;
      })
      .addCase(fetchInternProgressAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Intern Tasks
      .addCase(fetchInternTasksAsync.fulfilled, (state, action) => {
        if (state.currentIntern) {
          state.currentIntern.tasks = action.payload.data || action.payload;
        }
      })
      // Fetch Intern Assessments
      .addCase(fetchInternAssessmentsAsync.fulfilled, (state, action) => {
        if (state.currentIntern) {
          state.currentIntern.assessments = action.payload.data || action.payload;
        }
      });
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