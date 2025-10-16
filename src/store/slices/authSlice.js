import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
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
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
      localStorage.removeItem('token');
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

export const { login, logout, clearError, setRole, setLoading } = authSlice.actions;
export default authSlice.reducer;