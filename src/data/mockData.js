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
  },
  {
    id: 2,
    name: "Офисное пространство",
    lastUpdate: "2024-01-14",
    user: "Михаил Петров",
    status: "Завершен",
    preview: office,
  },
  {
    id: 3,
    name: "Загородный дом",
    lastUpdate: "2024-01-13",
    user: "Елена Козлова",
    status: "Черновик",
    preview: house,
  },
  {
    id: 4,
    name: "Ресторан",
    lastUpdate: "2024-01-12",
    user: "Дмитрий Волков",
    status: "В работе",
    preview: restaurant,
  },
  {
    id: 5,
    name: "Торговый центр",
    lastUpdate: "2024-01-11",
    user: "Ольга Иванова",
    status: "Завершен",
    preview: mall,
  },
  {
    id: 6,
    name: "Коттедж у озера",
    lastUpdate: "2024-01-10",
    user: "Сергей Федоров",
    status: "В работе",
    preview: cottage,
  },
  {
    id: 7,
    name: "Студия дизайна",
    lastUpdate: "2024-01-09",
    user: "Мария Новикова",
    status: "Черновик",
    preview: studio,
  },
  {
    id: 8,
    name: "Конференц-зал",
    lastUpdate: "2024-01-08",
    user: "Александр Морозов",
    status: "В работе",
    preview: conference,
  },
];

export const projectStatuses = [
  { value: "all", label: "Все статусы" },
  { value: "Черновик", label: "Черновик" },
  { value: "В работе", label: "В работе" },
  { value: "Завершен", label: "Завершен" },
]; 