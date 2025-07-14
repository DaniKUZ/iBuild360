import React from 'react';
import PropTypes from 'prop-types';
import ImageViewer from '../components/ImageViewer';

function FloorEditModal({ 
  floor, 
  floorFormData, 
  onClose, 
  onSave, 
  onFormChange, 
  onImageChange,
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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content floor-edit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-header">
          <h3>Редактирование этажа</h3>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="floorName">Название этажа</label>
            <input
              type="text"
              id="floorName"
              name="name"
              value={floorFormData.name}
              onChange={onFormChange}
              placeholder="Введите название этажа"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="floorDescription">Описание</label>
            <textarea
              id="floorDescription"
              name="description"
              value={floorFormData.description}
              onChange={onFormChange}
              placeholder="Введите описание этажа"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="floorImage">Изображение этажа</label>
            <div className="image-upload-container">
              <div className="image-preview-container">
                <ImageViewer
                  image={floorFormData.image || floor.thumbnail}
                  alt="Текущее изображение"
                  zoom={zoom}
                  pan={pan}
                  isDragging={isDragging}
                  onWheel={onWheel}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onZoomIn={onZoomIn}
                  onZoomOut={onZoomOut}
                  onZoomReset={onZoomReset}
                  className="current-image"
                />
              </div>
              <input
                type="file"
                id="floorImage"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="floorImage" className="btn btn-secondary">
                <i className="fas fa-camera"></i>
                Выбрать изображение
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            className="btn btn-primary"
            onClick={onSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

FloorEditModal.propTypes = {
  floor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string.isRequired
  }).isRequired,
  floorFormData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onImageChange: PropTypes.func.isRequired,
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

export default FloorEditModal; 