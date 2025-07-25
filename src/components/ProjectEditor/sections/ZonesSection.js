import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import SchemeViewer from './components/SchemeViewer';

const ZonesSection = ({ floors = [], onFloorsUpdate }) => {
  const [selectedFloorId, setSelectedFloorId] = useState(floors.length > 0 ? floors[0].id : null);
  const [creatingZone, setCreatingZone] = useState(false);
  const [pendingZone, setPendingZone] = useState(null); // Зона ожидающая названия
  const [editingZone, setEditingZone] = useState(null); // Зона в режиме редактирования
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneError, setNewZoneError] = useState('');

  const selectedFloor = floors.find(floor => floor.id === selectedFloorId);
  const zones = selectedFloor?.zones || [];

  const handleFloorChange = useCallback((e) => {
    setSelectedFloorId(Number(e.target.value));
    setCreatingZone(false);
    setPendingZone(null);
    setEditingZone(null);
    setNewZoneName('');
    setNewZoneError('');
  }, []);

  const handleCreateNewZone = useCallback(() => {
    setCreatingZone(true);
    setPendingZone(null);
    setEditingZone(null);
    setNewZoneName('');
    setNewZoneError('');
  }, []);

  const handleEditZone = useCallback((zone) => {
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setCreatingZone(false);
    setPendingZone(null);
    setNewZoneError('');
  }, []);

  const handleZoneNameChange = useCallback((e) => {
    setNewZoneName(e.target.value);
    if (newZoneError) {
      setNewZoneError('');
    }
  }, [newZoneError]);

  // Очищаем pending зону при сохранении
  const handleZoneAreaSelected = useCallback((zoneCoordinates) => {
    setPendingZone(zoneCoordinates);
    setCreatingZone(false); // Отключаем режим рисования
    setNewZoneName(''); // Очищаем поле для ввода нового названия
    setNewZoneError('');
  }, []);

  // Сохранение новой зоны с названием
  const handleSaveZone = useCallback(() => {
    if (!newZoneName.trim()) {
      setNewZoneError('Название зоны обязательно для заполнения');
      return;
    }

    if (editingZone) {
      // Редактируем существующую зону
      const updatedFloors = floors.map(floor => {
        if (floor.id === selectedFloorId) {
          return {
            ...floor,
            zones: (floor.zones || []).map(zone => 
              zone.id === editingZone.id 
                ? { ...zone, name: newZoneName.trim() }
                : zone
            )
          };
        }
        return floor;
      });

      onFloorsUpdate(updatedFloors);
      setEditingZone(null);
    } else if (pendingZone) {
      // Создаем новую зону
      const projectBlue = '#3B82F6';

      const newZone = {
        id: Date.now(),
        name: newZoneName.trim(),
        coordinates: pendingZone,
        color: projectBlue
      };

      const updatedFloors = floors.map(floor => {
        if (floor.id === selectedFloorId) {
          return {
            ...floor,
            zones: [...(floor.zones || []), newZone]
          };
        }
        return floor;
      });

      onFloorsUpdate(updatedFloors);
      setPendingZone(null);
    }

    setNewZoneName('');
    setNewZoneError('');
  }, [newZoneName, selectedFloorId, floors, onFloorsUpdate, pendingZone, editingZone]);

  const handleCancelZone = useCallback(() => {
    setCreatingZone(false);
    setPendingZone(null);
    setEditingZone(null);
    setNewZoneName('');
    setNewZoneError('');
  }, []);

  const handleDeleteZone = useCallback((zoneId) => {
    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloorId) {
        return {
          ...floor,
          zones: (floor.zones || []).filter(zone => zone.id !== zoneId)
        };
      }
      return floor;
    });

    onFloorsUpdate(updatedFloors);
  }, [selectedFloorId, floors, onFloorsUpdate]);

  if (floors.length === 0) {
    return (
      <div className="zones-section">
        <div className="empty-floors-message">
          <div className="empty-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <h4>Нет доступных схем</h4>
          <p>Сначала добавьте схемы в секции "Схемы", чтобы начать работу с зонами.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zones-section">
      <div className="zones-container">
        <div className="zones-sidebar">
          <div className="zones-header">
            <h3>Зоны</h3>
          </div>

          <div className="scheme-selector">
            <label htmlFor="floor-select">Выберите схему:</label>
            <select
              id="floor-select"
              value={selectedFloorId || ''}
              onChange={handleFloorChange}
              className="scheme-select"
            >
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="zones-list">
            {zones.length === 0 && !pendingZone && !editingZone ? (
              <div className="empty-zones">
                <p>На этой схеме еще нет зон</p>
              </div>
            ) : null}

            {zones.map(zone => (
              <div key={zone.id} className="zone-item">
                <div 
                  className="zone-color" 
                  style={{ backgroundColor: zone.color }}
                />
                <span className="zone-name">{zone.name}</span>
                <div className="zone-actions">
                  <button
                    className="zone-edit-btn"
                    onClick={() => handleEditZone(zone)}
                    title="Редактировать зону"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="zone-delete-btn"
                    onClick={() => handleDeleteZone(zone.id)}
                    title="Удалить зону"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}

            {(pendingZone || editingZone) && (
              <div className="zone-creation">
                <div className="zone-creation-header">
                  <i className="fas fa-tag"></i>
                  <span>
                    {editingZone ? 'Редактирование зоны:' : 'Дайте название новой зоне:'}
                  </span>
                </div>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={handleZoneNameChange}
                  placeholder="Название зоны"
                  className={`zone-name-input ${newZoneError ? 'error' : ''}`}
                  autoFocus
                />
                {newZoneError && (
                  <div className="zone-error">{newZoneError}</div>
                )}
                <div className="zone-actions">
                  <button
                    className="zone-save-btn"
                    onClick={handleSaveZone}
                    title="Сохранить зону"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button
                    className="zone-cancel-btn"
                    onClick={handleCancelZone}
                    title="Отменить"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}

            {!creatingZone && !pendingZone && !editingZone && (
              <button 
                className="new-zone-btn"
                onClick={handleCreateNewZone}
              >
                <i className="fas fa-plus"></i>
                Новая зона
              </button>
            )}
          </div>
        </div>

        <div className="scheme-viewer-container">
          {selectedFloor && (
            <SchemeViewer
              floor={{ ...selectedFloor, zones: selectedFloor.zones || [] }}
              creatingZone={creatingZone}
              onZoneCreated={handleZoneAreaSelected}
              onCancelZone={handleCancelZone}
            />
          )}
        </div>
      </div>
    </div>
  );
};

ZonesSection.propTypes = {
  floors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    fullImage: PropTypes.string.isRequired,
    zones: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      coordinates: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      }).isRequired,
      color: PropTypes.string.isRequired
    }))
  })),
  onFloorsUpdate: PropTypes.func.isRequired
};

export default ZonesSection; 