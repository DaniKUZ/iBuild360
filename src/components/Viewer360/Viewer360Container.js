import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from './components/PanoramaViewer/PanoramaViewer';
import usePanoramaSync from './components/PanoramaViewer/hooks/usePanoramaSync';
import { mockPhotoArchive } from '../../data/photoArchive';
import styles from './Viewer360Container.module.css';

const Viewer360Container = ({ project, onBack }) => {
  // Режимы просмотра: 'initial', 'archive', 'dateGroup', 'viewer'
  const [viewMode, setViewMode] = useState('initial');
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
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

  // Функция для получения даты фото
  const getPhotoDate = (photo) => {
    for (const [dateKey, dateGroup] of Object.entries(mockPhotoArchive)) {
      const foundPhoto = dateGroup.photos.find(p => p.id === photo.id);
      if (foundPhoto) {
        return dateGroup.date;
      }
    }
    return '';
  };

  // Обработчики навигации
  const handleOpenArchive = () => {
    setViewMode('archive');
    setSelectedDateKey(null);
    setSelectedPhoto(null);
  };

  const handleSelectDateGroup = (dateKey) => {
    setSelectedDateKey(dateKey);
    setViewMode('dateGroup');
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhoto(photo);
    setViewMode('viewer');
  };

  const handleBackToArchive = () => {
    setViewMode('archive');
    setSelectedDateKey(null);
  };

  const handleBackToDateGroup = () => {
    setViewMode('dateGroup');
    setSelectedPhoto(null);
    setComparisonPhoto(null);
    setIsComparisonMode(false);
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
      handleBackToDateGroup();
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
        return viewMode === 'archive' || viewMode === 'dateGroup' || viewMode === 'viewer';
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

  // Рендер архива фото
  const renderPhotoArchive = () => (
    <div className={styles.photoArchive}>
      <div className={styles.archiveHeader}>
        <h2>Архив фотографий 360°</h2>
        <p>Выберите дату для просмотра фотографий</p>
      </div>
      <div className={styles.dateGroups}>
        {Object.entries(mockPhotoArchive).map(([dateKey, dateGroup]) => (
          <div 
            key={dateKey} 
            className={styles.dateGroup}
            onClick={() => handleSelectDateGroup(dateKey)}
          >
            <div className={styles.dateGroupHeader}>
              <i className="fas fa-calendar-day"></i>
              <span className={styles.dateTitle}>{dateGroup.date}</span>
              <span className={styles.photoCount}>{dateGroup.photos.length} фото</span>
            </div>
            <div className={styles.dateGroupPreview}>
              {dateGroup.photos.slice(0, 3).map((photo) => (
                <div key={photo.id} className={styles.previewImage}>
                  <img src={photo.url} alt={photo.name} />
                </div>
              ))}
              {dateGroup.photos.length > 3 && (
                <div className={styles.morePhotos}>
                  +{dateGroup.photos.length - 3}
                </div>
              )}
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        ))}
      </div>
    </div>
  );

  // Рендер фото из выбранной даты
  const renderDateGroupPhotos = () => {
    const dateGroup = mockPhotoArchive[selectedDateKey];
    if (!dateGroup) return null;

    return (
      <div className={styles.dateGroupPhotos}>
        <div className={styles.groupHeader}>
          <button className={styles.backButton} onClick={handleBackToArchive}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2>{dateGroup.date}</h2>
            <p>{dateGroup.photos.length} фотографий</p>
          </div>
        </div>
        <div className={styles.photosGrid}>
          {dateGroup.photos.map((photo) => (
            <div 
              key={photo.id} 
              className={styles.photoCard}
              onClick={() => handleSelectPhoto(photo)}
            >
              <div className={styles.photoImage}>
                <img src={photo.url} alt={photo.name} />
                <div className={styles.photoOverlay}>
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
              <div className={styles.photoInfo}>
                <h3>{photo.name}</h3>
                <p>{photo.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер селектора сравнения
  const renderComparisonSelector = () => (
    <div className={styles.comparisonSelectorOverlay}>
      <div className={styles.comparisonSelectorModal}>
        <div className={styles.selectorHeader}>
          <h3>Выберите фото для сравнения</h3>
          <button 
            className={styles.closeSelectorBtn}
            onClick={() => setShowComparisonSelector(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={styles.selectorContent}>
          {Object.entries(mockPhotoArchive).map(([dateKey, dateGroup]) => (
            <div key={dateKey} className={styles.selectorDateGroup}>
              <h4>{dateGroup.date}</h4>
              <div className={styles.selectorPhotosGrid}>
                {dateGroup.photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={`${styles.selectorPhotoCard} ${
                      selectedPhoto && photo.id === selectedPhoto.id ? styles.disabled : ''
                    }`}
                    onClick={() => selectedPhoto && photo.id !== selectedPhoto.id && handleSelectComparisonPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.name} />
                    <div className={styles.selectorPhotoInfo}>
                      <span>{photo.name}</span>
                      <small>{photo.time}</small>
                    </div>
                    {selectedPhoto && photo.id === selectedPhoto.id && (
                      <div className={styles.currentPhotoLabel}>Текущее фото</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Рендер 360° просмотрщика
  const renderViewer = () => (
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
          <div className={styles.photoTitle}>{selectedPhoto.name}</div>
          <div className={styles.photoDate}>{getPhotoDate(selectedPhoto)}</div>
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
          {!isComparisonMode && (
            <button 
              className={styles.comparisonBtn}
              onClick={handleComparisonToggle}
              title="Сравнить с другим фото"
            >
              <i className="fas fa-columns"></i>
              Сравнить
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
            <div className={styles.photoTitle}>{comparisonPhoto.name}</div>
            <div className={styles.photoDate}>{getPhotoDate(comparisonPhoto)}</div>
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
        {viewMode === 'dateGroup' && renderDateGroupPhotos()}
        {viewMode === 'viewer' && renderViewer()}

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