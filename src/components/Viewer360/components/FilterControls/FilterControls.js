import React from 'react';
import PropTypes from 'prop-types';
import styles from './FilterControls.module.css';

const FilterControls = ({ onFiltersClick, disabled = false, hasActiveFilters = false }) => {
  return (
    <div className={`${styles.filterControls} ${disabled ? styles.disabled : ''}`}>
      <button
        className={`${styles.filterButton} ${hasActiveFilters ? styles.active : ''}`}
        onClick={onFiltersClick}
        disabled={disabled}
        title="Фильтры"
      >
        <i className="fas fa-filter"></i>
        <span className={styles.filterLabel}>Фильтры</span>
        {hasActiveFilters && (
          <div className={styles.activeIndicator}>
            <i className="fas fa-circle"></i>
          </div>
        )}
      </button>
    </div>
  );
};

FilterControls.propTypes = {
  onFiltersClick: PropTypes.func,
  disabled: PropTypes.bool,
  hasActiveFilters: PropTypes.bool
};

FilterControls.defaultProps = {
  disabled: false,
  hasActiveFilters: false
};

export default FilterControls; 