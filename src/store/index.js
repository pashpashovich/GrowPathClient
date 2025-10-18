import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import internReducer from './slices/internSlice';
import mentorReducer from './slices/mentorSlice';
import hrReducer from './slices/hrSlice';
import taskReducer from './slices/taskSlice';
import roadmapReducer from './slices/roadmapSlice';
import ratingReducer from './slices/ratingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    intern: internReducer,
    mentor: mentorReducer,
    hr: hrReducer,
    task: taskReducer,
    roadmap: roadmapReducer,
    rating: ratingReducer,
  },
});