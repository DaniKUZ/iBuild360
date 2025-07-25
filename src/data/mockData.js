import buildingimg1 from './img/buildingimg1.jpeg';
import buildingimg2 from './img/buildingimg2.jpeg';
import buildingimg3 from './img/buildingimg3.jpeg';
import schemeFloor1 from './img/schemeFloor1.png';
import schemeFloor2 from './img/schemeFloor2.png';
import scheme from './img/scheme.jpeg';
import { getUserData } from '../utils/userManager';

export const mockProjects = [
  {
    id: 1,
    name: "Жилой комплекс «Солнечный»",
    lastUpdate: "2024-01-20",
    user: "ООО «СтройИнвест»",
    status: "В работе",
    preview: buildingimg1,
    address: "ул. Тверская, 15, Москва",
    latitude: 55.7558,
    longitude: 37.6173,
    captures: 127,
    fieldNotes: {
      tags: [
        'Архитектурный',
        'BIM-сравнение',
        'Гражданский',
        'Конкретный',
        'Снос'
      ],
      statuses: [
        { id: 1, name: 'Приоритет1', color: '#e53e3e' },
        { id: 2, name: 'Приоритет2', color: '#f56500' },
        { id: 3, name: 'Приоритет3', color: '#d69e2e' },
        { id: 4, name: 'Закрыто', color: '#38a169' }
      ]
    },
    floors: [
      {
        id: 1,
        name: "1-й этаж",
        description: "Первый этаж жилого комплекса",
        thumbnail: schemeFloor1,
        fullImage: schemeFloor1,
        zones: []
      },
      {
        id: 2,
        name: "2-й этаж",
        description: "Второй этаж жилого комплекса",
        thumbnail: schemeFloor2,
        fullImage: schemeFloor2,
        zones: []
      }
    ],
    participants: [
      {
        id: 'current-user',
        email: getUserData().email,
        role: getUserData().role,
        name: getUserData().name
      }
    ],
    schedule: [
      {
        id: 1,
        name: "Планировочные работы",
        startDate: "2024-01-10",
        endDate: "2024-01-15",
        progress: 100,
        status: "completed",
        description: "Разработка планировки и дизайна",
        dependencies: [],
        responsible: "Дизайнер"
      },
      {
        id: 2,
        name: "Демонтажные работы",
        startDate: "2024-01-16",
        endDate: "2024-01-25",
        progress: 80,
        status: "in_progress",
        description: "Снос перегородок и старой отделки",
        dependencies: [1],
        responsible: "Бригада №1"
      },
      {
        id: 3,
        name: "Отделочные работы",
        startDate: "2024-01-26",
        endDate: "2024-02-10",
        progress: 0,
        status: "planned",
        description: "Финишная отделка помещений",
        dependencies: [2],
        responsible: "Отделочники"
      }
    ],
    bimFiles: [
      {
        id: 1,
        name: "План первого этажа",
        fileName: "floor_1_plan.ifc",
        size: 2048576,
        uploadDate: "2024-01-15"
      }
    ]
  },
  {
    id: 2,
    name: "Многофункциональный торговый центр",
    lastUpdate: "2024-01-18",
    user: "ГК «РосСтрой»",
    status: "Завершен",
    preview: buildingimg2,
    address: "МКАД, 47 км, Москва",
    latitude: 55.6415,
    longitude: 37.4858,
    captures: 73,
    fieldNotes: {
      tags: [
        'Общий',
        'Оборудование',
        'Электрические'
      ],
      statuses: [
        { id: 1, name: 'Приоритет1', color: '#e53e3e' },
        { id: 2, name: 'Закрыто', color: '#38a169' },
        { id: 3, name: 'Проверено', color: '#3182ce' }
      ]
    },
    floors: [
      {
        id: 4,
        name: "1-й этаж ТЦ",
        description: "Первый этаж торгового центра",
        thumbnail: scheme,
        fullImage: scheme,
        zones: []
      },
      {
        id: 5,
        name: "2-й этаж ТЦ",
        description: "Второй этаж торгового центра",
        thumbnail: schemeFloor1,
        fullImage: schemeFloor1,
        zones: []
      }
    ],
    participants: [
      {
        id: 'current-user',
        email: getUserData().email,
        role: getUserData().role,
        name: getUserData().name
      }
    ],
    schedule: [
      {
        id: 1,
        name: "Строительство каркаса",
        startDate: "2023-06-01",
        endDate: "2023-09-30",
        progress: 100,
        status: "completed",
        description: "Возведение основного каркаса здания",
        dependencies: [],
        responsible: "Строительная компания"
      },
      {
        id: 2,
        name: "Внутренние работы",
        startDate: "2023-10-01",
        endDate: "2023-12-15",
        progress: 100,
        status: "completed",
        description: "Отделка внутренних помещений",
        dependencies: [1],
        responsible: "Отделочники"
      },
      {
        id: 3,
        name: "Оборудование магазинов",
        startDate: "2023-12-16",
        endDate: "2024-01-11",
        progress: 75,
        status: "in_progress",
        description: "Установка торгового оборудования",
        dependencies: [2],
        responsible: "Арендаторы"
      }
    ],
    bimFiles: [
      {
        id: 2,
        name: "Модель торгового центра",
        fileName: "mall_structure.dwg",
        size: 5242880,
        uploadDate: "2024-01-17"
      },
      {
        id: 3,
        name: "Электрические схемы",
        fileName: "electrical_layout.rvt",
        size: 1024000,
        uploadDate: "2024-01-16"
      }
    ]
  },
  {
    id: 3,
    name: "Офисное здание бизнес-класса",
    lastUpdate: "2024-01-16",
    user: "АО «МосГорСтрой»",
    status: "В работе",
    preview: buildingimg3,
    address: "Московский проспект, 100, Санкт-Петербург",
    latitude: 59.8736,
    longitude: 30.2627,
    captures: 45,
    fieldNotes: {
      tags: [
        'Документ',
        'Лифт',
        'Пожарная сигнализация'
      ],
      statuses: [
        { id: 1, name: 'Приоритет2', color: '#f56500' },
        { id: 2, name: 'В ходе выполнения', color: '#805ad5' }
      ]
    },
    floors: [
      {
        id: 6,
        name: "1-й этаж",
        description: "Первый этаж офисного здания",
        thumbnail: schemeFloor2,
        fullImage: schemeFloor2,
        zones: []
      },
      {
        id: 7,
        name: "2-й этаж",
        description: "Второй этаж офисного здания",
        thumbnail: scheme,
        fullImage: scheme,
        zones: []
      }
    ],
    participants: [
      {
        id: 'current-user',
        email: 'test@example.com',
        role: 'Администратор',
        name: 'Тест'
      }
    ],
    schedule: [
      {
        id: 1,
        name: "Проектирование",
        startDate: "2023-12-01",
        endDate: "2023-12-15",
        progress: 100,
        status: "completed",
        description: "Разработка проекта офисного пространства",
        dependencies: [],
        responsible: "Архитектор"
      },
      {
        id: 2,
        name: "Строительные работы",
        startDate: "2023-12-16",
        endDate: "2024-01-10",
        progress: 90,
        status: "in_progress",
        description: "Возведение перегородок и инженерных систем",
        dependencies: [1],
        responsible: "Строители"
      },
      {
        id: 3,
        name: "Оснащение офиса",
        startDate: "2024-01-11",
        endDate: "2024-01-14",
        progress: 30,
        status: "in_progress",
        description: "Установка мебели и оборудования",
        dependencies: [2],
        responsible: "Монтажники"
      }
    ],
    bimFiles: [
      {
        id: 4,
        name: "Офисная планировка",
        fileName: "office_layout.dwg",
        size: 3145728,
        uploadDate: "2024-01-13"
      }
    ]
  }
];

export const projectStatuses = [
  { value: "all", label: "Все статусы" },
  { value: "Черновик", label: "Черновик" },
  { value: "В работе", label: "В работе" },
  { value: "Завершен", label: "Завершен" },
]; 