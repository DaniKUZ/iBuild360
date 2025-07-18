import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Video360Section({ 
  videos,
  dragActive, 
  uploadProgress, 
  onDragIn, 
  onDragOut, 
  onDrag, 
  onDrop, 
  onFileInput, 
  onRemoveVideo,
  onUpdateVideoName,
  formatFileSize 
}) {
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleEditName = (video) => {
    setEditingVideoId(video.id);
    setEditingName(video.name);
  };

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdateVideoName(editingVideoId, editingName.trim());
    }
    setEditingVideoId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
    setEditingName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return 'fas fa-spinner fa-spin';
      case 'ready':
        return 'fas fa-video';
      case 'error':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-video';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploading':
        return 'Загрузка...';
      case 'ready':
        return 'Готово';
      case 'error':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="video360-section">
      <div className="video360-header">
        <h3>
          <i className="fas fa-video"></i>
          Загрузка видео 360°
        </h3>
        <p className="video360-description">
          Загрузите видео 360° для вашего проекта. Поддерживаются форматы: .MP4, .MOV, .AVI
        </p>
      </div>

      <div className="video360-content">
        <div 
          className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={onDragIn}
          onDragLeave={onDragOut}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <div className="drag-drop-content">
            <i className="fas fa-video drag-drop-icon"></i>
            <h4>Перетащите видео 360° сюда</h4>
            <p>или нажмите кнопку ниже для выбора файлов</p>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={onFileInput}
              style={{ display: 'none' }}
              id="video360-file-input"
            />
            <label htmlFor="video360-file-input" className="btn btn-primary upload-btn">
              <i className="fas fa-upload"></i>
              Загрузить видео
            </label>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="uploaded-videos">
            <h4>Загруженные видео:</h4>
            <div className="videos-list">
              {videos.map(video => (
                <div key={video.id} className="video-item">
                  <div className="video-info">
                    <div className="video-icon">
                      <i className={getStatusIcon(video.status)}></i>
                    </div>
                    <div className="video-details">
                      <div className="video-name-section">
                        {editingVideoId === video.id ? (
                          <div className="name-edit-form">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={handleKeyPress}
                              onBlur={handleSaveName}
                              className="name-edit-input"
                              autoFocus
                              placeholder="Введите название видео"
                            />
                            <div className="name-edit-actions">
                              <button 
                                className="btn-save"
                                onClick={handleSaveName}
                                title="Сохранить"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={handleCancelEdit}
                                title="Отмена"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="video-name">
                            <h5 
                              onClick={() => handleEditName(video)}
                              className="editable-name"
                              title="Нажмите для редактирования"
                            >
                              {video.name}
                              <i className="fas fa-edit edit-icon"></i>
                            </h5>
                          </div>
                        )}
                      </div>
                      <p className="video-meta">
                        {formatFileSize(video.size)} • {video.uploadDate} • {getStatusText(video.status)}
                      </p>
                      <p className="video-filename">{video.fileName}</p>
                    </div>
                  </div>
                  
                  {uploadProgress[video.id] !== undefined && uploadProgress[video.id] < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadProgress[video.id]}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(uploadProgress[video.id])}%</span>
                    </div>
                  )}
                  
                  <button 
                    className="remove-video-btn"
                    onClick={() => onRemoveVideo(video.id)}
                    title="Удалить видео"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="video360-instructions">
          <h4>Рекомендации по видео 360°:</h4>
          <ul>
            <li>Поддерживаемые форматы: .MP4, .MOV, .AVI</li>
            <li>Рекомендуемое разрешение: 4K (3840×1920) или выше</li>
            <li>Максимальный размер файла: 2 GB</li>
            <li>Для каждого видео укажите понятное название</li>
            <li>Видео должно быть записано в формате 360° (эквирекциональная проекция)</li>
            <li>Рекомендуемая частота кадров: 30 fps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Video360Section.propTypes = {
  videos: PropTypes.array.isRequired,
  dragActive: PropTypes.bool.isRequired,
  uploadProgress: PropTypes.object.isRequired,
  onDragIn: PropTypes.func.isRequired,
  onDragOut: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileInput: PropTypes.func.isRequired,
  onRemoveVideo: PropTypes.func.isRequired,
  onUpdateVideoName: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired
};

export default Video360Section; 