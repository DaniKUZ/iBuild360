import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import WorkerStats from '../WorkerStats';

const WorkerStatsPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [activeSubItem, setActiveSubItem] = useState('active-projects');

  const handleTabClick = (tabId) => {
    if (tabId === 'projects') {
      navigate('/projects');
    } else if (tabId === 'worker-stats') {
      // Остаемся на текущей странице
    }
  };

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
    if (itemId === 'projects') {
      setActiveSubItem('active-projects');
    }
  };

  const handleSubItemClick = (subItemId) => {
    setActiveSubItem(subItemId);
    if (subItemId === 'active-projects' || subItemId === 'closed-projects') {
      navigate('/projects');
    }
  };

  const handleHelpClick = () => {
    console.log('Открыть помощь');
  };

  const handleUserClick = () => {
    console.log('Открыть профиль пользователя');
  };

  return (
    <div className="app">
      <Sidebar 
        activeItem={activeMenuItem} 
        activeSubItem={activeSubItem}
        onItemClick={handleMenuItemClick}
        onSubItemClick={handleSubItemClick}
      />
      <div className="app-content">
        <TopNavbar
          activeTab="worker-stats"
          onTabClick={handleTabClick}
          onHelpClick={handleHelpClick}
          onUserClick={handleUserClick}
          showProjectSettings={false}
          showProjectAdd={false}
          showWorkerStats={true}
        />
        
        <main className="app-main" role="main">
          <WorkerStats />
        </main>
      </div>
    </div>
  );
};

export default WorkerStatsPage; 