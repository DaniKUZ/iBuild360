// Mock данные для технических решений - адаптировано под ЖК Солнечный
export const MOCK_TECHNICAL_SOLUTIONS = {
  project: {
    id: 'TI-001',
    name: 'ЖК «Солнечный»',
    contractor: 'ООО СтройИнвест',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    address: 'г. Екатеринбург, ул. Солнечная, 25',
    floors: 17,
    apartments: 204
  },

  solutions: [
    {
      id: 'TS-001',
      title: 'Усиление фундамента корпуса А ЖК «Солнечный»',
      description: 'Дополнительное армирование свайного фундамента корпуса А на отметках +3.000 - +6.000 в связи с увеличением нагрузки от изменения планировок квартир на втором этаже',
      type: 'foundation',
      priority: 'high',
      status: 'approved',
      section: 'Корпус А, этаж 2',
      reason: 'Изменение архитектурно-планировочных решений',
      createdAt: '2025-02-15T10:30:00Z',
      approvedAt: '2025-02-18T14:20:00Z',
      dueDate: '2025-03-01',
      cost: 1200000,
      costImpact: 'increase',
      scheduleImpact: 7, // дни задержки
      
      // Участники согласования
      participants: [
        {
          role: 'customer', // заказчик
          name: 'Иванов И.И.',
          position: 'Технический директор',
          status: 'approved',
          approvedAt: '2025-02-17T09:15:00Z',
          comments: 'Согласовано с учетом дополнительных затрат'
        },
        {
          role: 'contractor', // подрядчик  
          name: 'Петров П.П.',
          position: 'Главный инженер проекта',
          status: 'approved',
          approvedAt: '2025-02-16T16:45:00Z',
          comments: 'Техническое решение обосновано'
        },
        {
          role: 'supervision', // строительный контроль
          name: 'Сидоров С.С.',
          position: 'Инженер стройконтроля',
          status: 'approved',
          approvedAt: '2025-02-18T14:20:00Z',
          comments: 'Решение соответствует нормативам'
        },
        {
          role: 'designer', // проектировщик
          name: 'Козлов К.К.',
          position: 'Главный конструктор',
          status: 'approved',
          approvedAt: '2025-02-17T11:30:00Z',
          comments: 'Внесены изменения в рабочие чертежи'
        }
      ],

      documents: [
        {
          name: 'Пояснительная записка к ТР-001.pdf',
          type: 'explanation',
          uploadedAt: '2025-02-15T10:30:00Z',
          size: '2.1 MB'
        },
        {
          name: 'Чертежи нового фундамента.dwg',
          type: 'drawings',
          uploadedAt: '2025-02-16T14:00:00Z',
          size: '5.4 MB'
        },
        {
          name: 'Расчет стоимости.xlsx',
          type: 'calculations',
          uploadedAt: '2025-02-16T15:30:00Z',
          size: '156 KB'
        }
      ],

      relatedTasks: ['foundation', 'earthworks'],
      photos: [
        '/images/technical-solutions/ts001-before.jpg',
        '/images/technical-solutions/ts001-after.jpg'
      ]
    },

    {
      id: 'TS-002',
      title: 'Перенос лифтовых шахт в корпусе Б ЖК «Солнечный»',
      description: 'Изменение расположения лифтовых шахт в корпусе Б с западной на восточную сторону здания в связи с оптимизацией планировочных решений и улучшением инсоляции квартир',
      type: 'structural',
      priority: 'medium',
      status: 'in_progress',
      section: 'Корпус Б, лифтовые шахты',
      reason: 'Оптимизация инсоляции квартир',
      createdAt: '2025-03-02T14:20:00Z',
      dueDate: '2025-03-15',
      cost: 890000,
      costImpact: 'increase',
      scheduleImpact: 12,

      participants: [
        {
          role: 'customer',
          name: 'Иванов И.И.',
          position: 'Технический директор',
          status: 'pending',
          comments: null
        },
        {
          role: 'contractor',
          name: 'Петров П.П.',
          position: 'Главный инженер проекта',
          status: 'approved',
          approvedAt: '2025-03-03T10:15:00Z',
          comments: 'Техническая возможность реализации подтверждена'
        },
        {
          role: 'supervision',
          name: 'Сидоров С.С.',
          position: 'Инженер стройконтроля',
          status: 'under_review',
          comments: 'Требуется дополнительная проработка схемы'
        },
        {
          role: 'designer',
          name: 'Козлов К.К.',
          position: 'Главный конструктор',
          status: 'approved',
          approvedAt: '2025-03-02T16:45:00Z',
          comments: 'Схема перекладки разработана'
        }
      ],

      documents: [
        {
          name: 'Схема перекладки сетей.pdf',
          type: 'drawings',
          uploadedAt: '2025-03-02T14:20:00Z',
          size: '1.8 MB'
        }
      ],

      relatedTasks: ['communications'],
      photos: []
    },

    {
      id: 'TS-003',
      title: 'Устройство дополнительных балконов в корпусе А ЖК «Солнечный»',
      description: 'Пристройка французских балконов к квартирам на втором этаже корпуса А по требованию отдела продаж для повышения привлекательности объекта',
      type: 'structural', 
      priority: 'high',
      status: 'pending',
      section: 'Корпус А, этаж 2',
      reason: 'Требования отдела продаж',
      createdAt: '2025-03-05T11:00:00Z',
      dueDate: '2025-03-20',
      cost: 750000,
      costImpact: 'increase',
      scheduleImpact: 15,

      participants: [
        {
          role: 'customer',
          name: 'Иванов И.И.',
          position: 'Технический директор',
          status: 'pending',
          comments: null
        },
        {
          role: 'contractor',
          name: 'Петров П.П.',
          position: 'Главный инженер проекта',
          status: 'pending',
          comments: null
        },
        {
          role: 'supervision',
          name: 'Сидоров С.С.',
          position: 'Инженер стройконтроля',
          status: 'pending',
          comments: null
        },
        {
          role: 'designer',
          name: 'Козлов К.К.',
          position: 'Главный конструктор',
          status: 'under_review',
          comments: 'Проводится расчет усиления конструкций'
        }
      ],

      documents: [
        {
          name: 'Обоснование усиления.pdf',
          type: 'calculations',
          uploadedAt: '2025-03-05T11:00:00Z',
          size: '892 KB'
        }
      ],

      relatedTasks: ['structure'],
      photos: []
    },

    {
      id: 'TS-004',
      title: 'Изменение цветового решения фасада ЖК «Солнечный»',
      description: 'Замена серого фасада на бежево-терракотовую гамму в соответствии с пожеланиями управляющей компании и для лучшей гармонии с окружающей застройкой',
      type: 'facade',
      priority: 'low',
      status: 'rejected',
      section: 'Фасады корпусов А и Б',
      reason: 'Эстетические требования УК',
      createdAt: '2025-02-28T09:30:00Z',
      rejectedAt: '2025-03-01T16:00:00Z',
      dueDate: '2025-04-01',
      cost: -150000,
      costImpact: 'decrease',
      scheduleImpact: null,

      participants: [
        {
          role: 'customer',
          name: 'Иванов И.И.',
          position: 'Технический директор',
          status: 'rejected',
          approvedAt: '2025-03-01T16:00:00Z',
          comments: 'Не соответствует архитектурной концепции проекта'
        },
        {
          role: 'contractor',
          name: 'Петров П.П.',
          position: 'Главный инженер проекта',
          status: 'approved',
          approvedAt: '2025-02-28T14:20:00Z',
          comments: 'Экономически целесообразно'
        },
        {
          role: 'supervision',
          name: 'Сидоров С.С.',
          position: 'Инженер стройконтроля',
          status: 'neutral',
          comments: 'С технической точки зрения оба варианта приемлемы'
        },
        {
          role: 'designer',
          name: 'Козлов К.К.',
          position: 'Главный конструктор',
          status: 'rejected',
          approvedAt: '2025-02-28T17:45:00Z',
          comments: 'Нарушает целостность архитектурного замысла'
        }
      ],

      documents: [
        {
          name: 'Сравнительная таблица материалов.xlsx',
          type: 'analysis',
          uploadedAt: '2025-02-28T09:30:00Z',
          size: '245 KB'
        }
      ],

      relatedTasks: ['walls'],
      photos: []
    }
  ],

  // Статистика по техническим решениям
  statistics: {
    total: 4,
    byStatus: {
      pending: 1,
      in_progress: 1,
      approved: 1,
      rejected: 1
    },
    byPriority: {
      high: 2,
      medium: 1,
      low: 1
    },
    byType: {
      foundation: 1,
      utilities: 1,
      structural: 1,
      facade: 1
    },
    totalCostImpact: 2690000, // сумма увеличения затрат (с учетом экономии)
    totalScheduleImpact: 34 // общая задержка в днях
  },

  // Шаблоны участников
  participantRoles: [
    {
      role: 'customer',
      label: 'Заказчик',
      required: true,
      color: '#3b82f6'
    },
    {
      role: 'contractor', 
      label: 'Подрядчик',
      required: true,
      color: '#10b981'
    },
    {
      role: 'supervision',
      label: 'Строительный контроль',
      required: true,
      color: '#f59e0b'
    },
    {
      role: 'designer',
      label: 'Проектировщик',
      required: false,
      color: '#8b5cf6'
    }
  ]
};

// Функции для работы с техническими решениями
export const getTechnicalSolutions = () => MOCK_TECHNICAL_SOLUTIONS.solutions;

export const getTechnicalSolutionById = (id) => 
  MOCK_TECHNICAL_SOLUTIONS.solutions.find(solution => solution.id === id);

export const getTechnicalSolutionsByStatus = (status) =>
  MOCK_TECHNICAL_SOLUTIONS.solutions.filter(solution => solution.status === status);

export const getTechnicalSolutionsByPriority = (priority) =>
  MOCK_TECHNICAL_SOLUTIONS.solutions.filter(solution => solution.priority === priority);

export const getStatistics = () => MOCK_TECHNICAL_SOLUTIONS.statistics;

export const getParticipantRoles = () => MOCK_TECHNICAL_SOLUTIONS.participantRoles;

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'in_progress': return '#3b82f6'; 
    case 'under_review': return '#8b5cf6';
    case 'approved': return '#10b981';
    case 'rejected': return '#ef4444';
    case 'neutral': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'Ожидает согласования';
    case 'in_progress': return 'В процессе согласования';
    case 'under_review': return 'На рассмотрении';
    case 'approved': return 'Согласовано';
    case 'rejected': return 'Отклонено';
    case 'neutral': return 'Нейтрально';
    default: return 'Неизвестно';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return 'Средний';
  }
};

export const getTypeLabel = (type) => {
  switch (type) {
    case 'foundation': return 'Фундамент';
    case 'structural': return 'Конструкции';
    case 'utilities': return 'Инженерные сети';
    case 'facade': return 'Фасад';
    case 'roofing': return 'Кровля';
    case 'interior': return 'Внутренние работы';
    case 'landscaping': return 'Благоустройство';
    case 'other': return 'Прочее';
    default: return 'Прочее';
  }
};
