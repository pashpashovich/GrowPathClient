import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrAPI } from '../../services/api';
import { normalizeInternshipProgram } from '../../utils/internshipProgramApi';

const defaultListQuery = { page: 1, limit: 100, includeArchived: false };

export const fetchInternshipProgramsAsync = createAsyncThunk(
  'internshipProgram/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = { ...defaultListQuery, ...params };
      const response = await hrAPI.getInternshipPrograms(query);
      return { query, body: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при загрузке программ стажировок'
      );
    }
  }
);

export const fetchInternshipProgramByIdAsync = createAsyncThunk(
  'internshipProgram/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hrAPI.getInternshipProgramById(id);
      const raw = response.data?.data ?? response.data;
      return normalizeInternshipProgram(raw);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при загрузке программы'
      );
    }
  }
);

export const createInternshipProgramAsync = createAsyncThunk(
  'internshipProgram/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await hrAPI.createInternshipProgram(data);
      await dispatch(fetchInternshipProgramsAsync(defaultListQuery));
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при создании программы'
      );
    }
  }
);

export const updateInternshipProgramAsync = createAsyncThunk(
  'internshipProgram/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await hrAPI.updateInternshipProgram(id, data);
      await dispatch(fetchInternshipProgramsAsync(defaultListQuery));
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при обновлении программы'
      );
    }
  }
);

export const deleteInternshipProgramAsync = createAsyncThunk(
  'internshipProgram/delete',
  async (id, { rejectWithValue }) => {
    try {
      await hrAPI.deleteInternshipProgram(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при удалении программы'
      );
    }
  }
);

const initialState = {
  programs: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  listQuery: defaultListQuery,
  currentProgram: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    search: '',
  },
};

const internshipProgramSlice = createSlice({
  name: 'internshipProgram',
  initialState,
  reducers: {
    setPrograms: (state, action) => {
      state.programs = action.payload;
    },
    addProgram: (state, action) => {
      const newProgram = {
        ...action.payload,
        id: `program-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.programs.unshift(newProgram);
    },
    updateProgram: (state, action) => {
      const index = state.programs.findIndex((program) => String(program.id) === String(action.payload.id));
      if (index !== -1) {
        state.programs[index] = {
          ...state.programs[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteProgram: (state, action) => {
      const id = action.payload;
      state.programs = state.programs.filter((program) => String(program.id) !== String(id));
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    },
    addGoal: (state, action) => {
      const { programId, goal } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        const newGoal = {
          ...goal,
          id: `goal-${Date.now()}`,
        };
        program.goals.push(newGoal);
        program.updatedAt = new Date().toISOString();
      }
    },
    updateGoal: (state, action) => {
      const { programId, goalId, updates } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        const goalIndex = program.goals.findIndex((g) => g.id === goalId);
        if (goalIndex !== -1) {
          program.goals[goalIndex] = { ...program.goals[goalIndex], ...updates };
          program.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteGoal: (state, action) => {
      const { programId, goalId } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        program.goals = program.goals.filter((g) => g.id !== goalId);
        program.updatedAt = new Date().toISOString();
      }
    },
    addSelectionStage: (state, action) => {
      const { programId, stage } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        const newStage = {
          ...stage,
          id: `stage-${Date.now()}`,
          order: program.selectionStages.length + 1,
        };
        program.selectionStages.push(newStage);
        program.updatedAt = new Date().toISOString();
      }
    },
    updateSelectionStage: (state, action) => {
      const { programId, stageId, updates } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        const stageIndex = program.selectionStages.findIndex((s) => s.id === stageId);
        if (stageIndex !== -1) {
          program.selectionStages[stageIndex] = {
            ...program.selectionStages[stageIndex],
            ...updates,
          };
          program.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteSelectionStage: (state, action) => {
      const { programId, stageId } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        program.selectionStages = program.selectionStages.filter((s) => s.id !== stageId);
        program.selectionStages.forEach((stage, index) => {
          stage.order = index + 1;
        });
        program.updatedAt = new Date().toISOString();
      }
    },
    reorderSelectionStages: (state, action) => {
      const { programId, stages } = action.payload;
      const program = state.programs.find((p) => p.id === programId);
      if (program) {
        program.selectionStages = stages.map((stage, index) => ({
          ...stage,
          order: index + 1,
        }));
        program.updatedAt = new Date().toISOString();
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternshipProgramsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipProgramsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listQuery = action.payload.query;
        const { body } = action.payload;
        const rawList = body?.data ?? body;
        const arr = Array.isArray(rawList) ? rawList : rawList?.items ?? [];
        state.programs = arr.map((p) => normalizeInternshipProgram(p)).filter(Boolean);
        if (body?.pagination) {
          state.pagination = body.pagination;
        }
        state.error = null;
      })
      .addCase(fetchInternshipProgramsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchInternshipProgramByIdAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(createInternshipProgramAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateInternshipProgramAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteInternshipProgramAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.programs = state.programs.filter((p) => String(p.id) !== String(id));
      })
      .addCase(deleteInternshipProgramAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  setCurrentProgram,
  addGoal,
  updateGoal,
  deleteGoal,
  addSelectionStage,
  updateSelectionStage,
  deleteSelectionStage,
  reorderSelectionStages,
  setFilters,
  clearError,
  setLoading,
} = internshipProgramSlice.actions;

export default internshipProgramSlice.reducer;
