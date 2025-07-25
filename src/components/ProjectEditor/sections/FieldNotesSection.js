import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_TAGS = [
  'Архитектурный',
  'BIM-сравнение',
  'Гражданский',
  'Конкретный',
  'Снос',
  'Документ',
  'Гипсокартон',
  'Электрические',
  'Лифт',
  'Относящийся к окружающей среде',
  'Оборудование',
  'Пожарная сигнализация',
  'Противопожарная защита',
  'Служба общественного питания',
  'Обрамление',
  'Общий'
];

const DEFAULT_STATUSES = [
  { id: 1, name: 'Приоритет1', color: '#e53e3e' },
  { id: 2, name: 'Приоритет2', color: '#f56500' },
  { id: 3, name: 'Приоритет3', color: '#d69e2e' },
  { id: 4, name: 'Закрыто', color: '#38a169' },
  { id: 5, name: 'Проверено', color: '#3182ce' },
  { id: 6, name: 'В ходе выполнения', color: '#805ad5' }
];

function FieldNotesSection({ 
  tags = DEFAULT_TAGS, 
  statuses = DEFAULT_STATUSES, 
  onTagsUpdate, 
  onStatusesUpdate 
}) {
  const [localTags, setLocalTags] = useState(tags);
  const [localStatuses, setLocalStatuses] = useState(statuses);
  const [newTag, setNewTag] = useState('');
  const [newStatus, setNewStatus] = useState({ name: '', color: '#667eea' });
  const [editingTag, setEditingTag] = useState(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingStatusData, setEditingStatusData] = useState({ name: '', color: '' });
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddStatus, setShowAddStatus] = useState(false);

  // Функции для работы с тегами
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      // Если тег пустой, просто закрываем форму
      setNewTag('');
      setShowAddTag(false);
      return;
    }
    
    if (localTags.includes(trimmedTag)) {
      // Если тег уже существует, показываем предупреждение
      alert('Тег с таким названием уже существует');
      return;
    }
    
    // Добавляем новый тег
    const updatedTags = [...localTags, trimmedTag];
    setLocalTags(updatedTags);
    setNewTag('');
    setShowAddTag(false);
    onTagsUpdate?.(updatedTags);
  };

  const handleStartEditTag = (index, currentValue) => {
    setEditingTag(index);
    setEditingTagValue(currentValue);
  };

  const handleSaveTagEdit = (index) => {
    const trimmedTag = editingTagValue.trim();
    const originalTag = localTags[index];
    
    if (!trimmedTag) {
      // Если тег пустой, отменяем редактирование
      handleCancelTagEdit();
      return;
    }
    
    if (trimmedTag === originalTag) {
      // Если ничего не изменилось, просто закрываем редактирование
      handleCancelTagEdit();
      return;
    }
    
    if (localTags.includes(trimmedTag)) {
      // Если тег уже существует, показываем предупреждение
      alert('Тег с таким названием уже существует');
      return;
    }
    
    // Сохраняем изменения
    const updatedTags = [...localTags];
    updatedTags[index] = trimmedTag;
    setLocalTags(updatedTags);
    setEditingTag(null);
    setEditingTagValue('');
    onTagsUpdate?.(updatedTags);
  };

  const handleCancelTagEdit = () => {
    setEditingTag(null);
    setEditingTagValue('');
  };

  const handleDeleteTag = (index) => {
    const updatedTags = localTags.filter((_, i) => i !== index);
    setLocalTags(updatedTags);
    onTagsUpdate?.(updatedTags);
  };

  // Функции для работы со статусами
  const handleAddStatus = () => {
    const trimmedName = newStatus.name.trim();
    
    if (!trimmedName) {
      // Если название пустое, просто закрываем форму
      setNewStatus({ name: '', color: '#667eea' });
      setShowAddStatus(false);
      return;
    }
    
    if (localStatuses.some(status => status.name === trimmedName)) {
      // Если статус уже существует, показываем предупреждение
      alert('Статус с таким названием уже существует');
      return;
    }
    
    // Добавляем новый статус
    const newStatusObj = {
      id: Date.now(),
      name: trimmedName,
      color: newStatus.color
    };
    const updatedStatuses = [...localStatuses, newStatusObj];
    setLocalStatuses(updatedStatuses);
    setNewStatus({ name: '', color: '#667eea' });
    setShowAddStatus(false);
    onStatusesUpdate?.(updatedStatuses);
  };

  const handleStartEditStatus = (status) => {
    setEditingStatus(status.id);
    setEditingStatusData({ name: status.name, color: status.color });
  };

  const handleSaveStatusEdit = () => {
    const trimmedName = editingStatusData.name.trim();
    const currentStatus = localStatuses.find(status => status.id === editingStatus);
    
    if (!trimmedName) {
      // Если название пустое, отменяем редактирование
      handleCancelStatusEdit();
      return;
    }
    
    if (trimmedName === currentStatus.name && editingStatusData.color === currentStatus.color) {
      // Если ничего не изменилось, просто закрываем редактирование
      handleCancelStatusEdit();
      return;
    }
    
    if (localStatuses.some(status => status.name === trimmedName && status.id !== editingStatus)) {
      // Если статус с таким названием уже существует, показываем предупреждение
      alert('Статус с таким названием уже существует');
      return;
    }
    
    // Сохраняем изменения
    const updatedStatuses = localStatuses.map(status => 
      status.id === editingStatus 
        ? { ...status, name: trimmedName, color: editingStatusData.color }
        : status
    );
    setLocalStatuses(updatedStatuses);
    setEditingStatus(null);
    setEditingStatusData({ name: '', color: '' });
    onStatusesUpdate?.(updatedStatuses);
  };

  const handleCancelStatusEdit = () => {
    setEditingStatus(null);
    setEditingStatusData({ name: '', color: '' });
  };

  const handleDeleteStatus = (id) => {
    const updatedStatuses = localStatuses.filter(status => status.id !== id);
    setLocalStatuses(updatedStatuses);
    onStatusesUpdate?.(updatedStatuses);
  };

  return (
    <div className="field-notes-section">
      {/* Основной заголовок */}
      <div className="field-notes-header">
        <h3>
          <i className="fas fa-sticky-note"></i>
          Полевые заметки
        </h3>
      </div>

      {/* Секция тегов */}
      <div className="field-notes-content">
        <div className="field-notes-subsection">
          <div className="subsection-header">
            <h4>Теги</h4>
            <p className="subsection-description">
              Теги используются для маркировки полевых заметок.
            </p>
          </div>
          
          <div className="tags-container">
            <div className="tags-grid">
              {localTags.map((tag, index) => (
                <div key={index} className="tag-item">
                  {editingTag === index ? (
                    <div className="tag-edit">
                      <input
                        type="text"
                        value={editingTagValue}
                        onChange={(e) => setEditingTagValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveTagEdit(index);
                          if (e.key === 'Escape') handleCancelTagEdit();
                        }}
                        autoFocus
                      />
                      <div className="tag-actions">
                        <button
                          type="button"
                          className="btn-icon save"
                          onClick={() => handleSaveTagEdit(index)}
                          title="Сохранить изменения"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-icon cancel"
                          onClick={handleCancelTagEdit}
                          title="Отменить изменения"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="tag-name">{tag}</span>
                      <div className="tag-actions">
                        <button
                          type="button"
                          className="btn-icon edit"
                          onClick={() => handleStartEditTag(index, tag)}
                          title="Редактировать тег"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => handleDeleteTag(index)}
                          title="Удалить тег"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Кнопка добавления нового тега */}
              {showAddTag ? (
                <div className="tag-item add-new">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') {
                        setNewTag('');
                        setShowAddTag(false);
                      }
                    }}
                    placeholder="Название тега"
                    autoFocus
                  />
                  <div className="tag-actions">
                    <button
                      type="button"
                      className="btn-icon save"
                      onClick={handleAddTag}
                      title="Сохранить тег"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      type="button"
                      className="btn-icon cancel"
                      onClick={() => {
                        setNewTag('');
                        setShowAddTag(false);
                      }}
                      title="Отменить"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="tag-item add-button"
                  onClick={() => setShowAddTag(true)}
                  title="Добавить новый тег"
                >
                  <i className="fas fa-plus"></i>
                  <span>Добавить тег</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Секция статусов */}
        <div className="field-notes-subsection">
          <div className="subsection-header">
            <h4>Статус</h4>
            <p className="subsection-description">
              Статусы используются для отображения хода выполнения полевых заметок.
              <br />
              Вы можете настроить метки статусов и порядок их отображения в раскрывающемся списке в полевых заметках.
            </p>
          </div>
          
          <div className="statuses-container">
            <div className="statuses-list">
              {localStatuses.map((status) => (
                <div key={status.id} className="status-item">
                  {editingStatus === status.id ? (
                    <div className="status-edit">
                      <div className="status-edit-controls">
                        <input
                          type="text"
                          value={editingStatusData.name}
                          onChange={(e) => setEditingStatusData(prev => ({ ...prev, name: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveStatusEdit();
                            if (e.key === 'Escape') handleCancelStatusEdit();
                          }}
                          autoFocus
                        />
                        <input
                          type="color"
                          value={editingStatusData.color}
                          onChange={(e) => setEditingStatusData(prev => ({ ...prev, color: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="btn-icon save"
                          onClick={handleSaveStatusEdit}
                          title="Сохранить изменения"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-icon cancel"
                          onClick={handleCancelStatusEdit}
                          title="Отменить изменения"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="status-indicator" style={{ backgroundColor: status.color }}></div>
                      <span className="status-name">{status.name}</span>
                      <div className="status-actions">
                        <button
                          type="button"
                          className="btn-icon edit"
                          onClick={() => handleStartEditStatus(status)}
                          title="Редактировать статус"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => handleDeleteStatus(status.id)}
                          title="Удалить статус"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Добавление нового статуса */}
              {showAddStatus ? (
                <div className="status-item add-new">
                  <div className="status-edit-controls">
                    <input
                      type="text"
                      value={newStatus.name}
                      onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Название статуса"
                      autoFocus
                    />
                    <input
                      type="color"
                      value={newStatus.color}
                      onChange={(e) => setNewStatus(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="btn-icon save"
                      onClick={handleAddStatus}
                      title="Сохранить статус"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      type="button"
                      className="btn-icon cancel"
                      onClick={() => setShowAddStatus(false)}
                      title="Отменить"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="status-item add-button"
                  onClick={() => setShowAddStatus(true)}
                  title="Добавить новый статус"
                >
                  <i className="fas fa-plus"></i>
                  <span>Добавить статус</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FieldNotesSection.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })),
  onTagsUpdate: PropTypes.func,
  onStatusesUpdate: PropTypes.func,
};

export default FieldNotesSection; 