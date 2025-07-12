import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import img360 from '../data/img/img360.jpg';

const Viewer360 = ({ project, onBack }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const viewerRef = useRef(null);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Главная', action: onBack },
    { id: 'layers', icon: 'fas fa-layer-group', label: 'Слои' },
    { id: 'measure', icon: 'fas fa-ruler', label: 'Измерения' },
    { id: 'comments', icon: 'fas fa-comments', label: 'Комментарии' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Настройки' },
    { id: 'fullscreen', icon: 'fas fa-expand', label: 'Полный экран' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Помощь' },
  ];

  // Навигационные точки для нижнего сайдбара
  const navigationPoints = [
    { id: 1, label: 'Главная комната' },
    { id: 2, label: 'Кухня' },
    { id: 3, label: 'Спальня' },
    { id: 4, label: 'Ванная' },
  ];

  // Обработчики для вращения панорамы
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const newRotation = rotation + deltaX * 0.5;
    
    setRotation(newRotation);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработчики для touch события
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - dragStart.x;
    const newRotation = rotation + deltaX * 0.5;
    
    setRotation(newRotation);
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Добавляем глобальные обработчики
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragStart, rotation]);

  // Очищаем event listeners при размонтировании компонента
  useEffect(() => {
    return () => {
      setIsDragging(false);
    };
  }, []);

  // Обработчик клика по пункту сайдбара
  const handleSidebarClick = (item) => {
    console.log('Клик по пункту сайдбара:', item.label);
    if (item.action) {
      item.action();
    }
  };

  // Обработчик клика по навигационной точке
  const handleNavigationClick = (point) => {
    console.log('Переход к точке:', point.label);
    // Здесь можно добавить логику перехода к определенной точке
    // Например, изменить rotation или загрузить новое изображение
  };

  // Обработчик переключения режима сравнения
  const handleComparisonToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Обработчик выбора даты
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setIsComparisonMode(true);
    console.log('Выбрана дата:', date);
  };

  // Обработчик закрытия режима сравнения
  const handleCloseComparison = () => {
    setIsComparisonMode(false);
    setSelectedDate('');
  };

  // Генерация календаря
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate === date.toISOString().split('T')[0];
      
      days.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="viewer-360">
      {/* Сайдбар слева */}
      <div className="viewer-sidebar">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className="sidebar-item"
            onClick={() => handleSidebarClick(item)}
            title={item.label}
          >
            <i className={item.icon}></i>
          </button>
        ))}
      </div>

      {/* Основная область просмотра */}
      <div className="viewer-main">
        {/* Панорамные изображения */}
        <div className={`panorama-section ${isComparisonMode ? 'comparison-mode' : ''}`}>
          {/* Первое изображение */}
          <div 
            className="panorama-container"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div 
              className="panorama-image"
              style={{
                transform: `rotateY(${rotation}deg)`,
                backgroundImage: `url(${img360})`
              }}
            />
            
            {/* Сайдбар для первого изображения */}
            <div className="bottom-sidebar">
              <div className="sidebar-left">
                <div className="rotation-indicator">
                  <span>{Math.round(((rotation % 360) + 360) % 360)}°</span>
                </div>
                <div className="navigation-points">
                  {navigationPoints.map((point) => (
                    <button
                      key={point.id}
                      className="nav-point"
                      onClick={() => handleNavigationClick(point)}
                      title={point.label}
                    >
                      <span>{point.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="comparison-btn"
                onClick={handleComparisonToggle}
                title="Сравнение по датам"
              >
                <i className="fas fa-calendar-alt"></i>
              </button>
            </div>
          </div>

          {/* Второе изображение (только в режиме сравнения) */}
          {isComparisonMode && (
            <div 
              className="panorama-container comparison-image"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div 
                className="panorama-image"
                style={{
                  transform: `rotateY(${rotation}deg)`,
                  backgroundImage: `url(${img360})`,
                  filter: 'sepia(0.3) brightness(0.8)'
                }}
              />
              
              {/* Сайдбар для второго изображения */}
              <div className="bottom-sidebar comparison-sidebar">
                <div className="sidebar-left">
                  <div className="rotation-indicator">
                    <span>{Math.round(((rotation % 360) + 360) % 360)}°</span>
                  </div>
                  <div className="navigation-points">
                    {navigationPoints.map((point) => (
                      <button
                        key={`comp-${point.id}`}
                        className="nav-point"
                        onClick={() => handleNavigationClick(point)}
                        title={point.label}
                      >
                        <span>{point.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  className="close-comparison-btn"
                  onClick={handleCloseComparison}
                  title="Закрыть сравнение"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Календарь */}
        {showDatePicker && (
          <div className="calendar-overlay">
            <div className="calendar-popup">
              <div className="calendar-header">
                <button 
                  className="calendar-nav"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button 
                  className="calendar-nav"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button 
                  className="calendar-close"
                  onClick={() => setShowDatePicker(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="calendar-weekdays">
                {weekDays.map((day) => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {generateCalendar().map((day, index) => (
                  <button
                    key={index}
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                    onClick={() => handleDateSelect(day.dateString)}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

Viewer360.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    preview: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default Viewer360; 