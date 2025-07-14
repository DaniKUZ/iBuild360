import React from 'react';
import PropTypes from 'prop-types';
import ImageViewer from '../components/ImageViewer';

function FloorAddModal({ 
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
          <h3>Добавление нового этажа</h3>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="newFloorName">Название этажа</label>
            <input
              type="text"
              id="newFloorName"
              name="name"
              value={floorFormData.name}
              onChange={onFormChange}
              placeholder="Введите название этажа"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newFloorDescription">Описание</label>
            <textarea
              id="newFloorDescription"
              name="description"
              value={floorFormData.description}
              onChange={onFormChange}
              placeholder="Введите описание этажа"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newFloorImage">Изображение этажа</label>
            <div className="image-upload-container">
              <div className="image-preview-container">
                <ImageViewer
                  image={floorFormData.image || require('../../../data/img/plug_img.jpeg')}
                  alt="Превью изображения"
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
                id="newFloorImage"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="newFloorImage" className="btn btn-secondary">
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
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

FloorAddModal.propTypes = {
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

export default FloorAddModal; 