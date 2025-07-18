import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Viewer360 from '../Viewer360';
import ErrorBoundary from '../ErrorBoundary';

const Viewer360Page = ({ getProjectById }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Находим проект по ID
    const foundProject = getProjectById(projectId);
    if (foundProject) {
      setProject(foundProject);
    } else {
      // Если проект не найден, перенаправляем на страницу проектов
      navigate('/projects');
    }
  }, [projectId, navigate, getProjectById]);

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (!project) {
    return (
      <div className="loading-container">
        <div className="loading" role="status" aria-live="polite">
          Загрузка проекта...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-content editor-fullscreen">
        <ErrorBoundary>
          <Viewer360 
            project={project}
            onBack={handleBackToProjects}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

Viewer360Page.propTypes = {
  getProjectById: PropTypes.func.isRequired,
};

export default Viewer360Page; 