import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function ImageViewer({ 
  image, 
  alt, 
  zoom, 
  pan, 
  isDragging, 
  onWheel, 
  onMouseDown, 
  onMouseMove, 
  onMouseUp, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset,
  showControls = true,
  className = '' 
}) {
  const zoomableRef = useRef(null);

  useEffect(() => {
    const zoomableElement = zoomableRef.current;
    if (zoomableElement && onWheel) {
      // Добавляем обработчик события wheel с passive: false
      zoomableElement.addEventListener('wheel', onWheel, { passive: false });
      
      return () => {
        zoomableElement.removeEventListener('wheel', onWheel);
      };
    }
  }, [onWheel]);

  return (
    <div className={`image-viewer ${className}`}>
      {showControls && (
        <div className="zoom-controls">
          <button 
            type="button"
            className="zoom-btn"
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button 
            type="button"
            className="zoom-btn"
            onClick={onZoomIn}
            disabled={zoom >= 3}
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            type="button"
            className="zoom-btn"
            onClick={onZoomReset}
          >
            <i className="fas fa-home"></i>
          </button>
        </div>
      )}
      
      <div 
        ref={zoomableRef}
        className="zoomable-image"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <img 
          src={image} 
          alt={alt}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: 'none'
          }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

ImageViewer.propTypes = {
  image: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  zoom: PropTypes.number.isRequired,
  pan: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  isDragging: PropTypes.bool.isRequired,
  onWheel: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseMove: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomReset: PropTypes.func.isRequired,
  showControls: PropTypes.bool,
  className: PropTypes.string
};

export default ImageViewer; 