import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProjectEditor from '../ProjectEditor';
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import ErrorBoundary from '../ErrorBoundary';

const ProjectEditorPage = ({ getProjectById, onSaveProject }) => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');

  // Проверяем режим работы
  const mode = searchParams.get('mode'); // 'settings' или null
  const isSettingsMode = mode === 'settings';

  useEffect(() => {
    // Находим проект по ID
    const foundProject = getProjectById(projectId);
    if (foundProject) {
      setProject(foundProject);
      // В режиме настроек активируем вкладку "Настройки проекта"
      if (isSettingsMode) {
        setActiveTab('project-settings');
      }
    } else {
      // Если проект не найден, перенаправляем на страницу проектов
      navigate('/projects');
    }
  }, [projectId, navigate, getProjectById, isSettingsMode]);

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleSaveProject = (updatedProject) => {
    console.log('Сохранить изменения проекта:', updatedProject);
    // Вызываем переданную функцию для сохранения проекта
    onSaveProject(updatedProject);
    navigate('/projects');
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'projects') {
      // При клике на "Проекты" всегда возвращаемся к списку проектов
      navigate('/projects');
    } else if (tabId === 'project-settings') {
      // При клике на "Настройки проекта" остаемся в текущем режиме настроек
      setActiveTab('project-settings');
    }
  };

  const handleHelpClick = () => {
    console.log('Открыть помощь');
  };

  const handleUserClick = () => {
    console.log('Открыть профиль пользователя');
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

  // В режиме настроек показываем только с топбаром (без сайдбара)
  if (isSettingsMode) {
    return (
      <div className="app">
        <div className="app-content settings-fullwidth">
          <TopNavbar
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onHelpClick={handleHelpClick}
            onUserClick={handleUserClick}
            showProjectSettings={true}
            showProjectAdd={false}
          />
          <ErrorBoundary>
            <ProjectEditor 
              project={project}
              onBack={handleBackToProjects}
              onSave={handleSaveProject}
              isSettingsMode={true}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Обычный режим - полноэкранный
  return (
    <div className="app">
      <div className="app-content editor-fullscreen">
        <ErrorBoundary>
          <ProjectEditor 
            project={project}
            onBack={handleBackToProjects}
            onSave={handleSaveProject}
            isSettingsMode={false}
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