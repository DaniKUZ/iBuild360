import React from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from '../PanoramaViewer/PanoramaViewer';
import DateSelector from '../DateSelector/DateSelector';
import VideoControls from '../VideoControls/VideoControls';
import FilterControls from '../FilterControls/FilterControls';
import ViewerControlsSidebar from '../ViewerControlsSidebar';
import styles from './SplitScreenViewer.module.css';

/**
 * Компонент для просмотра в режиме разделенного экрана
 * Показывает два PanoramaViewer рядом для сравнения изображений
 */
const SplitScreenViewer = ({
  // Изображения для панелей
  leftPanelImage,
  rightPanelImage,
  
  // Состояния камер для панелей
  leftPanelInitialCamera,
  rightPanelInitialCamera,
  onLeftPanelCameraChange,
  onRightPanelCameraChange,
  
  // Даты для подписей
  leftPanelDate,
  rightPanelDate,
  
  // Обработчики закрытия панелей
  onCloseLeftPanel,
  onCloseRightPanel,
  
  // Ссылки на компоненты
  leftPanelViewerRef,
  rightPanelViewerRef,
  
  // Дополнительные пропсы
  className,
  containerStyles,
  
  // Подписи панелей
  leftPanelLabel = "Левая панель",
  rightPanelLabel = "Правая панель",
  
  // Пропсы для элементов управления
  selectedDate,
  onDateChange,
  onLeftPanelDateChange,
  onRightPanelDateChange,
  availableDates,
  isDateAvailable,
  isVideoPlaying,
  shootingTime,
  onVideoTimeUpdate,
  onPlay,
  onPause,
  onFirstFrame,
  onPreviousFrame,
  onNextFrame,
  onLastFrame,
  hasActiveFilters,
  onFiltersClick,
  onImageSettings,
  onSplitScreen,
  onCompareImages,
  onZoomIn,
  onZoomOut,
}) => {

  
  return (
    <div className={`${styles.splitScreenContainer} ${className || ''}`}>
      {/* Левая панель */}
      <div className={styles.splitPanel}>
        {/* Кнопка закрытия левой панели */}
        {onCloseLeftPanel && (
          <button 
            className={styles.closeButton}
            onClick={onCloseLeftPanel}
            aria-label="Закрыть левую панель"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        
        <PanoramaViewer
          ref={leftPanelViewerRef}
          imageUrl={leftPanelImage}
          initialCamera={leftPanelInitialCamera}
          onCameraChange={onLeftPanelCameraChange}
          className={`${styles.leftPanorama} leftSplitPanel`}
          isFieldNoteMode={false}
          viewerId="LEFT"
        />
        
        {/* Сайдбары левой панели */}
        <div className={styles.panelSidebars}>
          <div className={styles.panelBottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={leftPanelDate}
                onDateChange={onLeftPanelDateChange || onDateChange}
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
          
          {/* Правый сайдбар для левой панели */}
          <div className={styles.panelRightSidebar}>
            <ViewerControlsSidebar
              onImageSettings={onImageSettings}
              onSplitScreen={onSplitScreen}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              currentZoom={leftPanelInitialCamera?.fov || 75}
            />
          </div>
        </div>
      </div>
      
      {/* Разделитель с кнопкой сравнения */}
      <div className={styles.splitDivider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerHandle}>
          <button 
            className={`${styles.compareButton} ${!leftPanelImage || !rightPanelImage || leftPanelDate?.getTime() === rightPanelDate?.getTime() ? styles.disabled : ''}`}
            onClick={() => onCompareImages?.(leftPanelImage, rightPanelImage, leftPanelDate, rightPanelDate)}
            disabled={!leftPanelImage || !rightPanelImage || leftPanelDate?.getTime() === rightPanelDate?.getTime()}
            title={leftPanelDate?.getTime() === rightPanelDate?.getTime() ? 
              "Нельзя сравнить одинаковые изображения" : 
              "Добавить в AI сравнение"
            }
          >
            <i className="fas fa-magic"></i>
            Сравнить
          </button>
        </div>
      </div>
      
      {/* Правая панель */}
      <div className={styles.splitPanel}>
        {/* Кнопка закрытия правой панели */}
        {onCloseRightPanel && (
          <button 
            className={styles.closeButton}
            onClick={onCloseRightPanel}
            aria-label="Закрыть правую панель"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        
        <PanoramaViewer
          ref={rightPanelViewerRef}
          imageUrl={rightPanelImage}
          initialCamera={rightPanelInitialCamera}
          onCameraChange={onRightPanelCameraChange}
          className={`${styles.rightPanorama} rightSplitPanel`}
          isFieldNoteMode={false}
          viewerId="RIGHT"
        />
        
        {/* Сайдбары правой панели */}
        <div className={styles.panelSidebars}>
          <div className={styles.panelBottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={rightPanelDate}
                onDateChange={onRightPanelDateChange || onDateChange}
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
          
          {/* Правый сайдбар для правой панели */}
          <div className={styles.panelRightSidebar}>
            <ViewerControlsSidebar
              onImageSettings={onImageSettings}
              onSplitScreen={onSplitScreen}
              onZoomIn={onZoomIn}
                             onZoomOut={onZoomOut}
               currentZoom={rightPanelInitialCamera?.fov || 75}
               isCompact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

SplitScreenViewer.propTypes = {
  // Изображения для панелей
  leftPanelImage: PropTypes.string.isRequired,
  rightPanelImage: PropTypes.string.isRequired,
  
  // Состояния камер для панелей
  leftPanelInitialCamera: PropTypes.object,
  rightPanelInitialCamera: PropTypes.object,
  onLeftPanelCameraChange: PropTypes.func.isRequired,
  onRightPanelCameraChange: PropTypes.func.isRequired,
  
  // Даты для подписей
  leftPanelDate: PropTypes.instanceOf(Date),
  rightPanelDate: PropTypes.instanceOf(Date),
  
  // Обработчики закрытия панелей
  onCloseLeftPanel: PropTypes.func,
  onCloseRightPanel: PropTypes.func,
  
  // Ссылки на компоненты
  leftPanelViewerRef: PropTypes.object,
  rightPanelViewerRef: PropTypes.object,
  
  // Дополнительные пропсы
  className: PropTypes.string,
  containerStyles: PropTypes.object,
  
  // Подписи панелей
  leftPanelLabel: PropTypes.string,
  rightPanelLabel: PropTypes.string,
  
  // Пропсы для элементов управления
  selectedDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
  onLeftPanelDateChange: PropTypes.func,
  onRightPanelDateChange: PropTypes.func,
  availableDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  isDateAvailable: PropTypes.func,
  isVideoPlaying: PropTypes.bool,
  shootingTime: PropTypes.string,
  onVideoTimeUpdate: PropTypes.func,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onFirstFrame: PropTypes.func,
  onPreviousFrame: PropTypes.func,
  onNextFrame: PropTypes.func,
  onLastFrame: PropTypes.func,
  hasActiveFilters: PropTypes.bool,
  onFiltersClick: PropTypes.func,
  onImageSettings: PropTypes.func,
  onSplitScreen: PropTypes.func,
  onCompareImages: PropTypes.func,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
};

export default SplitScreenViewer;