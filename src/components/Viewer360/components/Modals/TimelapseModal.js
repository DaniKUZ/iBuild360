import React from 'react';
import PropTypes from 'prop-types';
import styles from './TimelapseModal.module.css';

/**
 * Модальное окно для создания и просмотра таймлапсов
 */
const TimelapseModal = ({
  isVisible,
  onClose,
  onCreateTimelapse,
  
  // Настройки таймлапса
  timelapseSettings = {
    startDate: null,
    endDate: null,
    interval: 'day', // 'hour', 'day', 'week'
    duration: 5, // секунды
    quality: 'high' // 'low', 'medium', 'high'
  },
  onSettingsChange,
  
  // Существующие таймлапсы
  existingTimelapses = [],
  onTimelapseSelect,
  onTimelapseDelete,
  
  // Состояние создания
  isCreating = false,
  creationProgress = 0,
  
  // Проект для контекста
  project,
}) => {
  if (!isVisible) return null;

  const handleIntervalChange = (interval) => {
    onSettingsChange?.({
      ...timelapseSettings,
      interval
    });
  };

  const handleQualityChange = (quality) => {
    onSettingsChange?.({
      ...timelapseSettings,
      quality
    });
  };

  const handleDurationChange = (duration) => {
    onSettingsChange?.({
      ...timelapseSettings,
      duration: Number(duration)
    });
  };

  const handleDateChange = (field, date) => {
    onSettingsChange?.({
      ...timelapseSettings,
      [field]: date
    });
  };

  const handleCreate = () => {
    if (timelapseSettings.startDate && timelapseSettings.endDate) {
      onCreateTimelapse?.(timelapseSettings);
    }
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('ru-RU') : 'Не выбрано';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Создание таймлапса</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Настройки нового таймлапса */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Настройки таймлапса</h3>
            
            <div className={styles.settingsGrid}>
              {/* Даты */}
              <div className={styles.dateGroup}>
                <label className={styles.label}>Начальная дата:</label>
                <div className={styles.dateDisplay}>
                  {formatDate(timelapseSettings.startDate)}
                </div>
                <button 
                  className={styles.dateButton}
                  onClick={() => {
                    // Здесь должен открыться календарь
                    console.log('Выбор начальной даты');
                  }}
                >
                  Выбрать дату
                </button>
              </div>

              <div className={styles.dateGroup}>
                <label className={styles.label}>Конечная дата:</label>
                <div className={styles.dateDisplay}>
                  {formatDate(timelapseSettings.endDate)}
                </div>
                <button 
                  className={styles.dateButton}
                  onClick={() => {
                    // Здесь должен открыться календарь
                    console.log('Выбор конечной даты');
                  }}
                >
                  Выбрать дату
                </button>
              </div>

              {/* Интервал */}
              <div className={styles.controlGroup}>
                <label className={styles.label}>Интервал съемки:</label>
                <div className={styles.radioGroup}>
                  {[
                    { value: 'hour', label: 'Каждый час' },
                    { value: 'day', label: 'Каждый день' },
                    { value: 'week', label: 'Каждую неделю' }
                  ].map(option => (
                    <label key={option.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="interval"
                        value={option.value}
                        checked={timelapseSettings.interval === option.value}
                        onChange={() => handleIntervalChange(option.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Продолжительность */}
              <div className={styles.controlGroup}>
                <label className={styles.label}>Продолжительность (сек):</label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={timelapseSettings.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeValue}>{timelapseSettings.duration} сек</span>
              </div>

              {/* Качество */}
              <div className={styles.controlGroup}>
                <label className={styles.label}>Качество:</label>
                <select
                  value={timelapseSettings.quality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="low">Низкое (720p)</option>
                  <option value="medium">Среднее (1080p)</option>
                  <option value="high">Высокое (4K)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Прогресс создания */}
          {isCreating && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Создание таймлапса...</h3>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${creationProgress}%` }}
                  />
                </div>
                <span className={styles.progressText}>{creationProgress}%</span>
              </div>
            </div>
          )}

          {/* Существующие таймлапсы */}
          {existingTimelapses.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Существующие таймлапсы</h3>
              <div className={styles.timelapseList}>
                {existingTimelapses.map((timelapse) => (
                  <div key={timelapse.id} className={styles.timelapseItem}>
                    <div className={styles.timelapseInfo}>
                      <div className={styles.timelapseName}>{timelapse.name}</div>
                      <div className={styles.timelapseDetails}>
                        {timelapse.duration}с • {timelapse.quality} • {timelapse.createdAt}
                      </div>
                    </div>
                    <div className={styles.timelapseActions}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => onTimelapseSelect?.(timelapse)}
                      >
                        Просмотр
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => onTimelapseDelete?.(timelapse.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button 
            className={styles.createButton}
            onClick={handleCreate}
            disabled={isCreating || !timelapseSettings.startDate || !timelapseSettings.endDate}
          >
            {isCreating ? 'Создается...' : 'Создать таймлапс'}
          </button>
        </div>
      </div>
    </div>
  );
};

TimelapseModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateTimelapse: PropTypes.func.isRequired,
  
  // Настройки таймлапса
  timelapseSettings: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    interval: PropTypes.oneOf(['hour', 'day', 'week']),
    duration: PropTypes.number,
    quality: PropTypes.oneOf(['low', 'medium', 'high'])
  }),
  onSettingsChange: PropTypes.func,
  
  // Существующие таймлапсы
  existingTimelapses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    quality: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  })),
  onTimelapseSelect: PropTypes.func,
  onTimelapseDelete: PropTypes.func,
  
  // Состояние создания
  isCreating: PropTypes.bool,
  creationProgress: PropTypes.number,
  
  // Проект для контекста
  project: PropTypes.object,
};

export default TimelapseModal;