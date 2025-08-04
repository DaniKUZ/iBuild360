import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './DroneShotsModal.module.css';

/**
 * Модальное окно для загрузки и управления снимками с дрона
 */
const DroneShotsModal = ({
  isVisible,
  onClose,
  onFilesUpload,
  
  // Существующие снимки
  droneShots = [],
  onShotSelect,
  onShotDelete,
  
  // Состояние загрузки
  isUploading = false,
  uploadProgress = 0,
  
  // Проект для контекста
  project,
}) => {
  const [dragOver, setDragOver] = useState(false);
  
  if (!isVisible) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      onFilesUpload?.(imageFiles);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      onFilesUpload?.(imageFiles);
    }
    
    // Сброс значения input для возможности повторной загрузки того же файла
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Снимки с дрона</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Зона загрузки */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Загрузить новые снимки</h3>
            
            <div 
              className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={styles.dropZoneContent}>
                <div className={styles.dropZoneIcon}>📷</div>
                <div className={styles.dropZoneText}>
                  Перетащите изображения сюда или 
                  <label className={styles.fileInputLabel}>
                    выберите файлы
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className={styles.fileInput}
                    />
                  </label>
                </div>
                <div className={styles.dropZoneHint}>
                  Поддерживаемые форматы: JPG, PNG, HEIC
                </div>
              </div>
            </div>

            {/* Прогресс загрузки */}
            {isUploading && (
              <div className={styles.uploadProgress}>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{uploadProgress}%</span>
                </div>
                <div className={styles.uploadingText}>Загружается...</div>
              </div>
            )}
          </div>

          {/* Существующие снимки */}
          {droneShots.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Загруженные снимки ({droneShots.length})
              </h3>
              
              <div className={styles.shotsGrid}>
                {droneShots.map((shot) => (
                  <div key={shot.id} className={styles.shotItem}>
                    <div className={styles.shotPreview}>
                      <img 
                        src={shot.thumbnail || shot.url} 
                        alt={shot.name}
                        className={styles.shotImage}
                        loading="lazy"
                      />
                      <div className={styles.shotOverlay}>
                        <button 
                          className={styles.shotAction}
                          onClick={() => onShotSelect?.(shot)}
                          title="Просмотр"
                        >
                          👁️
                        </button>
                        <button 
                          className={`${styles.shotAction} ${styles.deleteAction}`}
                          onClick={() => onShotDelete?.(shot.id)}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.shotInfo}>
                      <div className={styles.shotName}>{shot.name}</div>
                      <div className={styles.shotDetails}>
                        <div className={styles.shotSize}>
                          {formatFileSize(shot.size)}
                        </div>
                        <div className={styles.shotDate}>
                          {formatDate(shot.uploadedAt)}
                        </div>
                      </div>
                      {shot.gpsData && (
                        <div className={styles.gpsInfo}>
                          📍 {shot.gpsData.lat.toFixed(6)}, {shot.gpsData.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Пустое состояние */}
          {droneShots.length === 0 && !isUploading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🚁</div>
              <div className={styles.emptyTitle}>Снимков с дрона пока нет</div>
              <div className={styles.emptyText}>
                Загрузите первые снимки, чтобы начать работу
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            <span className={styles.totalCount}>
              Всего снимков: {droneShots.length}
            </span>
            <span className={styles.totalSize}>
              Общий размер: {formatFileSize(
                droneShots.reduce((total, shot) => total + (shot.size || 0), 0)
              )}
            </span>
          </div>
          <button className={styles.closeFooterButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

DroneShotsModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFilesUpload: PropTypes.func.isRequired,
  
  // Существующие снимки
  droneShots: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    size: PropTypes.number.isRequired,
    uploadedAt: PropTypes.string.isRequired,
    gpsData: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      altitude: PropTypes.number
    })
  })),
  onShotSelect: PropTypes.func,
  onShotDelete: PropTypes.func,
  
  // Состояние загрузки
  isUploading: PropTypes.bool,
  uploadProgress: PropTypes.number,
  
  // Проект для контекста
  project: PropTypes.object,
};

export default DroneShotsModal;