import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserData } from '../../../utils/userManager';
import styles from './ParticipantModal.module.css';

const ParticipantModal = ({ 
  isOpen, 
  onClose, 
  project, 
  currentUser = getUserData(),
  onAddParticipant 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'Зритель'
  });
  const [participants, setParticipants] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [participantDropdowns, setParticipantDropdowns] = useState({});
  const [tooltipVisible, setTooltipVisible] = useState(null);

  // Конфигурация ролей с описаниями
  const roleConfig = {
    'Зритель': {
      description: [
        'Можно только просматривать контент'
      ]
    },
    'Редактор': {
      description: [
        'Можно просматривать весь контент',
        'Можно создавать полевые отметки и снимки 360',
        'Могут редактировать только свои собственные полевые заметки'
      ]
    },
    'Администратор': {
      description: [
        'Можно просматривать весь контент',
        'Можно создавать полевые отметки и снимки 360',
        'Можно редактировать все полевые заметки',
        'Можно редактировать роли пользователей',
        'Можно редактировать настройки проекта'
      ]
    }
  };

  // Инициализация участников при открытии модального окна
  useEffect(() => {
    if (isOpen && project) {
      const initialParticipants = project.participants || [
        {
          id: 'current-user',
          email: currentUser.email,
          role: currentUser.role,
          name: currentUser.name
        }
      ];
      setParticipants(initialParticipants);
    }
  }, [isOpen, project, currentUser]);

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Закрытие дропдаунов при клике вне их
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.customRoleSelect}`)) {
        setIsRoleDropdownOpen(false);
        setParticipantDropdowns({});
      }
    };

    if (isRoleDropdownOpen || Object.values(participantDropdowns).some(Boolean)) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isRoleDropdownOpen, participantDropdowns]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
    setIsRoleDropdownOpen(false);
  };

  const handleParticipantDropdownToggle = (participantId) => {
    setParticipantDropdowns(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  const handleParticipantRoleSelect = (participantId, role) => {
    handleRoleChange(participantId, role);
    setParticipantDropdowns(prev => ({
      ...prev,
      [participantId]: false
    }));
  };

  const handleInviteParticipant = () => {
    if (!formData.email.trim()) {
      alert('Пожалуйста, введите email участника');
      return;
    }

    // Проверяем, что участник с таким email еще не добавлен
    const existingParticipant = participants.find(p => p.email === formData.email);
    if (existingParticipant) {
      alert('Участник с таким email уже добавлен в проект');
      return;
    }

    // Добавляем нового участника
    const newParticipant = {
      id: Date.now(),
      email: formData.email,
      role: formData.role,
      name: formData.email.split('@')[0]
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);

    // Вызываем callback для обновления проекта
    if (onAddParticipant) {
      onAddParticipant(project.id, newParticipant);
    }

    // Очищаем форму
    setFormData({
      email: '',
      role: 'Зритель'
    });
  };

  const handleRoleChange = (participantId, newRole) => {
    // Запрещаем изменение роли самому себе, если нет других администраторов
    const adminCount = participants.filter(p => p.role === 'Администратор').length;
    const currentParticipant = participants.find(p => p.id === participantId);
    
    if (currentParticipant?.email === currentUser.email && 
        currentParticipant?.role === 'Администратор' && 
        newRole !== 'Администратор' && 
        adminCount <= 1) {
      alert('Нельзя изменить роль последнего администратора');
      return;
    }

    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, role: newRole } : p
    );
    setParticipants(updatedParticipants);
  };

  const handleDeleteParticipant = (participantId) => {
    const participantToDelete = participants.find(p => p.id === participantId);
    
    // Запрещаем удаление самого себя
    if (participantToDelete?.email === currentUser.email) {
      alert('Нельзя удалить самого себя из проекта');
      return;
    }

    // Запрещаем удаление последнего администратора
    const adminCount = participants.filter(p => p.role === 'Администратор').length;
    if (participantToDelete?.role === 'Администратор' && adminCount <= 1) {
      alert('Нельзя удалить последнего администратора');
      return;
    }

    const updatedParticipants = participants.filter(p => p.id !== participantId);
    setParticipants(updatedParticipants);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTooltipToggle = (role, e) => {
    e.stopPropagation();
    setTooltipVisible(tooltipVisible === role ? null : role);
  };

  const handleTooltipEnter = (role) => {
    setTooltipVisible(role);
  };

  if (!isOpen) return null;

  const roleOptions = Object.keys(roleConfig);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${styles.participantModal}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className={styles.participantModalHeader}>
          <h3>Управление участниками</h3>
        </div>
        
        <div className={styles.participantModalBody}>
          {/* Информация о текущем пользователе */}
          <div className={styles.currentUserInfo}>
            <div className={styles.userName}>{currentUser.name}</div>
            <div className={styles.participantsCount}>
              Участников: {participants.length}
            </div>
          </div>

          {/* Разделитель */}
          <div className={styles.modalDivider}></div>

          {/* Форма добавления участника */}
          <div className={styles.addParticipantSection}>
            <h4>Добавить участника</h4>
            <div className={styles.addParticipantForm}>
              <input
                type="email"
                placeholder="Введите email участника"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={styles.participantEmailInput}
              />
              
              {/* Кастомный селект ролей */}
              <div className={styles.customRoleSelect}>
                <div 
                  className={styles.roleSelectTrigger}
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                >
                  <div className={styles.roleDisplay}>
                    <span>{formData.role}</span>
                  </div>
                  <div className={styles.roleHelpContainer}>
                    <i 
                      className={`fas fa-question-circle ${styles.helpIconMain}`}
                      onMouseEnter={() => handleTooltipEnter('main-select')}
                      onMouseLeave={() => setTooltipVisible(null)}
                      onClick={(e) => handleTooltipToggle('main-select', e)}
                    ></i>
                    {tooltipVisible === 'main-select' && (
                      <div className={`${styles.roleTooltip} ${styles.mainTooltip}`}>
                        <ul className={styles.tooltipList}>
                          {roleConfig[formData.role].description.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <i className={`fas fa-chevron-${isRoleDropdownOpen ? 'up' : 'down'} ${styles.chevronIcon}`}></i>
                  </div>
                </div>
                
                {isRoleDropdownOpen && (
                  <div className={styles.roleDropdown}>
                    {roleOptions.map(role => (
                      <div 
                        key={role}
                        className={`${styles.roleOption} ${formData.role === role ? styles.selected : ''}`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        <div className={styles.roleContent}>
                          <span>{role}</span>
                        </div>
                        <div className={styles.roleHelp}>
                          <i 
                            className={`fas fa-question-circle ${styles.helpIcon}`}
                            onMouseEnter={() => handleTooltipEnter(role)}
                            onMouseLeave={() => setTooltipVisible(null)}
                            onClick={(e) => handleTooltipToggle(role, e)}
                          ></i>
                          {tooltipVisible === role && (
                            <div className={styles.roleTooltip}>
                              <ul className={styles.tooltipList}>
                                {roleConfig[role].description.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className={`btn btn-primary ${styles.inviteBtn}`}
                onClick={handleInviteParticipant}
              >
                Пригласить
              </button>
            </div>
          </div>

          {/* Разделитель */}
          <div className={styles.modalDivider}></div>

          {/* Список участников */}
          <div className={styles.participantsListSection}>
            <h4>Участники проекта</h4>
            <div className={styles.participantsList}>
              {participants.map(participant => (
                <div key={participant.id} className={styles.participantItem}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantEmail}>{participant.email}</span>
                    {participant.email === currentUser.email && (
                      <span className={styles.currentUserBadge}>(Это вы)</span>
                    )}
                  </div>
                  <div className={styles.participantRole}>
                    {currentUser.role === 'Администратор' ? (
                      <div className={styles.participantAdminRole}>
                        {/* Кастомный селект для администратора */}
                        <div className={`${styles.customRoleSelect} ${styles.inline}`}>
                          <div 
                            className={styles.roleSelectTrigger}
                            onClick={() => handleParticipantDropdownToggle(participant.id)}
                          >
                            <div className={styles.roleDisplay}>
                              <span>{participant.role}</span>
                            </div>
                            <div className={styles.roleHelpContainer}>
                              <i 
                                className={`fas fa-question-circle ${styles.helpIconMain}`}
                                onMouseEnter={() => handleTooltipEnter(`admin-${participant.id}`)}
                                onMouseLeave={() => setTooltipVisible(null)}
                                onClick={(e) => handleTooltipToggle(`admin-${participant.id}`, e)}
                              ></i>
                              {tooltipVisible === `admin-${participant.id}` && (
                                <div className={`${styles.roleTooltip} ${styles.mainTooltip}`}>
                                  <ul className={styles.tooltipList}>
                                    {roleConfig[participant.role].description.map((item, index) => (
                                      <li key={index}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <i className={`fas fa-chevron-${participantDropdowns[participant.id] ? 'up' : 'down'} ${styles.chevronIcon}`}></i>
                            </div>
                          </div>
                          
                          {participantDropdowns[participant.id] && (
                            <div className={styles.roleDropdown}>
                              {roleOptions.map(role => (
                                <div 
                                  key={role}
                                  className={`${styles.roleOption} ${participant.role === role ? styles.selected : ''}`}
                                  onClick={() => handleParticipantRoleSelect(participant.id, role)}
                                >
                                  <div className={styles.roleContent}>
                                    <span>{role}</span>
                                  </div>
                                  <div className={styles.roleHelp}>
                                    <i 
                                      className={`fas fa-question-circle ${styles.helpIcon}`}
                                      onMouseEnter={() => handleTooltipEnter(`${role}-${participant.id}`)}
                                      onMouseLeave={() => setTooltipVisible(null)}
                                      onClick={(e) => handleTooltipToggle(`${role}-${participant.id}`, e)}
                                    ></i>
                                    {tooltipVisible === `${role}-${participant.id}` && (
                                      <div className={styles.roleTooltip}>
                                        <ul className={styles.tooltipList}>
                                          {roleConfig[role].description.map((item, index) => (
                                            <li key={index}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.participantRoleDisplay}>
                        <span className={styles.participantRoleText}>{participant.role}</span>
                        <div className={styles.roleHelp}>
                          <i 
                            className={`fas fa-question-circle ${styles.helpIcon}`}
                            onMouseEnter={() => handleTooltipEnter(`participant-${participant.id}`)}
                            onMouseLeave={() => setTooltipVisible(null)}
                            onClick={(e) => handleTooltipToggle(`participant-${participant.id}`, e)}
                          ></i>
                          {tooltipVisible === `participant-${participant.id}` && (
                            <div className={styles.roleTooltip}>
                              <ul className={styles.tooltipList}>
                                {roleConfig[participant.role].description.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Кнопка удаления участника */}
                    {currentUser.role === 'Администратор' && (
                      <button
                        className={styles.deleteParticipantBtn}
                        onClick={() => handleDeleteParticipant(participant.id)}
                        disabled={
                          participant.email === currentUser.email || 
                          (participant.role === 'Администратор' && participants.filter(p => p.role === 'Администратор').length <= 1)
                        }
                        title={
                          participant.email === currentUser.email 
                            ? 'Нельзя удалить самого себя' 
                            : participant.role === 'Администратор' && participants.filter(p => p.role === 'Администратор').length <= 1
                            ? 'Нельзя удалить последнего администратора'
                            : 'Удалить участника'
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ParticipantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.object,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }),
  onAddParticipant: PropTypes.func
};

export default ParticipantModal; 