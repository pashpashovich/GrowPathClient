import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [
    {
      id: 'user-1',
      email: 'mentor@example.com',
      name: 'Алексей Козлов',
      role: 'mentor',
      status: 'active', // active, blocked, pending
      createdAt: '2024-01-10T10:00:00Z',
      lastLogin: '2024-01-25T09:15:00Z',
      invitedBy: null,
      invitationSentAt: null,
    },
    {
      id: 'user-2',
      email: 'intern@example.com',
      name: 'Анна Петрова',
      role: 'intern',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      lastLogin: '2024-01-25T08:30:00Z',
      invitedBy: 'user-1',
      invitationSentAt: '2024-01-14T15:00:00Z',
    },
    {
      id: 'user-3',
      email: 'hr@example.com',
      name: 'Мария Волкова',
      role: 'hr',
      status: 'active',
      createdAt: '2024-01-20T10:00:00Z',
      lastLogin: '2024-01-25T10:00:00Z',
      invitedBy: 'user-1',
      invitationSentAt: '2024-01-19T14:00:00Z',
    },
    {
      id: 'user-4',
      email: 'newuser@example.com',
      name: 'Иван Сидоров',
      role: 'intern',
      status: 'pending', // Ожидает активации
      createdAt: '2024-01-24T10:00:00Z',
      lastLogin: null,
      invitedBy: 'user-1',
      invitationSentAt: '2024-01-24T10:00:00Z',
    },
    {
      id: 'user-5',
      email: 'blocked@example.com',
      name: 'Петр Заблокированный',
      role: 'intern',
      status: 'blocked',
      createdAt: '2024-01-15T10:00:00Z',
      lastLogin: '2024-01-20T10:00:00Z',
      invitedBy: 'user-1',
      invitationSentAt: '2024-01-14T15:00:00Z',
    }
  ],
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




