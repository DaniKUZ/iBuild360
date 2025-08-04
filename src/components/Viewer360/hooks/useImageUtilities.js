import { useMemo } from 'react';
import {
  opImg1Current, 
  opImg1Past, 
  opImg1PastPast, 
  opImg1CurrentFloor1,
  opImg1PastFloor1,
  opImg1PastPastFloor1,
  opImg2Current,
  opImg2Past,
  opImg2PastPast,
  opImg2CurrentFloor1,
  opImg2PastFloor1,
  opImg2PastPastFloor1,
  opImg3Current,
  opImg3Past,
  opImg3PastPast,
  opImg3CurrentFloor1,
  opImg3PastFloor1,
  opImg3PastPastFloor1,
  DEFAULT_360_IMAGE,
  opImg4Current,
  opImg4Past,
  opImg4PastPast,
  opImg5Current,
  opImg5Past,
  opImg5PastPast
} from '../constants/imageConstants';

const useImageUtilities = (viewerState, imageManagement, splitScreenState) => {
  // Проверяем что все зависимости готовы
  if (!viewerState || !imageManagement || !splitScreenState) {
    // Возвращаем заглушки если зависимости не готовы
    return {
      getAvailableDates: () => [],
      getShootingTime: () => '',
      getMaxImageIndex: () => 5,
      getInitialCameraPosition: () => ({ yaw: 0, pitch: 0, fov: 75 }),
      isDateAvailable: () => false,
      getOPImageUrl: () => '',
      getLeftPanelImageUrl: () => '',
      getRightPanelImageUrl: () => '',
      getLeftPanelInitialCamera: () => ({ yaw: 0, pitch: 0, fov: 75 }),
      getRightPanelInitialCamera: () => ({ yaw: 0, pitch: 0, fov: 75 }),
      getLeftPanelShootingTime: () => '',
      getRightPanelShootingTime: () => ''
    };
  }
  // Константы изображений для каждого этажа
  const opImagesFloor1 = useMemo(() => ({
    current: { 1: opImg1CurrentFloor1, 2: opImg2CurrentFloor1, 3: opImg3CurrentFloor1 },
    past: { 1: opImg1PastFloor1, 2: opImg2PastFloor1, 3: opImg3PastFloor1 },
    pastPast: { 1: opImg1PastPastFloor1, 2: opImg2PastPastFloor1, 3: opImg3PastPastFloor1 }
  }), []);

  const opImagesFloor2 = useMemo(() => ({
    current: { 1: opImg1Current, 2: opImg2Current, 3: opImg3Current, 4: opImg4Current, 5: opImg5Current },
    past: { 1: opImg1Past, 2: opImg2Past, 3: opImg3Past, 4: opImg4Past, 5: opImg5Past },
    pastPast: { 1: opImg1PastPast, 2: opImg2PastPast, 3: opImg3PastPast, 4: opImg4PastPast, 5: opImg5PastPast }
  }), []);

  // Функция для получения доступных дат в зависимости от этажа
  const getAvailableDates = useMemo(() => (floorId) => {
    if (floorId === 1) {
      // Первый этаж: 4, 12, 21 июля 2025
      return [
        new Date(2025, 6, 4),  // 4 июля 2025 - past_past
        new Date(2025, 6, 12), // 12 июля 2025 - past
        new Date(2025, 6, 21)  // 21 июля 2025 - current
      ];
    } else {
      // Второй этаж: 1, 12, 24 июля 2025
      return [
        new Date(2025, 6, 1),  // 1 июля 2025 - past_past
        new Date(2025, 6, 12), // 12 июля 2025 - past
        new Date(2025, 6, 24)  // 24 июля 2025 - current
      ];
    }
  }, []);

  // Функция для получения времени съемки  
  const getShootingTime = useMemo(() => () => {
    const floorId = imageManagement.currentFloor || 2;
    const currentDates = getAvailableDates(floorId);
    const selectedDate = viewerState.selectedDate;
    
    // Определяем время съемки на основе даты
    let timeString = 'Неизвестно';
    if (selectedDate.getTime() === currentDates[0].getTime()) { // past_past
      timeString = '08:00';
    } else if (selectedDate.getTime() === currentDates[1].getTime()) { // past  
      timeString = '12:00';
    } else { // current
      timeString = '16:00';
    }
    
    const dateString = selectedDate.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return `${dateString} ${timeString}`;
  }, [imageManagement.currentFloor, viewerState.selectedDate, getAvailableDates]);

  // Функция для получения максимального индекса изображения
  const getMaxImageIndex = useMemo(() => (floorId) => {
    return floorId === 1 ? 3 : 5;
  }, []);

  // Функция для получения начальной позиции камеры
  const getInitialCameraPosition = useMemo(() => (floorId, date, imageIndex) => {
    const defaultPosition = { yaw: 0, pitch: 0, fov: 75 };
    
    // Начальные позиции камеры для каждого изображения (ПРАВИЛЬНЫЕ КООРДИНАТЫ)
    const initialCameraPositions = {
      // Второй этаж
      2: {
        // 1 июля 2025 - past_past
        'Tue Jul 01 2025': {
          1: { yaw: 126.09, pitch: 3.72, fov: 75 },
          2: { yaw: 66.57, pitch: 3.97, fov: 75 },
          3: { yaw: 183.1, pitch: 4.19, fov: 75 },
          4: { yaw: 296.25, pitch: 0.27, fov: 75 },
          5: { yaw: 198.82, pitch: 4.19, fov: 75 }
        },
        // 12 июля 2025 - past
        'Sat Jul 12 2025': {
          1: { yaw: 58.65, pitch: 2.95, fov: 75 },
          2: { yaw: 93.77, pitch: 5.29, fov: 75 },
          3: { yaw: 345.4, pitch: 4.5, fov: 75 },
          4: { yaw: 54.67, pitch: 4.28, fov: 75 },
          5: { yaw: 276.43, pitch: 4.2, fov: 75 }
        },
        // 24 июля 2025 - current
        'Thu Jul 24 2025': {
          1: { yaw: 174.45, pitch: 6.07, fov: 75 },
          2: { yaw: 81.5, pitch: 3.65, fov: 75 },
          3: { yaw: 96.77, pitch: 4.26, fov: 75 },
          4: { yaw: 3.08, pitch: 1.66, fov: 75 },
          5: { yaw: 177.01, pitch: 4.18, fov: 75 }
        }
      },
      // Первый этаж
      1: {
        // 4 июля 2025 - past_past
        'Fri Jul 04 2025': {
          1: { yaw: 280.64, pitch: 7.55, fov: 75 },
          2: { yaw: 71.74, pitch: 5.23, fov: 75 },
          3: { yaw: 333.16, pitch: 2.95, fov: 75 }
        },
        // 12 июля 2025 - past
        'Sat Jul 12 2025': {
          1: { yaw: 138.16, pitch: 5.42, fov: 75 },
          2: { yaw: 87.63, pitch: 4.41, fov: 75 },
          3: { yaw: 270.62, pitch: 2.74, fov: 75 }
        },
        // 21 июля 2025 - current
        'Mon Jul 21 2025': {
          1: { yaw: 351.85, pitch: 2.48, fov: 75 },
          2: { yaw: 304.47, pitch: 2.89, fov: 75 },
          3: { yaw: 18.26, pitch: -0.2, fov: 75 }
        }
      }
    };
    
    // Логирование входных параметров

    
    const dateString = date ? date.toDateString() : null;
    const floorPositions = initialCameraPositions[floorId];
    
    if (!floorPositions) {
      console.warn(`❌ Позиции камеры для этажа ${floorId} не найдены, используем по умолчанию`);
      return defaultPosition;
    }
    
    const datePositions = dateString ? floorPositions[dateString] : null;
    if (!datePositions) {
      console.warn(`❌ Позиции камеры для даты ${dateString} на этаже ${floorId} не найдены, используем по умолчанию`);
      return defaultPosition;
    }
    
    const position = datePositions[imageIndex];
    if (!position) {
      console.warn(`❌ Позиция камеры для изображения ${imageIndex} на этаже ${floorId}, дата ${dateString} не найдена, используем по умолчанию`);
      return defaultPosition;
    }
    
    
    return position;
  }, []);

  // Проверка доступности даты
  const isDateAvailable = useMemo(() => (date) => {
    const floorId = imageManagement.currentFloor || 2;
    const currentDates = getAvailableDates(floorId);
    const available = currentDates.some(availableDate => 
      availableDate.getTime() === date.getTime()
    );
    console.log(`📅 isDateAvailable: дата ${date.toDateString()}, этаж ${floorId}, доступна: ${available}`);
    return available;
  }, [imageManagement.currentFloor, getAvailableDates]);

  // Функция для получения URL изображения OP на основе даты и индекса
  const getOPImageUrl = useMemo(() => (date = viewerState.selectedDate) => {
    const floorId = imageManagement.currentFloor || 2;
    const currentDates = getAvailableDates(floorId);
    
    // Выбираем правильный набор изображений в зависимости от этажа
    const opImages = floorId === 1 ? opImagesFloor1 : opImagesFloor2;
    

    
    // Определяем набор изображений на основе даты и этажа
    let imageSet;
    let period = 'current';
    
    if (date.getTime() === currentDates[0].getTime()) { // Самая ранняя дата - pastPast
      imageSet = opImages.pastPast;
      period = 'pastPast';
    } else if (date.getTime() === currentDates[1].getTime()) { // Средняя дата - past
      imageSet = opImages.past;
      period = 'past';
    } else { // Самая поздняя дата или любая другая - current
      imageSet = opImages.current;
      period = 'current';
    }
    
    // Для первого этажа максимальный индекс 3, для второго - 5
    const maxIndex = floorId === 1 ? 3 : 5;
    const imageIndex = imageManagement.currentOPImageIndex <= maxIndex ? imageManagement.currentOPImageIndex : 1;
    
    const imageUrl = imageSet[imageIndex] || DEFAULT_360_IMAGE;
    

    
    return imageUrl;
  }, [imageManagement.currentFloor, viewerState.selectedDate, imageManagement.currentOPImageIndex, getAvailableDates, opImagesFloor1, opImagesFloor2]);

  // Функция для получения URL изображения с явным указанием этажа и индекса
  const getOPImageUrlWithFloor = useMemo(() => (date = viewerState.selectedDate, floorId = imageManagement.currentFloor, imageIndex = imageManagement.currentOPImageIndex) => {
    const currentDates = getAvailableDates(floorId);
    
    // Выбираем правильный набор изображений в зависимости от этажа
    const opImages = floorId === 1 ? opImagesFloor1 : opImagesFloor2;
    
    console.log(`🖼️ getOPImageUrlWithFloor: этаж ${floorId}, дата ${date.toDateString()}, индекс ${imageIndex}, доступные даты:`, currentDates.map(d => d.toDateString()));
    
    // Определяем набор изображений на основе даты и этажа
    let imageSet;
    let period = 'current';
    
    if (date.getTime() === currentDates[0].getTime()) { // Самая ранняя дата - pastPast
      imageSet = opImages.pastPast;
      period = 'pastPast';
    } else if (date.getTime() === currentDates[1].getTime()) { // Средняя дата - past
      imageSet = opImages.past;
      period = 'past';
    } else { // Самая поздняя дата или любая другая - current
      imageSet = opImages.current;
      period = 'current';
    }
    
    // Для первого этажа максимальный индекс 3, для второго - 5
    const maxIndex = floorId === 1 ? 3 : 5;
    const validImageIndex = imageIndex <= maxIndex && imageIndex >= 1 ? imageIndex : 1;
    
    const imageUrl = imageSet[validImageIndex] || DEFAULT_360_IMAGE;
    
    console.log(`🖼️ getOPImageUrlWithFloor - период: ${period}, этаж: ${floorId}, индекс: ${validImageIndex}, URL: ${imageUrl}`);
    
    return imageUrl;
  }, [getAvailableDates, opImagesFloor1, opImagesFloor2, viewerState.selectedDate, imageManagement.currentFloor, imageManagement.currentOPImageIndex]);

  // Функция для получения URL изображения для левой панели
  const getLeftPanelImageUrl = useMemo(() => () => {
    return getOPImageUrl(splitScreenState.leftPanelDate);
  }, [getOPImageUrl, splitScreenState.leftPanelDate]);

  // Функция для получения URL изображения для правой панели  
  const getRightPanelImageUrl = useMemo(() => () => {
    return getOPImageUrl(splitScreenState.rightPanelDate);
  }, [getOPImageUrl, splitScreenState.rightPanelDate]);

  // Функция для получения начальной позиции камеры для левой панели
  const getLeftPanelInitialCamera = useMemo(() => () => {
    const floorId = imageManagement.currentFloor || 2;
    const params = {
      floorId, 
      leftPanelDate: splitScreenState.leftPanelDate, 
      imageIndex: imageManagement.currentOPImageIndex
    };
    console.log('🏗️ getLeftPanelInitialCamera params:', params);
    const result = getInitialCameraPosition(floorId, splitScreenState.leftPanelDate, imageManagement.currentOPImageIndex);
    console.log('🏗️ getLeftPanelInitialCamera result:', JSON.stringify(result, null, 2));
    return result;
  }, [imageManagement.currentFloor, splitScreenState.leftPanelDate, imageManagement.currentOPImageIndex, getInitialCameraPosition]);

  // Функция для получения начальной позиции камеры для правой панели
  const getRightPanelInitialCamera = useMemo(() => () => {
    const floorId = imageManagement.currentFloor || 2;
    const params = {
      floorId, 
      rightPanelDate: splitScreenState.rightPanelDate, 
      imageIndex: imageManagement.currentOPImageIndex
    };
    console.log('🏗️ getRightPanelInitialCamera params:', params);
    const result = getInitialCameraPosition(floorId, splitScreenState.rightPanelDate, imageManagement.currentOPImageIndex);
    console.log('🏗️ getRightPanelInitialCamera result:', JSON.stringify(result, null, 2));
    return result;
  }, [imageManagement.currentFloor, splitScreenState.rightPanelDate, imageManagement.currentOPImageIndex, getInitialCameraPosition]);

  // Функция для получения времени съемки для левой панели
  const getLeftPanelShootingTime = useMemo(() => () => {
    const floorId = imageManagement.currentFloor || 2;
    const currentDates = getAvailableDates(floorId);
    const selectedDate = splitScreenState.leftPanelDate;
    
    // Определяем время съемки на основе даты
    let timeString = 'Неизвестно';
    if (selectedDate.getTime() === currentDates[0].getTime()) { // past_past
      timeString = '08:00';
    } else if (selectedDate.getTime() === currentDates[1].getTime()) { // past  
      timeString = '12:00';
    } else { // current
      timeString = '16:00';
    }
    
    const dateString = selectedDate.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return `${dateString} ${timeString}`;
  }, [imageManagement.currentFloor, splitScreenState.leftPanelDate, getAvailableDates]);

  // Функция для получения времени съемки для правой панели
  const getRightPanelShootingTime = useMemo(() => () => {
    const floorId = imageManagement.currentFloor || 2;
    const currentDates = getAvailableDates(floorId);
    const selectedDate = splitScreenState.rightPanelDate;
    
    // Определяем время съемки на основе даты
    let timeString = 'Неизвестно';
    if (selectedDate.getTime() === currentDates[0].getTime()) { // past_past
      timeString = '08:00';
    } else if (selectedDate.getTime() === currentDates[1].getTime()) { // past  
      timeString = '12:00';
    } else { // current
      timeString = '16:00';
    }
    
    const dateString = selectedDate.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return `${dateString} ${timeString}`;
  }, [imageManagement.currentFloor, splitScreenState.rightPanelDate, getAvailableDates]);

  return {
    getAvailableDates,
    getShootingTime,
    getMaxImageIndex,
    getInitialCameraPosition,
    isDateAvailable,
    getOPImageUrl,
    getOPImageUrlWithFloor,
    getLeftPanelImageUrl,
    getRightPanelImageUrl,
    getLeftPanelInitialCamera,
    getRightPanelInitialCamera,
    getLeftPanelShootingTime,
    getRightPanelShootingTime
  };
};

export default useImageUtilities;