import React from 'react';
import PropTypes from 'prop-types';
import ProjectCard from '../ProjectCard';
import styles from './ProjectGrid.module.css';

const ProjectGrid = React.memo(({ projects, onView360, onEditProject }) => {
  if (projects.length === 0) {
    return (
      <div className={styles.noProjects} role="status" aria-live="polite">
        <i className="fas fa-search" aria-hidden="true"></i>
        <p>Проекты не найдены</p>
      </div>
    );
  }

  return (
    <div className={styles.projectGrid} role="grid" aria-label="Список проектов">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onView360={onView360}
          onEditProject={onEditProject}
        />
      ))}
    </div>
  );
});

ProjectGrid.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      lastUpdate: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      preview: PropTypes.string.isRequired,
    })
  ).isRequired,
  onView360: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
};

export default ProjectGrid; 