import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './FieldNoteMarkers.module.css';

const FieldNoteMarkers = ({ fieldNotes, onMarkerClick, containerRef }) => {
  const [markerPositions, setMarkerPositions] = useState({});
  
  // Функция для конвертации 3D-координат в пиксельные координаты экрана
  const convertWorldToScreen = (note) => {
    if (!containerRef?.current) return { x: 0, y: 0, visible: false };
    
    try {
      const canvas = containerRef.current.getCanvas?.();
      const camera = containerRef.current.getCamera?.();
      
      if (!canvas || !camera) return { x: 0, y: 0, visible: false };
      
      const rect = canvas.getBoundingClientRect();
      
      // Если у заметки есть 3D-координаты (yaw, pitch), используем их
      if (note.position.yaw !== undefined && note.position.pitch !== undefined) {
        // Вычисляем разность углов между текущей позицией камеры и позицией заметки
        let yawDiff = note.position.yaw - camera.yaw;
        const pitchDiff = note.position.pitch - camera.pitch;
        
        // Нормализуем yaw разность для правильного отображения (-180 до 180)
        while (yawDiff > 180) yawDiff -= 360;
        while (yawDiff < -180) yawDiff += 360;
        
        // Вычисляем горизонтальный FOV
        const horizontalFOV = camera.fov * (canvas.clientWidth / canvas.clientHeight);
        
        // Проверяем, видна ли заметка в текущем поле зрения
        const maxYawVisible = horizontalFOV / 2;
        const maxPitchVisible = camera.fov / 2;
        
        if (Math.abs(yawDiff) > maxYawVisible || Math.abs(pitchDiff) > maxPitchVisible) {
          return { x: 0, y: 0, visible: false };
        }
        
        // Конвертируем угловые различия в нормализованные координаты (-1 до 1)
        // Инвертируем X для правильного движения заметок относительно камеры
        const normalizedX = -(yawDiff / maxYawVisible);
        const normalizedY = -(pitchDiff / maxPitchVisible);
        
        // Конвертируем в пиксельные координаты
        const x = (normalizedX + 1) * canvas.clientWidth / 2;
        const y = (-normalizedY + 1) * canvas.clientHeight / 2;
        
        return { x, y, visible: true };
      } else {
        // Fallback для старых заметок с только пиксельными координатами
        return { x: note.position.x || 0, y: note.position.y || 0, visible: true };
      }
    } catch (error) {
      console.error('Ошибка конвертации координат заметки:', error);
      return { x: note.position.x || 0, y: note.position.y || 0, visible: true };
    }
  };

  // Обновляем позиции маркеров при изменении камеры
  useEffect(() => {
    const updatePositions = () => {
      // Не обновляем, если нет заметок
      if (!fieldNotes || fieldNotes.length === 0) {
        setMarkerPositions({});
        return;
      }
      
      const newPositions = {};
      
      fieldNotes.forEach(note => {
        const newPosition = convertWorldToScreen(note);
        newPositions[note.id] = newPosition;
      });
      
      setMarkerPositions(newPositions);
    };

    updatePositions();
    
    // Добавляем слушатель событий обновления камеры для мгновенного позиционирования
    let animationFrameId;
    const handleCameraUpdate = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updatePositions);
    };

    // Обновляем позиции при каждом кадре для жесткого крепления
    const intervalId = setInterval(updatePositions, 16); // ~60 FPS для плавности
    
    return () => {
      clearInterval(intervalId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [fieldNotes, containerRef]);

  const handleMarkerClick = (event, note) => {
    event.stopPropagation();
    onMarkerClick(note);
  };

  // Проверяем наличие заметок после всех хуков
  if (!fieldNotes || fieldNotes.length === 0) {
    return null;
  }

  return (
    <div className={styles.markersContainer}>
      {fieldNotes.map((note) => {
        const position = markerPositions[note.id] || { x: 0, y: 0, visible: false };
        
        if (!position.visible) return null;
        
        return (
          <div
            key={note.id}
            className={styles.fieldNoteMarker}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onClick={(event) => handleMarkerClick(event, note)}
            title={note.description ? note.description.substring(0, 50) + '...' : 'Полевая заметка'}
          >
            <div className={styles.markerIcon}>
              <i className="fas fa-sticky-note"></i>
            </div>
            
            {/* Статус индикатор */}
            {note.status && (
              <div 
                className={styles.statusIndicator}
                style={{ backgroundColor: note.status.color }}
              ></div>
            )}
            
            {/* Tooltip с информацией о заметке */}
            <div className={styles.markerTooltip}>
              <div className={styles.tooltipHeader}>
                <span className={styles.author}>
                  {note.author?.firstName} {note.author?.lastName}
                </span>
                <span className={styles.date}>
                  {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {note.description && (
                <div className={styles.tooltipDescription}>
                  {note.description.length > 100 
                    ? note.description.substring(0, 100) + '...' 
                    : note.description
                  }
                </div>
              )}
              {note.status && (
                <div className={styles.tooltipStatus}>
                  <span 
                    className={styles.statusDot}
                    style={{ backgroundColor: note.status.color }}
                  ></span>
                  {note.status.name}
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className={styles.tooltipTags}>
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className={styles.tooltipTag}>
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className={styles.tooltipTag}>+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

FieldNoteMarkers.propTypes = {
  fieldNotes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    description: PropTypes.string,
    status: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    author: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    createdAt: PropTypes.string,
  })),
  onMarkerClick: PropTypes.func.isRequired,
  containerRef: PropTypes.object,
};

FieldNoteMarkers.defaultProps = {
  fieldNotes: [],
};

export default FieldNoteMarkers; 