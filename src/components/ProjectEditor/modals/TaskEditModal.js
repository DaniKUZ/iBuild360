import React from 'react';
import PropTypes from 'prop-types';

function TaskEditModal({ 
  editingTask,
  addingTask,
  taskFormData,
  onCancelEdit,
  onSaveTask,
  onUpdateTaskForm,
  getAvailableDependencies
}) {
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

  // Обработчик закрытия по клику на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancelEdit();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="task-edit-modal">
        <div className="modal-header">
          <h3>{editingTask ? 'Редактирование задачи' : 'Добавление задачи'}</h3>
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
              <div className="progress-input-container">
                <div className="progress-slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskFormData.progress}
                    onChange={(e) => onUpdateTaskForm('progress', e.target.value)}
                    className="progress-slider"
                  />
                  <div 
                    className="progress-slider-track"
                    style={{
                      background: `linear-gradient(to right, #2d3748 0%, ${getProgressColor(taskFormData.progress)} ${taskFormData.progress}%, #e2e8f0 ${taskFormData.progress}%)`
                    }}
                  ></div>
                </div>
                <div className="progress-input-group">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taskFormData.progress}
                    onChange={(e) => onUpdateTaskForm('progress', e.target.value)}
                    className="progress-number-input"
                  />
                  <span className="progress-percent">%</span>
                </div>
              </div>
              <div 
                className="progress-preview" 
                style={{ backgroundColor: getProgressColor(taskFormData.progress) }}
              >
                {taskFormData.progress}%
              </div>
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
  );
}

TaskEditModal.propTypes = {
  editingTask: PropTypes.object,
  addingTask: PropTypes.bool,
  taskFormData: PropTypes.object.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveTask: PropTypes.func.isRequired,
  onUpdateTaskForm: PropTypes.func.isRequired,
  getAvailableDependencies: PropTypes.func.isRequired
};

export default TaskEditModal; 