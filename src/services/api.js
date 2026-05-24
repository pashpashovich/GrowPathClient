import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const authV1Suffix = (pathAfterV1Auth) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return base.endsWith('/v1') ? pathAfterV1Auth : `/v1${pathAfterV1Auth}`;
};

export const v1ResourcePath = (relativePath) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return base.endsWith('/v1') ? p : `/v1${p}`;
};

const internshipProgramsPath = v1ResourcePath('/internship-programs');
const iprsPath = v1ResourcePath('/iprs');
const roadmapTemplatesPath = v1ResourcePath('/roadmap-templates');
const internsPath = v1ResourcePath('/interns');
const mentorsPath = v1ResourcePath('/mentors');
const assessmentsPath = v1ResourcePath('/assessments');
const competenciesPath = v1ResourcePath('/competencies');
const itDirectionsPath = v1ResourcePath('/it-directions');
const programRequirementDefinitionsPath = v1ResourcePath('/program-requirement-definitions');
const programGoalDefinitionsPath = v1ResourcePath('/program-goal-definitions');
const programSelectionStageDefinitionsPath = v1ResourcePath('/program-selection-stage-definitions');
const tasksPath = v1ResourcePath('/tasks');
const meTasksPath = v1ResourcePath('/me/tasks');
const reportsPath = v1ResourcePath('/reports');
const dashboardPath = v1ResourcePath('/dashboard');
const ratingsPath = v1ResourcePath('/ratings');

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
        reqUrl.includes('complete-registration') ||
        reqUrl.includes('/auth/forgot-password') ||
        reqUrl.includes('/auth/reset-password')
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
  forgotPassword: (email) =>
    api.post(authV1Suffix('/auth/forgot-password'), { email }),
  resetPassword: (payload) =>
    api.post(authV1Suffix('/auth/reset-password'), payload),
};

export const profileAPI = {
  getProfile: () => api.get(v1ResourcePath('/profile')),
  updateProfile: (data) => api.put(v1ResourcePath('/profile'), data),
  presignAvatarUpload: () =>
    api.post(v1ResourcePath('/profile/avatar/presign-upload')),
  getAvatar: () => api.get(v1ResourcePath('/profile/avatar'), { responseType: 'blob' }),
  deleteAvatar: () => api.delete(v1ResourcePath('/profile/avatar')),
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
  getInterns: (params) => api.get(internsPath, { params }),
  getInternById: (id) => api.get(`${internsPath}/${id}`),
  createIntern: (data) => api.post(internsPath, data),
  updateIntern: (id, data) => api.put(`${internsPath}/${id}`, data),
  deleteIntern: (id) => api.delete(`${internsPath}/${id}`),
  getInternProgress: (id) => api.get(`${internsPath}/${id}/progress`),
  getInternTasks: (id) => api.get(`${internsPath}/${id}/tasks`),
  getInternAssessments: (id) => api.get(`${internsPath}/${id}/assessments`),
  downloadInternshipResultReport: (id) =>
    api.get(`${internsPath}/${id}/internship-result-report`, {
      responseType: 'blob',
      timeout: 120000,
    }),
  getInternHiringDecision: (internId, programId) =>
    api.get(`${internsPath}/${internId}/hiring-decision`, { params: { programId } }),
  recordInternHiringDecision: (internId, data) =>
    api.put(`${internsPath}/${internId}/hiring-decision`, data),
};

export const mentorAPI = {
  getMentors: (params) => api.get(mentorsPath, { params }),
  getMentorById: (id) => api.get(`${mentorsPath}/${id}`),
  getMentorInterns: (id) => api.get(`${mentorsPath}/${id}/interns`),
  createAssessment: (data) => api.post(assessmentsPath, data),
  updateAssessment: (id, data) => api.put(`${assessmentsPath}/${id}`, data),
  getAssessments: (params) => api.get(assessmentsPath, { params }),
};

export const hrAPI = {
  getCompetencies: () => api.get(competenciesPath),
  createCompetency: (data) => api.post(competenciesPath, data),
  updateCompetency: (id, data) => api.put(`${competenciesPath}/${id}`, data),
  deleteCompetency: (id) => api.delete(`${competenciesPath}/${id}`),

  getItDirections: () => api.get(itDirectionsPath),
  createItDirection: (data) => api.post(itDirectionsPath, data),
  updateItDirection: (id, data) => api.put(`${itDirectionsPath}/${id}`, data),
  deleteItDirection: (id) => api.delete(`${itDirectionsPath}/${id}`),

  getProgramRequirementDefinitions: () => api.get(programRequirementDefinitionsPath),
  createProgramRequirementDefinition: (data) =>
    api.post(programRequirementDefinitionsPath, data),
  updateProgramRequirementDefinition: (id, data) =>
    api.put(`${programRequirementDefinitionsPath}/${id}`, data),
  deleteProgramRequirementDefinition: (id) =>
    api.delete(`${programRequirementDefinitionsPath}/${id}`),

  getProgramGoalDefinitions: () => api.get(programGoalDefinitionsPath),
  createProgramGoalDefinition: (data) => api.post(programGoalDefinitionsPath, data),
  updateProgramGoalDefinition: (id, data) =>
    api.put(`${programGoalDefinitionsPath}/${id}`, data),
  deleteProgramGoalDefinition: (id) => api.delete(`${programGoalDefinitionsPath}/${id}`),

  getProgramSelectionStageDefinitions: () => api.get(programSelectionStageDefinitionsPath),
  createProgramSelectionStageDefinition: (data) =>
    api.post(programSelectionStageDefinitionsPath, data),
  updateProgramSelectionStageDefinition: (id, data) =>
    api.put(`${programSelectionStageDefinitionsPath}/${id}`, data),
  deleteProgramSelectionStageDefinition: (id) =>
    api.delete(`${programSelectionStageDefinitionsPath}/${id}`),

  getInternshipPrograms: (params) => api.get(internshipProgramsPath, { params }),
  getInternshipProgramById: (id) => api.get(`${internshipProgramsPath}/${id}`),
  createInternshipProgram: (data) => api.post(internshipProgramsPath, data),
  updateInternshipProgram: (id, data) => api.put(`${internshipProgramsPath}/${id}`, data),
  deleteInternshipProgram: (id) => api.delete(`${internshipProgramsPath}/${id}`),
  downloadInternshipEfficiencyReport: (programId) =>
    api.get(`${internshipProgramsPath}/${programId}/internship-efficiency-report`, {
      responseType: 'blob',
      timeout: 120000,
    }),

  getProgramMentors: (programId) =>
    api.get(`${internshipProgramsPath}/${programId}/mentors`),
  assignProgramMentor: (programId, data) =>
    api.post(`${internshipProgramsPath}/${programId}/mentors`, data),
  unassignProgramMentor: (programId, userId) =>
    api.delete(`${internshipProgramsPath}/${programId}/mentors/${userId}`),

  getProgramInterns: (programId) =>
    api.get(`${internshipProgramsPath}/${programId}/interns`),
  assignProgramIntern: (programId, data) =>
    api.post(`${internshipProgramsPath}/${programId}/interns`, data),
  unassignProgramIntern: (programId, userId) =>
    api.delete(`${internshipProgramsPath}/${programId}/interns/${userId}`),

  getReports: (params) => api.get(reportsPath, { params }),
  getDashboardData: (params) => api.get(dashboardPath, { params }),
};

export const roadmapAPI = {
  // Roadmap templates (новая спецификация)
  getInternshipsByProgram: (programId) =>
    api.get(`${internshipProgramsPath}/${programId}/roadmap-templates`),
  getInternships: (params) => api.get(roadmapTemplatesPath, { params }),
  createInternship: (data) => api.post(roadmapTemplatesPath, data),
  getInternshipById: (internshipId) => api.get(`${roadmapTemplatesPath}/${internshipId}`),
  updateInternship: (internshipId, data) => api.put(`${roadmapTemplatesPath}/${internshipId}`, data),
  deleteInternship: (internshipId) => api.delete(`${roadmapTemplatesPath}/${internshipId}`),

  getStages: (internshipId) => api.get(`${roadmapTemplatesPath}/${internshipId}/stages`),
  createStage: (internshipId, data) => api.post(`${roadmapTemplatesPath}/${internshipId}/stages`, data),
  updateStage: (internshipId, stageId, data) =>
    api.put(`${roadmapTemplatesPath}/${internshipId}/stages/${stageId}`, data),
  deleteStage: (internshipId, stageId) =>
    api.delete(`${roadmapTemplatesPath}/${internshipId}/stages/${stageId}`),
  reorderStages: (internshipId, stageIds) =>
    api.put(`${roadmapTemplatesPath}/${internshipId}/stages/order`, { stageIds }),
  changeStageStatus: (internshipId, stageId, data) =>
    api.patch(`${roadmapTemplatesPath}/${internshipId}/stages/${stageId}/status`, data),

  // Roadmap templates
  getRoadmapTemplates: (params) => api.get(roadmapTemplatesPath, { params }),
  getRoadmapTemplateById: (templateId) => api.get(`${roadmapTemplatesPath}/${templateId}`),
  getRoadmapTemplatesByProgram: (programId) =>
    api.get(`${internshipProgramsPath}/${programId}/roadmap-templates`),
};

export const iprAPI = {
  getIprs: (params) => api.get(iprsPath, { params }),
  getMyIprs: () => api.get(`${iprsPath}/profile`),
  createIpr: (data) => api.post(iprsPath, data),
  getIprById: (iprId) => api.get(`${iprsPath}/${iprId}`),
  updateIpr: (iprId, data) => api.put(`${iprsPath}/${iprId}`, data),
  deleteIpr: (iprId) => api.delete(`${iprsPath}/${iprId}`),
  getIprStages: (iprId) => api.get(`${iprsPath}/${iprId}/stages`),
  createIprStage: (iprId, data) => api.post(`${iprsPath}/${iprId}/stages`, data),
  updateIprStage: (iprId, stageId, data) => api.put(`${iprsPath}/${iprId}/stages/${stageId}`, data),
  deleteIprStage: (iprId, stageId) => api.delete(`${iprsPath}/${iprId}/stages/${stageId}`),
  reorderIprStages: (iprId, stageIds) => api.put(`${iprsPath}/${iprId}/stages/order`, { stageIds }),
  changeIprStageStatus: (iprId, stageId, data) =>
    api.patch(`${iprsPath}/${iprId}/stages/${stageId}/status`, data),
};

export const taskAPI = {
  getTasks: (params) => api.get(tasksPath, { params }),
  getTaskProfile: (params) => api.get(`${tasksPath}/profile`, { params }),
  getMyTasks: (params) => api.get(meTasksPath, { params }),
  getTaskById: (id) => api.get(`${tasksPath}/${id}`),
  createTask: (data) => api.post(tasksPath, data),
  updateTask: (id, data) => api.put(`${tasksPath}/${id}`, data),
  deleteTask: (id) => api.delete(`${tasksPath}/${id}`),
  patchTaskStatus: (id, body) => api.patch(`${tasksPath}/${id}/status`, body),
  reorderTasks: (items, status) =>
    api.patch(`${tasksPath}/reorder`, { items }, { params: status ? { status } : {} }),
  completeTask: (id) => api.patch(`${tasksPath}/${id}/complete`),
  takeTask: (id) => api.post(`${tasksPath}/${id}/take`),
  submitTask: (id, data) => api.post(`${tasksPath}/${id}/submit`, data),
  uploadTaskFile: (id, formData) =>
    api.post(`${tasksPath}/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  presignTaskArtifactUpload: (id, data) =>
    api.post(`${tasksPath}/${id}/artifacts/presign-upload`, data),
  confirmTaskArtifactUpload: (id, data) =>
    api.post(`${tasksPath}/${id}/artifacts/confirm`, data),
  reviewTask: (id, data) => api.post(`${tasksPath}/${id}/review`, data),
  addComment: (id, data) => api.post(`${tasksPath}/${id}/comments`, data),
  getComments: (id) => api.get(`${tasksPath}/${id}/comments`),
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

export const analyticsAPI = {
  getReports: (params) => api.get(reportsPath, { params }),
  getReportsExport: (params) =>
    api.get(`${reportsPath}/export`, { params, responseType: 'blob' }),
  getMentorWorkload: (params) => api.get(`${reportsPath}/mentor-workload`, { params }),
  getMentorWorkloadExport: (params) =>
    api.get(`${reportsPath}/mentor-workload/export`, { params, responseType: 'blob' }),
  getDashboard: (params) => api.get(dashboardPath, { params }),
};

export const ratingAPI = {
  getRatings: (params) => api.get(ratingsPath, { params }),
  getInternRating: (internId) => api.get(`${ratingsPath}/interns/${internId}`),
  getRatingProfile: (params) => api.get(`${ratingsPath}/profile`, { params }),
};

export const dashboardAPI = {
  getData: (params) => api.get(dashboardPath, { params }),
  getUpcomingDeadlines: (params) => api.get(`${dashboardPath}/upcoming-deadlines`, { params }),
  getTrends: (params) => api.get(`${dashboardPath}/trends`, { params }),
  getTasksStats: (params) => api.get(`${dashboardPath}/tasks-stats`, { params }),
  getProgramsStats: (params) => api.get(`${dashboardPath}/programs-stats`, { params }),
  getMentorsStats: (params) => api.get(`${dashboardPath}/mentors-stats`, { params }),
  getInternsStats: (params) => api.get(`${dashboardPath}/interns-stats`, { params }),
};

export default api;
