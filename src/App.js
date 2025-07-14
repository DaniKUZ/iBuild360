import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { mockProjects, projectStatuses } from './data/mockData';
import Sidebar from './components/Sidebar';
import ProjectEditor from './components/ProjectEditor';
import Viewer360 from './components/Viewer360';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/main.css';

// Ленивая загрузка компонентов
const ProjectGrid = lazy(() => import('./components/ProjectGrid'));

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [currentView, setCurrentView] = useState('grid'); // 'grid', 'editor' или 'viewer360'
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Мемоизируем статусы проектов
  const memoizedProjectStatuses = useMemo(() => 
    projectStatuses.map(status => (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    )), []);

  const handleView360 = useCallback((projectId) => {
    console.log('Открыть режим просмотра 360 для проекта:', projectId);
    const project = mockProjects.find(p => p.id === projectId);
    setViewingProject(project);
    setCurrentView('viewer360');
  }, []);

  const handleEditProject = useCallback((projectId) => {
    console.log('Открыть редактор для проекта:', projectId);
    const project = mockProjects.find(p => p.id === projectId);
    setEditingProject(project);
    setCurrentView('editor');
  }, []);

  const handleBackToProjects = useCallback(() => {
    setCurrentView('grid');
    setEditingProject(null);
    setViewingProject(null);
  }, []);

  const handleMenuItemClick = useCallback((itemId) => {
    console.log('Выбран пункт меню:', itemId);
    setActiveMenuItem(itemId);
    // Здесь будет логика переключения между разделами
  }, []);

  // Если текущий вид - редактор, показываем только редактор
  if (currentView === 'editor') {
    return (
      <div className="app">
        <div className="app-content editor-fullscreen">
          <ErrorBoundary>
            <ProjectEditor 
              project={editingProject}
              onBack={handleBackToProjects}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Если текущий вид - просмотр 360, показываем только просмотр 360
  if (currentView === 'viewer360') {
    return (
      <div className="app">
        <div className="app-content editor-fullscreen">
          <ErrorBoundary>
            <Viewer360 
              project={viewingProject}
              onBack={handleBackToProjects}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Основной вид с сеткой проектов
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
}

export default App; 