import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Sidebar.module.css';

const Sidebar = React.memo(({ activeItem, onItemClick, onSubItemClick, activeSubItem }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { 
      id: 'projects', 
      icon: 'fas fa-folder', 
      label: 'Проекты',
      subItems: [
        { id: 'active-projects', icon: 'fas fa-play-circle', label: 'Активные проекты', count: 2 },
        { id: 'closed-projects', icon: 'fas fa-check-circle', label: 'Завершенные проекты', count: 1 }
      ]
    },
    {
      id: 'lab',
      icon: 'fas fa-vials',
      label: 'Лаборатория',
      subItems: [
        { id: 'lab-protocols', icon: 'fas fa-clipboard-list', label: 'Протоколы', count: null },
        { id: 'lab-active', icon: 'fas fa-play-circle', label: 'Активные испытания', count: null },
        { id: 'lab-history', icon: 'fas fa-history', label: 'История', count: null },
      ],
    },
    { 
      id: 'network-schedule', 
      icon: 'fas fa-project-diagram', 
      label: 'Сетевой план',
      subItems: [
        { id: 'current-schedule', icon: 'fas fa-calendar-check', label: 'Текущий план', count: null },
        { id: 'critical-path', icon: 'fas fa-route', label: 'Критический путь', count: null },
        { id: 'milestones', icon: 'fas fa-flag', label: 'Вехи проекта', count: null }
      ]
    },
    { 
      id: 'shared', 
      icon: 'fas fa-share', 
      label: 'Поделились со мной',
      subItems: []
    },
    { 
      id: 'admin', 
      icon: 'fas fa-users-cog', 
      label: 'Администратор',
      subItems: [
        { id: 'team-management', icon: 'fas fa-users', label: 'Управление командой', count: null },
        { id: 'reports', icon: 'fas fa-chart-bar', label: 'Отчеты', count: null }
      ]
    }
  ];

  const handleItemClick = (itemId) => {
    onItemClick(itemId);
  };

  const handleSubItemClick = (subItemId) => {
    if (onSubItemClick) {
      onSubItemClick(subItemId);
    }
  };

  const getActiveSubItems = () => {
    const activeMenuItem = menuItems.find(item => item.id === activeItem);
    return activeMenuItem ? activeMenuItem.subItems : [];
  };

  return (
    <nav 
      className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`} 
      role="navigation" 
      aria-label="Основное меню"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={styles.sidebarNav}>
        {/* Основные разделы */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${activeItem === item.id ? styles.active : ''}`}
            onClick={() => handleItemClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            aria-label={item.label}
            aria-current={activeItem === item.id ? 'page' : undefined}
          >
            <i className={item.icon} aria-hidden="true"></i>
            {isExpanded && (
              <span className={styles.itemLabel}>{item.label}</span>
            )}
            {!isExpanded && hoveredItem === item.id && (
              <div className={styles.tooltip} role="tooltip">
                {item.label}
              </div>
            )}
          </button>
        ))}
        
        {/* Разделитель */}
        <div className={styles.divider}></div>
        
        {/* Подменю */}
        {getActiveSubItems().map((subItem) => (
          <button
            key={subItem.id}
            className={`${styles.sidebarSubItem} ${activeSubItem === subItem.id ? styles.active : ''}`}
            onClick={() => handleSubItemClick(subItem.id)}
            aria-label={subItem.label}
          >
            <div className={styles.subItemContent}>
              <i className={subItem.icon} aria-hidden="true"></i>
              {isExpanded && (
                <span className={styles.subItemLabel}>
                  {subItem.label}
                  {subItem.count !== null && (
                    <span className={styles.count}>({subItem.count})</span>
                  )}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
});

Sidebar.propTypes = {
  activeItem: PropTypes.string.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onSubItemClick: PropTypes.func,
  activeSubItem: PropTypes.string,
};

export default Sidebar; 