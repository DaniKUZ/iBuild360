import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProjectsPage from './components/ProjectsPage';
import ProjectEditorPage from './components/ProjectEditorPage';
import ProjectAddPage from './components/ProjectAddPage';
import Viewer360Page from './components/Viewer360Page';
import WorkerStatsPage from './components/WorkerStatsPage';
import SettingsPage from './components/SettingsPage';
import LandscapingPage from './components/LandscapingPage';
import NetworkSchedulePage from './components/NetworkSchedulePage/NetworkSchedulePage';

import { mockProjects } from './data/mockData';
import './styles/main.css';

function App() {
  // Состояние проектов на уровне приложения
  const [projects, setProjects] = useState(mockProjects);
  
  // Состояние для сайдбара
  const [activeItem, setActiveItem] = useState('projects');
  const [activeSubItem, setActiveSubItem] = useState('active-projects');

  // Функция для добавления нового проекта
  const handleSaveNewProject = useCallback((newProject) => {
    console.log('Сохранить новый проект:', newProject);
    setProjects(prev => [...prev, newProject]);
  }, []);

  // Функция для обновления существующего проекта
  const handleSaveProject = useCallback((updatedProject) => {
    console.log('Сохранить изменения проекта:', updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, []);

  // Функция для получения проекта по ID
  const getProjectById = useCallback((projectId) => {
    return projects.find(p => p.id === parseInt(projectId));
  }, [projects]);

  // Обработчики для сайдбара
  const handleItemClick = useCallback((itemId) => {
    setActiveItem(itemId);
    if (itemId === 'network-schedule') {
      setActiveSubItem('current-schedule');
    } else {
      setActiveSubItem(null);
    }
  }, []);

  const handleSubItemClick = useCallback((subItemId) => {
    setActiveSubItem(subItemId);
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Лэндинг страница */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Страница входа */}
          <Route path="/login" element={<Login />} />
          
          {/* Главная страница с проектами */}
          <Route 
            path="/projects" 
            element={
              <ProjectsPage 
                projects={projects}
                onSaveNewProject={handleSaveNewProject}
                onSaveProject={handleSaveProject}
              />
            } 
          />
          
          {/* Страница настроек */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Редактирование проекта */}
          <Route 
            path="/editor/:projectId" 
            element={
              <ProjectEditorPage 
                getProjectById={getProjectById}
                onSaveProject={handleSaveProject}
              />
            } 
          />
          
          {/* Добавление нового проекта */}
          <Route 
            path="/add-project" 
            element={
              <ProjectAddPage 
                onSaveNewProject={handleSaveNewProject}
              />
            } 
          />
          
          {/* Просмотр 360 */}
          <Route 
            path="/viewer360/:projectId" 
            element={
              <Viewer360Page 
                getProjectById={getProjectById}
              />
            } 
          />
          
          {/* Статистика работников */}
          <Route 
            path="/worker-stats/:projectId" 
            element={<WorkerStatsPage />} 
          />
          
          {/* Дороги (бывшее благоустройство) */}
          <Route 
            path="/roads/:projectId" 
            element={
              <LandscapingPage 
                projects={projects}
              />
            } 
          />
          
          {/* Сетевой план */}
          <Route 
            path="/network-schedule" 
            element={
              <NetworkSchedulePage 
                activeItem={activeItem}
                activeSubItem={activeSubItem}
                onItemClick={handleItemClick}
                onSubItemClick={handleSubItemClick}
                onBack={() => window.history.back()}
              />
            } 
          />
          

          {/* Перенаправление неизвестных маршрутов на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App; 