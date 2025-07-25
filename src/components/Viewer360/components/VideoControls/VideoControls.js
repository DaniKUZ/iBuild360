import React from 'react';
import PropTypes from 'prop-types';
import styles from './VideoControls.module.css';

const VideoControls = ({ 
  isPlaying, 
  shootingTime, 
  onPlay, 
  onPause, 
  onFirstFrame, 
  onPreviousFrame, 
  onNextFrame, 
  onLastFrame,
  disabled = false 
}) => {
  const formatShootingTime = (timeString) => {
    // Если передано время в формате HH:MM, возвращаем как есть
    if (timeString && typeof timeString === 'string') {
      return timeString;
    }
    // Иначе возвращаем время по умолчанию
    return '14:30';
  };

  const handlePlayPauseClick = () => {
    if (isPlaying) {
      onPause && onPause();
    } else {
      onPlay && onPlay();
    }
  };

  return (
    <div className={`${styles.videoControls} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.controlsGroup}>
        {/* Кнопка первого кадра */}
        <button
          className={`${styles.controlButton} ${styles.firstButton}`}
          onClick={onFirstFrame}
          disabled={disabled}
          title="Первый кадр"
        >
          <i className="fas fa-step-backward"></i>
        </button>

        {/* Кнопка предыдущего кадра */}
        <button
          className={`${styles.controlButton} ${styles.prevButton}`}
          onClick={onPreviousFrame}
          disabled={disabled}
          title="Предыдущий кадр"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {/* Кнопка play/pause */}
        <button
          className={`${styles.controlButton} ${styles.playButton}`}
          onClick={handlePlayPauseClick}
          disabled={disabled}
          title={isPlaying ? "Остановить" : "Продолжить"}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>

        {/* Кнопка следующего кадра */}
        <button
          className={`${styles.controlButton} ${styles.nextButton}`}
          onClick={onNextFrame}
          disabled={disabled}
          title="Следующий кадр"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Кнопка последнего кадра */}
        <button
          className={`${styles.controlButton} ${styles.lastButton}`}
          onClick={onLastFrame}
          disabled={disabled}
          title="Последний кадр"
        >
          <i className="fas fa-step-forward"></i>
        </button>
      </div>

      {/* Время съемки */}
      <div className={styles.timeDisplay}>
        <i className="fas fa-clock" style={{ marginRight: '6px', fontSize: '12px' }}></i>
        <span className={styles.shootingTime}>{formatShootingTime(shootingTime)}</span>
      </div>
    </div>
  );
};

VideoControls.propTypes = {
  isPlaying: PropTypes.bool,
  shootingTime: PropTypes.string,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onFirstFrame: PropTypes.func,
  onPreviousFrame: PropTypes.func,
  onNextFrame: PropTypes.func,
  onLastFrame: PropTypes.func,
  disabled: PropTypes.bool
};

VideoControls.defaultProps = {
  isPlaying: false,
  shootingTime: '14:30',
  disabled: false
};

export default VideoControls; 