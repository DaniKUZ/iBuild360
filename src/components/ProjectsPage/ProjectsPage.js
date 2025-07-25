import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import ErrorBoundary from '../ErrorBoundary';
import { ParticipantModal } from '../ProjectEditor/modals';
import { getUserData } from '../../utils/userManager';

// Ленивая загрузка компонентов
const ProjectGrid = lazy(() => import('../ProjectGrid'));

const ProjectsPage = ({ projects, onSaveNewProject, onSaveProject }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [activeSubItem, setActiveSubItem] = useState('active-projects');
  const [activeTab, setActiveTab] = useState('projects');
  const [participantModalOpen, setParticipantModalOpen] = useState(false);
  const [selectedProjectForParticipants, setSelectedProjectForParticipants] = useState(null);

  const filteredProjects = useMemo(() => {
    if (activeSubItem === 'active-projects') {
      return projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isActive = project.status !== 'Завершен';
        return matchesSearch && isActive;
      });
    } else if (activeSubItem === 'closed-projects') {
      return projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isClosed = project.status === 'Завершен';
        return matchesSearch && isClosed;
      });
    }
    return [];
  }, [searchTerm, projects, activeSubItem]);

  const handleView360 = useCallback((projectId) => {
    console.log('Открыть режим просмотра 360 для проекта:', projectId);
    navigate(`/viewer360/${projectId}`);
  }, [navigate]);

  const handleEditProject = useCallback((projectId) => {
    console.log('Открыть редактор для проекта:', projectId);
    navigate(`/editor/${projectId}`);
  }, [navigate]);

  const handleViewWorkerStats = useCallback((projectId) => {
    console.log('Открыть статистику работников для проекта:', projectId);
    navigate(`/worker-stats/${projectId}`);
  }, [navigate]);

  const handleAddParticipant = useCallback((projectId) => {
    console.log('Добавить участника в проект:', projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectForParticipants(project);
      setParticipantModalOpen(true);
    }
  }, [projects]);

  const handleCloseParticipantModal = useCallback(() => {
    setParticipantModalOpen(false);
    setSelectedProjectForParticipants(null);
  }, []);

  const handleAddParticipantToProject = useCallback((projectId, newParticipant) => {
    console.log('Добавить участника в проект:', projectId, newParticipant);
    // Обновляем проект с новым участником
    const updatedProject = {
      ...selectedProjectForParticipants,
      participants: [
        ...(selectedProjectForParticipants.participants || []),
        newParticipant
      ]
    };
    
    if (onSaveProject) {
      onSaveProject(updatedProject);
    }
    
    // Обновляем выбранный проект для отображения в модальном окне
    setSelectedProjectForParticipants(updatedProject);
  }, [selectedProjectForParticipants, onSaveProject]);

  const handleProjectSettings = useCallback((projectId) => {
    console.log('Открыть настройки проекта:', projectId);
    // Переходим в редактор проекта с параметром настроек
    navigate(`/editor/${projectId}?mode=settings`);
  }, [navigate]);

  const handleAddProject = useCallback(() => {
    console.log('Открыть форму добавления проекта');
    navigate('/add-project');
  }, [navigate]);

  const handleMenuItemClick = useCallback((itemId) => {
    console.log('Выбран пункт меню:', itemId);
    setActiveMenuItem(itemId);
    
    // Устанавливаем подпункт по умолчанию для каждого раздела
    if (itemId === 'projects') {
      setActiveSubItem('active-projects');
    } else if (itemId === 'shared') {
      setActiveSubItem(null);
    } else if (itemId === 'admin') {
      setActiveSubItem('team-management');
    }
  }, []);

  const handleSubItemClick = useCallback((subItemId) => {
    console.log('Выбран подпункт меню:', subItemId);
    setActiveSubItem(subItemId);
  }, []);

  const handleTabClick = useCallback((tabId) => {
    console.log('Выбрана вкладка:', tabId);
    setActiveTab(tabId);
    // На странице проектов доступна только вкладка "Проекты"
    if (tabId === 'projects') {
      setActiveTab('projects');
    }
  }, []);

  const handleHelpClick = useCallback(() => {
    console.log('Открыть помощь');
  }, []);

  const handleUserClick = useCallback(() => {
    console.log('Открыть профиль пользователя');
  }, []);

  const renderMainContent = () => {
    if (activeMenuItem === 'shared') {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <i className="fas fa-folder-open empty-state-icon" aria-hidden="true"></i>
            <h3>Папки не добавлены</h3>
            <p>Похоже, вам пока не предоставлен доступ к папкам.</p>
          </div>
        </div>
      );
    }

    if (activeMenuItem === 'admin') {
      if (activeSubItem === 'team-management') {
        return (
          <div className="admin-content">
            <h2>Управление командой</h2>
            <p>Здесь будет интерфейс управления командой</p>
          </div>
        );
      } else if (activeSubItem === 'reports') {
        return (
          <div className="admin-content">
            <h2>Отчеты</h2>
            <p>Здесь будут отчеты</p>
          </div>
        );
      }
    }

    if (activeMenuItem === 'projects') {
      const sectionTitle = activeSubItem === 'active-projects' ? 'Активные проекты' : 'Закрытые проекты';
      return (
        <>
          <section className="projects-section">
            <div className="projects-header-row">
              <div className="projects-info">
                <h2>{sectionTitle}</h2>
                <span className="projects-count">{filteredProjects.length} проекта</span>
              </div>
              <div className="projects-controls">
                <div className="search-container">
                  <i className="fas fa-search" aria-hidden="true"></i>
                  <input
                    type="text"
                    placeholder="Поиск проектов по названию"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="projects-search-input"
                    aria-label="Поиск проектов по названию"
                  />
                </div>
                {activeSubItem === 'active-projects' && (
                  <button
                    className="btn btn-primary add-project-btn"
                    onClick={handleAddProject}
                    aria-label="Добавить новый проект"
                  >
                    <i className="fas fa-plus"></i>
                    Новый проект
                  </button>
                )}
              </div>
            </div>
          </section>
          
          <ErrorBoundary>
            <Suspense fallback={<div className="loading" role="status" aria-live="polite">Загрузка...</div>}>
              <ProjectGrid
                projects={filteredProjects}
                onView360={handleView360}
                onEditProject={handleEditProject}
                onViewFloors={handleViewWorkerStats}
                onAddParticipant={handleAddParticipant}
                onProjectSettings={handleProjectSettings}
              />
            </Suspense>
          </ErrorBoundary>
        </>
      );
    }

    return null;
  };

  return (
    <div className="app">
      <Sidebar 
        activeItem={activeMenuItem} 
        activeSubItem={activeSubItem}
        onItemClick={handleMenuItemClick}
        onSubItemClick={handleSubItemClick}
      />
      <div className="app-content">
        <TopNavbar
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onHelpClick={handleHelpClick}
          onUserClick={handleUserClick}
          showProjectSettings={false}
          showProjectAdd={false}
        />
        
        <main className="app-main" role="main">
          {renderMainContent()}
        </main>
      </div>
      
      {/* Модальное окно для управления участниками */}
      <ParticipantModal
        isOpen={participantModalOpen}
        onClose={handleCloseParticipantModal}
        project={selectedProjectForParticipants}
        currentUser={getUserData()}
        onAddParticipant={handleAddParticipantToProject}
      />
    </div>
  );
};

ProjectsPage.propTypes = {
  projects: PropTypes.array.isRequired,
  onSaveNewProject: PropTypes.func.isRequired,
  onSaveProject: PropTypes.func.isRequired,
};

export default ProjectsPage; 