import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import LandscapingSection from '../ProjectEditor/sections/LandscapingSection';

const LandscapingPage = ({ projects }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [activeSubItem, setActiveSubItem] = useState('active-projects');
  const [activeTab, setActiveTab] = useState('projects');
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    if (projectId && projects) {
      const project = projects.find(p => p.id === parseInt(projectId));
      setCurrentProject(project);
    }
  }, [projectId, projects]);

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
    if (itemId === 'projects') {
      setActiveSubItem('active-projects');
    }
  };

  const handleSubItemClick = (subItemId) => {
    setActiveSubItem(subItemId);
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'projects') {
      navigate('/projects');
    } else if (tabId === 'landscaping') {
      // Остаёмся на текущей странице
    }
    setActiveTab(tabId);
  };

  const handleHelpClick = () => {
    console.log('Открыть помощь');
  };

  const handleUserClick = () => {
    console.log('Открыть профиль пользователя');
  };

  const handlePlanUpload = (file) => {
    console.log('План загружен:', file);
    // Здесь можно добавить логику сохранения плана
  };

  const handlePhotosUpload = (files) => {
    console.log('Фотографии загружены:', files);
    // Здесь можно добавить логику сохранения фотографий
  };

  if (!currentProject) {
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
            activeTab="landscaping"
            onTabClick={handleTabClick}
            onHelpClick={handleHelpClick}
            onUserClick={handleUserClick}
            showProjectSettings={false}
            showProjectAdd={false}
            showLandscaping={true}
          />
          <main className="app-main">
            <div className="loading">Проект не найден</div>
          </main>
        </div>
      </div>
    );
  }

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
          activeTab="landscaping"
          onTabClick={handleTabClick}
          onHelpClick={handleHelpClick}
          onUserClick={handleUserClick}
          showProjectSettings={false}
          showProjectAdd={false}
          showLandscaping={true}
        />
        
        <main className="app-main">
          <div className="landscaping-page">
            <header className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-seedling"></i>
                  Благоустройство - {currentProject.name}
                </h1>
                <p className="project-address">{currentProject.address}</p>
              </div>
            </header>
            
            <div className="page-content">
              <LandscapingSection
                onPlanUpload={handlePlanUpload}
                onPhotosUpload={handlePhotosUpload}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandscapingPage; 