import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Video360Section({ 
  videos,
  floors = [],
  dragActive, 
  uploadProgress,
  onDragIn, 
  onDragOut, 
  onDrag, 
  onDrop, 
  onFileInput, 
  onRemoveVideo,
  onUpdateVideoName,
  onUpdateVideoShootingDate,
  onUpdateVideoServerStatus,
  onUpdateVideoAssignedFloor,
  onUpdateVideoTags,
  formatFileSize 
}) {
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDateId, setEditingDateId] = useState(null);
  const [editingDate, setEditingDate] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(''); // Добавляем состояние для выбранной схемы
  const [sendingVideoId, setSendingVideoId] = useState(null); // Состояние отправки на сервер

  // Эффект для инициализации selectedScheme из данных видео
  useEffect(() => {
    // Если есть видео с привязанным этажом, устанавливаем его как выбранную схему
    const videoWithFloor = videos.find(video => video.assignedFloorId);
    if (videoWithFloor && !selectedScheme) {
      setSelectedScheme(videoWithFloor.assignedFloorId.toString());
    }
  }, [videos, selectedScheme]);

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



  // Функции для определения статуса готовности
  const getReadyStatusIcon = (video, selectedScheme) => {
    if (video.serverStatus === 'sent') return 'fas fa-check-double';
    if (video.serverStatus === 'error') return 'fas fa-exclamation-triangle';
    if (video.status !== 'ready') return 'fas fa-clock';
    if (!selectedScheme) return 'fas fa-layer-group';
    if (!video.shootingDate) return 'fas fa-calendar-times';
    return 'fas fa-check-circle';
  };

  const getReadyStatusText = (video, selectedScheme) => {
    if (video.serverStatus === 'sent') return 'Отправлено';
    if (video.serverStatus === 'error') return 'Ошибка отправки';
    if (video.status !== 'ready') return 'Загружается...';
    if (!selectedScheme) return 'Выберите схему';
    if (!video.shootingDate) return 'Укажите дату съемки';
    return 'Готово к отправке';
  };

  // Обработчик отправки на сервер (заглушка)
  const handleSendToServer = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    const scheme = floors.find(floor => floor.id === parseInt(selectedScheme));
    
    if (!video.shootingDate) {
      return;
    }
    
    // Начинаем отправку
    setSendingVideoId(videoId);
    onUpdateVideoServerStatus?.(videoId, 'sending');
    onUpdateVideoAssignedFloor?.(videoId, parseInt(selectedScheme));
    
    try {
      // Имитация отправки на сервер (3 секунды)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Успешная отправка
      console.log(`Отправлено на сервер:\nВидео: ${video.name}\nСхема: ${scheme.name}\nДата съемки: ${video.shootingDate}`);
      
      // Обновляем статус отправки
      onUpdateVideoServerStatus?.(videoId, 'sent');
      
    } catch (error) {
      console.error('Ошибка отправки на сервер:', error);
      onUpdateVideoServerStatus?.(videoId, 'error');
    } finally {
      // Завершаем отправку
      setSendingVideoId(null);
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
          Выберите схему, загрузите видео 360° для вашего проекта и отправьте на сервер для обработки.
        </p>
      </div>

      {/* Добавляем селектор схемы */}
      <div className="scheme-selector-section">
        <h4>Выбор схемы</h4>
        <div className="scheme-selector">
          <label htmlFor="scheme-select">
            <i className="fas fa-layer-group"></i>
            Выберите схему из секции "Схемы":
          </label>
          <select
            id="scheme-select"
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="scheme-select"
            required
          >
            <option value="">-- Выберите схему --</option>
            {floors.map(floor => (
              <option key={floor.id} value={floor.id}>
                {floor.name} - {floor.description}
              </option>
            ))}
          </select>
          {selectedScheme && (
            <div className="selected-scheme-preview">
              {(() => {
                const selectedFloor = floors.find(floor => floor.id === parseInt(selectedScheme));
                return selectedFloor ? (
                  <div className="scheme-preview">
                    <img 
                      src={selectedFloor.thumbnail} 
                      alt={selectedFloor.name}
                      className="scheme-thumbnail" 
                    />
                    <div className="scheme-info">
                      <h5>{selectedFloor.name}</h5>
                      <p>{selectedFloor.description}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
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
                      
                      {/* Связанная схема */}
                      {video.assignedFloorId && (
                        <div className="video-scheme-info">
                          <i className="fas fa-layer-group"></i>
                          <span>Схема: {floors.find(floor => floor.id === video.assignedFloorId)?.name || 'Неизвестная схема'}</span>
                        </div>
                      )}
                      
                      {/* Дата съемки */}
                      <div className="video-shooting-date">
                        <label className="shooting-date-label required">
                          <i className="fas fa-calendar"></i>
                          Дата съемки: <span className="required-star">*</span>
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

                      {/* Информация о готовности к отправке */}
                      <div className="video-ready-status">
                        <span className="ready-status-label">
                          <i className={getReadyStatusIcon(video, selectedScheme)}></i>
                          {getReadyStatusText(video, selectedScheme)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка отправки на сервер / Статус отправлено */}
                  {video.status === 'ready' && selectedScheme && (
                    <div className="video-send-section">
                      {video.serverStatus === 'sent' ? (
                        <div className="sent-status">
                          <i className="fas fa-check-circle"></i>
                          <span>Отправлено</span>
                        </div>
                      ) : video.serverStatus === 'error' ? (
                        <div className="error-status">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Ошибка отправки</span>
                        </div>
                      ) : (
                        <button 
                          className={`send-to-server-btn ${
                            video.serverStatus === 'sending' || sendingVideoId === video.id ? 'btn-sending' :
                            video.shootingDate ? 'btn-primary' : 'btn-disabled'
                          }`}
                          onClick={() => handleSendToServer(video.id)}
                          disabled={!video.shootingDate || video.serverStatus === 'sending' || sendingVideoId === video.id}
                          title={
                            video.serverStatus === 'sending' || sendingVideoId === video.id ? "Отправляем на сервер..." :
                            video.shootingDate ? "Отправить видео и схему на сервер для обработки" : 
                            "Укажите дату съемки перед отправкой на сервер"
                          }
                        >
                          {video.serverStatus === 'sending' || sendingVideoId === video.id ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Отправляем...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt"></i>
                              Отправить на сервер
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Прогресс отправки */}
                      {(video.serverStatus === 'sending' || sendingVideoId === video.id) && (
                        <div className="sending-progress">
                          <div className="progress-bar">
                            <div className="progress-fill sending-progress-fill"></div>
                          </div>
                          <span className="progress-text">Загружаем на сервер...</span>
                        </div>
                      )}
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
            <li><strong>Выбор схемы:</strong> Сначала выберите схему из секции "Схемы", к которой будет привязано видео</li>
            <li><strong>Загрузка:</strong> Поддерживаемые форматы: .MP4, .MOV, .AVI</li>
            <li><strong>Качество:</strong> Рекомендуемое разрешение: 4K (3840×1920) или выше</li>
            <li><strong>Размер:</strong> Максимальный размер файла: 2 GB</li>
            <li><strong>Формат:</strong> Видео должно быть записано в формате 360° (эквирекциональная проекция)</li>
            <li><strong>Частота кадров:</strong> Рекомендуемая частота: 30 fps</li>
            <li><strong>Название:</strong> Дайте видео понятное название (кликните по имени для редактирования)</li>
            <li><strong>Дата съемки:</strong> Обязательно укажите дату съемки видео (требуется для отправки на сервер)</li>
            <li><strong>Отправка на сервер:</strong> После выбора схемы и загрузки видео нажмите "Отправить на сервер"</li>
            <li><strong>Обработка:</strong> Сервер обработает видео и привяжет его к выбранной схеме</li>
            <li><strong>Просмотр:</strong> Обработанное видео появится во вкладке "Видео 360°" в режиме просмотра</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Video360Section.propTypes = {
  videos: PropTypes.array.isRequired,
  floors: PropTypes.array.isRequired,
  dragActive: PropTypes.bool.isRequired,
  uploadProgress: PropTypes.object.isRequired,
  onDragIn: PropTypes.func.isRequired,
  onDragOut: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileInput: PropTypes.func.isRequired,
  onRemoveVideo: PropTypes.func.isRequired,
  onUpdateVideoName: PropTypes.func.isRequired,
  onUpdateVideoShootingDate: PropTypes.func.isRequired,
  onUpdateVideoServerStatus: PropTypes.func,
  onUpdateVideoAssignedFloor: PropTypes.func,
  onUpdateVideoTags: PropTypes.func,
  formatFileSize: PropTypes.func.isRequired
};

export default Video360Section; 