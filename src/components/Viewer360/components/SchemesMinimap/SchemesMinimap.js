import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../Viewer360Container.module.css';
import { getAvailableDates } from '../../utils/imageUtils';

const SchemesMinimap = ({
  project,
  viewerState,
  imageManagement,
  splitScreenState,
  getOPImageUrl,
  getOPImageUrlWithFloor,
  handleMinimapToggle,
  schemesMinimapRef,
  minimapRef,
  handleMinimapMouseDown
}) => {
  if (!project?.floors) return null;

  // Данные контрольных точек для каждого этажа
  const floorRouteData = {
    1: {
      points: [
        { id: 1, x: 50, y: 20, name: 'Точка 1' },
        { id: 2, x: 50, y: 35, name: 'Точка 2' },
        { id: 3, x: 50, y: 50, name: 'Точка 3' }
      ],
      routes: [
        { from: 1, to: 2 },
        { from: 2, to: 3 }
      ]
    },
    2: {
      points: [
        { id: 1, x: 50, y: 15, name: 'Точка 1' },
        { id: 2, x: 50, y: 27, name: 'Точка 2' },
        { id: 3, x: 50, y: 39, name: 'Точка 3' },
        { id: 4, x: 50, y: 51, name: 'Точка 4' },
        { id: 5, x: 50, y: 63, name: 'Точка 5' }
      ],
      routes: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 }
      ]
    }
  };

  // Определяем текущий этаж на основе viewerState.selectedScheme
  const getCurrentFloor = () => {
    if (!viewerState.selectedScheme) return 2;
    if (viewerState.selectedScheme.name && viewerState.selectedScheme.name.includes('1-й этаж')) return 1;
    if (viewerState.selectedScheme.id === 1) return 1;
    return 2;
  };

  const currentFloor = getCurrentFloor();
  const currentFloorData = floorRouteData[currentFloor];

  // Обработчик клика по контрольной точке
  const handleRoutePointClick = (pointId) => {
    console.log(`🗺️ handleRoutePointClick вызван для точки ${pointId} на этаже ${currentFloor}`);
    
    // Сразу обновляем индекс изображения без вложенных таймаутов
    imageManagement.setCurrentOPImageIndex(pointId);
    
    // Обновляем изображения в режиме разделения экрана синхронно с точным индексом
    if (splitScreenState.isSplitScreenMode) {
      const leftDate = splitScreenState.leftPanelDate;
      const rightDate = splitScreenState.rightPanelDate;
      
      // Используем функцию с явным указанием этажа и индекса для гарантированной синхронизации
      const currentFloorNum = getCurrentFloor();
      const leftImageUrl = getOPImageUrlWithFloor ? getOPImageUrlWithFloor(leftDate, currentFloorNum, pointId) : getOPImageUrl(leftDate);
      const rightImageUrl = getOPImageUrlWithFloor ? getOPImageUrlWithFloor(rightDate, currentFloorNum, pointId) : getOPImageUrl(rightDate);
      
      splitScreenState.setLeftPanelImage(leftImageUrl);
      splitScreenState.setRightPanelImage(rightImageUrl);
      console.log(`🔄 Синхронно обновлены изображения для точки ${pointId} (левая: ${leftDate.toDateString()}, правая: ${rightDate.toDateString()})`);
    }
  };

  // Функция для создания SVG путей между точками
  const createRoutePath = (route) => {
    const fromPoint = currentFloorData.points.find(p => p.id === route.from);
    const toPoint = currentFloorData.points.find(p => p.id === route.to);
    
    if (!fromPoint || !toPoint) return '';
    
    return `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;
  };

  const filteredSchemes = project.floors.filter(floor => 
    floor.name.toLowerCase().includes(viewerState.schemeSearchQuery.toLowerCase()) ||
    floor.description.toLowerCase().includes(viewerState.schemeSearchQuery.toLowerCase())
  );

  const handleSchemeSelect = (scheme) => {
    console.log(`🏗️ handleSchemeSelect вызван для схемы: ${scheme.name} (ID: ${scheme.id})`);
    viewerState.setSelectedScheme(scheme);
    viewerState.setIsSchemeDropdownOpen(false);
    viewerState.setIsSchemeSearchVisible(false);
    viewerState.setSchemeSearchQuery('');
    
    // Определяем этаж для новой схемы
    let newFloor = 2; // По умолчанию 2-й этаж
    if (scheme.name && scheme.name.includes('1-й этаж')) newFloor = 1;
    if (scheme.id === 1) newFloor = 1;
    
    // Обновляем этаж в imageManagement
    if (imageManagement.changeFloor) {
      imageManagement.changeFloor(newFloor);
      console.log(`📐 Схема изменена на ${scheme.name} (Этаж ${newFloor})`);
      
      // Сбрасываем на 1 кадр при смене схемы (для всех режимов)
      setTimeout(() => {
        imageManagement.setCurrentOPImageIndex(1);
        console.log(`🎬 Сброшен на кадр 1 для схемы ${scheme.name}`);
      }, 0);
    }
    
    // Устанавливаем правильную дату для нового этажа
    let newDate;
    if (newFloor === 1) {
      // Для 1-го этажа используем 21 июля (current)
      newDate = new Date(2025, 6, 21);
    } else {
      // Для 2-го этажа используем 24 июля (current)
      newDate = new Date(2025, 6, 24);
    }
    
    viewerState.setSelectedDate(newDate);
    console.log(`📅 Дата изменена на ${newDate.toDateString()} для этажа ${newFloor}`);
    
    // Обновляем изображения в режиме разделения экрана при смене схемы
    if (splitScreenState.isSplitScreenMode) {
      // Используем новую функцию с явным указанием этажа и кадра 1
      const sameImageUrl = getOPImageUrlWithFloor(newDate, newFloor, 1);
      
      splitScreenState.setLeftPanelImage(sameImageUrl);
      splitScreenState.setRightPanelImage(sameImageUrl);
      splitScreenState.setLeftPanelDate(newDate);
      splitScreenState.setRightPanelDate(newDate);
      
      console.log(`🔄 Синхронно обновлены изображения для схемы ${scheme.name} - обе панели: ${newDate.toDateString()}, этаж ${newFloor}, кадр 1`);
    }
    
    // Сбрасываем зум и позицию при смене схемы
    viewerState.setMinimapZoom(1);
    viewerState.setMinimapPosition({ x: 0, y: 0 });
  };

  const handleDropdownToggle = () => {
    viewerState.setIsSchemeDropdownOpen(!viewerState.isSchemeDropdownOpen);
    if (!viewerState.isSchemeDropdownOpen) {
      viewerState.setIsSchemeSearchVisible(true);
    } else {
      viewerState.setIsSchemeSearchVisible(false);
      viewerState.setSchemeSearchQuery('');
    }
  };

  return (
    <div
      ref={schemesMinimapRef}
      className={`${styles.schemesMinimap} ${viewerState.isMinimapExpanded ? styles.expanded : ''} ${splitScreenState.isSplitScreenMode ? styles.minimapSplitMode : ''}`}
    >
      {/* Заголовок с кнопками */}
      <div className={styles.minimapHeader}>
        <div className={styles.customSelect}>
          <button 
            className={`${styles.selectButton} ${viewerState.isSchemeDropdownOpen ? styles.open : ''}`}
            onClick={handleDropdownToggle}
          >
            <span>{viewerState.selectedScheme ? viewerState.selectedScheme.name : 'Выберите схему'}</span>
            <i className={`fas fa-chevron-down ${viewerState.isSchemeDropdownOpen ? styles.rotated : ''}`}></i>
          </button>
        </div>
        
        {/* Кнопка увеличения */}
        <button
          className={`${styles.minimapExpandButton} ${viewerState.isMinimapExpanded ? styles.expanded : ''}`}
          onClick={handleMinimapToggle}
          title={viewerState.isMinimapExpanded ? 'Свернуть карту' : 'Развернуть карту'}
        >
          <i className={`fas ${viewerState.isMinimapExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
        </button>
      </div>
      
      {/* Dropdown */}
      {viewerState.isSchemeDropdownOpen && (
          <div className={styles.dropdown}>
            {/* Поиск внутри dropdown */}
            {viewerState.isSchemeSearchVisible && (
              <div className={styles.dropdownSearch}>
                <div className={styles.searchInputWrapper}>
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Поиск планов этажей..."
                    value={viewerState.schemeSearchQuery}
                    onChange={(e) => viewerState.setSchemeSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    autoFocus
                  />
                  {viewerState.schemeSearchQuery && (
                    <button 
                      className={styles.clearSearchBtn}
                      onClick={() => viewerState.setSchemeSearchQuery('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Список схем */}
            <div className={styles.dropdownList}>
              {filteredSchemes.length === 0 ? (
                <div className={styles.noResults}>Планы этажей не найдены</div>
              ) : (
                filteredSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={`${styles.dropdownItem} ${viewerState.selectedScheme?.id === scheme.id ? styles.selected : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSchemeSelect(scheme);
                    }}
                  >
                    <div className={styles.schemePreview}>
                      <img src={scheme.thumbnail} alt={scheme.name} />
                    </div>
                    <div className={styles.schemeDetails}>
                      <div className={styles.schemeName}>{scheme.name}</div>
                      <div className={styles.schemeDesc}>{scheme.description}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
      )}
      
      {/* Сама миникарта */}
      {viewerState.selectedScheme && (
        <div className={`${styles.minimapImage} ${viewerState.isMinimapExpanded ? styles.expanded : ''}`}>
          {/* Панель управления зумом (только в развернутом состоянии - сверху) */}
          {viewerState.isMinimapExpanded && (
            <div className={styles.minimapControls}>
              <button
                className={styles.minimapControlButton}
                onClick={() => viewerState.setMinimapZoom(prev => Math.min(3, prev + 0.1))}
                title="Увеличить"
              >
                <i className="fas fa-plus"></i>
              </button>
              <span className={styles.zoomLevel}>
                {Math.round(viewerState.minimapZoom * 100)}%
              </span>
              <button
                className={styles.minimapControlButton}
                onClick={() => viewerState.setMinimapZoom(prev => Math.max(0.5, prev - 0.1))}
                title="Уменьшить"
              >
                <i className="fas fa-minus"></i>
              </button>
              <button
                className={styles.minimapControlButton}
                onClick={() => {
                  viewerState.setMinimapZoom(1);
                  viewerState.setMinimapPosition({ x: 0, y: 0 });
                }}
                title="Сбросить"
              >
                <i className="fas fa-expand-arrows-alt"></i>
              </button>
            </div>
          )}
          
          <div 
            className={styles.minimapZoomContainer}
            onMouseDown={viewerState.isMinimapExpanded ? handleMinimapMouseDown : undefined}
            ref={minimapRef}
          >
            <img 
              key={viewerState.selectedScheme.id}
              src={viewerState.selectedScheme.fullImage || viewerState.selectedScheme.thumbnail} 
              alt={viewerState.selectedScheme.name}
              className={styles.schemeMap}
              style={viewerState.isMinimapExpanded ? {
                transform: `translate(${viewerState.minimapPosition.x}px, ${viewerState.minimapPosition.y}px) scale(${viewerState.minimapZoom})`,
                cursor: viewerState.isMinimapDragging ? 'grabbing' : 'grab',
                transformOrigin: 'center center',
                maxWidth: '100%',
                maxHeight: '100%'
              } : {}}
              draggable={false}
            />
            
            {/* SVG оверлей для маршрутов и точек */}
            {currentFloorData && (
              <svg 
                className={styles.routeOverlay} 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                style={viewerState.isMinimapExpanded ? {
                  transform: `translate(${viewerState.minimapPosition.x}px, ${viewerState.minimapPosition.y}px) scale(${viewerState.minimapZoom})`,
                  transformOrigin: 'center center',
                } : {}}
              >
                {/* Маршруты */}
                {currentFloorData.routes.map((route, index) => (
                  <path
                    key={index}
                    d={createRoutePath(route)}
                    className={styles.routePath}
                  />
                ))}
                
                {/* Контрольные точки */}
                {currentFloorData.points.map((point) => (
                  <g key={point.id}>
                    {/* Внешний круг (подсветка для активной точки) */}
                    {imageManagement.currentOPImageIndex === point.id && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        className={styles.activePointRing}
                      />
                    )}
                    
                    {/* Основная точка */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="2.5"
                      className={`${styles.controlPoint} ${
                        imageManagement.currentOPImageIndex === point.id ? styles.active : ''
                      }`}
                      onClick={() => handleRoutePointClick(point.id)}
                    />
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SchemesMinimap.propTypes = {
  project: PropTypes.object.isRequired,
  viewerState: PropTypes.object.isRequired,
  imageManagement: PropTypes.object.isRequired,
  splitScreenState: PropTypes.object.isRequired,
  getOPImageUrl: PropTypes.func.isRequired,
  getOPImageUrlWithFloor: PropTypes.func.isRequired,
  handleMinimapToggle: PropTypes.func.isRequired,
  schemesMinimapRef: PropTypes.object,
  minimapRef: PropTypes.object,
  handleMinimapMouseDown: PropTypes.func
};

export default SchemesMinimap;