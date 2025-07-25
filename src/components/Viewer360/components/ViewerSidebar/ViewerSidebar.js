import React from 'react';
import PropTypes from 'prop-types';
import styles from './ViewerSidebar.module.css';

const ViewerSidebar = ({ 
  isVisible, 
  fieldNotes = [], 
  onFieldNoteClick,
  onClose 
}) => {

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTruncatedDescription = (description, maxLength = 80) => {
    if (!description) return 'Без описания';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  };

  if (!isVisible) return null;

  return (
    <div className={styles.sidebarOverlay}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3>
            <i className="fas fa-sticky-note"></i>
            Полевые заметки
          </h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            title="Закрыть"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className={styles.content}>
          {fieldNotes.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="fas fa-sticky-note"></i>
              </div>
              <h4>Полевые заметки отсутствуют</h4>
              <p>
                Создайте полевую заметку, кликнув на изображение 360° 
                и выбрав режим создания заметки в верхней панели.
              </p>
            </div>
          ) : (
            <div className={styles.notesList}>
              {fieldNotes.map((note) => (
                <div 
                  key={note.id} 
                  className={styles.noteItem}
                  onClick={() => onFieldNoteClick(note)}
                >
                  <div className={styles.noteHeader}>
                    <div className={styles.noteAuthor}>
                      <i className="fas fa-user"></i>
                      <span>
                        {note.author?.firstName} {note.author?.lastName}
                      </span>
                    </div>
                    <div className={styles.noteDate}>
                      {formatDate(note.createdAt)}
                    </div>
                  </div>
                  
                  <div className={styles.noteDescription}>
                    {getTruncatedDescription(note.description)}
                  </div>
                  
                  <div className={styles.noteFooter}>
                    <div className={styles.leftFooter}>
                      {note.status && (
                        <div className={styles.noteStatus}>
                          <span 
                            className={styles.statusDot}
                            style={{ backgroundColor: note.status.color }}
                          ></span>
                          <span className={styles.statusName}>
                            {note.status.name}
                          </span>
                        </div>
                      )}
                      
                      {note.tags && note.tags.length > 0 && (
                        <div className={styles.noteTags}>
                          {note.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className={styles.moreTagsIndicator}>
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.noteTime}>
                      {formatTime(note.createdAt)}
                    </div>
                  </div>
                  
                  {note.dueDate && (
                    <div className={styles.noteDueDate}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>До: {formatDate(note.dueDate)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ViewerSidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  fieldNotes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    description: PropTypes.string,
    status: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    author: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    createdAt: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
  })),
  onFieldNoteClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ViewerSidebar.defaultProps = {
  fieldNotes: [],
};

export default ViewerSidebar; 