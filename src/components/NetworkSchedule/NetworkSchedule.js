import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MOCK_NETWORK_SCHEDULE, getProjectStatus, getCriticalPathPhases, getScheduleInsights } from '../../data/mockNetworkSchedule';
import GanttChart from './components/GanttChart';
import MilestonesList from './components/MilestonesList';
import CriticalPath from './components/CriticalPath';
import ProjectOverview from './components/ProjectOverview';
import styles from './NetworkSchedule.module.css';

const NetworkSchedule = ({ activeSubItem = 'current-schedule' }) => {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const projectStatus = getProjectStatus();
  const criticalPhases = getCriticalPathPhases();
  const insights = getScheduleInsights();

  const renderContent = () => {
    switch (activeSubItem) {
      case 'current-schedule':
        return (
          <div className={styles.scheduleContent}>
            <ProjectOverview 
              project={MOCK_NETWORK_SCHEDULE.project}
              status={projectStatus}
              insights={insights}
            />
            <GanttChart 
              phases={MOCK_NETWORK_SCHEDULE.phases}
              selectedPhase={selectedPhase}
              onPhaseSelect={setSelectedPhase}
            />
          </div>
        );
      
      case 'critical-path':
        return (
          <CriticalPath 
            phases={criticalPhases}
            criticalPath={MOCK_NETWORK_SCHEDULE.criticalPath}
          />
        );
      
      case 'milestones':
        return (
          <MilestonesList 
            milestones={MOCK_NETWORK_SCHEDULE.milestones}
            phases={MOCK_NETWORK_SCHEDULE.phases}
          />
        );
      
      default:
        return (
          <div className={styles.scheduleContent}>
            <ProjectOverview 
              project={MOCK_NETWORK_SCHEDULE.project}
              status={projectStatus}
              insights={insights}
            />
          </div>
        );
    }
  };

  return (
    <div className={styles.networkSchedule}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="fas fa-project-diagram"></i>
            Сетевой план строительства
          </h1>
          <div className={styles.projectInfo}>
            <span className={styles.projectName}>{MOCK_NETWORK_SCHEDULE.project.name}</span>
            <span className={styles.projectId}>ID: {MOCK_NETWORK_SCHEDULE.project.id}</span>
          </div>
        </div>
        
        <div className={styles.statusIndicators}>
          <div className={`${styles.statusBadge} ${styles[insights.overallHealth]}`}>
            <i className={insights.overallHealth === 'good' ? 'fas fa-check-circle' : 
                       insights.overallHealth === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-times-circle'}></i>
            {insights.overallHealth === 'good' ? 'В срок' : 
             insights.overallHealth === 'warning' ? 'Отставание' : 'Критично'}
          </div>
          
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>Прогресс</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${projectStatus.overallProgress}%` }}
              ></div>
            </div>
            <span className={styles.progressPercent}>{projectStatus.overallProgress}%</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>

      {selectedPhase && (
        <div className={styles.phaseDetails}>
          <div className={styles.phaseDetailsHeader}>
            <h3>{selectedPhase.name}</h3>
            <button 
              className={styles.closeDetails}
              onClick={() => setSelectedPhase(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className={styles.phaseDetailsContent}>
            <div className={styles.phaseInfo}>
              <div className={styles.phaseInfoItem}>
                <span className={styles.label}>Статус:</span>
                <span className={`${styles.status} ${styles[selectedPhase.status.toLowerCase().replace(' ', '')]}`}>
                  {selectedPhase.status}
                </span>
              </div>
              
              <div className={styles.phaseInfoItem}>
                <span className={styles.label}>Прогресс:</span>
                <span className={styles.progress}>{selectedPhase.progress}%</span>
              </div>
              
              <div className={styles.phaseInfoItem}>
                <span className={styles.label}>Длительность:</span>
                <span>{selectedPhase.duration} дней</span>
              </div>
              
              {selectedPhase.criticalPath && (
                <div className={styles.criticalPathBadge}>
                  <i className="fas fa-exclamation-triangle"></i>
                  Критический путь
                </div>
              )}
            </div>
            
            {selectedPhase.tasks && (
              <div className={styles.tasksSection}>
                <h4>Задачи:</h4>
                <ul className={styles.tasksList}>
                  {selectedPhase.tasks.map((task, index) => (
                    <li key={index} className={styles.taskItem}>{task}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedPhase.issues && selectedPhase.issues.length > 0 && (
              <div className={styles.issuesSection}>
                <h4>Проблемы:</h4>
                {selectedPhase.issues.map((issue, index) => (
                  <div key={index} className={styles.issueItem}>
                    <div className={styles.issueType}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {issue.type === 'delay' ? 'Задержка' : 'Проблема'}
                    </div>
                    <div className={styles.issueDescription}>{issue.description}</div>
                    {issue.impact && (
                      <div className={styles.issueImpact}>
                        <strong>Влияние:</strong> {issue.impact}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

NetworkSchedule.propTypes = {
  activeSubItem: PropTypes.string
};

export default NetworkSchedule;

