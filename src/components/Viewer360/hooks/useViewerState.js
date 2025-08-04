import { useState, useCallback } from 'react';

/**
 * Хук для управления основными состояниями компонента Viewer360
 */
const useViewerState = () => {
  // Основные режимы просмотра
  const [viewMode, setViewMode] = useState('generic360');
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Состояния для сравнения
  const [comparisonPhoto, setComparisonPhoto] = useState(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);
  
  // Состояния интерфейса
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [currentCamera, setCurrentCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSidebarSection, setCurrentSidebarSection] = useState('images');
  
  // Состояния схем
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
  const [isSchemeSearchVisible, setIsSchemeSearchVisible] = useState(false);
  const [isSchemeDropdownOpen, setIsSchemeDropdownOpen] = useState(false);
  
  // Состояния миникарты
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState(1);
  const [minimapPosition, setMinimapPosition] = useState({ x: 0, y: 0 });
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  
  // Состояния даты и времени
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 24));
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shootingTime, setShootingTime] = useState('14:30');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Состояния изображений OP убраны - используется imageManagement.currentOPImageIndex

  // Обработчики
  const handleFiltersClick = useCallback(() => {
    // Заглушка - переключаем состояние для демонстрации
    setHasActiveFilters(prev => !prev);
  }, []);

  return {
    // Основные режимы
    viewMode,
    setViewMode,
    selectedRoomKey,
    setSelectedRoomKey,
    selectedPhoto,
    setSelectedPhoto,
    selectedVideo,
    setSelectedVideo,
    currentFrameIndex,
    setCurrentFrameIndex,
    
    // Сравнение
    comparisonPhoto,
    setComparisonPhoto,
    isComparisonMode,
    setIsComparisonMode,
    showComparisonSelector,
    setShowComparisonSelector,
    
    // Интерфейс
    hoveredSidebarItem,
    setHoveredSidebarItem,
    currentCamera,
    setCurrentCamera,
    isExpanded,
    setIsExpanded,
    currentSidebarSection,
    setCurrentSidebarSection,
    
    // Схемы
    selectedScheme,
    setSelectedScheme,
    schemeSearchQuery,
    setSchemeSearchQuery,
    isSchemeSearchVisible,
    setIsSchemeSearchVisible,
    isSchemeDropdownOpen,
    setIsSchemeDropdownOpen,
    
    // Миникарта
    isMinimapVisible,
    setIsMinimapVisible,
    isMinimapExpanded,
    setIsMinimapExpanded,
    minimapZoom,
    setMinimapZoom,
    minimapPosition,
    setMinimapPosition,
    isMinimapDragging,
    setIsMinimapDragging,
    
    // Дата и время
    selectedDate,
    setSelectedDate,
    isVideoPlaying,
    setIsVideoPlaying,
    shootingTime,
    setShootingTime,
    hasActiveFilters,
    setHasActiveFilters,
    
    // Изображения OP убраны - используется imageManagement
    
    // Обработчики
    handleFiltersClick,
  };
};

export default useViewerState;