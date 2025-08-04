import { useState, useCallback } from 'react';
import { 
  getImageUrlByDate, 
  getAvailableDates, 
  getNextAvailableDate, 
  getPreviousAvailableDate,
  isDateAvailableForFloor,
  getTimePeriodByDate
} from '../utils/imageUtils';
import { getImageCountForFloor } from '../constants/imageConstants';

/**
 * Хук для управления изображениями и их состояниями
 */
const useImageManagement = (initialFloor = 2) => {
  const [currentFloor, setCurrentFloor] = useState(initialFloor);
  const [currentOPImageIndex, setCurrentOPImageIndex] = useState(1);

  // Получение URL изображения для левой панели
  const getLeftPanelImageUrl = useCallback((date = new Date(2025, 6, 24), imageIndex = currentOPImageIndex) => {
    return getImageUrlByDate(date, currentFloor, imageIndex);
  }, [currentFloor, currentOPImageIndex]);

  // Получение URL изображения для правой панели
  const getRightPanelImageUrl = useCallback((date = new Date(2025, 6, 12), imageIndex = currentOPImageIndex) => {
    return getImageUrlByDate(date, currentFloor, imageIndex);
  }, [currentFloor, currentOPImageIndex]);

  // Получение текущего изображения
  const getCurrentImageUrl = useCallback((date = new Date(2025, 6, 24), imageIndex = currentOPImageIndex) => {
    return getImageUrlByDate(date, currentFloor, imageIndex);
  }, [currentFloor, currentOPImageIndex]);

  // Переключение на следующее изображение
  const goToNextImage = useCallback(() => {
    const maxImages = getImageCountForFloor(currentFloor);
    setCurrentOPImageIndex(prev => (prev >= maxImages ? 1 : prev + 1));
  }, [currentFloor]);

  // Переключение на предыдущее изображение
  const goToPreviousImage = useCallback(() => {
    const maxImages = getImageCountForFloor(currentFloor);
    setCurrentOPImageIndex(prev => (prev <= 1 ? maxImages : prev - 1));
  }, [currentFloor]);

  // Переключение на конкретное изображение
  const goToImage = useCallback((index) => {
    const maxImages = getImageCountForFloor(currentFloor);
    if (index >= 1 && index <= maxImages) {
      setCurrentOPImageIndex(index);
    }
  }, [currentFloor]);

  // Смена этажа
  const changeFloor = useCallback((floor) => {
    if (floor === 1 || floor === 2) {
      setCurrentFloor(floor);
      // Сбрасываем индекс изображения при смене этажа
      setCurrentOPImageIndex(1);
    }
  }, []);

  // Получение следующей даты
  const getNextDate = useCallback((currentDate) => {
    return getNextAvailableDate(currentDate, currentFloor);
  }, [currentFloor]);

  // Получение предыдущей даты
  const getPreviousDate = useCallback((currentDate) => {
    return getPreviousAvailableDate(currentDate, currentFloor);
  }, []);

  // Получение доступных дат для текущего этажа
  const getAvailableDatesForCurrentFloor = useCallback(() => {
    return getAvailableDates(currentFloor);
  }, [currentFloor]);

  // Проверка доступности даты для текущего этажа
  const isDateAvailable = useCallback((date) => {
    return isDateAvailableForFloor(date, currentFloor);
  }, [currentFloor]);

  // Получение информации о текущем состоянии изображений
  const getImageInfo = useCallback(() => {
    const maxImages = getImageCountForFloor(currentFloor);
    return {
      currentIndex: currentOPImageIndex,
      maxImages,
      currentFloor,
      hasNext: currentOPImageIndex < maxImages,
      hasPrevious: currentOPImageIndex > 1,
    };
  }, [currentOPImageIndex, currentFloor]);

  // Получение типа периода времени
  const getTimePeriod = useCallback((date) => {
    return getTimePeriodByDate(date);
  }, []);

  return {
    // Состояния
    currentFloor,
    currentOPImageIndex,
    
    // Функции получения изображений
    getLeftPanelImageUrl,
    getRightPanelImageUrl,
    getCurrentImageUrl,
    
    // Функции навигации по изображениям
    goToNextImage,
    goToPreviousImage,
    goToImage,
    
    // Функции работы с этажами
    changeFloor,
    
    // Функции работы с датами
    getNextDate,
    getPreviousDate,
    getAvailableDatesForCurrentFloor,
    isDateAvailable,
    getTimePeriod,
    
    // Информационные функции
    getImageInfo,
    
    // Прямые сеттеры
    setCurrentFloor,
    setCurrentOPImageIndex,
  };
};

export default useImageManagement;