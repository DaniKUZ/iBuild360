import { useCallback } from 'react';

const useNavigationHandlers = (
  viewerState,
  imageManagement,
  splitScreenState,
  imageUtilities,
  mainViewerRef = null,
  leftPanelViewerRef = null,
  rightPanelViewerRef = null
) => {
  // Обработчики дат
  const handleDateChange = useCallback((newDate) => {
    console.log(`📅 handleDateChange: Смена даты на ${newDate.toDateString()}`);
    viewerState.setSelectedDate(newDate);
  }, [viewerState]);

  const handleLeftPanelDateChange = useCallback((newDate) => {
    splitScreenState.setLeftPanelDate(newDate);
    splitScreenState.setLeftPanelImage(imageUtilities.getOPImageUrl(newDate));
  }, [splitScreenState, imageUtilities]);

  const handleRightPanelDateChange = useCallback((newDate) => {
    splitScreenState.setRightPanelDate(newDate);
    splitScreenState.setRightPanelImage(imageUtilities.getOPImageUrl(newDate));
  }, [splitScreenState, imageUtilities]);

  // Обработчики видео воспроизведения
  const handleVideoPlay = useCallback(() => {
    viewerState.setIsVideoPlaying(true);
  }, [viewerState]);

  const handleVideoPause = useCallback(() => {
    viewerState.setIsVideoPlaying(false);
  }, [viewerState]);

  // Обработчики навигации по изображениям
  const handleVideoFirstFrame = useCallback(() => {
    console.log(`🎬 First frame: переход к индексу 1`);
    imageManagement.setCurrentOPImageIndex(1);
    
    // Синхронно обновляем изображения в режиме разделения
    if (splitScreenState.isSplitScreenMode) {
      const floorId = viewerState.selectedScheme?.id || 2;
      const leftImageUrl = imageUtilities.getOPImageUrlWithFloor 
        ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.leftPanelDate, floorId, 1)
        : imageUtilities.getOPImageUrl(splitScreenState.leftPanelDate);
      const rightImageUrl = imageUtilities.getOPImageUrlWithFloor 
        ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.rightPanelDate, floorId, 1)
        : imageUtilities.getOPImageUrl(splitScreenState.rightPanelDate);
        
      splitScreenState.setLeftPanelImage(leftImageUrl);
      splitScreenState.setRightPanelImage(rightImageUrl);
      console.log(`🔄 Синхронно обновлены изображения для первого кадра`);
    }
  }, [imageManagement, splitScreenState, imageUtilities, viewerState]);

  const handleVideoPreviousFrame = useCallback(() => {
    console.log(`🎬 Previous frame handler вызван`);
    imageManagement.setCurrentOPImageIndex(prev => {
      const newIndex = Math.max(1, prev - 1);
      console.log(`🎬 Previous frame: ${prev} -> ${newIndex}`);
      
      // Синхронно обновляем изображения в режиме разделения с новым индексом
      if (splitScreenState.isSplitScreenMode) {
        // Используем функцию с явным указанием этажа и индекса
        const floorId = viewerState.selectedScheme?.id || 2;
        const leftImageUrl = imageUtilities.getOPImageUrlWithFloor 
          ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.leftPanelDate, floorId, newIndex)
          : imageUtilities.getOPImageUrl(splitScreenState.leftPanelDate);
        const rightImageUrl = imageUtilities.getOPImageUrlWithFloor 
          ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.rightPanelDate, floorId, newIndex)
          : imageUtilities.getOPImageUrl(splitScreenState.rightPanelDate);
          
        splitScreenState.setLeftPanelImage(leftImageUrl);
        splitScreenState.setRightPanelImage(rightImageUrl);
        console.log(`🔄 Синхронно обновлены изображения для кадра ${newIndex}`);
      }
      
      return newIndex;
    });
  }, [imageManagement, splitScreenState, imageUtilities, viewerState]);

  const handleVideoNextFrame = useCallback(() => {
    console.log(`🎬 Next frame handler вызван`);
    imageManagement.setCurrentOPImageIndex(prev => {
      const floorId = viewerState.selectedScheme?.id || 2;
      const maxIndex = imageUtilities.getMaxImageIndex(floorId);
      const newIndex = Math.min(maxIndex, prev + 1);
      console.log(`🎬 Next frame: ${prev} -> ${newIndex}`);
      
      // Синхронно обновляем изображения в режиме разделения с новым индексом
      if (splitScreenState.isSplitScreenMode) {
        // Используем функцию с явным указанием этажа и индекса
        const leftImageUrl = imageUtilities.getOPImageUrlWithFloor 
          ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.leftPanelDate, floorId, newIndex)
          : imageUtilities.getOPImageUrl(splitScreenState.leftPanelDate);
        const rightImageUrl = imageUtilities.getOPImageUrlWithFloor 
          ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.rightPanelDate, floorId, newIndex)
          : imageUtilities.getOPImageUrl(splitScreenState.rightPanelDate);
          
        splitScreenState.setLeftPanelImage(leftImageUrl);
        splitScreenState.setRightPanelImage(rightImageUrl);
        console.log(`🔄 Синхронно обновлены изображения для кадра ${newIndex}`);
      }
      
      return newIndex;
    });
  }, [imageManagement, splitScreenState, imageUtilities, viewerState]);

  const handleVideoLastFrame = useCallback(() => {
    const floorId = viewerState.selectedScheme?.id || 2;
    const maxIndex = imageUtilities.getMaxImageIndex(floorId);
    console.log(`🎬 Last frame: переход к индексу ${maxIndex} на этаже ${floorId}`);
    imageManagement.setCurrentOPImageIndex(maxIndex);
    
    // Синхронно обновляем изображения в режиме разделения с индексом последнего кадра
    if (splitScreenState.isSplitScreenMode) {
      const leftImageUrl = imageUtilities.getOPImageUrlWithFloor 
        ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.leftPanelDate, floorId, maxIndex)
        : imageUtilities.getOPImageUrl(splitScreenState.leftPanelDate);
      const rightImageUrl = imageUtilities.getOPImageUrlWithFloor 
        ? imageUtilities.getOPImageUrlWithFloor(splitScreenState.rightPanelDate, floorId, maxIndex)
        : imageUtilities.getOPImageUrl(splitScreenState.rightPanelDate);
        
      splitScreenState.setLeftPanelImage(leftImageUrl);
      splitScreenState.setRightPanelImage(rightImageUrl);
      console.log(`🔄 Синхронно обновлены изображения для последнего кадра ${maxIndex}`);
    }
  }, [imageManagement, splitScreenState, imageUtilities, viewerState]);

  const handleVideoTimeUpdate = useCallback((currentTime) => {
    // Обработчик обновления времени видео
    // Может использоваться для синхронизации UI с воспроизведением видео
    console.log('Video time updated:', currentTime);
  }, []);

  const handleImageNavigation = useCallback((direction) => {
    // Обработчик навигации по изображениям
    console.log('Image navigation:', direction);
    if (direction === 'next') {
      handleVideoNextFrame();
    } else if (direction === 'prev') {
      handleVideoPreviousFrame();
    }
  }, [handleVideoNextFrame, handleVideoPreviousFrame]);

  // Обработчики зума
  const handleZoomIn = useCallback(() => {
    console.log('🔍 handleZoomIn called, checking mode:', {
      isSplitScreen: splitScreenState.isSplitScreenMode,
      hasMainRef: !!mainViewerRef?.current?.zoomIn,
      hasLeftRef: !!leftPanelViewerRef?.current?.zoomIn,
      hasRightRef: !!rightPanelViewerRef?.current?.zoomIn
    });

    if (splitScreenState.isSplitScreenMode) {
      // В режиме split screen применяем зум к обеим панелям
      let zoomedPanels = 0;
      
      if (leftPanelViewerRef?.current?.zoomIn) {
        leftPanelViewerRef.current.zoomIn();
        zoomedPanels++;
        console.log('🔍 Zoom In executed on LEFT panel');
      }
      
      if (rightPanelViewerRef?.current?.zoomIn) {
        rightPanelViewerRef.current.zoomIn();
        zoomedPanels++;
        console.log('🔍 Zoom In executed on RIGHT panel');
      }
      
      if (zoomedPanels === 0) {
        console.log('❌ Zoom in: Split screen panel refs not available');
      }
    } else {
      // В обычном режиме используем главный viewer
      if (mainViewerRef?.current?.zoomIn) {
        mainViewerRef.current.zoomIn();
        console.log('🔍 Zoom In executed on MAIN viewer');
      } else {
        console.log('❌ Zoom in: Main PanoramaViewer ref not available');
      }
    }
  }, [mainViewerRef, leftPanelViewerRef, rightPanelViewerRef, splitScreenState.isSplitScreenMode]);

  const handleZoomOut = useCallback(() => {
    console.log('🔍 handleZoomOut called, checking mode:', {
      isSplitScreen: splitScreenState.isSplitScreenMode,
      hasMainRef: !!mainViewerRef?.current?.zoomOut,
      hasLeftRef: !!leftPanelViewerRef?.current?.zoomOut,
      hasRightRef: !!rightPanelViewerRef?.current?.zoomOut
    });

    if (splitScreenState.isSplitScreenMode) {
      // В режиме split screen применяем зум к обеим панелям
      let zoomedPanels = 0;
      
      if (leftPanelViewerRef?.current?.zoomOut) {
        leftPanelViewerRef.current.zoomOut();
        zoomedPanels++;
        console.log('🔍 Zoom Out executed on LEFT panel');
      }
      
      if (rightPanelViewerRef?.current?.zoomOut) {
        rightPanelViewerRef.current.zoomOut();
        zoomedPanels++;
        console.log('🔍 Zoom Out executed on RIGHT panel');
      }
      
      if (zoomedPanels === 0) {
        console.log('❌ Zoom out: Split screen panel refs not available');
      }
    } else {
      // В обычном режиме используем главный viewer
      if (mainViewerRef?.current?.zoomOut) {
        mainViewerRef.current.zoomOut();
        console.log('🔍 Zoom Out executed on MAIN viewer');
      } else {
        console.log('❌ Zoom out: Main PanoramaViewer ref not available');
      }
    }
  }, [mainViewerRef, leftPanelViewerRef, rightPanelViewerRef, splitScreenState.isSplitScreenMode]);

  // Обработчики режима разделения экрана
  const handleSplitScreen = useCallback(() => {
    splitScreenState.setIsSplitScreenMode(true);
    viewerState.setIsComparisonMode(false);
    
    // Устанавливаем изображения для панелей
    const floorId = viewerState.selectedScheme?.id || 2;
    const currentDate = viewerState.selectedDate;
    
    // Обе панели показывают одинаковую дату изначально
    splitScreenState.setLeftPanelImage(imageUtilities.getOPImageUrl(currentDate));
    splitScreenState.setRightPanelImage(imageUtilities.getOPImageUrl(currentDate));
    
    splitScreenState.setLeftPanelDate(currentDate);
    splitScreenState.setRightPanelDate(currentDate);
  }, [splitScreenState, viewerState, imageUtilities]);

  const handleCloseLeftPanel = useCallback(() => {
    if (splitScreenState.isSplitScreenMode) {
      // Если закрываем левую панель в режиме разделения, переходим в обычный режим
      splitScreenState.setIsSplitScreenMode(false);
      // Сохраняем дату правой панели как основную
      viewerState.setSelectedDate(splitScreenState.rightPanelDate);
    }
  }, [splitScreenState, viewerState]);

  const handleCloseRightPanel = useCallback(() => {
    console.log('❌ Закрытие правой панели');
    if (splitScreenState.isSplitScreenMode) {
      // Если закрываем правую панель в режиме разделения, переходим в обычный режим
      splitScreenState.setIsSplitScreenMode(false);
      // Сохраняем дату левой панели как основную
      viewerState.setSelectedDate(splitScreenState.leftPanelDate);
    }
  }, [splitScreenState, viewerState]);

  return {
    // Обработчики дат
    handleDateChange,
    handleLeftPanelDateChange,
    handleRightPanelDateChange,
    
    // Обработчики видео
    handleVideoPlay,
    handleVideoPause,
    handleVideoTimeUpdate,
    
    // Обработчики навигации по изображениям
    handleVideoFirstFrame,
    handleVideoPreviousFrame,
    handleVideoNextFrame,
    handleVideoLastFrame,
    handleImageNavigation,
    
    // Обработчики зума
    handleZoomIn,
    handleZoomOut,
    
    // Обработчики разделения экрана
    handleSplitScreen,
    handleCloseLeftPanel,
    handleCloseRightPanel
  };
};

export default useNavigationHandlers;