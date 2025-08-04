import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PanoramaViewer from './components/PanoramaViewer/PanoramaViewer';
import SchemesView from './components/SchemesView';
import DateSelector from './components/DateSelector/DateSelector';
import VideoControls from './components/VideoControls/VideoControls';
import FilterControls from './components/FilterControls/FilterControls';
import TopToolbar from './components/TopToolbar';
import ViewerControlsSidebar from './components/ViewerControlsSidebar';
import FieldNoteMarkers from './components/FieldNoteMarkers';

import { FieldNoteModal, ParticipantModal } from '../ProjectEditor/modals';
import usePanoramaSync from './components/PanoramaViewer/hooks/usePanoramaSync';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../../utils/userManager';

// Импорт новых хуков и компонентов
import { 
  useViewerState,
  useFieldNotes,
  useAIComparison,
  useSplitScreen,
  useImageManagement,
  useUIState,
  useImageSettings,
  useEventHandlers,
  useImageUtilities,
  useNavigationHandlers
} from './hooks';
import ViewerModeRenderer from './layout/ViewerModeRenderer';
import ViewerModals from './layout/ViewerModals';
  import ViewerSidebars from './layout/ViewerSidebars';
  import SchemesMinimap from './components/SchemesMinimap';
  import useSplitScreenSync from './hooks/useSplitScreenSync';


import styles from './Viewer360Container.module.css';

const Viewer360Container = ({ project, onBack }) => {
  const navigate = useNavigate();
  const currentUser = getUserData();
  
  // Refs для вьюверов (создаем до инициализации хуков)
  const mainViewerRef = useRef(null);
  const leftPanelViewerRef = useRef(null);
  const rightPanelViewerRef = useRef(null);
  
  // Инициализация кастомных хуков
  const viewerState = useViewerState();
  const fieldNotesState = useFieldNotes();
  const aiComparisonState = useAIComparison();
  const splitScreenState = useSplitScreen();
  const imageManagement = useImageManagement();
  const uiState = useUIState();
  const imageSettings = useImageSettings();
  const eventHandlers = useEventHandlers();
  const imageUtilities = useImageUtilities(viewerState, imageManagement, splitScreenState);
  const navigationHandlers = useNavigationHandlers(viewerState, imageManagement, splitScreenState, imageUtilities, mainViewerRef, leftPanelViewerRef, rightPanelViewerRef);



  // AI сравнение теперь обрабатывается через хук aiComparisonState

  // Логгирование изменений viewMode для отладки
  useEffect(() => {

  }, [viewerState.viewMode]);

  // Инициализация схемы и этажа при загрузке
  useEffect(() => {
    if (!viewerState.selectedScheme && project?.floors?.length > 0) {
      // Выбираем схему по умолчанию (2-й этаж)
      const defaultScheme = project.floors.find(floor => floor.id === 2) || project.floors[0];
      viewerState.setSelectedScheme(defaultScheme);
      
      // Синхронизируем этаж в imageManagement
      const floorNumber = defaultScheme.id;
      imageManagement.changeFloor(floorNumber);
      
      // Устанавливаем правильную дату для этажа
      const defaultDate = floorNumber === 1 ? new Date(2025, 6, 21) : new Date(2025, 6, 24);
      viewerState.setSelectedDate(defaultDate);
      
      console.log(`🏗️ Инициализация: схема "${defaultScheme.name}" (этаж ${floorNumber}), дата ${defaultDate.toDateString()}`);
    }
  }, [project, viewerState.selectedScheme, viewerState, imageManagement]);
  


  // Получаем доступные даты для текущего этажа
  const availableDates = imageUtilities.getAvailableDates(viewerState.selectedScheme?.id || 2);

  const comparisonViewerRef = useRef(null);
  // Ref на корневой контейнер миникарты (включает кнопку выбора схемы и выпадающий список)
  const schemesMinimapRef = useRef(null);
  const minimapRef = useRef(null);
  const isDraggingMinimap = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

      // Хук для синхронизации камер
    const sync = usePanoramaSync(mainViewerRef, comparisonViewerRef, viewerState.isComparisonMode);
    const splitScreenSync = useSplitScreenSync(leftPanelViewerRef, rightPanelViewerRef);

  // Ref для актуального значения viewerState.isComparisonMode (избегаем проблем с замыканиями)
  const isComparisonModeRef = React.useRef(viewerState.isComparisonMode);
  
  // Обновляем ref при изменении состояния режима сравнения
  React.useEffect(() => {
    isComparisonModeRef.current = viewerState.isComparisonMode;
  }, [viewerState.isComparisonMode]);

  // Устанавливаем первую схему по умолчанию
  React.useEffect(() => {
    if (project?.floors && project.floors.length > 0 && !viewerState.selectedScheme) {
      viewerState.setSelectedScheme(project.floors[0]);
    }
  }, [project, viewerState.selectedScheme]);

  // Синхронизация этажей и обновление дат при смене схемы
  React.useEffect(() => {
    if (viewerState.selectedScheme) {
      const floorId = viewerState.selectedScheme.id;
      
      // Синхронизируем этаж в imageManagement если он отличается
      if (imageManagement.currentFloor !== floorId) {
        console.log(`🔄 Синхронизация: переключение этажа с ${imageManagement.currentFloor} на ${floorId}`);
        imageManagement.changeFloor(floorId);
      }
      
      const currentDates = imageUtilities.getAvailableDates(floorId);
      
      // Проверяем, доступна ли текущая выбранная дата для нового этажа
      const isCurrentDateAvailable = currentDates.some(date => 
        date.toDateString() === viewerState.selectedDate.toDateString()
      );
      
      // Если текущая дата недоступна, выбираем самую новую доступную дату
      if (!isCurrentDateAvailable) {
        const newDate = currentDates[currentDates.length - 1]; // Самая новая дата (current)
        console.log(`📅 Смена даты для этажа ${floorId}: ${viewerState.selectedDate.toDateString()} → ${newDate.toDateString()}`);
        viewerState.setSelectedDate(newDate);
      }

      // Проверяем и корректируем индекс изображения для нового этажа
      const maxIndex = imageUtilities.getMaxImageIndex(floorId);
      if (imageManagement.currentOPImageIndex > maxIndex) {
        console.log(`🔧 Сброс индекса изображения с ${imageManagement.currentOPImageIndex} на ${maxIndex} для этажа ${floorId}`);
        imageManagement.setCurrentOPImageIndex(maxIndex);
      }

      // Обновление изображений в разделенном экране перенесено в отдельный useEffect
      // чтобы избежать конфликтов с изменениями дат в панелях
    }
  }, [viewerState.selectedScheme, imageManagement, imageUtilities]);


  // Закрытие dropdown при клике вне его области
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (schemesMinimapRef.current && !schemesMinimapRef.current.contains(event.target)) {
        viewerState.setIsSchemeDropdownOpen(false);
        viewerState.setIsSchemeSearchVisible(false);
        viewerState.setSchemeSearchQuery('');
      }
    };

    if (viewerState.isSchemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewerState.isSchemeDropdownOpen]);

  // Пункты сайдбара
  const sidebarItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Дом', action: onBack },
    { id: 'images', icon: 'fas fa-image', label: 'Изображение', isActive: true },
    { id: 'schemes', icon: 'fas fa-layer-group', label: 'Планы этажей' },
    { id: 'field-notes', icon: 'fas fa-sticky-note', label: 'Полевые заметки' },
    { id: 'ai-comparison', icon: 'fas fa-brain', label: 'AI сравнение' },
    { id: 'timelapses', icon: 'fas fa-clock', label: 'Таймлапсы' },
    { id: 'drone-shots', icon: 'fas fa-helicopter', label: 'Съемка с дронов' },
    { id: 'separator-2', type: 'separator' },
    { id: 'participants', icon: 'fas fa-users', label: 'Участники' },
    { id: 'project-settings', icon: 'fas fa-cog', label: 'Настройки проекта' },
  ];



  // getPhotoRoomInfo удалена - была частью фото архива который больше не используется

  // Получение проанализированных видео из проекта
  const getAnalyzedVideos = () => {
    if (!project?.videos360) return [];
    return project.videos360.filter(video => 
      video.status === 'ready' && video.analysisStatus === 'analyzed'
    );
  };

  // Обработчики навигации - Фото архив
  // handleOpenArchive удален - архив больше не используется

  const handleSelectRoomGroup = (roomKey) => {
    viewerState.setSelectedRoomKey(roomKey);
    viewerState.setViewMode('roomGroup');
  };

  const handleSelectPhoto = (photo) => {
    viewerState.setSelectedPhoto(photo);
    viewerState.setViewMode('viewer');
  };

  // handleBackToArchive удален - архив больше не используется

  const handleBackToRoomGroup = () => {
    viewerState.setViewMode('roomGroup');
    viewerState.setSelectedPhoto(null);
    viewerState.setComparisonPhoto(null);
    viewerState.setIsComparisonMode(false);
  };

  // Обработчики навигации - Видео 360
  const handleOpenVideo360List = () => {
    viewerState.setViewMode('video360List');
    viewerState.setSelectedVideo(null);
    viewerState.setSelectedPhoto(null);
    viewerState.setSelectedRoomKey(null);
    setCurrentFrameIndex(0);
  };

  const handleSelectVideo = (video) => {
    if (video.analysisStatus !== 'analyzed' || !video.extractedFrames.length) {
      alert('Видео не проанализировано или не содержит кадров');
      return;
    }
    viewerState.setSelectedVideo(video);
    setCurrentFrameIndex(0);
    viewerState.setViewMode('videoWalkthrough');
  };

  const handleBackToVideo360List = () => {
    viewerState.setViewMode('video360List');
    viewerState.setSelectedVideo(null);
    setCurrentFrameIndex(0);
  };

  const handleFrameNavigation = (frameIndex) => {
    if (selectedVideo && frameIndex >= 0 && frameIndex < selectedVideo.extractedFrames.length) {
      setCurrentFrameIndex(frameIndex);
    }
  };

  // Обработчики сравнения
  const handleComparisonToggle = () => {
    if (viewerState.isComparisonMode) {
      viewerState.setIsComparisonMode(false);
      setComparisonPhoto(null);
    } else {
      setShowComparisonSelector(true);
    }
  };

  const handleSelectComparisonPhoto = (photo) => {
    setComparisonPhoto(photo);
    viewerState.setIsComparisonMode(true);
    setShowComparisonSelector(false);
  };

  // Закрытие фотографий
  const handleCloseMainImage = () => {
    if (viewerState.isComparisonMode && comparisonPhoto) {
      viewerState.setSelectedPhoto(comparisonPhoto);
      setComparisonPhoto(null);
      viewerState.setIsComparisonMode(false);
    } else {
      handleBackToRoomGroup();
    }
  };

  const handleCloseComparisonImage = () => {
    setComparisonPhoto(null);
    viewerState.setIsComparisonMode(false);
  };

  // Обработчик клика по пункту сайдбара
  const handleSidebarClick = (item) => {
    // Сначала закрываем все дополнительные панели
    fieldNotesState.setIsFieldNotesSidebarVisible(false);
    uiState.setIsTimelapsesSectionVisible(false);
    uiState.setIsDroneShotsSectionVisible(false);
          aiComparisonState.setIsAIComparisonSidebarVisible(false);
    
    if (item.action) {
      item.action();
    } else if (item.id === 'images') {
      // Пункт "Изображение" - показываем 360° изображение
              viewerState.setCurrentSidebarSection('images');
      viewerState.setViewMode('generic360');
    } else if (item.id === 'schemes') {
      // Пункт "Схемы" - показываем панель просмотра схем
              viewerState.setCurrentSidebarSection('schemes');
      viewerState.setViewMode('schemes');
    } else if (item.id === 'field-notes') {
      // Пункт "Полевые заметки" - показываем сайдбар полевых заметок
      viewerState.setCurrentSidebarSection('field-notes');
      viewerState.setViewMode('generic360');
      fieldNotesState.setIsFieldNotesSidebarVisible(true);
    } else if (item.id === 'ai-comparison') {
      // Пункт "AI сравнение" - показываем сайдбар AI сравнения
      viewerState.setCurrentSidebarSection('ai-comparison');
      viewerState.setViewMode('generic360');
      aiComparisonState.setIsAIComparisonSidebarVisible(true);
    } else if (item.id === 'timelapses') {
      // Пункт "Таймлапсы" - показываем раздел таймлапсов
      viewerState.setCurrentSidebarSection('timelapses');
      viewerState.setViewMode('generic360');
      uiState.setIsTimelapsesSectionVisible(true);
    } else if (item.id === 'drone-shots') {
      // Пункт "Съемка с дронов" - показываем раздел съемки с дронов
      viewerState.setCurrentSidebarSection('drone-shots');
      viewerState.setViewMode('generic360');
      uiState.setIsDroneShotsSectionVisible(true);
    } else if (item.id === 'participants') {
      // Пункт "Участники" - показываем модальное окно участников
      viewerState.setCurrentSidebarSection('participants');
      uiState.setIsParticipantModalOpen(true);
    } else if (item.id === 'project-settings') {
      // Пункт "Настройки проекта" - переходим в настройки проекта
      viewerState.setCurrentSidebarSection('project-settings');
      navigate(`/editor/${project.id}?mode=settings`);
    } else if (item.type === 'separator') {
      // Разделители не кликабельны
      return;
    } else {
      // Все остальные пункты - показываем 360° изображение (заглушки)
      viewerState.setCurrentSidebarSection(item.id);
      viewerState.setViewMode('generic360');
    }
  };





  // Координаты камеры перенесены в хук useImageUtilities.js

















  // Сохраняем позицию камеры для восстановления при смене изображения
  const [savedCameraPosition, setSavedCameraPosition] = useState({ yaw: 0, pitch: 0, fov: 75 });
  
  // Логируем изменения savedCameraPosition
  useEffect(() => {

  }, [savedCameraPosition]);

  // Флаг для отслеживания, устанавливаем ли мы начальную позицию программно
  const isSettingInitialPositionRef = useRef(false);

  // Обновляем начальную позицию камеры при смене этажа, даты или изображения
  useEffect(() => {

    
    // В режиме разделения экрана каждая панель получает свои координаты через getLeftPanelInitialCamera/getRightPanelInitialCamera
    // Но главная камера все равно должна обновляться для синхронизации
    if (viewerState.isComparisonMode) {

      return;
    }

    const floorId = viewerState.selectedScheme?.id || 2;

    
    const initialPosition = imageUtilities.getInitialCameraPosition(floorId, viewerState.selectedDate, imageManagement.currentOPImageIndex);
    

    

    
    // Устанавливаем флаг что мы программно обновляем позицию
    isSettingInitialPositionRef.current = true;
    
    // Проверяем изменилась ли позиция перед обновлением
    const currentPos = savedCameraPosition;
    const positionChanged = 
      Math.abs(currentPos.yaw - initialPosition.yaw) > 0.01 ||
      Math.abs(currentPos.pitch - initialPosition.pitch) > 0.01 ||
      Math.abs(currentPos.fov - initialPosition.fov) > 0.01;
    

    
    if (positionChanged) {

      // Обновляем позиции
      setSavedCameraPosition(initialPosition);
      viewerState.setCurrentCamera(initialPosition);
    } else {

    }
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isSettingInitialPositionRef.current = false;
    }, 100);
  }, [viewerState.selectedScheme, viewerState.selectedDate, imageManagement.currentOPImageIndex, viewerState.isComparisonMode, splitScreenState.isSplitScreenMode]);

  // Обновляем сохраненную позицию при изменении камеры пользователем (НЕ программно)
  useEffect(() => {

    
    if (!isSettingInitialPositionRef.current) {

      setSavedCameraPosition(viewerState.currentCamera);
    } else {

    }
  }, [viewerState.currentCamera]);

  // Логика восстановления позиции теперь не нужна, 
  // так как позиция передается через initialCamera пропс в PanoramaViewer



  const handleSchemeSearch = (searchTerm) => {
    // Обработчик поиска по схемам
    console.log('Scheme search:', searchTerm);
    // Заглушка для поиска по схемам
  };

  // handleFiltersClick теперь из viewerState.handleFiltersClick



  // Обработчики для верхнего тулбара теперь в fieldNotesState
  // handleCreateFieldNote и handlePanoramaClick перенесены в fieldNotesState



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
    fieldNotesState.setIsFieldNotesSidebarVisible(false);
  };

  // Обработчик клика по полевой заметке в сайдбаре
  const handleFieldNoteClick = (note) => {
    console.log('🔍 Клик по полевой заметке в сайдбаре:', note);
    console.log('📍 Позиция заметки:', note.position);
    
    // Переключаемся на изображение где была создана заметка
    if (note.position) {
      console.log('🏗️ Текущий этаж:', imageManagement.currentFloor, 'Этаж заметки:', note.position.floor);
      console.log('📅 Текущая дата:', viewerState.selectedDate, 'Дата заметки:', note.position.date);
      console.log('📸 Текущий индекс:', imageManagement.currentOPImageIndex, 'Индекс заметки:', note.position.imageIndex);
      
      // Переключаем этаж если нужно
      if (note.position.floor && note.position.floor !== imageManagement.currentFloor) {
        const targetScheme = project?.floors?.find(floor => floor.id === note.position.floor);
        if (targetScheme) {
          console.log('🏗️ Переключаемся на этаж:', targetScheme.name);
          viewerState.setSelectedScheme(targetScheme);
          imageManagement.changeFloor(note.position.floor);
        }
      }
      
      // Переключаем дату если нужно
      if (note.position.date && note.position.date !== viewerState.selectedDate?.toISOString()) {
        const targetDate = new Date(note.position.date);
        viewerState.setSelectedDate(targetDate);
      }
      
      // Переключаем индекс изображения если нужно
      if (note.position.imageIndex && note.position.imageIndex !== imageManagement.currentOPImageIndex) {
        imageManagement.setCurrentOPImageIndex(note.position.imageIndex);
        
        // Обновляем изображения в режиме split screen
        if (splitScreenState.isSplitScreenMode) {
          const targetDate = note.position.date ? new Date(note.position.date) : viewerState.selectedDate;
          const targetFloor = note.position.floor || imageManagement.currentFloor;
          const targetIndex = note.position.imageIndex;
          
          // Используем функцию с явным указанием параметров
          const imageUrl = imageUtilities.getOPImageUrlWithFloor 
            ? imageUtilities.getOPImageUrlWithFloor(targetDate, targetFloor, targetIndex)
            : imageUtilities.getOPImageUrl(targetDate);
            
          splitScreenState.setLeftPanelImage(imageUrl);
          splitScreenState.setRightPanelImage(imageUrl);
          splitScreenState.setLeftPanelDate(targetDate);
          splitScreenState.setRightPanelDate(targetDate);
        }
      }
      
      // Даем время на загрузку изображения, затем позиционируем камеру
      setTimeout(() => {
        if (note.position.yaw !== undefined && note.position.pitch !== undefined) {
          if (splitScreenState.isSplitScreenMode) {
            // В режиме разделения экрана используем синхронизацию
            sync.syncLookAt(note.position.yaw, note.position.pitch, null, 1000);
          } else if (mainViewerRef.current) {
            // В обычном режиме используем основной viewer
            mainViewerRef.current.lookAt(note.position.yaw, note.position.pitch, null, 1000);
          }
        }
      }, 500); // Задержка для загрузки изображения
    } else {
      console.log('⚠️ У заметки нет позиции, открываем только модальное окно');
      // Если нет позиции, просто позиционируем камеру по 3D координатам
      if (note.position && note.position.yaw !== undefined && note.position.pitch !== undefined) {
        if (splitScreenState.isSplitScreenMode) {
          sync.syncLookAt(note.position.yaw, note.position.pitch, null, 1000);
        } else if (mainViewerRef.current) {
          mainViewerRef.current.lookAt(note.position.yaw, note.position.pitch, null, 1000);
        }
      }
    }
    
    // Открываем модальное окно для просмотра/редактирования заметки
    fieldNotesState.setEditingFieldNote(note);
    fieldNotesState.setFieldNotePosition(note.position);
    fieldNotesState.setFieldNoteScreenshot(note.screenshot || null);
    fieldNotesState.setIsFieldNoteModalOpen(true);
    
    // Закрываем сайдбар полевых заметок после клика (по желанию)
    fieldNotesState.setIsFieldNotesSidebarVisible(false);
  };

  const handleCreateVideo = () => {
    console.log('Создать покадровое видео - заглушка');
    // Здесь будет логика создания покадрового видео
    // Можно добавить уведомление пользователю
    alert('Функция создания покадрового видео будет реализована в будущих версиях');
  };

  // Обработчик закрытия раздела таймлапсов
  const handleCloseTimelapsesSection = () => {
    uiState.setIsTimelapsesSectionVisible(false);
            viewerState.setCurrentSidebarSection('images');
  };

  // Обработчик закрытия раздела съемки с дронов
  const handleCloseDroneShotsSection = () => {
    uiState.setIsDroneShotsSectionVisible(false);
            viewerState.setCurrentSidebarSection('images');
  };

  // Обработчик загрузки файлов с дронов
  const handleDroneFilesUpload = (files) => {
    console.log('Загружены файлы с дронов:', files);
    // Здесь будет логика обработки загруженных файлов
    alert(`Загружено ${files.length} файлов. Обработка начнется в ближайшее время.`);
  };

  // Обработчик закрытия модального окна участников
  const handleCloseParticipantModal = () => {
    uiState.setIsParticipantModalOpen(false);
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

  // handleImageSettings теперь из imageSettings.handleImageSettings
  
  // Обёртка для handlePanoramaClick из fieldNotesState
  const handlePanoramaClick = (event) => {
    return fieldNotesState.handlePanoramaClick(event, mainViewerRef, viewerState, imageManagement);
  };



  // Обработчики для миникарты
  const handleMinimapToggle = () => {
    viewerState.setIsMinimapExpanded(!viewerState.isMinimapExpanded);
    // Всегда сбрасываем зум и позицию при переключении
    viewerState.setMinimapZoom(1);
    viewerState.setMinimapPosition({ x: 0, y: 0 });
    // Сбрасываем состояние перетаскивания
    isDraggingMinimap.current = false;
    viewerState.setIsMinimapDragging(false);
  };



  const handleMinimapMouseDown = (event) => {
    if (event.button === 0 && viewerState.isMinimapExpanded) { // Левая кнопка мыши и развернутый режим
      isDraggingMinimap.current = true;
      viewerState.setIsMinimapDragging(true);
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  };

  const handleMinimapMouseMove = (event) => {
    if (isDraggingMinimap.current && viewerState.isMinimapExpanded) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;
      
      viewerState.setMinimapPosition(prev => {
        // Более строгие ограничения для предотвращения выхода изображения за границы
        const container = minimapRef.current;
        if (!container) return prev;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Вычисляем максимальные смещения на основе зума и размеров контейнера
        const maxOffsetX = Math.max(0, (containerWidth * (viewerState.minimapZoom - 1)) / 2);
        const maxOffsetY = Math.max(0, (containerHeight * (viewerState.minimapZoom - 1)) / 2);
        
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
    viewerState.setIsMinimapDragging(false);
  };

  // useEffect для обработки глобальных событий мыши для миникарты
  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleMinimapMouseMove(event);
    const handleGlobalMouseUp = () => handleMinimapMouseUp();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && viewerState.isMinimapExpanded) {
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
  }, [viewerState.isMinimapExpanded, viewerState.minimapZoom]);

  // useEffect для обработки wheel события на миникарте с { passive: false }
  useEffect(() => {
    const container = minimapRef.current;
    if (!container || !viewerState.isMinimapExpanded) return;

    const handleWheelEvent = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.max(0.5, Math.min(3, viewerState.minimapZoom + delta));
      viewerState.setMinimapZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [viewerState.isMinimapExpanded, viewerState.minimapZoom]);

  // Обработчики изменения камеры
  const handleMainCameraChange = React.useCallback((cameraData) => {
    // Игнорируем дефолтные координаты от программных обновлений PanoramaViewer
    const isDefaultCoordinates = cameraData.yaw === 0 && cameraData.pitch === 0 && cameraData.fov === 75;
    if (isDefaultCoordinates && isSettingInitialPositionRef.current) {
      console.log('🚫 Игнорируем дефолтные координаты от программного обновления PanoramaViewer');
      return;
    }
    
    console.log('📹 handleMainCameraChange получил координаты:', JSON.stringify(cameraData, null, 2));
    const currentIsComparisonMode = isComparisonModeRef.current;
    viewerState.setCurrentCamera(cameraData);
    
    // Логирование координат камеры для настройки начальных позиций
    const floorId = viewerState.selectedScheme?.id || 2;
    const dateKey = viewerState.selectedDate.toDateString();
    const roundedCoords = {
      yaw: Math.round(cameraData.yaw * 100) / 100,
      pitch: Math.round(cameraData.pitch * 100) / 100,
      fov: Math.round(cameraData.fov * 100) / 100
    };
    
    console.log(`📹 ТЕКУЩИЕ КООРДИНАТЫ КАМЕРЫ:`, {
      floor: floorId,
      date: dateKey,
      imageIndex: imageManagement.currentOPImageIndex,
      coordinates: roundedCoords
    });
    
    // Формат для копирования в код
    console.log(`🔧 ФОРМАТ ДЛЯ КОДА:`, 
      `${imageManagement.currentOPImageIndex}: { yaw: ${roundedCoords.yaw}, pitch: ${roundedCoords.pitch}, fov: ${roundedCoords.fov} },`
    );
    
    if (currentIsComparisonMode) {
      sync.throttledSyncFromMain(cameraData);
    }
  }, [sync.throttledSyncFromMain, viewerState.selectedScheme, viewerState.selectedDate, imageManagement.currentOPImageIndex]);

  const handleComparisonCameraChange = React.useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    viewerState.setCurrentCamera(cameraData);
    if (currentIsComparisonMode) {
      sync.throttledSyncFromComparison(cameraData);
    }
  }, [sync.throttledSyncFromComparison]);

  // Изолированные состояния камер для split-screen панелей
  const [leftPanelCamera, setLeftPanelCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  const [rightPanelCamera, setRightPanelCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  
  // Начальные позиции камер для синхронизации (отдельно от текущих состояний)
  const [leftPanelInitialCamera, setLeftPanelInitialCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });
  const [rightPanelInitialCamera, setRightPanelInitialCamera] = useState({ yaw: 0, pitch: 0, fov: 75 });

  // Регистрируем геттеры начальных позиций в хуке синхронизации
  useEffect(() => {
    if (splitScreenSync?.setInitialCameraProviders) {
      splitScreenSync.setInitialCameraProviders(
        () => leftPanelInitialCamera,
        () => rightPanelInitialCamera
      );
    }
  }, [splitScreenSync, leftPanelInitialCamera, rightPanelInitialCamera]);
  
  // Refs для отслеживания последних изменений камеры (защита от программных обновлений)
  const lastLeftCameraChangeRef = useRef(0);
  const lastRightCameraChangeRef = useRef(0);
  
  // Refs для отслеживания предыдущих позиций камер (для предотвращения лишних обновлений)
  const previousLeftCameraRef = useRef({ yaw: 0, pitch: 0, fov: 75 });
  const previousRightCameraRef = useRef({ yaw: 0, pitch: 0, fov: 75 });
  
  // Декларативное обновление позиций камер при смене дат/кадров
  useEffect(() => {
    if (splitScreenState.isSplitScreenMode) {
      const newCamera = imageUtilities.getInitialCameraPosition(
        imageManagement.currentFloor || 2,
        splitScreenState.leftPanelDate,
        imageManagement.currentOPImageIndex
      );

      // Only update state if the camera position has actually changed from the initial position
      const prevCamera = previousLeftCameraRef.current;
      if (prevCamera.yaw !== newCamera.yaw || 
          prevCamera.pitch !== newCamera.pitch || 
          prevCamera.fov !== newCamera.fov) {
        setLeftPanelCamera(newCamera);
        setLeftPanelInitialCamera(newCamera); // Обновляем начальную позицию для синхронизации
        previousLeftCameraRef.current = newCamera;

      }
    }
  }, [splitScreenState.leftPanelDate, imageManagement.currentOPImageIndex, splitScreenState.isSplitScreenMode, imageManagement.currentFloor]);

  useEffect(() => {
    if (splitScreenState.isSplitScreenMode) {
      const newCamera = imageUtilities.getInitialCameraPosition(
        imageManagement.currentFloor || 2,
        splitScreenState.rightPanelDate, 
        imageManagement.currentOPImageIndex
      );

      // Only update state if the camera position has actually changed from the initial position
      const prevCamera = previousRightCameraRef.current;
      if (prevCamera.yaw !== newCamera.yaw || 
          prevCamera.pitch !== newCamera.pitch || 
          prevCamera.fov !== newCamera.fov) {
        setRightPanelCamera(newCamera);
        setRightPanelInitialCamera(newCamera); // Обновляем начальную позицию для синхронизации
        previousRightCameraRef.current = newCamera;

      }
    }
  }, [splitScreenState.rightPanelDate, imageManagement.currentOPImageIndex, splitScreenState.isSplitScreenMode, imageManagement.currentFloor]);

  // Инициализация состояний камер при включении split-screen режима
  useEffect(() => {
    if (splitScreenState.isSplitScreenMode) {
      const leftCamera = imageUtilities.getInitialCameraPosition(
        imageManagement.currentFloor || 2,
        splitScreenState.leftPanelDate,
        imageManagement.currentOPImageIndex
      );
      const rightCamera = imageUtilities.getInitialCameraPosition(
        imageManagement.currentFloor || 2,
        splitScreenState.rightPanelDate,
        imageManagement.currentOPImageIndex
      );
      
      setLeftPanelCamera(leftCamera);
      setRightPanelCamera(rightCamera);
      
      // Устанавливаем начальные позиции для синхронизации
      setLeftPanelInitialCamera(leftCamera);
      setRightPanelInitialCamera(rightCamera);
      

      
      // Обновляем refs для отслеживания начальных позиций
      previousLeftCameraRef.current = leftCamera;
      previousRightCameraRef.current = rightCamera;
    }
  }, [splitScreenState.isSplitScreenMode]);

  // Обработчики изменения камеры для панелей разделения экрана
  const handleLeftPanelCameraChange = React.useCallback((cameraData) => {
    if (splitScreenState.isSplitScreenMode) {
      setLeftPanelCamera(cameraData);
      splitScreenSync.syncFromLeftToRight(cameraData);
    } else {
      viewerState.setCurrentCamera(cameraData);
    }
  }, [splitScreenSync.syncFromLeftToRight, splitScreenState.isSplitScreenMode, viewerState]);

  const handleRightPanelCameraChange = React.useCallback((cameraData) => {
    if (splitScreenState.isSplitScreenMode) {
      setRightPanelCamera(cameraData);
      splitScreenSync.syncFromRightToLeft(cameraData);
    } else {
      viewerState.setCurrentCamera(cameraData);
    }
  }, [splitScreenSync.syncFromRightToLeft, splitScreenState.isSplitScreenMode, viewerState]);

  // Определение активной кнопки сайдбара
  const isItemActive = (itemId) => {
    // Активной является кнопка текущего раздела
    return itemId === viewerState.currentSidebarSection;
  };

  // renderPhotoArchive удален - функционал архива больше не используется

  // renderRoomGroupPhotos удален - функционал архива больше не используется

  // renderComparisonSelector удален - функционал архива больше не используется
  const renderComparisonSelector = () => {
      return null;
  };

  // renderComparisonSelectorOld удален - остался только код для заглушки
  const renderComparisonSelectorOld = () => {
    return null;
  };

  // Временная заглушка - удален сломанный код

  // Рендер 360° просмотрщика
  const renderViewer = () => {
    const roomInfo = getPhotoRoomInfo(selectedPhoto);
    
    return (
            <div className={`${styles.panoramaSection} ${viewerState.isComparisonMode ? styles.comparisonMode : ''}`}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={fieldNotesState.handleCreateFieldNote}
          onCreateVideo={() => eventHandlers.handleCreateVideo(uiState.setIsTimelapsesSectionVisible)}
          onShare={eventHandlers.handleShare}
          onDownloadScreen={eventHandlers.handleDownloadScreen}
          onDownloadImage360={eventHandlers.handleDownloadImage360}

          isFieldNoteMode={isFieldNoteMode}
        />

        {/* Основной просмотрщик */}
        <div className={styles.panoramaWrapper}>
          {(() => {
        
            return (
              <PanoramaViewer
                ref={mainViewerRef}
                imageUrl={selectedPhoto.url}
                onCameraChange={handleMainCameraChange}
                onPanoramaClick={handlePanoramaClick}
                className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
                initialCamera={savedCameraPosition}
                isFieldNoteMode={isFieldNoteMode}
              />
            );
          })()}
            
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
            title={viewerState.isComparisonMode ? "Закрыть это изображение" : "Закрыть просмотр"}
          >
            <i className="fas fa-times"></i>
          </button>
          
          {/* Новый нижний сайдбар с тремя мини-сайдбарами */}
          <div className={styles.bottomSidebar}>
            <div className={styles.miniSidebar}>
              <DateSelector
                selectedDate={viewerState.selectedDate}
                onDateChange={navigationHandlers.handleDateChange}
                availableDates={availableDates}
                isDateAvailable={imageUtilities.isDateAvailable}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={viewerState.isVideoPlaying}
                shootingTime={imageUtilities.getShootingTime()}
                onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
onFirstFrame={navigationHandlers.handleVideoFirstFrame}
onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
onNextFrame={navigationHandlers.handleVideoNextFrame}
onLastFrame={navigationHandlers.handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={viewerState.handleFiltersClick}
                hasActiveFilters={viewerState.hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={imageSettings.handleImageSettings}
            onSplitScreen={navigationHandlers.handleSplitScreen}
onZoomIn={navigationHandlers.handleZoomIn}
onZoomOut={navigationHandlers.handleZoomOut}
            currentZoom={viewerState.currentCamera.fov}
          />
        </div>

        {/* Сравнительный просмотрщик */}
        {viewerState.isComparisonMode && comparisonPhoto && (
          <div className={styles.panoramaWrapper}>
            <PanoramaViewer
              ref={comparisonViewerRef}
              imageUrl={comparisonPhoto.url}
              isComparison={true}
              onCameraChange={handleComparisonCameraChange}
              className={styles.comparisonViewer}
              initialCamera={savedCameraPosition}
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
                selectedDate={viewerState.selectedDate}
                onDateChange={navigationHandlers.handleDateChange}
                availableDates={availableDates}
                isDateAvailable={imageUtilities.isDateAvailable}
              />
              </div>
              
              <div className={styles.miniSidebar}>
                <VideoControls
                  isPlaying={viewerState.isVideoPlaying}
                  shootingTime={imageUtilities.getShootingTime()}
                  onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
onFirstFrame={navigationHandlers.handleVideoFirstFrame}
onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
onNextFrame={navigationHandlers.handleVideoNextFrame}
onLastFrame={navigationHandlers.handleVideoLastFrame}
                />
              </div>
              
              <div className={styles.miniSidebar}>
                <FilterControls
                  onFiltersClick={viewerState.handleFiltersClick}
                  hasActiveFilters={viewerState.hasActiveFilters}
                />
              </div>
            </div>

            {/* Правый вертикальный сайдбар с кнопками управления для сравнительного изображения */}
            <ViewerControlsSidebar
              onImageSettings={imageSettings.handleImageSettings}
              onSplitScreen={navigationHandlers.handleSplitScreen}
onZoomIn={navigationHandlers.handleZoomIn}
onZoomOut={navigationHandlers.handleZoomOut}
              currentZoom={viewerState.currentCamera.fov}
            />
          </div>
        )}
      </div>
    );
  };





  // Мемоизированный URL изображения для предотвращения лишних перерендеров
  const memoizedImageUrl = React.useMemo(() => {
    const url = imageUtilities?.getOPImageUrl?.() || '';
  
    return url;
  }, [imageManagement.currentOPImageIndex, imageManagement.currentFloor, viewerState.selectedDate, imageUtilities]);

    // Рендер 360° изображения для остальных разделов
  const renderGeneric360 = () => {

    return (
      <div className={styles.panoramaSection}>
        {/* Верхний тулбар */}
        <TopToolbar
          onCreateFieldNote={fieldNotesState.handleCreateFieldNote}
          onCreateVideo={() => eventHandlers.handleCreateVideo(uiState.setIsTimelapsesSectionVisible)}
          onShare={eventHandlers.handleShare}
          onDownloadScreen={eventHandlers.handleDownloadScreen}
          onDownloadImage360={eventHandlers.handleDownloadImage360}

          isFieldNoteMode={isFieldNoteMode}
        />

        <div className={styles.panoramaWrapper}>
          <PanoramaViewer
            ref={mainViewerRef}
            imageUrl={memoizedImageUrl}
            onCameraChange={handleMainCameraChange}
            onPanoramaClick={isFieldNoteMode ? handlePanoramaClick : undefined}
            className={`${styles.mainViewer} ${isFieldNoteMode ? styles.fieldNoteMode : ''}`}
            initialCamera={savedCameraPosition}
            key={`panorama-floor${imageManagement.currentFloor}-idx${imageManagement.currentOPImageIndex}-date${viewerState.selectedDate.getTime()}`}
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
                selectedDate={viewerState.selectedDate}
                onDateChange={navigationHandlers.handleDateChange}
                availableDates={availableDates}
                isDateAvailable={imageUtilities.isDateAvailable}
                getWorkersCount={(date) => imageUtilities.isDateAvailable(date) ? 1 : 0}
                dropdownPosition="top"
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <VideoControls
                isPlaying={viewerState.isVideoPlaying}
                shootingTime={imageUtilities.getShootingTime()}
                onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
onFirstFrame={navigationHandlers.handleVideoFirstFrame}
onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
onNextFrame={navigationHandlers.handleVideoNextFrame}
onLastFrame={navigationHandlers.handleVideoLastFrame}
              />
            </div>
            
            <div className={styles.miniSidebar}>
              <FilterControls
                onFiltersClick={viewerState.handleFiltersClick}
                hasActiveFilters={viewerState.hasActiveFilters}
              />
            </div>
          </div>

          {/* Правый вертикальный сайдбар с кнопками управления */}
          <ViewerControlsSidebar
            onImageSettings={imageSettings.handleImageSettings}
            onSplitScreen={navigationHandlers.handleSplitScreen}
onZoomIn={navigationHandlers.handleZoomIn}
onZoomOut={navigationHandlers.handleZoomOut}
            currentZoom={viewerState.currentCamera.fov}
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
          onCreateFieldNote={fieldNotesState.handleCreateFieldNote}
          onCreateVideo={() => eventHandlers.handleCreateVideo(uiState.setIsTimelapsesSectionVisible)}
          onShare={eventHandlers.handleShare}
          onDownloadScreen={eventHandlers.handleDownloadScreen}
          onDownloadImage360={eventHandlers.handleDownloadImage360}

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
                key={`left-panel-${splitScreenState.leftPanelDate.getTime()}-${imageManagement.currentOPImageIndex}`}
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
                onClick={navigationHandlers.handleCloseLeftPanel}
                title="Закрыть левое изображение"
              >
                <i className="fas fa-times"></i>
              </button>
              
              {/* Индикатор даты для левой панели */}
              <div className={`${styles.panelDateIndicator} ${styles.splitScreenState.leftPanelDate}`}>
                {splitScreenState.leftPanelDate.toLocaleDateString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </div>
              
                                           {/* Нижний сайдбар для левой панели */}
              <div className={styles.bottomSidebar}>
                <div className={styles.miniSidebar}>
                  <DateSelector
                    selectedDate={splitScreenState.leftPanelDate}
                    onDateChange={handleLeftPanelDateChange}
                    availableDates={availableDates}
                    isDateAvailable={imageUtilities.isDateAvailable}
                    getWorkersCount={(date) => imageUtilities.isDateAvailable(date) ? 1 : 0}
                    dropdownPosition="top"
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <VideoControls
                    isPlaying={viewerState.isVideoPlaying}
                    shootingTime={getLeftPanelShootingTime()}
                    onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
onFirstFrame={navigationHandlers.handleVideoFirstFrame}
onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
onNextFrame={navigationHandlers.handleVideoNextFrame}
onLastFrame={navigationHandlers.handleVideoLastFrame}
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <FilterControls
                    onFiltersClick={viewerState.handleFiltersClick}
                    hasActiveFilters={viewerState.hasActiveFilters}
                  />
                </div>
              </div>

              {/* Правый вертикальный сайдбар для левой панели */}
              <ViewerControlsSidebar
                onImageSettings={imageSettings.handleImageSettings}
                onSplitScreen={navigationHandlers.handleSplitScreen}
onZoomIn={navigationHandlers.handleZoomIn}
onZoomOut={navigationHandlers.handleZoomOut}
                currentZoom={viewerState.currentCamera.fov}
              />
            </div>
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
                key={`right-panel-${splitScreenState.rightPanelDate.getTime()}-${imageManagement.currentOPImageIndex}`}
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
                onClick={navigationHandlers.handleCloseRightPanel}
                title="Закрыть правое изображение"
              >
                <i className="fas fa-times"></i>
              </button>
              
              {/* Индикатор даты для правой панели */}
              <div className={`${styles.panelDateIndicator} ${styles.splitScreenState.rightPanelDate}`}>
                {splitScreenState.rightPanelDate.toLocaleDateString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </div>
              
                             {/* Нижний сайдбар для правой панели */}
               <div className={styles.bottomSidebar}>
                 <div className={styles.miniSidebar}>
                   <DateSelector
                     selectedDate={splitScreenState.rightPanelDate}
                     onDateChange={handleRightPanelDateChange}
                     availableDates={availableDates}
                     isDateAvailable={imageUtilities.isDateAvailable}
                     getWorkersCount={(date) => imageUtilities.isDateAvailable(date) ? 1 : 0}
                     dropdownPosition="top"
                   />
                 </div>
                
                <div className={styles.miniSidebar}>
                  <VideoControls
                    isPlaying={viewerState.isVideoPlaying}
                    shootingTime={getRightPanelShootingTime()}
                    onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
onFirstFrame={navigationHandlers.handleVideoFirstFrame}
onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
onNextFrame={navigationHandlers.handleVideoNextFrame}
onLastFrame={navigationHandlers.handleVideoLastFrame}
                  />
                </div>
                
                <div className={styles.miniSidebar}>
                  <FilterControls
                    onFiltersClick={viewerState.handleFiltersClick}
                    hasActiveFilters={viewerState.hasActiveFilters}
                  />
                </div>
              </div>

              {/* Правый вертикальный сайдбар для правой панели */}
              <ViewerControlsSidebar
                onImageSettings={imageSettings.handleImageSettings}
                onSplitScreen={navigationHandlers.handleSplitScreen}
onZoomIn={navigationHandlers.handleZoomIn}
onZoomOut={navigationHandlers.handleZoomOut}
                currentZoom={viewerState.currentCamera.fov}
                isCompact={true}
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
        className={`${styles.viewerSidebar} ${viewerState.isExpanded ? styles.expanded : ''}`}
        onMouseEnter={() => viewerState.setIsExpanded(true)}
        onMouseLeave={() => viewerState.setIsExpanded(false)}
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
              onMouseEnter={() => viewerState.setHoveredSidebarItem(item.id)}
              onMouseLeave={() => viewerState.setHoveredSidebarItem(null)}
              aria-label={item.label}
            >
              <i className={item.icon} aria-hidden="true"></i>
                              {viewerState.isExpanded && (
                <span className={styles.itemLabel}>{item.label}</span>
              )}
              {!viewerState.isExpanded && viewerState.hoveredSidebarItem === item.id && (
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
        <ViewerModeRenderer
          viewMode={viewerState.viewMode}
          isSplitScreenMode={splitScreenState.isSplitScreenMode}
          selectedPhoto={viewerState.selectedPhoto}
          selectedVideo={viewerState.selectedVideo}
          currentFrameIndex={viewerState.currentFrameIndex}
          selectedScheme={viewerState.selectedScheme}
          currentCamera={viewerState.currentCamera}
          initialCamera={splitScreenState.isSplitScreenMode ? null : savedCameraPosition}
          leftPanelImage={splitScreenState.leftPanelImage}
          rightPanelImage={splitScreenState.rightPanelImage}
          currentOPImageIndex={imageManagement.currentOPImageIndex}
          imageUrl={memoizedImageUrl}
          getCurrentImageUrl={imageManagement.getCurrentImageUrl}
          getLeftPanelImageUrl={imageUtilities.getLeftPanelImageUrl}
          getRightPanelImageUrl={imageUtilities.getRightPanelImageUrl}
          leftPanelCamera={leftPanelCamera}
          rightPanelCamera={rightPanelCamera}
          isFieldNoteMode={fieldNotesState.isFieldNoteMode}
          fieldNotes={fieldNotesState.fieldNotes}
          onPanoramaClick={handlePanoramaClick}
          onFieldNoteClick={handleFieldNoteClick}
          selectedDate={viewerState.selectedDate}
          isVideoPlaying={viewerState.isVideoPlaying}
          shootingTime={viewerState.shootingTime}
          hasActiveFilters={viewerState.hasActiveFilters}
          isExpanded={viewerState.isExpanded}
          currentSidebarSection={viewerState.currentSidebarSection}
          onCameraChange={viewerState.setCurrentCamera}
          onFrameChange={viewerState.setCurrentFrameIndex}
          onVideoTimeUpdate={navigationHandlers.handleVideoTimeUpdate}
onImageNavigation={navigationHandlers.handleImageNavigation}
          onSchemeSearch={handleSchemeSearch}
          onDateChange={navigationHandlers.handleDateChange}
          onLeftPanelDateChange={navigationHandlers.handleLeftPanelDateChange}
          onRightPanelDateChange={navigationHandlers.handleRightPanelDateChange}
          onFiltersClick={viewerState.handleFiltersClick}
          onPlay={navigationHandlers.handleVideoPlay}
onPause={navigationHandlers.handleVideoPause}
          onFirstFrame={navigationHandlers.handleVideoFirstFrame}
          onPreviousFrame={navigationHandlers.handleVideoPreviousFrame}
          onNextFrame={navigationHandlers.handleVideoNextFrame}
          onLastFrame={navigationHandlers.handleVideoLastFrame}
          onLeftPanelCameraChange={handleLeftPanelCameraChange}
          onRightPanelCameraChange={handleRightPanelCameraChange}
          onCloseLeftPanel={navigationHandlers.handleCloseLeftPanel}
onCloseRightPanel={navigationHandlers.handleCloseRightPanel}
          mainViewerRef={mainViewerRef}
          leftPanelViewerRef={leftPanelViewerRef}
          rightPanelViewerRef={rightPanelViewerRef}
          leftPanelDate={splitScreenState.leftPanelDate}
          rightPanelDate={splitScreenState.rightPanelDate}
          styles={styles}
          project={project}
          availableDates={availableDates}
          isDateAvailable={imageUtilities.isDateAvailable}
          onImageSettings={imageSettings.handleImageSettings}
          onSplitScreen={navigationHandlers.handleSplitScreen}
          onCompareImages={aiComparisonState.handleAddToAIComparison}
          onZoomIn={navigationHandlers.handleZoomIn}
          onZoomOut={navigationHandlers.handleZoomOut}
          onCreateFieldNote={fieldNotesState.handleCreateFieldNote}
          onCreateVideo={() => eventHandlers.handleCreateVideo(uiState.setIsTimelapsesSectionVisible)}
          onShare={eventHandlers.handleShare}
          onDownloadScreen={eventHandlers.handleDownloadScreen}
          onDownloadImage360={eventHandlers.handleDownloadImage360}
        />

        {/* Фон-оверлей для развернутой миникарты */}
        {viewerState.isMinimapExpanded && (
          <div 
            className={styles.minimapOverlay}
            onClick={handleMinimapToggle}
          />
        )}

        {/* Миникарта со схемами */}
        {viewerState.isMinimapVisible && viewerState.viewMode !== 'schemes' && (
          <SchemesMinimap
            project={project}
            viewerState={viewerState}
            imageManagement={imageManagement}
            splitScreenState={splitScreenState}
            getOPImageUrl={imageUtilities.getOPImageUrl}
            getOPImageUrlWithFloor={imageUtilities.getOPImageUrlWithFloor}
            handleMinimapToggle={handleMinimapToggle}
            schemesMinimapRef={schemesMinimapRef}
            minimapRef={minimapRef}
            handleMinimapMouseDown={handleMinimapMouseDown}
          />
        )}

        <ViewerModals
          isFieldNoteModalOpen={fieldNotesState.isFieldNoteModalOpen}
          onCloseFieldNoteModal={fieldNotesState.handleCloseFieldNoteModal}
          onSaveFieldNote={fieldNotesState.handleSaveFieldNote}
          onDeleteFieldNote={fieldNotesState.handleDeleteFieldNote}
          fieldNotePosition={fieldNotesState.fieldNotePosition}
          fieldNoteScreenshot={fieldNotesState.fieldNoteScreenshot}
          selectedScheme={viewerState.selectedScheme}
          project={project}
          selectedDate={viewerState.selectedDate}
          editingFieldNote={fieldNotesState.editingFieldNote}
          isParticipantModalOpen={uiState.isParticipantModalOpen}
          onCloseParticipantModal={handleCloseParticipantModal}
          currentUser={currentUser}
          onAddParticipant={handleAddParticipant}
        />
        
        <ViewerSidebars
          isFieldNotesSidebarVisible={fieldNotesState.isFieldNotesSidebarVisible}
          fieldNotes={fieldNotesState.fieldNotes}
          onFieldNoteClick={handleFieldNoteClick}
          onCloseFieldNotesSidebar={fieldNotesState.handleCloseFieldNotesSidebar}
          isAIComparisonSidebarVisible={aiComparisonState.isAIComparisonSidebarVisible}
          aiComparisonImages={aiComparisonState.aiComparisonImages}
          onCloseAIComparison={aiComparisonState.handleCloseAIComparison}
          onAnalyzeImages={aiComparisonState.analyzeImagesWithAI}
          aiAnalysisResult={aiComparisonState.aiAnalysisResult}
          isAIAnalyzing={aiComparisonState.isAIAnalyzing}
          isTimelapsesSectionVisible={uiState.isTimelapsesSectionVisible}
            onCreateVideo={handleCreateVideo}
          onCloseTimelapsesSection={handleCloseTimelapsesSection}
          isDroneShotsSectionVisible={uiState.isDroneShotsSectionVisible}
          onCloseDroneShotsSection={handleCloseDroneShotsSection}
          onDroneFilesUpload={handleDroneFilesUpload}
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