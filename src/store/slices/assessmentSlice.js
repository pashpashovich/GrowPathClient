import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assessmentAPI } from '../../services/api';
import { getApiErrorMessage, unwrapList } from '../../utils/apiResponse';

function normalizeAssessment(raw) {
  if (!raw) return null;
  const id = raw.id != null ? Number(raw.id) : null;
  const iprStageId = raw.iprStageId != null ? Number(raw.iprStageId) : null;
  if (id == null || iprStageId == null) return null;
  return {
    ...raw,
    id,
    internId: raw.internId != null ? Number(raw.internId) : null,
    internshipId: raw.internshipId != null ? Number(raw.internshipId) : null,
    iprId: raw.iprId != null ? Number(raw.iprId) : null,
    iprStageId,
    overallRating: raw.overallRating != null ? Number(raw.overallRating) : null,
    qualityRating: raw.qualityRating != null ? Number(raw.qualityRating) : null,
    speedRating: raw.speedRating != null ? Number(raw.speedRating) : null,
    communicationRating:
      raw.communicationRating != null ? Number(raw.communicationRating) : null,
  };
}

function buildByStageId(list) {
  const byStageId = {};
  list.forEach((item) => {
    if (item?.iprStageId != null) {
      byStageId[String(item.iprStageId)] = item;
    }
  });
  return byStageId;
}

export const fetchAssessmentsForIprAsync = createAsyncThunk(
  'assessment/fetchForIpr',
  async ({ iprId, internId, internshipId }, { rejectWithValue }) => {
    try {
      const params = { page: 1, limit: 100 };
      if (iprId != null) params.iprId = iprId;
      if (internId != null) params.internId = internId;
      if (internshipId != null) params.internshipId = internshipId;
      const response = await assessmentAPI.getAssessments(params);
      const list = unwrapList(response).map(normalizeAssessment).filter(Boolean);
      return { iprId: String(iprId), list, byStageId: buildByStageId(list) };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось загрузить ассессменты'));
    }
  }
);

export const createAssessmentAsync = createAsyncThunk(
  'assessment/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { iprId, ...body } = payload;
      const response = await assessmentAPI.createAssessment(body);
      const created = normalizeAssessment(response.data?.data ?? response.data);
      if (iprId != null) {
        await dispatch(
          fetchAssessmentsForIprAsync({
            iprId,
            internId: payload.internId,
            internshipId: payload.internshipId,
          })
        );
      }
      return created;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось сохранить ассессмент'));
    }
  }
);

export const updateAssessmentAsync = createAsyncThunk(
  'assessment/update',
  async ({ id, data, refreshParams }, { rejectWithValue, dispatch }) => {
    try {
      const response = await assessmentAPI.updateAssessment(id, data);
      const updated = normalizeAssessment(response.data?.data ?? response.data);
      if (refreshParams?.iprId != null) {
        await dispatch(fetchAssessmentsForIprAsync(refreshParams));
      }
      return updated;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не удалось обновить ассессмент'));
    }
  }
);

const initialState = {
  byIprId: {},
  isLoading: false,
  error: null,
  saveLoading: false,
  saveError: null,
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    clearAssessmentError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    clearAssessmentsForIpr: (state, action) => {
      const iprId = action.payload != null ? String(action.payload) : null;
      if (iprId && state.byIprId[iprId]) {
        delete state.byIprId[iprId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentsForIprAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentsForIprAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { iprId, list, byStageId } = action.payload;
        state.byIprId[iprId] = { list, byStageId };
      })
      .addCase(fetchAssessmentsForIprAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createAssessmentAsync.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(createAssessmentAsync.fulfilled, (state) => {
        state.saveLoading = false;
      })
      .addCase(createAssessmentAsync.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      })
      .addCase(updateAssessmentAsync.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(updateAssessmentAsync.fulfilled, (state) => {
        state.saveLoading = false;
      })
      .addCase(updateAssessmentAsync.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      });
  },
});

export const { clearAssessmentError, clearAssessmentsForIpr } = assessmentSlice.actions;
export default assessmentSlice.reducer;
