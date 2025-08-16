import React from 'react';
import PropTypes from 'prop-types';
import styles from './CriticalPath.module.css';

const CriticalPath = ({ phases, criticalPath }) => {
  const criticalPhases = phases.filter(phase => criticalPath.includes(phase.id));
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateTotalFloat = (phase) => {
    // Примерное вычисление резерва времени
    // В реальном проекте это должно вычисляться через алгоритм CPM
    if (phase.status === 'Завершено') return 0;
    if (phase.issues && phase.issues.length > 0) return -3; // отрицательный резерв
    return 0; // критический путь имеет нулевой резерв
  };

  const getPhaseRisk = (phase) => {
    const totalFloat = calculateTotalFloat(phase);
    const progress = phase.progress;
    
    if (totalFloat < 0) return 'critical';
    if (progress < 50 && phase.status === 'В процессе') return 'high';
    if (progress < 80 && phase.status === 'В процессе') return 'medium';
    return 'low';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const totalDuration = criticalPhases.reduce((sum, phase) => sum + phase.duration, 0);
  const completedDuration = criticalPhases.reduce((sum, phase) => {
    return sum + (phase.duration * phase.progress / 100);
  }, 0);
  const overallProgress = (completedDuration / totalDuration) * 100;

  return (
    <div className={styles.criticalPath}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <i className="fas fa-route"></i>
          Критический путь
        </h2>
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{criticalPhases.length}</div>
            <div className={styles.summaryLabel}>Критических фаз</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{totalDuration}</div>
            <div className={styles.summaryLabel}>Общая длительность (дни)</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{Math.round(overallProgress)}%</div>
            <div className={styles.summaryLabel}>Прогресс критпути</div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Critical Path Visualization */}
        <div className={styles.pathVisualization}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-project-diagram"></i>
            Визуализация критического пути
          </h3>
          
          <div className={styles.pathContainer}>
            <div className={styles.pathLine}>
              {criticalPhases.map((phase, index) => {
                const risk = getPhaseRisk(phase);
                const isLast = index === criticalPhases.length - 1;
                
                return (
                  <div key={phase.id} className={styles.pathNode}>
                    <div 
                      className={`${styles.node} ${styles[phase.status.toLowerCase().replace(' ', '')]}`}
                      style={{ borderColor: getRiskColor(risk) }}
                    >
                      <div className={styles.nodeContent}>
                        <div className={styles.nodeTitle}>{phase.name}</div>
                        <div className={styles.nodeProgress}>{phase.progress}%</div>
                        <div className={styles.nodeDuration}>{phase.duration}д</div>
                      </div>
                      
                      <div className={styles.nodeDetails}>
                        <div className={styles.nodeStatus}>
                          <span className={`${styles.statusIndicator} ${styles[phase.status.toLowerCase().replace(' ', '')]}`}>
                            {phase.status}
                          </span>
                        </div>
                        <div className={styles.nodeFloat}>
                          Резерв: {calculateTotalFloat(phase)}д
                        </div>
                      </div>
                    </div>
                    
                    {!isLast && (
                      <div className={styles.connector}>
                        <div className={styles.arrow}>
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Critical Phases Details */}
        <div className={styles.phasesDetails}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-list"></i>
            Детали критических фаз
          </h3>
          
          <div className={styles.phasesGrid}>
            {criticalPhases.map((phase) => {
              const risk = getPhaseRisk(phase);
              const totalFloat = calculateTotalFloat(phase);
              
              return (
                <div key={phase.id} className={`${styles.phaseCard} ${styles[risk]}`}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.phaseName}>{phase.name}</h4>
                    <div className={`${styles.riskBadge} ${styles[risk]}`}>
                      {risk === 'critical' ? 'Критично' :
                       risk === 'high' ? 'Высокий риск' :
                       risk === 'medium' ? 'Средний риск' : 'Низкий риск'}
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <div className={styles.phaseMetrics}>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Период:</span>
                        <span className={styles.metricValue}>
                          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                        </span>
                      </div>
                      
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Длительность:</span>
                        <span className={styles.metricValue}>{phase.duration} дней</span>
                      </div>
                      
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Прогресс:</span>
                        <span className={styles.metricValue}>{phase.progress}%</span>
                      </div>
                      
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Резерв времени:</span>
                        <span className={`${styles.metricValue} ${totalFloat < 0 ? styles.negative : ''}`}>
                          {totalFloat} дней
                        </span>
                      </div>
                      
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Статус:</span>
                        <span className={`${styles.statusBadge} ${styles[phase.status.toLowerCase().replace(' ', '')]}`}>
                          {phase.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${phase.progress}%`,
                          backgroundColor: getRiskColor(risk)
                        }}
                      ></div>
                    </div>
                    
                    {phase.issues && phase.issues.length > 0 && (
                      <div className={styles.issues}>
                        <h5 className={styles.issuesTitle}>
                          <i className="fas fa-exclamation-triangle"></i>
                          Проблемы:
                        </h5>
                        {phase.issues.map((issue, index) => (
                          <div key={index} className={styles.issue}>
                            <div className={styles.issueDescription}>{issue.description}</div>
                            <div className={styles.issueImpact}>Влияние: {issue.impact}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {phase.tasks && (
                      <div className={styles.tasks}>
                        <h5 className={styles.tasksTitle}>Ключевые задачи:</h5>
                        <ul className={styles.tasksList}>
                          {phase.tasks.slice(0, 3).map((task, index) => (
                            <li key={index} className={styles.taskItem}>{task}</li>
                          ))}
                          {phase.tasks.length > 3 && (
                            <li className={styles.taskItem}>
                              и еще {phase.tasks.length - 3} задач...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className={styles.recommendations}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-lightbulb"></i>
            Рекомендации по оптимизации
          </h3>
          
          <div className={styles.recommendationsList}>
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>
                <i className="fas fa-clock"></i>
              </div>
              <div className={styles.recommendationContent}>
                <h4>Контроль сроков</h4>
                <p>Усилить контроль за выполнением фундаментных работ, так как они находятся в критическом пути с отрицательным резервом времени.</p>
              </div>
            </div>
            
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div className={styles.recommendationContent}>
                <h4>Ресурсы</h4>
                <p>Рассмотреть возможность привлечения дополнительных ресурсов для ускорения критических фаз проекта.</p>
              </div>
            </div>
            
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.recommendationContent}>
                <h4>Риск-менеджмент</h4>
                <p>Разработать план действий для минимизации рисков, связанных с поставками материалов и погодными условиями.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CriticalPath.propTypes = {
  phases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired,
      progress: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      criticalPath: PropTypes.bool.isRequired,
      tasks: PropTypes.array,
      issues: PropTypes.array
    })
  ).isRequired,
  criticalPath: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default CriticalPath;

