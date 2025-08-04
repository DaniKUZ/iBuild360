import { useState } from 'react';

/**
 * Хук для управления UI состояниями компонента Viewer360
 */
const useUIState = () => {
  const [isTimelapsesSectionVisible, setIsTimelapsesSectionVisible] = useState(false);
  const [isDroneShotsSectionVisible, setIsDroneShotsSectionVisible] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);

  // Функция для закрытия всех UI секций
  const closeAllSections = () => {
    setIsTimelapsesSectionVisible(false);
    setIsDroneShotsSectionVisible(false);
    setIsParticipantModalOpen(false);
  };

  // Функция для открытия конкретной секции (закрывает остальные)
  const openSection = (sectionType) => {
    closeAllSections();
    
    switch (sectionType) {
      case 'timelapses':
        setIsTimelapsesSectionVisible(true);
        break;
      case 'drone-shots':
        setIsDroneShotsSectionVisible(true);
        break;
      case 'participants':
        setIsParticipantModalOpen(true);
        break;
    }
  };

  return {
    // Состояния
    isTimelapsesSectionVisible,
    isDroneShotsSectionVisible,
    isParticipantModalOpen,
    
    // Сеттеры
    setIsTimelapsesSectionVisible,
    setIsDroneShotsSectionVisible,
    setIsParticipantModalOpen,
    
    // Вспомогательные функции
    closeAllSections,
    openSection
  };
};

export default useUIState;