import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DateComparisonModal.css';

const DateComparisonModal = ({ 
  isOpen, 
  onClose, 
  leftDate = new Date('2025-07-09'), 
  rightDate = new Date('2025-07-14'),
  generateFramesForDate,
  getAnalysisSegmentsByDate 
}) => {
  const [currentLeftFrame, setCurrentLeftFrame] = useState(0);
  const [currentRightFrame, setCurrentRightFrame] = useState(0);
  const [activeTab, setActiveTab] = useState('comparison');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Генерируем кадры для обеих дат
  const leftFrames = useMemo(() => generateFramesForDate(leftDate), [leftDate, generateFramesForDate]);
  const rightFrames = useMemo(() => generateFramesForDate(rightDate), [rightDate, generateFramesForDate]);
  
  // Получаем данные анализа для обеих дат
  const leftAnalysis = useMemo(() => getAnalysisSegmentsByDate(leftDate), [leftDate, getAnalysisSegmentsByDate]);
  const rightAnalysis = useMemo(() => getAnalysisSegmentsByDate(rightDate), [rightDate, getAnalysisSegmentsByDate]);

  // Функция запуска AI анализа
  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    
    // Имитация AI анализа
    setTimeout(() => {
      setAnalysisResults({
        overallProgress: 78,
        keyChanges: [
          {
            id: 1,
            title: 'Завершение земляных работ',
            description: 'Выполнено снятие растительного слоя и планировка территории на участке 0-600м',
            impact: 'high',
            frameIndices: [0, 1, 2]
          },
          {
            id: 2,
            title: 'Начало асфальтирования',
            description: 'Появились участки с первым слоем асфальтового покрытия',
            impact: 'medium',
            frameIndices: [7, 8, 9]
          },
          {
            id: 3,
            title: 'Установка дренажных систем',
            description: 'Видны новые водоотводные каналы и дренажные элементы',
            impact: 'medium',
            frameIndices: [5, 6]
          }
        ],
        statistics: {
          totalArea: 1583,
          completedArea: 1235,
          inProgressArea: 348,
          remainingTasks: 11,
          efficiency: 94
        },
        timeline: {
          estimatedCompletion: '15 февраля 2026',
          daysAhead: 12,
          criticalPath: ['Асфальтирование', 'Дорожная разметка', 'Освещение']
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  // Синхронизация кадров
  const handleSyncFrames = () => {
    const targetFrame = Math.min(currentLeftFrame, rightFrames.length - 1);
    setCurrentRightFrame(targetFrame);
  };

  // Блокируем скролл body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Очистка при размонтировании
    return () => {
      if (isOpen) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="date-comparison-modal-overlay" onClick={onClose}>
      <div className="date-comparison-modal" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок модального окна */}
        <div className="modal-header">
          <h2>Сравнение дат строительства</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Табы */}
        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <i className="fas fa-images"></i>
            Сравнение кадров
          </button>
          <button 
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <i className="fas fa-robot"></i>
            AI Анализ
          </button>
          <button 
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <i className="fas fa-chart-bar"></i>
            Статистика
          </button>
        </div>

        {/* Контент */}
        <div className="date-modal-content">
          {activeTab === 'comparison' && (
            <div className="comparison-view">
              {/* Заголовки дат */}
              <div className="dates-header">
                <div className="date-info left">
                  <h3>{leftDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <span className="frame-count">{leftFrames.length} кадров</span>
                </div>
                <div className="sync-controls">
                  <button className="sync-button" onClick={handleSyncFrames} title="Синхронизировать кадры">
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
                <div className="date-info right">
                  <h3>{rightDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <span className="frame-count">{rightFrames.length} кадров</span>
                </div>
              </div>

              {/* Изображения */}
              <div className="comparison-images">
                <div className="image-panel left">
                  <img 
                    src={leftFrames[currentLeftFrame]?.imageUrl} 
                    alt={`Кадр ${currentLeftFrame + 1} от ${leftDate.toDateString()}`}
                    className="comparison-image"
                  />
                  <div className="frame-controls">
                    <input 
                      type="range" 
                      min="0" 
                      max={leftFrames.length - 1} 
                      value={currentLeftFrame}
                      onChange={(e) => setCurrentLeftFrame(parseInt(e.target.value))}
                      className="frame-slider"
                    />
                    <span className="modal-frame-info">{currentLeftFrame + 1} / {leftFrames.length}</span>
                  </div>
                </div>

                <div className="image-panel right">
                  <img 
                    src={rightFrames[currentRightFrame]?.imageUrl} 
                    alt={`Кадр ${currentRightFrame + 1} от ${rightDate.toDateString()}`}
                    className="comparison-image"
                  />
                  <div className="frame-controls">
                    <input 
                      type="range" 
                      min="0" 
                      max={rightFrames.length - 1} 
                      value={currentRightFrame}
                      onChange={(e) => setCurrentRightFrame(parseInt(e.target.value))}
                      className="frame-slider"
                    />
                    <span className="modal-frame-info">{currentRightFrame + 1} / {rightFrames.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="analysis-view">
              {!analysisResults && !isAnalyzing && (
                <div className="analysis-start">
                  <div className="analysis-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h3>AI Анализ прогресса строительства</h3>
                  <p>
                    Искусственный интеллект проанализирует изменения между двумя датами и выявит:
                  </p>
                  <ul>
                    <li>Ключевые изменения в строительстве</li>
                    <li>Процент выполненных работ</li>
                    <li>Проблемные участки</li>
                    <li>Рекомендации по оптимизации</li>
                  </ul>
                  <button className="start-analysis-button" onClick={handleStartAnalysis}>
                    <i className="fas fa-play"></i>
                    Запустить анализ
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="analysis-loading">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                  <h3>Анализ в процессе...</h3>
                  <p>AI обрабатывает изображения и данные строительства</p>
                </div>
              )}

              {analysisResults && (
                <div className="analysis-results">
                  <div className="progress-summary">
                    <h3>Общий прогресс: {analysisResults.overallProgress}%</h3>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${analysisResults.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="key-changes">
                    <h4>Ключевые изменения</h4>
                    {analysisResults.keyChanges.map(change => (
                      <div key={change.id} className={`change-item ${change.impact}`}>
                        <div className="change-header">
                          <h5>{change.title}</h5>
                          <span className={`impact-badge ${change.impact}`}>
                            {change.impact === 'high' ? 'Высокий' : 'Средний'} приоритет
                          </span>
                        </div>
                        <p>{change.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="timeline-info">
                    <h4>Прогноз завершения</h4>
                    <p>
                      Ожидаемое завершение: <strong>{analysisResults.timeline.estimatedCompletion}</strong>
                    </p>
                    <p>
                      Опережение графика: <strong>{analysisResults.timeline.daysAhead} дней</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="statistics-view">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-tasks"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Выполнено задач</h3>
                    <span className="stat-number">{leftAnalysis.filter(s => s.status === 'completed').length} → {rightAnalysis.filter(s => s.status === 'completed').length}</span>
                    <span className="stat-change positive">
                      +{rightAnalysis.filter(s => s.status === 'completed').length - leftAnalysis.filter(s => s.status === 'completed').length}
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h3>В работе</h3>
                    <span className="stat-number">{leftAnalysis.filter(s => s.status === 'in_progress').length} → {rightAnalysis.filter(s => s.status === 'in_progress').length}</span>
                    <span className="stat-change neutral">
                      {rightAnalysis.filter(s => s.status === 'in_progress').length - leftAnalysis.filter(s => s.status === 'in_progress').length >= 0 ? '+' : ''}{rightAnalysis.filter(s => s.status === 'in_progress').length - leftAnalysis.filter(s => s.status === 'in_progress').length}
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Запланировано</h3>
                    <span className="stat-number">{leftAnalysis.filter(s => s.status === 'planned').length} → {rightAnalysis.filter(s => s.status === 'planned').length}</span>
                    <span className="stat-change negative">
                      {rightAnalysis.filter(s => s.status === 'planned').length - leftAnalysis.filter(s => s.status === 'planned').length}
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-road"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Общая протяженность</h3>
                    <span className="stat-number">1.56 км</span>
                    <span className="stat-label">участка дороги</span>
                  </div>
                </div>
              </div>

              <div className="comparison-timeline">
                <h4>Временная шкала изменений</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">{leftDate.toLocaleDateString('ru-RU')}</div>
                    <div className="timeline-content">
                      <h5>Подготовительный этап</h5>
                      <p>Разметка территории, снятие растительного слоя</p>
                    </div>
                  </div>
                  <div className="timeline-connector"></div>
                  <div className="timeline-item">
                    <div className="timeline-date">{rightDate.toLocaleDateString('ru-RU')}</div>
                    <div className="timeline-content">
                      <h5>Основные работы</h5>
                      <p>Земляные работы, дренаж, начало асфальтирования</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DateComparisonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  leftDate: PropTypes.instanceOf(Date),
  rightDate: PropTypes.instanceOf(Date),
  generateFramesForDate: PropTypes.func.isRequired,
  getAnalysisSegmentsByDate: PropTypes.func.isRequired
};

export default DateComparisonModal;
