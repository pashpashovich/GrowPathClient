import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

let getStore = null;

export const setStore = (storeInstance) => {
  getStore = () => storeInstance;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`[API Error] ${error.response?.status || 'NETWORK'} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        isRefreshing = false;
        if (getStore) {
          getStore().dispatch({ type: 'auth/logout' });
        }
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await api.post(
          '/auth/refresh',
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        if (getStore) {
          getStore().dispatch({
            type: 'auth/setTokens',
            payload: {
              accessToken,
              refreshToken: newRefreshToken || refreshToken,
            },
          });
        }

        isRefreshing = false;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (getStore) {
          getStore().dispatch({ type: 'auth/logout' });
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => api.get('/auth/user'),
  validateToken: () => api.get('/auth/validate'),
};

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const internAPI = {
  getInterns: (params) => api.get('/interns', { params }),
  getInternById: (id) => api.get(`/interns/${id}`),
  createIntern: (data) => api.post('/interns', data),
  updateIntern: (id, data) => api.put(`/interns/${id}`, data),
  deleteIntern: (id) => api.delete(`/interns/${id}`),
  getInternProgress: (id) => api.get(`/interns/${id}/progress`),
  getInternTasks: (id) => api.get(`/interns/${id}/tasks`),
  getInternAssessments: (id) => api.get(`/interns/${id}/assessments`),
};

export const mentorAPI = {
  getMentors: (params) => api.get('/mentors', { params }),
  getMentorById: (id) => api.get(`/mentors/${id}`),
  getMentorInterns: (id) => api.get(`/mentors/${id}/interns`),
  createAssessment: (data) => api.post('/assessments', data),
  updateAssessment: (id, data) => api.put(`/assessments/${id}`, data),
  getAssessments: (params) => api.get('/assessments', { params }),
};

export const hrAPI = {
  getInternshipPrograms: (params) => api.get('/internship-programs', { params }),
  createInternshipProgram: (data) => api.post('/internship-programs', data),
  updateInternshipProgram: (id, data) => api.put(`/internship-programs/${id}`, data),
  deleteInternshipProgram: (id) => api.delete(`/internship-programs/${id}`),
  getReports: (params) => api.get('/reports', { params }),
  getDashboardData: () => api.get('/dashboard'),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
};

export const assessmentAPI = {
  getAssessments: (params) => api.get('/assessments', { params }),
  getAssessmentById: (id) => api.get(`/assessments/${id}`),
  createAssessment: (data) => api.post('/assessments', data),
  updateAssessment: (id, data) => api.put(`/assessments/${id}`, data),
  deleteAssessment: (id) => api.delete(`/assessments/${id}`),
};

export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
};

export default api;


