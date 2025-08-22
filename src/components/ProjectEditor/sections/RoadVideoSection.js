import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

// Импортируем компоненты из просмотра 360
import DateSelector from '../../Viewer360/components/DateSelector/DateSelector';
import VideoControls from '../../Viewer360/components/VideoControls/VideoControls';
import DateComparisonModal from './DateComparisonModal';
import YandexMiniMap from '../components/YandexMiniMap';
import PrescriptionsModal from '../components/PrescriptionsModal';
import AllPrescriptionsModal from '../components/AllPrescriptionsModal';
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

// Конфигурация кадров по Пикетам (ПК) для даты 26.03.2025
const PK_FRAMES = [
  { pk: 190, file: require('../../../data/img/roadImg_PK-190.jpg') },
  { pk: 198, file: require('../../../data/img/roadImg_PK-198.jpg') },
  { pk: 234, file: require('../../../data/img/roadImg_PK-234.jpg') },
  { pk: 243, file: require('../../../data/img/roadImg_PK-243.jpg') },
  { pk: 269, file: require('../../../data/img/roadImg_PK-269.jpg') },
];

// Статические пресеты ROI (четырёхугольник) по ПК из предоставленных данных
const ROI_PRESETS = {
  190: {
    label: 'ПК 190',
    points: {
      tl: { x: 48.43, y: 24.88 },
      tr: { x: 59.53, y: 24.88 },
      br: { x: 71.59, y: 95.95 },
      bl: { x: 24.05, y: 94.46 },
    },
  },
  198: {
    label: 'ПК 198',
    points: {
      tl: { x: 46.97, y: 21.31 },
      tr: { x: 57.82, y: 21.13 },
      br: { x: 75.13, y: 93.81 },
      bl: { x: 20.00, y: 90.00 },
    },
  },
  234: {
    label: 'ПК 234',
    points: {
      tl: { x: 46.24, y: 39.17 },
      tr: { x: 61.60, y: 39.88 },
      br: { x: 74.40, y: 96.31 },
      bl: { x: 16.74, y: 96.13 },
    },
  },
  243: {
    label: 'ПК 243',
    points: {
      tl: { x: 38.56, y: 27.92 },
      tr: { x: 58.79, y: 27.02 },
      br: { x: 86.10, y: 88.10 },
      bl: { x: 4.92, y: 88.63 },
    },
  },
  269: {
    label: 'ПК 269',
    points: {
      tl: { x: 34.29, y: 18.21 },
      tr: { x: 47.33, y: 19.18 },
      br: { x: 97.68, y: 78.57 },
      bl: { x: 9.91, y: 79.82 },
    },
  },
};

// Режим редактирования ROI (углы перетаскиваются, логируются координаты)
// По умолчанию выключен после фиксации координат
const EDIT_MODE = false;

// Генерация кадров: всегда используем 5 изображений ПК для указанной даты
const generateFramesForDate = () => {
  return PK_FRAMES.map((entry, index) => ({
    id: index,
    imageUrl: entry.file,
    frameIndex: index,
    pk: entry.pk,
    pkLabel: `ПК ${entry.pk}`,
  }));
};

// Сегменты анализа: один на каждый кадр ПК
const getAnalysisSegmentsByDate = () => {
  return PK_FRAMES.map((entry, index) => {
    if (entry.pk === 190) {
      return {
        id: index,
        frameIndex: index,
        title: `ПК ${entry.pk}`,
        status: 'in_progress',
        details: [
          'Установка закладных деталей — в работе',
          'Монтаж светильников — в работе',
          'Устройства дополнительного слоя основания из песка — в работе',
        ],
      };
    }
    if (entry.pk === 198) {
      return {
        id: index,
        frameIndex: index,
        title: `ПК ${entry.pk}`,
        status: 'in_progress',
        details: [
          'Монтаж железобетонного колодца — выполнено',
          'Укладка полиэтиленовых труб — в работе',
          'Устройство защитного футляра из песка — в работе',
        ],
      };
    }
    if (entry.pk === 234) {
      return {
        id: index,
        frameIndex: index,
        title: `ПК ${entry.pk}`,
        status: 'in_progress',
        details: [
          'Выполнены работы по устройству монолитного упора- в работе',
          'Утепление и защита пологом монолитной конструкции — выполнено',
        ],
      };
    }
    if (entry.pk === 243) {
      return {
        id: index,
        frameIndex: index,
        title: `ПК ${entry.pk}`,
        status: 'in_progress',
        details: [
          'Разработка , погрузка и отсыпка насыпи земляного полотна — в работе',
        ],
      };
    }
    if (entry.pk === 269) {
      return {
        id: index,
        frameIndex: index,
        title: `ПК ${entry.pk}`,
        status: 'in_progress',
        details: [
          'Устройство монолитных опор — выполнено',
          'Устройство монолитных подферменников — выполнено',
          'Нанесение гидроизоляции на крайние опоры — выполнено',
          'Установка РОЧ, монтаж балок 12 м — выполнено',
          'Работы по гидроизоляции мостового полотна — в работе',
          'Устройство деформационных швов — в работе',
        ],
      };
    }
    return {
      id: index,
      frameIndex: index,
      title: `ПК ${entry.pk}`,
      description: 'Состояние работ по данному пикету',
      status: index % 2 === 0 ? 'in_progress' : 'completed',
    };
  });
};

// Моковые данные для видео дороги
const mockRoadData = {
  dates: [
    { date: '2025-03-26', label: '26 марта 2025', available: true },
  ]
};

// Функция для получения данных общего плана по дате
const getOverallPlanDataByDate = () => {
  // Агрегируем общий процент по всем деталям всех ПК
  const segments = getAnalysisSegmentsByDate();
  const allDetails = segments.flatMap((s) => Array.isArray(s.details) ? s.details : []);
  const total = allDetails.length || 1;
  const completed = allDetails.filter((line) => /выполнено/i.test(String(line))).length;
  const overall = Math.round((completed / total) * 100);
  return [
    { name: 'Янв', План: 20, Факт: Math.round(overall * 0.3) },
    { name: 'Фев', План: 40, Факт: Math.round(overall * 0.6) },
    { name: 'Мар', План: 60, Факт: overall },
  ];
};

// Функция для получения данных задач по дате
const getTaskChartsByDate = () => {
  // Готовим мини-графики по каждому ПК на основе % готовности деталей
  const segments = getAnalysisSegmentsByDate();
  return segments.map((segment) => {
    let percent = 0;
    if (Array.isArray(segment.details) && segment.details.length > 0) {
      const total = segment.details.length;
      const completed = segment.details.filter((line) => /выполнено/i.test(String(line))).length;
      percent = Math.round((completed / total) * 100);
    } else {
      percent = segment.status === 'completed' ? 100 : (segment.status === 'in_progress' ? 40 : 0);
    }
    return {
      id: `task-${segment.frameIndex}`,
      title: segment.title,
      percent,
      data: [
        { name: 'Янв', План: Math.min(100, Math.max(0, Math.round(percent * 0.5))), Факт: Math.max(0, Math.round(percent * 0.3)) },
        { name: 'Фев', План: Math.min(100, Math.max(0, Math.round(percent * 0.8))), Факт: Math.max(0, Math.round(percent * 0.6)) },
        { name: 'Мар', План: percent, Факт: percent },
      ]
    };
  });
};

function RoadVideoSection() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-03-26'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(() => getAnalysisSegmentsByDate());
  const [frames, setFrames] = useState(() => generateFramesForDate());
  const [overallPlanData, setOverallPlanData] = useState(() => getOverallPlanDataByDate());
  const [taskCharts, setTaskCharts] = useState(() => getTaskChartsByDate());
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [showAllPrescriptionsModal, setShowAllPrescriptionsModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
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

  // Прямоугольники по кадрам (ROI), координаты в процентах 0..100
  const [rectanglesByFrame, setRectanglesByFrame] = useState([]);
  const svgRef = useRef(null);
  const dragRef = useRef({ active: false, corner: null });
  const [isRoiHovered, setIsRoiHovered] = useState(false);

  // Frame transition overlay state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFromUrl, setTransitionFromUrl] = useState(null);
  const [transitionToUrl, setTransitionToUrl] = useState(null);
  const transitionTimerRef = useRef(null);

  // Текущее количество кадров
  const currentFrameCount = useMemo(() => frames.length, [frames]);

  // Навигация по кадрам
  const goToPreviousFrame = useCallback(() => {
    setCurrentFrame(prev => Math.max(0, prev - 1));
  }, []);

  // Zoom handlers - УЛУЧШЕННАЯ ВЕРСИЯ для детального осмотра узлов
  const handleZoomIn = useCallback(() => {
    const container = frameContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newZoom = Math.min(8, zoom + 0.25);
    const zoomRatio = newZoom / zoom;
    
    // Пересчитываем панорамирование с учётом origin в левом верхнем углу
    const nextPanX = centerX - (centerX - pan.x) * zoomRatio;
    const nextPanY = centerY - (centerY - pan.y) * zoomRatio;
    const { x: newPanX, y: newPanY } = clampPan(nextPanX, nextPanY, newZoom);
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    setTargetZoom(newZoom);
    setTargetPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, clampPan]);

  const handleZoomOut = useCallback(() => {
    const container = frameContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newZoom = Math.max(1, zoom - 0.25);
    const zoomRatio = newZoom / zoom;
    
    const nextPanX = centerX - (centerX - pan.x) * zoomRatio;
    const nextPanY = centerY - (centerY - pan.y) * zoomRatio;
    const { x: newPanX, y: newPanY } = clampPan(nextPanX, nextPanY, newZoom);
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    setTargetZoom(newZoom);
    setTargetPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, clampPan]);
  
  // Новый: умный zoom к точке клика для осмотра узлов
  const handleSmartZoomToPoint = useCallback((clientX, clientY, zoomLevel = 4.5) => {
    const container = frameContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    const targetZoomLevel = Math.min(8, zoomLevel);
    const zoomRatio = targetZoomLevel / zoom;
    
    // Сохраняем точку под курсором неизменной (origin: top-left)
    const nextPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const nextPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    const clamped = clampPan(nextPanX, nextPanY, targetZoomLevel);
    
    setTargetPan(clamped);
    setTargetZoom(targetZoomLevel);
  }, [zoom, pan, clampPan]);

  // Новый: быстрый zoom на ROI область для осмотра труб/колодцев/опор
  const handleQuickZoomToROI = useCallback(() => {
    const roiData = rectanglesByFrame[currentFrame];
    if (!roiData?.points) return;
    
    // Центрируем на ROI области
    const { tl, tr, br, bl } = roiData.points;
    const centerX = (tl.x + tr.x + br.x + bl.x) / 4;
    const centerY = (tl.y + tr.y + br.y + bl.y) / 4;
    
    // Преобразуем процентные координаты в пиксели
    const container = frameContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const pixelX = rect.left + (centerX / 100) * rect.width;
    const pixelY = rect.top + (centerY / 100) * rect.height;
    
    handleSmartZoomToPoint(pixelX, pixelY, 5); // Мягкий zoom на ROI
  }, [currentFrame, rectanglesByFrame, handleSmartZoomToPoint]);

  const handleZoomReset = useCallback(() => { 
    setZoom(1); 
    setPan({ x: 0, y: 0 }); 
    setTargetZoom(1); 
    setTargetPan({ x: 0, y: 0 }); 
  }, []);

  const clampPan = useCallback((x, y, nextZoom) => {
    const container = frameContainerRef.current;
    if (!container) return { x, y };
    const rect = container.getBoundingClientRect();
    const z = nextZoom ?? zoom;
    const scaledW = rect.width * z;
    const scaledH = rect.height * z;
    // Ограничиваем перемещение так, чтобы изображение не выходило за пределы контейнера
    const minX = Math.min(0, rect.width - scaledW);
    const maxX = 0;
    const minY = Math.min(0, rect.height - scaledH);
    const maxY = 0;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    const clampedY = Math.max(minY, Math.min(maxY, y));
    return { x: clampedX, y: clampedY };
  }, [zoom]);

  const handleWheel = useCallback((e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    // Оптимизация: проверяем на слишком частые события
    const now = performance.now();
    if (wheelEndTimerRef.current && (now - wheelEndTimerRef.current) < 16) return; // 60fps ограничение
    wheelEndTimerRef.current = now;
    
    setIsZooming(true);
    const container = frameContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    // Получаем позицию курсора относительно контейнера
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const direction = e.deltaY > 0 ? -1 : 1; // вверх увеличить, вниз уменьшить
    const zoomStep = e.ctrlKey ? 0.3 : 0.15;
    const deltaZoom = zoomStep * direction;
    const newZoom = Math.max(1, Math.min(8, zoom + deltaZoom));
    
    if (newZoom !== zoom) {
      const zoomRatio = newZoom / zoom;
      // Держим точку под курсором на месте
      const nextPanX = mouseX - (mouseX - pan.x) * zoomRatio;
      const nextPanY = mouseY - (mouseY - pan.y) * zoomRatio;
      const clamped = clampPan(nextPanX, nextPanY, newZoom);
      // Плавно обновляем через целевые значения
      setTargetZoom(newZoom);
      setTargetPan(clamped);
    }
    
    // Дебаунс для сброса флага зума
    setTimeout(() => setIsZooming(false), 100);
  }, [zoom, pan, clampPan]);

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
    
    // Оптимизация: throttling для плавности при большом зуме
    const now = performance.now();
    if (onMouseMove.lastTime && (now - onMouseMove.lastTime) < 8) return; // 120fps ограничение
    onMouseMove.lastTime = now;
    
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    const next = clampPan(panStartRef.current.x + dx, panStartRef.current.y + dy);
    setTargetPan(next);
  }, [isPanning, clampPan]);

  const handleContainerMouseMove = useCallback((e) => {
    onMouseMove(e);
  }, [onMouseMove]);

  // При выходе курсора просто завершаем панорамирование
  const handleContainerMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Инициализация ROI четырёхугольника на каждый кадр (с учётом пресетов по ПК)
  useEffect(() => {
    setRectanglesByFrame((prev) => {
      const next = [...prev];
      for (let i = 0; i < frames.length; i += 1) {
        if (!next[i]) {
          const preset = ROI_PRESETS[frames[i]?.pk];
          next[i] = preset ?
            { label: preset.label, points: { ...preset.points } } :
            {
              points: {
                tl: { x: 20, y: 60 },
                tr: { x: 80, y: 60 },
                br: { x: 80, y: 90 },
                bl: { x: 20, y: 90 },
              },
              label: frames[i]?.pkLabel || `Frame ${i}`,
            };
        } else if (!next[i].points) {
          // если старый формат попал — превратим в points
          const r = next[i];
          next[i] = {
            points: {
              tl: { x: r.x1 ?? 20, y: r.y1 ?? 60 },
              tr: { x: r.x2 ?? 80, y: r.y1 ?? 60 },
              br: { x: r.x2 ?? 80, y: r.y2 ?? 90 },
              bl: { x: r.x1 ?? 20, y: r.y2 ?? 90 },
            },
            label: r.label ?? (frames[i]?.pkLabel || `Frame ${i}`),
          };
        }
      }
      return next.slice(0, frames.length);
    });
  }, [frames]);

  // Преобразование clientXY => координаты SVG (0..100)
  const clientToSvgPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const inv = svg.getScreenCTM()?.inverse();
    if (!inv) return { x: 0, y: 0 };
    const svgP = pt.matrixTransform(inv);
    return {
      x: Math.max(0, Math.min(100, svgP.x)),
      y: Math.max(0, Math.min(100, svgP.y)),
    };
  }, []);

  const logRect = useCallback((frameIndex, data) => {
    // Поддержка обратной совместимости: если пришёл старый формат x1..y2 — конвертируем в points
    let points = data?.points;
    if (!points && data && typeof data.x1 === 'number') {
      points = {
        tl: { x: data.x1, y: data.y1 },
        tr: { x: data.x2, y: data.y1 },
        br: { x: data.x2, y: data.y2 },
        bl: { x: data.x1, y: data.y2 },
      };
    }
    const safe = (n) => Number((n ?? 0).toFixed?.(2) ?? n);
    const payload = {
      frameIndex,
      pk: frames[frameIndex]?.pk,
      label: data?.label,
      quad: points ? {
        tl: { x: safe(points.tl?.x), y: safe(points.tl?.y) },
        tr: { x: safe(points.tr?.x), y: safe(points.tr?.y) },
        br: { x: safe(points.br?.x), y: safe(points.br?.y) },
        bl: { x: safe(points.bl?.x), y: safe(points.bl?.y) },
      } : undefined,
    };
    // eslint-disable-next-line no-console
    console.log('[Road ROI]', payload);
  }, [frames]);

  // Перетаскивание угловых ручек (создаём общий 4-угольник)
  const handleCornerMouseDown = useCallback((corner) => (e) => {
    if (!EDIT_MODE) return; // фиксированный режим — редактирование отключено
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { active: true, corner };

    const onMove = (ev) => {
      if (!dragRef.current.active) return;
      const p = clientToSvgPoint(ev.clientX, ev.clientY);
      setRectanglesByFrame((prev) => {
        const next = [...prev];
        const current = next[currentFrame];
        let data = current;
        if (!data) {
          data = {
            points: {
              tl: { x: 20, y: 60 },
              tr: { x: 80, y: 60 },
              br: { x: 80, y: 90 },
              bl: { x: 20, y: 90 },
            },
            label: frames[currentFrame]?.pkLabel || `Frame ${currentFrame}`,
          };
        }
        const points = {
          tl: { ...data.points.tl },
          tr: { ...data.points.tr },
          br: { ...data.points.br },
          bl: { ...data.points.bl },
        };
        if (points[corner]) {
          points[corner] = { x: p.x, y: p.y };
        }
        next[currentFrame] = { ...data, points };
        logRect(currentFrame, next[currentFrame]);
        return next;
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragRef.current.active) {
        dragRef.current = { active: false, corner: null };
        const data = rectanglesByFrame[currentFrame];
        if (data) logRect(currentFrame, data);
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [clientToSvgPoint, currentFrame, logRect, rectanglesByFrame, frames]);

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
          // Сбрасываем зум/панорамирование, чтобы показать изображение целиком
          setTargetZoom(1);
          setTargetPan({ x: 0, y: 0 });
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
    const onFsChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      if (fs) {
        // Жёстко сбрасываем визуальные параметры для избежания обрезания
        setTargetZoom(1);
        setTargetPan({ x: 0, y: 0 });
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
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
    // Для новой конфигурации дата влияет только на подпись
    setFrames(generateFramesForDate());
    setAnalysisResults(getAnalysisSegmentsByDate());
    setOverallPlanData(getOverallPlanDataByDate());
    setTaskCharts(getTaskChartsByDate());
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

  // Процент готовности для сегмента: по детализированным пунктам
  const getSegmentProgress = useCallback((segment) => {
    if (Array.isArray(segment?.details) && segment.details.length > 0) {
      const total = segment.details.length;
      const completed = segment.details.filter((line) => /выполнено/i.test(String(line))).length;
      return Math.round((completed / total) * 100);
    }
    if (segment?.status === 'completed') return 100;
    if (segment?.status === 'in_progress') return 40;
    return 0;
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

  // В новой конфигурации не отображаем ни время, ни расстояние

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

  // Обработчики предписаний
  const handleOpenPrescriptionsModal = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {
      // no-op
    } finally {
      setShowPrescriptionsModal(true);
    }
  }, []);

  const handleClosePrescriptionsModal = useCallback(() => {
    setShowPrescriptionsModal(false);
  }, []);

  const handlePrescriptionAdd = useCallback((prescription) => {
    setPrescriptions(prev => [...prev, prescription]);
  }, []);

  const handlePrescriptionUpdate = useCallback((prescriptionId, updates) => {
    setPrescriptions(prev => 
      prev.map(p => p.id === prescriptionId ? { ...p, ...updates } : p)
    );
  }, []);

  // Обработчики для AllPrescriptionsModal
  const handleOpenAllPrescriptionsModal = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {
      // no-op
    } finally {
      setShowAllPrescriptionsModal(true);
    }
  }, []);

  const handleCloseAllPrescriptionsModal = useCallback(() => {
    setShowAllPrescriptionsModal(false);
  }, []);

  const handlePrescriptionView = useCallback((prescription) => {
    // Переходим к кадру с предписанием
    if (prescription.frameIndex !== undefined) {
      setCurrentFrame(prescription.frameIndex);
    }
    // Закрываем модальное окно
    setShowAllPrescriptionsModal(false);
    // Можно добавить дополнительную логику, например, подсветку области ROI
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
              {(() => {
                const sharedTransform = {
                  transition: isZooming ? 'none' : (zoom > 1 ? 'transform 0.08s ease-out' : 'transform 0.2s ease-out'),
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                };
                return (
                  <>
                    <img
                      key={`frame-${currentFrame}`}
                      src={frames[currentFrame]?.imageUrl}
                      alt={`Дорожный кадр ${frames[currentFrame]?.pkLabel}`}
                      className="road-frame-image"
                      draggable={false}
                      style={{...sharedTransform, cursor: isPanning ? 'grabbing' : (zoom > 1 ? 'grab' : 'zoom-in')}}
                      onClick={(e) => {
                        // Умный zoom к точке клика для детального осмотра узлов
                        if (e.ctrlKey || e.metaKey) {
                          handleQuickZoomToROI(); // Быстрый zoom на ROI при Ctrl+клик
                        } else {
                          handleSmartZoomToPoint(e.clientX, e.clientY); // Обычный smart zoom
                        }
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.closest('.road-frame-container')?.querySelector('.road-video-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />

                    {/* SVG оверлей с редактируемым четырёхугольником */}
                    <svg
                      ref={svgRef}
                      className="road-rect-overlay"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={sharedTransform}
                    >
                      {rectanglesByFrame[currentFrame] ? (() => {
                        const r = rectanglesByFrame[currentFrame];
                        const tl = r.points?.tl || { x: 20, y: 60 };
                        const tr = r.points?.tr || { x: 80, y: 60 };
                        const br = r.points?.br || { x: 80, y: 90 };
                        const bl = r.points?.bl || { x: 20, y: 90 };
                        const path = `M ${tl.x},${tl.y} L ${tr.x},${tr.y} L ${br.x},${br.y} L ${bl.x},${bl.y} Z`;
                        const centerX = (tl.x + tr.x + br.x + bl.x) / 4;
                        const topY = Math.min(tl.y, tr.y, br.y, bl.y);
                        const labelY = Math.max(3, topY - 1.5);
                        return (
                          <g className="roi-group">
                            <path
                              d={path}
                              className={`roi-rect ${isRoiHovered ? 'visible' : 'hidden'}`}
                              onMouseEnter={() => setIsRoiHovered(true)}
                              onMouseLeave={() => setIsRoiHovered(false)}
                              onWheel={(e) => handleWheel(e)}
                            />
                            <circle className="roi-handle tl" cx={tl.x} cy={tl.y} r="1.8" onMouseDown={handleCornerMouseDown('tl')} style={{ display: EDIT_MODE ? 'block' : 'none' }} />
                            <circle className="roi-handle tr" cx={tr.x} cy={tr.y} r="1.8" onMouseDown={handleCornerMouseDown('tr')} style={{ display: EDIT_MODE ? 'block' : 'none' }} />
                            <circle className="roi-handle bl" cx={bl.x} cy={bl.y} r="1.8" onMouseDown={handleCornerMouseDown('bl')} style={{ display: EDIT_MODE ? 'block' : 'none' }} />
                            <circle className="roi-handle br" cx={br.x} cy={br.y} r="1.8" onMouseDown={handleCornerMouseDown('br')} style={{ display: EDIT_MODE ? 'block' : 'none' }} />
                            {/* Подпись внутри 4-угольника снизу */}
                            {(() => {
                              const bottomY = Math.max(tl.y, tr.y, br.y, bl.y);
                              const labelInsideY = bottomY - 1.8; // чуть выше нижней границы
                              return (
                                <text x={centerX} y={labelInsideY} textAnchor="middle" className={`roi-label ${isRoiHovered ? 'visible' : 'hidden'}`}>
                                  {r.label || frames[currentFrame]?.pkLabel}
                                </text>
                              );
                            })()}
                          </g>
                        );
                      })() : null}
                    </svg>
                  </>
                );
              })()}

              {/* Animated frame transition overlay */}
              {isTransitioning && (
                <div className="frame-transition-overlay" aria-hidden>
                  <img src={transitionFromUrl} alt="from" className="transition-image from" />
                  <img src={transitionToUrl} alt="to" className="transition-image to" />
                </div>
              )}

              {/* Удалили старую трапецию-навигацию */}
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
                  <p>{frames[currentFrame]?.pkLabel}</p>
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
                  <button className="zoom-button roi-zoom-button" onClick={handleQuickZoomToROI} title="Zoom на область работ (ROI)">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                  <div className="controls-divider"></div>
                  <button className="zoom-button" onClick={toggleFullscreen} title={isFullscreen ? 'Выйти из полного экрана' : 'На весь экран'}>
                    <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                  </button>
                  <button className="zoom-button compare-button" onClick={handleOpenCompareModal} title="AI Сравнение дат">
                    <i className="fas fa-magic-wand-sparkles"></i>
                  </button>
                  <button className="zoom-button prescriptions-button" onClick={handleOpenPrescriptionsModal} title="Предписания по участку">
                    <i className="fas fa-clipboard-list"></i>
                  </button>
                  <button className="zoom-button all-prescriptions-button" onClick={handleOpenAllPrescriptionsModal} title={`Все предписания (${prescriptions.length})`}>
                    <i className="fas fa-list-check"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Overlay с PK-меткой */}
            <div className="video-overlay">
              <div className="frame-info">
                <span className="pk-label">{frames[currentFrame]?.pkLabel}</span>
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
              <button className="zoom-button roi-zoom-button" onClick={handleQuickZoomToROI} title="Zoom на область работ (ROI)">
                <i className="fas fa-crosshairs"></i>
              </button>
              <div className="controls-divider"></div>
              <button className="zoom-button" onClick={toggleFullscreen} title={isFullscreen ? 'Выйти из полного экрана' : 'На весь экран'}>
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
              </button>
              <button className="zoom-button compare-button" onClick={handleOpenCompareModal} title="AI Сравнение дат">
                <i className="fas fa-magic-wand-sparkles"></i>
              </button>
              <button className="zoom-button prescriptions-button" onClick={handleOpenPrescriptionsModal} title="Предписания по участку">
                <i className="fas fa-clipboard-list"></i>
              </button>
              <button className="zoom-button all-prescriptions-button" onClick={handleOpenAllPrescriptionsModal} title={`Все предписания (${prescriptions.length})`}>
                <i className="fas fa-list-check"></i>
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
            <h3>ИИ Анализ прогресса работ</h3>
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
                          alt={frames[segment.frameIndex]?.pkLabel}
                          className="segment-thumbnail"
                        />
                      </div>
                       <div className="segment-info">
                        <div className="segment-title">{segment.title}</div>
                        <div className="segment-progress-row">
                          <div className="segment-status" style={{ color: getStatusColor(segment.status) }}>
                            <i className={getStatusIcon(segment.status)}></i>
                            {segment.status === 'completed' && 'Завершено'}
                            {segment.status === 'in_progress' && 'В работе'}
                            {segment.status === 'planned' && 'Запланировано'}
                          </div>
                          <div className="segment-percent">
                            {getSegmentProgress(segment)}% / 100%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="segment-description">
                      {Array.isArray(segment.details) ? (
                        <ul className="segment-details">
                          {segment.details.map((line, i) => {
                            const parts = String(line).split(/—|-/);
                            const task = parts[0]?.trim() || String(line);
                            const statusRaw = parts[1]?.trim()?.toLowerCase() || '';
                            const isCompleted = /выполнено/.test(statusRaw);
                            const isInProgress = /в работе/.test(statusRaw);
                            const statusClass = isCompleted ? 'completed' : (isInProgress ? 'in-progress' : 'neutral');
                            const statusLabel = isCompleted ? 'Выполнено' : (isInProgress ? 'В работе' : (parts[1]?.trim() || ''));
                            const iconClass = isCompleted ? 'fa-check-circle' : (isInProgress ? 'fa-clock' : 'fa-circle');
                            return (
                              <li key={i} className={`detail-item ${statusClass}`}>
                                <span className="detail-icon"><i className={`fas ${iconClass}`}></i></span>
                                <span className="detail-task">{task}</span>
                                {statusLabel && (
                                  <span className={`detail-status ${statusClass}`}>{statusLabel}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        segment.description
                      )}
                    </div>
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

      {/* Модальное окно предписаний */}
      <PrescriptionsModal
        isOpen={showPrescriptionsModal}
        onClose={handleClosePrescriptionsModal}
        frameData={frames[currentFrame]}
        roiData={rectanglesByFrame[currentFrame]}
        currentFrame={currentFrame}
        onPrescriptionAdd={handlePrescriptionAdd}
        onPrescriptionUpdate={handlePrescriptionUpdate}
        prescriptions={prescriptions}
      />

      {/* Модальное окно всех предписаний */}
      <AllPrescriptionsModal
        isOpen={showAllPrescriptionsModal}
        onClose={handleCloseAllPrescriptionsModal}
        prescriptions={prescriptions}
        onPrescriptionUpdate={handlePrescriptionUpdate}
        onPrescriptionView={handlePrescriptionView}
      />
    </div>
  );
}

RoadVideoSection.propTypes = {
  // Пока без пропсов, но можно добавить в будущем
};

export default RoadVideoSection;