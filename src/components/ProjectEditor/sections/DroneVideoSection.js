import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

function DroneVideoSection({ 
  videos = [],
  dragActive = false,
  uploadProgress = {},
  onDragIn,
  onDragOut,
  onDrag,
  onDrop,
  onFileInput,
  onRemoveVideo,
  onUpdateVideoName,
  onUpdateVideoDate,
  onUpdateVideoDescription,
  formatFileSize
}) {
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    description: ''
  });
  const fileInputRef = useRef(null);

  const handleEditClick = (video) => {
    setEditingVideo(video.id);
    setEditForm({
      name: video.name || '',
      date: video.date || '',
      description: video.description || ''
    });
  };

  const handleSaveEdit = (videoId) => {
    onUpdateVideoName(videoId, editForm.name);
    onUpdateVideoDate(videoId, editForm.date);
    onUpdateVideoDescription(videoId, editForm.description);
    setEditingVideo(null);
    setEditForm({ name: '', date: '', description: '' });
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditForm({ name: '', date: '', description: '' });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="drone-video-section">
      <div className="section-header">
        <h2>Загрузка видео с дрона</h2>
        <p className="section-description">
          Загрузите видео съемки дорог с дрона. Поддерживаются форматы: MP4, AVI, MOV
        </p>
      </div>

      {/* Зона загрузки файлов */}
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={onDragIn}
        onDragLeave={onDragOut}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={handleFileClick}
      >
        <div className="upload-content">
          <i className="fas fa-cloud-upload-alt upload-icon"></i>
          <h3>Перетащите видеофайлы сюда или нажмите для выбора</h3>
          <p>Максимальный размер файла: 2GB</p>
          <p>Поддерживаемые форматы: MP4, AVI, MOV</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={onFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* Список загруженных видео */}
      {videos.length > 0 && (
        <div className="uploaded-videos">
          <h3>Загруженные видео ({videos.length})</h3>
          <div className="videos-list">
            {videos.map((video) => (
              <div key={video.id} className="video-item">
                <div className="video-preview">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt="Video thumbnail" />
                  ) : (
                    <div className="video-placeholder">
                      <i className="fas fa-video"></i>
                    </div>
                  )}
                </div>

                <div className="video-info">
                  {editingVideo === video.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Название видео"
                        className="edit-input"
                      />
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className="edit-input"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Описание видео"
                        className="edit-textarea"
                        rows="2"
                      />
                      <div className="edit-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSaveEdit(video.id)}
                        >
                          Сохранить
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4>{video.name || video.fileName}</h4>
                      <div className="video-meta">
                        <span className="video-size">{formatFileSize(video.size)}</span>
                        {video.date && <span className="video-date">Дата: {video.date}</span>}
                        {video.duration && <span className="video-duration">Длительность: {video.duration}</span>}
                      </div>
                      {video.description && (
                        <p className="video-description">{video.description}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="video-actions">
                  {editingVideo !== video.id && (
                    <>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditClick(video)}
                        title="Редактировать"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => onRemoveVideo(video.id)}
                        title="Удалить"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Прогресс загрузки */}
                {uploadProgress[video.id] && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${uploadProgress[video.id]}%` }}
                      />
                    </div>
                    <span className="progress-text">{uploadProgress[video.id]}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Подсказки */}
      <div className="helpful-tips">
        <h4>Полезные советы:</h4>
        <ul>
          <li>Для лучшего качества загружайте видео в разрешении не менее 1080p</li>
          <li>Убедитесь, что видео содержит GPS-координаты для привязки к карте</li>
          <li>Рекомендуется снимать со скоростью не более 30 км/ч для четкости изображения</li>
          <li>Добавьте описание к каждому видео для удобства навигации</li>
        </ul>
      </div>
    </div>
  );
}

DroneVideoSection.propTypes = {
  videos: PropTypes.array,
  dragActive: PropTypes.bool,
  uploadProgress: PropTypes.object,
  onDragIn: PropTypes.func.isRequired,
  onDragOut: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileInput: PropTypes.func.isRequired,
  onRemoveVideo: PropTypes.func.isRequired,
  onUpdateVideoName: PropTypes.func.isRequired,
  onUpdateVideoDate: PropTypes.func.isRequired,
  onUpdateVideoDescription: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired
};

export default DroneVideoSection;