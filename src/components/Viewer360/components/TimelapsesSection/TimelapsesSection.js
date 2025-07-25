import React from 'react';
import PropTypes from 'prop-types';
import styles from './TimelapsesSection.module.css';

const TimelapsesSection = ({ onCreateVideo, onClose }) => {
  return (
    <div className={styles.sectionOverlay}>
      <div className={styles.section}>
        <div className={styles.header}>
          <h3>
            <i className="fas fa-clock"></i>
            Таймлапсы
          </h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            title="Закрыть"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <i className="fas fa-video"></i>
            </div>
            
            <div className={styles.infoContent}>
              <h4>Создание покадрового видео</h4>
              <p>
                Превратить отснятый материал в покадровое видео можно всего одним щелчком мыши.
                Нажмите кнопку «Создать покадровое видео» при просмотре отснятого материала.
              </p>
              
              <button 
                className={styles.createButton}
                onClick={onCreateVideo}
              >
                <i className="fas fa-play"></i>
                Создать покадровое видео
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TimelapsesSection.propTypes = {
  onCreateVideo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TimelapsesSection; 