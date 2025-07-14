import { useState, useCallback } from 'react';

function useFloorManagement() {
  const [floors, setFloors] = useState([
    {
      id: 1,
      name: 'Первый этаж',
      thumbnail: require('../../../data/img/scheme.jpeg'),
      fullImage: require('../../../data/img/scheme.jpeg'),
      description: 'Главный этаж с входной зоной'
    },
    {
      id: 2,
      name: 'Второй этаж',
      thumbnail: require('../../../data/img/scheme.jpeg'),
      fullImage: require('../../../data/img/scheme.jpeg'),
      description: 'Жилая зона'
    },
    {
      id: 3,
      name: 'Подвал',
      thumbnail: require('../../../data/img/scheme.jpeg'),
      fullImage: require('../../../data/img/scheme.jpeg'),
      description: 'Техническое помещение'
    }
  ]);

  const [floorFormData, setFloorFormData] = useState({
    name: '',
    description: '',
    image: null
  });

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

  const handleFloorFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFloorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

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
    if (!floorFormData.name.trim()) {
      alert('Название этажа не может быть пустым');
      return;
    }

    const updatedFloors = floors.map(floor => {
      if (floor.id === editingFloor.id) {
        return {
          ...floor,
          name: floorFormData.name,
          description: floorFormData.description,
          thumbnail: floorFormData.image || floor.thumbnail,
          fullImage: floorFormData.image || floor.fullImage
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
  }, [floorFormData, editingFloor, floors]);

  const handleSaveNewFloor = useCallback(() => {
    if (!floorFormData.name.trim()) {
      alert('Название этажа не может быть пустым');
      return;
    }

    const newFloor = {
      id: Date.now(),
      name: floorFormData.name,
      thumbnail: floorFormData.image || require('../../../data/img/plug_img.jpeg'),
      fullImage: floorFormData.image || require('../../../data/img/plug_img.jpeg'),
      description: floorFormData.description
    };

    setFloors(prev => [...prev, newFloor]);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
  }, [floorFormData]);

  const handleCancelFloorEdit = useCallback(() => {
    setEditingFloor(null);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
  }, []);

  return {
    floors,
    floorFormData,
    selectedFloor,
    editingFloor,
    addingFloor,
    handleFloorClick,
    handleCloseModal,
    handleAddSheet,
    handleEditFloor,
    handleDeleteFloor,
    handleFloorFormChange,
    handleFloorImageChange,
    handleSaveFloor,
    handleSaveNewFloor,
    handleCancelFloorEdit
  };
}

export default useFloorManagement; 