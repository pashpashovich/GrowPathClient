import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roadmapAPI } from '../../services/api';

const toArray = (body) => (Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []);

const normalizeInternship = (x) => ({
  ...x,
  id: String(x.id),
  programId: x.programId != null ? Number(x.programId) : null,
  mentorId: x.mentorId != null ? Number(x.mentorId) : null,
  internIds: Array.isArray(x.internIds) ? x.internIds : [],
});

const normalizeStage = (x) => ({
  ...x,
  id: String(x.id),
  roadmapId: x.roadmapId != null ? Number(x.roadmapId) : null,
  order: Number.isFinite(Number(x.order)) ? Number(x.order) : 0,
  comments: x.comments ?? '',
});

export const fetchInternshipsAsync = createAsyncThunk(
  'roadmap/fetchInternships',
  async (params, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.getInternships(params || {});
      return toArray(response.data).map(normalizeInternship);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки стажировок');
    }
  }
);

export const fetchInternshipsProfileAsync = createAsyncThunk(
  'roadmap/fetchInternshipsProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.getInternshipsProfile();
      return toArray(response.data).map(normalizeInternship);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки стажировок профиля');
    }
  }
);

export const fetchInternshipsByProgramAsync = createAsyncThunk(
  'roadmap/fetchInternshipsByProgram',
  async (programId, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.getInternshipsByProgram(programId);
      return toArray(response.data).map(normalizeInternship);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки стажировок программы');
    }
  }
);

export const createInternshipAsync = createAsyncThunk(
  'roadmap/createInternship',
  async (payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await roadmapAPI.createInternship(payload);
      const created = normalizeInternship(response.data?.data ?? response.data);
      const role = getState().auth?.user?.role;
      if (role === 'intern') {
        await dispatch(fetchInternshipsProfileAsync());
      } else {
        await dispatch(fetchInternshipsAsync());
      }
      return created;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания стажировки');
    }
  }
);

export const updateInternshipAsync = createAsyncThunk(
  'roadmap/updateInternship',
  async ({ internshipId, data }, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.updateInternship(internshipId, data);
      return normalizeInternship(response.data?.data ?? response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления стажировки');
    }
  }
);

export const deleteInternshipAsync = createAsyncThunk(
  'roadmap/deleteInternship',
  async (internshipId, { rejectWithValue }) => {
    try {
      await roadmapAPI.deleteInternship(internshipId);
      return String(internshipId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления стажировки');
    }
  }
);

export const fetchStagesAsync = createAsyncThunk(
  'roadmap/fetchStages',
  async (internshipId, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.getStages(internshipId);
      const stages = toArray(response.data).map(normalizeStage).sort((a, b) => a.order - b.order);
      return { internshipId: String(internshipId), stages };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки этапов');
    }
  }
);

export const createStageAsync = createAsyncThunk(
  'roadmap/createStage',
  async ({ internshipId, data }, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.createStage(internshipId, data);
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания этапа');
    }
  }
);

export const updateStageAsync = createAsyncThunk(
  'roadmap/updateStage',
  async ({ internshipId, stageId, data }, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.updateStage(internshipId, stageId, data);
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления этапа');
    }
  }
);

export const deleteStageAsync = createAsyncThunk(
  'roadmap/deleteStage',
  async ({ internshipId, stageId }, { rejectWithValue }) => {
    try {
      await roadmapAPI.deleteStage(internshipId, stageId);
      return { internshipId: String(internshipId), stageId: String(stageId) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления этапа');
    }
  }
);

export const reorderStagesAsync = createAsyncThunk(
  'roadmap/reorderStages',
  async ({ internshipId, stageIds }, { rejectWithValue, dispatch }) => {
    try {
      await roadmapAPI.reorderStages(internshipId, stageIds.map((id) => Number(id)));
      await dispatch(fetchStagesAsync(internshipId));
      return { internshipId: String(internshipId) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка переупорядочивания этапов');
    }
  }
);

export const changeStageStatusAsync = createAsyncThunk(
  'roadmap/changeStageStatus',
  async ({ internshipId, stageId, status, comments }, { rejectWithValue }) => {
    try {
      const response = await roadmapAPI.changeStageStatus(internshipId, stageId, { status, comments });
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка смены статуса этапа');
    }
  }
);

const initialState = {
  internships: [],
  currentInternshipId: null,
  stages: {},
  currentStage: null,
  isLoading: false,
  error: null,
};

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStage: (state, action) => {
      state.currentStage = action.payload;
    },
    setCurrentInternship: (state, action) => {
      state.currentInternshipId = action.payload ? String(action.payload) : null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternshipsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipsProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipsByProgramAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
        if (!state.currentInternshipId && action.payload.length > 0) {
          state.currentInternshipId = action.payload[0].id;
        }
      })
      .addCase(fetchInternshipsProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
        state.currentInternshipId = action.payload[0]?.id || null;
      })
      .addCase(fetchInternshipsByProgramAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
        if (!state.currentInternshipId && action.payload.length > 0) {
          state.currentInternshipId = action.payload[0].id;
        }
      })
      .addCase(updateInternshipAsync.fulfilled, (state, action) => {
        const idx = state.internships.findIndex((x) => x.id === action.payload.id);
        if (idx !== -1) state.internships[idx] = action.payload;
      })
      .addCase(deleteInternshipAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.internships = state.internships.filter((x) => x.id !== id);
        delete state.stages[id];
        if (state.currentInternshipId === id) {
          state.currentInternshipId = state.internships[0]?.id || null;
        }
      })
      .addCase(fetchStagesAsync.fulfilled, (state, action) => {
        state.stages[action.payload.internshipId] = action.payload.stages;
      })
      .addCase(createStageAsync.fulfilled, (state, action) => {
        const { internshipId, stage } = action.payload;
        const list = state.stages[internshipId] || [];
        list.push(stage);
        list.sort((a, b) => a.order - b.order);
        state.stages[internshipId] = list;
      })
      .addCase(updateStageAsync.fulfilled, (state, action) => {
        const { internshipId, stage } = action.payload;
        const list = state.stages[internshipId] || [];
        const idx = list.findIndex((s) => s.id === stage.id);
        if (idx !== -1) list[idx] = stage;
        state.stages[internshipId] = [...list].sort((a, b) => a.order - b.order);
      })
      .addCase(changeStageStatusAsync.fulfilled, (state, action) => {
        const { internshipId, stage } = action.payload;
        const list = state.stages[internshipId] || [];
        const idx = list.findIndex((s) => s.id === stage.id);
        if (idx !== -1) list[idx] = stage;
        state.stages[internshipId] = [...list];
      })
      .addCase(deleteStageAsync.fulfilled, (state, action) => {
        const { internshipId, stageId } = action.payload;
        state.stages[internshipId] = (state.stages[internshipId] || []).filter((s) => s.id !== stageId);
      })
      .addMatcher(
        (action) => action.type.startsWith('roadmap/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Ошибка запроса';
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('roadmap/') &&
          action.type.endsWith('/fulfilled') &&
          (action.type.includes('create') || action.type.includes('update') || action.type.includes('delete')),
        (state) => {
          state.error = null;
        }
      );
  },
});

export const { clearError, setCurrentStage, setCurrentInternship } = roadmapSlice.actions;

export default roadmapSlice.reducer;
