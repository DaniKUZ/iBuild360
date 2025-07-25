import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserData } from '../../../utils/userManager';
import styles from './FieldNoteModal.module.css';

const FieldNoteModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  onDelete,
  notePosition, // { x, y } координаты клика на изображении
  screenshot, // скриншот с меткой
  schemePreview, // превью схемы
  project,
  photoDate, // дата когда был сделан снимок
  availableStatuses = [], // статусы из настроек проекта
  availableTags = [], // теги из настроек проекта
  editingNote = null // редактируемая заметка
}) => {
  const currentUser = getUserData();
  
  const [formData, setFormData] = useState({
    description: editingNote?.description || '',
    status: editingNote?.status || null, // null означает "без статуса"
    tags: editingNote?.tags || [],
    dueDate: editingNote?.dueDate || new Date().toISOString().split('T')[0], // по умолчанию сегодня
    position: notePosition
  });

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

  useEffect(() => {
    if (notePosition) {
      setFormData(prev => ({
        ...prev,
        position: notePosition
      }));
    }
  }, [notePosition]);

  // Обновляем форму при изменении редактируемой заметки
  useEffect(() => {
    if (editingNote) {
      setFormData({
        description: editingNote.description || '',
        status: editingNote.status || null,
        tags: editingNote.tags || [],
        dueDate: editingNote.dueDate || new Date().toISOString().split('T')[0],
        position: editingNote.position || notePosition
      });
    } else {
      setFormData({
        description: '',
        status: null,
        tags: [],
        dueDate: new Date().toISOString().split('T')[0],
        position: notePosition
      });
    }
  }, [editingNote, notePosition]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({
      ...prev,
      status: status
    }));
    setIsStatusDropdownOpen(false);
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSave = () => {
    const noteData = {
      ...formData,
      id: editingNote?.id || Date.now(), // сохраняем ID или создаем новый
      author: editingNote?.author || currentUser,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: editingNote ? new Date().toISOString() : undefined, // добавляем время обновления для существующих заметок
      photoDate: photoDate,
      screenshot: screenshot
    };
    
    onSave(noteData);
    onClose();
  };

  const handleDelete = () => {
    if (editingNote && onDelete) {
      onDelete();
    } else {
      // Для новой заметки удаление просто закрывает модал
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${styles.fieldNoteModal}`} onClick={(e) => e.stopPropagation()}>
        {/* Шапка модального окна */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!formData.description.trim()}
            >
              <i className="fas fa-save"></i>
              {editingNote ? 'Обновить' : 'Сохранить'}
            </button>
            <button 
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              <i className="fas fa-trash"></i>
              {editingNote ? 'Удалить' : 'Отмена'}
            </button>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className={styles.photoDate}>
                {new Date(photoDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
          
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Основное содержимое */}
        <div className={styles.modalBody}>
          {/* Левая часть */}
          <div className={styles.leftSection}>
            {/* Превью схемы */}
            <div className={styles.schemePreview}>
              <h4>Схема</h4>
              <div className={styles.schemeImageContainer}>
                {schemePreview ? (
                  <img 
                    src={schemePreview} 
                    alt="Схема" 
                    className={styles.schemeImage}
                  />
                ) : (
                  <div className={styles.noScheme}>
                    <i className="fas fa-image"></i>
                    <span>Схема недоступна</span>
                  </div>
                )}
              </div>
            </div>

            {/* Селект статуса */}
            <div className={styles.formGroup}>
              <label>Статус</label>
              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={`${styles.dropdownToggle} ${formData.status ? '' : styles.noStatus}`}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <div className={styles.statusContent}>
                    {formData.status ? (
                      <>
                        <div 
                          className={styles.statusColor}
                          style={{ backgroundColor: formData.status.color }}
                        ></div>
                        <span>{formData.status.name}</span>
                      </>
                    ) : (
                      <>
                        <div className={styles.statusColor}></div>
                        <span>Без статуса</span>
                      </>
                    )}
                  </div>
                  <i className={`fas fa-chevron-down ${isStatusDropdownOpen ? styles.rotated : ''}`}></i>
                </button>
                
                {isStatusDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${!formData.status ? styles.selected : ''}`}
                      onClick={() => handleStatusSelect(null)}
                    >
                      <div className={styles.statusColor}></div>
                      <span>Без статуса</span>
                    </button>
                    {availableStatuses.map(status => (
                      <button
                        key={status.id}
                        type="button"
                        className={`${styles.dropdownItem} ${formData.status?.id === status.id ? styles.selected : ''}`}
                        onClick={() => handleStatusSelect(status)}
                      >
                        <div 
                          className={styles.statusColor}
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span>{status.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Селект тегов */}
            <div className={styles.formGroup}>
              <label>Теги</label>
              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownToggle}
                  onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                >
                  <span>
                    {formData.tags.length > 0 
                      ? `Выбрано: ${formData.tags.length}` 
                      : 'Выберите теги'
                    }
                  </span>
                  <i className={`fas fa-chevron-down ${isTagsDropdownOpen ? styles.rotated : ''}`}></i>
                </button>
                
                {isTagsDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.dropdownItem} ${formData.tags.includes(tag) ? styles.selected : ''}`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        <i className={`fas ${formData.tags.includes(tag) ? 'fa-check-square' : 'fa-square'}`}></i>
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Отображение выбранных тегов */}
              {formData.tags.length > 0 && (
                <div className={styles.selectedTags}>
                  {formData.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={styles.tagRemove}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Дата исполнения */}
            <div className={styles.formGroup}>
              <label htmlFor="dueDate">Срок исполнения</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={styles.dateInput}
              />
            </div>
          </div>

          {/* Правая часть */}
          <div className={styles.rightSection}>
            {/* Превью скриншота */}
            <div className={styles.screenshotPreview}>
              <h4>Превью</h4>
              <div className={styles.screenshotContainer}>
                {screenshot ? (
                  <img 
                    src={screenshot} 
                    alt="Скриншот с меткой" 
                    className={styles.screenshotImage}
                  />
                ) : (
                  <div className={styles.noScreenshot}>
                    <i className="fas fa-image"></i>
                    <span>Скриншот недоступен</span>
                  </div>
                )}
              </div>
            </div>

            {/* Описание */}
            <div className={styles.formGroup}>
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Введите описание полевой заметки..."
                className={styles.descriptionTextarea}
                rows={6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FieldNoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  notePosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  screenshot: PropTypes.string,
  schemePreview: PropTypes.string,
  project: PropTypes.object,
  photoDate: PropTypes.string,
  availableStatuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  availableTags: PropTypes.arrayOf(PropTypes.string),
  editingNote: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    status: PropTypes.object,
    tags: PropTypes.arrayOf(PropTypes.string),
    dueDate: PropTypes.string,
    position: PropTypes.object,
    author: PropTypes.object,
    createdAt: PropTypes.string
  })
};

FieldNoteModal.defaultProps = {
  availableStatuses: [],
  availableTags: [],
  photoDate: new Date().toISOString()
};

export default FieldNoteModal; 