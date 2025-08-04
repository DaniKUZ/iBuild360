import React from 'react';
import PropTypes from 'prop-types';
import styles from './ViewerControlsSidebar.module.css';

const ViewerControlsSidebar = ({ 
  onImageSettings, 
  onSplitScreen, 
  onZoomIn, 
  onZoomOut,
  currentZoom = 75,
  isCompact = false
}) => {
  const buttons = [
    {
      id: 'settings',
      icon: 'fas fa-cog',
      tooltip: 'Настроить изображение',
      onClick: onImageSettings,
      isStub: true
    },
    {
      id: 'split',
      icon: 'fas fa-columns',
      tooltip: 'Разделить экран',
      onClick: onSplitScreen,
      isStub: false
    },
    {
      id: 'zoom-in',
      icon: 'fas fa-search-plus',
      tooltip: 'Приблизить',
      onClick: onZoomIn,
      isStub: false
    },
    {
      id: 'zoom-out',
      icon: 'fas fa-search-minus',
      tooltip: 'Отдалить',
      onClick: onZoomOut,
      isStub: false
    }
  ];

  const handleButtonClick = (button) => {
    if (button.isStub) {
      console.log(`${button.tooltip} - заглушка`);
    }
    if (button.onClick) {
      button.onClick();
    }
  };

  return (
    <div className={styles.viewerControlsSidebar}>
      <div className={`${styles.controlsContainer} ${isCompact ? styles.compact : ''}`}>
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`${styles.controlButton} ${button.isStub ? styles.stubButton : ''} ${isCompact ? styles.compactButton : ''}`}
            onClick={() => handleButtonClick(button)}
            disabled={
              (button.id === 'zoom-out' && currentZoom >= 130) ||
              (button.id === 'zoom-in' && currentZoom <= 30)
            }
          >
            <i className={button.icon}></i>
            <div className={styles.tooltip}>
              {button.tooltip}
            </div>
          </button>
        ))}
      </div>
      
      {/* Индикатор зума */}
      <div className={`${styles.zoomIndicator} ${isCompact ? styles.compactZoom : ''}`}>
        <span className={`${styles.zoomValue} ${isCompact ? styles.compactZoomValue : ''}`}>{Math.round(currentZoom)}°</span>
        <span className={`${styles.zoomLabel} ${isCompact ? styles.compactZoomLabel : ''}`}>FOV</span>
      </div>
    </div>
  );
};

ViewerControlsSidebar.propTypes = {
  onImageSettings: PropTypes.func,
  onSplitScreen: PropTypes.func,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  currentZoom: PropTypes.number,
  isCompact: PropTypes.bool
};

export default ViewerControlsSidebar; 