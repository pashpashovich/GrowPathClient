export const mockInterns = [
  {
    id: 'intern-1',
    name: 'Анна Петрова',
    email: 'anna.petrova@example.com',
    position: 'Frontend Developer',
    experience: 'beginner',
    startDate: '2024-01-15',
    mentor: 'mentor-1',
    internshipId: 'internship-1' // Frontend разработка - Группа 1
  },
  {
    id: 'intern-2',
    name: 'Дмитрий Иванов',
    email: 'dmitry.ivanov@example.com',
    position: 'Frontend Developer',
    experience: 'intermediate',
    startDate: '2024-01-10',
    mentor: 'mentor-1',
    internshipId: 'internship-1' // Frontend разработка - Группа 1
  },
  {
    id: 'intern-3',
    name: 'Елена Сидорова',
    email: 'elena.sidorova@example.com',
    position: 'Frontend Developer',
    experience: 'beginner',
    startDate: '2024-02-01',
    mentor: 'mentor-1',
    internshipId: 'internship-2' // Frontend разработка - Группа 2
  },
  {
    id: 'intern-4',
    name: 'Михаил Козлов',
    email: 'mikhail.kozlov@example.com',
    position: 'Frontend Developer',
    experience: 'intermediate',
    startDate: '2024-02-05',
    mentor: 'mentor-1',
    internshipId: 'internship-2' // Frontend разработка - Группа 2
  },
  {
    id: 'intern-5',
    name: 'Ольга Волкова',
    email: 'olga.volkova@example.com',
    position: 'Frontend Developer',
    experience: 'beginner',
    startDate: '2024-03-01',
    mentor: 'mentor-1',
    internshipId: 'internship-3' // Frontend разработка - Группа 3
  }
];

export const mockMentors = [
  {
    id: 'mentor-1',
    name: 'Алексей Козлов',
    email: 'alexey.kozlov@example.com',
    position: 'Senior Frontend Developer',
    department: 'Frontend',
    specialization: 'React, TypeScript, UI/UX'
  }
];

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Создание компонента кнопки',
    description: 'Создать переиспользуемый компонент кнопки с различными вариантами стилизации (primary, secondary, outline) и размерами (small, medium, large). Компонент должен поддерживать состояния loading и disabled.',
    checklist: [
      'Создать базовый компонент Button',
      'Добавить варианты стилизации (primary, secondary, outline)',
      'Реализовать размеры (small, medium, large)',
      'Добавить состояния loading и disabled',
      'Написать unit-тесты для компонента',
      'Добавить Storybook stories'
    ],
    attachments: [
      { name: 'button-design.sketch', url: '#' },
      { name: 'requirements.pdf', url: '#' }
    ],
    links: [
      'https://mui.com/material-ui/react-button/',
      'https://storybook.js.org/docs/react/writing-stories/introduction'
    ],
    assignedInterns: ['intern-1'],
    internshipId: 'internship-1', // Frontend разработка - Группа 1
    status: 'pending',
    createdAt: '2024-01-20T10:00:00Z',
    createdBy: 'mentor-1'
  },
  {
    id: 'task-2',
    title: 'Настройка API endpoints',
    description: 'Создать REST API endpoints для управления пользователями. Включить CRUD операции, валидацию данных, обработку ошибок и документацию API.',
    checklist: [
      'Создать модель User',
      'Реализовать CRUD endpoints',
      'Добавить валидацию входных данных',
      'Настроить обработку ошибок',
      'Создать Swagger документацию',
      'Написать интеграционные тесты'
    ],
    attachments: [
      { name: 'api-specification.yaml', url: '#' }
    ],
    links: [
      'https://swagger.io/specification/',
      'https://expressjs.com/en/guide/routing.html'
    ],
    assignedInterns: ['intern-2'],
    internshipId: 'internship-1', // Frontend разработка - Группа 1
    status: 'in_progress',
    takenBy: 'intern-2',
    takenAt: '2024-01-22T14:30:00Z',
    createdAt: '2024-01-21T09:00:00Z',
    createdBy: 'mentor-2',
    statusHistory: [
      {
        status: 'pending',
        changedBy: 'mentor-2',
        changedAt: '2024-01-21T09:00:00Z',
        comment: 'Задача создана'
      },
      {
        status: 'in_progress',
        changedBy: 'intern-2',
        changedAt: '2024-01-22T14:30:00Z',
        comment: 'Задача взята в работу'
      }
    ]
  },
  {
    id: 'task-3',
    title: 'Интеграция с внешним API',
    description: 'Интегрировать приложение с внешним API для получения данных о погоде. Реализовать кэширование, обработку ошибок и fallback механизмы.',
    checklist: [
      'Изучить документацию внешнего API',
      'Создать сервис для работы с API',
      'Реализовать кэширование данных',
      'Добавить обработку ошибок',
      'Создать fallback механизмы',
      'Написать тесты для интеграции'
    ],
    attachments: [],
    links: [
      'https://openweathermap.org/api',
      'https://redis.io/documentation'
    ],
    assignedInterns: ['intern-3'],
    internshipId: 'internship-2', // Frontend разработка - Группа 2
    status: 'submitted',
    takenBy: 'intern-3',
    takenAt: '2024-01-23T10:15:00Z',
    submittedBy: 'intern-3',
    submittedAt: '2024-01-25T16:45:00Z',
    submissionFiles: [
      { name: 'weather-service.js', size: 15420, type: 'application/javascript' },
      { name: 'weather-tests.js', size: 8930, type: 'application/javascript' }
    ],
    submissionLinks: [
      'https://github.com/example/weather-integration',
      'https://example.com/weather-demo'
    ],
    submissionComment: 'Реализовал интеграцию с OpenWeatherMap API. Добавил кэширование через Redis, обработку ошибок и fallback на статические данные. Написал comprehensive тесты.',
    createdAt: '2024-01-23T08:00:00Z',
    createdBy: 'mentor-1',
    statusHistory: [
      {
        status: 'pending',
        changedBy: 'mentor-1',
        changedAt: '2024-01-23T08:00:00Z',
        comment: 'Задача создана'
      },
      {
        status: 'in_progress',
        changedBy: 'intern-3',
        changedAt: '2024-01-23T10:15:00Z',
        comment: 'Задача взята в работу'
      },
      {
        status: 'submitted',
        changedBy: 'intern-3',
        changedAt: '2024-01-25T16:45:00Z',
        comment: 'Задача сдана на проверку'
      }
    ]
  },
  {
    id: 'task-4',
    title: 'Оптимизация производительности',
    description: 'Провести анализ производительности приложения и оптимизировать медленные запросы. Использовать профилирование и мониторинг.',
    checklist: [
      'Провести профилирование приложения',
      'Выявить узкие места',
      'Оптимизировать медленные запросы',
      'Добавить индексы в базу данных',
      'Реализовать кэширование',
      'Настроить мониторинг производительности'
    ],
    attachments: [
      { name: 'performance-report.pdf', url: '#' },
      { name: 'optimization-plan.md', url: '#' }
    ],
    links: [
      'https://nodejs.org/en/docs/guides/simple-profiling/',
      'https://www.postgresql.org/docs/current/indexes.html'
    ],
    assignedInterns: ['intern-1'],
    internshipId: 'internship-1', // Frontend разработка - Группа 1
    status: 'completed',
    takenBy: 'intern-1',
    takenAt: '2024-01-20T11:00:00Z',
    submittedBy: 'intern-1',
    submittedAt: '2024-01-24T15:30:00Z',
    reviewedBy: 'mentor-1',
    reviewedAt: '2024-01-25T10:00:00Z',
    reviewComment: 'Отличная работа! Все пункты чек-листа выполнены качественно. Производительность улучшена на 40%.',
    createdAt: '2024-01-19T14:00:00Z',
    createdBy: 'mentor-1',
    statusHistory: [
      {
        status: 'pending',
        changedBy: 'mentor-1',
        changedAt: '2024-01-19T14:00:00Z',
        comment: 'Задача создана'
      },
      {
        status: 'in_progress',
        changedBy: 'intern-1',
        changedAt: '2024-01-20T11:00:00Z',
        comment: 'Задача взята в работу'
      },
      {
        status: 'submitted',
        changedBy: 'intern-1',
        changedAt: '2024-01-24T15:30:00Z',
        comment: 'Задача сдана на проверку'
      },
      {
        status: 'completed',
        changedBy: 'mentor-1',
        changedAt: '2024-01-25T10:00:00Z',
        comment: 'Задача проверена и принята'
      }
    ]
  },
  {
    id: 'task-5',
    title: 'Создание модального окна',
    description: 'Создать переиспользуемый компонент модального окна с анимациями и различными размерами.',
    checklist: [
      'Создать базовый компонент Modal',
      'Добавить анимации появления/исчезновения',
      'Реализовать различные размеры',
      'Добавить поддержку клавиши Escape',
      'Написать тесты'
    ],
    attachments: [],
    links: [
      'https://mui.com/material-ui/react-modal/'
    ],
    assignedInterns: ['intern-1'],
    internshipId: 'internship-1', // Frontend разработка - Группа 1
    status: 'pending',
    createdAt: '2024-01-26T10:00:00Z',
    createdBy: 'mentor-1'
  },
  {
    id: 'task-6',
    title: 'Настройка базы данных',
    description: 'Настроить PostgreSQL базу данных с миграциями и seed данными.',
    checklist: [
      'Установить PostgreSQL',
      'Создать схему базы данных',
      'Написать миграции',
      'Добавить seed данные',
      'Настроить подключение'
    ],
    attachments: [],
    links: [
      'https://www.postgresql.org/docs/',
      'https://knexjs.org/'
    ],
    assignedInterns: ['intern-4'],
    internshipId: 'internship-2', // Frontend разработка - Группа 2
    status: 'in_progress',
    takenBy: 'intern-4',
    takenAt: '2024-01-26T09:00:00Z',
    createdAt: '2024-01-25T16:00:00Z',
    createdBy: 'mentor-1'
  },
  {
    id: 'task-7',
    title: 'Написание тестов',
    description: 'Написать unit и интеграционные тесты для существующего функционала.',
    checklist: [
      'Написать unit тесты',
      'Создать интеграционные тесты',
      'Настроить покрытие кода',
      'Добавить тесты в CI/CD'
    ],
    attachments: [],
    links: [
      'https://jestjs.io/',
      'https://testing-library.com/'
    ],
    assignedInterns: ['intern-5'],
    internshipId: 'internship-3', // Frontend разработка - Группа 3
    status: 'completed',
    takenBy: 'intern-5',
    takenAt: '2024-01-20T10:00:00Z',
    submittedBy: 'intern-3',
    submittedAt: '2024-01-24T14:00:00Z',
    reviewedBy: 'mentor-1',
    reviewedAt: '2024-01-25T11:00:00Z',
    rating: 9,
    createdAt: '2024-01-19T15:00:00Z',
    createdBy: 'mentor-1'
  },
  {
    id: 'task-8',
    title: 'Создание формы входа',
    description: 'Создать компонент формы входа с валидацией и обработкой ошибок.',
    checklist: [
      'Создать компонент LoginForm',
      'Добавить валидацию полей',
      'Реализовать обработку ошибок',
      'Добавить анимации',
      'Написать тесты'
    ],
    attachments: [],
    links: [
      'https://mui.com/material-ui/react-text-field/'
    ],
    assignedInterns: ['intern-3'],
    internshipId: 'internship-2', // Frontend разработка - Группа 2
    status: 'pending',
    createdAt: '2024-01-27T10:00:00Z',
    createdBy: 'mentor-1'
  },
  {
    id: 'task-9',
    title: 'Настройка роутинга',
    description: 'Настроить React Router для навигации между страницами.',
    checklist: [
      'Установить React Router',
      'Создать маршруты',
      'Добавить защищенные маршруты',
      'Реализовать навигацию',
      'Добавить breadcrumbs'
    ],
    attachments: [],
    links: [
      'https://reactrouter.com/'
    ],
    assignedInterns: ['intern-5'],
    internshipId: 'internship-3', // Frontend разработка - Группа 3
    status: 'in_progress',
    takenBy: 'intern-5',
    takenAt: '2024-01-27T09:00:00Z',
    createdAt: '2024-01-26T16:00:00Z',
    createdBy: 'mentor-1'
  }
];

export const mockCurrentUser = {
  id: 'intern-1',
  name: 'Анна Петрова',
  email: 'anna.petrova@example.com',
  role: 'intern'
};

export const mockCurrentMentor = {
  id: 'current-mentor-id',
  name: 'Алексей Козлов',
  email: 'alexey.kozlov@example.com',
  role: 'mentor'
};

export const mockCurrentAdmin = {
  id: 'current-admin-id',
  name: 'Администратор Системы',
  email: 'admin@example.com',
  role: 'admin'
};

export const mockInternships = [
  {
    id: 'internship-1',
    title: 'Frontend разработка - Группа 1',
    description: 'Стажировка по разработке пользовательских интерфейсов с использованием React',
    programId: 'program-1',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    maxPlaces: 8,
    currentPlaces: 5,
    status: 'active',
    mentor: 'mentor-1',
    interns: ['intern-1', 'intern-2'],
  },
  {
    id: 'internship-2',
    title: 'Frontend разработка - Группа 2',
    description: 'Стажировка по разработке пользовательских интерфейсов с использованием React',
    programId: 'program-1',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    maxPlaces: 7,
    currentPlaces: 2,
    status: 'active',
    mentor: 'mentor-1',
    interns: ['intern-3', 'intern-4'],
  },
  {
    id: 'internship-3',
    title: 'Backend разработка - Группа 1',
    description: 'Стажировка по серверной разработке с использованием Node.js',
    programId: 'program-2',
    startDate: '2024-03-01',
    endDate: '2024-07-01',
    maxPlaces: 10,
    currentPlaces: 0,
    status: 'draft',
    mentor: 'mentor-1',
    interns: [],
  }
];
