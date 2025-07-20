import modernFlat from './img/modern_flat.jpeg';
import office from './img/office.jpeg';
import house from './img/house.jpeg';
import restaurant from './img/restaurant.jpeg';
import mall from './img/mall.jpeg';
import cottage from './img/cottage.jpeg';
import studio from './img/studio.jpeg';
import conference from './img/conference.jpeg';

export const mockProjects = [
  {
    id: 1,
    name: "Современная квартира",
    lastUpdate: "2024-01-15",
    user: "Анна Смирнова",
    status: "В работе",
    preview: modernFlat,
    address: "ул. Тверская, 15, Москва",
    latitude: 55.7558,
    longitude: 37.6173,
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
    ]
  },
  {
    id: 2,
    name: "Офисное пространство",
    lastUpdate: "2024-01-14",
    user: "Михаил Петров",
    status: "Завершен",
    preview: office,
    address: "Московский проспект, 100, Санкт-Петербург",
    latitude: 59.8736,
    longitude: 30.2627,
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
        progress: 100,
        status: "completed",
        description: "Возведение перегородок и инженерных систем",
        dependencies: [1],
        responsible: "Строители"
      },
      {
        id: 3,
        name: "Оснащение офиса",
        startDate: "2024-01-11",
        endDate: "2024-01-14",
        progress: 100,
        status: "completed",
        description: "Установка мебели и оборудования",
        dependencies: [2],
        responsible: "Монтажники"
      }
    ]
  },
  {
    id: 3,
    name: "Загородный дом",
    lastUpdate: "2024-01-13",
    user: "Елена Козлова",
    status: "Черновик",
    preview: house,
    address: "дер. Николино, Одинцовский район, Московская область",
    latitude: 55.6667,
    longitude: 37.2833,
    schedule: []
  },
  {
    id: 4,
    name: "Ресторан",
    lastUpdate: "2024-01-12",
    user: "Дмитрий Волков",
    status: "В работе",
    preview: restaurant,
    address: "Невский проспект, 28, Санкт-Петербург",
    latitude: 59.9342,
    longitude: 30.3350,
    schedule: [
      {
        id: 1,
        name: "Проектирование кухни",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
        progress: 100,
        status: "completed",
        description: "Разработка планировки кухонной зоны",
        dependencies: [],
        responsible: "Шеф-повар"
      },
      {
        id: 2,
        name: "Установка оборудования",
        startDate: "2024-01-11",
        endDate: "2024-01-20",
        progress: 60,
        status: "in_progress",
        description: "Монтаж кухонного оборудования",
        dependencies: [1],
        responsible: "Монтажники"
      },
      {
        id: 3,
        name: "Оформление зала",
        startDate: "2024-01-15",
        endDate: "2024-01-25",
        progress: 30,
        status: "in_progress",
        description: "Декорирование обеденной зоны",
        dependencies: [],
        responsible: "Дизайнер"
      }
    ]
  },
  {
    id: 5,
    name: "Торговый центр",
    lastUpdate: "2024-01-11",
    user: "Ольга Иванова",
    status: "Завершен",
    preview: mall,
    address: "МКАД, 47 км, Москва",
    latitude: 55.6415,
    longitude: 37.4858,
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
        progress: 100,
        status: "completed",
        description: "Установка торгового оборудования",
        dependencies: [2],
        responsible: "Арендаторы"
      }
    ]
  },
  {
    id: 6,
    name: "Коттедж у озера",
    lastUpdate: "2024-01-10",
    user: "Сергей Федоров",
    status: "В работе",
    preview: cottage,
    address: "пос. Сосновка, Истринский район, Московская область",
    latitude: 55.9167,
    longitude: 36.8667,
    schedule: [
      {
        id: 1,
        name: "Фундаментные работы",
        startDate: "2023-05-01",
        endDate: "2023-06-15",
        progress: 100,
        status: "completed",
        description: "Заливка фундамента и подвала",
        dependencies: [],
        responsible: "Фундаментщики"
      },
      {
        id: 2,
        name: "Возведение стен",
        startDate: "2023-06-16",
        endDate: "2023-09-30",
        progress: 100,
        status: "completed",
        description: "Строительство стен из бруса",
        dependencies: [1],
        responsible: "Плотники"
      },
      {
        id: 3,
        name: "Кровельные работы",
        startDate: "2023-10-01",
        endDate: "2023-11-15",
        progress: 100,
        status: "completed",
        description: "Монтаж крыши и водостоков",
        dependencies: [2],
        responsible: "Кровельщики"
      },
      {
        id: 4,
        name: "Внутренняя отделка",
        startDate: "2023-11-16",
        endDate: "2024-01-31",
        progress: 70,
        status: "in_progress",
        description: "Отделка комнат и ванных",
        dependencies: [3],
        responsible: "Отделочники"
      }
    ]
  },
  {
    id: 7,
    name: "Студия дизайна",
    lastUpdate: "2024-01-09",
    user: "Мария Новикова",
    status: "Черновик",
    preview: studio,
    address: "ул. Арбат, 25, Москва",
    latitude: 55.7522,
    longitude: 37.5928,
    schedule: [
      {
        id: 1,
        name: "Концепция дизайна",
        startDate: "2024-01-08",
        endDate: "2024-01-15",
        progress: 40,
        status: "in_progress",
        description: "Разработка общей концепции студии",
        dependencies: [],
        responsible: "Главный дизайнер"
      }
    ]
  },
  {
    id: 8,
    name: "Конференц-зал",
    lastUpdate: "2024-01-08",
    user: "Александр Морозов",
    status: "В работе",
    preview: conference,
    address: "ул. Большая Конюшенная, 19, Санкт-Петербург",
    latitude: 59.9398,
    longitude: 30.3178,
    schedule: [
      {
        id: 1,
        name: "Акустическая подготовка",
        startDate: "2023-12-20",
        endDate: "2024-01-05",
        progress: 100,
        status: "completed",
        description: "Установка звукоизоляции и акустики",
        dependencies: [],
        responsible: "Акустики"
      },
      {
        id: 2,
        name: "AV-оборудование",
        startDate: "2024-01-06",
        endDate: "2024-01-15",
        progress: 80,
        status: "in_progress",
        description: "Монтаж видео и аудио систем",
        dependencies: [1],
        responsible: "AV-инженеры"
      }
    ]
  },
];

export const projectStatuses = [
  { value: "all", label: "Все статусы" },
  { value: "Черновик", label: "Черновик" },
  { value: "В работе", label: "В работе" },
  { value: "Завершен", label: "Завершен" },
]; 