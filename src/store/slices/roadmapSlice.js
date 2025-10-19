import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  internships: [
    {
      id: 'internship-1',
      title: 'Frontend разработка - Группа 1 (Январь 2024)',
      description: 'Стажировка по разработке пользовательских интерфейсов на React - первая группа',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      status: 'active', // active, completed, paused, draft
      mentorId: 'mentor-1',
      internIds: ['intern-1', 'intern-2'], // Группа стажеров
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
    },
    {
      id: 'internship-2',
      title: 'Frontend разработка - Группа 2 (Февраль 2024)',
      description: 'Стажировка по разработке пользовательских интерфейсов на React - вторая группа',
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      status: 'active',
      mentorId: 'mentor-1',
      internIds: ['intern-3', 'intern-4'], // Группа стажеров
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
    },
    {
      id: 'internship-3',
      title: 'Frontend разработка - Группа 3 (Март 2024)',
      description: 'Стажировка по разработке пользовательских интерфейсов на React - третья группа',
      startDate: '2024-03-01',
      endDate: '2024-05-01',
      status: 'active',
      mentorId: 'mentor-1',
      internIds: ['intern-5'], // Группа стажеров
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
    },
  ],
  currentInternshipId: 'internship-1', // Активная стажировка
  stages: {
    'internship-1': [
      {
        id: 1,
        title: 'Ознакомление с React',
        description: 'Изучение основ React, компонентов и хуков',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        status: 'completed',
        priority: 'high',
        isCheckpoint: true,
        comments: 'Группа 1 успешно изучила основы React',
        createdBy: 'mentor-1',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-22T15:30:00Z',
      },
      {
        id: 2,
        title: 'Разработка базовых компонентов',
        description: 'Создание переиспользуемых UI компонентов',
        startDate: '2024-01-23',
        endDate: '2024-02-05',
        status: 'in_progress',
        priority: 'high',
        isCheckpoint: true,
        comments: 'В процессе разработки кнопок и форм',
        createdBy: 'mentor-1',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-25T09:15:00Z',
      },
      {
        id: 3,
        title: 'Интеграция с API',
        description: 'Подключение к backend API и обработка данных',
        startDate: '2024-02-06',
        endDate: '2024-02-20',
        status: 'pending',
        priority: 'medium',
        isCheckpoint: false,
        comments: '',
        createdBy: 'mentor-1',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 4,
        title: 'Тестирование и отладка',
        description: 'Написание тестов и исправление багов',
        startDate: '2024-02-21',
        endDate: '2024-03-05',
        status: 'pending',
        priority: 'medium',
        isCheckpoint: true,
        comments: '',
        createdBy: 'mentor-1',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 5,
        title: 'Финальная презентация',
        description: 'Подготовка и проведение презентации результатов',
        startDate: '2024-03-06',
        endDate: '2024-03-10',
        status: 'pending',
        priority: 'high',
        isCheckpoint: true,
        comments: '',
        createdBy: 'mentor-1',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
    ],
    'internship-2': [
      {
        id: 6,
        title: 'Ознакомление с React (Группа 2)',
        description: 'Изучение основ React для второй группы',
        startDate: '2024-02-01',
        endDate: '2024-02-10',
        status: 'completed',
        priority: 'high',
        isCheckpoint: true,
        comments: 'Группа 2 успешно изучила основы React',
        createdBy: 'mentor-1',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-02-10T14:20:00Z',
      },
      {
        id: 7,
        title: 'Работа с формами',
        description: 'Создание и валидация форм в React',
        startDate: '2024-02-11',
        endDate: '2024-02-25',
        status: 'in_progress',
        priority: 'high',
        isCheckpoint: true,
        comments: 'Изучение controlled и uncontrolled компонентов',
        createdBy: 'mentor-1',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-02-15T10:00:00Z',
      },
    ],
    'internship-3': [
      {
        id: 8,
        title: 'Ознакомление с React (Группа 3)',
        description: 'Изучение основ React для третьей группы',
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        status: 'in_progress',
        priority: 'high',
        isCheckpoint: true,
        comments: 'Группа 3 изучает основы React',
        createdBy: 'mentor-1',
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2024-03-05T16:30:00Z',
      },
    ],
  },
  currentStage: null,
  isLoading: false,
  error: null,
};

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStage: (state, action) => {
      state.currentStage = action.payload;
    },
    setCurrentInternship: (state, action) => {
      state.currentInternshipId = action.payload;
    },
    addInternship: (state, action) => {
      const newInternship = {
        ...action.payload,
        id: `internship-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.internships.push(newInternship);
      // Создаем пустой массив этапов для новой стажировки
      state.stages[newInternship.id] = [];
    },
    updateInternship: (state, action) => {
      const index = state.internships.findIndex(internship => internship.id === action.payload.id);
      if (index !== -1) {
        state.internships[index] = {
          ...state.internships[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeInternship: (state, action) => {
      state.internships = state.internships.filter(internship => internship.id !== action.payload);
      // Удаляем этапы стажировки
      delete state.stages[action.payload];
      // Если удаляемая стажировка была активной, переключаемся на первую доступную
      if (state.currentInternshipId === action.payload) {
        const remainingInternships = state.internships.filter(internship => internship.id !== action.payload);
        state.currentInternshipId = remainingInternships.length > 0 ? remainingInternships[0].id : null;
      }
    },
    addStage: (state, action) => {
      const { internshipId, ...stageData } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const newStage = {
          ...stageData,
          id: Date.now(), // Временный ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.stages[targetInternshipId].push(newStage);
      }
    },
    updateStage: (state, action) => {
      const { internshipId, ...stageData } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const index = state.stages[targetInternshipId].findIndex(stage => stage.id === stageData.id);
        if (index !== -1) {
          state.stages[targetInternshipId][index] = {
            ...state.stages[targetInternshipId][index],
            ...stageData,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },
    removeStage: (state, action) => {
      const { internshipId, stageId } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        state.stages[targetInternshipId] = state.stages[targetInternshipId].filter(stage => stage.id !== stageId);
      }
    },
    reorderStages: (state, action) => {
      const { internshipId, stages } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId) {
        state.stages[targetInternshipId] = stages;
      }
    },
    updateStageStatus: (state, action) => {
      const { internshipId, stageId, status, comments } = action.payload;
      const targetInternshipId = internshipId || state.currentInternshipId;
      
      if (targetInternshipId && state.stages[targetInternshipId]) {
        const stage = state.stages[targetInternshipId].find(s => s.id === stageId);
        if (stage) {
          stage.status = status;
          stage.comments = comments || stage.comments;
          stage.updatedAt = new Date().toISOString();
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCurrentStage,
  setCurrentInternship,
  addInternship,
  updateInternship,
  removeInternship,
  addStage,
  updateStage,
  removeStage,
  reorderStages,
  updateStageStatus,
} = roadmapSlice.actions;

export default roadmapSlice.reducer;
