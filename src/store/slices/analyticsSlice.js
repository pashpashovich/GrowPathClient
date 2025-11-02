import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  programReports: [
    {
      programId: 'program-1',
      programTitle: 'Frontend разработка на React',
      totalTasks: 45,
      completedTasks: 32,
      overdueTasks: 3,
      inProgressTasks: 10,
      completionRate: 71.1,
      averageCompletionTime: 4.2, 
      internStats: [
        {
          internId: 'intern-1',
          internName: 'Анна Петрова',
          completedTasks: 8,
          totalTasks: 10,
          completionRate: 80,
          competencies: {
            current: ['React Development', 'TypeScript', 'Testing'],
            achieved: ['HTML/CSS', 'JavaScript', 'Git Workflow'],
            inProgress: ['UI/UX Design']
          }
        },
        {
          internId: 'intern-2',
          internName: 'Дмитрий Иванов',
          completedTasks: 7,
          totalTasks: 9,
          completionRate: 77.8,
          competencies: {
            current: ['React Development', 'TypeScript'],
            achieved: ['HTML/CSS', 'JavaScript', 'Git Workflow', 'Testing'],
            inProgress: ['UI/UX Design']
          }
        }
      ],
      mentorStats: [
        {
          mentorId: 'mentor-1',
          mentorName: 'Алексей Менторов',
          assignedInterns: 4,
          activeTasks: 12,
          completedReviews: 28,
          averageReviewTime: 1.5, // в днях
          workload: 'normal' // normal, high, overload
        }
      ],
      periodStats: {
        weekly: [
          { week: '2024-W03', completed: 8, created: 5, overdue: 1 },
          { week: '2024-W04', completed: 12, created: 7, overdue: 2 },
          { week: '2024-W05', completed: 15, created: 6, overdue: 1 }
        ],
        monthly: [
          { month: '2024-01', completed: 25, created: 18, overdue: 3 },
          { month: '2024-02', completed: 32, created: 22, overdue: 2 }
        ]
      }
    },
    {
      programId: 'program-2',
      programTitle: 'Backend разработка на Node.js',
      totalTasks: 28,
      completedTasks: 15,
      overdueTasks: 2,
      inProgressTasks: 11,
      completionRate: 53.6,
      averageCompletionTime: 5.8,
      internStats: [
        {
          internId: 'intern-3',
          internName: 'Елена Сидорова',
          completedTasks: 6,
          totalTasks: 8,
          completionRate: 75,
          competencies: {
            current: ['Node.js', 'Express.js'],
            achieved: ['JavaScript', 'Git Workflow'],
            inProgress: ['Database Design', 'API Development']
          }
        }
      ],
      mentorStats: [
        {
          mentorId: 'mentor-1',
          mentorName: 'Алексей Менторов',
          assignedInterns: 2,
          activeTasks: 8,
          completedReviews: 15,
          averageReviewTime: 2.1,
          workload: 'normal'
        }
      ],
      periodStats: {
        weekly: [
          { week: '2024-W03', completed: 3, created: 4, overdue: 1 },
          { week: '2024-W04', completed: 5, created: 3, overdue: 0 },
          { week: '2024-W05', completed: 7, created: 5, overdue: 1 }
        ],
        monthly: [
          { month: '2024-01', completed: 12, created: 10, overdue: 2 },
          { month: '2024-02', completed: 15, created: 12, overdue: 1 }
        ]
      }
    }
  ],
  mentorWorkload: [
    {
      mentorId: 'mentor-1',
      mentorName: 'Алексей Менторов',
      email: 'mentor@example.com',
      totalInterns: 6,
      activeTasks: 20,
      pendingReviews: 8,
      completedReviews: 43,
      averageReviewTime: 1.8,
      workload: 'high', // normal, high, overload
      programs: ['program-1', 'program-2'],
      lastActivity: '2024-01-25T10:30:00Z',
      performance: {
        responseTime: 1.8, // среднее время ответа в днях
        qualityScore: 4.2, // средняя оценка качества
        internSatisfaction: 4.5
      }
    },
    {
      mentorId: 'mentor-2',
      mentorName: 'Мария Менторова',
      email: 'mentor2@example.com',
      totalInterns: 3,
      activeTasks: 12,
      pendingReviews: 4,
      completedReviews: 28,
      averageReviewTime: 1.2,
      workload: 'normal',
      programs: ['program-1'],
      lastActivity: '2024-01-24T15:45:00Z',
      performance: {
        responseTime: 1.2,
        qualityScore: 4.5,
        internSatisfaction: 4.7
      }
    }
  ],
  filters: {
    programId: '',
    mentorId: '',
    period: 'monthly', // weekly, monthly, program
    dateRange: {
      start: '',
      end: ''
    }
  },
  isLoading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setProgramReports: (state, action) => {
      state.programReports = action.payload;
    },
    setMentorWorkload: (state, action) => {
      state.mentorWorkload = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        programId: '',
        mentorId: '',
        period: 'monthly',
        dateRange: {
          start: '',
          end: ''
        }
      };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateMentorWorkload: (state, action) => {
      const { mentorId, updates } = action.payload;
      const index = state.mentorWorkload.findIndex(mentor => mentor.mentorId === mentorId);
      if (index !== -1) {
        state.mentorWorkload[index] = { ...state.mentorWorkload[index], ...updates };
      }
    },
    addProgramReport: (state, action) => {
      state.programReports.push(action.payload);
    },
    updateProgramReport: (state, action) => {
      const { programId, updates } = action.payload;
      const index = state.programReports.findIndex(report => report.programId === programId);
      if (index !== -1) {
        state.programReports[index] = { ...state.programReports[index], ...updates };
      }
    }
  }
});

export const {
  setProgramReports,
  setMentorWorkload,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
  updateMentorWorkload,
  addProgramReport,
  updateProgramReport
} = analyticsSlice.actions;

export default analyticsSlice.reducer;










