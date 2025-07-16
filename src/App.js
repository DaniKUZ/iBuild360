import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { mockProjects, projectStatuses } from './data/mockData';
import Sidebar from './components/Sidebar';
import ProjectEditor from './components/ProjectEditor';
import ProjectAdd from './components/ProjectAdd';
import Viewer360 from './components/Viewer360';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/main.css';

// Ленивая загрузка компонентов
const ProjectGrid = lazy(() => import('./components/ProjectGrid'));

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' или 'oldest'
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [currentView, setCurrentView] = useState('grid'); // 'grid', 'editor', 'add' или 'viewer360'
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [projects, setProjects] = useState(mockProjects);

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
    const project = projects.find(p => p.id === projectId);
    setViewingProject(project);
    setCurrentView('viewer360');
  }, [projects]);

  const handleEditProject = useCallback((projectId) => {
    console.log('Открыть редактор для проекта:', projectId);
    const project = projects.find(p => p.id === projectId);
    setEditingProject(project);
    setCurrentView('editor');
  }, [projects]);

  const handleBackToProjects = useCallback(() => {
    setCurrentView('grid');
    setEditingProject(null);
    setViewingProject(null);
  }, []);

  const handleAddProject = useCallback(() => {
    console.log('Открыть форму добавления проекта');
    setCurrentView('add');
  }, []);

  const handleSaveNewProject = useCallback((newProject) => {
    console.log('Сохранить новый проект:', newProject);
    setProjects(prev => [...prev, newProject]);
  }, []);

  const handleSaveProject = useCallback((updatedProject) => {
    console.log('Сохранить изменения проекта:', updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
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
              onSave={handleSaveProject}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Если текущий вид - добавление проекта, показываем форму добавления
  if (currentView === 'add') {
    return (
      <div className="app">
        <div className="app-content editor-fullscreen">
          <ErrorBoundary>
            <ProjectAdd 
              onBack={handleBackToProjects}
              onSave={handleSaveNewProject}
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
}

export default App; 