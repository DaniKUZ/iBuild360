import React from 'react';
import PropTypes from 'prop-types';
import { 
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getTypeLabel
} from '../../../data/mockTechnicalSolutions';
import styles from './TechnicalSolutionCard.module.css';

const TechnicalSolutionCard = ({ solution, onClick }) => {
  const getApprovalProgress = () => {
    const total = solution.participants.length;
    const approved = solution.participants.filter(p => p.status === 'approved').length;
    return { approved, total, percentage: total > 0 ? Math.round((approved / total) * 100) : 0 };
  };

  const getApprovalStatusColor = () => {
    const { percentage } = getApprovalProgress();
    if (percentage === 100) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatCost = (cost) => {
    if (!cost) return '0 ₽';
    const absValue = Math.abs(cost);
    const formatted = absValue.toLocaleString('ru-RU');
    const sign = cost > 0 ? '+' : cost < 0 ? '-' : '';
    return `${sign}${formatted} ₽`;
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'increase': return `fas fa-arrow-up ${styles.textRed}`;
      case 'decrease': return `fas fa-arrow-down ${styles.textGreen}`;
      default: return `fas fa-minus ${styles.textGray}`;
    }
  };

  const progress = getApprovalProgress();

  return (
    <div className={styles.technicalSolutionCard} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <h3 className={styles.solutionTitle}>{solution.title}</h3>
          <div className={styles.solutionMeta}>
            <span className={styles.solutionSection}>{solution.section}</span>
            <span className={styles.solutionId}>{solution.id}</span>
          </div>
        </div>
        
        <div className={styles.statusIndicators}>
          <span 
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(solution.status) }}
          >
            {getStatusLabel(solution.status)}
          </span>
          <span 
            className={styles.priorityBadge}
            style={{ backgroundColor: getPriorityColor(solution.priority) }}
          >
            {getPriorityLabel(solution.priority)}
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.solutionDescription}>{solution.description}</p>
        
        <div className={styles.solutionType}>
          <i className="fas fa-tag"></i>
          {getTypeLabel(solution.type)}
        </div>

        <div className={styles.solutionDetails}>
          <div className={styles.detailItem}>
            <i className="fas fa-calendar"></i>
            <span>Создано: {new Date(solution.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          
          {solution.dueDate && (
            <div className={styles.detailItem}>
              <i className="fas fa-clock"></i>
              <span>Срок: {new Date(solution.dueDate).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          
          <div className={`${styles.detailItem} ${styles.costItem}`}>
            <i className={getImpactIcon(solution.costImpact)}></i>
            <span>{formatCost(solution.cost)}</span>
          </div>
          
          {solution.scheduleImpact && solution.scheduleImpact > 0 && (
            <div className={styles.detailItem}>
              <i className="fas fa-hourglass-half"></i>
              <span>+{solution.scheduleImpact} дн.</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.approvalProgress}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Согласование</span>
            <span className={styles.progressText}>{progress.approved}/{progress.total}</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${progress.percentage}%`,
                backgroundColor: getApprovalStatusColor()
              }}
            ></div>
          </div>
        </div>

        <div className={styles.participantsAvatars}>
          {solution.participants.slice(0, 3).map((participant, index) => (
            <div 
              key={index}
              className={`${styles.participantAvatar} ${styles[participant.status]}`}
              title={`${participant.name} - ${getStatusLabel(participant.status)}`}
            >
              {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          ))}
          {solution.participants.length > 3 && (
            <div className={styles.moreParticipants}>
              +{solution.participants.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TechnicalSolutionCard.propTypes = {
  solution: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};

export default TechnicalSolutionCard;

