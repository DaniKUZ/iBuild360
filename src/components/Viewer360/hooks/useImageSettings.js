import { useState, useCallback } from 'react';

/**
 * Хук для управления настройками изображений в Viewer360
 * 
 * @returns {Object} Объект с функциями и состояниями для работы с настройками изображений
 */
export const useImageSettings = () => {
  // Состояния для настроек изображений
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Обработчик для открытия панели настроек изображения
  const handleImageSettings = useCallback(() => {
    console.log('Настроить изображение - открываем панель настроек');
    setIsSettingsModalOpen(true);
    // Здесь будет логика настройки изображения
  }, []);

  // Обработчик для сброса настроек изображения
  const resetImageSettings = useCallback(() => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  }, []);

  // Обработчик для применения настроек
  const applyImageSettings = useCallback((newSettings) => {
    if (newSettings.brightness !== undefined) {
      setBrightness(newSettings.brightness);
    }
    if (newSettings.contrast !== undefined) {
      setContrast(newSettings.contrast);
    }
    if (newSettings.saturation !== undefined) {
      setSaturation(newSettings.saturation);
    }
  }, []);

  // Обработчик для закрытия модального окна настроек
  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  // Получение CSS фильтров для применения к изображению
  const getImageFilters = useCallback(() => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  }, [brightness, contrast, saturation]);

  return {
    // Состояния
    brightness,
    contrast,
    saturation,
    isSettingsModalOpen,
    
    // Сеттеры для прямого управления
    setBrightness,
    setContrast,
    setSaturation,
    setIsSettingsModalOpen,
    
    // Обработчики
    handleImageSettings,
    resetImageSettings,
    applyImageSettings,
    closeSettingsModal,
    
    // Утилиты
    getImageFilters
  };
};

export default useImageSettings;