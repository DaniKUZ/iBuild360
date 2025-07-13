import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { projectStatuses } from '../data/mockData';

function ProjectEditor({ project, onBack }) {
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    latitude: '',
    longitude: '',
    status: ''
  });

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('general');
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [addingFloor, setAddingFloor] = useState(false);
  const [floorFormData, setFloorFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 });
  const [previewDragging, setPreviewDragging] = useState(false);
  const [previewDragStart, setPreviewDragStart] = useState({ x: 0, y: 0 });

  // Моковые данные для этажей - исправил пути к изображениям
  const [floors, setFloors] = useState([
    {
      id: 1,
      name: 'Первый этаж',
      thumbnail: require('../data/img/scheme.jpeg'),
      fullImage: require('../data/img/scheme.jpeg'),
      description: 'Главный этаж с входной зоной'
    },
    {
      id: 2,
      name: 'Второй этаж',
      thumbnail: require('../data/img/scheme.jpeg'),
      fullImage: require('../data/img/scheme.jpeg'),
      description: 'Жилая зона'
    },
    {
      id: 3,
      name: 'Подвал',
      thumbnail: require('../data/img/scheme.jpeg'),
      fullImage: require('../data/img/scheme.jpeg'),
      description: 'Техническое помещение'
    }
  ]);

  // Состояние для BIM раздела
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Ref для хранения активных интервалов
  const activeIntervals = useRef(new Set());
  // Map для связи файлов и их интервалов
  const fileIntervals = useRef(new Map());
  // Ref для input загрузки изображения
  const imageInputRef = useRef(null);

  const sections = [
    {
      id: 'general',
      title: 'Общая информация',
      icon: 'fas fa-info-circle',
      active: true
    },
    {
      id: 'sheets',
      title: 'Список этажей',
      icon: 'fas fa-layer-group',
      active: true
    },
    {
      id: 'bim',
      title: 'Загрузка BIM',
      icon: 'fas fa-cube',
      active: true
    }
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        propertyName: project.name || '',
        address: project.address || '',
        latitude: project.latitude || '',
        longitude: project.longitude || '',
        status: project.status || ''
      });
    }
  }, [project]);

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    if (selectedFloor || editingFloor || addingFloor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedFloor, editingFloor, addingFloor]);

  // Очищаем все активные интервалы при размонтировании компонента
  useEffect(() => {
    return () => {
      activeIntervals.current.forEach(interval => {
        clearInterval(interval);
      });
      activeIntervals.current.clear();
      fileIntervals.current.clear();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Убираем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Название объекта обязательно';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeSection === 'general') {
      if (validateForm()) {
        console.log('Form data:', formData);
        setActiveSection('sheets');
      }
    } else if (activeSection === 'sheets') {
      setActiveSection('bim');
    } else if (activeSection === 'bim') {
      // Здесь будет логика завершения и сохранения проекта
      console.log('Проект завершен');
      onBack(); // Возвращаемся к списку проектов
    }
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    if (activeSection === 'sheets') {
      setActiveSection('general');
    } else if (activeSection === 'bim') {
      setActiveSection('sheets');
    } else {
      onBack(); // Возвращаемся к списку проектов
    }
  };

  const handleFloorClick = (floor) => {
    setSelectedFloor(floor);
  };

  const handleCloseModal = () => {
    setSelectedFloor(null);
    // Сбрасываем зум и позицию превью
    setPreviewZoom(1);
    setPreviewPan({ x: 0, y: 0 });
  };

  const handleAddSheet = () => {
    setAddingFloor(true);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
  };

  const handleEditFloor = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      setEditingFloor(floor);
      setFloorFormData({
        name: floor.name,
        description: floor.description,
        image: null
      });
    }
  };

  const handleDeleteFloor = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      const isConfirmed = window.confirm(`Вы уверены, что хотите удалить этаж "${floor.name}"? Это действие нельзя отменить.`);
      if (isConfirmed) {
        setFloors(prevFloors => prevFloors.filter(f => f.id !== floorId));
      }
    }
  };

  const handleFloorFormChange = (e) => {
    const { name, value } = e.target;
    setFloorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFloorImageChange = (e) => {
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
  };

  const handleSaveFloor = () => {
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
  };

  const handleCancelFloorEdit = () => {
    setEditingFloor(null);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    // Сбрасываем зум и позицию
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const handleSaveNewFloor = () => {
    if (!floorFormData.name.trim()) {
      alert('Название этажа не может быть пустым');
      return;
    }

    const newFloor = {
      id: Date.now(),
      name: floorFormData.name,
      thumbnail: floorFormData.image || require('../data/img/plug_img.jpeg'),
      fullImage: floorFormData.image || require('../data/img/plug_img.jpeg'),
      description: floorFormData.description
    };

    setFloors(prev => [...prev, newFloor]);
    setAddingFloor(false);
    setFloorFormData({
      name: '',
      description: '',
      image: null
    });
    // Сбрасываем зум и позицию
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  // Функции для управления зумом изображения
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const handleImageWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const handleImageMouseDown = (e) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePan.x,
        y: e.clientY - imagePan.y
      });
    }
  };

  const handleImageMouseMove = (e) => {
    if (isDragging && imageZoom > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  // Функции для управления зумом в модальном окне превью
  const handlePreviewZoomIn = () => {
    setPreviewZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handlePreviewZoomOut = () => {
    setPreviewZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePreviewZoomReset = () => {
    setPreviewZoom(1);
    setPreviewPan({ x: 0, y: 0 });
  };

  const handlePreviewImageWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setPreviewZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const handlePreviewImageMouseDown = (e) => {
    if (previewZoom > 1) {
      setPreviewDragging(true);
      setPreviewDragStart({
        x: e.clientX - previewPan.x,
        y: e.clientY - previewPan.y
      });
    }
  };

  const handlePreviewImageMouseMove = (e) => {
    if (previewDragging && previewZoom > 1) {
      setPreviewPan({
        x: e.clientX - previewDragStart.x,
        y: e.clientY - previewDragStart.y
      });
    }
  };

  const handlePreviewImageMouseUp = () => {
    setPreviewDragging(false);
  };

  // BIM Upload функциональность
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validExtensions = ['.ifc', '.rvt', '.bim'];
    const validFiles = files.filter(file => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return validExtensions.includes(extension);
    });

    if (validFiles.length === 0) {
      alert('Пожалуйста, выберите файлы с расширением .IFC, .RVT или .BIM');
      return;
    }

    validFiles.forEach(file => {
      const fileId = Date.now() + Math.random();
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toLocaleDateString()
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      // Симуляция загрузки
      const interval = simulateUpload(fileId);
      activeIntervals.current.add(interval);
      fileIntervals.current.set(fileId, interval);
    });
  };

  const simulateUpload = (fileId) => {
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[fileId] || 0;
        const newProgress = Math.min(currentProgress + 10, 100);
        
        if (newProgress === 100) {
          clearInterval(interval);
          activeIntervals.current.delete(interval);
          fileIntervals.current.delete(fileId);
          setTimeout(() => {
            setUploadProgress(prev => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });
          }, 1000);
        }
        
        return { ...prev, [fileId]: newProgress };
      });
    }, 200);

    // Сохраняем ссылку на интервал для очистки
    return interval;
  };

  const handleRemoveFile = (fileId) => {
    // Очищаем интервал, если он существует
    const interval = fileIntervals.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      activeIntervals.current.delete(interval);
      fileIntervals.current.delete(fileId);
    }
    
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Обработчик для смены изображения превью
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }
      
      // Создаем URL для превью
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик клика по изображению для смены
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const isFormValid = formData.propertyName.trim() && formData.address.trim();

  const renderGeneralSection = () => (
    <>
      <div className="form-group">
        <label htmlFor="propertyName">
          Название объекта <span className="required">*</span>
        </label>
        <input
          type="text"
          id="propertyName"
          name="propertyName"
          value={formData.propertyName}
          onChange={handleInputChange}
          className={errors.propertyName ? 'error' : ''}
          placeholder="Введите название объекта"
        />
        {errors.propertyName && <span className="error-message">{errors.propertyName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">
          Адрес <span className="required">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={errors.address ? 'error' : ''}
          placeholder="Введите полный адрес объекта"
          rows="3"
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Широта</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="0.000000"
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="longitude">Долгота</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            placeholder="0.000000"
            step="any"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status">Статус проекта</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="" disabled>Выберите статус</option>
          {projectStatuses.filter(s => s.value !== 'all').map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const renderSheetsSection = () => (
    <div className="sheets-section">
      <div className="sheets-header">
        <h3>Список этажей</h3>
        <button 
          className="btn btn-primary add-sheet-btn"
          onClick={handleAddSheet}
        >
          <i className="fas fa-plus"></i>
          Добавить этаж
        </button>
      </div>
      
      <div className="sheets-content">
        <div className="floors-list">
          {floors.map(floor => (
            <div key={floor.id} className="floor-item">
              <div className="floor-thumbnail" onClick={() => handleFloorClick(floor)}>
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
                  onClick={() => handleEditFloor(floor.id)}
                  title="Редактировать этаж"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="floor-delete-btn"
                  onClick={() => handleDeleteFloor(floor.id)}
                  title="Удалить этаж"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBIMSection = () => (
    <div className="bim-section">
      <div className="bim-header">
        <h3>
          <i className="fas fa-cube"></i>
          Загрузка BIM
        </h3>
        <p className="bim-description">
          Загрузите BIM-модели для вашего проекта. Поддерживаются форматы: .IFC, .RVT, .BIM
        </p>
      </div>

      <div className="bim-content">
        <div 
          className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="drag-drop-content">
            <i className="fas fa-cube drag-drop-icon"></i>
            <h4>Drag and drop here</h4>
            <p>или нажмите кнопку ниже для выбора файлов</p>
            <input
              type="file"
              multiple
              accept=".ifc,.rvt,.bim"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="bim-file-input"
            />
            <label htmlFor="bim-file-input" className="btn btn-primary upload-btn">
              <i className="fas fa-upload"></i>
              Загрузить
            </label>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h4>Загруженные файлы:</h4>
            <div className="files-list">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <i className="fas fa-cube"></i>
                    </div>
                    <div className="file-details">
                      <h5>{file.name}</h5>
                      <p>{formatFileSize(file.size)} • {file.uploadDate}</p>
                    </div>
                  </div>
                  
                  {uploadProgress[file.id] !== undefined && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        ></div>
                      </div>
                      <span>{uploadProgress[file.id]}%</span>
                    </div>
                  )}
                  
                  <button 
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bim-instructions">
          <h4>Инструкции по загрузке:</h4>
          <ul>
            <li>Поддерживаемые форматы: .IFC, .RVT, .BIM</li>
            <li>Максимальный размер файла: 500 MB</li>
            <li>Можно загружать несколько файлов одновременно</li>
            <li>Файлы будут автоматически обработаны после загрузки</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSection();
      case 'sheets':
        return renderSheetsSection();
      case 'bim':
        return renderBIMSection();
      default:
        return renderGeneralSection();
    }
  };

  const renderHelpfulTips = () => (
    <div className="helpful-tips">
      <h3>Полезные советы</h3>
      <div className="tips-content">
        <div className="tip-item">
          <i className="fas fa-lightbulb"></i>
          <div>
            <h4>Качество изображений</h4>
            <p>Используйте изображения высокого разрешения для лучшего качества планов этажей.</p>
          </div>
        </div>
        
        <div className="tip-item">
          <i className="fas fa-ruler"></i>
          <div>
            <h4>Масштаб</h4>
            <p>Убедитесь, что все планы этажей имеют одинаковый масштаб для корректного отображения.</p>
          </div>
        </div>
        
        <div className="tip-item">
          <i className="fas fa-tags"></i>
          <div>
            <h4>Названия этажей</h4>
            <p>Используйте понятные названия для этажей, например: "Первый этаж", "Подвал", "Чердак".</p>
          </div>
        </div>
        
        <div className="tip-item">
          <i className="fas fa-file-image"></i>
          <div>
            <h4>Форматы файлов</h4>
            <p>Поддерживаются форматы: JPG, PNG, PDF. Рекомендуется использовать PNG для лучшего качества.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="project-editor">
      <header className="editor-header">
        <h1>Редактирование проекта</h1>
        <div className="editor-navigation">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''} ${!section.active ? 'disabled' : ''}`}
              onClick={() => handleSectionClick(section.id)}
              disabled={!section.active}
            >
              <i className={section.icon}></i>
              <span>{section.title}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="editor-content">
        <div className="editor-form">
          {renderActiveSection()}
        </div>

        {activeSection === 'general' && (
          <div className="editor-preview">
            <h3>Превью</h3>
            <div className="preview-container">
              <div className="preview-image-container" onClick={handleImageClick}>
                <img 
                  src={previewImage || project?.preview || require('../data/img/house.jpeg')} 
                  alt="Превью проекта" 
                  className="preview-image"
                />
                <div className="image-overlay">
                  <i className="fas fa-camera"></i>
                  <span>Сменить изображение</span>
                </div>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div className="preview-info">
                <h4>{formData.propertyName || 'Название объекта'}</h4>
                <p>{formData.address || 'Адрес будет отображен здесь'}</p>
                {(formData.latitude || formData.longitude) && (
                  <p className="coordinates">
                    {formData.latitude && `Широта: ${formData.latitude}`}
                    {formData.latitude && formData.longitude && ', '}
                    {formData.longitude && `Долгота: ${formData.longitude}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'sheets' && renderHelpfulTips()}
      </div>

      <div className="editor-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left"></i>
          {activeSection === 'general' ? 'НАЗАД К ПРОЕКТАМ' : 
           activeSection === 'sheets' ? 'НАЗАД К ОБЩЕЙ ИНФОРМАЦИИ' : 
           'НАЗАД К СПИСКУ ЭТАЖЕЙ'}
        </button>
        <button 
          className={`btn btn-primary ${(activeSection === 'general' && !isFormValid) ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={activeSection === 'general' && !isFormValid}
        >
          {activeSection === 'bim' ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
          <i className={`fas ${activeSection === 'bim' ? 'fa-check' : 'fa-arrow-right'}`}></i>
        </button>
      </div>

      {/* Модальное окно для увеличенного изображения */}
      {selectedFloor && (
        <div className="modal-overlay" onClick={handleCloseModal} onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="modal-content modal-preview" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>{selectedFloor.name}</h3>
              <p>{selectedFloor.description}</p>
            </div>
            <div className="preview-zoom-controls">
              <button 
                type="button"
                className="zoom-btn"
                onClick={handlePreviewZoomOut}
                disabled={previewZoom <= 0.5}
              >
                <i className="fas fa-minus"></i>
              </button>
              <span className="zoom-level">{Math.round(previewZoom * 100)}%</span>
              <button 
                type="button"
                className="zoom-btn"
                onClick={handlePreviewZoomIn}
                disabled={previewZoom >= 3}
              >
                <i className="fas fa-plus"></i>
              </button>
              <button 
                type="button"
                className="zoom-btn"
                onClick={handlePreviewZoomReset}
              >
                <i className="fas fa-home"></i>
              </button>
            </div>
            <div className="modal-image" onWheel={handlePreviewImageWheel}>
              <div 
                className="zoomable-preview-image"
                onWheel={handlePreviewImageWheel}
                onMouseDown={handlePreviewImageMouseDown}
                onMouseMove={handlePreviewImageMouseMove}
                onMouseUp={handlePreviewImageMouseUp}
                onMouseLeave={handlePreviewImageMouseUp}
              >
                <img 
                  src={selectedFloor.fullImage} 
                  alt={selectedFloor.name}
                  style={{
                    transform: `scale(${previewZoom}) translate(${previewPan.x}px, ${previewPan.y}px)`,
                    cursor: previewZoom > 1 ? (previewDragging ? 'grabbing' : 'grab') : 'default'
                  }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onSelectStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для редактирования этажа */}
      {editingFloor && (
        <div className="modal-overlay" onClick={handleCancelFloorEdit} onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="modal-content floor-edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCancelFloorEdit}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>Редактирование этажа</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="floorName">Название этажа</label>
                <input
                  type="text"
                  id="floorName"
                  name="name"
                  value={floorFormData.name}
                  onChange={handleFloorFormChange}
                  placeholder="Введите название этажа"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="floorDescription">Описание</label>
                <textarea
                  id="floorDescription"
                  name="description"
                  value={floorFormData.description}
                  onChange={handleFloorFormChange}
                  placeholder="Введите описание этажа"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="floorImage">Изображение этажа</label>
                <div className="image-upload-container">
                  <div className="image-preview-container" onWheel={handleImageWheel}>
                    <div className="zoom-controls">
                      <button 
                        type="button"
                        className="zoom-btn"
                        onClick={handleZoomOut}
                        disabled={imageZoom <= 0.5}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="zoom-level">{Math.round(imageZoom * 100)}%</span>
                      <button 
                        type="button"
                        className="zoom-btn"
                        onClick={handleZoomIn}
                        disabled={imageZoom >= 3}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                      <button 
                        type="button"
                        className="zoom-btn"
                        onClick={handleZoomReset}
                      >
                        <i className="fas fa-home"></i>
                      </button>
                    </div>
                    <div 
                      className="current-image zoomable-image"
                      onWheel={handleImageWheel}
                      onMouseDown={handleImageMouseDown}
                      onMouseMove={handleImageMouseMove}
                      onMouseUp={handleImageMouseUp}
                      onMouseLeave={handleImageMouseUp}
                    >
                      <img 
                        src={floorFormData.image || editingFloor.thumbnail} 
                        alt="Текущее изображение"
                        style={{
                          transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
                          cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onSelectStart={(e) => e.preventDefault()}
                      />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="floorImage"
                    accept="image/*"
                    onChange={handleFloorImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="floorImage" className="btn btn-secondary">
                    <i className="fas fa-camera"></i>
                    Выбрать изображение
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelFloorEdit}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveFloor}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для добавления нового этажа */}
      {addingFloor && (
        <div className="modal-overlay" onClick={handleCancelFloorEdit} onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="modal-content floor-edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCancelFloorEdit}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>Добавление нового этажа</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="newFloorName">Название этажа</label>
                <input
                  type="text"
                  id="newFloorName"
                  name="name"
                  value={floorFormData.name}
                  onChange={handleFloorFormChange}
                  placeholder="Введите название этажа"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newFloorDescription">Описание</label>
                <textarea
                  id="newFloorDescription"
                  name="description"
                  value={floorFormData.description}
                  onChange={handleFloorFormChange}
                  placeholder="Введите описание этажа"
                  rows="3"
                />
              </div>
              
                             <div className="form-group">
                 <label htmlFor="newFloorImage">Изображение этажа</label>
                 <div className="image-upload-container">
                   <div className="image-preview-container" onWheel={handleImageWheel}>
                     <div className="zoom-controls">
                       <button 
                         type="button"
                         className="zoom-btn"
                         onClick={handleZoomOut}
                         disabled={imageZoom <= 0.5}
                       >
                         <i className="fas fa-minus"></i>
                       </button>
                       <span className="zoom-level">{Math.round(imageZoom * 100)}%</span>
                       <button 
                         type="button"
                         className="zoom-btn"
                         onClick={handleZoomIn}
                         disabled={imageZoom >= 3}
                       >
                         <i className="fas fa-plus"></i>
                       </button>
                       <button 
                         type="button"
                         className="zoom-btn"
                         onClick={handleZoomReset}
                       >
                         <i className="fas fa-home"></i>
                       </button>
                     </div>
                     <div 
                       className="current-image zoomable-image"
                       onWheel={handleImageWheel}
                       onMouseDown={handleImageMouseDown}
                       onMouseMove={handleImageMouseMove}
                       onMouseUp={handleImageMouseUp}
                       onMouseLeave={handleImageMouseUp}
                     >
                       <img 
                         src={floorFormData.image || require('../data/img/plug_img.jpeg')} 
                         alt="Превью изображения"
                         style={{
                           transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
                           cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                         }}
                         draggable={false}
                         onContextMenu={(e) => e.preventDefault()}
                         onSelectStart={(e) => e.preventDefault()}
                       />
                     </div>
                   </div>
                   <input
                     type="file"
                     id="newFloorImage"
                     accept="image/*"
                     onChange={handleFloorImageChange}
                     style={{ display: 'none' }}
                   />
                   <label htmlFor="newFloorImage" className="btn btn-secondary">
                     <i className="fas fa-camera"></i>
                     Выбрать изображение
                   </label>
                 </div>
               </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelFloorEdit}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveNewFloor}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProjectEditor.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    address: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    status: PropTypes.string,
    preview: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default ProjectEditor; 