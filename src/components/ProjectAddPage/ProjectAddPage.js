import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProjectAdd from '../ProjectAdd';
import TopNavbar from '../TopNavbar';
import ErrorBoundary from '../ErrorBoundary';

const ProjectAddPage = ({ onSaveNewProject }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('project-add');

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleSaveNewProject = (newProject) => {
    console.log('Сохранить новый проект:', newProject);
    // Вызываем переданную функцию для сохранения проекта
    onSaveNewProject(newProject);
    // Возвращаемся к списку проектов
    navigate('/projects');
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'projects') {
      navigate('/projects');
    } else if (tabId === 'project-add') {
      // Остаемся на текущей странице добавления проекта
      setActiveTab('project-add');
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
      <div className="app-content settings-fullwidth">
        <TopNavbar
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onHelpClick={handleHelpClick}
          onUserClick={handleUserClick}
          showProjectSettings={false}
          showProjectAdd={true}
        />
        <ErrorBoundary>
          <ProjectAdd 
            onBack={handleBackToProjects}
            onSave={handleSaveNewProject}
            isSettingsMode={true}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

ProjectAddPage.propTypes = {
  onSaveNewProject: PropTypes.func.isRequired,
};

export default ProjectAddPage; 