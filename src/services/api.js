import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const authV1Suffix = (pathAfterV1Auth) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return base.endsWith('/v1') ? pathAfterV1Auth : `/v1${pathAfterV1Auth}`;
};

const v1ResourcePath = (relativePath) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return base.endsWith('/v1') ? p : `/v1${p}`;
};

const internshipProgramsPath = v1ResourcePath('/internship-programs');
const competenciesPath = v1ResourcePath('/competencies');
const itDirectionsPath = v1ResourcePath('/it-directions');
const programRequirementDefinitionsPath = v1ResourcePath('/program-requirement-definitions');
const programGoalDefinitionsPath = v1ResourcePath('/program-goal-definitions');
const programSelectionStageDefinitionsPath = v1ResourcePath('/program-selection-stage-definitions');

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
    let token = localStorage.getItem('accessToken');
    if (!token && getStore) {
      try {
        token = getStore().getState()?.auth?.tokens?.accessToken || null;
      } catch {
      }
    }
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
      const reqUrl = originalRequest.url || '';
      if (
        reqUrl.includes('/auth/login') ||
        reqUrl.includes('/auth/refresh') ||
        reqUrl.includes('complete-registration')
      ) {
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
          authV1Suffix('/auth/refresh'),
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
  login: (credentials) => api.post(authV1Suffix('/auth/login'), credentials),
  logout: (refreshToken) => api.post(authV1Suffix('/auth/logout'), { refreshToken }),
  refreshToken: (refreshToken) => api.post(authV1Suffix('/auth/refresh'), { refreshToken }),
  getCurrentUser: () => api.get(authV1Suffix('/auth/user')),
  validateToken: () => api.get(authV1Suffix('/auth/validate')),
  /** Публичный вызов: токен из письма в теле запроса. */
  completeRegistration: (payload) =>
    api.post(authV1Suffix('/auth/complete-registration'), payload),
};

const usersBase = '/users';
export const userAPI = {
  getUsers: (params) => api.get(usersBase, { params }),
  getUserById: (id) => api.get(`${usersBase}/${id}`),
  createUser: (data) => api.post(usersBase, data),
  updateUser: (id, data) => api.put(`${usersBase}/${id}`, data),
  deleteUser: (id) => api.delete(`${usersBase}/${id}`),
  blockUser: (id) => api.post(`${usersBase}/${id}/block`),
  unblockUser: (id) => api.post(`${usersBase}/${id}/unblock`),
  inviteUser: (id) => api.post(`${usersBase}/${id}/invite`),
  changeUserRole: (id, role) => api.patch(`${usersBase}/${id}/role`, { role }),
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
  getCompetencies: () => api.get(competenciesPath),
  createCompetency: (data) => api.post(competenciesPath, data),
  updateCompetency: (id, data) => api.put(`${competenciesPath}/${id}`, data),

  getItDirections: () => api.get(itDirectionsPath),
  createItDirection: (data) => api.post(itDirectionsPath, data),
  updateItDirection: (id, data) => api.put(`${itDirectionsPath}/${id}`, data),

  getProgramRequirementDefinitions: () => api.get(programRequirementDefinitionsPath),
  createProgramRequirementDefinition: (data) =>
    api.post(programRequirementDefinitionsPath, data),
  updateProgramRequirementDefinition: (id, data) =>
    api.put(`${programRequirementDefinitionsPath}/${id}`, data),

  getProgramGoalDefinitions: () => api.get(programGoalDefinitionsPath),
  createProgramGoalDefinition: (data) => api.post(programGoalDefinitionsPath, data),
  updateProgramGoalDefinition: (id, data) =>
    api.put(`${programGoalDefinitionsPath}/${id}`, data),

  getProgramSelectionStageDefinitions: () => api.get(programSelectionStageDefinitionsPath),
  createProgramSelectionStageDefinition: (data) =>
    api.post(programSelectionStageDefinitionsPath, data),
  updateProgramSelectionStageDefinition: (id, data) =>
    api.put(`${programSelectionStageDefinitionsPath}/${id}`, data),

  getInternshipPrograms: (params) => api.get(internshipProgramsPath, { params }),
  getInternshipProgramById: (id) => api.get(`${internshipProgramsPath}/${id}`),
  createInternshipProgram: (data) => api.post(internshipProgramsPath, data),
  updateInternshipProgram: (id, data) => api.put(`${internshipProgramsPath}/${id}`, data),
  deleteInternshipProgram: (id) => api.delete(`${internshipProgramsPath}/${id}`),
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
  takeTask: (id) => api.post(`/tasks/${id}/take`),
  submitTask: (id, data) => api.post(`/tasks/${id}/submit`, data),
  reviewTask: (id, data) => api.post(`/tasks/${id}/review`, data),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
  getComments: (id) => api.get(`/tasks/${id}/comments`),
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
