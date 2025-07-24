import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from './components/PanoramaViewer/PanoramaViewer';
import usePanoramaSync from './components/PanoramaViewer/hooks/usePanoramaSync';
import { 
  mockPhotoArchive, 
  getAllRooms, 
  getRoomByPhotoId, 
  getComparisonPhotos 
} from '../../data/photoArchive';
import styles from './Viewer360Container.module.css';

const Viewer360Container = ({ project, onBack }) => {
  // Режимы просмотра: 'initial', 'archive', 'roomGroup', 'viewer', 'video360List', 'videoWalkthrough'
  const [viewMode, setViewMode] = useState('initial');
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [comparisonPhoto, setComparisonPhoto] = useState(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [currentCamera, setCurrentCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });

  // Refs для вьюверов
  const mainViewerRef = useRef(null);
  const comparisonViewerRef = useRef(null);

  // Хук для синхронизации камер
  const sync = usePanoramaSync(mainViewerRef, comparisonViewerRef, isComparisonMode);

  // Ref для актуального значения isComparisonMode (избегаем проблем с замыканиями)
  const isComparisonModeRef = React.useRef(isComparisonMode);
  
  // Обновляем ref при изменении состояния режима сравнения
  React.useEffect(() => {
    isComparisonModeRef.current = isComparisonMode;
  }, [isComparisonMode]);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Главная', action: onBack },
    { id: 'archive', icon: 'fas fa-archive', label: 'Архив фото' },
    { id: 'layers', icon: 'fas fa-layer-group', label: 'Слои' },
    { id: 'video360', icon: 'fas fa-video', label: 'Видео 360°' },
    { id: 'schedule', icon: 'fas fa-calendar-alt', label: 'План-график' },
    { id: 'measure', icon: 'fas fa-ruler', label: 'Измерения' },
    { id: 'comments', icon: 'fas fa-comments', label: 'Комментарии' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Настройки' },
    { id: 'fullscreen', icon: 'fas fa-expand', label: 'Полный экран' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Помощь' },
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
    } else if (item.id === 'archive') {
      handleOpenArchive();
    } else if (item.id === 'video360') {
      handleOpenVideo360List();
    } else if (item.id === 'fullscreen') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
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
    switch (itemId) {
      case 'home':
        return viewMode === 'initial';
      case 'archive':
        return viewMode === 'archive' || viewMode === 'roomGroup' || viewMode === 'viewer';
      case 'video360':
        return viewMode === 'video360List' || viewMode === 'videoWalkthrough';
      default:
        return false;
    }
  };

  // Рендер начального экрана
  const renderInitialScreen = () => (
    <div className={styles.initialScreen}>
      <div className={styles.initialContent}>
        <div className={styles.initialIcon}>
          <i className="fas fa-cube"></i>
        </div>
        <h2>Режим просмотра 360°</h2>
        <p>Для начала работы откройте архив фотографий через боковую панель</p>
        <button 
          className={styles.openArchiveBtn}
          onClick={handleOpenArchive}
        >
          <i className="fas fa-archive"></i>
          Открыть архив фото
        </button>
      </div>
    </div>
  );

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
          
          {/* Нижний сайдбар */}
          <div className={styles.bottomSidebar}>
            <div className={styles.sidebarLeft}>
              <div className={styles.rotationIndicator}>
                <span>{Math.round(((currentCamera.yaw % 360) + 360) % 360)}°</span>
              </div>
              <div className={styles.navigationPoints}>
                {navigationPoints.map((point) => (
                  <button
                    key={point.id}
                    className={styles.navPoint}
                    onClick={() => handleNavigationClick(point)}
                    title={point.label}
                  >
                    <span>{point.id}</span>
                  </button>
                ))}
              </div>
            </div>
            {!isComparisonMode && getComparisonPhotos(selectedPhoto.id).length > 0 && (
              <button 
                className={styles.comparisonBtn}
                onClick={handleComparisonToggle}
                title="Сравнить с этой же комнатой в другое время"
              >
                <i className="fas fa-columns"></i>
                Сравнить время
              </button>
            )}
          </div>
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
              <div className={styles.sidebarLeft}>
                <div className={styles.rotationIndicator}>
                  <span>{Math.round(((currentCamera.yaw % 360) + 360) % 360)}°</span>
                </div>
                <div className={styles.navigationPoints}>
                  {navigationPoints.map((point) => (
                    <button
                      key={`comp-${point.id}`}
                      className={styles.navPoint}
                      onClick={() => handleNavigationClick(point)}
                      title={point.label}
                    >
                      <span>{point.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Рендер списка видео 360°
  const renderVideo360List = () => {
    const analyzedVideos = getAnalyzedVideos();
    
    return (
      <div className={styles.video360List}>
        <div className={styles.video360Header}>
          <h2>Видео 360° маршруты</h2>
          <p>Выберите проанализированное видео для навигации по маршруту</p>
        </div>
        
        {analyzedVideos.length === 0 ? (
          <div className={styles.emptyVideoState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-video"></i>
            </div>
            <h3>Нет проанализированных видео</h3>
            <p>Загрузите и проанализируйте видео 360° в редакторе проекта, чтобы создать интерактивные маршруты</p>
            <button 
              className={styles.goToEditorBtn}
              onClick={onBack}
            >
              <i className="fas fa-arrow-left"></i>
              Перейти к редактору
            </button>
          </div>
        ) : (
          <div className={styles.videosGrid}>
            {analyzedVideos.map((video) => (
              <div 
                key={video.id} 
                className={styles.videoCard}
                onClick={() => handleSelectVideo(video)}
              >
                <div className={styles.videoCardThumbnail}>
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.name} />
                  ) : (
                    <div className={styles.videoPlaceholder}>
                      <i className="fas fa-video"></i>
                    </div>
                  )}
                  <div className={styles.videoCardOverlay}>
                    <i className="fas fa-play-circle"></i>
                  </div>
                </div>
                <div className={styles.videoCardInfo}>
                  <h3>{video.name}</h3>
                  <div className={styles.videoCardMeta}>
                    <p className={styles.videoDate}>
                      <i className="fas fa-calendar"></i>
                      {video.shootingDate || 'Дата не указана'}
                    </p>
                    <p className={styles.videoFrames}>
                      <i className="fas fa-images"></i>
                      {video.extractedFrames?.length || 0} кадров
                    </p>
                  </div>
                  <div className={styles.videoRouteType}>
                    <i className={`fas ${video.walkthrough?.hasGPS ? 'fa-map-marker-alt' : 'fa-clock'}`}></i>
                    {video.walkthrough?.hasGPS ? 'GPS маршрут' : 'Временной маршрут'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Рендер прохождения по видео маршруту
  const renderVideoWalkthrough = () => {
    if (!selectedVideo || !selectedVideo.extractedFrames.length) {
      return (
        <div className={styles.errorState}>
          <h3>Ошибка загрузки видео</h3>
          <button onClick={handleBackToVideo360List}>Вернуться к списку</button>
        </div>
      );
    }

    const currentFrame = selectedVideo.extractedFrames[currentFrameIndex];
    const totalFrames = selectedVideo.extractedFrames.length;
    const progress = ((currentFrameIndex + 1) / totalFrames) * 100;

    return (
      <div className={styles.videoWalkthrough}>
        {/* Кнопка возврата */}
        <button 
          className={styles.backToListBtn}
          onClick={handleBackToVideo360List}
          title="Вернуться к списку видео"
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        {/* Информация о видео */}
        <div className={styles.videoWalkthroughInfo}>
          <div className={styles.videoTitle}>{selectedVideo.name}</div>
          <div className={styles.videoSubtitle}>
            {selectedVideo.shootingDate && `Съемка: ${selectedVideo.shootingDate} • `}
            Кадр {currentFrameIndex + 1} из {totalFrames}
          </div>
        </div>

        {/* Просмотрщик текущего кадра */}
        <div className={styles.frameViewer}>
          {currentFrame.imageUrl ? (
            <PanoramaViewer
              ref={mainViewerRef}
              imageUrl={currentFrame.imageUrl}
              onCameraChange={handleMainCameraChange}
              className={styles.walkthroughViewer}
            />
          ) : (
            <div className={styles.framePlaceholder}>
              <i className="fas fa-image"></i>
              <p>Кадр не загружен</p>
            </div>
          )}
        </div>

        {/* Временная навигация */}
        <div className={styles.timelineNavigation}>
          <div className={styles.timelineHeader}>
            <span className={styles.timelineTitle}>Навигация по маршруту</span>
            <span className={styles.timelineProgress}>{Math.round(progress)}%</span>
          </div>
          
          <div className={styles.timelineControls}>
            <button 
              className={styles.timelineBtn}
              onClick={() => handleFrameNavigation(0)}
              disabled={currentFrameIndex === 0}
              title="К началу"
            >
              <i className="fas fa-fast-backward"></i>
            </button>
            <button 
              className={styles.timelineBtn}
              onClick={() => handleFrameNavigation(currentFrameIndex - 1)}
              disabled={currentFrameIndex === 0}
              title="Предыдущий кадр"
            >
              <i className="fas fa-step-backward"></i>
            </button>
            <button 
              className={styles.timelineBtn}
              onClick={() => handleFrameNavigation(currentFrameIndex + 1)}
              disabled={currentFrameIndex === totalFrames - 1}
              title="Следующий кадр"
            >
              <i className="fas fa-step-forward"></i>
            </button>
            <button 
              className={styles.timelineBtn}
              onClick={() => handleFrameNavigation(totalFrames - 1)}
              disabled={currentFrameIndex === totalFrames - 1}
              title="К концу"
            >
              <i className="fas fa-fast-forward"></i>
            </button>
          </div>

          <div className={styles.timelineSlider}>
            <input
              type="range"
              min="0"
              max={totalFrames - 1}
              value={currentFrameIndex}
              onChange={(e) => handleFrameNavigation(parseInt(e.target.value))}
              className={styles.timelineSliderInput}
            />
            <div className={styles.timelineTrack}>
              <div 
                className={styles.timelineProgress}
                style={{ width: `${progress}%` }}
              />
              {selectedVideo.extractedFrames.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.timelinePoint} ${index === currentFrameIndex ? styles.active : ''}`}
                  onClick={() => handleFrameNavigation(index)}
                  style={{ left: `${(index / (totalFrames - 1)) * 100}%` }}
                  title={`Кадр ${index + 1} (${Math.round(index * 2)}с)`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Мини-карта */}
        <div className={styles.miniMap}>
          <div className={styles.miniMapHeader}>
            <span className={styles.miniMapTitle}>Маршрут</span>
            <span className={styles.miniMapType}>
              {selectedVideo.walkthrough?.hasGPS ? 'GPS' : 'Временной'}
            </span>
          </div>
          <div className={styles.miniMapContent}>
            {selectedVideo.walkthrough?.hasGPS ? (
              <div className={styles.gpsMap}>
                {/* TODO: Интеграция с картами */}
                <p>GPS карта будет здесь</p>
              </div>
            ) : (
              <div className={styles.linearMap}>
                <div className={styles.linearMapTrack}>
                  <div 
                    className={styles.linearMapProgress}
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className={styles.linearMapMarker}
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <div className={styles.linearMapLabels}>
                  <span>Начало</span>
                  <span>Конец</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.viewer360}>
      {/* Левый сайдбар */}
      <div className={styles.viewerSidebar}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${isItemActive(item.id) ? styles.active : ''}`}
            onClick={() => handleSidebarClick(item)}
            onMouseEnter={() => setHoveredSidebarItem(item.id)}
            onMouseLeave={() => setHoveredSidebarItem(null)}
            aria-label={item.label}
          >
            <i className={item.icon} aria-hidden="true"></i>
            {hoveredSidebarItem === item.id && (
              <div className={styles.tooltip} role="tooltip">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Основная область */}
      <div className={styles.viewerMain}>
        {viewMode === 'initial' && renderInitialScreen()}
        {viewMode === 'archive' && renderPhotoArchive()}
        {viewMode === 'roomGroup' && renderRoomGroupPhotos()}
        {viewMode === 'viewer' && renderViewer()}
        {viewMode === 'video360List' && renderVideo360List()}
        {viewMode === 'videoWalkthrough' && renderVideoWalkthrough()}

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