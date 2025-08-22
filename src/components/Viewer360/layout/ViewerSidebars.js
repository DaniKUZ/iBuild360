import React from 'react';
import PropTypes from 'prop-types';
import ViewerSidebar from '../components/ViewerSidebar';
import AIComparisonSidebar from '../components/AIComparisonSidebar';
import TimelapsesSection from '../components/TimelapsesSection';
import DroneShotsSection from '../components/DroneShotsSection';
import NetworkScheduleSidebar from '../../NetworkSchedule/NetworkScheduleSidebar';


/**
 * Компонент для группировки всех сайдбаров Viewer360
 */
const ViewerSidebars = ({
  // ViewerSidebar props
  isFieldNotesSidebarVisible,
  fieldNotes,
  onFieldNoteClick,
  onCloseFieldNotesSidebar,
  
  // AIComparisonSidebar props
  isAIComparisonSidebarVisible,
  aiComparisonImages,
  onCloseAIComparison,
  onAnalyzeImages,
  aiAnalysisResult,
  isAIAnalyzing,
  
  // TimelapsesSection props
  isTimelapsesSectionVisible,
  onCreateVideo,
  onCloseTimelapsesSection,
  
  // DroneShotsSection props
  isDroneShotsSectionVisible,
  onCloseDroneShotsSection,
  onDroneFilesUpload,
  
  // NetworkScheduleSidebar props
  isNetworkScheduleSidebarVisible,
  

}) => {
  return (
    <>
      {/* Сайдбар полевых заметок */}
      <ViewerSidebar
        isVisible={isFieldNotesSidebarVisible}
        fieldNotes={fieldNotes}
        onFieldNoteClick={onFieldNoteClick}
        onClose={onCloseFieldNotesSidebar}
      />
      
      {/* Сайдбар AI сравнения */}
      <AIComparisonSidebar
        isVisible={isAIComparisonSidebarVisible}
        comparisonImages={aiComparisonImages}
        onClose={onCloseAIComparison}
        onAnalyze={onAnalyzeImages}
        analysisResult={aiAnalysisResult}
        isAnalyzing={isAIAnalyzing}
      />
      
      {/* Раздел таймлапсов */}
      {isTimelapsesSectionVisible && (
        <TimelapsesSection
          onCreateVideo={onCreateVideo}
          onClose={onCloseTimelapsesSection}
        />
      )}
      
      {/* Раздел съемки с дронов */}
      {isDroneShotsSectionVisible && (
        <DroneShotsSection
          onClose={onCloseDroneShotsSection}
          onUpload={onDroneFilesUpload}
        />
      )}
      
      {/* Сайдбар сетевого плана */}
      {isNetworkScheduleSidebarVisible && (
        <NetworkScheduleSidebar />
      )}
      

    </>
  );
};

ViewerSidebars.propTypes = {
  // ViewerSidebar props
  isFieldNotesSidebarVisible: PropTypes.bool.isRequired,
  fieldNotes: PropTypes.array.isRequired,
  onFieldNoteClick: PropTypes.func.isRequired,
  onCloseFieldNotesSidebar: PropTypes.func.isRequired,
  
  // AIComparisonSidebar props
  isAIComparisonSidebarVisible: PropTypes.bool.isRequired,
  aiComparisonImages: PropTypes.array.isRequired,
  onCloseAIComparison: PropTypes.func.isRequired,
  onAnalyzeImages: PropTypes.func.isRequired,
  aiAnalysisResult: PropTypes.string,
  isAIAnalyzing: PropTypes.bool.isRequired,
  
  // TimelapsesSection props
  isTimelapsesSectionVisible: PropTypes.bool.isRequired,
  onCreateVideo: PropTypes.func.isRequired,
  onCloseTimelapsesSection: PropTypes.func.isRequired,
  
  // DroneShotsSection props
  isDroneShotsSectionVisible: PropTypes.bool.isRequired,
  onCloseDroneShotsSection: PropTypes.func.isRequired,
  onDroneFilesUpload: PropTypes.func.isRequired,
  
  // NetworkScheduleSidebar props
  isNetworkScheduleSidebarVisible: PropTypes.bool.isRequired,
  

};

export default ViewerSidebars;