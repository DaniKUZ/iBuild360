import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { projectStatuses } from '../../data/mockData';
import Sidebar from '../Sidebar';
import ErrorBoundary from '../ErrorBoundary';

// Ленивая загрузка компонентов
const ProjectGrid = lazy(() => import('../ProjectGrid'));

const ProjectsPage = ({ projects, onSaveNewProject, onSaveProject }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' или 'oldest'
  const [activeMenuItem, setActiveMenuItem] = useState('home');

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Сортировка по дате (включая время для точной сортировки)
    filtered.sort((a, b) => {
      const dateA = new Date(a.lastUpdate);
      const dateB = new Date(b.lastUpdate);
      
      if (dateSort === 'newest') {
        return dateB - dateA; // Сначала новые
      } else {
        return dateA - dateB; // Сначала старые
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, dateSort, projects]);

  // Мемоизируем статусы проектов
  const memoizedProjectStatuses = useMemo(() => 
    projectStatuses.map(status => (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    )), []);

  const handleView360 = useCallback((projectId) => {
    console.log('Открыть режим просмотра 360 для проекта:', projectId);
    navigate(`/viewer360/${projectId}`);
  }, [navigate]);

  const handleEditProject = useCallback((projectId) => {
    console.log('Открыть редактор для проекта:', projectId);
    navigate(`/editor/${projectId}`);
  }, [navigate]);

  const handleAddProject = useCallback(() => {
    console.log('Открыть форму добавления проекта');
    navigate('/add-project');
  }, [navigate]);

  // Функции сохранения теперь передаются как пропсы

  const handleMenuItemClick = useCallback((itemId) => {
    console.log('Выбран пункт меню:', itemId);
    
    if (itemId === 'settings') {
      navigate('/settings');
    } else {
      setActiveMenuItem(itemId);
      // Здесь будет логика переключения между разделами
    }
  }, [navigate]);

  return (
    <div className="app">
      <Sidebar 
        activeItem={activeMenuItem} 
        onItemClick={handleMenuItemClick}
      />
      <div className="app-content">
        <header className="app-header">
          <h1>Центр управления качеством и рисками города Москва</h1>
          <div className="controls" role="search" aria-label="Поиск и фильтрация проектов">
            <div className="search-container">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="text"
                placeholder="Поиск по названию проекта..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Поиск по названию проекта"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
              aria-label="Фильтр по статусу проекта"
            >
              {memoizedProjectStatuses}
            </select>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="date-sort-filter"
              aria-label="Сортировка по дате"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
            <button
              className="btn btn-primary add-project-btn"
              onClick={handleAddProject}
              aria-label="Добавить новый проект"
            >
              <i className="fas fa-plus"></i>
              Добавить проект
            </button>
          </div>
        </header>
        
        <main className="app-main" role="main">
          <ErrorBoundary>
            <Suspense fallback={<div className="loading" role="status" aria-live="polite">Загрузка...</div>}>
              <ProjectGrid
                projects={filteredProjects}
                onView360={handleView360}
                onEditProject={handleEditProject}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

ProjectsPage.propTypes = {
  projects: PropTypes.array.isRequired,
  onSaveNewProject: PropTypes.func.isRequired,
  onSaveProject: PropTypes.func.isRequired,
};

export default ProjectsPage; 