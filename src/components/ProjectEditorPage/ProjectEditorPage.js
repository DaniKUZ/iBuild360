import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProjectEditor from '../ProjectEditor';
import ErrorBoundary from '../ErrorBoundary';

const ProjectEditorPage = ({ getProjectById, onSaveProject }) => {
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

  const handleSaveProject = (updatedProject) => {
    console.log('Сохранить изменения проекта:', updatedProject);
    // Вызываем переданную функцию для сохранения проекта
    onSaveProject(updatedProject);
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
          <ProjectEditor 
            project={project}
            onBack={handleBackToProjects}
            onSave={handleSaveProject}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

ProjectEditorPage.propTypes = {
  getProjectById: PropTypes.func.isRequired,
  onSaveProject: PropTypes.func.isRequired,
};

export default ProjectEditorPage; 