import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ImageViewer from '../components/ImageViewer';

function FloorModal({ 
  floor, 
  onClose, 
  zoom, 
  pan, 
  isDragging, 
  onWheel, 
  onMouseDown, 
  onMouseMove, 
  onMouseUp, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset 
}) {
  const zoomableRef = useRef(null);
  const modalImageRef = useRef(null);

  useEffect(() => {
    const zoomableElement = zoomableRef.current;
    const modalImageElement = modalImageRef.current;
    
    if (zoomableElement && onWheel) {
      // Добавляем обработчик события wheel с passive: false
      zoomableElement.addEventListener('wheel', onWheel, { passive: false });
      
      return () => {
        zoomableElement.removeEventListener('wheel', onWheel);
      };
    }
    
    if (modalImageElement && onWheel) {
      // Добавляем обработчик события wheel с passive: false
      modalImageElement.addEventListener('wheel', onWheel, { passive: false });
      
      return () => {
        modalImageElement.removeEventListener('wheel', onWheel);
      };
    }
  }, [onWheel]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-preview" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-header">
          <h3>{floor.name}</h3>
          <p>{floor.description}</p>
        </div>
        
        <div className="preview-zoom-controls">
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
        
        <div ref={modalImageRef} className="modal-image">
          <div 
            ref={zoomableRef}
            className="zoomable-preview-image"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img 
              src={floor.fullImage} 
              alt={floor.name}
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
      </div>
    </div>
  );
}

FloorModal.propTypes = {
  floor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    fullImage: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
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
  onZoomReset: PropTypes.func.isRequired
};

export default FloorModal; 