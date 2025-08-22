import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  getTechnicalSolutions, 
  getStatistics, 
  getParticipantRoles,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getTypeLabel
} from '../../data/mockTechnicalSolutions';
import TechnicalSolutionCard from './components/TechnicalSolutionCard';
import TechnicalSolutionModal from './components/TechnicalSolutionModal';
import StatisticsCards from './components/StatisticsCards';
import FilterControls from './components/FilterControls';
import styles from './TechnicalSolutions.module.css';

const TechnicalSolutions = ({ activeSubItem = 'all-solutions' }) => {
  const [solutions, setSolutions] = useState(() => getTechnicalSolutions());
  const [statistics] = useState(() => getStatistics());
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    search: ''
  });
  
  // Сортировка
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Фильтрация и сортировка решений
  const filteredAndSortedSolutions = useMemo(() => {
    let filtered = solutions;

    // Фильтр по подразделу
    if (activeSubItem !== 'all-solutions') {
      filtered = filtered.filter(solution => solution.status === activeSubItem);
    }

    // Применяем фильтры
    if (filters.status !== 'all') {
      filtered = filtered.filter(solution => solution.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(solution => solution.priority === filters.priority);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(solution => solution.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(solution => 
        solution.title.toLowerCase().includes(searchLower) ||
        solution.description.toLowerCase().includes(searchLower) ||
        solution.section.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate || '9999-12-31');
          bValue = new Date(b.dueDate || '9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'cost':
          aValue = Math.abs(a.cost || 0);
          bValue = Math.abs(b.cost || 0);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [solutions, activeSubItem, filters, sortBy, sortOrder]);

  const handleSolutionClick = (solution) => {
    setSelectedSolution(solution);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedSolution(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleSaveNewSolution = (newSolutionData) => {
    // Генерируем новый ID
    const newId = `TS-${(solutions.length + 1).toString().padStart(3, '0')}`;
    
    const newSolution = {
      ...newSolutionData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      participants: [
        {
          role: 'author',
          name: 'Текущий пользователь',
          position: 'Инженер',
          status: 'approved'
        },
        {
          role: 'technical_manager',
          name: 'Петров А.В.',
          position: 'Технический директор',
          status: 'pending'
        },
        {
          role: 'project_manager',
          name: 'Сидорова М.И.',
          position: 'Руководитель проекта',
          status: 'pending'
        }
      ]
    };

    setSolutions(prevSolutions => [...prevSolutions, newSolution]);
    setIsModalOpen(false);
    setIsCreating(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSolution(null);
    setIsCreating(false);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSubItemTitle = () => {
    switch (activeSubItem) {
      case 'pending': return 'Ожидают согласования';
      case 'in_progress': return 'В процессе согласования';
      case 'approved': return 'Согласованные';
      case 'rejected': return 'Отклоненные';
      default: return 'Все технические решения';
    }
  };

  const getSubItemCount = () => {
    if (activeSubItem === 'all-solutions') {
      return statistics.total;
    }
    return statistics.byStatus[activeSubItem] || 0;
  };

  return (
    <div className={styles.technicalSolutions}>
      <div className={styles.technicalSolutionsHeader}>
        <div className={styles.headerMain}>
          <h1>
            <i className="fas fa-cogs"></i>
            Технические решения
          </h1>
          <p className={styles.headerDescription}>
            Управление техническими решениями по объекту и отслеживание стадий согласования
          </p>
        </div>
        
        <button className={styles.createButton} onClick={handleCreateNew}>
          <i className="fas fa-plus"></i>
          Новое техническое решение
        </button>
      </div>

      {/* Статистические карточки */}
      <StatisticsCards statistics={statistics} />

      <div className={styles.solutionsContent}>
        <div className={styles.contentHeader}>
          <div className={styles.sectionTitle}>
            <h2>{getSubItemTitle()}</h2>
            <span className={styles.countBadge}>{getSubItemCount()}</span>
          </div>
          
          {/* Кнопки быстрой фильтрации */}
          <div className={styles.quickFilters}>
            <button 
              className={`${styles.quickFilterBtn} ${filters.status === 'pending' ? styles.active : ''}`}
              onClick={() => handleFilterChange('status', filters.status === 'pending' ? 'all' : 'pending')}
            >
              <i className="fas fa-clock"></i>
              Ожидают
            </button>
            <button 
              className={`${styles.quickFilterBtn} ${filters.priority === 'high' ? styles.active : ''}`}
              onClick={() => handleFilterChange('priority', filters.priority === 'high' ? 'all' : 'high')}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Высокий приоритет
            </button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Список технических решений */}
        <div className={styles.solutionsList}>
          {filteredAndSortedSolutions.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fas fa-cogs"></i>
              <h3>Нет технических решений</h3>
              <p>
                {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all'
                  ? 'По заданным критериям не найдено ни одного технического решения'
                  : 'Пока не создано ни одного технического решения'
                }
              </p>
              {!filters.search && filters.status === 'all' && filters.priority === 'all' && filters.type === 'all' && (
                <button className={styles.createFirstButton} onClick={handleCreateNew}>
                  <i className="fas fa-plus"></i>
                  Создать первое техническое решение
                </button>
              )}
            </div>
          ) : (
            <div className={styles.solutionsGrid}>
              {filteredAndSortedSolutions.map(solution => (
                <TechnicalSolutionCard
                  key={solution.id}
                  solution={solution}
                  onClick={() => handleSolutionClick(solution)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для просмотра/создания технического решения */}
      <TechnicalSolutionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        solution={selectedSolution}
        isCreating={isCreating}
        participantRoles={getParticipantRoles()}
        onSave={handleSaveNewSolution}
      />
    </div>
  );
};

TechnicalSolutions.propTypes = {
  activeSubItem: PropTypes.string
};

export default TechnicalSolutions;

