import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatisticsCards.module.css';

const StatisticsCards = ({ statistics }) => {
  const formatCost = (cost) => {
    if (!cost) return '0 ₽';
    return cost.toLocaleString('ru-RU') + ' ₽';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'in_progress': return 'fas fa-play-circle';
      case 'approved': return 'fas fa-check-circle';
      case 'rejected': return 'fas fa-times-circle';
      default: return 'fas fa-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'fas fa-exclamation-triangle';
      case 'medium': return 'fas fa-minus-circle';
      case 'low': return 'fas fa-info-circle';
      default: return 'fas fa-circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.statisticsCards}>
      {/* Общая статистика */}
      <div className={`${styles.statsCard} ${styles.overviewCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.overview}`}>
            <i className="fas fa-cogs"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>Всего решений</h3>
            <div className={styles.cardValue}>{statistics.total}</div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Общее количество технических решений по проекту
        </div>
      </div>

      {/* Статистика по статусам */}
      <div className={`${styles.statsCard} ${styles.statusCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.status}`}>
            <i className="fas fa-chart-pie"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>По статусам</h3>
            <div className={styles.statusBreakdown}>
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className={styles.statusItem}>
                  <i 
                    className={getStatusIcon(status)}
                    style={{ color: getStatusColor(status) }}
                  ></i>
                  <span className={styles.statusCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Распределение решений по статусам согласования
        </div>
      </div>

      {/* Статистика по приоритетам */}
      <div className={`${styles.statsCard} ${styles.priorityCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.priority}`}>
            <i className="fas fa-flag"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>По приоритетам</h3>
            <div className={styles.priorityBreakdown}>
              {Object.entries(statistics.byPriority).map(([priority, count]) => (
                <div key={priority} className={styles.priorityItem}>
                  <i 
                    className={getPriorityIcon(priority)}
                    style={{ color: getPriorityColor(priority) }}
                  ></i>
                  <span className={styles.priorityCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Распределение решений по уровням приоритета
        </div>
      </div>

      {/* Финансовое влияние */}
      <div className={`${styles.statsCard} ${styles.financialCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.financial}`}>
            <i className="fas fa-ruble-sign"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>Финансовое влияние</h3>
            <div className={`${styles.cardValue} ${styles.impact}`}>
              +{formatCost(statistics.totalCostImpact)}
            </div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Общее увеличение стоимости проекта
        </div>
      </div>

      {/* Влияние на сроки */}
      <div className={`${styles.statsCard} ${styles.scheduleCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.schedule}`}>
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>Влияние на сроки</h3>
            <div className={`${styles.cardValue} ${styles.delay}`}>
              +{statistics.totalScheduleImpact} дн.
            </div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Общая задержка сроков выполнения
        </div>
      </div>

      {/* Эффективность согласования */}
      <div className={`${styles.statsCard} ${styles.efficiencyCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.efficiency}`}>
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <div className={styles.cardInfo}>
            <h3>Эффективность</h3>
            <div className={`${styles.cardValue} ${styles.percentage}`}>
              {Math.round(((statistics.byStatus.approved || 0) / statistics.total) * 100)}%
            </div>
          </div>
        </div>
        <div className={styles.cardDescription}>
          Процент успешно согласованных решений
        </div>
      </div>
    </div>
  );
};

StatisticsCards.propTypes = {
  statistics: PropTypes.object.isRequired
};

export default StatisticsCards;

