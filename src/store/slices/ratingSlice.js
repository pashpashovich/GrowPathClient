import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ratings: [
    {
      id: 'rating-1',
      internId: 'intern-1',
      internName: 'Анна Петрова',
      position: 'Frontend разработчик',
      mentorName: 'Алексей Козлов',
      overallRating: 9.0,
      qualityRating: 9.2,
      speedRating: 8.8,
      experience: 2, // в месяцах
      tasksCompleted: 12,
      tasksOnTime: 11,
      averageTaskTime: 2.5, // дня
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'up', // up, down, stable
      previousRating: 8.7,
      rank: 1,
      internshipId: 'internship-1'
    },
    {
      id: 'rating-2',
      internId: 'intern-2',
      internName: 'Дмитрий Иванов',
      position: 'Backend разработчик',
      mentorName: 'Алексей Козлов',
      overallRating: 7.6,
      qualityRating: 8.1,
      speedRating: 7.1,
      experience: 5,
      tasksCompleted: 8,
      tasksOnTime: 6,
      averageTaskTime: 4.2,
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'down',
      previousRating: 8.0,
      rank: 2,
      internshipId: 'internship-2'
    },
    {
      id: 'rating-3',
      internId: 'intern-3',
      internName: 'Елена Сидорова',
      position: 'QA тестировщик',
      mentorName: 'Алексей Козлов',
      overallRating: 9.4,
      qualityRating: 9.6,
      speedRating: 9.2,
      experience: 3,
      tasksCompleted: 15,
      tasksOnTime: 14,
      averageTaskTime: 1.8,
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'up',
      previousRating: 9.1,
      rank: 3,
      internshipId: 'internship-3'
    },
    {
      id: 'rating-4',
      internId: 'intern-4',
      internName: 'Иван Иванов',
      position: 'Java разработчик',
      mentorName: 'Алексей Козлов',
      overallRating: 5.6,
      qualityRating: 6.2,
      speedRating: 5.0,
      experience: 3,
      tasksCompleted: 6,
      tasksOnTime: 4,
      averageTaskTime: 6.5,
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'down',
      previousRating: 6.1,
      rank: 4,
      internshipId: 'internship-1'
    },
    {
      id: 'rating-5',
      internId: 'intern-5',
      internName: 'Мария Козлова',
      position: 'ML инженер',
      mentorName: 'Алексей Козлов',
      overallRating: 9.0,
      qualityRating: 9.3,
      speedRating: 8.7,
      experience: 3,
      tasksCompleted: 10,
      tasksOnTime: 9,
      averageTaskTime: 3.1,
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'stable',
      previousRating: 9.0,
      rank: 5,
      internshipId: 'internship-2'
    },
    {
      id: 'rating-6',
      internId: 'intern-6',
      internName: 'Петр Смирнов',
      position: 'Data аналитик',
      mentorName: 'Алексей Козлов',
      overallRating: 9.0,
      qualityRating: 8.9,
      speedRating: 9.1,
      experience: 3,
      tasksCompleted: 11,
      tasksOnTime: 10,
      averageTaskTime: 2.8,
      lastUpdated: '2024-01-25T10:00:00Z',
      trend: 'up',
      previousRating: 8.8,
      rank: 6,
      internshipId: 'internship-3'
    }
  ],
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
      // Сортируем по общему рейтингу и обновляем ранги
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
      // Пересчитываем ранги
      ratingSlice.caseReducers.recalculateRanks(state);
    },
    removeRating: (state, action) => {
      state.ratings = state.ratings.filter(rating => rating.internId !== action.payload);
      // Пересчитываем ранги
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


