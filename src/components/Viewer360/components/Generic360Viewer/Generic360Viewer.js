import React from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from '../PanoramaViewer/PanoramaViewer';
import DateSelector from '../DateSelector/DateSelector';
import VideoControls from '../VideoControls/VideoControls';
import FilterControls from '../FilterControls/FilterControls';
import FieldNoteMarkers from '../FieldNoteMarkers';
import ViewerControlsSidebar from '../ViewerControlsSidebar';
import TopToolbar from '../TopToolbar';

/**
 * Компонент для стандартного просмотра 360-градусных изображений
 * Включает основной PanoramaViewer с элементами управления и полевыми заметками
 */
const Generic360Viewer = ({
  // Изображение и камера
  imageUrl,
  currentCamera,
  initialCamera,
  onCameraChange,
  
  // Полевые заметки
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
  availableDates,
  isDateAvailable,
  
  // Обработчики событий
  onDateChange,
  onVideoTimeUpdate,
  onImageNavigation,
  onFiltersClick,
  
  // Дополнительные пропсы
  className,
  styles,
  mainViewerRef,
  
  // Обработчики для элементов управления
  onPlay,
  onPause,
  onFirstFrame,
  onPreviousFrame,
  onNextFrame,
  onLastFrame,
  
  // Обработчики для правого сайдбара
  onImageSettings,
  onSplitScreen,
  onZoomIn,
  onZoomOut,
  
  // Обработчики для верхнего тулбара
  onCreateFieldNote,
  onCreateVideo,
  onShare,
  onDownloadScreen,
  onDownloadImage360,
}) => {
  return (
    <div className={styles.panoramaSection}>
      {/* Верхний тулбар */}
      <TopToolbar
        onCreateFieldNote={onCreateFieldNote}
        onCreateVideo={onCreateVideo}
        onShare={onShare}
        onDownloadScreen={onDownloadScreen}
        onDownloadImage360={onDownloadImage360}
        isFieldNoteMode={isFieldNoteMode}
      />
      
      <div className={`${styles.panoramaWrapper} ${className || ''}`}>
      {/* Основной просмотрщик панорамы */}
      {(() => {
      
        return (
          <PanoramaViewer
            ref={mainViewerRef}
            imageUrl={imageUrl}
            initialCamera={initialCamera}
            onCameraChange={onCameraChange}
            onPanoramaClick={isFieldNoteMode ? onPanoramaClick : undefined}
            className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
            key={`generic360-${imageUrl}-${selectedDate?.getTime()}`}
            isFieldNoteMode={isFieldNoteMode}
          />
        );
      })()}
      
      {/* Маркеры полевых заметок */}
      <FieldNoteMarkers
        fieldNotes={fieldNotes}
        camera={currentCamera}
        onMarkerClick={onFieldNoteClick}
        containerRef={mainViewerRef}
        isFieldNoteMode={isFieldNoteMode}
      />
      
      {/* Нижний сайдбар с тремя мини-сайдбарами */}
      <div className={styles.bottomSidebar}>
        <div className={styles.miniSidebar}>
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            dropdownPosition="top"
            availableDates={availableDates || []}
            isDateAvailable={isDateAvailable}
          />
        </div>
        
        <div className={styles.miniSidebar}>
          <VideoControls
            isPlaying={isVideoPlaying}
            shootingTime={shootingTime}
            onTimeUpdate={onVideoTimeUpdate}
            onPlay={onPlay}
            onPause={onPause}
            onFirstFrame={onFirstFrame}
            onPreviousFrame={onPreviousFrame}
            onNextFrame={onNextFrame}
            onLastFrame={onLastFrame}
          />
        </div>
        
        <div className={styles.miniSidebar}>
          <FilterControls
            onFiltersClick={onFiltersClick}
            hasActiveFilters={hasActiveFilters}
            disabled={false}
          />
        </div>
      </div>
      
      {/* Правый вертикальный сайдбар с кнопками управления */}
      <ViewerControlsSidebar
        onImageSettings={onImageSettings}
        onSplitScreen={onSplitScreen}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        currentZoom={currentCamera.fov}
      />
      </div>
    </div>
  );
};

Generic360Viewer.propTypes = {
  // Изображение и камера
  imageUrl: PropTypes.string.isRequired,
  currentCamera: PropTypes.object.isRequired,
  onCameraChange: PropTypes.func.isRequired,
  
  // Полевые заметки
  isFieldNoteMode: PropTypes.bool.isRequired,
  fieldNotes: PropTypes.array.isRequired,
  onPanoramaClick: PropTypes.func,
  onFieldNoteClick: PropTypes.func.isRequired,
  
  // Состояния UI
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  isVideoPlaying: PropTypes.bool.isRequired,
  shootingTime: PropTypes.string.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  currentSidebarSection: PropTypes.string.isRequired,
  
  // Обработчики событий
  onDateChange: PropTypes.func.isRequired,
  onVideoTimeUpdate: PropTypes.func.isRequired,
  onImageNavigation: PropTypes.func.isRequired,
  onFiltersClick: PropTypes.func.isRequired,
  
  // Дополнительные пропсы
  className: PropTypes.string,
  styles: PropTypes.object.isRequired,
  mainViewerRef: PropTypes.object,
  availableDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  isDateAvailable: PropTypes.func,
  
  // Обработчики для элементов управления
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onFirstFrame: PropTypes.func.isRequired,
  onPreviousFrame: PropTypes.func.isRequired,
  onNextFrame: PropTypes.func.isRequired,
  onLastFrame: PropTypes.func.isRequired,
  
  // Обработчики для правого сайдбара
  onImageSettings: PropTypes.func,
  onSplitScreen: PropTypes.func,
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
};

export default Generic360Viewer;