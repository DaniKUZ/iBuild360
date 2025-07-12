import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Sidebar = React.memo(({ activeItem, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Главное меню' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Настройки' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Помощь' }
  ];

  return (
    <nav className="sidebar" role="navigation" aria-label="Основное меню">
      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            aria-label={item.label}
            aria-current={activeItem === item.id ? 'page' : undefined}
          >
            <i className={item.icon} aria-hidden="true"></i>
            {hoveredItem === item.id && (
              <div className="tooltip" role="tooltip">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
});

Sidebar.propTypes = {
  activeItem: PropTypes.string.isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default Sidebar; 