// Mock данные для сетевого плана строительства
export const MOCK_NETWORK_SCHEDULE = {
  project: {
    id: 'TI-001',
    name: 'ЖК Новая Москва',
    contractor: 'ООО СтройИнвест',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    totalDuration: 365,
    completedDays: 95,
    status: 'В процессе'
  },

  phases: [
    {
      id: 'prep',
      name: 'Подготовительные работы',
      startDate: '2024-01-01',
      endDate: '2024-01-20',
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
      startDate: '2024-01-21',
      endDate: '2024-02-15',
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
      startDate: '2024-02-16',
      endDate: '2024-03-30',
      duration: 43,
      progress: 85,
      status: 'В процессе',
      criticalPath: true,
      tasks: [
        'Устройство подбетонки',
        'Арматурные работы',
        'Бетонирование фундамента',
        'Гидроизоляция'
      ],
      issues: [
        {
          type: 'delay',
          description: 'Задержка поставки арматуры на 3 дня',
          impact: 'Отставание от графика на 3 дня'
        }
      ]
    },
    {
      id: 'structure',
      name: 'Возведение каркаса',
      startDate: '2024-03-31',
      endDate: '2024-07-15',
      duration: 106,
      progress: 45,
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
      startDate: '2024-05-01',
      endDate: '2024-09-30',
      duration: 152,
      progress: 25,
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
      startDate: '2024-07-16',
      endDate: '2024-09-15',
      duration: 61,
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
      startDate: '2024-06-01',
      endDate: '2024-11-30',
      duration: 182,
      progress: 15,
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
      startDate: '2024-10-01',
      endDate: '2024-12-20',
      duration: 80,
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
      date: '2024-02-15',
      status: 'Достигнуто',
      achieved: true
    },
    {
      id: 'ms2',
      name: 'Завершение фундамента',
      date: '2024-03-30',
      status: 'Под угрозой срыва',
      achieved: false,
      risk: 'high'
    },
    {
      id: 'ms3',
      name: 'Возведение каркаса до 5 этажа',
      date: '2024-06-30',
      status: 'В процессе',
      achieved: false
    },
    {
      id: 'ms4',
      name: 'Завершение кровельных работ',
      date: '2024-09-15',
      status: 'Запланировано',
      achieved: false
    },
    {
      id: 'ms5',
      name: 'Готовность к сдаче',
      date: '2024-12-20',
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
    summary: 'Проект находится на стадии фундаментных работ с небольшим отставанием',
    overallProgress: 26,
    schedule: {
      status: 'Отставание',
      delay: 3,
      delayUnit: 'дня'
    },
    budget: {
      planned: 125000000,
      spent: 32500000,
      remaining: 92500000,
      utilizationPercent: 26
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
      date: '2024-04-05',
      type: 'progress',
      message: 'Завершена установка арматурного каркаса фундамента секции А'
    },
    {
      date: '2024-04-04',
      type: 'issue',
      message: 'Выявлены нарушения в геометрии котлована, требуется корректировка'
    },
    {
      date: '2024-04-03',
      type: 'milestone',
      message: 'Получено разрешение на возведение каркаса'
    },
    {
      date: '2024-04-02',
      type: 'delivery',
      message: 'Поставлена партия бетона марки М300 - 180 м³'
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

