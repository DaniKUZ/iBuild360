import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

// Импортируем компоненты из просмотра 360
import DateSelector from '../../Viewer360/components/DateSelector/DateSelector';
import VideoControls from '../../Viewer360/components/VideoControls/VideoControls';
import DateComparisonModal from './DateComparisonModal';
import YandexMiniMap from '../components/YandexMiniMap';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Функция для получения изображения дороги по дате и индексу
const getRoadImageForDate = (date, index) => {
  const dateStr = date.toISOString().split('T')[0];
  try {
    if (dateStr === '2025-07-09') {
      // Для 9 июля 2025 загружаем изображения с суффиксом _09072025
      return require(`../../../data/img/roadImg${index + 1}_09072025.PNG`);
    } else if (dateStr === '2025-07-14') {
      // Для 14 июля 2025 загружаем стандартные изображения
      return require(`../../../data/img/roadImg${index + 1}.PNG`);
    } else {
      // По умолчанию используем стандартные изображения
      return require(`../../../data/img/roadImg${index + 1}.PNG`);
    }
  } catch (error) {
    // Если изображение не найдено, используем стандартное
    return require(`../../../data/img/roadImg${index + 1}.PNG`);
  }
};

// Функция для получения количества кадров для даты
const getFrameCountForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  if (dateStr === '2025-07-09') {
    return 7; // Для 9 июля только 7 кадров
  }
  return 21; // Для остальных дат 21 кадр
};

// Функция для генерации кадров для конкретной даты
const generateFramesForDate = (date) => {
  const frameCount = getFrameCountForDate(date);
  const timePerFrame = frameCount === 7 ? 27.14 : 9.5; // Время на кадр (3:18 / количество кадров)
  const distancePerFrame = frameCount === 7 ? 226.1 : 16.67; // Расстояние на кадр
  
  return Array.from({ length: frameCount }, (_, index) => ({
    id: index,
    imageUrl: getRoadImageForDate(date, index),
    timestamp: index * timePerFrame,
    distance: Math.round(index * distancePerFrame),
  }));
};

// Функция для получения данных анализа сегментов по дате
const getAnalysisSegmentsByDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  if (dateStr === '2025-07-09') {
    // 9 июля - ранняя стадия, только 7 кадров, минимальный прогресс
    return [
      { id: 0, frameIndex: 0, distance: '0м', title: 'Кадр 1', description: 'Подготовительные работы на участке', status: 'completed' },
      { id: 1, frameIndex: 1, distance: '226м', title: 'Кадр 2', description: 'Разметка территории', status: 'completed' },
      { id: 2, frameIndex: 2, distance: '452м', title: 'Кадр 3', description: 'Снятие растительного слоя', status: 'in_progress' },
      { id: 3, frameIndex: 3, distance: '678м', title: 'Кадр 4', description: 'Начало земляных работ', status: 'in_progress' },
      { id: 4, frameIndex: 4, distance: '904м', title: 'Кадр 5', description: 'Планировка местности', status: 'planned' },
      { id: 5, frameIndex: 5, distance: '1130м', title: 'Кадр 6', description: 'Подготовка дренажных канав', status: 'planned' },
      { id: 6, frameIndex: 6, distance: '1356м', title: 'Кадр 7', description: 'Завершение подготовительного этапа', status: 'planned' }
    ];
  } else {
    // 14 июля - поздняя стадия, 21 кадр, больше выполненных работ
    return [
      { id: 0, frameIndex: 0, distance: '0м', title: 'Кадр 1', description: 'Начальная точка участка дороги', status: 'completed' },
      { id: 1, frameIndex: 1, distance: '79м', title: 'Кадр 2', description: 'Земляные работы завершены', status: 'completed' },
      { id: 2, frameIndex: 2, distance: '158м', title: 'Кадр 3', description: 'Подготовка основания', status: 'completed' },
      { id: 3, frameIndex: 3, distance: '237м', title: 'Кадр 4', description: 'Укладка щебёночного слоя', status: 'completed' },
      { id: 4, frameIndex: 4, distance: '317м', title: 'Кадр 5', description: 'Уплотнение основания', status: 'completed' },
      { id: 5, frameIndex: 5, distance: '396м', title: 'Кадр 6', description: 'Дренажные работы', status: 'completed' },
      { id: 6, frameIndex: 6, distance: '475м', title: 'Кадр 7', description: 'Водоотводные системы', status: 'completed' },
      { id: 7, frameIndex: 7, distance: '554м', title: 'Кадр 8', description: 'Подготовка к асфальтированию', status: 'in_progress' },
      { id: 8, frameIndex: 8, distance: '633м', title: 'Кадр 9', description: 'Укладка первого слоя асфальта', status: 'in_progress' },
      { id: 9, frameIndex: 9, distance: '712м', title: 'Кадр 10', description: 'Выравнивание покрытия', status: 'in_progress' },
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
    ];
  }
};

// Моковые данные для видео дороги
const mockRoadData = {
  dates: [
    { date: '2025-07-09', label: '9 июля 2025', available: true },
    { date: '2025-07-14', label: '14 июля 2025', available: true }
  ]
};

// Функция для получения данных общего плана по дате
const getOverallPlanDataByDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  if (dateStr === '2025-07-09') {
    // 9 июля - ранняя стадия, меньший прогресс
    return [
      { name: 'Июн', План: 5, Факт: 2 },
      { name: 'Июл', План: 15, Факт: 5 },
      { name: 'Авг', План: 25, Факт: 12 },
      { name: 'Сен', План: 40, Факт: 20 },
      { name: 'Окт', План: 55, Факт: 30 },
      { name: 'Ноя', План: 70, Факт: 42 },
      { name: 'Дек', План: 85, Факт: 55 },
      { name: 'Янв', План: 100, Факт: 68 },
    ];
  } else {
    // 14 июля - поздняя стадия, больший прогресс
    return [
      { name: 'Июл', План: 10, Факт: 8 },
      { name: 'Авг', План: 20, Факт: 15 },
      { name: 'Сен', План: 35, Факт: 28 },
      { name: 'Окт', План: 50, Факт: 38 },
      { name: 'Ноя', План: 65, Факт: 46 },
      { name: 'Дек', План: 80, Факт: 55 },
      { name: 'Янв', План: 90, Факт: 60 },
      { name: 'Фев', План: 100, Факт: 62 },
    ];
  }
};

// Функция для получения данных задач по дате
const getTaskChartsByDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  if (dateStr === '2025-07-09') {
    // 9 июля - ранняя стадия, меньший прогресс, другие задачи
    return [
      {
        id: 'task1',
        title: 'Подготовительные работы',
        percent: 85,
        data: [
          { name: 'Май', План: 20, Факт: 15 },
          { name: 'Июн', План: 50, Факт: 45 },
          { name: 'Июл', План: 80, Факт: 70 },
          { name: 'Авг', План: 100, Факт: 85 },
        ]
      },
      {
        id: 'task2',
        title: 'Снятие растительного слоя',
        percent: 45,
        data: [
          { name: 'Май', План: 10, Факт: 5 },
          { name: 'Июн', План: 30, Факт: 20 },
          { name: 'Июл', План: 60, Факт: 35 },
          { name: 'Авг', План: 100, Факт: 45 },
        ]
      },
      {
        id: 'task3',
        title: 'Планировка территории',
        percent: 25,
        data: [
          { name: 'Май', План: 5, Факт: 2 },
          { name: 'Июн', План: 15, Факт: 8 },
          { name: 'Июл', План: 40, Факт: 18 },
          { name: 'Авг', План: 100, Факт: 25 },
        ]
      },
      {
        id: 'task4',
        title: 'Разметка участка',
        percent: 90,
        data: [
          { name: 'Май', План: 25, Факт: 20 },
          { name: 'Июн', План: 60, Факт: 55 },
          { name: 'Июл', План: 90, Факт: 80 },
          { name: 'Авг', План: 100, Факт: 90 },
        ]
      },
    ];
  } else {
    // 14 июля - поздняя стадия, больший прогресс
    return [
      {
        id: 'task1',
        title: 'Снятие растительного слоя',
        percent: 69,
        data: [
          { name: 'Янв', План: 10, Факт: 5 },
          { name: 'Фев', План: 25, Факт: 18 },
          { name: 'Мар', План: 40, Факт: 30 },
          { name: 'Апр', План: 60, Факт: 44 },
          { name: 'Май', План: 80, Факт: 55 },
          { name: 'Июн', План: 100, Факт: 69 },
        ]
      },
      {
        id: 'task2',
        title: 'Разработка выемок',
        percent: 69,
        data: [
          { name: 'Янв', План: 10, Факт: 5 },
          { name: 'Фев', План: 25, Факт: 17 },
          { name: 'Мар', План: 40, Факт: 30 },
          { name: 'Апр', План: 60, Факт: 45 },
          { name: 'Май', План: 80, Факт: 59 },
          { name: 'Июн', План: 100, Факт: 69 },
        ]
      },
      {
        id: 'task3',
        title: 'Возведение насыпей',
        percent: 33,
        data: [
          { name: 'Янв', План: 10, Факт: 2 },
          { name: 'Фев', План: 25, Факт: 6 },
          { name: 'Мар', План: 40, Факт: 11 },
          { name: 'Апр', План: 60, Факт: 17 },
          { name: 'Май', План: 80, Факт: 25 },
          { name: 'Июн', План: 100, Факт: 33 },
        ]
      },
      {
        id: 'task4',
        title: 'Устройство водопропускных сооружений',
        percent: 33,
        data: [
          { name: 'Янв', План: 10, Факт: 3 },
          { name: 'Фев', План: 25, Факт: 7 },
          { name: 'Мар', План: 40, Факт: 12 },
          { name: 'Апр', План: 60, Факт: 18 },
          { name: 'Май', План: 80, Факт: 26 },
          { name: 'Июн', План: 100, Факт: 33 },
        ]
      },
    ];
  }
};

function RoadVideoSection() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-09'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(() => getAnalysisSegmentsByDate(new Date('2025-07-09')));
  const [frames, setFrames] = useState(() => generateFramesForDate(new Date('2025-07-09')));
  const [overallPlanData, setOverallPlanData] = useState(() => getOverallPlanDataByDate(new Date('2025-07-09')));
  const [taskCharts, setTaskCharts] = useState(() => getTaskChartsByDate(new Date('2025-07-09')));
  const [showCompareModal, setShowCompareModal] = useState(false);
  const chartsContainerRef = useRef(null);
  const frameContainerRef = useRef(null);
  const [startCharts, setStartCharts] = useState(false);
  const [chartsKey, setChartsKey] = useState(0);
  const [zoom, setZoom] = useState(1); // визуальный масштаб (плавная анимация)
  const [targetZoom, setTargetZoom] = useState(1); // целевой масштаб
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Включаем мини‑карту по умолчанию, если ключ доступен в окружении
  const resolveMapsKey = () => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_YANDEX_MAPS_API_KEY || import.meta.env.REACT_APP_YANDEX_MAPS_API_KEY) return true;
      }
    } catch (_) {}
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.REACT_APP_YANDEX_MAPS_API_KEY || process.env.VITE_YANDEX_MAPS_API_KEY) return true;
      }
    } catch (_) {}
    try {
      if (typeof window !== 'undefined') {
        if (window.REACT_APP_YANDEX_MAPS_API_KEY || window.VITE_YANDEX_MAPS_API_KEY) return true;
      }
    } catch (_) {}
    return false;
  };
  const [isMiniMapEnabled, setIsMiniMapEnabled] = useState(() => resolveMapsKey());
  const [isZooming, setIsZooming] = useState(false);
  const wheelEndTimerRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // визуальная позиция
  const [targetPan, setTargetPan] = useState({ x: 0, y: 0 }); // целевая позиция
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Trapezoid navigation state
  const [isMouseInsideFrame, setIsMouseInsideFrame] = useState(false);
  const [isTrapezoidVisible, setIsTrapezoidVisible] = useState(false);
  const [trapezoidClipPath, setTrapezoidClipPath] = useState('');
  const trapezoidDataRef = useRef({ yInActive: 1, cursorYRatio: 1 });
  const [showTrapezoidHint, setShowTrapezoidHint] = useState(true);
  const trapezoidRef = useRef(null);
  const trapezoidClipPendingRef = useRef(false);
  const lastClipRef = useRef('');

  // Frame transition overlay state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFromUrl, setTransitionFromUrl] = useState(null);
  const [transitionToUrl, setTransitionToUrl] = useState(null);
  const transitionTimerRef = useRef(null);

  // Получаем текущее количество кадров
  const currentFrameCount = useMemo(() => getFrameCountForDate(selectedDate), [selectedDate]);
  
  // Вычисляем текущее время на основе кадра
  useEffect(() => {
    const timePerFrame = currentFrameCount === 7 ? 27.14 : 9.5;
    setCurrentTime(currentFrame * timePerFrame);
  }, [currentFrame, currentFrameCount]);

  // Навигация по кадрам
  const goToPreviousFrame = useCallback(() => {
    setCurrentFrame(prev => Math.max(0, prev - 1));
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setTargetZoom((z) => Math.min(3, parseFloat((z + 0.25).toFixed(2))));
  }, []);
  const handleZoomOut = useCallback(() => {
    setTargetZoom((z) => Math.max(1, parseFloat((z - 0.25).toFixed(2))));
  }, []);
  const handleZoomReset = useCallback(() => { setTargetZoom(1); setTargetPan({ x: 0, y: 0 }); }, []);

  const clampPan = useCallback((x, y, nextZoom) => {
    const container = frameContainerRef.current;
    if (!container) return { x, y };
    const rect = container.getBoundingClientRect();
    const z = nextZoom ?? zoom;
    const extraX = (rect.width * z - rect.width) / 2;
    const extraY = (rect.height * z - rect.height) / 2;
    if (extraX <= 0 || extraY <= 0) return { x: 0, y: 0 };
    return {
      x: Math.max(-extraX, Math.min(extraX, x)),
      y: Math.max(-extraY, Math.min(extraY, y)),
    };
  }, [zoom]);

  const handleWheel = useCallback((e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    setIsZooming(true);
    if (wheelEndTimerRef.current) {
      clearTimeout(wheelEndTimerRef.current);
    }
    wheelEndTimerRef.current = setTimeout(() => setIsZooming(false), 120);
    const container = frameContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX ?? (e.pageX - window.scrollX)) - cx;
    const dy = (e.clientY ?? (e.pageY - window.scrollY)) - cy;
    const direction = e.deltaY > 0 ? -1 : 1; // вверх увеличить, вниз уменьшить
    const step = 0.1 * direction; // более плавный шаг
    const newZoom = Math.max(1, Math.min(3, parseFloat((zoom + step).toFixed(2))));
    const scaleDelta = newZoom / zoom - 1;
    setTargetPan((prev) => clampPan(prev.x - dx * scaleDelta, prev.y - dy * scaleDelta, newZoom));
    setTargetZoom(newZoom);
  }, [zoom, clampPan]);

  // Гарантируем non-passive wheel listener, чтобы блокировать скролл страницы
  useEffect(() => {
    const node = frameContainerRef.current;
    if (!node) return;
    const handler = (ev) => handleWheel(ev);
    node.addEventListener('wheel', handler, { passive: false });
    return () => node.removeEventListener('wheel', handler, { passive: false });
  }, [handleWheel]);

  const onMouseDown = useCallback((e) => {
    if (zoom <= 1) return;
    if (e.cancelable) e.preventDefault();
    setIsPanning(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = targetPan;
  }, [zoom, targetPan]);

  const onMouseMove = useCallback((e) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    const next = clampPan(panStartRef.current.x + dx, panStartRef.current.y + dy);
    setTargetPan(next);
  }, [isPanning, clampPan]);

  // Update trapezoid geometry on pointer move
  const updateTrapezoid = useCallback((e) => {
    const container = frameContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const clientX = e.clientX ?? (e.pageX - window.scrollX);
    const clientY = e.clientY ?? (e.pageY - window.scrollY);
    const x = clientX - rect.left;
    const y = clientY - rect.top; // from top

    // Track inside state
    const inside = x >= 0 && x <= width && y >= 0 && y <= height;
    setIsMouseInsideFrame(inside);
    if (!inside) {
      setIsTrapezoidVisible(false);
      return;
    }

    // Hide when zoomed or during panning/zooming or on last frame
    const isLastFrame = currentFrame >= currentFrameCount - 1;
    if (zoom > 1 || isPanning || isZooming || isLastFrame) {
      setIsTrapezoidVisible(false);
      return;
    }

    const cursorYRatio = y / height; // 0 top .. 1 bottom
    // Active only in bottom 75% of height
    if (cursorYRatio < 0.25) {
      setIsTrapezoidVisible(false);
      return;
    }

    // Normalize within active band (0 at top boundary, 1 at bottom)
    const yInActive = Math.max(0, Math.min(1, (cursorYRatio - 0.25) / 0.75));
    trapezoidDataRef.current = { yInActive, cursorYRatio };

    // Geometry parameters: centered around cursor position vertically, clamped to active zone
    const ACTIVE_TOP_BOUNDARY = height * 0.25;
    const requestedHalfHeight = height * 0.1; // ~20% of height total thickness
    const maxHalfUp = Math.max(0, y - ACTIVE_TOP_BOUNDARY);
    const maxHalfDown = Math.max(0, height - y);
    const halfHeight = Math.max(6, Math.min(requestedHalfHeight, maxHalfUp, maxHalfDown));
    const TOP_Y = Math.max(ACTIVE_TOP_BOUNDARY, y - halfHeight);
    const BOTTOM_Y = Math.min(height, y + halfHeight);

    // Widths narrow overall and narrow more when cursor higher
    const MIN_BOTTOM_WIDTH_RATIO = 0.30;
    const MAX_BOTTOM_WIDTH_RATIO = 0.5;
    const MIN_TOP_WIDTH_RATIO = 0.16;
    const MAX_TOP_WIDTH_RATIO = 0.44;
    // yInActive: 0 near top boundary (narrow), 1 near bottom (wider)
    const bottomWidthRatio = MIN_BOTTOM_WIDTH_RATIO + (MAX_BOTTOM_WIDTH_RATIO - MIN_BOTTOM_WIDTH_RATIO) * yInActive;
    const topWidthRatioBase = MIN_TOP_WIDTH_RATIO + (MAX_TOP_WIDTH_RATIO - MIN_TOP_WIDTH_RATIO) * yInActive;
    const topWidthRatio = Math.min(topWidthRatioBase, bottomWidthRatio * 0.92);

    // Desired widths (bounded by container via halves below)
    let desiredBottomWidth = width * bottomWidthRatio;
    let desiredTopWidth = width * topWidthRatio;

    // Clamp widths to remain inside container around cursor X
    const maxBottomHalf = Math.min(desiredBottomWidth / 2, x, width - x);
    const maxTopHalf = Math.min(desiredTopWidth / 2, x, width - x);
    const bottomHalf = Math.max(8, maxBottomHalf);
    const topHalf = Math.max(6, maxTopHalf);

    const bottomLeftX = x - bottomHalf;
    const bottomRightX = x + bottomHalf;
    const topLeftX = x - topHalf;
    const topRightX = x + topHalf;

    const clip = `polygon(${topLeftX}px ${TOP_Y}px, ${topRightX}px ${TOP_Y}px, ${bottomRightX}px ${BOTTOM_Y}px, ${bottomLeftX}px ${BOTTOM_Y}px)`;
    // Apply clip-path via rAF to avoid re-render jank
    if (clip !== lastClipRef.current) {
      lastClipRef.current = clip;
      if (!trapezoidClipPendingRef.current) {
        trapezoidClipPendingRef.current = true;
        requestAnimationFrame(() => {
          trapezoidClipPendingRef.current = false;
          if (trapezoidRef.current) {
            trapezoidRef.current.style.clipPath = lastClipRef.current;
          }
        });
      }
    }
    setIsTrapezoidVisible(true);
  }, [zoom, isPanning, isZooming, currentFrame, currentFrameCount]);

  const handleContainerMouseMove = useCallback((e) => {
    updateTrapezoid(e);
    onMouseMove(e);
  }, [updateTrapezoid, onMouseMove]);

  const handleContainerMouseLeave = useCallback(() => {
    setIsMouseInsideFrame(false);
    setIsTrapezoidVisible(false);
  }, []);

  // Trapezoid click: +1 or +2 frames with transition
  const handleTrapezoidClick = useCallback(() => {
    if (zoom > 1 || isPanning || isZooming || isTransitioning) return;
    if (currentFrame >= currentFrameCount - 1) return; // hidden on last frame
    const { yInActive } = trapezoidDataRef.current;
    // Steps by height bands (top = more steps, bottom = fewer):
    // top (0-0.5) => 3, middle (0.5-0.65) => 2, bottom (0.65-1) => 1
    let steps = 3;
    if (yInActive >= 0.5) steps = 2;
    if (yInActive >= 0.65) steps = 1;
    const targetIndex = Math.min(currentFrameCount - 1, currentFrame + steps);
    if (targetIndex === currentFrame) return;

    // Prepare animated transition
    try { if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current); } catch (_) {}
    setTransitionFromUrl(frames[currentFrame]?.imageUrl);
    setTransitionToUrl(frames[targetIndex]?.imageUrl);
    setIsTransitioning(true);

    transitionTimerRef.current = setTimeout(() => {
      setCurrentFrame(targetIndex);
      setIsTransitioning(false);
      setTransitionFromUrl(null);
      setTransitionToUrl(null);
      setShowTrapezoidHint(false);
    }, 1000);
  }, [zoom, isPanning, isZooming, currentFrameCount, currentFrame, frames]);

  // Hide trapezoid immediately on zoom/pan state changes
  useEffect(() => {
    if (zoom > 1 || isPanning || isZooming) {
      setIsTrapezoidVisible(false);
    }
  }, [zoom, isPanning, isZooming]);

  // Hide trapezoid when on last frame
  useEffect(() => {
    if (currentFrame >= currentFrameCount - 1) {
      setIsTrapezoidVisible(false);
    }
  }, [currentFrame, currentFrameCount]);

  // If frame changes externally during transition, clear overlay to avoid artifacts
  useEffect(() => {
    if (isTransitioning) {
      setIsTransitioning(false);
      setTransitionFromUrl(null);
      setTransitionToUrl(null);
    }
  }, [currentFrame]);

  // Cleanup transition timer on unmount
  useEffect(() => () => {
    try { if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current); } catch(_) {}
  }, []);

  const endPan = useCallback(() => setIsPanning(false), []);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (frameContainerRef.current?.requestFullscreen) {
          await frameContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      // no-op
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Обновление позиции/масштаба без бесконечного requestAnimationFrame
  // Плавность обеспечивается CSS-переходом в style у <img>
  useEffect(() => {
    setZoom(targetZoom);
  }, [targetZoom]);

  useEffect(() => {
    setPan(targetPan);
  }, [targetPan]);

  const goToNextFrame = useCallback(() => {
    setCurrentFrame(prev => Math.min(currentFrameCount - 1, prev + 1));
  }, [currentFrameCount]);

  const goToFirstFrame = useCallback(() => {
    setCurrentFrame(0);
  }, []);

  const goToLastFrame = useCallback(() => {
    setCurrentFrame(currentFrameCount - 1);
  }, [currentFrameCount]);

  // Обработчик смены даты
  const handleDateChange = useCallback((date) => {
    // console.log(`🔄 RoadVideoSection: handleDateChange вызван для ${date.toDateString()}`);
    
    setSelectedDate(date);
    // Генерируем новые кадры для выбранной даты
    setFrames(generateFramesForDate(date));
    // Обновляем данные анализа для выбранной даты
    setAnalysisResults(getAnalysisSegmentsByDate(date));
    // Обновляем данные графиков для выбранной даты
    setOverallPlanData(getOverallPlanDataByDate(date));
    setTaskCharts(getTaskChartsByDate(date));
    // Сбрасываем кадр при смене даты
    setCurrentFrame(0);
    // Принудительно обновляем графики
    setChartsKey(prev => prev + 1);
  }, []);

  // Функция проверки доступности даты
  const isDateAvailable = useCallback((date) => {
    // Используем локальную дату без смещения часовых поясов
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const isAvailable = mockRoadData.dates.some(d => d.date === dateString && d.available);
    // console.log(`🔍 RoadVideoSection: проверка даты ${dateString}, доступна: ${isAvailable}`);
    return isAvailable;
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
        if (nextFrame >= currentFrameCount) {
          setIsVideoPlaying(false);
          clearInterval(interval);
          return 0; // Возвращаемся к началу
        }
        return nextFrame;
      });
    }, 2000); // Каждые 2 секунды
    setPlayInterval(interval);
  }, [currentFrameCount]);

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
  const handleAnalyze = useCallback(() => {}, []);

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

  // Процент готовности для сегмента
  const getSegmentProgress = useCallback((status) => {
    if (status === 'completed') return 100;
    if (status === 'in_progress') return 40; // условно
    return 0; // planned
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

  // Включаем анимацию графиков когда блок попадает в вьюпорт
  useEffect(() => {
    const node = chartsContainerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setStartCharts(true);
          setChartsKey((k) => k + 1); // форсируем монтирование для анимации
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Обработчик открытия модального окна сравнения
  const handleOpenCompareModal = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {
      // no-op
    } finally {
      setShowCompareModal(true);
    }
  }, []);

  // Обработчик закрытия модального окна сравнения
  const handleCloseCompareModal = useCallback(() => {
    setShowCompareModal(false);
  }, []);

  return (
    <div className="road-video-section">
      {/* Заголовок секции */}
      <div className="section-header">
        <h2>Видеообзор дорожного участка</h2>
        <p className="section-description">
          Просмотр фотопотока и статус по участкам. Фото синхронизировано со статусом участка.
        </p>
      </div>

      {/* Верхняя область: слева фото/видео, справа статусы */}
      <div className="top-grid">
        {/* Слева: фото-поток */}
        <div className="video-player-section">
          <div className="video-container">
            <div
              className={`road-frame-container ${zoom > 1 ? 'zoomed' : ''} ${isPanning ? 'dragging' : ''}`}
              ref={frameContainerRef}
              onWheel={handleWheel}
              onMouseDown={onMouseDown}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={endPan}
              onMouseLeave={(e) => { endPan(); handleContainerMouseLeave(e); }}
            >
              <img
                key={`frame-${currentFrame}`}
                src={frames[currentFrame]?.imageUrl}
                alt={`Кадр дороги ${currentFrame + 1} - ${frames[currentFrame]?.description}`}
                className="road-frame-image"
                draggable={false}
                style={{ transition: (isPanning || isZooming) ? 'none' : 'transform 0.2s ease-out', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />

              {/* Animated frame transition overlay */}
              {isTransitioning && (
                <div className="frame-transition-overlay" aria-hidden>
                  <img src={transitionFromUrl} alt="from" className="transition-image from" />
                  <img src={transitionToUrl} alt="to" className="transition-image to" />
                </div>
              )}

              {/* Dynamic trapezoid navigation overlay (hidden when zoomed) */}
              {isTrapezoidVisible && (
                <div className={`trapezoid-nav ${showTrapezoidHint ? 'hint' : ''}`}>
                  <div
                    className="trapezoid-shape"
                    ref={trapezoidRef}
                    style={{ clipPath: trapezoidClipPath, opacity: isMouseInsideFrame ? 1 : 0 }}
                    onClick={handleTrapezoidClick}
                    role="presentation"
                  />
                </div>
              )}
              {/* Мини-карта Яндекс сверху справа */}
              {/* Форсируем рендер мини‑карты поверх всего, включая полноэкранный режим */}
              {isMiniMapEnabled ? (
                <div className="mini-map-overlay">
                  <YandexMiniMap zoom={13} center={[49.283705, 55.87445]} enabled={true} usePortal={isFullscreen} refreshKey={`${currentFrame}-${selectedDate?.toDateString?.()}`}/>
                </div>
              ) : null}
              <div className="road-video-placeholder" style={{ display: 'none' }}>
                <div className="placeholder-content">
                  <i className="fas fa-video placeholder-icon"></i>
                  <p>Кадр {currentFrame + 1} из {currentFrameCount}</p>
                  <p className="distance-info">{formatDistance(currentTime)}</p>
                </div>
              </div>

              {/* Нижняя панель управления в полноэкранном режиме */}
              {isFullscreen && (
                <div className="frame-bottom-controls" aria-label="Управление просмотром (полный экран)">
                  <button className="zoom-button" onClick={handleZoomOut} title="Уменьшить">
                    <i className="fas fa-minus"></i>
                  </button>
                  <button className="zoom-button" onClick={handleZoomIn} title="Увеличить">
                    <i className="fas fa-plus"></i>
                  </button>
                  <button className="zoom-button" onClick={handleZoomReset} title="Сбросить масштаб">
                    <i className="fas fa-compress-arrows-alt"></i>
                  </button>
                  <div className="controls-divider"></div>
                  <button className="zoom-button" onClick={toggleFullscreen} title={isFullscreen ? 'Выйти из полного экрана' : 'На весь экран'}>
                    <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                  </button>
                  <button className="zoom-button compare-button" onClick={handleOpenCompareModal} title="AI Сравнение дат">
                    <i className="fas fa-magic-wand-sparkles"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Overlay с информацией */}
            <div className="video-overlay">
              <div className="frame-info">
                <span className="frame-counter">Кадр {currentFrame + 1} из {currentFrameCount}</span>
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
                tooltipType="video"
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

            {/* Кнопки зума/сравнения/полного экрана снизу */}
            <div className="view-controls" aria-label="Управление просмотром">
              <button className="zoom-button" onClick={handleZoomOut} title="Уменьшить">
                <i className="fas fa-minus"></i>
              </button>
              <button className="zoom-button" onClick={handleZoomIn} title="Увеличить">
                <i className="fas fa-plus"></i>
              </button>
              <button className="zoom-button" onClick={handleZoomReset} title="Сбросить масштаб">
                <i className="fas fa-compress-arrows-alt"></i>
              </button>
              <div className="controls-divider"></div>
              <button className="zoom-button" onClick={toggleFullscreen} title={isFullscreen ? 'Выйти из полного экрана' : 'На весь экран'}>
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
              </button>
              <button className="zoom-button compare-button" onClick={handleOpenCompareModal} title="AI Сравнение дат">
                <i className="fas fa-magic-wand-sparkles"></i>
              </button>
              <button
                className={`zoom-button map-toggle-button ${isMiniMapEnabled ? 'active' : ''}`}
                onClick={() => setIsMiniMapEnabled((v) => !v)}
                title={isMiniMapEnabled ? 'Скрыть мини‑карту' : 'Показать мини‑карту'}
                aria-pressed={isMiniMapEnabled}
              >
                <i className="fas fa-map"></i>
              </button>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={currentFrameCount - 1}
              value={currentFrame}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
              className="progress-slider"
            />
          </div>
        </div>

        {/* Справа: статусы AI */}
        <div className="ai-analysis-section right-pane">
          <div className="analysis-header">
            <h3>AI Анализ прогресса работ</h3>
          </div>

          {showAnalysis && analysisResults.length > 0 ? (
            <div className="analysis-result">
              <div className="analysis-segments">
                {analysisResults.filter(segment => segment.frameIndex < currentFrameCount).map((segment) => (
                  <div
                    key={segment.id}
                    className={`analysis-segment ${currentFrame === segment.frameIndex ? 'active' : ''}`}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    <div className="segment-header">
                      <div className="segment-image">
                        <img
                          src={frames[segment.frameIndex]?.imageUrl}
                          alt={`Кадр ${segment.frameIndex + 1}`}
                          className="segment-thumbnail"
                        />
                      </div>
                      <div className="segment-info">
                        <div className="segment-distance">{segment.distance}</div>
                        <div className="segment-title">{segment.title}</div>
                        <div className="segment-progress-row">
                          <div className="segment-status" style={{ color: getStatusColor(segment.status) }}>
                            <i className={getStatusIcon(segment.status)}></i>
                            {segment.status === 'completed' && 'Завершено'}
                            {segment.status === 'in_progress' && 'В работе'}
                            {segment.status === 'planned' && 'Запланировано'}
                          </div>
                          <div className="segment-percent">
                            {getSegmentProgress(segment.status)}% / 100%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="segment-description">{segment.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Нижняя область: графики */}
      <div ref={chartsContainerRef} className="stats-grid">
        {/* Слева: общий план */}
        <div className="stats-card overall-card">
          <div className="card-header">
            <h3>Общий план выполнения</h3>
          </div>
          <div className="chart-wrapper">
            {startCharts && (
              <ResponsiveContainer width="100%" height={280} key={`overall-${chartsKey}`}>
                <LineChart data={overallPlanData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="План" name="План (%)" stroke="#94a3b8" dot={false} isAnimationActive animationDuration={1200} strokeWidth={2} />
                  <Line type="monotone" dataKey="Факт" name="Факт (%)" stroke="#3b82f6" dot={false} isAnimationActive animationDuration={1200} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Справа: задачи */}
        <div className="tasks-panel">
          <div className="tasks-title">План выполнения по задачам</div>
          {taskCharts.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className={`task-percent ${task.percent < 50 ? 'danger' : ''}`}>{task.percent}/100%</div>
              </div>
              <div className={`mini-chart ${task.percent < 50 ? 'warn' : ''}`}>
                {startCharts && (
                  <ResponsiveContainer width="100%" height={100} key={`${task.id}-${chartsKey}`}>
                    <LineChart data={task.data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="План" name="План (%)" stroke="#94a3b8" dot={false} isAnimationActive animationDuration={1200} strokeWidth={2} />
                      <Line type="monotone" dataKey="Факт" name="Факт (%)" stroke="#3b82f6" dot={false} isAnimationActive animationDuration={1200} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="task-footer">
                {task.percent < 50 ? 'Предыдущие работы начались позже' : 'Начато с опозданием: 08 фев 2025'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно сравнения дат */}
      <DateComparisonModal
        isOpen={showCompareModal}
        onClose={handleCloseCompareModal}
        leftDate={new Date('2025-07-09')}
        rightDate={new Date('2025-07-14')}
        generateFramesForDate={generateFramesForDate}
        getAnalysisSegmentsByDate={getAnalysisSegmentsByDate}
      />
    </div>
  );
}

RoadVideoSection.propTypes = {
  // Пока без пропсов, но можно добавить в будущем
};

export default RoadVideoSection;