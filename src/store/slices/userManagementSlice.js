import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

export const fetchUsersAsync = createAsyncThunk(
  'userManagement/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(params || { page: 1, limit: 100 });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при загрузке пользователей'
      );
    }
  }
);

export const createUserAsync = createAsyncThunk(
  'userManagement/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при создании пользователя'
      );
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'userManagement/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при обновлении пользователя'
      );
    }
  }
);

export const deleteUserAsync = createAsyncThunk(
  'userManagement/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при удалении пользователя'
      );
    }
  }
);

export const blockUserAsync = createAsyncThunk(
  'userManagement/blockUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userAPI.blockUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при блокировке'
      );
    }
  }
);

export const unblockUserAsync = createAsyncThunk(
  'userManagement/unblockUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userAPI.unblockUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при разблокировке'
      );
    }
  }
);

export const changeUserRoleAsync = createAsyncThunk(
  'userManagement/changeUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await userAPI.changeUserRole(id, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при смене роли'
      );
    }
  }
);

export const inviteUserAsync = createAsyncThunk(
  'userManagement/inviteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userAPI.inviteUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при отправке приглашения'
      );
    }
  }
);

const initialState = {
  users: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    role: '',
    search: '',
  },
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data ?? action.payload;
        state.pagination = action.payload.pagination ?? state.pagination;
        state.error = null;
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = { ...state.users[index], ...action.payload };
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(blockUserAsync.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload?.id);
        if (user) user.status = 'blocked';
      })
      .addCase(unblockUserAsync.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload?.id);
        if (user) user.status = 'active';
      })
      .addCase(changeUserRoleAsync.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload?.id);
        if (user) user.role = action.payload?.role ?? user.role;
      })
      .addCase(inviteUserAsync.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload?.id);
        if (user) {
          user.invitationSentAt = action.payload?.invitationSentAt ?? user.invitationSentAt;
          user.status = action.payload?.status ?? user.status;
        }
      });
  },
});

export const {
  setUsers,
  setCurrentUser,
  setFilters,
  clearError,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;




