import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getTypeLabel
} from '../../../data/mockTechnicalSolutions';
import styles from './TechnicalSolutionModal.module.css';

const TechnicalSolutionModal = ({ 
  isOpen, 
  onClose, 
  solution, 
  isCreating, 
  participantRoles,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'structural',
    priority: 'medium',
    section: '',
    reason: '',
    dueDate: '',
    cost: '',
    costImpact: 'increase',
    scheduleImpact: ''
  });

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      // Просто блокируем прокрутку, не меняя позицию
      document.body.style.overflow = 'hidden';
      
      // Cleanup функция для восстановления прокрутки
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (solution && !isCreating) {
      setFormData({
        title: solution.title || '',
        description: solution.description || '',
        type: solution.type || 'structural',
        priority: solution.priority || 'medium',
        section: solution.section || '',
        reason: solution.reason || '',
        dueDate: solution.dueDate || '',
        cost: solution.cost || '',
        costImpact: solution.costImpact || 'increase',
        scheduleImpact: solution.scheduleImpact || ''
      });
    } else if (isCreating) {
      setFormData({
        title: '',
        description: '',
        type: 'structural',
        priority: 'medium',
        section: '',
        reason: '',
        dueDate: '',
        cost: '',
        costImpact: 'increase',
        scheduleImpact: ''
      });
    }
  }, [solution, isCreating]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isCreating && onSave) {
      // Преобразуем пустые строки в числа для числовых полей
      const processedData = {
        ...formData,
        cost: formData.cost === '' ? 0 : Number(formData.cost),
        scheduleImpact: formData.scheduleImpact === '' ? 0 : Number(formData.scheduleImpact)
      };
      
      onSave(processedData);
    } else {
      console.log('Обновление технического решения:', formData);
      // Здесь будет логика обновления существующего решения
      onClose();
    }
  };

  const formatCost = (cost) => {
    if (!cost) return '0 ₽';
    const absValue = Math.abs(cost);
    const formatted = absValue.toLocaleString('ru-RU');
    const sign = cost > 0 ? '+' : cost < 0 ? '-' : '';
    return `${sign}${formatted} ₽`;
  };

  const getApprovalProgress = () => {
    if (!solution?.participants) return { approved: 0, total: 0, percentage: 0 };
    const total = solution.participants.length;
    const approved = solution.participants.filter(p => p.status === 'approved').length;
    return { approved, total, percentage: total > 0 ? Math.round((approved / total) * 100) : 0 };
  };

  if (!isOpen) return null;

  return (
    <div className={styles.technicalSolutionModalOverlay} onClick={onClose}>
      <div className={styles.technicalSolutionModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <i className="fas fa-cogs"></i>
            {isCreating ? 'Новое техническое решение' : 'Техническое решение'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalContent}>
          {isCreating ? (
            /* Форма создания */
            <form onSubmit={handleSubmit} className={styles.solutionForm}>
              <div className={styles.formSection}>
                <h3>Основная информация</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Название решения *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Краткое описание технического решения"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Раздел/Участок *</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                      placeholder="Например: Секция А, 3 этаж"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Описание решения *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Подробное описание технического решения и его обоснование"
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Тип решения</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="foundation">Фундамент</option>
                      <option value="structural">Конструкции</option>
                      <option value="utilities">Инженерные сети</option>
                      <option value="facade">Фасад</option>
                      <option value="roofing">Кровля</option>
                      <option value="interior">Внутренние работы</option>
                      <option value="landscaping">Благоустройство</option>
                      <option value="other">Прочее</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Приоритет</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Причина решения</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="Например: Изменение проектных условий"
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>Влияние на проект</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Срок согласования</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Влияние на сроки (дни)</label>
                    <input
                      type="number"
                      value={formData.scheduleImpact}
                      onChange={(e) => handleInputChange('scheduleImpact', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Стоимость (₽)</label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Тип влияния на бюджет</label>
                    <select
                      value={formData.costImpact}
                      onChange={(e) => handleInputChange('costImpact', e.target.value)}
                    >
                      <option value="increase">Увеличение затрат</option>
                      <option value="decrease">Снижение затрат</option>
                      <option value="neutral">Без изменений</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={onClose} className={styles.cancelButton}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitButton}>
                  <i className="fas fa-save"></i>
                  Создать решение
                </button>
              </div>
            </form>
          ) : (
            /* Просмотр существующего решения */
            <div className={styles.solutionView}>
              <div className={styles.solutionHeader}>
                <div className={styles.solutionTitleSection}>
                  <h3>{solution.title}</h3>
                  <div className={styles.solutionMeta}>
                    <span className={styles.solutionId}>{solution.id}</span>
                    <span className={styles.solutionSection}>{solution.section}</span>
                    <span className={styles.solutionType}>{getTypeLabel(solution.type)}</span>
                  </div>
                </div>
                
                <div className={styles.solutionStatusSection}>
                  <span 
                    className={`${styles.statusBadge} ${styles.large}`}
                    style={{ backgroundColor: getStatusColor(solution.status) }}
                  >
                    {getStatusLabel(solution.status)}
                  </span>
                  <span 
                    className={`${styles.priorityBadge} ${styles.large}`}
                    style={{ backgroundColor: getPriorityColor(solution.priority) }}
                  >
                    {getPriorityLabel(solution.priority)}
                  </span>
                </div>
              </div>

              <div className={styles.solutionDescription}>
                <h4>Описание</h4>
                <p>{solution.description}</p>
              </div>

              <div className={styles.solutionDetailsGrid}>
                <div className={styles.detailCard}>
                  <h4>Основная информация</h4>
                  <div className={styles.detailItems}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Причина:</span>
                      <span>{solution.reason}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Создано:</span>
                      <span>{new Date(solution.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {solution.dueDate && (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Срок:</span>
                        <span>{new Date(solution.dueDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h4>Влияние на проект</h4>
                  <div className={styles.detailItems}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Стоимость:</span>
                      <span className={solution.cost > 0 ? 'cost-increase' : solution.cost < 0 ? 'cost-decrease' : ''}>
                        {formatCost(solution.cost)}
                      </span>
                    </div>
                    {solution.scheduleImpact > 0 && (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Задержка:</span>
                        <span className={styles.scheduleImpact}>+{solution.scheduleImpact} дн.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Прогресс согласования */}
              <div className={styles.approvalSection}>
                <h4>Согласование</h4>
                <div className={styles.approvalProgressDetailed}>
                  <div className={styles.progressSummary}>
                    <span>Прогресс: {getApprovalProgress().approved}/{getApprovalProgress().total}</span>
                    <span className={styles.progressPercentage}>{getApprovalProgress().percentage}%</span>
                  </div>
                  <div className={styles.participantsList}>
                    {solution.participants.map((participant, index) => (
                      <div key={index} className={styles.participantCard}>
                        <div className={styles.participantInfo}>
                          <div className={styles.participantName}>{participant.name}</div>
                          <div className={styles.participantRole}>{participantRoles.find(r => r.role === participant.role)?.label}</div>
                        </div>
                        <div className={styles.participantStatus}>
                          <span 
                            className={styles.statusIndicator}
                            style={{ backgroundColor: getStatusColor(participant.status) }}
                          >
                            {getStatusLabel(participant.status)}
                          </span>
                          {participant.approvedAt && (
                            <div className={styles.approvalDate}>
                              {new Date(participant.approvedAt).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                        {participant.comments && (
                          <div className={styles.participantComments}>
                            "{participant.comments}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Документы */}
              {solution.documents && solution.documents.length > 0 && (
                <div className={styles.documentsSection}>
                  <h4>Документы</h4>
                  <div className={styles.documentsList}>
                    {solution.documents.map((doc, index) => (
                      <div key={index} className={styles.documentItem}>
                        <div className={styles.documentIcon}>
                          <i className="fas fa-file"></i>
                        </div>
                        <div className={styles.documentInfo}>
                          <div className={styles.documentName}>{doc.name}</div>
                          <div className={styles.documentMeta}>
                            {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <button className={styles.downloadButton} title="Скачать">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TechnicalSolutionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  solution: PropTypes.object,
  isCreating: PropTypes.bool,
  participantRoles: PropTypes.array.isRequired,
  onSave: PropTypes.func
};

export default TechnicalSolutionModal;

