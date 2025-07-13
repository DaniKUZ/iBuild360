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
  },
];

export const projectStatuses = [
  { value: "all", label: "Все статусы" },
  { value: "Черновик", label: "Черновик" },
  { value: "В работе", label: "В работе" },
  { value: "Завершен", label: "Завершен" },
]; 