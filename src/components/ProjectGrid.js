import React from 'react';
import ProjectCard from './ProjectCard';

function ProjectGrid({ projects, onView360, onEditProject }) {
  if (projects.length === 0) {
    return (
      <div className="no-projects">
        <i className="fas fa-search"></i>
        <p>Проекты не найдены</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
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
}

export default ProjectGrid; 