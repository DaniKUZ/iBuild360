import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Video360Section({ 
  videos,
  dragActive, 
  uploadProgress,
  analysisProgress,
  onDragIn, 
  onDragOut, 
  onDrag, 
  onDrop, 
  onFileInput, 
  onRemoveVideo,
  onUpdateVideoName,
  onUpdateVideoShootingDate,
  onAnalyzeVideo,
  formatFileSize 
}) {
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDateId, setEditingDateId] = useState(null);
  const [editingDate, setEditingDate] = useState('');

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

  const handleEditDate = (video) => {
    setEditingDateId(video.id);
    setEditingDate(video.shootingDate || '');
  };

  const handleSaveDate = () => {
    onUpdateVideoShootingDate(editingDateId, editingDate);
    setEditingDateId(null);
    setEditingDate('');
  };

  const handleCancelDateEdit = () => {
    setEditingDateId(null);
    setEditingDate('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingVideoId) {
        handleSaveName();
      } else if (editingDateId) {
        handleSaveDate();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
      handleCancelDateEdit();
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

  const getAnalysisStatusIcon = (analysisStatus) => {
    switch (analysisStatus) {
      case 'not_analyzed':
        return 'fas fa-clock';
      case 'analyzing':
        return 'fas fa-spinner fa-spin';
      case 'analyzed':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-clock';
    }
  };

  const getAnalysisStatusText = (analysisStatus) => {
    switch (analysisStatus) {
      case 'not_analyzed':
        return 'Не проанализировано';
      case 'analyzing':
        return 'Анализ...';
      case 'analyzed':
        return 'Проанализировано';
      case 'error':
        return 'Ошибка анализа';
      default:
        return 'Неизвестно';
    }
  };

  const getAnalysisButtonText = (video) => {
    if (video.analysisStatus === 'analyzing') return 'Анализируется...';
    if (video.analysisStatus === 'analyzed') return 'Повторить анализ';
    return 'Анализировать';
  };

  const canAnalyze = (video) => {
    return video.status === 'ready' && video.analysisStatus !== 'analyzing';
  };

  return (
    <div className="video360-section">
      <div className="video360-header">
        <h3>
          <i className="fas fa-video"></i>
          Загрузка видео 360°
        </h3>
        <p className="video360-description">
          Загрузите видео 360° для вашего проекта. После загрузки укажите дату съемки и запустите анализ для создания интерактивного маршрута.
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
                      
                      {/* Дата съемки */}
                      <div className="video-shooting-date">
                        <label className="shooting-date-label">
                          <i className="fas fa-calendar"></i>
                          Дата съемки:
                        </label>
                        {editingDateId === video.id ? (
                          <div className="date-edit-form">
                            <input
                              type="date"
                              value={editingDate}
                              onChange={(e) => setEditingDate(e.target.value)}
                              onKeyDown={handleKeyPress}
                              onBlur={handleSaveDate}
                              className="date-edit-input"
                              autoFocus
                            />
                            <div className="date-edit-actions">
                              <button 
                                className="btn-save"
                                onClick={handleSaveDate}
                                title="Сохранить"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={handleCancelDateEdit}
                                title="Отмена"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span 
                            className="shooting-date-value editable-date"
                            onClick={() => handleEditDate(video)}
                            title="Нажмите для редактирования"
                          >
                            {video.shootingDate || 'Не указана'}
                            <i className="fas fa-edit edit-icon"></i>
                          </span>
                        )}
                      </div>

                      {/* Статус анализа */}
                      <div className="video-analysis-status">
                        <span className="analysis-status-label">
                          <i className={getAnalysisStatusIcon(video.analysisStatus)}></i>
                          {getAnalysisStatusText(video.analysisStatus)}
                        </span>
                        {video.analysisStatus === 'analyzed' && video.extractedFrames && (
                          <span className="frames-count">
                            ({video.extractedFrames.length} кадров)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка анализа */}
                  {video.status === 'ready' && (
                    <div className="video-analysis-section">
                      <button 
                        className={`analyze-video-btn ${video.analysisStatus === 'analyzed' ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => onAnalyzeVideo(video.id)}
                        disabled={!canAnalyze(video)}
                        title="Извлечь кадры для создания маршрута"
                      >
                        <i className={video.analysisStatus === 'analyzing' ? 'fas fa-spinner fa-spin' : 'fas fa-microscope'}></i>
                        {getAnalysisButtonText(video)}
                      </button>
                    </div>
                  )}
                  
                  {/* Прогресс загрузки */}
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

                  {/* Прогресс анализа */}
                  {analysisProgress[video.id] !== undefined && analysisProgress[video.id] < 100 && (
                    <div className="analysis-progress">
                      <div className="progress-label">Анализ видео:</div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill analysis-progress-fill"
                          style={{ width: `${Math.round(analysisProgress[video.id])}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(analysisProgress[video.id])}%</span>
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
          <h4>Инструкция по работе с видео 360°:</h4>
          <ul>
            <li><strong>Загрузка:</strong> Поддерживаемые форматы: .MP4, .MOV, .AVI</li>
            <li><strong>Качество:</strong> Рекомендуемое разрешение: 4K (3840×1920) или выше</li>
            <li><strong>Размер:</strong> Максимальный размер файла: 2 GB</li>
            <li><strong>Формат:</strong> Видео должно быть записано в формате 360° (эквирекциональная проекция)</li>
            <li><strong>Частота кадров:</strong> Рекомендуемая частота: 30 fps</li>
            <li><strong>Название:</strong> Дайте видео понятное название (кликните по имени для редактирования)</li>
            <li><strong>Дата съемки:</strong> Укажите дату, когда было снято видео (поможет в навигации)</li>
            <li><strong>Анализ:</strong> После загрузки нажмите "Анализировать" для извлечения кадров каждую секунду</li>
            <li><strong>Время анализа:</strong> Процесс зависит от длительности видео (примерно 1-2 минуты на каждые 10 минут видео)</li>
            <li><strong>Просмотр:</strong> Проанализированное видео появится во вкладке "Видео 360°" в режиме просмотра</li>
            <li><strong>Навигация:</strong> В режиме просмотра можно "гулять" по видео, переключаясь между кадрами</li>
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
  analysisProgress: PropTypes.object.isRequired,
  onDragIn: PropTypes.func.isRequired,
  onDragOut: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileInput: PropTypes.func.isRequired,
  onRemoveVideo: PropTypes.func.isRequired,
  onUpdateVideoName: PropTypes.func.isRequired,
  onUpdateVideoShootingDate: PropTypes.func.isRequired,
  onAnalyzeVideo: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired
};

export default Video360Section; 