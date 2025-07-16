import React from 'react';
import PropTypes from 'prop-types';

function SheetsSection({ floors, onFloorClick, onAddSheet, onEditFloor, onDeleteFloor }) {
  return (
    <div className="sheets-section">
      <div className="sheets-header">
        <h3>Список этажей</h3>
        <button 
          className="btn btn-primary add-sheet-btn"
          onClick={onAddSheet}
        >
          <i className="fas fa-plus"></i>
          Добавить этаж
        </button>
      </div>
      
      <div className="sheets-content">
        <div className="floors-list">
          {floors.length === 0 ? (
            <div className="empty-floors-state">
              <div className="empty-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <h4>Список пуст</h4>
              <p>Пока не добавлено ни одного этажа. Нажмите кнопку "Добавить этаж" для начала работы.</p>
            </div>
          ) : (
            floors.map(floor => (
              <div key={floor.id} className="floor-item">
                <div className="floor-thumbnail" onClick={() => onFloorClick(floor)}>
                  <img src={floor.thumbnail} alt={floor.name} />
                  <div className="thumbnail-overlay">
                    <i className="fas fa-expand"></i>
                  </div>
                </div>
                
                <div className="floor-info">
                  <h4>{floor.name}</h4>
                  <p>{floor.description}</p>
                  <div className="floor-actions">
                    <button 
                      className="floor-edit-btn"
                      onClick={() => onEditFloor(floor.id)}
                      title="Редактировать этаж"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="floor-delete-btn"
                      onClick={() => onDeleteFloor(floor.id)}
                      title="Удалить этаж"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

SheetsSection.propTypes = {
  floors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string.isRequired
  })).isRequired,
  onFloorClick: PropTypes.func.isRequired,
  onAddSheet: PropTypes.func.isRequired,
  onEditFloor: PropTypes.func.isRequired,
  onDeleteFloor: PropTypes.func.isRequired
};

export default SheetsSection; 