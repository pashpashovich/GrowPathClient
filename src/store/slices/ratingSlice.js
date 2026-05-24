import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ratingAPI } from '../../services/api';
import { unwrapRatingProfile } from '../../utils/apiResponse';

export const fetchRatingsAsync = createAsyncThunk(
  'rating/fetchRatings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getRatings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке рейтингов');
    }
  }
);

export const fetchInternRatingAsync = createAsyncThunk(
  'rating/fetchInternRating',
  async (internId, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getInternRating(internId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке рейтинга стажера');
    }
  }
);

export const fetchRatingProfileAsync = createAsyncThunk(
  'rating/fetchRatingProfile',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getRatingProfile(params);
      const profile = unwrapRatingProfile(response.data);
      if (!profile) {
        return rejectWithValue('Некорректный ответ сервера (профиль рейтинга)');
      }
      return profile;
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        'Ошибка при загрузке профиля рейтинга';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  ratings: [],
  ratingProfile: null,
  selectedInternshipId: null,
  isLoading: false,
  isProfileLoading: false,
  error: null,
  profileError: null,
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearRatingProfile: (state) => {
      state.ratingProfile = null;
    },
    setSelectedInternship: (state, action) => {
      state.selectedInternshipId = action.payload;
    },
    updateRating: (state, action) => {
      const { internId, ratingData } = action.payload;
      const index = state.ratings.findIndex(rating => rating.internId === internId);
      if (index !== -1) {
        state.ratings[index] = {
          ...state.ratings[index],
          ...ratingData,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    recalculateRanks: (state) => {
      const sortedRatings = [...state.ratings].sort((a, b) => b.overallRating - a.overallRating);
      sortedRatings.forEach((rating, index) => {
        const originalIndex = state.ratings.findIndex(r => r.id === rating.id);
        if (originalIndex !== -1) {
          state.ratings[originalIndex].rank = index + 1;
        }
      });
    },
    addRating: (state, action) => {
      const newRating = {
        ...action.payload,
        id: `rating-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      state.ratings.push(newRating);
      ratingSlice.caseReducers.recalculateRanks(state);
    },
    removeRating: (state, action) => {
      state.ratings = state.ratings.filter(rating => rating.internId !== action.payload);
      ratingSlice.caseReducers.recalculateRanks(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatingsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRatingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload.data || [];
        ratingSlice.caseReducers.recalculateRanks(state);
      })
      .addCase(fetchRatingsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchInternRatingAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternRatingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        const existingIndex = state.ratings.findIndex((r) => r.internId === payload.internId);
        if (existingIndex === -1) {
          state.ratings.push(payload);
        } else {
          state.ratings[existingIndex] = payload;
        }
        ratingSlice.caseReducers.recalculateRanks(state);
      })
      .addCase(fetchInternRatingAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRatingProfileAsync.pending, (state) => {
        state.isProfileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchRatingProfileAsync.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.ratingProfile = action.payload;
      })
      .addCase(fetchRatingProfileAsync.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.profileError = action.payload;
        state.ratingProfile = null;
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  clearProfileError,
  clearRatingProfile,
  setSelectedInternship,
  updateRating,
  recalculateRanks,
  addRating,
  removeRating,
} = ratingSlice.actions;

export default ratingSlice.reducer;






