import { getImageByFloorAndType, TIME_PERIODS } from '../constants/imageConstants';

/**
 * Утилиты для работы с изображениями в Viewer360
 */

/**
 * Получает URL изображения на основе даты и других параметров
 */
export const getImageUrlByDate = (date, floor = 2, imageIndex = 1) => {
  const dateStr = date.toISOString().split('T')[0];
  
  // Определяем тип времени на основе даты
  let timePeriod = TIME_PERIODS.CURRENT;
  
  if (dateStr === '2025-07-12') {
    timePeriod = TIME_PERIODS.PAST;
  } else if (dateStr === '2025-07-04') {
    timePeriod = TIME_PERIODS.PAST_PAST;
  }
  
  return getImageByFloorAndType(floor, imageIndex, timePeriod);
};

/**
 * Получает доступные даты для указанного этажа
 */
export const getAvailableDates = (floorId) => {
  if (floorId === 1) {
    // Первый этаж: 4, 12, 21 июля 2025
    return [
      new Date(2025, 6, 4),  // 4 июля 2025 - past_past
      new Date(2025, 6, 12), // 12 июля 2025 - past
      new Date(2025, 6, 21), // 21 июля 2025 - current
    ];
  } else {
    // Второй этаж: 1, 12, 24 июля 2025
    return [
      new Date(2025, 6, 1),  // 1 июля 2025 - past_past
      new Date(2025, 6, 12), // 12 июля 2025 - past
      new Date(2025, 6, 24), // 24 июля 2025 - current
    ];
  }
};

/**
 * Определяет тип периода времени по дате
 */
export const getTimePeriodByDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  switch (dateStr) {
    case '2025-07-04':
      return TIME_PERIODS.PAST_PAST;
    case '2025-07-12':
      return TIME_PERIODS.PAST;
    default:
      return TIME_PERIODS.CURRENT;
  }
};

/**
 * Проверяет, доступна ли дата для указанного этажа
 */
export const isDateAvailableForFloor = (date, floorId) => {
  const availableDates = getAvailableDates(floorId);
  const targetDate = date.toISOString().split('T')[0];
  
  return availableDates.some(availableDate => 
    availableDate.toISOString().split('T')[0] === targetDate
  );
};

/**
 * Форматирует дату для отображения
 */
export const formatDateForDisplay = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Получает следующую доступную дату
 */
export const getNextAvailableDate = (currentDate, floorId) => {
  const availableDates = getAvailableDates(floorId);
  const currentIndex = availableDates.findIndex(date => 
    date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
  );
  
  if (currentIndex === -1 || currentIndex === availableDates.length - 1) {
    return availableDates[0]; // Возвращаем первую дату если текущая не найдена или это последняя
  }
  
  return availableDates[currentIndex + 1];
};

/**
 * Получает предыдущую доступную дату
 */
export const getPreviousAvailableDate = (currentDate, floorId) => {
  const availableDates = getAvailableDates(floorId);
  const currentIndex = availableDates.findIndex(date => 
    date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
  );
  
  if (currentIndex === -1 || currentIndex === 0) {
    return availableDates[availableDates.length - 1]; // Возвращаем последнюю дату
  }
  
  return availableDates[currentIndex - 1];
};

/**
 * Создает скриншот текущего вида
 */
export const captureScreenshot = (canvas) => {
  if (!canvas) return null;
  
  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Ошибка при создании скриншота:', error);
    return null;
  }
};

/**
 * Преобразует изображение в base64 с уменьшением размера
 */
export const convertImageToBase64 = async (imageUrl, maxSize = 800, quality = 0.7) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Вычисляем новые размеры
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Рисуем уменьшенное изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в base64
        const base64data = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        resolve(base64data);
      };
      
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Ошибка конвертации изображения:', error);
    throw error;
  }
};