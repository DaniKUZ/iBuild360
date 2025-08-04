import { useState, useCallback, useRef } from 'react';

/**
 * Хук для управления общими обработчиками событий в Viewer360
 * 
 * @returns {Object} Объект с функциями обработчиков событий
 */
export const useEventHandlers = () => {
  // Состояния для навигации и взаимодействия
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Ссылки для отслеживания состояний
  const isSettingInitialPositionRef = useRef(false);

  // Обработчик навигации по точкам
  const handleNavigationClick = useCallback((point, mainViewerRef, setCurrentCamera) => {
    console.log('Навигация к точке:', point);
    if (point.camera && setCurrentCamera) {
      setCurrentCamera(point.camera);
    } else if (mainViewerRef.current) {
      mainViewerRef.current.lookAt(point.yaw, point.pitch, null, 1000);
    }
  }, []);

  // Обработчики воспроизведения видео
  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
    console.log('Запуск воспроизведения видео');
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
    console.log('Пауза воспроизведения видео');
  }, []);

  // Обработчики навигации по кадрам
  const handleVideoFirstFrame = useCallback((video360List) => {
    setCurrentFrameIndex(0);
    console.log('Переход к первому кадру');
  }, []);

  const handleVideoPreviousFrame = useCallback((video360List) => {
    setCurrentFrameIndex(prevIndex => {
      const newIndex = Math.max(0, prevIndex - 1);
      console.log(`Переход к предыдущему кадру: ${newIndex}`);
      return newIndex;
    });
  }, []);

  const handleVideoNextFrame = useCallback((video360List) => {
    setCurrentFrameIndex(prevIndex => {
      const maxIndex = (video360List?.length || 1) - 1;
      const newIndex = Math.min(maxIndex, prevIndex + 1);
      console.log(`Переход к следующему кадру: ${newIndex}`);
      return newIndex;
    });
  }, []);

  const handleVideoLastFrame = useCallback((video360List) => {
    const lastIndex = (video360List?.length || 1) - 1;
    setCurrentFrameIndex(lastIndex);
    console.log(`Переход к последнему кадру: ${lastIndex}`);
  }, []);

  // Обработчик обновления времени видео
  const handleVideoTimeUpdate = useCallback((currentTime) => {
    console.log('Обновление времени видео:', currentTime);
    // Здесь может быть логика синхронизации времени с кадрами
  }, []);

  // Обработчик навигации по изображениям
  const handleImageNavigation = useCallback((direction, imageManagement) => {
    if (direction === 'next') {
      imageManagement.nextImage();
    } else if (direction === 'prev') {
      imageManagement.previousImage();
    }
  }, []);

  // Обработчик поиска схем
  const handleSchemeSearch = useCallback((searchTerm, setSchemeSearchQuery) => {
    console.log('Поиск схем:', searchTerm);
    setSchemeSearchQuery(searchTerm);
  }, []);

  // Обработчики для модальных окон и секций
  const handleCreateVideo = useCallback((setIsTimelapsesSectionVisible) => {
    console.log('Создание видео - открываем секцию таймлапсов');
    setIsTimelapsesSectionVisible(true);
  }, []);

  const handleShare = useCallback(() => {
    console.log('Поделиться - заглушка');
    // Здесь будет логика расшаривания
  }, []);

  // Обработчики загрузки
  const handleDownloadScreen = useCallback(() => {
    console.log('Скачать скриншот - заглушка');
    // Здесь будет логика скачивания скриншота
  }, []);

  const handleDownloadImage360 = useCallback(() => {
    console.log('Скачать 360 изображение - заглушка');
    // Здесь будет логика скачивания 360 изображения
  }, []);

  // Обработчики загрузки файлов
  const handleDroneFilesUpload = useCallback((files) => {
    console.log('Загружены файлы с дрона:', files);
    // Здесь будет логика обработки загруженных файлов
  }, []);

  // Обработчик участников
  const handleAddParticipant = useCallback((participantData) => {
    console.log('Добавлен участник:', participantData);
    // Здесь будет логика добавления участника
  }, []);

  // Функции сохранения позиции камеры перенесены в основной компонент

  return {
    // Состояния
    isVideoPlaying,
    currentFrameIndex,
    
    // Сеттеры
    setIsVideoPlaying,
    setCurrentFrameIndex,
    
    // Ссылки
    isSettingInitialPositionRef,
    
    // Обработчики навигации
    handleNavigationClick,
    handleImageNavigation,
    
    // Обработчики видео
    handleVideoPlay,
    handleVideoPause,
    handleVideoFirstFrame,
    handleVideoPreviousFrame,
    handleVideoNextFrame,
    handleVideoLastFrame,
    handleVideoTimeUpdate,
    
    // Обработчики интерфейса
    handleSchemeSearch,
    handleCreateVideo,
    handleShare,
    handleDownloadScreen,
    handleDownloadImage360,
    handleDroneFilesUpload,
    handleAddParticipant
  };
};

export default useEventHandlers;