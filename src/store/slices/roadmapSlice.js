import { createSlice } from '@reduxjs/toolkit';

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
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStage: (state, action) => {
      state.currentStage = action.payload;
    },
    setCurrentInternship: (state, action) => {
      state.currentInternshipId = action.payload;
    },
    addInternship: (state, action) => {
      const newInternship = {
        ...action.payload,
        id: `internship-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.internships.push(newInternship);
      state.stages[newInternship.id] = [];
    },
    updateInternship: (state, action) => {
      const index = state.internships.findIndex(internship => internship.id === action.payload.id);
      if (index !== -1) {
        state.internships[index] = {
          ...state.internships[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeInternship: (state, action) => {
      state.internships = state.internships.filter(internship => internship.id !== action.payload);
      delete state.stages[action.payload];
      if (state.currentInternshipId === action.payload) {
        const remainingInternships = state.internships.filter(internship => internship.id !== action.payload);
        state.currentInternshipId = remainingInternships.length > 0 ? remainingInternships[0].id : null;
      }
    },
    addStage: (state, action) => {
      const { internshipId, ...stageData } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const newStage = {
          ...stageData,
          id: Date.now(), // Временный ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.stages[targetInternshipId].push(newStage);
      }
    },
    updateStage: (state, action) => {
      const { internshipId, ...stageData } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const index = state.stages[targetInternshipId].findIndex(stage => stage.id === stageData.id);
        if (index !== -1) {
          state.stages[targetInternshipId][index] = {
            ...state.stages[targetInternshipId][index],
            ...stageData,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },
    removeStage: (state, action) => {
      const { internshipId, stageId } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        state.stages[targetInternshipId] = state.stages[targetInternshipId].filter(stage => stage.id !== stageId);
      }
    },
    reorderStages: (state, action) => {
      const { internshipId, stages } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId) {
        state.stages[targetInternshipId] = stages;
      }
    },
    updateStageStatus: (state, action) => {
      const { internshipId, stageId, status, comments } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const stage = state.stages[targetInternshipId].find(s => s.id === stageId);
        if (stage) {
          stage.status = status;
          stage.comments = comments || stage.comments;
          stage.updatedAt = new Date().toISOString();
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCurrentStage,
  setCurrentInternship,
  addInternship,
  updateInternship,
  removeInternship,
  addStage,
  updateStage,
  removeStage,
  reorderStages,
  updateStageStatus,
} = roadmapSlice.actions;

export default roadmapSlice.reducer;
