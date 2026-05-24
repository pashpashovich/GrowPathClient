import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiResponse';

function parseTaskListResponse(responseData) {
  const body = responseData ?? {};
  const tasks = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
  return { data: tasks, pagination: body.pagination ?? null };
}

function mergeTaskPatch(state, patch) {
  if (!patch?.id) return;
  const index = state.tasks.findIndex((t) => t.id === patch.id);
  if (index !== -1) {
    state.tasks[index] = { ...state.tasks[index], ...patch };
  }
  if (state.currentTask && state.currentTask.id === patch.id) {
    state.currentTask = { ...state.currentTask, ...patch };
  }
}

// Async Thunks
export const fetchTasksAsync = createAsyncThunk(
  'task/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке задач');
    }
  }
);

export const fetchTaskByIdAsync = createAsyncThunk(
  'task/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTaskById(id);
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке задачи');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'task/createTask',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(data);
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Ошибка при создании задачи'));
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'task/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(id, data);
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении задачи');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'task/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении задачи');
    }
  }
);

export const takeTaskAsync = createAsyncThunk(
  'task/takeTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.takeTask(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при взятии задачи');
    }
  }
);

export const submitTaskAsync = createAsyncThunk(
  'task/submitTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.submitTask(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при отправке задачи');
    }
  }
);

export const reviewTaskAsync = createAsyncThunk(
  'task/reviewTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.reviewTask(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при проверке задачи');
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'task/addComment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.addComment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при добавлении комментария');
    }
  }
);

export const fetchTaskProfileAsync = createAsyncThunk(
  'task/fetchTaskProfile',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTaskProfile(params);
      return parseTaskListResponse(response.data);
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data === 'string' && data) ||
        data?.message ||
        'Ошибка при загрузке задач';
      return rejectWithValue(message);
    }
  }
);

/** @deprecated Use fetchTaskProfileAsync — same endpoint for interns */
export const fetchMyTasksAsync = fetchTaskProfileAsync;

export const patchTaskStatusAsync = createAsyncThunk(
  'task/patchTaskStatus',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.patchTaskStatus(id, body);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Переход статуса недоступен для этой задачи'
      );
    }
  }
);

export const reorderTasksAsync = createAsyncThunk(
  'task/reorderTasks',
  async ({ items, status }, { rejectWithValue }) => {
    try {
      await taskAPI.reorderTasks(items, status);
      return { items, status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось сохранить порядок');
    }
  }
);

export const completeTaskAsync = createAsyncThunk(
  'task/completeTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.completeTask(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при завершении задачи');
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    assignee: '',
    priority: '',
    internshipId: '',
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
        internshipId: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
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
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask = task;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Task By ID
      .addCase(fetchTaskByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
        // Обновляем задачу в списке, если она там есть
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(fetchTaskByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Task
      .addCase(deleteTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.currentTask && state.currentTask.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Take Task
      .addCase(takeTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(takeTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        mergeTaskPatch(state, action.payload);
      })
      .addCase(takeTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit Task
      .addCase(submitTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        mergeTaskPatch(state, action.payload);
      })
      .addCase(submitTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Review Task
      .addCase(reviewTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reviewTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        mergeTaskPatch(state, action.payload);
      })
      .addCase(reviewTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addCommentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskId = action.payload.taskId;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.comments = task.comments || [];
          task.comments.push(action.payload);
        }
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask.comments = state.currentTask.comments || [];
          state.currentTask.comments.push(action.payload);
        }
      })
      .addCase(addCommentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchTaskProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(patchTaskStatusAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(patchTaskStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        mergeTaskPatch(state, action.payload);
      })
      .addCase(patchTaskStatusAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(reorderTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { items } = action.payload;
        items.forEach(({ id, sortOrder }) => mergeTaskPatch(state, { id, sortOrder }));
      })
      .addCase(reorderTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        mergeTaskPatch(state, action.payload);
      })
      .addCase(completeTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
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
