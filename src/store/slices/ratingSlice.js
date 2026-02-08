import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ratings: [],
  selectedInternshipId: null,
  isLoading: false,
  error: null,
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
});

export const {
  setLoading,
  setError,
  clearError,
  setSelectedInternship,
  updateRating,
  recalculateRanks,
  addRating,
  removeRating,
} = ratingSlice.actions;

export default ratingSlice.reducer;






