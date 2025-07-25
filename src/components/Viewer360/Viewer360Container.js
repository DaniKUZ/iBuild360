import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from './components/PanoramaViewer/PanoramaViewer';
import SchemesView from './components/SchemesView';
import DateSelector from './components/DateSelector/DateSelector';
import VideoControls from './components/VideoControls/VideoControls';
import FilterControls from './components/FilterControls/FilterControls';
import TopToolbar from './components/TopToolbar';
import ViewerControlsSidebar from './components/ViewerControlsSidebar';
import FieldNoteMarkers from './components/FieldNoteMarkers';
import ViewerSidebar from './components/ViewerSidebar';
import AIComparisonSidebar from './components/AIComparisonSidebar';
import TimelapsesSection from './components/TimelapsesSection';
import DroneShotsSection from './components/DroneShotsSection';
import { FieldNoteModal, ParticipantModal } from '../ProjectEditor/modals';
import usePanoramaSync from './components/PanoramaViewer/hooks/usePanoramaSync';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../../utils/userManager';
import { API_CONFIG } from '../../config/api';
import { 
  mockPhotoArchive, 
  getAllRooms, 
  getRoomByPhotoId, 
  getComparisonPhotos 
} from '../../data/photoArchive';
import img360 from '../../data/img/img360.jpg';

// Импорты изображений OP второго этажа
import opImg1Current from '../../data/img/OPImg360_1_floor2.jpg';
import opImg2Current from '../../data/img/OPImg360_2_floor2.jpg';
import opImg3Current from '../../data/img/OPImg360_3_floor2.jpg';
import opImg4Current from '../../data/img/OPImg360_4_floor2.jpg';
import opImg5Current from '../../data/img/OPImg360_5_floor2.jpg';

import opImg1Past from '../../data/img/OPImg360_1_past_floor2.jpg';
import opImg2Past from '../../data/img/OPImg360_2_past_floor2.jpg';
import opImg3Past from '../../data/img/OPImg360_3_past_floor2.jpg';
import opImg4Past from '../../data/img/OPImg360_4_past_floor2.jpg';
import opImg5Past from '../../data/img/OPImg360_5_past_floor2.jpg';

import opImg1PastPast from '../../data/img/OPImg360_1_past_past_floor2.jpg';
import opImg2PastPast from '../../data/img/OPImg360_2_past_past_floor2.jpg';
import opImg3PastPast from '../../data/img/OPImg360_3_past_past_floor2.jpg';
import opImg4PastPast from '../../data/img/OPImg360_4_past_past_floor2.jpg';
import opImg5PastPast from '../../data/img/OPImg360_5_past_past_floor2.jpg';

// Импорты изображений OP первого этажа
import opImg1CurrentFloor1 from '../../data/img/OPImg360_1_floor1.jpg';
import opImg2CurrentFloor1 from '../../data/img/OPImg360_2_floor1.jpg';
import opImg3CurrentFloor1 from '../../data/img/OPImg360_3_floor1.jpg';

import opImg1PastFloor1 from '../../data/img/OPImg360_1_past_floor1.jpg';
import opImg2PastFloor1 from '../../data/img/OPImg360_2_past_floor1.jpg';
import opImg3PastFloor1 from '../../data/img/OPImg360_3_past_floor1.jpg';

import opImg1PastPastFloor1 from '../../data/img/OPImg360_1_past_past_floor1.jpg';
import opImg2PastPastFloor1 from '../../data/img/OPImg360_2_past_past_floor1.jpg';
import opImg3PastPastFloor1 from '../../data/img/OPImg360_3_past_past_floor1.jpg';

import styles from './Viewer360Container.module.css';

const Viewer360Container = ({ project, onBack }) => {
  const navigate = useNavigate();
  const currentUser = getUserData();
  // Режимы просмотра: 'initial', 'archive', 'roomGroup', 'viewer', 'video360List', 'videoWalkthrough', 'generic360'
  const [viewMode, setViewMode] = useState('generic360');
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [comparisonPhoto, setComparisonPhoto] = useState(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [currentCamera, setCurrentCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSidebarSection, setCurrentSidebarSection] = useState('images'); // Текущий активный раздел
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isSchemeSearchVisible, setIsSchemeSearchVisible] = useState(false);
  const [isSchemeDropdownOpen, setIsSchemeDropdownOpen] = useState(false);
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState(1);
  const [minimapPosition, setMinimapPosition] = useState({ x: 0, y: 0 });
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  
  // Состояния для новых компонентов нижнего сайдбара
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 24)); // 24 июля 2025 по умолчанию
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shootingTime, setShootingTime] = useState('14:30'); // Время съемки
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Состояния для работы с изображениями OP второго этажа
  const [currentOPImageIndex, setCurrentOPImageIndex] = useState(1); // Индекс изображения (1-3 для первого этажа, 1-5 для второго)

  // Состояния для полевых заметок
  const [isFieldNoteMode, setIsFieldNoteMode] = useState(false);
  const [isFieldNoteModalOpen, setIsFieldNoteModalOpen] = useState(false);
  const [fieldNotePosition, setFieldNotePosition] = useState(null);
  const [fieldNoteScreenshot, setFieldNoteScreenshot] = useState(null);
  const [fieldNotes, setFieldNotes] = useState([]); // Хранилище созданных заметок
  const [editingFieldNote, setEditingFieldNote] = useState(null); // Редактируемая заметка
  const [isFieldNotesSidebarVisible, setIsFieldNotesSidebarVisible] = useState(false); // Видимость сайдбара полевых заметок
  const [isTimelapsesSectionVisible, setIsTimelapsesSectionVisible] = useState(false); // Видимость раздела таймлапсов
  const [isDroneShotsSectionVisible, setIsDroneShotsSectionVisible] = useState(false); // Видимость раздела съемки с дронов
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false); // Видимость модального окна участников

  // Состояния для режима разделения экрана
  const [isSplitScreenMode, setIsSplitScreenMode] = useState(false);
  const [leftPanelImage, setLeftPanelImage] = useState(null); // Изображение левой панели
  const [rightPanelImage, setRightPanelImage] = useState(null); // Изображение правой панели
  const [leftPanelDate, setLeftPanelDate] = useState(new Date(2025, 6, 24)); // Дата для левой панели (current)
  const [rightPanelDate, setRightPanelDate] = useState(new Date(2025, 6, 12)); // Дата для правой панели (past)

  // Состояния для AI сравнения
  const [isAIComparisonSidebarVisible, setIsAIComparisonSidebarVisible] = useState(false);
  const [aiComparisonImages, setAIComparisonImages] = useState([]); // Изображения для AI сравнения
  const [aiAnalysisResult, setAIAnalysisResult] = useState(null); // Результат AI анализа
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false); // Состояние процесса анализа



  // Функция для анализа изображений с помощью OpenAI API
  const analyzeImagesWithAI = async (images) => {
    if (images.length !== 2) return;

    setIsAIAnalyzing(true);
    setAIAnalysisResult(null);

    try {
      // Конвертируем изображения в base64 с уменьшением размера
      const imageDataPromises = images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Создаем canvas для уменьшения размера
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Уменьшаем до максимум 800px по большей стороне
            const maxSize = 800;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Рисуем уменьшенное изображение
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем в base64 с качеством 0.7
            const base64data = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            resolve(base64data);
          };
          img.src = URL.createObjectURL(blob);
        });
      });

      const imageDataArray = await Promise.all(imageDataPromises);

      const systemMessage = "Ты - строительный аналитик.";
      const userPrompt = (
        "Перед тобой две фотографии со строительной площадки, снятые с одинаковых ракурсов. " +
        "Определи, какой прогресс сделан в строительных работах и выдай свой анализ. " +
        "Анализируй фото максимально детально и точно, вывод напиши не очень объемный " +
        "(вывод должен содержать, какие работы были завершены в промежутке между двумя фото)."
      );

      const messages = [
        { "role": "system", "content": systemMessage },
        { 
          "role": "user", 
          "content": [
            { "type": "text", "text": userPrompt },
            { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${imageDataArray[0]}` } },
            { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${imageDataArray[1]}` } }
          ]
        }
      ];

      // Если демо-режим, используем локальную заглушку
      if (API_CONFIG.USE_DEMO) {
        // Имитируем задержку анализа
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const demoResult = `🏗️ АНАЛИЗ СТРОИТЕЛЬНОГО ПРОГРЕССА:

📊 За период между фотографиями выполнены следующие работы:

✅ ЗАВЕРШЕННЫЕ РАБОТЫ:
• Установлена внутренняя перегородка в левой части помещения  
• Выполнена штукатурка стен в центральной зоне
• Проложена электропроводка по потолку
• Установлены оконные рамы

🔄 НАЧАТЫЕ РАБОТЫ:
• Подготовка пола под финишное покрытие
• Монтаж системы вентиляции

📈 ПРОГРЕСС: Примерно 65% работ по данному участку завершены.

⚠️ ДЕМО-РЕЖИМ: Для получения реального AI анализа необходимо настроить сервер с поддержкой OpenAI API.`;

        setAIAnalysisResult(demoResult);
        setIsAIAnalyzing(false);
        return;
      }

      // Для реального API
      let apiUrl = API_CONFIG.OPENAI_API_URL;
      let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 400,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content.trim();
      
      setAIAnalysisResult(analysisText);
    } catch (error) {
      console.error('Ошибка при анализе изображений:', error);
      setAIAnalysisResult('Произошла ошибка при анализе изображений. Попробуйте еще раз.');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Функция добавления изображений для AI сравнения
  const handleAddToAIComparison = () => {
    if (!isSplitScreenMode || !leftPanelImage || !rightPanelImage) return;
    
    // Проверяем, что изображения из разных дат
    if (leftPanelDate.getTime() === rightPanelDate.getTime()) {
      alert('Нельзя сравнить одинаковые изображения. Выберите изображения из разных дат.');
      return;
    }

    const newImages = [
      {
        url: getLeftPanelImageUrl(),
        date: leftPanelDate.toISOString()
      },
      {
        url: getRightPanelImageUrl(),
        date: rightPanelDate.toISOString()
      }
    ];

    setAIComparisonImages(newImages);
    setCurrentSidebarSection('ai-comparison');
    setIsAIComparisonSidebarVisible(true);
  };

  // Функция закрытия AI сравнения
  const handleCloseAIComparison = () => {
    setIsAIComparisonSidebarVisible(false);
  };

  // Логгирование изменений viewMode для отладки
  useEffect(() => {
    console.log('Viewer360Container: ViewMode changed to:', viewMode);
  }, [viewMode]);
  
  // Функция для получения доступных дат в зависимости от этажа
  const getAvailableDates = (floorId) => {
    if (floorId === 1) {
      // Первый этаж: 21 июля (только current), 12 июля (current + past), 4 июля (current + past + past_past)
      return [
        new Date(2025, 6, 4),  // 4 июля 2025 - past_past
        new Date(2025, 6, 12), // 12 июля 2025 - past
        new Date(2025, 6, 21)  // 21 июля 2025 - current
      ];
    } else {
      // Второй этаж (по умолчанию): 1 июля (past_past), 12 июля (past), 24 июля (current)
      return [
        new Date(2025, 6, 1),  // 1 июля 2025 - past_past
        new Date(2025, 6, 12), // 12 июля 2025 - past
        new Date(2025, 6, 24)  // 24 июля 2025 - current
      ];
    }
  };

  // Получаем доступные даты для текущего этажа
  const availableDates = getAvailableDates(selectedScheme?.id || 2);

  // Refs для вьюверов
  const mainViewerRef = useRef(null);
  const comparisonViewerRef = useRef(null);
  // Refs для режима разделения экрана
  const leftPanelViewerRef = useRef(null);
  const rightPanelViewerRef = useRef(null);
  // Ref на корневой контейнер миникарты (включает кнопку выбора схемы и выпадающий список)
  const schemesMinimapRef = useRef(null);
  const minimapRef = useRef(null);
  const isDraggingMinimap = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Хук для синхронизации камер
  const sync = usePanoramaSync(mainViewerRef, comparisonViewerRef, isComparisonMode);
  const splitScreenSync = usePanoramaSync(leftPanelViewerRef, rightPanelViewerRef, isSplitScreenMode);

  // Ref для актуального значения isComparisonMode (избегаем проблем с замыканиями)
  const isComparisonModeRef = React.useRef(isComparisonMode);
  
  // Обновляем ref при изменении состояния режима сравнения
  React.useEffect(() => {
    isComparisonModeRef.current = isComparisonMode;
  }, [isComparisonMode]);

  // Устанавливаем первую схему по умолчанию
  React.useEffect(() => {
    if (project?.floors && project.floors.length > 0 && !selectedScheme) {
      setSelectedScheme(project.floors[0]);
    }
  }, [project, selectedScheme]);

  // Обновляем selectedDate при смене этажа, если текущая дата недоступна
  React.useEffect(() => {
    if (selectedScheme) {
      const floorId = selectedScheme.id;
      const currentDates = getAvailableDates(floorId);
      
      // Проверяем, доступна ли текущая выбранная дата для нового этажа
      const isCurrentDateAvailable = currentDates.some(date => 
        date.toDateString() === selectedDate.toDateString()
      );
      
      // Если текущая дата недоступна, выбираем самую новую доступную дату
      if (!isCurrentDateAvailable) {
        setSelectedDate(currentDates[currentDates.length - 1]); // Самая новая дата (current)
      }

      // Проверяем и корректируем индекс изображения для нового этажа
      const maxIndex = getMaxImageIndex(floorId);
      if (currentOPImageIndex > maxIndex) {
        console.log(`🔧 Сброс индекса изображения с ${currentOPImageIndex} на ${maxIndex} для этажа ${floorId}`);
        setCurrentOPImageIndex(maxIndex);
      }
    }
  }, [selectedScheme]);

  // Закрытие dropdown при клике вне его области
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (schemesMinimapRef.current && !schemesMinimapRef.current.contains(event.target)) {
        setIsSchemeDropdownOpen(false);
        setIsSchemeSearchVisible(false);
        setSchemeSearchQuery('');
      }
    };

    if (isSchemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSchemeDropdownOpen]);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Дом', action: onBack },
    { id: 'images', icon: 'fas fa-image', label: 'Изображение', isActive: true },
    { id: 'schemes', icon: 'fas fa-layer-group', label: 'Схемы' },
    { id: 'field-notes', icon: 'fas fa-sticky-note', label: 'Полевые заметки' },
    { id: 'ai-comparison', icon: 'fas fa-brain', label: 'AI сравнение' },
    { id: 'timelapses', icon: 'fas fa-clock', label: 'Таймлапсы' },
    { id: 'drone-shots', icon: 'fas fa-helicopter', label: 'Съемка с дронов' },
    { id: 'separator-2', type: 'separator' },
    { id: 'participants', icon: 'fas fa-users', label: 'Участники' },
    { id: 'project-settings', icon: 'fas fa-cog', label: 'Настройки проекта' },
  ];

  // Навигационные точки для нижнего сайдбара
  const navigationPoints = [
    { id: 1, label: 'Главная комната', yaw: 0, pitch: 0 },
    { id: 2, label: 'Кухня', yaw: 90, pitch: -10 },
    { id: 3, label: 'Спальня', yaw: 180, pitch: 0 },
    { id: 4, label: 'Ванная', yaw: -90, pitch: 5 },
  ];

  // Функция для получения информации о комнате по фото
  const getPhotoRoomInfo = (photo) => {
    const roomData = getRoomByPhotoId(photo.id);
    return roomData ? roomData.roomData : null;
  };

  // Получение проанализированных видео из проекта
  const getAnalyzedVideos = () => {
    if (!project?.videos360) return [];
    return project.videos360.filter(video => 
      video.status === 'ready' && video.analysisStatus === 'analyzed'
    );
  };

  // Обработчики навигации - Фото архив
  const handleOpenArchive = () => {
    setViewMode('archive');
    setSelectedRoomKey(null);
    setSelectedPhoto(null);
    setSelectedVideo(null);
  };

  const handleSelectRoomGroup = (roomKey) => {
    setSelectedRoomKey(roomKey);
    setViewMode('roomGroup');
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhoto(photo);
    setViewMode('viewer');
  };

  const handleBackToArchive = () => {
    setViewMode('archive');
    setSelectedRoomKey(null);
  };

  const handleBackToRoomGroup = () => {
    setViewMode('roomGroup');
    setSelectedPhoto(null);
    setComparisonPhoto(null);
    setIsComparisonMode(false);
  };

  // Обработчики навигации - Видео 360
  const handleOpenVideo360List = () => {
    setViewMode('video360List');
    setSelectedVideo(null);
    setSelectedPhoto(null);
    setSelectedRoomKey(null);
    setCurrentFrameIndex(0);
  };

  const handleSelectVideo = (video) => {
    if (video.analysisStatus !== 'analyzed' || !video.extractedFrames.length) {
      alert('Видео не проанализировано или не содержит кадров');
      return;
    }
    setSelectedVideo(video);
    setCurrentFrameIndex(0);
    setViewMode('videoWalkthrough');
  };

  const handleBackToVideo360List = () => {
    setViewMode('video360List');
    setSelectedVideo(null);
    setCurrentFrameIndex(0);
  };

  const handleFrameNavigation = (frameIndex) => {
    if (selectedVideo && frameIndex >= 0 && frameIndex < selectedVideo.extractedFrames.length) {
      setCurrentFrameIndex(frameIndex);
    }
  };

  // Обработчики сравнения
  const handleComparisonToggle = () => {
    if (isComparisonMode) {
      setIsComparisonMode(false);
      setComparisonPhoto(null);
    } else {
      setShowComparisonSelector(true);
    }
  };

  const handleSelectComparisonPhoto = (photo) => {
    setComparisonPhoto(photo);
    setIsComparisonMode(true);
    setShowComparisonSelector(false);
  };

  // Закрытие фотографий
  const handleCloseMainImage = () => {
    if (isComparisonMode && comparisonPhoto) {
      setSelectedPhoto(comparisonPhoto);
      setComparisonPhoto(null);
      setIsComparisonMode(false);
    } else {
      handleBackToRoomGroup();
    }
  };

  const handleCloseComparisonImage = () => {
    setComparisonPhoto(null);
    setIsComparisonMode(false);
  };

  // Обработчик клика по пункту сайдбара
  const handleSidebarClick = (item) => {
    // Сначала закрываем все дополнительные панели
    setIsFieldNotesSidebarVisible(false);
    setIsTimelapsesSectionVisible(false);
    setIsDroneShotsSectionVisible(false);
    setIsAIComparisonSidebarVisible(false);
    
    if (item.action) {
      item.action();
    } else if (item.id === 'images') {
      // Пункт "Изображение" - показываем 360° изображение
      setCurrentSidebarSection('images');
      setViewMode('generic360');
    } else if (item.id === 'schemes') {
      // Пункт "Схемы" - показываем панель просмотра схем
      setCurrentSidebarSection('schemes');
      setViewMode('schemes');
    } else if (item.id === 'field-notes') {
      // Пункт "Полевые заметки" - показываем сайдбар полевых заметок
      setCurrentSidebarSection('field-notes');
      setViewMode('generic360');
      setIsFieldNotesSidebarVisible(true);
    } else if (item.id === 'ai-comparison') {
      // Пункт "AI сравнение" - показываем сайдбар AI сравнения
      setCurrentSidebarSection('ai-comparison');
      setViewMode('generic360');
      setIsAIComparisonSidebarVisible(true);
    } else if (item.id === 'timelapses') {
      // Пункт "Таймлапсы" - показываем раздел таймлапсов
      setCurrentSidebarSection('timelapses');
      setViewMode('generic360');
      setIsTimelapsesSectionVisible(true);
    } else if (item.id === 'drone-shots') {
      // Пункт "Съемка с дронов" - показываем раздел съемки с дронов
      setCurrentSidebarSection('drone-shots');
      setViewMode('generic360');
      setIsDroneShotsSectionVisible(true);
    } else if (item.id === 'participants') {
      // Пункт "Участники" - показываем модальное окно участников
      setCurrentSidebarSection('participants');
      setIsParticipantModalOpen(true);
    } else if (item.id === 'project-settings') {
      // Пункт "Настройки проекта" - переходим в настройки проекта
      setCurrentSidebarSection('project-settings');
      navigate(`/editor/${project.id}?mode=settings`);
    } else if (item.type === 'separator') {
      // Разделители не кликабельны
      return;
    } else {
      // Все остальные пункты - показываем 360° изображение (заглушки)
      setCurrentSidebarSection(item.id);
      setViewMode('generic360');
    }
  };

  // Обработчик клика по навигационной точке
  const handleNavigationClick = (point) => {
    if (isComparisonMode) {
      sync.syncLookAt(point.yaw, point.pitch, null, 1000);
    } else if (mainViewerRef.current) {
      mainViewerRef.current.lookAt(point.yaw, point.pitch, null, 1000);
    }
  };

  // Объект с изображениями OP второго этажа
  const opImagesFloor2 = {
    current: {
      1: opImg1Current,
      2: opImg2Current,
      3: opImg3Current,
      4: opImg4Current,
      5: opImg5Current
    },
    past: {
      1: opImg1Past,
      2: opImg2Past,
      3: opImg3Past,
      4: opImg4Past,
      5: opImg5Past
    },
    pastPast: {
      1: opImg1PastPast,
      2: opImg2PastPast,
      3: opImg3PastPast,
      4: opImg4PastPast,
      5: opImg5PastPast
    }
  };

  // Объект с изображениями OP первого этажа
  const opImagesFloor1 = {
    current: {
      1: opImg1CurrentFloor1,
      2: opImg2CurrentFloor1,
      3: opImg3CurrentFloor1
    },
    past: {
      1: opImg1PastFloor1,
      2: opImg2PastFloor1,
      3: opImg3PastFloor1
    },
    pastPast: {
      1: opImg1PastPastFloor1,
      2: opImg2PastPastFloor1,
      3: opImg3PastPastFloor1
    }
  };

  // Начальные позиции камеры для каждого изображения
  const initialCameraPositions = {
    // Второй этаж
    floor2: {
      // 1 июля 2025 - past_past
      'Sat Jul 01 2025': {
        1: { yaw: 171.76, pitch: 1.41, fov: 75 },
        2: { yaw: 64.21, pitch: 2.79, fov: 75 },
        3: { yaw: 180.38, pitch: 1.01, fov: 75 },
        4: { yaw: 53.93, pitch: 3.83, fov: 75 },
        5: { yaw: 63.83, pitch: 5.55, fov: 75 }
      },
      // 12 июля 2025 - past
      'Sat Jul 12 2025': {
        1: { yaw: 54.42, pitch: 1.41, fov: 75 },
        2: { yaw: 91.29, pitch: 3.3, fov: 75 },
        3: { yaw: 341.94, pitch: 0.27, fov: 75 },
        4: { yaw: 177.46, pitch: 2.58, fov: 75 },
        5: { yaw: 157.31, pitch: 3.83, fov: 75 }
      },
      // 24 июля 2025 - current
      'Thu Jul 24 2025': {
        1: { yaw: 170.22, pitch: 2.1, fov: 75 },
        2: { yaw: 79.71, pitch: 3.53, fov: 75 },
        3: { yaw: 87.02, pitch: -2.67, fov: 75 },
        4: { yaw: 140.7, pitch: 4.84, fov: 75 },
        5: { yaw: 57.84, pitch: 2.69, fov: 75 }
      }
    },
    // Первый этаж
    floor1: {
      // 4 июля 2025 - past_past
      'Fri Jul 04 2025': {
        1: { yaw: 262.27, pitch: 5.64, fov: 75 },
        2: { yaw: 60.97, pitch: 0.63, fov: 75 },
        3: { yaw: 146.22, pitch: 12.17, fov: 75 }
      },
      // 12 июля 2025 - past
      'Sat Jul 12 2025': {
        1: { yaw: 124, pitch: 4.95, fov: 75 },
        2: { yaw: 74.42, pitch: 1.33, fov: 75 },
        3: { yaw: 87.29, pitch: 5.49, fov: 75 }
      },
      // 21 июля 2025 - current
      'Mon Jul 21 2025': {
        1: { yaw: 323.57, pitch: 5.64, fov: 75 },
        2: { yaw: 280.27, pitch: 5.53, fov: 75 },
        3: { yaw: 187.64, pitch: -0.17, fov: 75 }
      }
    }
  };

  // Функция для получения времени съемки на основе индекса изображения и даты
  const getShootingTime = () => {
    // Массив времен для каждого индекса изображения (1-5)
    const timesByIndex = {
      1: '09:15',
      2: '12:30', 
      3: '15:45',
      4: '18:20',
      5: '21:35'
    };
    
    return timesByIndex[currentOPImageIndex] || '14:30';
  };

  // Функция для получения времени съемки для левой панели
  const getLeftPanelShootingTime = () => {
    return getShootingTime(); // Используем тот же индекс кадра
  };

  // Функция для получения времени съемки для правой панели  
  const getRightPanelShootingTime = () => {
    return getShootingTime(); // Используем тот же индекс кадра
  };

  // Функция для получения максимального индекса изображений для этажа
  const getMaxImageIndex = (floorId) => {
    return floorId === 1 ? 3 : 5; // Первый этаж: 3 изображения, второй этаж: 5 изображений
  };

  // Функция для получения начальной позиции камеры
  const getInitialCameraPosition = (floorId, date, imageIndex) => {
    const floorKey = `floor${floorId}`;
    const dateKey = date.toDateString();
    
    const position = initialCameraPositions[floorKey]?.[dateKey]?.[imageIndex];
    
    if (position) {
      console.log(`📸 Позиция камеры: этаж ${floorId}, изображение ${imageIndex}`, position);
      return position;
    }
    
    // Позиция по умолчанию
    const defaultPosition = { yaw: 0, pitch: 0, fov: 75 };
    console.warn(`⚠️ Позиция не найдена для этажа ${floorId}, даты ${dateKey}, изображения ${imageIndex}. Используется позиция по умолчанию.`);
    return defaultPosition;
  };

  // Функция для получения URL изображения OP на основе даты и индекса
  const getOPImageUrl = (date = selectedDate) => {
    const floorId = selectedScheme?.id || 2;
    const currentDates = getAvailableDates(floorId);
    
    // Выбираем правильный набор изображений в зависимости от этажа
    const opImages = floorId === 1 ? opImagesFloor1 : opImagesFloor2;
    
    // Временно используем img360 для проверки что вообще что-то отображается
    if (!opImg1Current) {
      console.warn('OP images not loaded, using fallback img360');
      return img360;
    }
    
    // Если нет img360 в качестве fallback, используем первое доступное изображение
    if (!img360) {
      console.warn('img360 fallback not available');
      // Попробуем найти любое доступное изображение
      const fallbackImage = opImg1Current || opImg1Past || opImg1PastPast || opImg1CurrentFloor1;
      if (fallbackImage) {
        console.log('Using first available OP image as fallback');
        return fallbackImage;
      }
    }
    
    // Определяем набор изображений на основе даты и этажа
    let imageSet;
    if (date.getTime() === currentDates[0].getTime()) { // Самая ранняя дата - pastPast
      imageSet = opImages.pastPast;
    } else if (date.getTime() === currentDates[1].getTime()) { // Средняя дата - past
      imageSet = opImages.past;
    } else { // Самая поздняя дата - current
      imageSet = opImages.current;
    }
    
    // Для первого этажа максимальный индекс 3, для второго - 5
    const maxIndex = floorId === 1 ? 3 : 5;
    const imageIndex = currentOPImageIndex <= maxIndex ? currentOPImageIndex : 1;
    
    const imageUrl = imageSet[imageIndex] || img360;
    
    return imageUrl;
  };

  // Функция для получения URL изображения для левой панели
  const getLeftPanelImageUrl = () => {
    return getOPImageUrl(leftPanelDate);
  };

  // Функция для получения URL изображения для правой панели
  const getRightPanelImageUrl = () => {
    return getOPImageUrl(rightPanelDate);
  };

  // Функция для получения начальной позиции камеры для левой панели
  const getLeftPanelInitialCamera = () => {
    const floorId = selectedScheme?.id || 2;
    return getInitialCameraPosition(floorId, leftPanelDate, currentOPImageIndex);
  };

  // Функция для получения начальной позиции камеры для правой панели
  const getRightPanelInitialCamera = () => {
    const floorId = selectedScheme?.id || 2;
    return getInitialCameraPosition(floorId, rightPanelDate, currentOPImageIndex);
  };

  // Проверка доступности даты
  const isDateAvailable = (date) => {
    const floorId = selectedScheme?.id || 2;
    const currentDates = getAvailableDates(floorId);
    return currentDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };

  // Функция для получения тултипа для дат
  const getDateTooltip = (date) => {
    if (isDateAvailable(date)) {
      return 'есть захват';
    }
    return null;
  };

  // Обработчики для новых компонентов нижнего сайдбара
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Обработчики смены дат для панелей разделения экрана
  const handleLeftPanelDateChange = (newDate) => {
    setLeftPanelDate(newDate);
    setLeftPanelImage(getOPImageUrl(newDate));
  };

  const handleRightPanelDateChange = (newDate) => {
    setRightPanelDate(newDate);
    setRightPanelImage(getOPImageUrl(newDate));
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  // Сохраняем позицию камеры для восстановления при смене изображения
  const savedCameraPositionRef = useRef({ yaw: 0, pitch: 0, fov: 75 });

  // Флаг для отслеживания, устанавливаем ли мы начальную позицию программно
  const isSettingInitialPositionRef = useRef(false);

  // Обновляем начальную позицию камеры при смене этажа, даты или изображения
  useEffect(() => {
    // Не устанавливаем начальную позицию в режимах сравнения или разделения экрана
    // чтобы не мешать синхронизации камер
    if (isComparisonMode || isSplitScreenMode) {
      console.log('🚫 Пропускаем установку начальной позиции в режиме сравнения/разделения экрана');
      return;
    }

    const floorId = selectedScheme?.id || 2;
    const initialPosition = getInitialCameraPosition(floorId, selectedDate, currentOPImageIndex);
    
    console.log(`🔄 Инициализация камеры: этаж ${floorId}, изображение ${currentOPImageIndex}`);
    
    // Устанавливаем флаг что мы программно обновляем позицию
    isSettingInitialPositionRef.current = true;
    
    // Обновляем позиции
    savedCameraPositionRef.current = initialPosition;
    setCurrentCamera(initialPosition);
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isSettingInitialPositionRef.current = false;
    }, 100);
  }, [selectedScheme, selectedDate, currentOPImageIndex, isComparisonMode, isSplitScreenMode]);

  // Обновляем сохраненную позицию при изменении камеры пользователем (НЕ программно)
  useEffect(() => {
    if (!isSettingInitialPositionRef.current) {
      savedCameraPositionRef.current = currentCamera;
    }
  }, [currentCamera]);

  // Логика восстановления позиции теперь не нужна, 
  // так как позиция передается через initialCamera пропс в PanoramaViewer

  // Обработчики навигации по изображениям OP
  const handleVideoFirstFrame = () => {
    setCurrentOPImageIndex(1);
    // Обновляем изображения в режиме разделения
    if (isSplitScreenMode) {
      setLeftPanelImage(getOPImageUrl(leftPanelDate));
      setRightPanelImage(getOPImageUrl(rightPanelDate));
    }
  };

  const handleVideoPreviousFrame = () => {
    setCurrentOPImageIndex(prev => {
      const newIndex = Math.max(1, prev - 1);
      // Обновляем изображения в режиме разделения
      if (isSplitScreenMode) {
        setLeftPanelImage(getOPImageUrl(leftPanelDate));
        setRightPanelImage(getOPImageUrl(rightPanelDate));
      }
      return newIndex;
    });
  };

  const handleVideoNextFrame = () => {
    setCurrentOPImageIndex(prev => {
      const floorId = selectedScheme?.id || 2;
      const maxIndex = getMaxImageIndex(floorId);
      const newIndex = Math.min(maxIndex, prev + 1);
      // Обновляем изображения в режиме разделения
      if (isSplitScreenMode) {
        setLeftPanelImage(getOPImageUrl(leftPanelDate));
        setRightPanelImage(getOPImageUrl(rightPanelDate));
      }
      return newIndex;
    });
  };

  const handleVideoLastFrame = () => {
    const floorId = selectedScheme?.id || 2;
    const maxIndex = getMaxImageIndex(floorId);
    setCurrentOPImageIndex(maxIndex);
    // Обновляем изображения в режиме разделения
    if (isSplitScreenMode) {
      setLeftPanelImage(getOPImageUrl(leftPanelDate));
      setRightPanelImage(getOPImageUrl(rightPanelDate));
    }
  };

  const handleFiltersClick = () => {
    // Заглушка - переключаем состояние для демонстрации
    setHasActiveFilters(prev => !prev);
  };



  // Обработчики для верхнего тулбара
  const handleCreateFieldNote = () => {
    setIsFieldNoteMode(prev => !prev);
  };

  // Обработчик клика на изображении в режиме создания полевой заметки
  const handlePanoramaClick = async (event) => {
    if (!isFieldNoteMode) return;

    // Получаем canvas из Three.js рендерера
    const canvas = mainViewerRef.current?.getCanvas?.() || event.target;
    
    if (!canvas || !canvas.tagName || canvas.tagName.toLowerCase() !== 'canvas') {
      console.error('Canvas не найден или недоступен');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Получаем текущую позицию камеры для привязки заметки к 3D-пространству
    const currentCamera = mainViewerRef.current?.getCamera?.() || { yaw: 0, pitch: 0, fov: 75 };
    
    // Конвертируем пиксельные координаты в нормализованные координаты (-1 до 1)
    const normalizedX = (x / canvas.clientWidth) * 2 - 1;
    const normalizedY = -(y / canvas.clientHeight) * 2 + 1;
    
    // Вычисляем углы относительно центра экрана
    const horizontalFOV = currentCamera.fov * (canvas.clientWidth / canvas.clientHeight);
    const clickYaw = currentCamera.yaw + (normalizedX * horizontalFOV / 2);
    const clickPitch = currentCamera.pitch + (normalizedY * currentCamera.fov / 2);
    
        // Создаем скриншот с проверкой доступности
    let screenshot = null;
    try {
      // Ждем рендера текущего кадра
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Временно создаем контекст для получения изображения
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
    
      // Копируем содержимое оригинального canvas
      tempCtx.drawImage(canvas, 0, 0);
      
      // Добавляем круглую метку в точке клика
      const markerX = x * (canvas.width / canvas.clientWidth);
      const markerY = y * (canvas.height / canvas.clientHeight);
      
      tempCtx.beginPath();
      tempCtx.arc(markerX, markerY, 15, 0, 2 * Math.PI);
      tempCtx.fillStyle = '#3b82f6';
      tempCtx.fill();
      tempCtx.strokeStyle = '#ffffff';
      tempCtx.lineWidth = 3;
      tempCtx.stroke();
      
      // Добавляем внутренний круг
      tempCtx.beginPath();
      tempCtx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fill();
      
      screenshot = tempCanvas.toDataURL('image/png');
      console.log('Скриншот создан успешно, размер:', screenshot.length, 'Метка на позиции:', { markerX, markerY });
    } catch (error) {
      console.error('Ошибка создания скриншота:', error);
      // Пытаемся создать простой скриншот без метки
      try {
        screenshot = canvas.toDataURL('image/png');
        console.log('Создан простой скриншот без метки');
      } catch (fallbackError) {
        console.error('Ошибка создания простого скриншота:', fallbackError);
        screenshot = null;
      }
    }
    
    // Сохраняем позицию в 3D-координатах и пиксельных координатах для отображения
    const notePosition = {
      // 3D координаты для правильного позиционирования
      yaw: clickYaw,
      pitch: clickPitch,
      // Пиксельные координаты для текущего отображения
      x,
      y,
      // Размеры canvas для пересчета при изменении размера
      canvasWidth: canvas.clientWidth,
      canvasHeight: canvas.clientHeight
    };
    
    setFieldNotePosition(notePosition);
    setFieldNoteScreenshot(screenshot);
    
    // Отключаем режим создания заметки и открываем модальное окно
    setIsFieldNoteMode(false);
    setIsFieldNoteModalOpen(true);
    
    console.log('Клик на позиции:', notePosition, 'Скриншот доступен:', !!screenshot);
  };

  // Обработчик сохранения полевой заметки
  const handleSaveFieldNote = (noteData) => {
    
    if (editingFieldNote) {
      // Обновляем существующую заметку
      setFieldNotes(prev => prev.map(note => 
        note.id === editingFieldNote.id 
          ? { ...noteData, id: editingFieldNote.id }
          : note
      ));
      setEditingFieldNote(null);
    } else {
      // Добавляем новую заметку
      setFieldNotes(prev => [...prev, noteData]);
    }
    
    setIsFieldNoteModalOpen(false);
    setFieldNotePosition(null);
    setFieldNoteScreenshot(null);
  };

  // Обработчик удаления полевой заметки
  const handleDeleteFieldNote = () => {
    if (editingFieldNote) {
      setFieldNotes(prev => prev.filter(note => note.id !== editingFieldNote.id));
      setEditingFieldNote(null);
    }
    setIsFieldNoteModalOpen(false);
    setFieldNotePosition(null);
    setFieldNoteScreenshot(null);
  };

  // Обработчик клика по маркеру существующей заметки
  const handleMarkerClick = (note) => {
    console.log('Клик по маркеру заметки:', note);
    setEditingFieldNote(note);
    setFieldNotePosition(note.position);
    // Используем сохраненный скриншот заметки
    setFieldNoteScreenshot(note.screenshot || null);
    setIsFieldNoteModalOpen(true);
  };

  // Обработчик закрытия модального окна полевой заметки
  const handleCloseFieldNoteModal = () => {
    setIsFieldNoteModalOpen(false);
    setIsFieldNoteMode(false);
    setFieldNotePosition(null);
    setFieldNoteScreenshot(null);
    setEditingFieldNote(null);
  };

  // Обработчик закрытия сайдбара полевых заметок
  const handleCloseFieldNotesSidebar = () => {
    setIsFieldNotesSidebarVisible(false);
  };

  // Обработчик клика по полевой заметке в сайдбаре
  const handleFieldNoteClick = (note) => {
    console.log('Клик по полевой заметке в сайдбаре:', note);
    // Позиционируем камеру на заметку (если есть 3D координаты)
    if (note.position && note.position.yaw !== undefined && note.position.pitch !== undefined) {
      if (isSplitScreenMode) {
        // В режиме разделения экрана используем синхронизацию
        sync.syncLookAt(note.position.yaw, note.position.pitch, null, 1000);
      } else if (mainViewerRef.current) {
        // В обычном режиме используем основной viewer
        mainViewerRef.current.lookAt(note.position.yaw, note.position.pitch, null, 1000);
      }
    }
    
    // Открываем модальное окно для просмотра/редактирования заметки
    setEditingFieldNote(note);
    setFieldNotePosition(note.position);
    setFieldNoteScreenshot(note.screenshot || null);
    setIsFieldNoteModalOpen(true);
    
    // Закрываем сайдбар полевых заметок после клика (по желанию)
    setIsFieldNotesSidebarVisible(false);
  };

  const handleCreateVideo = () => {
    console.log('Создать покадровое видео - заглушка');
    // Здесь будет логика создания покадрового видео
    // Можно добавить уведомление пользователю
    alert('Функция создания покадрового видео будет реализована в будущих версиях');
  };

  // Обработчик закрытия раздела таймлапсов
  const handleCloseTimelapsesSection = () => {
    setIsTimelapsesSectionVisible(false);
    setCurrentSidebarSection('images');
  };

  // Обработчик закрытия раздела съемки с дронов
  const handleCloseDroneShotsSection = () => {
    setIsDroneShotsSectionVisible(false);
    setCurrentSidebarSection('images');
  };

  // Обработчик загрузки файлов с дронов
  const handleDroneFilesUpload = (files) => {
    console.log('Загружены файлы с дронов:', files);
    // Здесь будет логика обработки загруженных файлов
    alert(`Загружено ${files.length} файлов. Обработка начнется в ближайшее время.`);
  };

  // Обработчик закрытия модального окна участников
  const handleCloseParticipantModal = () => {
    setIsParticipantModalOpen(false);
  };

  // Обработчик добавления участника
  const handleAddParticipant = (participantData) => {
    console.log('Добавлен участник:', participantData);
    // Здесь будет логика добавления участника к проекту
    // Можно обновить проект или отправить запрос на сервер
    alert(`Участник ${participantData.email} успешно добавлен к проекту`);
  };

  const handleShare = () => {
    console.log('Поделиться - заглушка');
    // Здесь будет логика поделиться
  };

  const handleDownloadScreen = () => {
    console.log('Загрузить текущий экран - заглушка');
    // Здесь будет логика скачивания текущего экрана
  };

  const handleDownloadImage360 = () => {
    console.log('Загрузить изображение 360° - заглушка');
    // Здесь будет логика скачивания полного изображения 360°
  };

  // Обработчики для ViewerControlsSidebar
  const handleImageSettings = () => {
    console.log('Настроить изображение - заглушка');
    // Здесь будет логика настройки изображения
  };

  const handleSplitScreen = () => {
    if (isSplitScreenMode) {
      // Выключаем режим разделения экрана
      setIsSplitScreenMode(false);
      setLeftPanelImage(null);
      setRightPanelImage(null);
    } else {
      // Включаем режим разделения экрана
      // Инициализируем панели с разными датами для сравнения
      const floorId = selectedScheme?.id || 2;
      const currentDates = getAvailableDates(floorId);
      setLeftPanelDate(currentDates[2]); // Самая новая дата (current)
      setRightPanelDate(currentDates[1]); // Средняя дата (past)
      setLeftPanelImage(getOPImageUrl(currentDates[2]));
      setRightPanelImage(getOPImageUrl(currentDates[1]));
      setIsSplitScreenMode(true);
    }
  };

  // Обработчики закрытия панелей в режиме разделения экрана
  const handleCloseLeftPanel = () => {
    if (rightPanelImage) {
      // Если есть правая панель, делаем её основной
      setIsSplitScreenMode(false);
      setLeftPanelImage(null);
      setRightPanelImage(null);
    } else {
      // Если нет правой панели, просто выключаем режим
      setIsSplitScreenMode(false);
      setLeftPanelImage(null);
      setRightPanelImage(null);
    }
  };

  const handleCloseRightPanel = () => {
    if (leftPanelImage) {
      // Если есть левая панель, делаем её основной
      setIsSplitScreenMode(false);
      setLeftPanelImage(null);
      setRightPanelImage(null);
    } else {
      // Если нет левой панели, просто выключаем режим
      setIsSplitScreenMode(false);
      setLeftPanelImage(null);
      setRightPanelImage(null);
    }
  };

  const handleZoomIn = () => {
    if (mainViewerRef.current) {
      const currentFov = currentCamera.fov;
      const newFov = Math.max(30, currentFov - 5);
      const cameraData = { ...currentCamera, fov: newFov };
      setCurrentCamera(cameraData);
      
      // Применяем зум к основному вьюверу
      if (mainViewerRef.current.setCamera) {
        mainViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, newFov);
      }
      
      // Если включен режим сравнения, синхронизируем зум
      if (isComparisonMode && comparisonViewerRef.current) {
        if (comparisonViewerRef.current.setCamera) {
          comparisonViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, newFov);
        }
      }
    }
  };

  const handleZoomOut = () => {
    if (mainViewerRef.current) {
      const currentFov = currentCamera.fov;
      const newFov = Math.min(130, currentFov + 5);
      const cameraData = { ...currentCamera, fov: newFov };
      setCurrentCamera(cameraData);
      
      // Применяем зум к основному вьюверу
      if (mainViewerRef.current.setCamera) {
        mainViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, newFov);
      }
      
      // Если включен режим сравнения, синхронизируем зум
      if (isComparisonMode && comparisonViewerRef.current) {
        if (comparisonViewerRef.current.setCamera) {
          comparisonViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, newFov);
        }
      }
    }
  };

  // Обработчики для миникарты
  const handleMinimapToggle = () => {
    setIsMinimapExpanded(!isMinimapExpanded);
    // Всегда сбрасываем зум и позицию при переключении
    setMinimapZoom(1);
    setMinimapPosition({ x: 0, y: 0 });
    // Сбрасываем состояние перетаскивания
    isDraggingMinimap.current = false;
    setIsMinimapDragging(false);
  };



  const handleMinimapMouseDown = (event) => {
    if (event.button === 0 && isMinimapExpanded) { // Левая кнопка мыши и развернутый режим
      isDraggingMinimap.current = true;
      setIsMinimapDragging(true);
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMinimapMouseMove = (event) => {
    if (isDraggingMinimap.current && isMinimapExpanded) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;
      
      setMinimapPosition(prev => {
        // Более строгие ограничения для предотвращения выхода изображения за границы
        const container = minimapRef.current;
        if (!container) return prev;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Вычисляем максимальные смещения на основе зума и размеров контейнера
        const maxOffsetX = Math.max(0, (containerWidth * (minimapZoom - 1)) / 2);
        const maxOffsetY = Math.max(0, (containerHeight * (minimapZoom - 1)) / 2);
        
        const newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x + deltaX));
        const newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y + deltaY));
        
        return {
          x: newX,
          y: newY
        };
      });
      
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMinimapMouseUp = () => {
    isDraggingMinimap.current = false;
    setIsMinimapDragging(false);
  };

  // useEffect для обработки глобальных событий мыши для миникарты
  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleMinimapMouseMove(event);
    const handleGlobalMouseUp = () => handleMinimapMouseUp();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMinimapExpanded) {
        handleMinimapToggle();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMinimapExpanded, minimapZoom]);

  // useEffect для обработки wheel события на миникарте с { passive: false }
  useEffect(() => {
    const container = minimapRef.current;
    if (!container || !isMinimapExpanded) return;

    const handleWheelEvent = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.max(0.5, Math.min(3, minimapZoom + delta));
      setMinimapZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [isMinimapExpanded, minimapZoom]);

  // Обработчики изменения камеры
  const handleMainCameraChange = React.useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    setCurrentCamera(cameraData);
    
    // Логирование координат камеры для настройки начальных позиций
    const floorId = selectedScheme?.id || 2;
    const dateKey = selectedDate.toDateString();
    console.log(`📹 КООРДИНАТЫ КАМЕРЫ:`, {
      floor: floorId,
      date: dateKey,
      imageIndex: currentOPImageIndex,
      coordinates: {
        yaw: Math.round(cameraData.yaw * 100) / 100,
        pitch: Math.round(cameraData.pitch * 100) / 100,
        fov: Math.round(cameraData.fov * 100) / 100
      }
    });
    
    if (currentIsComparisonMode) {
      sync.throttledSyncFromMain(cameraData);
    }
  }, [sync.throttledSyncFromMain, selectedScheme, selectedDate, currentOPImageIndex]);

  const handleComparisonCameraChange = React.useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    setCurrentCamera(cameraData);
    if (currentIsComparisonMode) {
      sync.throttledSyncFromComparison(cameraData);
    }
  }, [sync.throttledSyncFromComparison]);

  // Обработчики изменения камеры для панелей разделения экрана
  const handleLeftPanelCameraChange = React.useCallback((cameraData) => {
    setCurrentCamera(cameraData);
    if (isSplitScreenMode) {
      splitScreenSync.throttledSyncFromMain(cameraData);
    }
  }, [splitScreenSync.throttledSyncFromMain, isSplitScreenMode]);

  const handleRightPanelCameraChange = React.useCallback((cameraData) => {
    setCurrentCamera(cameraData);
    if (isSplitScreenMode) {
      splitScreenSync.throttledSyncFromComparison(cameraData);
    }
  }, [splitScreenSync.throttledSyncFromComparison, isSplitScreenMode]);

  // Определение активной кнопки сайдбара
  const isItemActive = (itemId) => {
    // Активной является кнопка текущего раздела
    return itemId === currentSidebarSection;
  };

  // Рендер архива фото (теперь по комнатам)
  const renderPhotoArchive = () => {
    const rooms = getAllRooms();
    
    return (
      <div className={styles.photoArchive}>
        <div className={styles.archiveHeader}>
          <h2>Архив фотографий 360°</h2>
          <p>Выберите комнату или локацию для просмотра</p>
        </div>
        <div className={styles.roomGroups}>
          {rooms.map((room) => (
            <div 
              key={room.roomKey} 
              className={styles.roomGroup}
              onClick={() => handleSelectRoomGroup(room.roomKey)}
            >
              <div className={styles.roomGroupHeader}>
                <span className={styles.roomTitle}>{room.name}</span>
                <span className={styles.photoCount}>{room.photos.length} фото</span>
              </div>
              <div className={styles.roomGroupPreview}>
                {room.photos.slice(0, 3).map((photo) => (
                  <div key={photo.id} className={styles.previewImage}>
                    <img src={photo.url} alt={photo.description} />
                    <div className={styles.previewPeriod}>{photo.period}</div>
                  </div>
                ))}
                {room.photos.length > 3 && (
                  <div className={styles.morePhotos}>
                    +{room.photos.length - 3}
                  </div>
                )}
              </div>
              <i className="fas fa-chevron-right"></i>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер фото из выбранной комнаты
  const renderRoomGroupPhotos = () => {
    const roomData = mockPhotoArchive[selectedRoomKey];
    if (!roomData) return null;

    return (
      <div className={styles.roomGroupPhotos}>
        <div className={styles.groupHeader}>
          <button className={styles.backButton} onClick={handleBackToArchive}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2>{roomData.name}</h2>
            <p>{roomData.photos.length} фотографий в разное время</p>
          </div>
        </div>
        <div className={styles.photosGrid}>
          {roomData.photos.map((photo) => (
            <div 
              key={photo.id} 
              className={styles.photoCard}
              onClick={() => handleSelectPhoto(photo)}
            >
              <div className={styles.photoImage}>
                <img src={photo.url} alt={photo.description} />
                <div className={styles.photoOverlay}>
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
              <div className={styles.photoInfo}>
                <h3>{photo.description}</h3>
                <div className={styles.photoMeta}>
                  <p className={styles.photoDate}>
                    <i className="fas fa-calendar"></i>
                    {photo.date}
                  </p>
                  <p className={styles.photoTime}>
                    <i className="fas fa-clock"></i>
                    {photo.time} ({photo.period})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер селектора сравнения (только фото из той же комнаты)
  const renderComparisonSelector = () => {
    const availablePhotos = getComparisonPhotos(selectedPhoto.id);
    const roomInfo = getPhotoRoomInfo(selectedPhoto);
    
    if (availablePhotos.length === 0) {
      return (
        <div className={styles.comparisonSelectorOverlay}>
          <div className={styles.comparisonSelectorModal}>
            <div className={styles.selectorHeader}>
              <h3>Сравнение недоступно</h3>
              <button 
                className={styles.closeSelectorBtn}
                onClick={() => setShowComparisonSelector(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.selectorContent}>
              <div className={styles.noPhotosMessage}>
                <i className="fas fa-info-circle"></i>
                <p>Для комнаты "{roomInfo?.name}" нет других фотографий в разное время для сравнения.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.comparisonSelectorOverlay}>
        <div className={styles.comparisonSelectorModal}>
          <div className={styles.selectorHeader}>
            <h3>{roomInfo?.name} в разное время</h3>
            <button 
              className={styles.closeSelectorBtn}
              onClick={() => setShowComparisonSelector(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={styles.selectorContent}>
            <div className={styles.selectorRoomGroup}>
              <h4>Выберите фото для сравнения:</h4>
              <div className={styles.selectorPhotosGrid}>
                {availablePhotos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={styles.selectorPhotoCard}
                    onClick={() => handleSelectComparisonPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.description} />
                    <div className={styles.selectorPhotoInfo}>
                      <span className={styles.photoDescription}>{photo.description}</span>
                      <div className={styles.photoMetaSmall}>
                        <small className={styles.photoDateSmall}>{photo.date}</small>
                        <small className={styles.photoPeriod}>{photo.period} • {photo.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Рендер 360° просмотрщика
  const renderViewer = () => {
    const roomInfo = getPhotoRoomInfo(selectedPhoto);
    
    return (
      <div className={`${styles.panoramaSection} ${isComparisonMode ? styles.comparisonMode : ''}`}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={handleCreateFieldNote}
          onCreateVideo={handleCreateVideo}
          onShare={handleShare}
          onDownloadScreen={handleDownloadScreen}
          onDownloadImage360={handleDownloadImage360}
          isFieldNoteMode={isFieldNoteMode}
        />

        {/* Основной просмотрщик */}
        <div className={styles.panoramaWrapper}>
                      <PanoramaViewer
              ref={mainViewerRef}
              imageUrl={selectedPhoto.url}
              onCameraChange={handleMainCameraChange}
              onPanoramaClick={handlePanoramaClick}
              className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
              initialCamera={savedCameraPositionRef.current}
              isFieldNoteMode={isFieldNoteMode}
            />
            
            {/* Маркеры полевых заметок */}
            <FieldNoteMarkers
              fieldNotes={fieldNotes}
              onMarkerClick={handleMarkerClick}
              containerRef={mainViewerRef}
            />
          
          {/* Информация о фото */}
          <div className={styles.panoramaPhotoInfo}>
            <div className={styles.photoTitle}>{roomInfo?.name}</div>
            <div className={styles.photoSubtitle}>{selectedPhoto.description}</div>
            <div className={styles.photoDate}>{selectedPhoto.date} • {selectedPhoto.time} ({selectedPhoto.period})</div>
          </div>
          
          {/* Кнопка закрытия */}
          <button 
            className={styles.closeViewerBtn}
            onClick={handleCloseMainImage}
            title={isComparisonMode ? "Закрыть это изображение" : "Закрыть просмотр"}
          >
            <i className="fas fa-times"></i>
          </button>
          
          {/* Новый нижний сайдбар с тремя мини-сайдбарами */}
          <div className={styles.bottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={isVideoPlaying}
                shootingTime={getShootingTime()}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onFirstFrame={handleVideoFirstFrame}
                onPreviousFrame={handleVideoPreviousFrame}
                onNextFrame={handleVideoNextFrame}
                onLastFrame={handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={handleFiltersClick}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={handleImageSettings}
            onSplitScreen={handleSplitScreen}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            currentZoom={currentCamera.fov}
          />
        </div>

        {/* Сравнительный просмотрщик */}
        {isComparisonMode && comparisonPhoto && (
          <div className={styles.panoramaWrapper}>
            <PanoramaViewer
              ref={comparisonViewerRef}
              imageUrl={comparisonPhoto.url}
              isComparison={true}
              onCameraChange={handleComparisonCameraChange}
              className={styles.comparisonViewer}
              initialCamera={savedCameraPositionRef.current}
            />
            
            {/* Информация о сравнительном фото */}
            <div className={styles.panoramaPhotoInfo}>
              <div className={styles.photoTitle}>{roomInfo?.name}</div>
              <div className={styles.photoSubtitle}>{comparisonPhoto.description}</div>
              <div className={styles.photoDate}>{comparisonPhoto.date} • {comparisonPhoto.time} ({comparisonPhoto.period})</div>
            </div>
            
            {/* Кнопка закрытия сравнительного фото */}
            <button 
              className={styles.closeViewerBtn}
              onClick={handleCloseComparisonImage}
              title="Закрыть это изображение"
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* Сайдбар для сравнительного изображения */}
            <div className={`${styles.bottomSidebar} ${styles.comparisonSidebar}`}>
              <div className={styles.miniSidebar}>
                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              </div>
              
              <div className={styles.miniSidebar}>
                <VideoControls
                  isPlaying={isVideoPlaying}
                  shootingTime={getShootingTime()}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onFirstFrame={handleVideoFirstFrame}
                  onPreviousFrame={handleVideoPreviousFrame}
                  onNextFrame={handleVideoNextFrame}
                  onLastFrame={handleVideoLastFrame}
                />
              </div>
              
              <div className={styles.miniSidebar}>
                <FilterControls
                  onFiltersClick={handleFiltersClick}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            {/* Правый вертикальный сайдбар с кнопками управления для сравнительного изображения */}
            <ViewerControlsSidebar
              onImageSettings={handleImageSettings}
              onSplitScreen={handleSplitScreen}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              currentZoom={currentCamera.fov}
            />
          </div>
        )}
      </div>
    );
  };

  // Рендер миникарты со схемами
  const renderSchemesMinimap = () => {
    if (!project?.floors) return null;

    // Данные контрольных точек для каждого этажа
    const floorRouteData = {
      1: {
        points: [
          { id: 1, x: 35, y: 60, name: 'Точка 1' },
          { id: 2, x: 50, y: 50, name: 'Точка 2' },
          { id: 3, x: 65, y: 40, name: 'Точка 3' }
        ],
        routes: [
          { from: 1, to: 2 },
          { from: 2, to: 3 }
        ]
      },
      2: {
        points: [
          { id: 1, x: 30, y: 65, name: 'Точка 1' },
          { id: 2, x: 40, y: 55, name: 'Точка 2' },
          { id: 3, x: 50, y: 45, name: 'Точка 3' },
          { id: 4, x: 60, y: 35, name: 'Точка 4' },
          { id: 5, x: 70, y: 25, name: 'Точка 5' }
        ],
        routes: [
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 3, to: 4 },
          { from: 4, to: 5 }
        ]
      }
    };

    // Определяем текущий этаж на основе selectedScheme
    const getCurrentFloor = () => {
      if (!selectedScheme) return 2;
      if (selectedScheme.name && selectedScheme.name.includes('1-й этаж')) return 1;
      if (selectedScheme.id === 1) return 1;
      return 2;
    };

    const currentFloor = getCurrentFloor();
    const currentFloorData = floorRouteData[currentFloor];

    // Обработчик клика по контрольной точке
    const handleRoutePointClick = (pointId) => {
      console.log(`🗺️ Переход к точке ${pointId} на этаже ${currentFloor}`);
      setCurrentOPImageIndex(pointId);
      
      // Обновляем изображения в режиме разделения экрана
      if (isSplitScreenMode) {
        setLeftPanelImage(getOPImageUrl(leftPanelDate));
        setRightPanelImage(getOPImageUrl(rightPanelDate));
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
      floor.name.toLowerCase().includes(schemeSearchQuery.toLowerCase()) ||
      floor.description.toLowerCase().includes(schemeSearchQuery.toLowerCase())
    );

    const handleSchemeSelect = (scheme) => {
      setSelectedScheme(scheme);
      setIsSchemeDropdownOpen(false);
      setIsSchemeSearchVisible(false);
      setSchemeSearchQuery('');
      // Сбрасываем зум и позицию при смене схемы
      setMinimapZoom(1);
      setMinimapPosition({ x: 0, y: 0 });
    };

    const handleDropdownToggle = () => {
      setIsSchemeDropdownOpen(!isSchemeDropdownOpen);
      if (!isSchemeDropdownOpen) {
        setIsSchemeSearchVisible(true);
      } else {
        setIsSchemeSearchVisible(false);
        setSchemeSearchQuery('');
      }
    };

    return (
      <div
        ref={schemesMinimapRef}
        className={`${styles.schemesMinimap} ${isMinimapExpanded ? styles.expanded : ''}`}
      >
        {/* Заголовок с кнопками */}
        <div className={styles.minimapHeader}>
          <div className={styles.customSelect}>
            <button 
              className={`${styles.selectButton} ${isSchemeDropdownOpen ? styles.open : ''}`}
              onClick={handleDropdownToggle}
            >
              <span>{selectedScheme ? selectedScheme.name : 'Выберите схему'}</span>
              <i className={`fas fa-chevron-down ${isSchemeDropdownOpen ? styles.rotated : ''}`}></i>
            </button>
          </div>
          
          {/* Кнопка увеличения */}
          <button
            className={`${styles.minimapExpandButton} ${isMinimapExpanded ? styles.expanded : ''}`}
            onClick={handleMinimapToggle}
            title={isMinimapExpanded ? 'Свернуть карту' : 'Развернуть карту'}
          >
            <i className={`fas ${isMinimapExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
        
        {/* Dropdown */}
        {isSchemeDropdownOpen && (
            <div className={styles.dropdown}>
              {/* Поиск внутри dropdown */}
              {isSchemeSearchVisible && (
                <div className={styles.dropdownSearch}>
                  <div className={styles.searchInputWrapper}>
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Поиск схемы..."
                      value={schemeSearchQuery}
                      onChange={(e) => setSchemeSearchQuery(e.target.value)}
                      className={styles.searchInput}
                      autoFocus
                    />
                    {schemeSearchQuery && (
                      <button 
                        className={styles.clearSearchBtn}
                        onClick={() => setSchemeSearchQuery('')}
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
                  <div className={styles.noResults}>Схемы не найдены</div>
                ) : (
                  filteredSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      className={`${styles.dropdownItem} ${selectedScheme?.id === scheme.id ? styles.selected : ''}`}
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
        {selectedScheme && (
          <div className={`${styles.minimapImage} ${isMinimapExpanded ? styles.expanded : ''}`}>
            {/* Панель управления зумом (только в развернутом состоянии - сверху) */}
            {isMinimapExpanded && (
              <div className={styles.minimapControls}>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => setMinimapZoom(prev => Math.min(3, prev + 0.1))}
                  title="Увеличить"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <span className={styles.zoomLevel}>
                  {Math.round(minimapZoom * 100)}%
                </span>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => setMinimapZoom(prev => Math.max(0.5, prev - 0.1))}
                  title="Уменьшить"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <button
                  className={styles.minimapControlButton}
                  onClick={() => {
                    setMinimapZoom(1);
                    setMinimapPosition({ x: 0, y: 0 });
                  }}
                  title="Сбросить"
                >
                  <i className="fas fa-expand-arrows-alt"></i>
                </button>
              </div>
            )}
            
            <div 
              className={styles.minimapZoomContainer}
              onMouseDown={isMinimapExpanded ? handleMinimapMouseDown : undefined}
              ref={minimapRef}
            >
              <img 
                key={selectedScheme.id}
                src={selectedScheme.fullImage || selectedScheme.thumbnail} 
                alt={selectedScheme.name}
                className={styles.schemeMap}
                style={isMinimapExpanded ? {
                  transform: `translate(${minimapPosition.x}px, ${minimapPosition.y}px) scale(${minimapZoom})`,
                  cursor: isMinimapDragging ? 'grabbing' : 'grab',
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
                  style={isMinimapExpanded ? {
                    transform: `translate(${minimapPosition.x}px, ${minimapPosition.y}px) scale(${minimapZoom})`,
                    transformOrigin: 'center center',
                  } : {}}
                >
                  {/* Маршруты */}
                  {currentFloorData.routes.map((route, index) => (
                    <path
                      key={index}
                      d={createRoutePath(route)}
                      className={styles.routePath}
                      strokeDasharray="5,5"
                    />
                  ))}
                  
                  {/* Контрольные точки */}
                  {currentFloorData.points.map((point) => (
                    <g key={point.id}>
                      {/* Внешний круг (подсветка для активной точки) */}
                      {currentOPImageIndex === point.id && (
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
                          currentOPImageIndex === point.id ? styles.active : ''
                        }`}
                        onClick={() => handleRoutePointClick(point.id)}
                      />
                      
                      {/* Номер точки */}
                      <text
                        x={point.x}
                        y={point.y + 0.8}
                        className={styles.pointNumber}
                        textAnchor="middle"
                        onClick={() => handleRoutePointClick(point.id)}
                      >
                        {point.id}
                      </text>
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



  // Мемоизированный URL изображения для предотвращения лишних перерендеров
  const memoizedImageUrl = React.useMemo(() => {
    return getOPImageUrl();
  }, [currentOPImageIndex, selectedDate]);

  // Рендер 360° изображения для остальных разделов
  const renderGeneric360 = () => {

    return (
      <div className={styles.panoramaSection}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={handleCreateFieldNote}
          onCreateVideo={handleCreateVideo}
          onShare={handleShare}
          onDownloadScreen={handleDownloadScreen}
          onDownloadImage360={handleDownloadImage360}
          isFieldNoteMode={isFieldNoteMode}
        />

        <div className={styles.panoramaWrapper}>
          <PanoramaViewer
            ref={mainViewerRef}
            imageUrl={memoizedImageUrl}
            onCameraChange={handleMainCameraChange}
            onPanoramaClick={isFieldNoteMode ? handlePanoramaClick : undefined}
            className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
            initialCamera={savedCameraPositionRef.current}
            key={`panorama-${selectedScheme?.id || 2}-${currentOPImageIndex}-${selectedDate.getTime()}`}
            isFieldNoteMode={isFieldNoteMode}
          />
          
          {/* Маркеры полевых заметок */}
          <FieldNoteMarkers
            fieldNotes={fieldNotes}
            onMarkerClick={handleMarkerClick}
            containerRef={mainViewerRef}
          />
          
          {/* Новый нижний сайдбар с тремя мини-сайдбарами */}
          <div className={styles.bottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                availableDates={availableDates}
                isDateAvailable={isDateAvailable}
                getWorkersCount={(date) => isDateAvailable(date) ? 1 : 0}
                dropdownPosition="top"
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={isVideoPlaying}
                shootingTime={getShootingTime()}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onFirstFrame={handleVideoFirstFrame}
                onPreviousFrame={handleVideoPreviousFrame}
                onNextFrame={handleVideoNextFrame}
                onLastFrame={handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={handleFiltersClick}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={handleImageSettings}
            onSplitScreen={handleSplitScreen}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            currentZoom={currentCamera.fov}
          />
        </div>
      </div>
    );
  };

  // Рендер панели схем
  const renderSchemes = () => {
    return (
      <SchemesView 
        project={project}
      />
    );
  };

  // Рендер режима разделения экрана
  const renderSplitScreen = () => {
    return (
      <div className={styles.panoramaSection}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={handleCreateFieldNote}
          onCreateVideo={handleCreateVideo}
          onShare={handleShare}
          onDownloadScreen={handleDownloadScreen}
          onDownloadImage360={handleDownloadImage360}
          isFieldNoteMode={isFieldNoteMode}
        />

        <div className={`${styles.splitScreenContainer} ${styles.splitScreenMode}`}>
          {/* Левая панель */}
          <div className={styles.splitScreenPanel}>
            <div className={styles.panoramaWrapper}>
              <PanoramaViewer
                ref={leftPanelViewerRef}
                imageUrl={getLeftPanelImageUrl()}
                onCameraChange={handleLeftPanelCameraChange}
                onPanoramaClick={isFieldNoteMode ? handlePanoramaClick : undefined}
                className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
                initialCamera={getLeftPanelInitialCamera()}
                isFieldNoteMode={isFieldNoteMode}
                key={`left-panel-${leftPanelDate.getTime()}-${currentOPImageIndex}`}
              />
              
              {/* Маркеры полевых заметок для левой панели */}
              <FieldNoteMarkers
                fieldNotes={fieldNotes}
                onMarkerClick={handleMarkerClick}
                containerRef={leftPanelViewerRef}
              />
              
              {/* Кнопка закрытия левой панели */}
              <button 
                className={`${styles.closeViewerBtn} ${styles.leftPanelClose}`}
                onClick={handleCloseLeftPanel}
                title="Закрыть левое изображение"
              >
                <i className="fas fa-times"></i>
              </button>
              
              {/* Индикатор даты для левой панели */}
              <div className={`${styles.panelDateIndicator} ${styles.leftPanelDate}`}>
                {leftPanelDate.toLocaleDateString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </div>
              
                                           {/* Нижний сайдбар для левой панели */}
              <div className={styles.bottomSidebar}>
                <div className={styles.miniSidebar}>
                  <DateSelector
                    selectedDate={leftPanelDate}
                    onDateChange={handleLeftPanelDateChange}
                    availableDates={availableDates}
                    isDateAvailable={isDateAvailable}
                    getWorkersCount={(date) => isDateAvailable(date) ? 1 : 0}
                    dropdownPosition="top"
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <VideoControls
                    isPlaying={isVideoPlaying}
                    shootingTime={getLeftPanelShootingTime()}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onFirstFrame={handleVideoFirstFrame}
                    onPreviousFrame={handleVideoPreviousFrame}
                    onNextFrame={handleVideoNextFrame}
                    onLastFrame={handleVideoLastFrame}
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <FilterControls
                    onFiltersClick={handleFiltersClick}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </div>

              {/* Правый вертикальный сайдбар для левой панели */}
              <ViewerControlsSidebar
                onImageSettings={handleImageSettings}
                onSplitScreen={handleSplitScreen}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                currentZoom={currentCamera.fov}
              />
            </div>
          </div>

          {/* Кнопка сравнения между панелями */}
          <div className={styles.compareButtonContainer}>
            <button 
              className={styles.compareButton}
              onClick={handleAddToAIComparison}
              disabled={!leftPanelImage || !rightPanelImage || leftPanelDate.getTime() === rightPanelDate.getTime()}
              title={leftPanelDate.getTime() === rightPanelDate.getTime() ? 
                "Нельзя сравнить одинаковые изображения" : 
                "Добавить в AI сравнение"
              }
            >
              <i className="fas fa-magic"></i>
              <span>Сравнить</span>
            </button>
          </div>

          {/* Правая панель */}
          <div className={styles.splitScreenPanel}>
            <div className={styles.panoramaWrapper}>
              <PanoramaViewer
                ref={rightPanelViewerRef}
                imageUrl={getRightPanelImageUrl()}
                onCameraChange={handleRightPanelCameraChange}
                onPanoramaClick={isFieldNoteMode ? handlePanoramaClick : undefined}
                className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
                initialCamera={getRightPanelInitialCamera()}
                isFieldNoteMode={isFieldNoteMode}
                key={`right-panel-${rightPanelDate.getTime()}-${currentOPImageIndex}`}
              />
              
              {/* Маркеры полевых заметок для правой панели */}
              <FieldNoteMarkers
                fieldNotes={fieldNotes}
                onMarkerClick={handleMarkerClick}
                containerRef={rightPanelViewerRef}
              />
              
              {/* Кнопка закрытия правой панели */}
              <button 
                className={`${styles.closeViewerBtn} ${styles.rightPanelClose}`}
                onClick={handleCloseRightPanel}
                title="Закрыть правое изображение"
              >
                <i className="fas fa-times"></i>
              </button>
              
              {/* Индикатор даты для правой панели */}
              <div className={`${styles.panelDateIndicator} ${styles.rightPanelDate}`}>
                {rightPanelDate.toLocaleDateString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </div>
              
                             {/* Нижний сайдбар для правой панели */}
               <div className={styles.bottomSidebar}>
                 <div className={styles.miniSidebar}>
                   <DateSelector
                     selectedDate={rightPanelDate}
                     onDateChange={handleRightPanelDateChange}
                     availableDates={availableDates}
                     isDateAvailable={isDateAvailable}
                     getWorkersCount={(date) => isDateAvailable(date) ? 1 : 0}
                     dropdownPosition="top"
                   />
                 </div>
                
                <div className={styles.miniSidebar}>
                  <VideoControls
                    isPlaying={isVideoPlaying}
                    shootingTime={getRightPanelShootingTime()}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onFirstFrame={handleVideoFirstFrame}
                    onPreviousFrame={handleVideoPreviousFrame}
                    onNextFrame={handleVideoNextFrame}
                    onLastFrame={handleVideoLastFrame}
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <FilterControls
                    onFiltersClick={handleFiltersClick}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </div>

              {/* Правый вертикальный сайдбар для правой панели */}
              <ViewerControlsSidebar
                onImageSettings={handleImageSettings}
                onSplitScreen={handleSplitScreen}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                currentZoom={currentCamera.fov}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.viewer360}>
      {/* Левый сайдбар */}
      <div 
        className={`${styles.viewerSidebar} ${isExpanded ? styles.expanded : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {sidebarItems.map((item) => {
          // Рендер разделителя
          if (item.type === 'separator') {
            return (
              <div 
                key={item.id} 
                className={styles.divider}
              />
            );
          }
          
          // Рендер обычного элемента
          return (
            <button
              key={item.id}
              className={`${styles.sidebarItem} ${isItemActive(item.id) ? styles.active : ''}`}
              onClick={() => handleSidebarClick(item)}
              onMouseEnter={() => setHoveredSidebarItem(item.id)}
              onMouseLeave={() => setHoveredSidebarItem(null)}
              aria-label={item.label}
            >
              <i className={item.icon} aria-hidden="true"></i>
              {isExpanded && (
                <span className={styles.itemLabel}>{item.label}</span>
              )}
              {!isExpanded && hoveredSidebarItem === item.id && (
                <div className={styles.tooltip} role="tooltip">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Основная область */}
      <div className={styles.viewerMain}>
        {viewMode === 'viewer' && renderViewer()}
        {viewMode === 'generic360' && !isSplitScreenMode && renderGeneric360()}
        {viewMode === 'generic360' && isSplitScreenMode && renderSplitScreen()}
        {viewMode === 'schemes' && renderSchemes()}

        {/* Фон-оверлей для развернутой миникарты */}
        {isMinimapExpanded && (
          <div 
            className={styles.minimapOverlay}
            onClick={handleMinimapToggle}
          />
        )}

        {/* Миникарта со схемами */}
        {isMinimapVisible && viewMode !== 'schemes' && renderSchemesMinimap()}

        {/* Модальные окна */}
        {showComparisonSelector && renderComparisonSelector()}
        
        {/* Модальное окно полевой заметки */}
        <FieldNoteModal
          isOpen={isFieldNoteModalOpen}
          onClose={handleCloseFieldNoteModal}
          onSave={handleSaveFieldNote}
          onDelete={handleDeleteFieldNote}
          notePosition={fieldNotePosition}
          screenshot={fieldNoteScreenshot}
          schemePreview={selectedScheme?.fullImage}
          project={project}
          photoDate={selectedDate.toISOString()}
          availableStatuses={project?.fieldNotes?.statuses || []}
          availableTags={project?.fieldNotes?.tags || []}
          editingNote={editingFieldNote}
        />
        
        {/* Сайдбар полевых заметок */}
        <ViewerSidebar
          isVisible={isFieldNotesSidebarVisible}
          fieldNotes={fieldNotes}
          onFieldNoteClick={handleFieldNoteClick}
          onClose={handleCloseFieldNotesSidebar}
        />
        
        {/* Сайдбар AI сравнения */}
        <AIComparisonSidebar
          isVisible={isAIComparisonSidebarVisible}
          comparisonImages={aiComparisonImages}
          onClose={handleCloseAIComparison}
          onAnalyze={analyzeImagesWithAI}
          analysisResult={aiAnalysisResult}
          isAnalyzing={isAIAnalyzing}
        />
        
        {/* Раздел таймлапсов */}
        {isTimelapsesSectionVisible && (
          <TimelapsesSection
            onCreateVideo={handleCreateVideo}
            onClose={handleCloseTimelapsesSection}
          />
        )}
        
        {/* Раздел съемки с дронов */}
        {isDroneShotsSectionVisible && (
          <DroneShotsSection
            onClose={handleCloseDroneShotsSection}
            onUpload={handleDroneFilesUpload}
          />
        )}
        
        {/* Модальное окно участников */}
        <ParticipantModal
          isOpen={isParticipantModalOpen}
          onClose={handleCloseParticipantModal}
          project={project}
          currentUser={currentUser}
          onAddParticipant={handleAddParticipant}
        />


      </div>
    </div>
  );
};

Viewer360Container.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    preview: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default Viewer360Container;