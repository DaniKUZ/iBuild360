import React, { useState } from 'react';

const Sidebar = ({ activeItem, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Главное меню' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Настройки' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Помощь' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <i className={item.icon}></i>
            {hoveredItem === item.id && (
              <div className="tooltip">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 