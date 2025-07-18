import React from 'react';
import PropTypes from 'prop-types';

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
  const stats = getProjectStats();

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
          <div className="task-name-col">Название задачи</div>
          <div className="task-dates-col">Даты</div>
          <div className="task-progress-col">Прогресс</div>
          <div className="task-status-col">Статус</div>
          <div className="task-actions-col">Действия</div>
        </div>

        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
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
                        backgroundColor: getStatusColor(task.status)
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
        <div className="modal-overlay">
          <div className="task-edit-modal">
            <div className="modal-header">
              <h3>Редактирование задачи</h3>
              <button 
                className="btn-close"
                onClick={onCancelEdit}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Название задачи</label>
                <input
                  type="text"
                  value={taskFormData.name}
                  onChange={(e) => onUpdateTaskForm('name', e.target.value)}
                  placeholder="Введите название задачи"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Дата начала</label>
                  <input
                    type="date"
                    value={taskFormData.startDate}
                    onChange={(e) => onUpdateTaskForm('startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Дата окончания</label>
                  <input
                    type="date"
                    value={taskFormData.endDate}
                    onChange={(e) => onUpdateTaskForm('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Прогресс (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taskFormData.progress}
                    onChange={(e) => onUpdateTaskForm('progress', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => onUpdateTaskForm('status', e.target.value)}
                  >
                    <option value="planned">Запланировано</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Ответственный</label>
                <input
                  type="text"
                  value={taskFormData.responsible}
                  onChange={(e) => onUpdateTaskForm('responsible', e.target.value)}
                  placeholder="Введите ответственного"
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => onUpdateTaskForm('description', e.target.value)}
                  placeholder="Введите описание задачи"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Зависимости</label>
                <select
                  multiple
                  value={taskFormData.dependencies.map(String)}
                  onChange={(e) => {
                    const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    onUpdateTaskForm('dependencies', selectedValues);
                  }}
                  className="dependencies-select"
                >
                  {getAvailableDependencies(editingTask.id).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
                <small>Выберите задачи, которые должны быть завершены перед началом этой задачи</small>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={onCancelEdit}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={onSaveTask}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
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