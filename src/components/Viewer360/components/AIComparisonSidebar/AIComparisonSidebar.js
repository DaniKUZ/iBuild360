import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { API_CONFIG } from '../../../../config/api';
import styles from './AIComparisonSidebar.module.css';

const AIComparisonSidebar = ({ 
  isVisible, 
  comparisonImages = [], 
  onClose,
  onAnalyze,
  analysisResult,
  isAnalyzing = false
}) => {

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAnalyze = () => {
    if (comparisonImages.length === 2) {
      onAnalyze(comparisonImages);
    }
  };

  const canAnalyze = comparisonImages.length === 2 && !isAnalyzing;

  if (!isVisible) return null;

  return (
    <div className={styles.sidebarOverlay}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3>
            <i className="fas fa-brain"></i>
            AI сравнение
            {API_CONFIG.USE_DEMO && (
              <span className={styles.demoIndicator}>ДЕМО</span>
            )}
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
          {/* Загруженные изображения для сравнения */}
          <div className={styles.section}>
            <h4>Изображения для сравнения</h4>
            {comparisonImages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="fas fa-images"></i>
                </div>
                <p>
                  Нет изображений для сравнения. Используйте кнопку "Сравнить" 
                  в режиме разделения экрана между двумя разными изображениями.
                </p>
              </div>
            ) : (
              <div className={styles.imagesList}>
                {comparisonImages.map((image, index) => (
                  <div key={index} className={styles.imageItem}>
                    <div className={styles.imagePreview}>
                      <img 
                        src={image.url} 
                        alt={`Изображение ${index + 1}`}
                        className={styles.previewImage}
                      />
                    </div>
                    <div className={styles.imageInfo}>
                      <div className={styles.imageLabel}>
                        Изображение {index + 1}
                      </div>
                      <div className={styles.imageDate}>
                        {formatDate(image.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка анализа */}
          {comparisonImages.length > 0 && (
            <div className={styles.section}>
              <button 
                className={`${styles.analyzeButton} ${!canAnalyze ? styles.disabled : ''}`}
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Анализирую...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Получить AI анализ
                  </>
                )}
              </button>
            </div>
          )}

          {/* Результат анализа */}
          {analysisResult && (
            <div className={styles.section}>
              <h4>Результат анализа</h4>
              <div className={styles.analysisResult}>
                <div className={styles.resultIcon}>
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className={styles.resultText}>
                  {analysisResult}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AIComparisonSidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  comparisonImages: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })),
  onClose: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  analysisResult: PropTypes.string,
  isAnalyzing: PropTypes.bool,
};

export default AIComparisonSidebar; 