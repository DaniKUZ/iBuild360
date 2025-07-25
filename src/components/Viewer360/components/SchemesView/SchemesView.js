import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './SchemesView.module.css';

const SchemesView = ({ project }) => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [capturedDates, setCapturedDates] = useState(new Set());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Устанавливаем первую схему по умолчанию
  useEffect(() => {
    if (project?.floors && project.floors.length > 0 && !selectedFloor) {
      setSelectedFloor(project.floors[0]);
    }
  }, [project, selectedFloor]);

  // Генерируем случайные даты с захватами при смене месяца
  useEffect(() => {
    const generateCapturedDates = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const captured = new Set();
      // Генерируем 5-8 случайных дат с захватами
      const numCapturedDays = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < numCapturedDays; i++) {
        const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
        captured.add(randomDay);
      }
      
      setCapturedDates(captured);
    };

    generateCapturedDates();
  }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

  // Фильтрация схем по поисковому запросу
  const filteredFloors = project?.floors?.filter(floor =>
    floor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    floor.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Обработчики зума
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(5, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.2));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Обработчики перетаскивания
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      
      setImagePosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработчик колеса мыши для зума
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Подписка на события мыши
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isDragging, zoomLevel]);

  // Функции для календаря
  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateSelect = (day) => {
    if (day) {
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      setSelectedDate(newDate);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const handleDayHover = (day, event) => {
    if (day && capturedDates.has(day)) {
      const rect = event.target.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
      setHoveredDay(day);
    } else {
      setHoveredDay(null);
    }
  };

  if (!project?.floors || project.floors.length === 0) {
    return (
      <div className={styles.schemesView}>
        <div className={styles.emptyState}>
          <i className="fas fa-layer-group"></i>
          <h3>Схемы отсутствуют</h3>
          <p>В этом проекте пока нет добавленных схем этажей</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.schemesView}>
      {/* Панель управления */}
      <div className={styles.controlPanel}>
        <div className={styles.controlLeft}>
          <div className={styles.searchBox}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск схем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className={styles.controlRight}>
          <div className={styles.zoomControls}>
            <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <i className="fas fa-minus"></i>
            </button>
            <span className={styles.zoomLevel}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={handleZoomIn} disabled={zoomLevel >= 5}>
              <i className="fas fa-plus"></i>
            </button>
            <button onClick={handleZoomReset}>
              <i className="fas fa-expand-arrows-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Карточки схем сверху */}
      <div className={styles.schemesCards}>
        <div className={styles.cardsHeader}>
          <h3>Схемы этажей</h3>
          <span className={styles.cardsCount}>
            {filteredFloors.length} из {project.floors.length}
          </span>
        </div>
        
        <div className={styles.cardsContainer}>
          {filteredFloors.map((floor) => (
            <div
              key={floor.id}
              className={`${styles.schemeCard} ${selectedFloor?.id === floor.id ? styles.active : ''}`}
              onClick={() => {
                setSelectedFloor(floor);
                setZoomLevel(1);
                setImagePosition({ x: 0, y: 0 });
              }}
            >
              <div className={styles.cardThumbnail}>
                <img src={floor.thumbnail} alt={floor.name} />
                {selectedFloor?.id === floor.id && (
                  <div className={styles.selectedOverlay}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                )}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{floor.name}</div>
                <div className={styles.cardDescription}>{floor.description}</div>
              </div>
            </div>
          ))}
        </div>

        {filteredFloors.length === 0 && searchQuery && (
          <div className={styles.noResults}>
            <i className="fas fa-search"></i>
            <p>По запросу "{searchQuery}" ничего не найдено</p>
          </div>
        )}
      </div>

      {/* Основная область просмотра схемы */}
      <div className={styles.schemeViewer}>
        {selectedFloor ? (
          <div 
            ref={containerRef}
            className={styles.imageContainer}
            onMouseDown={handleMouseDown}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              ref={imageRef}
              src={selectedFloor.fullImage}
              alt={selectedFloor.name}
              className={styles.schemeImage}
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
            
            {/* Информация о схеме */}
            <div className={styles.schemeInfo}>
              <h4>{selectedFloor.name}</h4>
              <p>{selectedFloor.description}</p>
            </div>
          </div>
        ) : (
          <div className={styles.noSchemeSelected}>
            <i className="fas fa-layer-group"></i>
            <h4>Выберите схему</h4>
            <p>Выберите схему этажа из карточек выше для просмотра</p>
          </div>
        )}
      </div>

      {/* Календарь снизу */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarTitle}>
            <i className="fas fa-calendar-alt"></i>
            <span>Календарь проекта</span>
          </div>
          <div className={styles.selectedDateDisplay}>
            <span>Выбранная дата: {formatDate(selectedDate)}</span>
            <button 
              className={styles.calendarToggle}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <i className={`fas fa-chevron-${showCalendar ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className={styles.calendar}>
            <div className={styles.calendarNav}>
              <button onClick={() => navigateMonth(-1)}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <h4>
                {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </h4>
              <button onClick={() => navigateMonth(1)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div className={styles.calendarGrid}>
              <div className={styles.weekdays}>
                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
                  <div key={day} className={styles.weekday}>{day}</div>
                ))}
              </div>
              
              <div className={styles.days}>
                {generateCalendar().map((day, index) => {
                  const hasCaptured = day && capturedDates.has(day);
                  return (
                    <div key={index} className={styles.dayWrapper}>
                      <button
                        className={`${styles.day} ${
                          day === selectedDate.getDate() ? styles.selectedDay : ''
                        } ${!day ? styles.emptyDay : ''} ${
                          hasCaptured ? styles.capturedDay : ''
                        }`}
                        onClick={() => handleDateSelect(day)}
                        disabled={!day}
                        onMouseEnter={(e) => handleDayHover(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {day}
                        {hasCaptured && (
                          <div className={styles.captureIndicator}>
                            <i className="fas fa-camera"></i>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Глобальный тултип */}
              {hoveredDay && (
                <div 
                  className={styles.captureTooltip}
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className={styles.tooltipContent}>
                    <i className="fas fa-camera"></i>
                    <span>Загрузка захватов</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SchemesView.propTypes = {
  project: PropTypes.object.isRequired
};

export default SchemesView; 