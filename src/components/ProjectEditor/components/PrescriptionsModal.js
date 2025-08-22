import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './PrescriptionsModal.css';

const PrescriptionsModal = ({ 
  isOpen, 
  onClose, 
  frameData,
  roiData,
  currentFrame,
  onPrescriptionAdd,
  onPrescriptionUpdate,
  prescriptions = []
}) => {
  const [newPrescription, setNewPrescription] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'structural',
    coordinates: null,
    dueDate: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (isOpen && roiData?.points) {
      // Автоматически устанавливаем координаты из ROI области
      setNewPrescription(prev => ({
        ...prev,
        coordinates: {
          centerX: (roiData.points.tl.x + roiData.points.tr.x + roiData.points.br.x + roiData.points.bl.x) / 4,
          centerY: (roiData.points.tl.y + roiData.points.tr.y + roiData.points.br.y + roiData.points.bl.y) / 4,
          area: roiData.points
        }
      }));
    }
  }, [isOpen, roiData]);

  // Блокируем прокрутку body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPrescription.title.trim() || !newPrescription.description.trim()) return;

    const prescription = {
      id: Date.now().toString(),
      ...newPrescription,
      frameIndex: currentFrame,
      pkLabel: frameData?.pkLabel,
      status: 'pending',
      createdAt: new Date().toISOString(),
      author: 'Заказчик',
      photos: []
    };

    onPrescriptionAdd(prescription);
    setNewPrescription({
      title: '',
      description: '',
      priority: 'medium',
      type: 'structural',
      coordinates: roiData?.points ? {
        centerX: (roiData.points.tl.x + roiData.points.tr.x + roiData.points.br.x + roiData.points.bl.x) / 4,
        centerY: (roiData.points.tl.y + roiData.points.tr.y + roiData.points.br.y + roiData.points.bl.y) / 4,
        area: roiData.points
      } : null,
      dueDate: ''
    });
  };

  const handleStatusUpdate = (prescriptionId, newStatus) => {
    onPrescriptionUpdate(prescriptionId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'in_progress': return 'fas fa-play-circle';
      case 'completed': return 'fas fa-check-circle';
      case 'rejected': return 'fas fa-times-circle';
      default: return 'fas fa-circle';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает исправления';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Исправлено';
      case 'rejected': return 'Отклонено';
      default: return 'Неизвестно';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'structural': return 'Конструктивный';
      case 'pipe': return 'Трубопровод';
      case 'manhole': return 'Колодец';
      case 'support': return 'Опора';
      case 'surface': return 'Покрытие';
      case 'other': return 'Прочее';
      default: return 'Прочее';
    }
  };

  const filteredPrescriptions = prescriptions
    .filter(p => p.frameIndex === currentFrame)
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  if (!isOpen) return null;

  return (
    <div className="prescriptions-modal-overlay" onClick={onClose} onWheel={e => e.stopPropagation()}>
      <div className="prescriptions-modal" onClick={e => e.stopPropagation()}>
        <div className="prescriptions-modal-header">
          <h2>
            <i className="fas fa-clipboard-list"></i>
            Предписания - {frameData?.pkLabel}
          </h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="prescriptions-modal-content">
          {/* Форма добавления нового предписания */}
          <div className="new-prescription-form">
            <h3>Новое предписание</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Заголовок</label>
                  <input
                    type="text"
                    value={newPrescription.title}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Кратко опишите замечание"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Тип</label>
                  <select
                    value={newPrescription.type}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="structural">Конструктивный</option>
                    <option value="pipe">Трубопровод</option>
                    <option value="manhole">Колодец</option>
                    <option value="support">Опора</option>
                    <option value="surface">Покрытие</option>
                    <option value="other">Прочее</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Приоритет</label>
                  <select
                    value={newPrescription.priority}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Срок исправления</label>
                  <input
                    type="date"
                    value={newPrescription.dueDate}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Описание замечания</label>
                <textarea
                  value={newPrescription.description}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Подробно опишите выявленное нарушение и требования к исправлению"
                  rows={3}
                  required
                />
              </div>

              {roiData && (
                <div className="coordinates-info">
                  <i className="fas fa-map-marker-alt"></i>
                  Привязано к области работ: {roiData.label}
                </div>
              )}

              <button type="submit" className="submit-button">
                <i className="fas fa-plus"></i>
                Добавить предписание
              </button>
            </form>
          </div>

          {/* Список существующих предписаний */}
          <div className="prescriptions-list">
            <div className="list-header">
              <h3>Предписания для данного участка ({filteredPrescriptions.length})</h3>
              <div className="list-controls">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">Ожидают</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Исправлены</option>
                  <option value="rejected">Отклонены</option>
                </select>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date">По дате</option>
                  <option value="priority">По приоритету</option>
                </select>
              </div>
            </div>

            <div className="prescriptions-items">
              {filteredPrescriptions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-clipboard-list"></i>
                  <p>Нет предписаний для данного участка</p>
                </div>
              ) : (
                filteredPrescriptions.map(prescription => (
                  <div key={prescription.id} className="prescription-item">
                    <div className="prescription-header">
                      <div className="prescription-title">
                        <span 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(prescription.priority) }}
                        ></span>
                        <h4>{prescription.title}</h4>
                        <span className="prescription-type">{getTypeLabel(prescription.type)}</span>
                      </div>
                      <div className="prescription-status">
                        <span 
                          className="status-badge"
                          style={{ color: getStatusColor(prescription.status) }}
                        >
                          <i className={getStatusIcon(prescription.status)}></i>
                          {getStatusLabel(prescription.status)}
                        </span>
                      </div>
                    </div>

                    <div className="prescription-body">
                      <p>{prescription.description}</p>
                      
                      <div className="prescription-meta">
                        <span className="author">
                          <i className="fas fa-user"></i>
                          {prescription.author}
                        </span>
                        <span className="date">
                          <i className="fas fa-calendar"></i>
                          {new Date(prescription.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        {prescription.dueDate && (
                          <span className="due-date">
                            <i className="fas fa-clock"></i>
                            Срок: {new Date(prescription.dueDate).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="prescription-actions">
                      {prescription.status === 'pending' && (
                        <button 
                          className="action-btn start-btn"
                          onClick={() => handleStatusUpdate(prescription.id, 'in_progress')}
                        >
                          <i className="fas fa-play"></i>
                          В работу
                        </button>
                      )}
                      {prescription.status === 'in_progress' && (
                        <button 
                          className="action-btn complete-btn"
                          onClick={() => handleStatusUpdate(prescription.id, 'completed')}
                        >
                          <i className="fas fa-check"></i>
                          Исправлено
                        </button>
                      )}
                      {(prescription.status === 'pending' || prescription.status === 'in_progress') && (
                        <button 
                          className="action-btn reject-btn"
                          onClick={() => handleStatusUpdate(prescription.id, 'rejected')}
                        >
                          <i className="fas fa-times"></i>
                          Отклонить
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PrescriptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  frameData: PropTypes.object,
  roiData: PropTypes.object,
  currentFrame: PropTypes.number.isRequired,
  onPrescriptionAdd: PropTypes.func.isRequired,
  onPrescriptionUpdate: PropTypes.func.isRequired,
  prescriptions: PropTypes.array
};

export default PrescriptionsModal;

