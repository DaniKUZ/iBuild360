import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Импортируем компоненты из просмотра 360
import DateSelector from '../../Viewer360/components/DateSelector/DateSelector';
import VideoControls from '../../Viewer360/components/VideoControls/VideoControls';

// Моковые данные для видео дороги
const mockRoadData = {
  frames: [
    // Используем 21 загруженный кадр
    ...Array.from({ length: 21 }, (_, index) => ({
      id: index,
      imageUrl: require(`../../../data/img/roadImg${index + 1}.PNG`),
      timestamp: index * 9.5, // секунды (3:18 / 21 кадр ≈ 9.5 сек на кадр)
      distance: Math.round(index * 16.67), // метры
    }))
  ],
  totalFrames: 21, // 21 реальный кадр из видео
  frameInterval: 9.5, // секунд между кадрами
  dates: [
    { date: '2025-07-14', label: '14 июля 2025', available: true }
  ],
  analysisSegments: [
    { id: 0, frameIndex: 0, distance: '0м', title: 'Кадр 1', description: 'Начальная точка участка дороги', status: 'completed' },
    { id: 1, frameIndex: 1, distance: '79м', title: 'Кадр 2', description: 'Земляные работы в процессе', status: 'in_progress' },
    { id: 2, frameIndex: 2, distance: '158м', title: 'Кадр 3', description: 'Подготовка основания', status: 'completed' },
    { id: 3, frameIndex: 3, distance: '237м', title: 'Кадр 4', description: 'Укладка щебёночного слоя', status: 'in_progress' },
    { id: 4, frameIndex: 4, distance: '317м', title: 'Кадр 5', description: 'Уплотнение основания', status: 'completed' },
    { id: 5, frameIndex: 5, distance: '396м', title: 'Кадр 6', description: 'Дренажные работы', status: 'in_progress' },
    { id: 6, frameIndex: 6, distance: '475м', title: 'Кадр 7', description: 'Водоотводные системы', status: 'completed' },
    { id: 7, frameIndex: 7, distance: '554м', title: 'Кадр 8', description: 'Подготовка к асфальтированию', status: 'in_progress' },
    { id: 8, frameIndex: 8, distance: '633м', title: 'Кадр 9', description: 'Укладка первого слоя асфальта', status: 'planned' },
    { id: 9, frameIndex: 9, distance: '712м', title: 'Кадр 10', description: 'Выравнивание покрытия', status: 'planned' },
    { id: 10, frameIndex: 10, distance: '791м', title: 'Кадр 11', description: 'Уплотнение асфальта', status: 'planned' },
    { id: 11, frameIndex: 11, distance: '870м', title: 'Кадр 12', description: 'Контроль качества покрытия', status: 'planned' },
    { id: 12, frameIndex: 12, distance: '950м', title: 'Кадр 13', description: 'Подготовка второго слоя', status: 'planned' },
    { id: 13, frameIndex: 13, distance: '1029м', title: 'Кадр 14', description: 'Укладка верхнего слоя', status: 'planned' },
    { id: 14, frameIndex: 14, distance: '1108м', title: 'Кадр 15', description: 'Финишное выравнивание', status: 'planned' },
    { id: 15, frameIndex: 15, distance: '1187м', title: 'Кадр 16', description: 'Проверка ровности покрытия', status: 'planned' },
    { id: 16, frameIndex: 16, distance: '1266м', title: 'Кадр 17', description: 'Подготовка к разметке', status: 'planned' },
    { id: 17, frameIndex: 17, distance: '1345м', title: 'Кадр 18', description: 'Нанесение дорожной разметки', status: 'planned' },
    { id: 18, frameIndex: 18, distance: '1424м', title: 'Кадр 19', description: 'Установка дорожных знаков', status: 'planned' },
    { id: 19, frameIndex: 19, distance: '1504м', title: 'Кадр 20', description: 'Монтаж освещения', status: 'planned' },
    { id: 20, frameIndex: 20, distance: '1583м', title: 'Кадр 21', description: 'Завершение работ на участке', status: 'planned' }
  ]
};

function RoadVideoSection() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-14'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);

  // Вычисляем текущее время на основе кадра
  useEffect(() => {
    setCurrentTime(currentFrame * mockRoadData.frameInterval);
  }, [currentFrame]);

  // Навигация по кадрам
  const goToPreviousFrame = useCallback(() => {
    setCurrentFrame(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextFrame = useCallback(() => {
    setCurrentFrame(prev => Math.min(mockRoadData.totalFrames - 1, prev + 1));
  }, []);

  const goToFirstFrame = useCallback(() => {
    setCurrentFrame(0);
  }, []);

  const goToLastFrame = useCallback(() => {
    setCurrentFrame(mockRoadData.totalFrames - 1);
  }, []);

  // Обработчик смены даты
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    // Сбрасываем кадр при смене даты
    setCurrentFrame(0);
  }, []);

  // Функция проверки доступности даты
  const isDateAvailable = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];
    return mockRoadData.dates.some(d => d.date === dateString && d.available);
  }, []);

  // Получаем доступные даты
  const availableDates = mockRoadData.dates
    .filter(d => d.available)
    .map(d => new Date(d.date));

  // Обработчики воспроизведения
  const handlePlay = useCallback(() => {
    setIsVideoPlaying(true);
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1;
        if (nextFrame >= mockRoadData.totalFrames) {
          setIsVideoPlaying(false);
          clearInterval(interval);
          return 0; // Возвращаемся к началу
        }
        return nextFrame;
      });
    }, 2000); // Каждые 2 секунды
    setPlayInterval(interval);
  }, []);

  const handlePause = useCallback(() => {
    setIsVideoPlaying(false);
    if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }
  }, [playInterval]);

  // Очищаем интервал при размонтировании
  useEffect(() => {
    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [playInterval]);

  // Запуск AI анализа
  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setShowAnalysis(false);
    setAnalysisResults([]);
    
    // Имитация загрузки
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysis(true);
      setAnalysisResults(mockRoadData.analysisSegments);
    }, 2000);
  }, []);

  // Переход к кадру по клику на сегмент анализа
  const handleSegmentClick = useCallback((segment) => {
    setCurrentFrame(segment.frameIndex);
    // Останавливаем воспроизведение если оно активно
    if (isVideoPlaying) {
      handlePause();
    }
  }, [isVideoPlaying, handlePause]);

  // Получение статуса цвета
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'var(--success-color)';
      case 'in_progress': return 'var(--warning-color)';
      case 'planned': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  }, []);

  // Получение иконки статуса
  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'in_progress': return 'fas fa-clock';
      case 'planned': return 'fas fa-circle';
      default: return 'fas fa-circle';
    }
  }, []);

  // Форматирование времени
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Форматирование расстояния на основе времени
  const formatDistance = useCallback((seconds) => {
    // Предполагаем скорость ~30 км/ч = 8.33 м/с
    const meters = Math.round(seconds * 8.33);
    return `${meters} м`;
  }, []);

  return (
    <div className="road-video-section">
      {/* Заголовок секции */}
      <div className="section-header">
        <h2>Видеообзор дорожного участка</h2>
        <p className="section-description">
          Просмотр видеосъемки строительства дороги по кадрам с возможностью анализа прогресса работ
        </p>
      </div>



      {/* Видеоплеер */}
      <div className="video-player-section">
        <div className="video-container">
          <div className="road-frame-container">
            <img
              key={`frame-${currentFrame}`}
              src={mockRoadData.frames[currentFrame]?.imageUrl}
              alt={`Кадр дороги ${currentFrame + 1} - ${mockRoadData.frames[currentFrame]?.description}`}
              className="road-frame-image"
              style={{
                transition: 'all 0.3s ease'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="road-video-placeholder" style={{ display: 'none' }}>
              <div className="placeholder-content">
                <i className="fas fa-video placeholder-icon"></i>
                <p>Кадр {currentFrame + 1} из {mockRoadData.totalFrames}</p>
                <p className="distance-info">{formatDistance(currentTime)}</p>
              </div>
            </div>
          </div>
          
          {/* Overlay с информацией */}
          <div className="video-overlay">
            <div className="frame-info">
              <span className="frame-counter">Кадр {currentFrame + 1} из {mockRoadData.totalFrames}</span>
              <span className="distance-info">{formatDistance(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Комбинированное управление */}
        <div className="combined-controls">
          {/* Выбор даты слева */}
          <div className="date-control">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              availableDates={availableDates}
              isDateAvailable={isDateAvailable}
              dropdownPosition="top"
            />
          </div>
          
          {/* Стрелки навигации */}
          <div className="navigation-controls">
            <VideoControls
              isPlaying={isVideoPlaying}
              shootingTime={null}
              onPlay={handlePlay}
              onPause={handlePause}
              onFirstFrame={goToFirstFrame}
              onPreviousFrame={goToPreviousFrame}
              onNextFrame={goToNextFrame}
              onLastFrame={goToLastFrame}
            />
          </div>
        </div>
        
        {/* Прогресс-бар */}
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={mockRoadData.totalFrames - 1}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
            className="progress-slider"
          />
        </div>
      </div>

      {/* AI Анализ */}
      <div className="ai-analysis-section">
        <div className="analysis-header">
          <h3>AI Анализ прогресса работ</h3>
          <button 
            className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Анализирую...
              </>
            ) : (
              <>
                <i className="fas fa-robot"></i>
                Анализировать видео
              </>
            )}
          </button>
        </div>

        {showAnalysis && analysisResults.length > 0 && (
          <div className="analysis-result">
            <div className="analysis-segments">
              {analysisResults.map((segment) => (
                <div 
                  key={segment.id}
                  className={`analysis-segment ${currentFrame === segment.frameIndex ? 'active' : ''}`}
                  onClick={() => handleSegmentClick(segment)}
                >
                  <div className="segment-header">
                    <div className="segment-image">
                      <img 
                        src={mockRoadData.frames[segment.frameIndex]?.imageUrl} 
                        alt={`Кадр ${segment.frameIndex + 1}`}
                        className="segment-thumbnail"
                      />
                    </div>
                    <div className="segment-info">
                      <div className="segment-distance">{segment.distance}</div>
                      <div className="segment-title">{segment.title}</div>
                      <div 
                        className="segment-status"
                        style={{ color: getStatusColor(segment.status) }}
                      >
                        <i className={getStatusIcon(segment.status)}></i>
                        {segment.status === 'completed' && 'Завершено'}
                        {segment.status === 'in_progress' && 'В работе'}
                        {segment.status === 'planned' && 'Запланировано'}
                      </div>
                    </div>
                  </div>
                  <div className="segment-description">
                    {segment.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showAnalysis && !isAnalyzing && (
          <div className="analysis-placeholder">
            <i className="fas fa-robot analysis-icon"></i>
            <p>Нажмите кнопку "Анализировать видео" для получения детального анализа прогресса работ по участкам дороги</p>
          </div>
        )}
      </div>


    </div>
  );
}

RoadVideoSection.propTypes = {
  // Пока без пропсов, но можно добавить в будущем
};

export default RoadVideoSection;