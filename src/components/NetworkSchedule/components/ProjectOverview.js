import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProjectOverview.module.css';

const ProjectOverview = ({ project, status, insights }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={styles.projectOverview}>
      <div className={styles.overviewHeader}>
        <h2 className={styles.title}>Обзор проекта</h2>
        <div className={styles.updateTime}>
          Обновлено: {new Date().toLocaleString('ru-RU')}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {/* Project Timeline */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-calendar-alt"></i>
            <h3>График проекта</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.timelineInfo}>
              <div className={styles.timelineItem}>
                <span className={styles.label}>Начало:</span>
                <span className={styles.value}>{formatDate(project.startDate)}</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.label}>Окончание:</span>
                <span className={styles.value}>{formatDate(project.endDate)}</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.label}>Прошло дней:</span>
                <span className={styles.value}>{project.completedDays} из {project.totalDuration}</span>
              </div>
            </div>
            
            {status.schedule.delay > 0 && (
              <div className={styles.delayWarning}>
                <i className="fas fa-exclamation-triangle"></i>
                Отставание: {status.schedule.delay} {status.schedule.delayUnit}
              </div>
            )}
          </div>
        </div>

        {/* Budget Information */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-ruble-sign"></i>
            <h3>Бюджет</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.budgetInfo}>
              <div className={styles.budgetItem}>
                <span className={styles.label}>Запланировано:</span>
                <span className={styles.value}>{formatCurrency(status.budget.planned)}</span>
              </div>
              <div className={styles.budgetItem}>
                <span className={styles.label}>Потрачено:</span>
                <span className={styles.value}>{formatCurrency(status.budget.spent)}</span>
              </div>
              <div className={styles.budgetItem}>
                <span className={styles.label}>Остаток:</span>
                <span className={styles.value}>{formatCurrency(status.budget.remaining)}</span>
              </div>
            </div>
            
            <div className={styles.budgetProgress}>
              <div className={styles.progressLabel}>
                Освоение бюджета: {status.budget.utilizationPercent}%
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${status.budget.utilizationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-users"></i>
            <h3>Ресурсы</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.resourceSummary}>
              <div className={styles.resourceItem}>
                <span className={styles.label}>Всего рабочих:</span>
                <span className={styles.value}>45</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.label}>Активных:</span>
                <span className={styles.value}>38</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.label}>Оборудование:</span>
                <span className={styles.value}>4 единицы</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-info-circle"></i>
            <h3>Текущий статус</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statusText}>
              {status.summary}
            </div>
            
            <div className={styles.healthIndicator}>
              <span className={styles.healthLabel}>Состояние проекта:</span>
              <div className={`${styles.healthBadge} ${styles[insights.overallHealth]}`}>
                <i className={insights.overallHealth === 'good' ? 'fas fa-check-circle' : 
                           insights.overallHealth === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-times-circle'}></i>
                {insights.overallHealth === 'good' ? 'Хорошо' : 
                 insights.overallHealth === 'warning' ? 'Требует внимания' : 'Критично'}
              </div>
            </div>
          </div>
        </div>

        {/* Risks */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Риски</h3>
          </div>
          <div className={styles.cardContent}>
            {status.risks.length > 0 ? (
              <div className={styles.risksList}>
                {status.risks.map((risk, index) => (
                  <div key={index} className={`${styles.riskItem} ${styles[risk.level]}`}>
                    <div className={styles.riskLevel}>
                      {risk.level === 'high' ? 'Высокий' : 
                       risk.level === 'medium' ? 'Средний' : 'Низкий'}
                    </div>
                    <div className={styles.riskDescription}>
                      {risk.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noRisks}>
                <i className="fas fa-shield-alt"></i>
                Активных рисков не выявлено
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <i className="fas fa-chart-line"></i>
            <h3>Ключевые метрики</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.keyMetrics}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{status.overallProgress}%</div>
                <div className={styles.metricLabel}>Общий прогресс</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {insights.criticalPathRisk === 'high' ? 'Есть' : 'Нет'}
                </div>
                <div className={styles.metricLabel}>Риск критпути</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>84%</div>
                <div className={styles.metricLabel}>Загрузка ресурсов</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProjectOverview.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    totalDuration: PropTypes.number.isRequired,
    completedDays: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  status: PropTypes.shape({
    summary: PropTypes.string.isRequired,
    overallProgress: PropTypes.number.isRequired,
    schedule: PropTypes.shape({
      status: PropTypes.string.isRequired,
      delay: PropTypes.number.isRequired,
      delayUnit: PropTypes.string.isRequired
    }).isRequired,
    budget: PropTypes.shape({
      planned: PropTypes.number.isRequired,
      spent: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
      utilizationPercent: PropTypes.number.isRequired
    }).isRequired,
    risks: PropTypes.array.isRequired
  }).isRequired,
  insights: PropTypes.shape({
    overallHealth: PropTypes.string.isRequired,
    criticalPathRisk: PropTypes.string.isRequired,
    resourceUtilization: PropTypes.number.isRequired
  }).isRequired
};

export default ProjectOverview;

