import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import internReducer from './slices/internSlice';
import mentorReducer from './slices/mentorSlice';
import hrReducer from './slices/hrSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    intern: internReducer,
    mentor: mentorReducer,
    hr: hrReducer,
  },
});