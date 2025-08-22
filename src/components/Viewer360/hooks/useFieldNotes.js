import { useState, useCallback } from 'react';

/**
 * Хук для управления полевыми заметками
 */
const useFieldNotes = () => {
  // Основные состояния полевых заметок
  const [isFieldNoteMode, setIsFieldNoteMode] = useState(false);
  const [isFieldNoteModalOpen, setIsFieldNoteModalOpen] = useState(false);
  const [fieldNotePosition, setFieldNotePosition] = useState(null);
  const [fieldNoteScreenshot, setFieldNoteScreenshot] = useState(null);
  const [fieldNotes, setFieldNotes] = useState([]);
  const [editingFieldNote, setEditingFieldNote] = useState(null);
  const [isFieldNotesSidebarVisible, setIsFieldNotesSidebarVisible] = useState(false);

  // Функции для работы с полевыми заметками
  const handleFieldNotePositionSet = (position, screenshot) => {
    setFieldNotePosition(position);
    setFieldNoteScreenshot(screenshot);
    setIsFieldNoteModalOpen(true);
  };

  const handleSaveFieldNote = (noteData) => {
    if (editingFieldNote) {
      // Редактирование существующей заметки
      setFieldNotes(prev => 
        prev.map(note => 
          note.id === editingFieldNote.id 
            ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
            : note
        )
      );
      setEditingFieldNote(null);
    } else {
      // Создание новой заметки
      const newNote = {
        id: `note_${Date.now()}`,
        ...noteData,
        position: fieldNotePosition,
        screenshot: fieldNoteScreenshot,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFieldNotes(prev => [...prev, newNote]);
    }
    
    setIsFieldNoteModalOpen(false);
    setFieldNotePosition(null);
    setFieldNoteScreenshot(null);
  };

  const handleDeleteFieldNote = (noteId) => {
    if (editingFieldNote && editingFieldNote.id === noteId) {
      setEditingFieldNote(null);
    }
    setFieldNotes(prev => prev.filter(note => note.id !== noteId));
    setIsFieldNoteModalOpen(false);
  };

  

  const handleFieldNoteClick = (note) => {
    setEditingFieldNote(note);
    setFieldNotePosition(note.position);
    setFieldNoteScreenshot(note.screenshot);
    setIsFieldNoteModalOpen(true);
  };

  const handleCloseFieldNoteModal = () => {
    setIsFieldNoteModalOpen(false);
    setFieldNotePosition(null);
    setFieldNoteScreenshot(null);
    setEditingFieldNote(null);
  };

  const handleToggleFieldNotesSidebar = () => {
    setIsFieldNotesSidebarVisible(prev => !prev);
  };

  const handleCloseFieldNotesSidebar = () => {
    setIsFieldNotesSidebarVisible(false);
  };

  // Обработчик для создания полевой заметки
  const handleCreateFieldNote = useCallback(() => {
    setIsFieldNoteMode(prev => !prev);
  }, []);

  // Обработчик клика на панораме для создания полевой заметки
  const handlePanoramaClick = useCallback(async (event, mainViewerRef, viewerState, imageManagement) => {
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
    const currentCameraPosition = mainViewerRef.current?.getCamera?.() || { yaw: 0, pitch: 0, fov: 75 };
    
    // Конвертируем пиксельные координаты в нормализованные координаты (-1 до 1)
    const normalizedX = (x / canvas.clientWidth) * 2 - 1;
    const normalizedY = -(y / canvas.clientHeight) * 2 + 1;
    
    // Вычисляем углы относительно центра экрана
    // Используем обратные формулы относительно отображения заметок
    const horizontalFOV = currentCameraPosition.fov * (canvas.clientWidth / canvas.clientHeight);
    const maxYawVisible = horizontalFOV / 2;
    const maxPitchVisible = currentCameraPosition.fov / 2;
    
    // Обратные формулы от FieldNoteMarkers
    const yawDiff = -normalizedX * maxYawVisible;
    const pitchDiff = -normalizedY * maxPitchVisible;
    
    const clickYaw = currentCameraPosition.yaw + yawDiff;
    const clickPitch = currentCameraPosition.pitch + pitchDiff;
    
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
      canvasHeight: canvas.clientHeight,
      // Информация об изображении для навигации
      floor: imageManagement?.currentFloor || 2,
      imageIndex: imageManagement?.currentOPImageIndex || 1,
      date: viewerState?.selectedDate?.toISOString() || new Date().toISOString()
    };
    
    setFieldNotePosition(notePosition);
    setFieldNoteScreenshot(screenshot);
    
    // Отключаем режим создания заметки и открываем модальное окно
    setIsFieldNoteMode(false);
    setIsFieldNoteModalOpen(true);
    
    console.log('Клик на позиции:', notePosition, 'Скриншот доступен:', !!screenshot);
  }, [isFieldNoteMode]);

  const enableFieldNoteMode = () => {
    setIsFieldNoteMode(true);
  };

  const disableFieldNoteMode = () => {
    setIsFieldNoteMode(false);
  };

  return {
    // Состояния
    isFieldNoteMode,
    isFieldNoteModalOpen,
    fieldNotePosition,
    fieldNoteScreenshot,
    fieldNotes,
    editingFieldNote,
    isFieldNotesSidebarVisible,
    
    // Функции
    handleFieldNotePositionSet,
    handleSaveFieldNote,
    handleDeleteFieldNote,
    handleFieldNoteClick,
    handleCloseFieldNoteModal,
    handleToggleFieldNotesSidebar,
    handleCloseFieldNotesSidebar,
    enableFieldNoteMode,
    disableFieldNoteMode,
    handleCreateFieldNote,
    handlePanoramaClick,
    
    // Сеттеры для прямого управления
    setIsFieldNoteMode,
    setIsFieldNoteModalOpen,
    setFieldNotePosition,
    setFieldNoteScreenshot,
    setFieldNotes,
    setEditingFieldNote,
    setIsFieldNotesSidebarVisible,
  };
};

export default useFieldNotes;