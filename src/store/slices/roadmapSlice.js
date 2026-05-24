import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roadmapAPI, iprAPI } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiResponse';

const toArray = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (body.data && typeof body.data === 'object') return [body.data];
  if (body.id != null) return [body];
  return [];
};

const pickDefaultInternship = (list) =>
  list.find((item) => item.status === 'active') || list[0] || null;

const normalizeInternship = (x) => ({
  ...x,
  id: String(x.id),
  programId: x.programId != null ? Number(x.programId) : null,
  templateId: x.templateId != null ? Number(x.templateId) : null,
  mentorId:
    x.mentorId != null
      ? Number(x.mentorId)
      : x.mentorUserId != null
        ? Number(x.mentorUserId)
        : x.mentor?.id != null
          ? Number(x.mentor.id)
          : x.mentor?.userId != null
            ? Number(x.mentor.userId)
            : null,
  internId: x.internId != null ? Number(x.internId) : null,
  internIds: Array.isArray(x.internIds)
    ? x.internIds
    : x.internId != null
      ? [String(x.internId)]
      : [],
  startDate: x.startDate || null,
  endDate: x.endDate || null,
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
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка загрузки стажировок'));
    }
  }
);

export const fetchInternshipsProfileAsync = createAsyncThunk(
  'roadmap/fetchInternshipsProfile',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await iprAPI.getMyIprs();
      const list = toArray(response.data).map(normalizeInternship);
      const selected = pickDefaultInternship(list);
      if (selected) {
        await dispatch(
          fetchStagesAsync({ internshipId: selected.id, useIpr: true })
        );
      }
      return list;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка загрузки стажировок профиля'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка загрузки стажировок программы'));
    }
  }
);

export const fetchIprsAsync = createAsyncThunk(
  'roadmap/fetchIprs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await iprAPI.getIprs(params || {});
      return toArray(response.data).map(normalizeInternship);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка загрузки ИПР'));
    }
  }
);

export const createInternshipAsync = createAsyncThunk(
  'roadmap/createInternship',
  async ({ data, useIpr = false }, { rejectWithValue, dispatch, getState }) => {
    try {
      const role = getState().auth?.user?.role;
      const shouldUseIpr = useIpr || role === 'intern';
      const response = shouldUseIpr
        ? await iprAPI.createIpr(data)
        : await roadmapAPI.createInternship(data);
      const created = normalizeInternship(response.data?.data ?? response.data);
      if (shouldUseIpr && role === 'intern') {
        await dispatch(fetchInternshipsProfileAsync());
      } else if (!shouldUseIpr) {
        await dispatch(fetchInternshipsAsync());
      }
      return created;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка создания стажировки'));
    }
  }
);

export const updateInternshipAsync = createAsyncThunk(
  'roadmap/updateInternship',
  async ({ internshipId, data, useIpr }, { rejectWithValue }) => {
    try {
      const response = useIpr
        ? await iprAPI.updateIpr(internshipId, data)
        : await roadmapAPI.updateInternship(internshipId, data);
      return normalizeInternship(response.data?.data ?? response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка обновления стажировки'));
    }
  }
);

export const deleteInternshipAsync = createAsyncThunk(
  'roadmap/deleteInternship',
  async ({ internshipId, useIpr }, { rejectWithValue }) => {
    try {
      if (useIpr) {
        await iprAPI.deleteIpr(internshipId);
      } else {
        await roadmapAPI.deleteInternship(internshipId);
      }
      return String(internshipId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка удаления стажировки'));
    }
  }
);

export const fetchStagesAsync = createAsyncThunk(
  'roadmap/fetchStages',
  async ({ internshipId, useIpr }, { rejectWithValue }) => {
    try {
      const response = useIpr
        ? await iprAPI.getIprStages(internshipId)
        : await roadmapAPI.getStages(internshipId);
      const stages = toArray(response.data).map(normalizeStage).sort((a, b) => a.order - b.order);
      return { internshipId: String(internshipId), stages };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка загрузки этапов'));
    }
  }
);

export const createStageAsync = createAsyncThunk(
  'roadmap/createStage',
  async ({ internshipId, data, useIpr }, { rejectWithValue }) => {
    try {
      const response = useIpr
        ? await iprAPI.createIprStage(internshipId, data)
        : await roadmapAPI.createStage(internshipId, data);
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка создания этапа'));
    }
  }
);

export const updateStageAsync = createAsyncThunk(
  'roadmap/updateStage',
  async ({ internshipId, stageId, data, useIpr }, { rejectWithValue }) => {
    try {
      const response = useIpr
        ? await iprAPI.updateIprStage(internshipId, stageId, data)
        : await roadmapAPI.updateStage(internshipId, stageId, data);
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка обновления этапа'));
    }
  }
);

export const deleteStageAsync = createAsyncThunk(
  'roadmap/deleteStage',
  async ({ internshipId, stageId, useIpr }, { rejectWithValue }) => {
    try {
      if (useIpr) {
        await iprAPI.deleteIprStage(internshipId, stageId);
      } else {
        await roadmapAPI.deleteStage(internshipId, stageId);
      }
      return { internshipId: String(internshipId), stageId: String(stageId) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка удаления этапа'));
    }
  }
);

export const reorderStagesAsync = createAsyncThunk(
  'roadmap/reorderStages',
  async ({ internshipId, stageIds, useIpr }, { rejectWithValue, dispatch }) => {
    try {
      if (useIpr) {
        await iprAPI.reorderIprStages(internshipId, stageIds.map((id) => Number(id)));
      } else {
        await roadmapAPI.reorderStages(internshipId, stageIds.map((id) => Number(id)));
      }
      await dispatch(fetchStagesAsync({ internshipId, useIpr }));
      return { internshipId: String(internshipId) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка переупорядочивания этапов'));
    }
  }
);

export const changeStageStatusAsync = createAsyncThunk(
  'roadmap/changeStageStatus',
  async ({ internshipId, stageId, status, comments, useIpr }, { rejectWithValue }) => {
    try {
      const response = useIpr
        ? await iprAPI.changeIprStageStatus(internshipId, stageId, { status, comments })
        : await roadmapAPI.changeStageStatus(internshipId, stageId, { status, comments });
      return { internshipId: String(internshipId), stage: normalizeStage(response.data?.data ?? response.data) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка смены статуса этапа'));
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
      .addCase(fetchIprsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
      })
      .addCase(fetchInternshipsProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
        const selected = pickDefaultInternship(action.payload);
        if (selected) {
          state.currentInternshipId = String(selected.id);
        }
      })
      .addCase(fetchInternshipsByProgramAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
      })
      .addCase(fetchIprsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.internships = action.payload;
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
          state.currentInternshipId = null;
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
