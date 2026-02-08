import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

function getNormalizedRole(user) {
  const roles = user?.roles;
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const r = roles[0];
    if (typeof r === 'string') return r.replace(/^ROLE_/, '').toLowerCase();
  }
  return user?.role ?? null;
}

const initialState = {
  user: null,
  tokens: {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  },
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  role: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const userResponse = await authAPI.getCurrentUser();
      const user = userResponse.data;
      
      return { tokens: { accessToken, refreshToken }, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при входе в систему'
      );
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const refreshToken = getState().auth.tokens.refreshToken;
      if (refreshToken) {
        try {
          await authAPI.logout(refreshToken);
        } catch (error) {
          // Игнорируем ошибки при выходе, все равно очищаем локальное хранилище
          console.warn('Logout API error:', error);
        }
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при выходе'
      );
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при получении информации о пользователе'
      );
    }
  }
);

export const validateTokenAsync = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.validateToken();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Токен невалиден'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
      const user = action.payload;
      const role = getNormalizedRole(user);
      state.user = user ? { ...user, role } : null;
      state.role = role;
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
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
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const user = action.payload.user;
        const role = getNormalizedRole(user);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = user ? { ...user, role } : null;
        state.role = role;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.role = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.role = null;
      })
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        const user = action.payload;
        const role = getNormalizedRole(user);
        state.isLoading = false;
        state.user = user ? { ...user, role } : null;
        state.role = role;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('401') || action.payload?.includes('токен')) {
          state.isAuthenticated = false;
          state.user = null;
          state.tokens = { accessToken: null, refreshToken: null };
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      })
      .addCase(validateTokenAsync.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(validateTokenAsync.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { logout, setUser, setTokens, clearError, setRole, setLoading } = authSlice.actions;
export default authSlice.reducer;