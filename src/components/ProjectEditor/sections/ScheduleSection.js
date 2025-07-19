import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import TaskEditModal from '../modals/TaskEditModal';

function ScheduleSection({ 
  tasks,
  editingTask,
  taskFormData,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  onStartEditTask,
  onCancelEdit,
  onSaveTask,
  onUpdateTaskForm,
  getAvailableDependencies,
  getProjectStats
}) {
  // Состояние для сортировки
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null // 'asc', 'desc', null
  });

  const stats = getProjectStats();

  // Функция для обработки клика по заголовку
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  // Функция сортировки задач
  const sortedTasks = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return tasks;
    }

    const sorted = [...tasks].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [tasks, sortConfig]);

  // Функция для получения иконки сортировки
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return 'fas fa-sort';
    }
    
    switch (sortConfig.direction) {
      case 'asc':
        return 'fas fa-sort-up';
      case 'desc':
        return 'fas fa-sort-down';
      default:
        return 'fas fa-sort';
    }
  };

  // Функция для получения цвета прогресса от темно-серого до синего
  const getProgressColor = (progress) => {
    const percentage = Math.max(0, Math.min(100, progress));
    const ratio = percentage / 100;
    
    // От темно-серого (#2d3748) к синему (#667eea)
    const startR = 45;  // #2d3748
    const startG = 55;
    const startB = 72;
    
    const endR = 102;   // #667eea
    const endG = 126;
    const endB = 234;
    
    const r = Math.round(startR + (endR - startR) * ratio);
    const g = Math.round(startG + (endG - startG) * ratio);
    const b = Math.round(startB + (endB - startB) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'in_progress':
        return '#3b82f6';
      case 'planned':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'in_progress':
        return 'fas fa-clock';
      case 'planned':
        return 'fas fa-calendar';
      default:
        return 'fas fa-calendar';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in_progress':
        return 'В работе';
      case 'planned':
        return 'Запланировано';
      default:
        return 'Неизвестно';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="schedule-section">
      <div className="schedule-header">
        <h3>
          <i className="fas fa-calendar-alt"></i>
          План-график работ
        </h3>
        <p className="schedule-description">
          Управление временными рамками и зависимостями строительных работ
        </p>
      </div>

      {/* Статистика проекта */}
      <div className="project-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Всего задач</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Завершено</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">В работе</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.overallProgress}%</div>
            <div className="stat-label">Общий прогресс</div>
          </div>
        </div>
        
        <div className="progress-overview">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${stats.overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Кнопка добавления новой задачи */}
      <div className="schedule-controls">
        <button 
          className="btn btn-primary add-task-btn"
          onClick={onAddTask}
        >
          <i className="fas fa-plus"></i>
          Добавить задачу
        </button>
      </div>

      {/* Список задач */}
      <div className="tasks-container">
        <div className="tasks-header">
          <div 
            className="task-name-col sortable-header"
            onClick={() => handleSort('name')}
          >
            Название задач
            <i className={getSortIcon('name')}></i>
          </div>
          <div 
            className="task-dates-col sortable-header"
            onClick={() => handleSort('startDate')}
          >
            Даты
            <i className={getSortIcon('startDate')}></i>
          </div>
          <div 
            className="task-progress-col sortable-header"
            onClick={() => handleSort('progress')}
          >
            Прогресс
            <i className={getSortIcon('progress')}></i>
          </div>
          <div className="task-status-col">Статус</div>
          <div className="task-actions-col">Действия</div>
        </div>

        <div className="tasks-list">
          {sortedTasks.map(task => (
            <div 
              key={task.id} 
              className="task-item"
              data-dates={`${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}
              data-progress={task.progress}
              data-status={getStatusText(task.status)}
            >
              <div className="task-name-col">
                <div className="task-name">
                  <h4>{task.name}</h4>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  {task.responsible && (
                    <p className="task-responsible">
                      <i className="fas fa-user"></i>
                      {task.responsible}
                    </p>
                  )}
                </div>
              </div>

              <div className="task-dates-col">
                <div className="task-dates">
                  <div className="date-info">
                    <span className="date-label">Начало:</span>
                    <span className="date-value">{formatDate(task.startDate)}</span>
                  </div>
                  <div className="date-info">
                    <span className="date-label">Окончание:</span>
                    <span className="date-value">{formatDate(task.endDate)}</span>
                  </div>
                  <div className="duration-info">
                    {getDuration(task.startDate, task.endDate)} дней
                  </div>
                </div>
              </div>

              <div className="task-progress-col">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${task.progress}%`,
                        backgroundColor: getProgressColor(task.progress)
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{task.progress}%</span>
                </div>
              </div>

              <div className="task-status-col">
                <div className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                  <i className={getStatusIcon(task.status)}></i>
                  {getStatusText(task.status)}
                </div>
              </div>

              <div className="task-actions-col">
                <button 
                  className="btn-action btn-edit"
                  onClick={() => onStartEditTask(task)}
                  title="Редактировать"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="btn-action btn-remove"
                  onClick={() => onRemoveTask(task.id)}
                  title="Удалить"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

              {/* Модальное окно редактирования задачи */}
        {editingTask && (
          <TaskEditModal
            editingTask={editingTask}
            taskFormData={taskFormData}
            onUpdateTaskForm={onUpdateTaskForm}
            onSaveTask={onSaveTask}
            onCancelEdit={onCancelEdit}
            getAvailableDependencies={getAvailableDependencies}
          />
        )}

      <div className="schedule-instructions">
        <h4>Инструкции по использованию:</h4>
        <ul>
          <li>Создавайте задачи в хронологическом порядке</li>
          <li>Устанавливайте зависимости между связанными задачами</li>
          <li>Регулярно обновляйте прогресс выполнения</li>
          <li>Используйте статусы для контроля хода работ</li>
          <li>Назначайте ответственных за каждую задачу</li>
        </ul>
      </div>
    </div>
  );
}

ScheduleSection.propTypes = {
  tasks: PropTypes.array.isRequired,
  editingTask: PropTypes.object,
  taskFormData: PropTypes.object.isRequired,
  onAddTask: PropTypes.func.isRequired,
  onUpdateTask: PropTypes.func.isRequired,
  onRemoveTask: PropTypes.func.isRequired,
  onStartEditTask: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveTask: PropTypes.func.isRequired,
  onUpdateTaskForm: PropTypes.func.isRequired,
  getAvailableDependencies: PropTypes.func.isRequired,
  getProjectStats: PropTypes.func.isRequired
};

export default ScheduleSection; 