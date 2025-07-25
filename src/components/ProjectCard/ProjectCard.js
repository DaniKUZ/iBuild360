import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ProjectCard.module.css';

// Компонент ProjectCard экспортируется по умолчанию для tree-shaking

const ProjectCard = React.memo(({ 
  project, 
  onView360, 
  onEditProject, 
  onViewFloors, 
  onAddParticipant, 
  onProjectSettings,
  onLandscaping 
}) => {
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

  const handleView360Click = useCallback((e) => {
    e.stopPropagation();
    onView360(project.id);
  }, [onView360, project.id]);

  const handleViewFloorsClick = useCallback((e) => {
    e.stopPropagation();
    onViewFloors(project.id);
  }, [onViewFloors, project.id]);

  const handleAddParticipantClick = useCallback((e) => {
    e.stopPropagation();
    onAddParticipant(project.id);
  }, [onAddParticipant, project.id]);

  const handleProjectSettingsClick = useCallback((e) => {
    e.stopPropagation();
    onProjectSettings(project.id);
  }, [onProjectSettings, project.id]);

  const handleLandscapingClick = useCallback((e) => {
    e.stopPropagation();
    onLandscaping(project.id);
  }, [onLandscaping, project.id]);

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
            className={`action-btn ${styles.tooltipBtn}`}
            onClick={handleLandscapingClick}
            data-tooltip="Благоустройство"
            aria-label="Благоустройство"
          >
            <i className="fas fa-seedling" aria-hidden="true"></i>
          </button>
          <button 
            className={`action-btn ${styles.tooltipBtn}`}
            onClick={handleView360Click}
            data-tooltip="Изображение 360"
            aria-label="Изображение 360"
          >
            <i className="fas fa-eye" aria-hidden="true"></i>
          </button>
          <button 
            className={`action-btn ${styles.tooltipBtn}`}
            onClick={handleViewFloorsClick}
            data-tooltip="Статистика работников"
            aria-label="Статистика работников"
          >
            <i className="fas fa-users" aria-hidden="true"></i>
          </button>
          <button 
            className={`action-btn ${styles.tooltipBtn}`}
            onClick={handleAddParticipantClick}
            data-tooltip="Добавить участника"
            aria-label="Добавить участника"
          >
            <i className="fas fa-user-plus" aria-hidden="true"></i>
          </button>
          <button 
            className={`action-btn ${styles.tooltipBtn}`}
            onClick={handleProjectSettingsClick}
            data-tooltip="Настройки проекта"
            aria-label="Настройки проекта"
          >
            <i className="fas fa-cog" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      
      <div className={styles.projectInfo}>
        <h3 className={styles.projectName}>{project.name}</h3>
        <div className={styles.projectMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Последний раз запись:</span>
            <span className={styles.metaValue}>{formatDate(project.lastUpdate)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaValue}>{project.user}</span>
          </div>
        </div>
        <div className={styles.projectStats}>
          <div className={styles.statItem}>
            <i className="fas fa-camera" aria-hidden="true"></i>
            <span>{project.captures} захвата</span>
          </div>
          <div className={styles.statItem}>
            <i className="fas fa-sticky-note" aria-hidden="true"></i>
            <span>{project.fieldNotes?.tags?.length || 0} тегов заметок</span>
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
    captures: PropTypes.number.isRequired,
    fieldNotes: PropTypes.shape({
      tags: PropTypes.array,
      statuses: PropTypes.array
    }),
  }).isRequired,
  onView360: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
  onViewFloors: PropTypes.func.isRequired,
  onAddParticipant: PropTypes.func.isRequired,
  onProjectSettings: PropTypes.func.isRequired,
  onLandscaping: PropTypes.func.isRequired,
};

export default ProjectCard; 