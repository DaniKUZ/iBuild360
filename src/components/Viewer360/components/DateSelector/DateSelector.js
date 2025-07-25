import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './DateSelector.module.css';

const DateSelector = ({ selectedDate, onDateChange, disabled = false, availableDates = [], isDateAvailable, getWorkersCount }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(selectedDate || new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const calendarRef = useRef(null);

  // Закрытие календаря при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const formatDate = (date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('ru-RU', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  const generateCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
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
      const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
      
      // Проверяем доступность даты, если передана функция проверки
      if (isDateAvailable && !isDateAvailable(newDate)) {
        return; // Не разрешаем выбор недоступной даты
      }
      
      setCalendarDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
      setShowCalendar(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(calendarDate.getMonth() + direction);
    setCalendarDate(newDate);
  };

  const toggleCalendar = () => {
    if (!disabled) {
      setShowCalendar(!showCalendar);
    }
  };

  const getNextAvailableDate = (currentDate, direction) => {
    if (!availableDates.length) return null;
    
    const sortedDates = [...availableDates].sort((a, b) => a.getTime() - b.getTime());
    const currentIndex = sortedDates.findIndex(date => 
      date.toDateString() === currentDate.toDateString()
    );
    
    if (currentIndex === -1) return sortedDates[0];
    
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < sortedDates.length) {
      return sortedDates[nextIndex];
    }
    
    return null;
  };

  const handlePreviousDay = (e) => {
    e.stopPropagation();
    if (!disabled) {
      const prevDate = getNextAvailableDate(currentDate, -1);
      if (prevDate && onDateChange) {
        onDateChange(prevDate);
      }
    }
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    if (!disabled) {
      const nextDate = getNextAvailableDate(currentDate, 1);
      if (nextDate && onDateChange) {
        onDateChange(nextDate);
      }
    }
  };

  const isDayAvailable = (day) => {
    if (!day || !isDateAvailable) return true;
    
    const dayDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    return isDateAvailable(dayDate);
  };

  const handleDayHover = (day, event) => {
    if (!day || !getWorkersCount) return;
    
    const dayDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const workersCount = getWorkersCount(dayDate);
    
    if (workersCount > 0) {
      const rect = event.target.getBoundingClientRect();
      setTooltipInfo({
        day,
        workersCount,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    setHoveredDay(day);
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
    setTooltipInfo(null);
  };

  const currentDate = selectedDate || new Date();
  const dateInfo = formatDate(currentDate);

  return (
    <div className={styles.dateSelector} ref={calendarRef}>
      <div 
        className={`${styles.dateButton} ${disabled ? styles.disabled : ''}`}
        onClick={toggleCalendar}
      >
        <div 
          className={`${styles.dateArrow} ${styles.arrowButton} ${disabled || !getNextAvailableDate(currentDate, -1) ? styles.disabled : ''}`}
          onClick={handlePreviousDay}
          title="Предыдущий день"
        >
          <i className="fas fa-chevron-left"></i>
        </div>
        <div className={styles.dateDisplay}>
          <div className={styles.dateDay}>{dateInfo.day}</div>
          <div className={styles.dateMonthYear}>
            <div className={styles.dateMonth}>{dateInfo.month}</div>
            <div className={styles.dateYear}>{dateInfo.year}</div>
          </div>
        </div>
        <div 
          className={`${styles.dateArrow} ${styles.arrowButton} ${disabled || !getNextAvailableDate(currentDate, 1) ? styles.disabled : ''}`}
          onClick={handleNextDay}
          title="Следующий день"
        >
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>

      {showCalendar && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calendarHeader}>
            <button 
              className={styles.navButton}
              onClick={() => navigateMonth(-1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h4 className={styles.monthTitle}>
              {calendarDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </h4>
            <button 
              className={styles.navButton}
              onClick={() => navigateMonth(1)}
            >
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
                const isAvailable = isDayAvailable(day);
                const isSelected = day === currentDate.getDate() && 
                  calendarDate.getMonth() === currentDate.getMonth() && 
                  calendarDate.getFullYear() === currentDate.getFullYear();
                
                return (
                  <button
                    key={index}
                    className={`${styles.day} ${
                      isSelected ? styles.selectedDay : ''
                    } ${!day ? styles.emptyDay : ''} ${
                      !isAvailable ? styles.unavailableDay : ''
                    }`}
                    onClick={() => handleDateSelect(day)}
                    onMouseEnter={(e) => handleDayHover(day, e)}
                    onMouseLeave={handleDayLeave}
                    disabled={!day || !isAvailable}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Тултип для дат с данными */}
      {tooltipInfo && (
        <div 
          className={styles.dayTooltip}
          style={{
            position: 'fixed',
            left: tooltipInfo.x,
            top: tooltipInfo.y,
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          {tooltipInfo.workersCount} рабочих
        </div>
      )}
    </div>
  );
};

DateSelector.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
  disabled: PropTypes.bool,
  availableDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  isDateAvailable: PropTypes.func,
  getWorkersCount: PropTypes.func
};

export default DateSelector; 