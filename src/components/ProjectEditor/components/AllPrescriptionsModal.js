import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AllPrescriptionsModal.css';

const AllPrescriptionsModal = ({ 
  isOpen, 
  onClose, 
  prescriptions = [],
  onPrescriptionUpdate,
  onPrescriptionView
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  // Блокируем прокрутку body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  // Фильтрация и сортировка предписаний
  const filteredAndSortedPrescriptions = useMemo(() => {
    let filtered = prescriptions.filter(prescription => {
      const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || prescription.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        prescription.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.pkLabel?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        default:
          return 0;
      }
    });

    return filtered;
  }, [prescriptions, filterStatus, filterPriority, sortBy, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Выполнено';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const handleStatusChange = (prescriptionId, newStatus) => {
    if (onPrescriptionUpdate) {
      onPrescriptionUpdate(prescriptionId, { status: newStatus });
    }
  };

  const handleViewPrescription = (prescription) => {
    if (onPrescriptionView) {
      onPrescriptionView(prescription);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="all-prescriptions-modal-overlay" onClick={onClose} onWheel={e => e.stopPropagation()}>
      <div className="all-prescriptions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="all-prescriptions-modal-header">
          <h2>
            <i className="fas fa-clipboard-list"></i>
            Все предписания ({prescriptions.length})
          </h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="all-prescriptions-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Поиск:</label>
              <input
                type="text"
                placeholder="Поиск по названию, описанию, ПК..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Статус:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Все</option>
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Выполнено</option>
                <option value="rejected">Отклонено</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Приоритет:</label>
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">Все</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Сортировка:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">По дате создания</option>
                <option value="priority">По приоритету</option>
                <option value="status">По статусу</option>
                <option value="dueDate">По сроку</option>
              </select>
            </div>
          </div>
        </div>

        <div className="all-prescriptions-content">
          {filteredAndSortedPrescriptions.length === 0 ? (
            <div className="no-prescriptions">
              <i className="fas fa-inbox"></i>
              <p>Предписания не найдены</p>
            </div>
          ) : (
            <div className="prescriptions-list">
              {filteredAndSortedPrescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <h3>{prescription.title}</h3>
                    <div className="prescription-badges">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(prescription.priority) }}
                      >
                        {getPriorityLabel(prescription.priority)}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(prescription.status) }}
                      >
                        {getStatusLabel(prescription.status)}
                      </span>
                    </div>
                  </div>

                  <div className="prescription-info">
                    <p className="prescription-description">{prescription.description}</p>
                    
                    <div className="prescription-meta">
                      <div className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>ПК: {prescription.pkLabel || 'Не указан'}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-image"></i>
                        <span>Кадр: {prescription.frameIndex + 1}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-calendar"></i>
                        <span>Создано: {formatDate(prescription.createdAt)}</span>
                      </div>
                      {prescription.dueDate && (
                        <div className="meta-item">
                          <i className="fas fa-clock"></i>
                          <span>Срок: {new Date(prescription.dueDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="prescription-actions">
                    <button
                      className="view-button"
                      onClick={() => handleViewPrescription(prescription)}
                      title="Перейти к кадру"
                    >
                      <i className="fas fa-eye"></i>
                      Просмотр
                    </button>

                    <div className="status-controls">
                      <select
                        value={prescription.status}
                        onChange={(e) => handleStatusChange(prescription.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Ожидает</option>
                        <option value="in_progress">В работе</option>
                        <option value="completed">Выполнено</option>
                        <option value="rejected">Отклонено</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="all-prescriptions-footer">
          <div className="prescriptions-summary">
            Показано: {filteredAndSortedPrescriptions.length} из {prescriptions.length}
          </div>
        </div>
      </div>
    </div>
  );
};

AllPrescriptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  prescriptions: PropTypes.array,
  onPrescriptionUpdate: PropTypes.func,
  onPrescriptionView: PropTypes.func
};

export default AllPrescriptionsModal;
