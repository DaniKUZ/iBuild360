import React from 'react';
import PropTypes from 'prop-types';
import styles from './GanttChart.module.css';

const GanttChart = ({ phases, selectedPhase, onPhaseSelect }) => {
  // Находим общий период проекта
  const allDates = phases.flatMap(phase => [
    new Date(phase.startDate),
    new Date(phase.endDate)
  ]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  
  // Общая длительность проекта в днях
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  
  // Функция для вычисления позиции и ширины фазы на шкале времени
  const getPhasePosition = (phase) => {
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);
    
    const startDays = Math.ceil((startDate - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const left = (startDays / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Компактное форматирование для временной шкалы
  const formatTimeMarkDate = (date) => {
    const month = date.toLocaleDateString('ru-RU', { month: 'short' });
    const year = date.getFullYear();
    return `${month}\n${year}`;
  };

  // Генерация меток времени
  const generateTimeMarks = () => {
    const marks = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const daysPassed = Math.ceil((currentDate - minDate) / (1000 * 60 * 60 * 24));
      const position = (daysPassed / totalDays) * 100;
      
      marks.push({
        date: new Date(currentDate),
        position: `${position}%`
      });
      
      // Добавляем метку каждые 2 недели
      currentDate.setDate(currentDate.getDate() + 14);
    }
    
    return marks;
  };

  const timeMarks = generateTimeMarks();

  return (
    <div className={styles.ganttChart}>
      <div className={styles.chartHeader}>
        <h3 className={styles.title}>
          <i className="fas fa-chart-gantt"></i>
          Диаграмма Ганта
        </h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.completed}`}></div>
            <span>Завершено</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.inProgress}`}></div>
            <span>В процессе</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.planned}`}></div>
            <span>Запланировано</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.critical}`}></div>
            <span>Критический путь</span>
          </div>
        </div>
      </div>



      <div className={styles.chartContainer}>
        {/* Колонка с названиями работ */}
        <div className={styles.phaseNamesColumn}>
          <div className={styles.phaseNamesHeader}>
            Этапы работ
          </div>
          <div className={styles.phaseNamesList}>
            {phases.map((phase) => {
              const isSelected = selectedPhase && selectedPhase.id === phase.id;
              
              return (
                <div 
                  key={phase.id}
                  className={`${styles.phaseNameItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onPhaseSelect(phase)}
                >
                  <div className={styles.phaseName}>
                    {phase.name}
                    {phase.criticalPath && (
                      <i className="fas fa-exclamation-triangle" title="Критический путь"></i>
                    )}
                  </div>
                  <div className={styles.phaseInfo}>
                    <span className={styles.phaseDuration}>{phase.duration} дней</span>
                    <span className={`${styles.phaseStatus} ${styles[phase.status.toLowerCase().replace(' ', '')]}`}>
                      {phase.status}
                    </span>
                    <span className={styles.progressValue}>{phase.progress}%</span>
                  </div>
                  <div className={styles.phaseInfo}>
                    <span className={styles.phaseDuration}>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Область с временной шкалой и диаграммой */}
        <div className={styles.timelineArea}>
          {/* Временная шкала */}
          <div className={styles.timeScale}>
            <div className={styles.timeMarks}>
              {timeMarks.map((mark, index) => (
                <div 
                  key={index}
                  className={styles.timeMark}
                  style={{ left: mark.position }}
                >
                  <div className={styles.timeMarkLine}></div>
                  <div className={styles.timeMarkLabel}>
                    {formatTimeMarkDate(mark.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Контейнер временных полос */}
          <div className={styles.timelineBarsContainer}>
            {phases.map((phase) => {
              const position = getPhasePosition(phase);
              const isSelected = selectedPhase && selectedPhase.id === phase.id;
              
              return (
                <div 
                  key={phase.id}
                  className={`${styles.phaseTimelineRow} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onPhaseSelect(phase)}
                >
                  <div 
                    className={`${styles.phaseBar} ${styles[phase.status.toLowerCase().replace(' ', '')]} ${phase.criticalPath ? styles.critical : ''}`}
                    style={position}
                  >
                    <div 
                      className={styles.progressBar}
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {/* Текущая дата */}
            <div className={styles.currentDateLine}>
              <div 
                className={styles.currentDateMarker}
                style={{ 
                  left: `${(Math.ceil((new Date() - minDate) / (1000 * 60 * 60 * 24)) / totalDays) * 100}%` 
                }}
              >
                <div className={styles.currentDateLabel}>Сегодня</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

GanttChart.propTypes = {
  phases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired,
      progress: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      criticalPath: PropTypes.bool.isRequired
    })
  ).isRequired,
  selectedPhase: PropTypes.object,
  onPhaseSelect: PropTypes.func.isRequired
};

export default GanttChart;

