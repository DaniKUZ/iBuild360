import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from './components/PanoramaViewer/PanoramaViewer';
import SchemesView from './components/SchemesView';
import DateSelector from './components/DateSelector/DateSelector';
import VideoControls from './components/VideoControls/VideoControls';
import FilterControls from './components/FilterControls/FilterControls';
import TopToolbar from './components/TopToolbar';
import ViewerControlsSidebar from './components/ViewerControlsSidebar';
import usePanoramaSync from './components/PanoramaViewer/hooks/usePanoramaSync';
import { 
  mockPhotoArchive, 
  getAllRooms, 
  getRoomByPhotoId, 
  getComparisonPhotos 
} from '../../data/photoArchive';
import img360 from '../../data/img/img360.jpg';
import styles from './Viewer360Container.module.css';

const Viewer360Container = ({ project, onBack }) => {
  // Режимы просмотра: 'initial', 'archive', 'roomGroup', 'viewer', 'video360List', 'videoWalkthrough', 'generic360'
  const [viewMode, setViewMode] = useState('generic360');
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [comparisonPhoto, setComparisonPhoto] = useState(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [currentCamera, setCurrentCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSidebarSection, setCurrentSidebarSection] = useState('images'); // Текущий активный раздел
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isSchemeSearchVisible, setIsSchemeSearchVisible] = useState(false);
  const [isSchemeDropdownOpen, setIsSchemeDropdownOpen] = useState(false);
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState(1);
  const [minimapPosition, setMinimapPosition] = useState({ x: 0, y: 0 });
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  
  // Состояния для новых компонентов нижнего сайдбара
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shootingTime, setShootingTime] = useState('14:30'); // Время съемки
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Refs для вьюверов
  const mainViewerRef = useRef(null);
  const comparisonViewerRef = useRef(null);
  // Ref на корневой контейнер миникарты (включает кнопку выбора схемы и выпадающий список)
  const schemesMinimapRef = useRef(null);
  const minimapRef = useRef(null);
  const isDraggingMinimap = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Хук для синхронизации камер
  const sync = usePanoramaSync(mainViewerRef, comparisonViewerRef, isComparisonMode);

  // Ref для актуального значения isComparisonMode (избегаем проблем с замыканиями)
  const isComparisonModeRef = React.useRef(isComparisonMode);
  
  // Обновляем ref при изменении состояния режима сравнения
  React.useEffect(() => {
    isComparisonModeRef.current = isComparisonMode;
  }, [isComparisonMode]);

  // Устанавливаем первую схему по умолчанию
  React.useEffect(() => {
    if (project?.floors && project.floors.length > 0 && !selectedScheme) {
      setSelectedScheme(project.floors[0]);
    }
  }, [project, selectedScheme]);

  // Закрытие dropdown при клике вне его области
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (schemesMinimapRef.current && !schemesMinimapRef.current.contains(event.target)) {
        setIsSchemeDropdownOpen(false);
        setIsSchemeSearchVisible(false);
        setSchemeSearchQuery('');
      }
    };

    if (isSchemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSchemeDropdownOpen]);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Дом', action: onBack },
    { id: 'images', icon: 'fas fa-image', label: 'Изображение', isActive: true },
    { id: 'schemes', icon: 'fas fa-layer-group', label: 'Схемы' },
    { id: 'field-notes', icon: 'fas fa-sticky-note', label: 'Полевые заметки' },
    { id: 'timelapses', icon: 'fas fa-clock', label: 'Таймлапсы' },
    { id: 'drone-shots', icon: 'fas fa-helicopter', label: 'Съемка с дронов' },
    { id: 'separator-1', type: 'separator' },
    { id: 'capture', icon: 'fas fa-camera-retro', label: 'Захват' },
    { id: 'shared-folders', icon: 'fas fa-folder-open', label: 'Общие папки' },
    { id: 'field-notes-2', icon: 'fas fa-clipboard', label: 'Полевые заметки' },
    { id: 'separator-2', type: 'separator' },
    { id: 'participants', icon: 'fas fa-users', label: 'Участники' },
    { id: 'project-settings', icon: 'fas fa-cog', label: 'Настройки проекта' },
  ];

  // Навигационные точки для нижнего сайдбара
  const navigationPoints = [
    { id: 1, label: 'Главная комната', yaw: 0, pitch: 0 },
    { id: 2, label: 'Кухня', yaw: 90, pitch: -10 },
    { id: 3, label: 'Спальня', yaw: 180, pitch: 0 },
    { id: 4, label: 'Ванная', yaw: -90, pitch: 5 },
  ];

  // Функция для получения информации о комнате по фото
  const getPhotoRoomInfo = (photo) => {
    const roomData = getRoomByPhotoId(photo.id);
    return roomData ? roomData.roomData : null;
  };

  // Получение проанализированных видео из проекта
  const getAnalyzedVideos = () => {
    if (!project?.videos360) return [];
    return project.videos360.filter(video => 
      video.status === 'ready' && video.analysisStatus === 'analyzed'
    );
  };

  // Обработчики навигации - Фото архив
  const handleOpenArchive = () => {
    setViewMode('archive');
    setSelectedRoomKey(null);
    setSelectedPhoto(null);
    setSelectedVideo(null);
  };

  const handleSelectRoomGroup = (roomKey) => {
    setSelectedRoomKey(roomKey);
    setViewMode('roomGroup');
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhoto(photo);
    setViewMode('viewer');
  };

  const handleBackToArchive = () => {
    setViewMode('archive');
    setSelectedRoomKey(null);
  };

  const handleBackToRoomGroup = () => {
    setViewMode('roomGroup');
    setSelectedPhoto(null);
    setComparisonPhoto(null);
    setIsComparisonMode(false);
  };

  // Обработчики навигации - Видео 360
  const handleOpenVideo360List = () => {
    setViewMode('video360List');
    setSelectedVideo(null);
    setSelectedPhoto(null);
    setSelectedRoomKey(null);
    setCurrentFrameIndex(0);
  };

  const handleSelectVideo = (video) => {
    if (video.analysisStatus !== 'analyzed' || !video.extractedFrames.length) {
      alert('Видео не проанализировано или не содержит кадров');
      return;
    }
    setSelectedVideo(video);
    setCurrentFrameIndex(0);
    setViewMode('videoWalkthrough');
  };

  const handleBackToVideo360List = () => {
    setViewMode('video360List');
    setSelectedVideo(null);
    setCurrentFrameIndex(0);
  };

  const handleFrameNavigation = (frameIndex) => {
    if (selectedVideo && frameIndex >= 0 && frameIndex < selectedVideo.extractedFrames.length) {
      setCurrentFrameIndex(frameIndex);
    }
  };

  // Обработчики сравнения
  const handleComparisonToggle = () => {
    if (isComparisonMode) {
      setIsComparisonMode(false);
      setComparisonPhoto(null);
    } else {
      setShowComparisonSelector(true);
    }
  };

  const handleSelectComparisonPhoto = (photo) => {
    setComparisonPhoto(photo);
    setIsComparisonMode(true);
    setShowComparisonSelector(false);
  };

  // Закрытие фотографий
  const handleCloseMainImage = () => {
    if (isComparisonMode && comparisonPhoto) {
      setSelectedPhoto(comparisonPhoto);
      setComparisonPhoto(null);
      setIsComparisonMode(false);
    } else {
      handleBackToRoomGroup();
    }
  };

  const handleCloseComparisonImage = () => {
    setComparisonPhoto(null);
    setIsComparisonMode(false);
  };

  // Обработчик клика по пункту сайдбара
  const handleSidebarClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.id === 'images') {
      // Пункт "Изображение" - показываем 360° изображение
      setCurrentSidebarSection('images');
      setViewMode('generic360');
    } else if (item.id === 'schemes') {
      // Пункт "Схемы" - показываем панель просмотра схем
      setCurrentSidebarSection('schemes');
      setViewMode('schemes');
    } else if (item.type === 'separator') {
      // Разделители не кликабельны
      return;
    } else {
      // Все остальные пункты - показываем 360° изображение (заглушки)
      setCurrentSidebarSection(item.id);
      setViewMode('generic360');
    }
  };

  // Обработчик клика по навигационной точке
  const handleNavigationClick = (point) => {
    if (isComparisonMode) {
      sync.syncLookAt(point.yaw, point.pitch, null, 1000);
    } else if (mainViewerRef.current) {
      mainViewerRef.current.lookAt(point.yaw, point.pitch, null, 1000);
    }
  };

  // Обработчики для новых компонентов нижнего сайдбара
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    console.log('Date changed:', newDate);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    console.log('Video play');
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    console.log('Video pause');
  };

  const handleVideoFirstFrame = () => {
    console.log('Video first frame');
    // Логика для перехода к первому кадру
  };

  const handleVideoPreviousFrame = () => {
    console.log('Video previous frame');
    // Логика для перехода к предыдущему кадру
  };

  const handleVideoNextFrame = () => {
    console.log('Video next frame'); 
    // Логика для перехода к следующему кадру
  };

  const handleVideoLastFrame = () => {
    console.log('Video last frame');
    // Логика для перехода к последнему кадру
  };

  const handleFiltersClick = () => {
    console.log('Filters clicked');
    // Заглушка - переключаем состояние для демонстрации
    setHasActiveFilters(prev => !prev);
  };

  // Обработчики для верхнего тулбара
  const handleCreateFieldNote = () => {
    console.log('Создать полевую заметку - заглушка');
    // Здесь будет логика создания полевой заметки
  };

  const handleCreateVideo = () => {
    console.log('Создать покадровое видео - заглушка');
    // Здесь будет логика создания покадрового видео
  };

  const handleShare = () => {
    console.log('Поделиться - заглушка');
    // Здесь будет логика поделиться
  };

  const handleDownloadScreen = () => {
    console.log('Загрузить текущий экран - заглушка');
    // Здесь будет логика скачивания текущего экрана
  };

  const handleDownloadImage360 = () => {
    console.log('Загрузить изображение 360° - заглушка');
    // Здесь будет логика скачивания полного изображения 360°
  };

  // Обработчики для ViewerControlsSidebar
  const handleImageSettings = () => {
    console.log('Настроить изображение - заглушка');
    // Здесь будет логика настройки изображения
  };

  const handleSplitScreen = () => {
    console.log('Разделить экран - заглушка');
    // Здесь будет логика разделения экрана
  };

  const handleZoomIn = () => {
    if (mainViewerRef.current) {
      const currentFov = currentCamera.fov;
      const newFov = Math.max(30, currentFov - 5);
      const cameraData = { ...currentCamera, fov: newFov };
      setCurrentCamera(cameraData);
      
      // Применяем зум к основному вьюверу
      if (mainViewerRef.current.setCamera) {
        mainViewerRef.current.setCamera(currentCamera.yaw, currentCamera.pitch, newFov);
      }
      
      // Если включен режим сравнения, синхронизируем зум
      if (isComparisonMode && comparisonViewerRef.current) {
        if (comparisonViewerRef.current.setCamera) {
          comparisonViewerRef.current.setCamera(currentCamera.yaw, currentCamera.pitch, newFov);
        }
      }
    }
  };

  const handleZoomOut = () => {
    if (mainViewerRef.current) {
      const currentFov = currentCamera.fov;
      const newFov = Math.min(130, currentFov + 5);
      const cameraData = { ...currentCamera, fov: newFov };
      setCurrentCamera(cameraData);
      
      // Применяем зум к основному вьюверу
      if (mainViewerRef.current.setCamera) {
        mainViewerRef.current.setCamera(currentCamera.yaw, currentCamera.pitch, newFov);
      }
      
      // Если включен режим сравнения, синхронизируем зум
      if (isComparisonMode && comparisonViewerRef.current) {
        if (comparisonViewerRef.current.setCamera) {
          comparisonViewerRef.current.setCamera(currentCamera.yaw, currentCamera.pitch, newFov);
        }
      }
    }
  };

  // Обработчики для миникарты
  const handleMinimapToggle = () => {
    setIsMinimapExpanded(!isMinimapExpanded);
    // Всегда сбрасываем зум и позицию при переключении
    setMinimapZoom(1);
    setMinimapPosition({ x: 0, y: 0 });
    // Сбрасываем состояние перетаскивания
    isDraggingMinimap.current = false;
    setIsMinimapDragging(false);
  };



  const handleMinimapMouseDown = (event) => {
    if (event.button === 0 && isMinimapExpanded) { // Левая кнопка мыши и развернутый режим
      isDraggingMinimap.current = true;
      setIsMinimapDragging(true);
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMinimapMouseMove = (event) => {
    if (isDraggingMinimap.current && isMinimapExpanded) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;
      
      setMinimapPosition(prev => {
        // Более строгие ограничения для предотвращения выхода изображения за границы
        const container = minimapRef.current;
        if (!container) return prev;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Вычисляем максимальные смещения на основе зума и размеров контейнера
        const maxOffsetX = Math.max(0, (containerWidth * (minimapZoom - 1)) / 2);
        const maxOffsetY = Math.max(0, (containerHeight * (minimapZoom - 1)) / 2);
        
        const newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x + deltaX));
        const newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y + deltaY));
        
        return {
          x: newX,
          y: newY
        };
      });
      
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMinimapMouseUp = () => {
    isDraggingMinimap.current = false;
    setIsMinimapDragging(false);
  };

  // useEffect для обработки глобальных событий мыши для миникарты
  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleMinimapMouseMove(event);
    const handleGlobalMouseUp = () => handleMinimapMouseUp();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMinimapExpanded) {
        handleMinimapToggle();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMinimapExpanded, minimapZoom]);

  // useEffect для обработки wheel события на миникарте с { passive: false }
  useEffect(() => {
    const container = minimapRef.current;
    if (!container || !isMinimapExpanded) return;

    const handleWheelEvent = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.max(0.5, Math.min(3, minimapZoom + delta));
      setMinimapZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [isMinimapExpanded, minimapZoom]);

  // Обработчики изменения камеры
  const handleMainCameraChange = React.useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    setCurrentCamera(cameraData);
    if (currentIsComparisonMode) {
      sync.throttledSyncFromMain(cameraData);
    }
  }, [sync.throttledSyncFromMain]);

  const handleComparisonCameraChange = React.useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    setCurrentCamera(cameraData);
    if (currentIsComparisonMode) {
      sync.throttledSyncFromComparison(cameraData);
    }
  }, [sync.throttledSyncFromComparison]);

  // Определение активной кнопки сайдбара
  const isItemActive = (itemId) => {
    // Активной является кнопка текущего раздела
    return itemId === currentSidebarSection;
  };

  // Рендер архива фото (теперь по комнатам)
  const renderPhotoArchive = () => {
    const rooms = getAllRooms();
    
    return (
      <div className={styles.photoArchive}>
        <div className={styles.archiveHeader}>
          <h2>Архив фотографий 360°</h2>
          <p>Выберите комнату или локацию для просмотра</p>
        </div>
        <div className={styles.roomGroups}>
          {rooms.map((room) => (
            <div 
              key={room.roomKey} 
              className={styles.roomGroup}
              onClick={() => handleSelectRoomGroup(room.roomKey)}
            >
              <div className={styles.roomGroupHeader}>
                <span className={styles.roomTitle}>{room.name}</span>
                <span className={styles.photoCount}>{room.photos.length} фото</span>
              </div>
              <div className={styles.roomGroupPreview}>
                {room.photos.slice(0, 3).map((photo) => (
                  <div key={photo.id} className={styles.previewImage}>
                    <img src={photo.url} alt={photo.description} />
                    <div className={styles.previewPeriod}>{photo.period}</div>
                  </div>
                ))}
                {room.photos.length > 3 && (
                  <div className={styles.morePhotos}>
                    +{room.photos.length - 3}
                  </div>
                )}
              </div>
              <i className="fas fa-chevron-right"></i>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер фото из выбранной комнаты
  const renderRoomGroupPhotos = () => {
    const roomData = mockPhotoArchive[selectedRoomKey];
    if (!roomData) return null;

    return (
      <div className={styles.roomGroupPhotos}>
        <div className={styles.groupHeader}>
          <button className={styles.backButton} onClick={handleBackToArchive}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2>{roomData.name}</h2>
            <p>{roomData.photos.length} фотографий в разное время</p>
          </div>
        </div>
        <div className={styles.photosGrid}>
          {roomData.photos.map((photo) => (
            <div 
              key={photo.id} 
              className={styles.photoCard}
              onClick={() => handleSelectPhoto(photo)}
            >
              <div className={styles.photoImage}>
                <img src={photo.url} alt={photo.description} />
                <div className={styles.photoOverlay}>
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
              <div className={styles.photoInfo}>
                <h3>{photo.description}</h3>
                <div className={styles.photoMeta}>
                  <p className={styles.photoDate}>
                    <i className="fas fa-calendar"></i>
                    {photo.date}
                  </p>
                  <p className={styles.photoTime}>
                    <i className="fas fa-clock"></i>
                    {photo.time} ({photo.period})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер селектора сравнения (только фото из той же комнаты)
  const renderComparisonSelector = () => {
    const availablePhotos = getComparisonPhotos(selectedPhoto.id);
    const roomInfo = getPhotoRoomInfo(selectedPhoto);
    
    if (availablePhotos.length === 0) {
      return (
        <div className={styles.comparisonSelectorOverlay}>
          <div className={styles.comparisonSelectorModal}>
            <div className={styles.selectorHeader}>
              <h3>Сравнение недоступно</h3>
              <button 
                className={styles.closeSelectorBtn}
                onClick={() => setShowComparisonSelector(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.selectorContent}>
              <div className={styles.noPhotosMessage}>
                <i className="fas fa-info-circle"></i>
                <p>Для комнаты "{roomInfo?.name}" нет других фотографий в разное время для сравнения.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.comparisonSelectorOverlay}>
        <div className={styles.comparisonSelectorModal}>
          <div className={styles.selectorHeader}>
            <h3>{roomInfo?.name} в разное время</h3>
            <button 
              className={styles.closeSelectorBtn}
              onClick={() => setShowComparisonSelector(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={styles.selectorContent}>
            <div className={styles.selectorRoomGroup}>
              <h4>Выберите фото для сравнения:</h4>
              <div className={styles.selectorPhotosGrid}>
                {availablePhotos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={styles.selectorPhotoCard}
                    onClick={() => handleSelectComparisonPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.description} />
                    <div className={styles.selectorPhotoInfo}>
                      <span className={styles.photoDescription}>{photo.description}</span>
                      <div className={styles.photoMetaSmall}>
                        <small className={styles.photoDateSmall}>{photo.date}</small>
                        <small className={styles.photoPeriod}>{photo.period} • {photo.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Рендер 360° просмотрщика
  const renderViewer = () => {
    const roomInfo = getPhotoRoomInfo(selectedPhoto);
    
    return (
      <div className={`${styles.panoramaSection} ${isComparisonMode ? styles.comparisonMode : ''}`}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={handleCreateFieldNote}
          onCreateVideo={handleCreateVideo}
          onShare={handleShare}
          onDownloadScreen={handleDownloadScreen}
          onDownloadImage360={handleDownloadImage360}
        />

        {/* Основной просмотрщик */}
        <div className={styles.panoramaWrapper}>
          <PanoramaViewer
            ref={mainViewerRef}
            imageUrl={selectedPhoto.url}
            onCameraChange={handleMainCameraChange}
            className={styles.mainViewer}
          />
          
          {/* Информация о фото */}
          <div className={styles.panoramaPhotoInfo}>
            <div className={styles.photoTitle}>{roomInfo?.name}</div>
            <div className={styles.photoSubtitle}>{selectedPhoto.description}</div>
            <div className={styles.photoDate}>{selectedPhoto.date} • {selectedPhoto.time} ({selectedPhoto.period})</div>
          </div>
          
          {/* Кнопка закрытия */}
          <button 
            className={styles.closeViewerBtn}
            onClick={handleCloseMainImage}
            title={isComparisonMode ? "Закрыть это изображение" : "Закрыть просмотр"}
          >
            <i className="fas fa-times"></i>
          </button>
          
          {/* Новый нижний сайдбар с тремя мини-сайдбарами */}
          <div className={styles.bottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={isVideoPlaying}
                shootingTime={shootingTime}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onFirstFrame={handleVideoFirstFrame}
                onPreviousFrame={handleVideoPreviousFrame}
                onNextFrame={handleVideoNextFrame}
                onLastFrame={handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={handleFiltersClick}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={handleImageSettings}
            onSplitScreen={handleSplitScreen}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            currentZoom={currentCamera.fov}
          />
        </div>

        {/* Сравнительный просмотрщик */}
        {isComparisonMode && comparisonPhoto && (
          <div className={styles.panoramaWrapper}>
            <PanoramaViewer
              ref={comparisonViewerRef}
              imageUrl={comparisonPhoto.url}
              isComparison={true}
              onCameraChange={handleComparisonCameraChange}
              className={styles.comparisonViewer}
            />
            
            {/* Информация о сравнительном фото */}
            <div className={styles.panoramaPhotoInfo}>
              <div className={styles.photoTitle}>{roomInfo?.name}</div>
              <div className={styles.photoSubtitle}>{comparisonPhoto.description}</div>
              <div className={styles.photoDate}>{comparisonPhoto.date} • {comparisonPhoto.time} ({comparisonPhoto.period})</div>
            </div>
            
            {/* Кнопка закрытия сравнительного фото */}
            <button 
              className={styles.closeViewerBtn}
              onClick={handleCloseComparisonImage}
              title="Закрыть это изображение"
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* Сайдбар для сравнительного изображения */}
            <div className={`${styles.bottomSidebar} ${styles.comparisonSidebar}`}>
              <div className={styles.miniSidebar}>
                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              </div>
              
              <div className={styles.miniSidebar}>
                <VideoControls
                  isPlaying={isVideoPlaying}
                  shootingTime={shootingTime}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onFirstFrame={handleVideoFirstFrame}
                  onPreviousFrame={handleVideoPreviousFrame}
                  onNextFrame={handleVideoNextFrame}
                  onLastFrame={handleVideoLastFrame}
                />
              </div>
              
              <div className={styles.miniSidebar}>
                <FilterControls
                  onFiltersClick={handleFiltersClick}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            {/* Правый вертикальный сайдбар с кнопками управления для сравнительного изображения */}
            <ViewerControlsSidebar
              onImageSettings={handleImageSettings}
              onSplitScreen={handleSplitScreen}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              currentZoom={currentCamera.fov}
            />
          </div>
        )}
      </div>
    );
  };

  // Рендер миникарты со схемами
  const renderSchemesMinimap = () => {
    if (!project?.floors) return null;

    const filteredSchemes = project.floors.filter(floor => 
      floor.name.toLowerCase().includes(schemeSearchQuery.toLowerCase()) ||
      floor.description.toLowerCase().includes(schemeSearchQuery.toLowerCase())
    );

    const handleSchemeSelect = (scheme) => {
      setSelectedScheme(scheme);
      setIsSchemeDropdownOpen(false);
      setIsSchemeSearchVisible(false);
      setSchemeSearchQuery('');
      // Сбрасываем зум и позицию при смене схемы
      setMinimapZoom(1);
      setMinimapPosition({ x: 0, y: 0 });
    };

    const handleDropdownToggle = () => {
      setIsSchemeDropdownOpen(!isSchemeDropdownOpen);
      if (!isSchemeDropdownOpen) {
        setIsSchemeSearchVisible(true);
      } else {
        setIsSchemeSearchVisible(false);
        setSchemeSearchQuery('');
      }
    };

    return (
      <div
        ref={schemesMinimapRef}
        className={`${styles.schemesMinimap} ${isMinimapExpanded ? styles.expanded : ''}`}
      >
        {/* Заголовок с кнопками */}
        <div className={styles.minimapHeader}>
          <div className={styles.customSelect}>
            <button 
              className={`${styles.selectButton} ${isSchemeDropdownOpen ? styles.open : ''}`}
              onClick={handleDropdownToggle}
            >
              <span>{selectedScheme ? selectedScheme.name : 'Выберите схему'}</span>
              <i className={`fas fa-chevron-down ${isSchemeDropdownOpen ? styles.rotated : ''}`}></i>
            </button>
          </div>
          
          {/* Кнопка увеличения */}
          <button
            className={`${styles.minimapExpandButton} ${isMinimapExpanded ? styles.expanded : ''}`}
            onClick={handleMinimapToggle}
            title={isMinimapExpanded ? 'Свернуть карту' : 'Развернуть карту'}
          >
            <i className={`fas ${isMinimapExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
        
        {/* Dropdown */}
        {isSchemeDropdownOpen && (
            <div className={styles.dropdown}>
              {/* Поиск внутри dropdown */}
              {isSchemeSearchVisible && (
                <div className={styles.dropdownSearch}>
                  <div className={styles.searchInputWrapper}>
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Поиск схемы..."
                      value={schemeSearchQuery}
                      onChange={(e) => setSchemeSearchQuery(e.target.value)}
                      className={styles.searchInput}
                      autoFocus
                    />
                    {schemeSearchQuery && (
                      <button 
                        className={styles.clearSearchBtn}
                        onClick={() => setSchemeSearchQuery('')}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Список схем */}
              <div className={styles.dropdownList}>
                {filteredSchemes.length === 0 ? (
                  <div className={styles.noResults}>Схемы не найдены</div>
                ) : (
                  filteredSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      className={`${styles.dropdownItem} ${selectedScheme?.id === scheme.id ? styles.selected : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSchemeSelect(scheme);
                      }}
                    >
                      <div className={styles.schemePreview}>
                        <img src={scheme.thumbnail} alt={scheme.name} />
                      </div>
                      <div className={styles.schemeDetails}>
                        <div className={styles.schemeName}>{scheme.name}</div>
                        <div className={styles.schemeDesc}>{scheme.description}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
        )}
        
        {/* Сама миникарта */}
        {selectedScheme && (
          <div className={`${styles.minimapImage} ${isMinimapExpanded ? styles.expanded : ''}`}>
            {/* Панель управления зумом (только в развернутом состоянии - сверху) */}
            {isMinimapExpanded && (
              <div className={styles.minimapControls}>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => setMinimapZoom(prev => Math.min(3, prev + 0.1))}
                  title="Увеличить"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <span className={styles.zoomLevel}>
                  {Math.round(minimapZoom * 100)}%
                </span>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => setMinimapZoom(prev => Math.max(0.5, prev - 0.1))}
                  title="Уменьшить"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => {
                    setMinimapZoom(1);
                    setMinimapPosition({ x: 0, y: 0 });
                  }}
                  title="Сбросить"
                >
                  <i className="fas fa-expand-arrows-alt"></i>
                </button>
              </div>
            )}
            
            <div 
              className={styles.minimapZoomContainer}
              onMouseDown={isMinimapExpanded ? handleMinimapMouseDown : undefined}
              ref={minimapRef}
            >
              <img 
                key={selectedScheme.id}
                src={selectedScheme.fullImage || selectedScheme.thumbnail} 
                alt={selectedScheme.name}
                className={styles.schemeMap}
                style={isMinimapExpanded ? {
                  transform: `translate(${minimapPosition.x}px, ${minimapPosition.y}px) scale(${minimapZoom})`,
                  cursor: isMinimapDragging ? 'grabbing' : 'grab',
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%'
                } : {}}
                draggable={false}
              />
            </div>
          </div>
        )}
      </div>
    );
  };



  // Рендер 360° изображения для остальных разделов
  const renderGeneric360 = () => {
    return (
      <div className={styles.panoramaSection}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={handleCreateFieldNote}
          onCreateVideo={handleCreateVideo}
          onShare={handleShare}
          onDownloadScreen={handleDownloadScreen}
          onDownloadImage360={handleDownloadImage360}
        />

        <div className={styles.panoramaWrapper}>
          <PanoramaViewer
            ref={mainViewerRef}
            imageUrl={img360}
            onCameraChange={handleMainCameraChange}
            className={styles.mainViewer}
          />
          
          {/* Новый нижний сайдбар с тремя мини-сайдбарами */}
          <div className={styles.bottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={isVideoPlaying}
                shootingTime={shootingTime}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onFirstFrame={handleVideoFirstFrame}
                onPreviousFrame={handleVideoPreviousFrame}
                onNextFrame={handleVideoNextFrame}
                onLastFrame={handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={handleFiltersClick}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={handleImageSettings}
            onSplitScreen={handleSplitScreen}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            currentZoom={currentCamera.fov}
          />
        </div>
      </div>
    );
  };

  // Рендер панели схем
  const renderSchemes = () => {
    return (
      <SchemesView 
        project={project}
      />
    );
  };

  return (
    <div className={styles.viewer360}>
      {/* Левый сайдбар */}
      <div 
        className={`${styles.viewerSidebar} ${isExpanded ? styles.expanded : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {sidebarItems.map((item) => {
          // Рендер разделителя
          if (item.type === 'separator') {
            return (
              <div 
                key={item.id} 
                className={styles.divider}
              />
            );
          }
          
          // Рендер обычного элемента
          return (
            <button
              key={item.id}
              className={`${styles.sidebarItem} ${isItemActive(item.id) ? styles.active : ''}`}
              onClick={() => handleSidebarClick(item)}
              onMouseEnter={() => setHoveredSidebarItem(item.id)}
              onMouseLeave={() => setHoveredSidebarItem(null)}
              aria-label={item.label}
            >
              <i className={item.icon} aria-hidden="true"></i>
              {isExpanded && (
                <span className={styles.itemLabel}>{item.label}</span>
              )}
              {!isExpanded && hoveredSidebarItem === item.id && (
                <div className={styles.tooltip} role="tooltip">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Основная область */}
      <div className={styles.viewerMain}>
        {viewMode === 'viewer' && renderViewer()}
        {viewMode === 'generic360' && renderGeneric360()}
        {viewMode === 'schemes' && renderSchemes()}

        {/* Фон-оверлей для развернутой миникарты */}
        {isMinimapExpanded && (
          <div 
            className={styles.minimapOverlay}
            onClick={handleMinimapToggle}
          />
        )}

        {/* Миникарта со схемами */}
        {isMinimapVisible && viewMode !== 'schemes' && renderSchemesMinimap()}

        {/* Модальные окна */}
        {showComparisonSelector && renderComparisonSelector()}
      </div>
    </div>
  );
};

Viewer360Container.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    preview: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default Viewer360Container;