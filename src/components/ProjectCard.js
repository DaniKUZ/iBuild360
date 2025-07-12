import React from 'react';

// Компонент ProjectCard экспортируется по умолчанию для tree-shaking

function ProjectCard({ project, onView360, onEditProject }) {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="project-card">
      <div className="project-preview" onClick={() => onView360(project.id)}>
        <img src={project.preview} alt={project.name} />
        <div className="preview-actions">
          <button 
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Действие 1');
            }}
            title="Действие 1"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button 
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Действие 2');
            }}
            title="Действие 2"
          >
            <i className="fas fa-share"></i>
          </button>
          <button 
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Действие 3');
            }}
            title="Действие 3"
          >
            <i className="fas fa-download"></i>
          </button>
          <button 
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEditProject(project.id);
            }}
            title="Редактировать проект"
          >
            <i className="fas fa-edit"></i>
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
    </div>
  );
}

export default ProjectCard; 