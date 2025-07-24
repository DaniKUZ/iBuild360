import test from './img/test.jpg';

// Фотоархив, сгруппированный по комнатам/локациям для удобного сравнения
export const mockPhotoArchive = {
  'main-room': {
    name: 'Главная комната',
    photos: [
      { 
        id: 1, 
        url: test, 
        date: '15 января 2024', 
        time: '09:30', 
        dateKey: '2024-01-15',
        period: 'утро',
        description: 'Утренний свет через окна'
      },
      { 
        id: 5, 
        url: test, 
        date: '10 января 2024', 
        time: '14:20', 
        dateKey: '2024-01-10',
        period: 'день',
        description: 'Дневное освещение'
      },
      { 
        id: 8, 
        url: test, 
        date: '5 января 2024', 
        time: '18:10', 
        dateKey: '2024-01-05',
        period: 'вечер',
        description: 'Вечернее освещение'
      }
    ]
  },
  'kitchen': {
    name: 'Кухня',
    photos: [
      { 
        id: 2, 
        url: test, 
        date: '15 января 2024', 
        time: '09:45', 
        dateKey: '2024-01-15',
        period: 'утро',
        description: 'Кухня утром'
      },
      { 
        id: 6, 
        url: test, 
        date: '10 января 2024', 
        time: '14:35', 
        dateKey: '2024-01-10',
        period: 'день',
        description: 'Кухня днем'
      },
      { 
        id: 9, 
        url: test, 
        date: '5 января 2024', 
        time: '18:25', 
        dateKey: '2024-01-05',
        period: 'вечер',
        description: 'Кухня вечером'
      },
      { 
        id: 14, 
        url: test, 
        date: '28 декабря 2023', 
        time: '12:15', 
        dateKey: '2023-12-28',
        period: 'день',
        description: 'Детальный вид кухни'
      }
    ]
  },
  'bedroom': {
    name: 'Спальня',
    photos: [
      { 
        id: 3, 
        url: test, 
        date: '15 января 2024', 
        time: '10:00', 
        dateKey: '2024-01-15',
        period: 'утро',
        description: 'Спальня утром'
      },
      { 
        id: 10, 
        url: test, 
        date: '5 января 2024', 
        time: '18:40', 
        dateKey: '2024-01-05',
        period: 'вечер',
        description: 'Спальня вечером'
      }
    ]
  },
  'bathroom': {
    name: 'Ванная',
    photos: [
      { 
        id: 4, 
        url: test, 
        date: '15 января 2024', 
        time: '10:15', 
        dateKey: '2024-01-15',
        period: 'утро',
        description: 'Ванная утром'
      },
      { 
        id: 11, 
        url: test, 
        date: '5 января 2024', 
        time: '18:55', 
        dateKey: '2024-01-05',
        period: 'вечер',
        description: 'Ванная вечером'
      }
    ]
  },
  'balcony': {
    name: 'Балкон',
    photos: [
      { 
        id: 7, 
        url: test, 
        date: '10 января 2024', 
        time: '14:50', 
        dateKey: '2024-01-10',
        period: 'день',
        description: 'Балкон днем'
      }
    ]
  },
  'corridor': {
    name: 'Коридор',
    photos: [
      { 
        id: 12, 
        url: test, 
        date: '5 января 2024', 
        time: '19:10', 
        dateKey: '2024-01-05',
        period: 'вечер',
        description: 'Коридор вечером'
      }
    ]
  },
  'overview': {
    name: 'Общий вид',
    photos: [
      { 
        id: 13, 
        url: test, 
        date: '28 декабря 2023', 
        time: '12:00', 
        dateKey: '2023-12-28',
        period: 'день',
        description: 'Общий вид помещения'
      }
    ]
  }
};

// Вспомогательные функции для работы с новой структурой данных
export const getPhotosByRoom = (roomKey) => {
  return mockPhotoArchive[roomKey]?.photos || [];
};

export const getRoomByPhotoId = (photoId) => {
  for (const [roomKey, roomData] of Object.entries(mockPhotoArchive)) {
    const photo = roomData.photos.find(p => p.id === photoId);
    if (photo) {
      return { roomKey, roomData, photo };
    }
  }
  return null;
};

export const getComparisonPhotos = (currentPhotoId) => {
  const currentPhotoData = getRoomByPhotoId(currentPhotoId);
  if (!currentPhotoData) return [];

  // Возвращаем все фото из той же комнаты, кроме текущего
  return currentPhotoData.roomData.photos.filter(photo => photo.id !== currentPhotoId);
};

export const getAllRooms = () => {
  return Object.entries(mockPhotoArchive).map(([roomKey, roomData]) => ({
    roomKey,
    ...roomData
  }));
}; 