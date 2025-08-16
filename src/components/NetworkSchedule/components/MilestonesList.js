import React from 'react';
import PropTypes from 'prop-types';
import styles from './MilestonesList.module.css';

const MilestonesList = ({ milestones, phases }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilMilestone = (dateString) => {
    const milestoneDate = new Date(dateString);
    const today = new Date();
    const diffTime = milestoneDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMilestoneStatus = (milestone) => {
    if (milestone.achieved) {
      return 'achieved';
    }
    
    const daysUntil = getDaysUntilMilestone(milestone.date);
    
    if (daysUntil < 0) {
      return 'overdue';
    } else if (daysUntil <= 7) {
      return 'urgent';
    } else if (daysUntil <= 30) {
      return 'upcoming';
    } else {
      return 'future';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'achieved':
        return 'fas fa-check-circle';
      case 'overdue':
        return 'fas fa-times-circle';
      case 'urgent':
        return 'fas fa-exclamation-triangle';
      case 'upcoming':
        return 'fas fa-clock';
      case 'future':
        return 'fas fa-calendar';
      default:
        return 'fas fa-flag';
    }
  };

  const getStatusText = (milestone) => {
    const status = getMilestoneStatus(milestone);
    const daysUntil = getDaysUntilMilestone(milestone.date);
    
    if (milestone.achieved) {
      return 'Достигнуто';
    }
    
    if (daysUntil < 0) {
      return `Просрочено на ${Math.abs(daysUntil)} дн.`;
    } else if (daysUntil === 0) {
      return 'Сегодня';
    } else if (daysUntil === 1) {
      return 'Завтра';
    } else if (daysUntil <= 7) {
      return `Через ${daysUntil} дн.`;
    } else {
      return `Через ${daysUntil} дн.`;
    }
  };

  const upcomingMilestones = milestones.filter(m => !m.achieved);
  const achievedMilestones = milestones.filter(m => m.achieved);

  return (
    <div className={styles.milestonesList}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <i className="fas fa-flag"></i>
          Вехи проекта
        </h2>
        <div className={styles.summary}>
          <span className={styles.summaryItem}>
            <strong>{achievedMilestones.length}</strong> достигнуто
          </span>
          <span className={styles.summaryItem}>
            <strong>{upcomingMilestones.length}</strong> предстоит
          </span>
        </div>
      </div>

      {/* Предстоящие вехи */}
      {upcomingMilestones.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-arrow-right"></i>
            Предстоящие вехи
          </h3>
          
          <div className={styles.milestonesGrid}>
            {upcomingMilestones.map((milestone) => {
              const status = getMilestoneStatus(milestone);
              const statusIcon = getStatusIcon(status);
              
              return (
                <div key={milestone.id} className={`${styles.milestoneCard} ${styles[status]}`}>
                  <div className={styles.milestoneHeader}>
                    <div className={styles.milestoneIcon}>
                      <i className={statusIcon}></i>
                    </div>
                    <div className={styles.milestoneInfo}>
                      <h4 className={styles.milestoneName}>{milestone.name}</h4>
                      <div className={styles.milestoneDate}>
                        {formatDate(milestone.date)}
                      </div>
                    </div>
                    <div className={styles.milestoneStatus}>
                      <span className={`${styles.statusBadge} ${styles[status]}`}>
                        {getStatusText(milestone)}
                      </span>
                    </div>
                  </div>
                  
                  {milestone.risk && (
                    <div className={`${styles.riskAlert} ${styles[milestone.risk]}`}>
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>Риск срыва: {milestone.risk === 'high' ? 'Высокий' : 'Средний'}</span>
                    </div>
                  )}
                  
                  <div className={styles.milestoneProgress}>
                    <div className={styles.progressLabel}>
                      Готовность к вехе
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${milestone.achieved ? 100 : Math.min(75, Math.max(0, 100 - getDaysUntilMilestone(milestone.date) * 2))}%` }}
                      ></div>
                    </div>
                    <div className={styles.progressPercent}>
                      {milestone.achieved ? 100 : Math.min(75, Math.max(0, 100 - getDaysUntilMilestone(milestone.date) * 2))}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Достигнутые вехи */}
      {achievedMilestones.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-check"></i>
            Достигнутые вехи
          </h3>
          
          <div className={styles.achievedMilestones}>
            {achievedMilestones.map((milestone) => (
              <div key={milestone.id} className={`${styles.milestoneCard} ${styles.achieved}`}>
                <div className={styles.milestoneHeader}>
                  <div className={styles.milestoneIcon}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className={styles.milestoneInfo}>
                    <h4 className={styles.milestoneName}>{milestone.name}</h4>
                    <div className={styles.milestoneDate}>
                      {formatDate(milestone.date)}
                    </div>
                  </div>
                  <div className={styles.milestoneStatus}>
                    <span className={`${styles.statusBadge} ${styles.achieved}`}>
                      Достигнуто
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-timeline"></i>
          Временная линия
        </h3>
        
        <div className={styles.timeline}>
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className={`${styles.timelineItem} ${styles[getMilestoneStatus(milestone)]}`}>
              <div className={styles.timelineMarker}>
                <i className={getStatusIcon(getMilestoneStatus(milestone))}></i>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h5 className={styles.timelineName}>{milestone.name}</h5>
                  <span className={styles.timelineDate}>{formatDate(milestone.date)}</span>
                </div>
                <div className={styles.timelineStatus}>
                  {getStatusText(milestone)}
                </div>
              </div>
              {index < milestones.length - 1 && <div className={styles.timelineConnector}></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

MilestonesList.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      achieved: PropTypes.bool.isRequired,
      risk: PropTypes.string
    })
  ).isRequired,
  phases: PropTypes.array.isRequired
};

export default MilestonesList;

