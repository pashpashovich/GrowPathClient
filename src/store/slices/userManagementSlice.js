import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
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
    addUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: `user-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        invitedBy: action.payload.invitedBy || null,
        invitationSentAt: action.payload.invitationSentAt || null,
      };
      state.users.unshift(newUser);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    blockUser: (state, action) => {
      const user = state.users.find(user => user.id === action.payload);
      if (user) {
        user.status = 'blocked';
      }
    },
    unblockUser: (state, action) => {
      const user = state.users.find(user => user.id === action.payload);
      if (user) {
        user.status = 'active';
      }
    },
    changeUserRole: (state, action) => {
      const { userId, newRole } = action.payload;
      const user = state.users.find(user => user.id === userId);
      if (user) {
        user.role = newRole;
      }
    },
    sendInvitation: (state, action) => {
      const { userId } = action.payload;
      const user = state.users.find(user => user.id === userId);
      if (user) {
        user.invitationSentAt = new Date().toISOString();
        user.status = 'pending';
      }
    },
    activateUser: (state, action) => {
      const user = state.users.find(user => user.id === action.payload);
      if (user) {
        user.status = 'active';
        user.lastLogin = new Date().toISOString();
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  changeUserRole,
  sendInvitation,
  activateUser,
  setCurrentUser,
  setFilters,
  clearError,
  setLoading,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;




