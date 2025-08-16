import { useState } from 'react';

/**
 * Хук для управления UI состояниями компонента Viewer360
 */
const useUIState = () => {
  const [isTimelapsesSectionVisible, setIsTimelapsesSectionVisible] = useState(false);
  const [isDroneShotsSectionVisible, setIsDroneShotsSectionVisible] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isNetworkScheduleVisible, setIsNetworkScheduleVisible] = useState(false);

  // Функция для закрытия всех UI секций
  const closeAllSections = () => {
    setIsTimelapsesSectionVisible(false);
    setIsDroneShotsSectionVisible(false);
    setIsParticipantModalOpen(false);
    setIsNetworkScheduleVisible(false);
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
      case 'network-schedule':
        setIsNetworkScheduleVisible(true);
        break;
    }
  };

  return {
    // Состояния
    isTimelapsesSectionVisible,
    isDroneShotsSectionVisible,
    isParticipantModalOpen,
    isNetworkScheduleVisible,
    
    // Сеттеры
    setIsTimelapsesSectionVisible,
    setIsDroneShotsSectionVisible,
    setIsParticipantModalOpen,
    setIsNetworkScheduleVisible,
    
    // Вспомогательные функции
    closeAllSections,
    openSection
  };
};

export default useUIState;