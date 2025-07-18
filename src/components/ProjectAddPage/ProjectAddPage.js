import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProjectAdd from '../ProjectAdd';
import ErrorBoundary from '../ErrorBoundary';

const ProjectAddPage = ({ onSaveNewProject }) => {
  const navigate = useNavigate();

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

  return (
    <div className="app">
      <div className="app-content editor-fullscreen">
        <ErrorBoundary>
          <ProjectAdd 
            onBack={handleBackToProjects}
            onSave={handleSaveNewProject}
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