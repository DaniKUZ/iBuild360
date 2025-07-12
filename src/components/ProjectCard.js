import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

// Компонент ProjectCard экспортируется по умолчанию для tree-shaking

const ProjectCard = React.memo(({ project, onView360, onEditProject }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Черновик':
        return 'status-draft';
      case 'В работе':
        return 'status-in-progress';
      case 'Завершен':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const handleView360Click = useCallback(() => {
    onView360(project.id);
  }, [onView360, project.id]);

  const handleEditClick = useCallback((e) => {
    e.stopPropagation();
    onEditProject(project.id);
  }, [onEditProject, project.id]);

  return (
    <article className="project-card" role="gridcell">
      <div 
        className="project-preview" 
        onClick={handleView360Click}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleView360Click();
          }
        }}
        aria-label={`Открыть просмотр 360 для проекта ${project.name}`}
      >
        <img 
          src={project.preview} 
          alt={`Превью проекта ${project.name}`}
          loading="lazy"
          decoding="async"
        />
        <div className="preview-actions" role="group" aria-label="Действия с проектом">
          <button 
            className="action-btn"
            onClick={handleView360Click}
            aria-label="Просмотр 360"
          >
            <i className="fas fa-eye" aria-hidden="true"></i>
          </button>
          <button 
            className="action-btn"
            onClick={handleEditClick}
            aria-label="Редактировать проект"
          >
            <i className="fas fa-edit" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      
      <div className="project-info">
        <h3 className="project-name">{project.name}</h3>
        <div className="project-details">
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span>{formatDate(project.lastUpdate)}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-user"></i>
            <span>{project.user}</span>
          </div>
          <div className="detail-item">
            <span className={`status ${getStatusClass(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    lastUpdate: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
  }).isRequired,
  onView360: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
};

export default ProjectCard; 