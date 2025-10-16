import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mentors: [],
  currentMentor: null,
  mentorInterns: [],
  assessments: [],
  isLoading: false,
  error: null,
};

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMentor: (state, action) => {
      state.currentMentor = action.payload;
    },
    setMentorInterns: (state, action) => {
      state.mentorInterns = action.payload;
    },
    setAssessments: (state, action) => {
      state.assessments = action.payload;
    },
  },
});

export const { clearError, setCurrentMentor, setMentorInterns, setAssessments } = mentorSlice.actions;
export default mentorSlice.reducer;

