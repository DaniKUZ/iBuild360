import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import test from '../data/img/test.jpg';
import styles from './Viewer360.module.css';

const Viewer360 = ({ project, onBack }) => {
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  
  const panoramaRef = useRef(null);
  const comparisonPanoramaRef = useRef(null);
  const viewerInstance = useRef(null);
  const comparisonViewerInstance = useRef(null);
  const syncHandlersRef = useRef([]);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Главная', action: onBack },
    { id: 'layers', icon: 'fas fa-layer-group', label: 'Слои' },
    { id: 'video360', icon: 'fas fa-video', label: 'Видео 360°' },
    { id: 'schedule', icon: 'fas fa-calendar-alt', label: 'План-график' },
    { id: 'measure', icon: 'fas fa-ruler', label: 'Измерения' },
    { id: 'comments', icon: 'fas fa-comments', label: 'Комментарии' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Настройки' },
    { id: 'fullscreen', icon: 'fas fa-expand', label: 'Полный экран' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Помощь' },
  ];

  // Навигационные точки для нижнего сайдбара
  const navigationPoints = [
    { id: 1, label: 'Главная комната', yaw: 0, pitch: 0 },
    { id: 2, label: 'Кухня', yaw: 90, pitch: -10 },
    { id: 3, label: 'Спальня', yaw: 180, pitch: 0 },
    { id: 4, label: 'Ванная', yaw: -90, pitch: 5 },
  ];

  // Инициализация основного панорамного просмотрщика
  useEffect(() => {
    const initPannellum = () => {
      if (panoramaRef.current && !viewerInstance.current && window.pannellum) {
        try {
                    viewerInstance.current = window.pannellum.viewer(panoramaRef.current, {
            type: 'equirectangular',
            panorama: test,
            autoLoad: true,
            autoRotate: 0, // Убираем автопрокрутку
            showZoomCtrl: false,
            showFullscreenCtrl: false,
            yaw: 0,
            pitch: 0,
            hfov: 100,
            minHfov: 30,
            maxHfov: 130,
            minPitch: -120, // Увеличиваем диапазон вертикального поворота
            maxPitch: 120,  // Увеличиваем диапазон вертикального поворота
            compass: false,
            northOffset: 0,
            mouseZoom: true,
            doubleClickZoom: true,
            keyboardZoom: true,
            draggable: true,
            disableKeyboardCtrl: false,
            hotSpots: []
          });

        // Отслеживание изменений угла обзора
        const updateAngles = () => {
          if (viewerInstance.current) {
            const yaw = viewerInstance.current.getYaw();
            const pitch = viewerInstance.current.getPitch();
            setCurrentYaw(yaw);
            setCurrentPitch(pitch);
          }
        };

        viewerInstance.current.on('animatefinished', updateAngles);
        viewerInstance.current.on('mouseup', updateAngles);
        viewerInstance.current.on('zoom', updateAngles);

              } catch (error) {
          console.error('Ошибка инициализации Pannellum:', error);
        }
      }
    };

    // Проверяем наличие Pannellum или ждем его загрузки
    if (window.pannellum) {
      initPannellum();
    } else {
      const checkPannellum = setInterval(() => {
        if (window.pannellum) {
          clearInterval(checkPannellum);
          initPannellum();
        }
      }, 100);

      return () => clearInterval(checkPannellum);
    }

    return () => {
      if (viewerInstance.current) {
        try {
          viewerInstance.current.destroy();
          viewerInstance.current = null;
        } catch (error) {
          console.error('Ошибка при уничтожении Pannellum viewer:', error);
        }
      }
    };
  }, []);

  // Инициализация сравнительного панорамного просмотрщика
  useEffect(() => {
    // Очищаем предыдущие обработчики
    const clearSyncHandlers = () => {
      if (syncHandlersRef.current.length > 0) {
        syncHandlersRef.current.forEach(({ viewer, event, handler }) => {
          if (viewer && typeof viewer.off === 'function') {
            try {
              viewer.off(event, handler);
            } catch (error) {
              console.warn('Ошибка при удалении обработчика:', error);
            }
          }
        });
        syncHandlersRef.current = [];
      }
    };

    if (isComparisonMode && comparisonPanoramaRef.current && !comparisonViewerInstance.current && window.pannellum) {
      try {
        comparisonViewerInstance.current = window.pannellum.viewer(comparisonPanoramaRef.current, {
          type: 'equirectangular',
          panorama: test,
          autoLoad: true,
          autoRotate: 0,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          yaw: currentYaw,
          pitch: currentPitch,
          hfov: viewerInstance.current ? viewerInstance.current.getHfov() : 100,
          minHfov: 30,
          maxHfov: 130,
          minPitch: -85,
          maxPitch: 85,
          compass: false,
          mouseZoom: true,
          doubleClickZoom: true,
          keyboardZoom: true,
          draggable: true,
          disableKeyboardCtrl: false,
          filter: 'sepia(30%) brightness(80%)',
          hotSpots: []
        });

        // Улучшенная синхронизация движения с основным viewer
        if (viewerInstance.current && comparisonViewerInstance.current) {
          const syncFromMainToComparison = () => {
            if (viewerInstance.current && comparisonViewerInstance.current) {
              try {
                const mainYaw = viewerInstance.current.getYaw();
                const mainPitch = viewerInstance.current.getPitch();
                const mainHfov = viewerInstance.current.getHfov();
                
                comparisonViewerInstance.current.setYaw(mainYaw);
                comparisonViewerInstance.current.setPitch(mainPitch);
                comparisonViewerInstance.current.setHfov(mainHfov);
              } catch (error) {
                console.warn('Ошибка синхронизации:', error);
              }
            }
          };

          const syncFromComparisonToMain = () => {
            if (viewerInstance.current && comparisonViewerInstance.current) {
              try {
                const compYaw = comparisonViewerInstance.current.getYaw();
                const compPitch = comparisonViewerInstance.current.getPitch();
                const compHfov = comparisonViewerInstance.current.getHfov();
                
                viewerInstance.current.setYaw(compYaw);
                viewerInstance.current.setPitch(compPitch);
                viewerInstance.current.setHfov(compHfov);
              } catch (error) {
                console.warn('Ошибка синхронизации:', error);
              }
            }
          };

          // Добавляем обработчики для основного viewer'а
          viewerInstance.current.on('mouseup', syncFromMainToComparison);
          viewerInstance.current.on('animatefinished', syncFromMainToComparison);
          viewerInstance.current.on('zoom', syncFromMainToComparison);

          // Добавляем обработчики для сравнительного viewer'а
          comparisonViewerInstance.current.on('mouseup', syncFromComparisonToMain);
          comparisonViewerInstance.current.on('animatefinished', syncFromComparisonToMain);
          comparisonViewerInstance.current.on('zoom', syncFromComparisonToMain);

          // Сохраняем ссылки на обработчики для очистки
          syncHandlersRef.current = [
            { viewer: viewerInstance.current, event: 'mouseup', handler: syncFromMainToComparison },
            { viewer: viewerInstance.current, event: 'animatefinished', handler: syncFromMainToComparison },
            { viewer: viewerInstance.current, event: 'zoom', handler: syncFromMainToComparison },
            { viewer: comparisonViewerInstance.current, event: 'mouseup', handler: syncFromComparisonToMain },
            { viewer: comparisonViewerInstance.current, event: 'animatefinished', handler: syncFromComparisonToMain },
            { viewer: comparisonViewerInstance.current, event: 'zoom', handler: syncFromComparisonToMain }
          ];
        }

      } catch (error) {
        console.error('Ошибка инициализации сравнительного Pannellum:', error);
      }
    } else if (!isComparisonMode && comparisonViewerInstance.current) {
      try {
        // Очищаем все обработчики событий перед уничтожением
        clearSyncHandlers();

        comparisonViewerInstance.current.destroy();
        comparisonViewerInstance.current = null;
      } catch (error) {
        console.error('Ошибка при уничтожении сравнительного viewer:', error);
      }
    }

    // Cleanup функция
    return () => {
      clearSyncHandlers();
    };
  }, [isComparisonMode, currentYaw, currentPitch]);

  // Обработчик клика по пункту сайдбара
  const handleSidebarClick = (item) => {
    console.log('Клик по пункту сайдбара:', item.label);
    if (item.action) {
      item.action();
    } else if (item.id === 'fullscreen') {
      if (viewerInstance.current) {
        viewerInstance.current.toggleFullscreen();
      }
    } else if (item.id === 'video360') {
      // Открыть панель управления видео 360°
      console.log('Открыть видео 360°');
      // TODO: Реализовать открытие панели с видео 360°
    } else if (item.id === 'schedule') {
      // Открыть план-график работ
      console.log('Открыть план-график');
      // TODO: Реализовать открытие панели с планом-графиком
    } else if (item.id === 'settings') {
      // Настройки - можно добавить другие функции
      console.log('Открыть настройки');
    }
  };

  // Обработчик клика по навигационной точке
  const handleNavigationClick = (point) => {
    console.log('Переход к точке:', point.label);
    if (viewerInstance.current) {
      viewerInstance.current.lookAt(point.yaw, point.pitch, 100, 1000);
    }
    if (comparisonViewerInstance.current) {
      comparisonViewerInstance.current.lookAt(point.yaw, point.pitch, 100, 1000);
    }
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
    <div className={styles.viewer360}>
      {/* Сайдбар слева */}
      <div className={styles.viewerSidebar}>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={styles.sidebarItem}
            onClick={() => handleSidebarClick(item)}
            onMouseEnter={() => setHoveredSidebarItem(item.id)}
            onMouseLeave={() => setHoveredSidebarItem(null)}
            aria-label={item.label}
          >
            <i className={item.icon} aria-hidden="true"></i>
            {hoveredSidebarItem === item.id && (
              <div className={styles.tooltip} role="tooltip">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Основная область просмотра */}
      <div className={styles.viewerMain}>
        {/* Панорамные изображения */}
        <div className={`${styles.panoramaSection} ${isComparisonMode ? styles.comparisonMode : ''}`}>
          {/* Первое изображение */}
          <div className={styles.panoramaWrapper}>
            <div 
              className={styles.panoramaContainer}
              ref={panoramaRef}
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Сайдбар для первого изображения */}
            <div className={styles.bottomSidebar}>
              <div className={styles.sidebarLeft}>
                <div className={styles.rotationIndicator}>
                  <span>{Math.round(((currentYaw % 360) + 360) % 360)}°</span>
                </div>
                <div className={styles.navigationPoints}>
                  {navigationPoints.map((point) => (
                    <button
                      key={point.id}
                      className={styles.navPoint}
                      onClick={() => handleNavigationClick(point)}
                      title={point.label}
                    >
                      <span>{point.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className={styles.comparisonBtn}
                onClick={handleComparisonToggle}
                title="Сравнение по датам"
              >
                <i className="fas fa-calendar-alt"></i>
              </button>
            </div>
          </div>

          {/* Второе изображение (только в режиме сравнения) */}
          {isComparisonMode && (
            <div className={styles.panoramaWrapper}>
              <div 
                className={`${styles.panoramaContainer} ${styles.comparisonImage}`}
                ref={comparisonPanoramaRef}
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Сайдбар для второго изображения */}
              <div className={`${styles.bottomSidebar} ${styles.comparisonSidebar}`}>
                <div className={styles.sidebarLeft}>
                  <div className={styles.rotationIndicator}>
                    <span>{Math.round(((currentYaw % 360) + 360) % 360)}°</span>
                  </div>
                  <div className={styles.navigationPoints}>
                    {navigationPoints.map((point) => (
                      <button
                        key={`comp-${point.id}`}
                        className={styles.navPoint}
                        onClick={() => handleNavigationClick(point)}
                        title={point.label}
                      >
                        <span>{point.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  className={styles.closeComparisonBtn}
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
          <div className={styles.calendarOverlay}>
            <div className={styles.calendarPopup}>
              <div className={styles.calendarHeader}>
                <button 
                  className={styles.calendarNav}
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button 
                  className={styles.calendarNav}
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button 
                  className={styles.calendarClose}
                  onClick={() => setShowDatePicker(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className={styles.calendarWeekdays}>
                {weekDays.map((day) => (
                  <div key={day} className={styles.weekday}>{day}</div>
                ))}
              </div>
              <div className={styles.calendarDays}>
                {generateCalendar().map((day, index) => (
                  <button
                    key={index}
                    className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${day.isToday ? styles.today : ''} ${day.isSelected ? styles.selected : ''}`}
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