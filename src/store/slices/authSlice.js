import { createSlice } from '@reduxjs/toolkit';
import { mockCurrentUser } from '../../data/mockData';

const initialState = {
  user: null,
  tokens: {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  },
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  role: null, // 'intern', 'mentor', 'hr', 'admin'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.role = action.payload.user.role;
      state.error = null;
      localStorage.setItem('accessToken', action.payload.tokens.accessToken);
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = { accessToken: null, refreshToken: null };
      state.role = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload.role;
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearError: (state) => {
      state.error = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { login, logout, setUser, setTokens, clearError, setRole, setLoading } = authSlice.actions;
export default authSlice.reducer;