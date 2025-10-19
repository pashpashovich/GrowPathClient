import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  programs: [
    {
      id: 'program-1',
      title: 'Frontend разработка на React',
      description: 'Стажировка по разработке пользовательских интерфейсов с использованием React, TypeScript и современных инструментов разработки.',
      startDate: '2024-02-01',
      duration: 3, // в месяцах
      maxPlaces: 15,
      requirements: [
        'Знание HTML, CSS, JavaScript',
        'Базовые знания React',
        'Опыт работы с Git',
        'Английский язык на уровне чтения документации'
      ],
      goals: [
        {
          id: 'goal-1',
          title: 'Освоить современные паттерны React',
          description: 'Изучить хуки, контекст, управление состоянием'
        },
        {
          id: 'goal-2',
          title: 'Научиться работать с TypeScript',
          description: 'Типизация компонентов и API'
        },
        {
          id: 'goal-3',
          title: 'Понять принципы тестирования',
          description: 'Unit и интеграционные тесты'
        }
      ],
      competencies: [
        'React Development',
        'TypeScript',
        'Testing',
        'UI/UX Design',
        'Git Workflow'
      ],
      selectionStages: [
        {
          id: 'stage-1',
          name: 'Подача заявки',
          description: 'Заполнение анкеты и загрузка резюме',
          order: 1,
          isActive: true
        },
        {
          id: 'stage-2',
          name: 'Техническое тестирование',
          description: 'Онлайн тест по JavaScript и React',
          order: 2,
          isActive: true
        },
        {
          id: 'stage-3',
          name: 'Техническое интервью',
          description: 'Разбор решений и обсуждение опыта',
          order: 3,
          isActive: true
        },
        {
          id: 'stage-4',
          name: 'Принятие решения',
          description: 'Финальное решение о зачислении',
          order: 4,
          isActive: true
        }
      ],
      status: 'active', // active, draft, completed, cancelled
      createdBy: 'hr-1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      internships: ['internship-1', 'internship-2'], // Связанные стажировки
    },
    {
      id: 'program-2',
      title: 'Backend разработка на Node.js',
      description: 'Стажировка по серверной разработке с использованием Node.js, Express и баз данных.',
      startDate: '2024-03-01',
      duration: 4,
      maxPlaces: 10,
      requirements: [
        'Знание JavaScript',
        'Базовые знания Node.js',
        'Опыт работы с базами данных',
        'Понимание REST API'
      ],
      goals: [
        {
          id: 'goal-4',
          title: 'Освоить Node.js и Express',
          description: 'Создание серверных приложений'
        },
        {
          id: 'goal-5',
          title: 'Работа с базами данных',
          description: 'MongoDB, PostgreSQL, миграции'
        }
      ],
      competencies: [
        'Node.js',
        'Express.js',
        'Database Design',
        'API Development',
        'Authentication'
      ],
      selectionStages: [
        {
          id: 'stage-5',
          name: 'Подача заявки',
          description: 'Заполнение анкеты',
          order: 1,
          isActive: true
        },
        {
          id: 'stage-6',
          name: 'Техническое интервью',
          description: 'Обсуждение опыта и мотивации',
          order: 2,
          isActive: true
        }
      ],
      status: 'draft',
      createdBy: 'hr-1',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      internships: ['internship-3'], // Связанные стажировки
    }
  ],
  currentProgram: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    search: '',
  },
};

const internshipProgramSlice = createSlice({
  name: 'internshipProgram',
  initialState,
  reducers: {
    setPrograms: (state, action) => {
      state.programs = action.payload;
    },
    addProgram: (state, action) => {
      const newProgram = {
        ...action.payload,
        id: `program-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.programs.unshift(newProgram);
    },
    updateProgram: (state, action) => {
      const index = state.programs.findIndex(program => program.id === action.payload.id);
      if (index !== -1) {
        state.programs[index] = { 
          ...state.programs[index], 
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteProgram: (state, action) => {
      state.programs = state.programs.filter(program => program.id !== action.payload);
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    },
    addGoal: (state, action) => {
      const { programId, goal } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        const newGoal = {
          ...goal,
          id: `goal-${Date.now()}`,
        };
        program.goals.push(newGoal);
        program.updatedAt = new Date().toISOString();
      }
    },
    updateGoal: (state, action) => {
      const { programId, goalId, updates } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        const goalIndex = program.goals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
          program.goals[goalIndex] = { ...program.goals[goalIndex], ...updates };
          program.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteGoal: (state, action) => {
      const { programId, goalId } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        program.goals = program.goals.filter(g => g.id !== goalId);
        program.updatedAt = new Date().toISOString();
      }
    },
    addSelectionStage: (state, action) => {
      const { programId, stage } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        const newStage = {
          ...stage,
          id: `stage-${Date.now()}`,
          order: program.selectionStages.length + 1,
        };
        program.selectionStages.push(newStage);
        program.updatedAt = new Date().toISOString();
      }
    },
    updateSelectionStage: (state, action) => {
      const { programId, stageId, updates } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        const stageIndex = program.selectionStages.findIndex(s => s.id === stageId);
        if (stageIndex !== -1) {
          program.selectionStages[stageIndex] = { ...program.selectionStages[stageIndex], ...updates };
          program.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteSelectionStage: (state, action) => {
      const { programId, stageId } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        program.selectionStages = program.selectionStages.filter(s => s.id !== stageId);
        // Пересчитываем порядок
        program.selectionStages.forEach((stage, index) => {
          stage.order = index + 1;
        });
        program.updatedAt = new Date().toISOString();
      }
    },
    reorderSelectionStages: (state, action) => {
      const { programId, stages } = action.payload;
      const program = state.programs.find(p => p.id === programId);
      if (program) {
        program.selectionStages = stages.map((stage, index) => ({
          ...stage,
          order: index + 1,
        }));
        program.updatedAt = new Date().toISOString();
      }
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
  setPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  setCurrentProgram,
  addGoal,
  updateGoal,
  deleteGoal,
  addSelectionStage,
  updateSelectionStage,
  deleteSelectionStage,
  reorderSelectionStages,
  setFilters,
  clearError,
  setLoading,
} = internshipProgramSlice.actions;

export default internshipProgramSlice.reducer;
