import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ProjectCard.module.css';

// Компонент ProjectCard экспортируется по умолчанию для tree-shaking

const ProjectCard = React.memo(({ project, onView360, onEditProject }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Черновик':
        return styles.statusDraft;
      case 'В работе':
        return styles.statusInProgress;
      case 'Завершен':
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
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
    <article className={styles.projectCard} role="gridcell">
      <div 
        className={styles.projectPreview} 
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
        <div className={styles.previewActions} role="group" aria-label="Действия с проектом">
          <button 
            className="action-btn"
            onClick={handleView360Click}
            title="Просмотр 360"
            aria-label="Просмотр 360"
          >
            <i className="fas fa-eye" aria-hidden="true"></i>
          </button>
          <button 
            className="action-btn"
            onClick={handleEditClick}
            title="Редактировать проект"
            aria-label="Редактировать проект"
          >
            <i className="fas fa-edit" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      
      <div className={styles.projectInfo}>
        <h3 className={styles.projectName}>{project.name}</h3>
        <div className={styles.projectDetails}>
          <div className={styles.detailItem}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{project.address}</span>
          </div>
          <div className={styles.detailItem}>
            <i className="fas fa-calendar"></i>
            <span>{formatDate(project.lastUpdate)}</span>
          </div>
          <div className={styles.detailItem}>
            <i className="fas fa-user"></i>
            <span>{project.user}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={`${styles.status} ${getStatusClass(project.status)}`}>
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
    address: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,
  onView360: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
};

export default ProjectCard; 