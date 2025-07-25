import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SchemeViewer = ({ 
  floor, 
  creatingZone, 
  onZoneCreated, 
  onCancelZone
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [lastCreatedZone, setLastCreatedZone] = useState(null);
  
  // Состояние для зума и панорамирования
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Загрузка изображения и настройка canvas
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageLoaded(true);
      const container = containerRef.current;
      if (container && canvasRef.current) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Вычисляем размеры с сохранением пропорций
        const imageAspect = image.width / image.height;
        const containerAspect = containerWidth / containerHeight;
        
        let canvasWidth, canvasHeight;
        if (imageAspect > containerAspect) {
          canvasWidth = containerWidth;
          canvasHeight = containerWidth / imageAspect;
        } else {
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * imageAspect;
        }
        
        setCanvasSize({ width: canvasWidth, height: canvasHeight });
        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        
        imageRef.current = image;
        drawCanvas();
      }
    };
    image.src = floor.fullImage;
  }, [floor.fullImage]);

  // Добавляем wheel event listener с { passive: false } и более плавным зумом
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Более плавный и менее чувствительный зум
      const wheelDelta = e.deltaY < 0 ? 1.05 : 0.95;
      const newZoom = Math.min(Math.max(zoom * wheelDelta, 0.1), 5);
      
      if (newZoom !== zoom) {
        // Зум к точке мыши
        const oldZoom = zoom;
        
        setPan(prev => ({
          x: mouseX + (prev.x - mouseX) * (newZoom / oldZoom),
          y: mouseY + (prev.y - mouseY) * (newZoom / oldZoom)
        }));
        
        setZoom(newZoom);
      }
    };

    // Добавляем слушатель на canvas и контейнер
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Предотвращаем стандартное поведение для всех touch событий
    const preventDefault = (e) => e.preventDefault();
    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      container.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', preventDefault);
      canvas.removeEventListener('touchmove', preventDefault);
    };
  }, [zoom]);

  // Проверка попадания мыши в зону
  const getZoneAtPos = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !floor.zones) return null;

    // Преобразуем экранные координаты в координаты canvas с учетом зума и пана
    const canvasX = (x - pan.x) / zoom;
    const canvasY = (y - pan.y) / zoom;
    
    // Проверяем попадание в зоны
    for (const zone of floor.zones) {
      const scaleX = canvas.width / image.width;
      const scaleY = canvas.height / image.height;
      
      const zx = zone.coordinates.x * scaleX;
      const zy = zone.coordinates.y * scaleY;
      const zw = zone.coordinates.width * scaleX;
      const zh = zone.coordinates.height * scaleY;
      
      if (canvasX >= zx && canvasX <= zx + zw && canvasY >= zy && canvasY <= zy + zh) {
        return zone;
      }
    }
    
    return null;
  }, [floor.zones, zoom, pan]);

  // Получение центра зоны для тултипа
  const getZoneCenter = useCallback((zone) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return { x: 0, y: 0 };

    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    
    // Координаты и размеры зоны в координатах canvas
    const zoneX = zone.coordinates.x * scaleX;
    const zoneY = zone.coordinates.y * scaleY;
    const zoneWidth = zone.coordinates.width * scaleX;
    const zoneHeight = zone.coordinates.height * scaleY;
    
    // Вычисляем центр зоны в координатах canvas
    const canvasCenterX = zoneX + zoneWidth / 2;
    const canvasCenterY = zoneY + zoneHeight / 2;
    
    // Применяем зум и пан для получения экранных координат центра
    const screenCenterX = canvasCenterX * zoom + pan.x;
    const screenCenterY = canvasCenterY * zoom + pan.y;
    
    return { x: screenCenterX, y: screenCenterY };
  }, [zoom, pan]);

  // Перерисовка canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    
    if (!ctx || !image || !imageLoaded) return;
    
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сохраняем состояние контекста
    ctx.save();
    
    // Применяем трансформации для зума и панорамирования
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Рисуем изображение схемы (размер базового изображения без учета зума)
    const baseWidth = canvas.width;
    const baseHeight = canvas.height;
    ctx.drawImage(image, 0, 0, baseWidth, baseHeight);
    
    // Рисуем существующие зоны (без текста)
    floor.zones?.forEach(zone => {
      const scaleX = baseWidth / image.width;
      const scaleY = baseHeight / image.height;
      
      const x = zone.coordinates.x * scaleX;
      const y = zone.coordinates.y * scaleY;
      const width = zone.coordinates.width * scaleX;
      const height = zone.coordinates.height * scaleY;
      
      // Определяем прозрачность в зависимости от hover
      const isHovered = hoveredZone && hoveredZone.id === zone.id;
      const alpha = isHovered ? '60' : '40'; // Темнее при наведении
      
      // Полупрозрачная заливка
      ctx.fillStyle = zone.color + alpha;
      ctx.fillRect(x, y, width, height);
      
      // Граница
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Убираем текст с зон - теперь показываем только при hover как тултип
    });
    
    // Рисуем последнюю созданную зону (которая ожидает названия)
    if (lastCreatedZone) {
      const scaleX = baseWidth / image.width;
      const scaleY = baseHeight / image.height;
      
      const x = lastCreatedZone.x * scaleX;
      const y = lastCreatedZone.y * scaleY;
      const width = lastCreatedZone.width * scaleX;
      const height = lastCreatedZone.height * scaleY;
      
      // Полупрозрачная заливка синим цветом
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(x, y, width, height);
      
      // Граница синяя с пунктиром
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Восстанавливаем состояние контекста
    ctx.restore();
    
    // Рисуем текущую зону при создании (поверх трансформаций, в экранных координатах)
    if (creatingZone && isDrawing) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      
      // Полупрозрачная заливка
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(x, y, width, height);
      
      // Граница
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  }, [floor.zones, creatingZone, isDrawing, startPos, currentPos, imageLoaded, zoom, pan, lastCreatedZone, hoveredZone]);

  // Перерисовка при изменении данных
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Получение координат мыши относительно canvas
  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Возвращаем точные экранные координаты относительно canvas
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    };
  }, []);

  // Получение координат в пространстве изображения (для сохранения зон)
  const getImagePos = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return { x: 0, y: 0 };
    
    // Преобразуем экранные координаты в координаты изображения с учетом зума и пана
    const transformedX = (screenX - pan.x) / zoom;
    const transformedY = (screenY - pan.y) / zoom;
    
    // Масштабируем к оригинальному размеру изображения
    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;
    
    return {
      x: transformedX * scaleX,
      y: transformedY * scaleY
    };
  }, [zoom, pan]);

  // Обработчики мыши
  const handleMouseDown = useCallback((e) => {
    const pos = getMousePos(e);
    
    // Если создаем зону - режим рисования
    if (creatingZone && e.button === 0) {
      setStartPos(pos);
      setCurrentPos(pos);
      setIsDrawing(true);
      return;
    }
    
    // Иначе - режим панорамирования
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
  }, [creatingZone, getMousePos]);

  const handleMouseMove = useCallback((e) => {
    const pos = getMousePos(e);
    setMousePos(pos);
    
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Проверяем hover для зон только если не создаем зону и не панорамируем
    if (!creatingZone && !isPanning && !isDrawing) {
      const zone = getZoneAtPos(pos.x, pos.y);
      setHoveredZone(zone);
    } else {
      setHoveredZone(null);
    }
    
    if (!creatingZone || !isDrawing) return;
    
    setCurrentPos(pos);
  }, [creatingZone, isDrawing, getMousePos, isPanning, lastPanPoint, getZoneAtPos]);

  const handleMouseUp = useCallback((e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (!creatingZone || !isDrawing) return;
    
    const pos = getMousePos(e);
    
    // Минимальный размер зоны в экранных координатах
    const screenWidth = Math.abs(pos.x - startPos.x);
    const screenHeight = Math.abs(pos.y - startPos.y);
    
    if (screenWidth > 20 && screenHeight > 20) {
      // Преобразуем в координаты изображения
      const startImagePos = getImagePos(startPos.x, startPos.y);
      const endImagePos = getImagePos(pos.x, pos.y);
      
      const zoneCoordinates = {
        x: Math.round(Math.min(startImagePos.x, endImagePos.x)),
        y: Math.round(Math.min(startImagePos.y, endImagePos.y)),
        width: Math.round(Math.abs(endImagePos.x - startImagePos.x)),
        height: Math.round(Math.abs(endImagePos.y - startImagePos.y))
      };
      
      setLastCreatedZone(zoneCoordinates);
      onZoneCreated(zoneCoordinates);
    }
    
    setIsDrawing(false);
  }, [creatingZone, isDrawing, getMousePos, startPos, onZoneCreated, getImagePos, isPanning]);

  // Очищаем последнюю созданную зону только при смене этажа или отмене создания
  useEffect(() => {
    setLastCreatedZone(null);
    setHoveredZone(null);
  }, [floor.id]);

  // Очищаем lastCreatedZone при успешном сохранении зоны
  useEffect(() => {
    if (!creatingZone && !lastCreatedZone) {
      // Зона была сохранена, можно очистить
      setLastCreatedZone(null);
    }
  }, [creatingZone, lastCreatedZone]);

  // Кнопки зума (тоже делаем более плавными)
  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newZoom = Math.min(zoom * 1.1, 5); // Более плавный зум
    
    // Зум к центру канваса
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const zoomRatio = newZoom / zoom;
    
    setPan(prev => ({
      x: centerX + (prev.x - centerX) * zoomRatio,
      y: centerY + (prev.y - centerY) * zoomRatio
    }));
    
    setZoom(newZoom);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newZoom = Math.max(zoom * 0.9, 0.1); // Более плавный зум
    
    // Зум к центру канваса
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const zoomRatio = newZoom / zoom;
    
    setPan(prev => ({
      x: centerX + (prev.x - centerX) * zoomRatio,
      y: centerY + (prev.y - centerY) * zoomRatio
    }));
    
    setZoom(newZoom);
  }, [zoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Обработка нажатия Escape для отмены
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && creatingZone) {
        onCancelZone();
      }
    };
    
    if (creatingZone) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [creatingZone, onCancelZone]);

  return (
    <div className="scheme-viewer">
      <div className="scheme-header">
        <h4>{floor.name}</h4>
        <div className="scheme-controls">
          <div className="zoom-controls">
            <button onClick={handleZoomOut} className="zoom-btn" title="Уменьшить">
              <i className="fas fa-minus"></i>
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="zoom-btn" title="Увеличить">
              <i className="fas fa-plus"></i>
            </button>
            <button onClick={handleZoomReset} className="zoom-btn" title="Сбросить зум">
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
        {creatingZone && (
          <div className="creation-hint">
            <i className="fas fa-info-circle"></i>
            Выделите прямоугольную область на схеме для создания зоны
          </div>
        )}
      </div>
      <div className="scheme-canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            cursor: isPanning ? 'grabbing' : (creatingZone ? 'crosshair' : 'grab'),
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        {!imageLoaded && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              Загрузка схемы...
            </div>
          </div>
        )}
        {/* Тултип для зон */}
        {hoveredZone && (() => {
          const zoneCenter = getZoneCenter(hoveredZone);
          const canvas = canvasRef.current;
          const image = imageRef.current;
          
          if (!canvas || !image) return null;
          
          // Вычисляем размеры зоны на экране для правильного позиционирования тултипа
          const scaleX = canvas.width / image.width;
          const scaleY = canvas.height / image.height;
          const zoneHeight = hoveredZone.coordinates.height * scaleY * zoom;
          
          return (
            <div 
              className="zone-tooltip"
              style={{
                left: zoneCenter.x,
                top: zoneCenter.y - (zoneHeight / 2) - 35, // Сверху над зоной с отступом
                backgroundColor: hoveredZone.color,
                color: 'white',
                transform: 'translateX(-50%)', // Центрируем по горизонтали
                borderColor: hoveredZone.color
              }}
            >
              {hoveredZone.name}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

SchemeViewer.propTypes = {
  floor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    fullImage: PropTypes.string.isRequired,
    zones: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      coordinates: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      }).isRequired,
      color: PropTypes.string.isRequired
    }))
  }).isRequired,
  creatingZone: PropTypes.bool.isRequired,
  onZoneCreated: PropTypes.func.isRequired,
  onCancelZone: PropTypes.func.isRequired
};

export default SchemeViewer; 