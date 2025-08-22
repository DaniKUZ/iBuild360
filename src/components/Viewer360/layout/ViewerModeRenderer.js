import React from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from '../components/PanoramaViewer/PanoramaViewer';
import SchemesView from '../components/SchemesView';
import Generic360Viewer from '../components/Generic360Viewer';
import SplitScreenViewer from '../components/SplitScreenViewer';
import NetworkSchedule from '../../NetworkSchedule/NetworkSchedule';
import TechnicalSolutions from '../../TechnicalSolutions/TechnicalSolutions';

/**
 * Компонент для рендера различных режимов просмотра Viewer360
 */
const ViewerModeRenderer = ({
  viewMode,
  isSplitScreenMode,
  
  // Основные состояния
  selectedPhoto,
  selectedVideo,
  currentFrameIndex,
  selectedScheme,
  currentCamera,
  initialCamera,
  
  // Состояния изображений
  leftPanelImage,
  rightPanelImage,
  currentOPImageIndex,
  imageUrl,
  getCurrentImageUrl,
  getLeftPanelImageUrl,
  getRightPanelImageUrl,
  
  // Состояния камер для split-screen панелей
  leftPanelCamera,
  rightPanelCamera,
  
  // Состояния полевых заметок
  isFieldNoteMode,
  fieldNotes,
  onPanoramaClick,
  onFieldNoteClick,
  
  // Состояния UI
  selectedDate,
  isVideoPlaying,
  shootingTime,
  hasActiveFilters,
  isExpanded,
  currentSidebarSection,
  
  // Обработчики событий
  onCameraChange,
  onFrameChange,
  onVideoTimeUpdate,
  onImageNavigation,
  onSchemeSearch,
  onDateChange,
  onLeftPanelDateChange,
  onRightPanelDateChange,
  onFiltersClick,
  
  // Обработчики видео контролов
  onPlay,
  onPause,
  onFirstFrame,
  onPreviousFrame,
  onNextFrame,
  onLastFrame,
  
  // Обработчики split screen
  onLeftPanelCameraChange,
  onRightPanelCameraChange,
  onCloseLeftPanel,
  onCloseRightPanel,
  
  // Ссылки на компоненты
  mainViewerRef,
  leftPanelViewerRef,
  rightPanelViewerRef,
  
  // Даты для split screen
  leftPanelDate,
  rightPanelDate,
  
  // Классы стилей
  styles,
  
  // Дополнительные пропсы
  project,
  availableDates,
  isDateAvailable,
  
  // Обработчики для правого сайдбара
  onImageSettings,
  onSplitScreen,
  onCompareImages,
  onZoomIn,
  onZoomOut,
  
  // Обработчики для верхнего тулбара
  onCreateFieldNote,
  onCreateVideo,
  onShare,
  onDownloadScreen,
  onDownloadImage360,
}) => {
  
  // Рендер стандартного просмотра 360
  const renderGeneric360 = () => (
    <Generic360Viewer
      imageUrl={imageUrl}
      currentCamera={currentCamera}
      initialCamera={initialCamera}
      onCameraChange={onCameraChange}
      isFieldNoteMode={isFieldNoteMode}
      fieldNotes={fieldNotes}
      onPanoramaClick={onPanoramaClick}
      onFieldNoteClick={onFieldNoteClick}
      selectedDate={selectedDate}
      isVideoPlaying={isVideoPlaying}
      shootingTime={shootingTime}
      hasActiveFilters={hasActiveFilters}
      isExpanded={isExpanded}
      currentSidebarSection={currentSidebarSection}
      onDateChange={onDateChange}
      onVideoTimeUpdate={onVideoTimeUpdate}
      onImageNavigation={onImageNavigation}
      onFiltersClick={onFiltersClick}
      availableDates={availableDates}
      isDateAvailable={isDateAvailable}
      styles={styles}
      mainViewerRef={mainViewerRef}
      onPlay={onPlay}
      onPause={onPause}
      onFirstFrame={onFirstFrame}
      onPreviousFrame={onPreviousFrame}
      onNextFrame={onNextFrame}
      onLastFrame={onLastFrame}
      onImageSettings={onImageSettings}
      onSplitScreen={onSplitScreen}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onCreateFieldNote={onCreateFieldNote}
      onCreateVideo={onCreateVideo}
      onShare={onShare}
      onDownloadScreen={onDownloadScreen}
      onDownloadImage360={onDownloadImage360}
    />
  );
  
  // Рендер разделенного экрана
  const renderSplitScreen = () => (
    <SplitScreenViewer
      leftPanelImage={leftPanelImage}
      rightPanelImage={rightPanelImage}
      leftPanelInitialCamera={leftPanelCamera}
      rightPanelInitialCamera={rightPanelCamera}
      onLeftPanelCameraChange={onLeftPanelCameraChange}
      onRightPanelCameraChange={onRightPanelCameraChange}
      leftPanelDate={leftPanelDate}
      rightPanelDate={rightPanelDate}
      onCloseLeftPanel={onCloseLeftPanel}
      onCloseRightPanel={onCloseRightPanel}
      leftPanelViewerRef={leftPanelViewerRef}
      rightPanelViewerRef={rightPanelViewerRef}
      containerStyles={styles}
      leftPanelLabel="Текущее состояние"
      rightPanelLabel="Прошлое состояние"
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      onLeftPanelDateChange={onLeftPanelDateChange}
      onRightPanelDateChange={onRightPanelDateChange}
      availableDates={availableDates}
      isDateAvailable={isDateAvailable}
      isVideoPlaying={isVideoPlaying}
      shootingTime={shootingTime}
      onVideoTimeUpdate={onVideoTimeUpdate}
      onPlay={onPlay}
      onPause={onPause}
      onFirstFrame={onFirstFrame}
      onPreviousFrame={onPreviousFrame}
      onNextFrame={onNextFrame}
      onLastFrame={onLastFrame}
      hasActiveFilters={hasActiveFilters}
      onFiltersClick={onFiltersClick}
      onImageSettings={onImageSettings}
      onSplitScreen={onSplitScreen}
      onCompareImages={onCompareImages}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
    />
  );
  
  // Рендер просмотра видео/фото
  const renderViewer = () => {
    if (selectedVideo) {
      return (
        <div className={styles.videoContainer}>
          <video 
            className={styles.video}
            controls
            autoPlay
            onTimeUpdate={onVideoTimeUpdate}
          >
            <source src={selectedVideo.url} type="video/mp4" />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
          
          <div className={styles.videoInfo}>
            <h3>{selectedVideo.title}</h3>
            <p>Кадр {currentFrameIndex + 1}</p>
          </div>
        </div>
      );
    }
    
    if (selectedPhoto) {
      return (
        <div className={styles.photoContainer}>
          <img 
            src={selectedPhoto.url} 
            alt={selectedPhoto.title}
            className={styles.fullPhoto}
          />
          
          <div className={styles.photoInfo}>
            <h3>{selectedPhoto.title}</h3>
            <p>{selectedPhoto.description}</p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Рендер схем
  const renderSchemes = () => (
    <div className={styles.schemesContainer}>
      <SchemesView
        selectedScheme={selectedScheme}
        onSchemeSelect={onSchemeSearch}
        project={project}
        className={styles.schemesView}
      />
    </div>
  );
  
  // Рендер сетевого плана
  const renderNetworkSchedule = () => (
    <div className={styles.panoramaSection}>
      <div className={styles.panoramaWrapper} style={{ width: 'calc(100% - 380px)', marginLeft: '380px' }}>
        <NetworkSchedule activeSubItem="current-schedule" />
      </div>
    </div>
  );
  
  // Рендер технических решений
  const renderTechnicalSolutions = () => (
    <div className={styles.panoramaSection}>
      <div className={styles.panoramaWrapper} style={{ width: '100%', marginLeft: '60px', paddingRight: '60px' }}>
        <TechnicalSolutions activeSubItem="all-solutions" />
      </div>
    </div>
  );
  
  // Основной рендер на основе режима
  switch (viewMode) {
    case 'viewer':
      return renderViewer();
      
    case 'generic360':
      return isSplitScreenMode ? renderSplitScreen() : renderGeneric360();
      
    case 'schemes':
      return renderSchemes();
      
    case 'network-schedule':
      return renderNetworkSchedule();
      
    case 'technical-solutions':
      return renderTechnicalSolutions();
      
    default:
      return renderGeneric360();
  }
};

ViewerModeRenderer.propTypes = {
  viewMode: PropTypes.string.isRequired,
  isSplitScreenMode: PropTypes.bool.isRequired,
  
  // Основные состояния
  selectedPhoto: PropTypes.object,
  selectedVideo: PropTypes.object,
  currentFrameIndex: PropTypes.number.isRequired,
  selectedScheme: PropTypes.object,
  currentCamera: PropTypes.object.isRequired,
  
  // Состояния изображений
  leftPanelImage: PropTypes.string,
  rightPanelImage: PropTypes.string,
  currentOPImageIndex: PropTypes.number.isRequired,
  imageUrl: PropTypes.string.isRequired,
  getCurrentImageUrl: PropTypes.func.isRequired,
  getLeftPanelImageUrl: PropTypes.func.isRequired,
  getRightPanelImageUrl: PropTypes.func.isRequired,
  
  // Состояния камер для split-screen панелей
  leftPanelCamera: PropTypes.object,
  rightPanelCamera: PropTypes.object,
  
  // Состояния полевых заметок
  isFieldNoteMode: PropTypes.bool.isRequired,
  fieldNotes: PropTypes.array.isRequired,
  onPanoramaClick: PropTypes.func.isRequired,
  onFieldNoteClick: PropTypes.func.isRequired,
  
  // Состояния UI
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  isVideoPlaying: PropTypes.bool.isRequired,
  shootingTime: PropTypes.string.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  currentSidebarSection: PropTypes.string.isRequired,
  
  // Обработчики событий
  onCameraChange: PropTypes.func.isRequired,
  onFrameChange: PropTypes.func.isRequired,
  onVideoTimeUpdate: PropTypes.func.isRequired,
  onImageNavigation: PropTypes.func.isRequired,
  onSchemeSearch: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onLeftPanelDateChange: PropTypes.func,
  onRightPanelDateChange: PropTypes.func,
  onFiltersClick: PropTypes.func.isRequired,
  
  // Обработчики видео контролов
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onFirstFrame: PropTypes.func.isRequired,
  onPreviousFrame: PropTypes.func.isRequired,
  onNextFrame: PropTypes.func.isRequired,
  onLastFrame: PropTypes.func.isRequired,
  
  // Обработчики split screen
  onLeftPanelCameraChange: PropTypes.func,
  onRightPanelCameraChange: PropTypes.func,
  onCloseLeftPanel: PropTypes.func,
  onCloseRightPanel: PropTypes.func,
  
  // Ссылки на компоненты
  mainViewerRef: PropTypes.object,
  leftPanelViewerRef: PropTypes.object,
  rightPanelViewerRef: PropTypes.object,
  
  // Даты для split screen
  leftPanelDate: PropTypes.instanceOf(Date),
  rightPanelDate: PropTypes.instanceOf(Date),
  
  // Классы стилей
  styles: PropTypes.object.isRequired,
  
  // Дополнительные пропсы
  project: PropTypes.object,
  availableDates: PropTypes.array,
  isDateAvailable: PropTypes.func,
  
  // Обработчики для правого сайдбара
  onImageSettings: PropTypes.func,
  onSplitScreen: PropTypes.func,
  onCompareImages: PropTypes.func,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  
  // Обработчики для верхнего тулбара
  onCreateFieldNote: PropTypes.func,
  onCreateVideo: PropTypes.func,
  onShare: PropTypes.func,
  onDownloadScreen: PropTypes.func,
  onDownloadImage360: PropTypes.func,
  
  // Ref на PanoramaViewer
  mainViewerRef: PropTypes.object,
  
  // Доступные даты
  availableDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
};

export default ViewerModeRenderer;