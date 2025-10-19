import { createSlice } from '@reduxjs/toolkit';
import { mockTasks } from '../../data/mockData';

const initialState = {
  tasks: mockTasks,
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    assignee: '',
    priority: '',
    internshipId: '', // Фильтр по стажировкам
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask && state.currentTask.id === action.payload.id) {
        state.currentTask = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        assignee: '',
        priority: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Новые действия для стажеров
    takeTask: (state, action) => {
      const { taskId, internId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'in_progress';
        task.takenBy = internId;
        task.takenAt = new Date().toISOString();
        task.statusHistory = task.statusHistory || [];
        task.statusHistory.push({
          status: 'in_progress',
          changedBy: internId,
          changedAt: new Date().toISOString(),
          comment: 'Задача взята в работу'
        });
        // Обновляем currentTask если это текущая задача
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = task;
        }
      }
    },
    submitTask: (state, action) => {
      const { taskId, internId, files, links, comment } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'submitted';
        task.submittedBy = internId;
        task.submittedAt = new Date().toISOString();
        task.submissionFiles = files || [];
        task.submissionLinks = links || [];
        task.submissionComment = comment;
        task.statusHistory = task.statusHistory || [];
        task.statusHistory.push({
          status: 'submitted',
          changedBy: internId,
          changedAt: new Date().toISOString(),
          comment: comment || 'Задача сдана на проверку'
        });
        // Обновляем currentTask если это текущая задача
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = task;
        }
      }
    },
    reviewTask: (state, action) => {
      const { taskId, mentorId, status, comment, rating } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = status;
        task.reviewedBy = mentorId;
        task.reviewedAt = new Date().toISOString();
        task.reviewComment = comment;
        if (rating !== undefined) {
          task.rating = rating;
        }
        task.statusHistory = task.statusHistory || [];
        task.statusHistory.push({
          status: status,
          changedBy: mentorId,
          changedAt: new Date().toISOString(),
          comment: comment || 'Задача проверена',
          rating: rating
        });
        // Обновляем currentTask если это текущая задача
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = task;
        }
      }
    },
    addTaskComment: (state, action) => {
      const { taskId, userId, comment } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.comments = task.comments || [];
        task.comments.push({
          id: Date.now(),
          userId,
          comment,
          createdAt: new Date().toISOString()
        });
        // Обновляем currentTask если это текущая задача
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = task;
        }
      }
    }
  },
});

export const { 
  setTasks, 
  setCurrentTask, 
  addTask, 
  updateTask, 
  removeTask,
  clearError, 
  setFilters, 
  clearFilters, 
  setPagination,
  setLoading,
  takeTask,
  submitTask,
  reviewTask,
  addTaskComment
} = taskSlice.actions;
export default taskSlice.reducer;
