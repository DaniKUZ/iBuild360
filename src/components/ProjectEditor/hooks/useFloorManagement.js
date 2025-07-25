import { useState, useCallback } from 'react';

function useFloorManagement(initialFloors = []) {
  const [floors, setFloors] = useState(initialFloors);

  const [floorFormData, setFloorFormData] = useState({
    name: '',
    description: '',
    image: null
  });

  const [floorErrors, setFloorErrors] = useState({});
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [addingFloor, setAddingFloor] = useState(false);

  const handleFloorClick = useCallback((floor) => {
    setSelectedFloor(floor);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFloor(null);
  }, []);

  const handleAddSheet = useCallback(() => {
    setAddingFloor(true);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    setFloorErrors({});
  }, []);

  const handleEditFloor = useCallback((floorId) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      setEditingFloor(floor);
      setFloorFormData({
        name: floor.name,
        description: floor.description,
        image: null
      });
      setFloorErrors({});
    }
  }, [floors]);

  const handleDeleteFloor = useCallback((floorId) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      const isConfirmed = window.confirm(
        `Вы уверены, что хотите удалить этаж "${floor.name}"? Это действие нельзя отменить.`
      );
      if (isConfirmed) {
        setFloors(prevFloors => prevFloors.filter(f => f.id !== floorId));
      }
    }
  }, [floors]);

  const validateFloorField = useCallback((fieldName, value) => {
    const errors = {};
    
    if (fieldName === 'name') {
      if (!value.trim()) {
        errors.name = 'Название этажа обязательно для заполнения';
      } else if (value.trim().length < 3) {
        errors.name = 'Название этажа должно содержать минимум 3 символа';
      }
    }
    
    return errors;
  }, []);

  const handleFloorFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFloorFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Убираем ошибку при изменении поля
    if (floorErrors[name]) {
      setFloorErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [floorErrors]);

  const handleFloorBlur = useCallback((e) => {
    const { name, value } = e.target;
    const fieldErrors = validateFloorField(name, value);
    
    setFloorErrors(prev => ({
      ...prev,
      ...fieldErrors,
      // Убираем ошибку для этого поля, если валидация прошла успешно
      ...(Object.keys(fieldErrors).length === 0 && { [name]: '' })
    }));
  }, [validateFloorField]);

  const handleFloorImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFloorFormData(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveFloor = useCallback(() => {
    const validationErrors = validateFloorField('name', floorFormData.name);
    if (Object.keys(validationErrors).length > 0) {
      setFloorErrors(validationErrors);
      return;
    }

    const updatedFloors = floors.map(floor => {
      if (floor.id === editingFloor.id) {
        return {
          ...floor,
          name: floorFormData.name,
          description: floorFormData.description,
          thumbnail: floorFormData.image || floor.thumbnail,
          fullImage: floorFormData.image || floor.fullImage,
          zones: floor.zones || []
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setEditingFloor(null);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    setFloorErrors({});
  }, [floorFormData, editingFloor, floors, validateFloorField]);

  const handleSaveNewFloor = useCallback(() => {
    const validationErrors = validateFloorField('name', floorFormData.name);
    if (Object.keys(validationErrors).length > 0) {
      setFloorErrors(validationErrors);
      return;
    }

    const newFloor = {
      id: Date.now(),
      name: floorFormData.name,
      thumbnail: floorFormData.image || require('../../../data/img/plug_img.jpeg'),
      fullImage: floorFormData.image || require('../../../data/img/plug_img.jpeg'),
      description: floorFormData.description,
      zones: []
    };

    setFloors(prev => [...prev, newFloor]);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    setFloorErrors({});
  }, [floorFormData, validateFloorField]);

  const handleCancelFloorEdit = useCallback(() => {
    setEditingFloor(null);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    setFloorErrors({});
  }, []);

  const updateFloors = useCallback((updatedFloors) => {
    setFloors(updatedFloors);
  }, []);

  return {
    floors,
    floorFormData,
    floorErrors,
    selectedFloor,
    editingFloor,
    addingFloor,
    handleFloorClick,
    handleCloseModal,
    handleAddSheet,
    handleEditFloor,
    handleDeleteFloor,
    handleFloorFormChange,
    handleFloorBlur,
    handleFloorImageChange,
    handleSaveFloor,
    handleSaveNewFloor,
    handleCancelFloorEdit,
    updateFloors
  };
}

export default useFloorManagement; 