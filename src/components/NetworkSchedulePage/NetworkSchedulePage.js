import React from 'react';
import PropTypes from 'prop-types';
import TopNavbar from '../TopNavbar/TopNavbar';
import Sidebar from '../Sidebar/Sidebar';
import NetworkSchedule from '../NetworkSchedule/NetworkSchedule';
import styles from './NetworkSchedulePage.module.css';

const NetworkSchedulePage = ({ 
  activeItem, 
  activeSubItem, 
  onItemClick, 
  onSubItemClick, 
  onBack 
}) => {
  return (
    <div className={styles.networkSchedulePage}>
      <TopNavbar />
      
      <div className={styles.mainContent}>
        <Sidebar
          activeItem={activeItem}
          activeSubItem={activeSubItem}
          onItemClick={onItemClick}
          onSubItemClick={onSubItemClick}
        />
        
        <main className={styles.contentArea}>
          <NetworkSchedule activeSubItem={activeSubItem} />
        </main>
      </div>
    </div>
  );
};

NetworkSchedulePage.propTypes = {
  activeItem: PropTypes.string.isRequired,
  activeSubItem: PropTypes.string,
  onItemClick: PropTypes.func.isRequired,
  onSubItemClick: PropTypes.func,
  onBack: PropTypes.func.isRequired
};

export default NetworkSchedulePage;

