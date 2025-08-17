// Mock данные для сетевого плана строительства
export const MOCK_NETWORK_SCHEDULE = {
  project: {
    id: 'TI-001',
    name: 'ЖК Новая Москва',
    contractor: 'ООО СтройИнвест',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    totalDuration: 365,
    completedDays: 228,
    status: 'В процессе'
  },

  phases: [
    {
      id: 'prep',
      name: 'Подготовительные работы',
      startDate: '2025-01-01',
      endDate: '2025-01-20',
      duration: 20,
      progress: 100,
      status: 'Завершено',
      criticalPath: false,
      tasks: [
        'Оформление разрешений',
        'Подготовка стройплощадки',
        'Установка ограждений',
        'Подключение коммуникаций'
      ]
    },
    {
      id: 'earthworks',
      name: 'Земляные работы',
      startDate: '2025-01-21',
      endDate: '2025-02-15',
      duration: 25,
      progress: 100,
      status: 'Завершено',
      criticalPath: true,
      tasks: [
        'Разработка котлована',
        'Планировка территории',
        'Устройство временных дорог'
      ]
    },
    {
      id: 'foundation',
      name: 'Фундаментные работы',
      startDate: '2025-02-16',
      endDate: '2025-04-15',
      duration: 58,
      progress: 100,
      status: 'Завершено',
      criticalPath: true,
      tasks: [
        'Устройство подбетонки',
        'Арматурные работы',
        'Бетонирование фундамента',
        'Гидроизоляция'
      ],
      issues: [
        {
          type: 'resolved',
          description: 'Задержка поставки арматуры была устранена',
          impact: 'Работы завершены в срок'
        }
      ]
    },
    {
      id: 'structure',
      name: 'Возведение каркаса',
      startDate: '2025-04-16',
      endDate: '2025-08-20',
      duration: 126,
      progress: 92,
      status: 'В процессе',
      criticalPath: true,
      tasks: [
        'Монтаж колонн 1-5 этажей',
        'Устройство перекрытий',
        'Монтаж лестничных маршей'
      ]
    },
    {
      id: 'walls',
      name: 'Кладочные работы',
      startDate: '2025-06-01',
      endDate: '2025-10-15',
      duration: 136,
      progress: 55,
      status: 'В процессе',
      criticalPath: false,
      tasks: [
        'Кладка наружных стен',
        'Кладка внутренних стен',
        'Устройство проемов'
      ]
    },
    {
      id: 'roofing',
      name: 'Кровельные работы',
      startDate: '2025-08-21',
      endDate: '2025-10-30',
      duration: 70,
      progress: 0,
      status: 'Запланировано',
      criticalPath: true,
      tasks: [
        'Устройство стропильной системы',
        'Монтаж кровельного покрытия',
        'Устройство водостоков'
      ]
    },
    {
      id: 'communications',
      name: 'Инженерные коммуникации',
      startDate: '2025-08-01',
      endDate: '2025-12-15',
      duration: 136,
      progress: 12,
      status: 'В процессе',
      criticalPath: false,
      tasks: [
        'Электромонтажные работы',
        'Сантехнические работы',
        'Вентиляция и кондиционирование'
      ]
    },
    {
      id: 'finishing',
      name: 'Отделочные работы',
      startDate: '2025-11-01',
      endDate: '2026-01-31',
      duration: 91,
      progress: 0,
      status: 'Запланировано',
      criticalPath: false,
      tasks: [
        'Штукатурные работы',
        'Малярные работы',
        'Укладка напольных покрытий',
        'Установка дверей и окон'
      ]
    }
  ],

  milestones: [
    {
      id: 'ms1',
      name: 'Завершение земляных работ',
      date: '2025-02-15',
      status: 'Достигнуто',
      achieved: true
    },
    {
      id: 'ms2',
      name: 'Завершение фундамента',
      date: '2025-04-15',
      status: 'Достигнуто',
      achieved: true
    },
    {
      id: 'ms3',
      name: 'Возведение каркаса до 5 этажа',
      date: '2025-08-20',
      status: 'Почти завершено',
      achieved: false
    },
    {
      id: 'ms4',
      name: 'Завершение кровельных работ',
      date: '2025-10-30',
      status: 'Запланировано',
      achieved: false
    },
    {
      id: 'ms5',
      name: 'Готовность к сдаче',
      date: '2026-01-31',
      status: 'Запланировано',
      achieved: false
    }
  ],

  criticalPath: [
    'earthworks',
    'foundation', 
    'structure',
    'roofing'
  ],

  resources: {
    workers: {
      total: 45,
      active: 38,
      categories: [
        { name: 'Каменщики', count: 12, active: 10 },
        { name: 'Арматурщики', count: 8, active: 8 },
        { name: 'Бетонщики', count: 6, active: 5 },
        { name: 'Крановщики', count: 3, active: 3 },
        { name: 'Подсобные рабочие', count: 16, active: 12 }
      ]
    },
    equipment: [
      { name: 'Башенный кран', status: 'Работает', utilization: 75 },
      { name: 'Бетононасос', status: 'Работает', utilization: 60 },
      { name: 'Экскаватор', status: 'Простой', utilization: 0 },
      { name: 'Автобетоносмеситель', status: 'Работает', utilization: 85 }
    ]
  },

  currentStatus: {
    summary: 'Проект находится на стадии завершения каркаса и кладочных работ, согласно графику',
    overallProgress: 62,
    schedule: {
      status: 'В срок',
      delay: 0,
      delayUnit: 'дней'
    },
    budget: {
      planned: 125000000,
      spent: 77500000,
      remaining: 47500000,
      utilizationPercent: 62
    },
    risks: [
      {
        type: 'schedule',
        level: 'medium',
        description: 'Задержка поставки материалов может повлиять на критический путь'
      },
      {
        type: 'weather',
        level: 'low',
        description: 'Погодные условия благоприятные для проведения работ'
      }
    ]
  },

  recentUpdates: [
    {
      date: '2025-08-15',
      type: 'progress',
      message: 'Завершен монтаж каркаса 5-го этажа, прогресс каркаса 92%'
    },
    {
      date: '2025-08-10',
      type: 'milestone',
      message: 'Начаты работы по монтажу инженерных коммуникаций'
    },
    {
      date: '2025-08-05',
      type: 'delivery',
      message: 'Поставка кирпича для кладочных работ - 15000 шт.'
    },
    {
      date: '2025-07-28',
      type: 'progress',
      message: 'Завершена кладка наружных стен 1-3 этажей'
    }
  ]
};

// Функции для работы с данными сетевого плана
export const getProjectStatus = () => MOCK_NETWORK_SCHEDULE.currentStatus;

export const getCriticalPathPhases = () => 
  MOCK_NETWORK_SCHEDULE.phases.filter(phase => 
    MOCK_NETWORK_SCHEDULE.criticalPath.includes(phase.id)
  );

export const getActivePhases = () =>
  MOCK_NETWORK_SCHEDULE.phases.filter(phase => 
    phase.status === 'В процессе'
  );

export const getUpcomingMilestones = () =>
  MOCK_NETWORK_SCHEDULE.milestones.filter(milestone => 
    !milestone.achieved && new Date(milestone.date) > new Date()
  );

export const getDelayedPhases = () =>
  MOCK_NETWORK_SCHEDULE.phases.filter(phase => 
    phase.issues && phase.issues.length > 0
  );

export const getScheduleInsights = () => {
  const status = getProjectStatus();
  const criticalPhases = getCriticalPathPhases();
  const delayedPhases = getDelayedPhases();
  
  return {
    overallHealth: status.schedule.delay <= 5 ? 'good' : status.schedule.delay <= 10 ? 'warning' : 'critical',
    criticalPathRisk: delayedPhases.some(phase => phase.criticalPath) ? 'high' : 'low',
    resourceUtilization: status.budget.utilizationPercent,
    upcomingRisks: status.risks
  };
};

