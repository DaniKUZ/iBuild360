import React from 'react';
import PropTypes from 'prop-types';

function NavigationTabs({ sections, activeSection, onSectionClick }) {
  return (
    <div className="editor-navigation">
      {sections.map(section => (
        <button
          key={section.id}
          className={`nav-item ${activeSection === section.id ? 'active' : ''} ${!section.active ? 'disabled' : ''}`}
          onClick={() => onSectionClick(section.id)}
          disabled={!section.active}
        >
          <i className={section.icon}></i>
          <span>{section.title}</span>
        </button>
      ))}
    </div>
  );
}

NavigationTabs.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired
  })).isRequired,
  activeSection: PropTypes.string.isRequired,
  onSectionClick: PropTypes.func.isRequired
};

export default NavigationTabs; 