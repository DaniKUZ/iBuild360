import test from './img/test.jpg';

// Моковые данные фотографий, сгруппированные по датам
export const mockPhotoArchive = {
  '2024-01-15': {
    date: '15 января 2024',
    photos: [
      { id: 1, name: 'Главная комната - утро', url: test, time: '09:30' },
      { id: 2, name: 'Кухня - утро', url: test, time: '09:45' },
      { id: 3, name: 'Спальня - утро', url: test, time: '10:00' },
      { id: 4, name: 'Ванная - утро', url: test, time: '10:15' },
    ]
  },
  '2024-01-10': {
    date: '10 января 2024',
    photos: [
      { id: 5, name: 'Главная комната - день', url: test, time: '14:20' },
      { id: 6, name: 'Кухня - день', url: test, time: '14:35' },
      { id: 7, name: 'Балкон', url: test, time: '14:50' },
    ]
  },
  '2024-01-05': {
    date: '5 января 2024',
    photos: [
      { id: 8, name: 'Главная комната - вечер', url: test, time: '18:10' },
      { id: 9, name: 'Кухня - вечер', url: test, time: '18:25' },
      { id: 10, name: 'Спальня - вечер', url: test, time: '18:40' },
      { id: 11, name: 'Ванная - вечер', url: test, time: '18:55' },
      { id: 12, name: 'Коридор', url: test, time: '19:10' },
    ]
  },
  '2023-12-28': {
    date: '28 декабря 2023',
    photos: [
      { id: 13, name: 'Общий вид', url: test, time: '12:00' },
      { id: 14, name: 'Детальный вид кухни', url: test, time: '12:15' },
    ]
  },
}; 