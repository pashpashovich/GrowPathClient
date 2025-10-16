import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
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

