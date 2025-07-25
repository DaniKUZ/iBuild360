import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './DroneShotsSection.module.css';

const DroneShotsSection = ({ onClose, onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (onUpload) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (onUpload) {
      onUpload(files);
    }
  };

  return (
    <div className={styles.sectionOverlay}>
      <div className={styles.section}>
        <div className={styles.header}>
          <h3>
            <i className="fas fa-helicopter"></i>
            Съемка с дронов
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
          <div className={styles.uploadSection}>
            <h4>Загрузить изображения с дронов</h4>
            <p className={styles.description}>
              Теперь вы можете добавлять изображения с беспилотников на платформу OpenSpace 
              для создания ортофотоплана вашего участка.
            </p>
            
            <div 
              className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <p>или перетащите и отпустите</p>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className={styles.fileInput}
                id="drone-images"
              />
              <label htmlFor="drone-images" className={styles.uploadButton}>
                Выбрать файлы
              </label>
            </div>
          </div>
          
          <div className={styles.tipsSection}>
            <h4>Для успешной обработки изображения выполните следующие действия.</h4>
            
            <div className={styles.tipCard}>
              <div className={styles.tipHeader}>
                <span className={styles.tipNumber}>Совет 1</span>
              </div>
              <h5>Обеспечить 75% фронтального перекрытия и 60% бокового перекрытия</h5>
              <p>
                С помощью вашего дрона вы можете выполнить полёт по сетке, собирая изображения 
                в надире (направлении вниз) с необходимым перекрытием. Подробнее о передовых 
                методах съёмки с помощью дронов.
              </p>
            </div>
            
            <div className={styles.tipCard}>
              <div className={styles.tipHeader}>
                <span className={styles.tipNumber}>Совет 2</span>
              </div>
              <h5>Загружайте JPG-файлы только из одного полета.</h5>
              <p>
                Загружайте изображения JPG с SD-карты по одному за раз через эту страницу. 
                Сохраните и дайте имя полёту, чтобы начать обработку. Подробнее.
              </p>
            </div>
            
            <div className={styles.tipCard}>
              <div className={styles.tipHeader}>
                <span className={styles.tipNumber}>Совет 3</span>
              </div>
              <h5>Дайте время на обработку</h5>
              <p>
                После завершения обработки вам будет отправлено электронное письмо в течение 
                2–6 часов в зависимости от количества изображений.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DroneShotsSection.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func,
};

export default DroneShotsSection; 