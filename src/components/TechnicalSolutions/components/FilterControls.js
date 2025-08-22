import React from 'react';
import PropTypes from 'prop-types';
import styles from './FilterControls.module.css';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  sortBy, 
  sortOrder, 
  onSortChange 
}) => {
  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fas fa-sort';
    return sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Ожидают согласования';
      case 'in_progress': return 'В процессе';
      case 'approved': return 'Согласованные';
      case 'rejected': return 'Отклоненные';
      default: return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'foundation': return 'Фундамент';
      case 'structural': return 'Конструкции';
      case 'utilities': return 'Инженерные сети';
      case 'facade': return 'Фасад';
      case 'roofing': return 'Кровля';
      case 'interior': return 'Внутренние работы';
      case 'landscaping': return 'Благоустройство';
      case 'other': return 'Прочее';
      default: return type;
    }
  };

  return (
    <div className={styles.filterControls}>
      <div className={styles.filtersRow}>
        {/* Поиск */}
        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск по названию, описанию, разделу..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={styles.searchInput}
            />
            {filters.search && (
              <button 
                className={styles.clearSearch}
                onClick={() => onFilterChange('search', '')}
                title="Очистить поиск"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Фильтры */}
        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <label>Статус</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают согласования</option>
              <option value="in_progress">В процессе</option>
              <option value="approved">Согласованные</option>
              <option value="rejected">Отклоненные</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label>Приоритет</label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Все приоритеты</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label>Тип</label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Все типы</option>
              <option value="foundation">Фундамент</option>
              <option value="structural">Конструкции</option>
              <option value="utilities">Инженерные сети</option>
              <option value="facade">Фасад</option>
              <option value="roofing">Кровля</option>
              <option value="interior">Внутренние работы</option>
              <option value="landscaping">Благоустройство</option>
              <option value="other">Прочее</option>
            </select>
          </div>
        </div>

        {/* Сортировка */}
        <div className={styles.sortGroup}>
          <label>Сортировка</label>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortBtn} ${sortBy === 'createdAt' ? styles.active : ''}`}
              onClick={() => onSortChange('createdAt')}
              title="Сортировать по дате создания"
            >
              <i className={getSortIcon('createdAt')}></i>
              Дата
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'priority' ? styles.active : ''}`}
              onClick={() => onSortChange('priority')}
              title="Сортировать по приоритету"
            >
              <i className={getSortIcon('priority')}></i>
              Приоритет
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'cost' ? styles.active : ''}`}
              onClick={() => onSortChange('cost')}
              title="Сортировать по стоимости"
            >
              <i className={getSortIcon('cost')}></i>
              Стоимость
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'dueDate' ? styles.active : ''}`}
              onClick={() => onSortChange('dueDate')}
              title="Сортировать по сроку"
            >
              <i className={getSortIcon('dueDate')}></i>
              Срок
            </button>
          </div>
        </div>
      </div>

      {/* Активные фильтры */}
      <div className={styles.activeFilters}>
        {(filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all' || filters.search) && (
          <div className={styles.activeFiltersList}>
            <span className={styles.activeFiltersLabel}>Активные фильтры:</span>
            
            {filters.search && (
              <span className={styles.filterTag}>
                Поиск: "{filters.search}"
                <button onClick={() => onFilterChange('search', '')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className={styles.filterTag}>
                Статус: {getStatusLabel(filters.status)}
                <button onClick={() => onFilterChange('status', 'all')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.priority !== 'all' && (
              <span className={styles.filterTag}>
                Приоритет: {getPriorityLabel(filters.priority)}
                <button onClick={() => onFilterChange('priority', 'all')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.type !== 'all' && (
              <span className={styles.filterTag}>
                Тип: {getTypeLabel(filters.type)}
                <button onClick={() => onFilterChange('type', 'all')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            <button 
              className={styles.clearAllFilters}
              onClick={() => {
                onFilterChange('search', '');
                onFilterChange('status', 'all');
                onFilterChange('priority', 'all');
                onFilterChange('type', 'all');
              }}
            >
              Очистить все
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

FilterControls.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired
};

export default FilterControls;

