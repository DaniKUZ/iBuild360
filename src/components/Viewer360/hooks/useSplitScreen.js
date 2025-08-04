import { useState } from 'react';

/**
 * Хук для управления режимом разделения экрана
 */
const useSplitScreen = () => {
  // Состояния для режима разделения экрана
  const [isSplitScreenMode, setIsSplitScreenMode] = useState(false);
  const [leftPanelImage, setLeftPanelImage] = useState(null);
  const [rightPanelImage, setRightPanelImage] = useState(null);
  const [leftPanelDate, setLeftPanelDate] = useState(new Date(2025, 6, 24)); // current
  const [rightPanelDate, setRightPanelDate] = useState(new Date(2025, 6, 12)); // past

  // Функции для управления режимом разделения экрана
  const toggleSplitScreenMode = () => {
    setIsSplitScreenMode(prev => !prev);
  };

  const enableSplitScreenMode = () => {
    setIsSplitScreenMode(true);
  };

  const disableSplitScreenMode = () => {
    setIsSplitScreenMode(false);
  };

  const updateLeftPanel = (image, date) => {
    setLeftPanelImage(image);
    if (date) setLeftPanelDate(date);
  };

  const updateRightPanel = (image, date) => {
    setRightPanelImage(image);
    if (date) setRightPanelDate(date);
  };

  const swapPanels = () => {
    const tempImage = leftPanelImage;
    const tempDate = leftPanelDate;
    
    setLeftPanelImage(rightPanelImage);
    setLeftPanelDate(rightPanelDate);
    setRightPanelImage(tempImage);
    setRightPanelDate(tempDate);
  };

  const resetPanels = () => {
    setLeftPanelImage(null);
    setRightPanelImage(null);
    setLeftPanelDate(new Date(2025, 6, 24));
    setRightPanelDate(new Date(2025, 6, 12));
  };

  // Проверка готовности для сравнения
  const isReadyForComparison = () => {
    return leftPanelImage && rightPanelImage && 
           leftPanelDate.getTime() !== rightPanelDate.getTime();
  };

  return {
    // Состояния
    isSplitScreenMode,
    leftPanelImage,
    rightPanelImage,
    leftPanelDate,
    rightPanelDate,
    
    // Функции
    toggleSplitScreenMode,
    enableSplitScreenMode,
    disableSplitScreenMode,
    updateLeftPanel,
    updateRightPanel,
    swapPanels,
    resetPanels,
    isReadyForComparison,
    
    // Сеттеры для прямого управления
    setIsSplitScreenMode,
    setLeftPanelImage,
    setRightPanelImage,
    setLeftPanelDate,
    setRightPanelDate,
  };
};

export default useSplitScreen;