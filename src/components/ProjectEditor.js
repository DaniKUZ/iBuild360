import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

// Hooks
import useImageZoom from './ProjectEditor/hooks/useImageZoom';
import useFileUpload from './ProjectEditor/hooks/useFileUpload';
import useFloorManagement from './ProjectEditor/hooks/useFloorManagement';
import useVideo360Management from './ProjectEditor/hooks/useVideo360Management';
import useScheduleManagement from './ProjectEditor/hooks/useScheduleManagement';

// Components
import GeneralSection from './ProjectEditor/sections/GeneralSection';
import SheetsSection from './ProjectEditor/sections/SheetsSection';
import BIMSection from './ProjectEditor/sections/BIMSection';
import Video360Section from './ProjectEditor/sections/Video360Section';
import ScheduleSection from './ProjectEditor/sections/ScheduleSection';
import FloorModal from './ProjectEditor/modals/FloorModal';
import FloorEditModal from './ProjectEditor/modals/FloorEditModal';
import FloorAddModal from './ProjectEditor/modals/FloorAddModal';
import NavigationTabs from './ProjectEditor/components/NavigationTabs';
import HelpfulTips from './ProjectEditor/components/HelpfulTips';

// Utils
import { validateForm, isFormValid, isFormCompletelyValid, validateSingleField } from './ProjectEditor/utils/validation';

function ProjectEditor({ project, onBack, onSave }) {
  // Основные состояния    // Don't call preventDefault on passive wheel events
    // Only handle wheel events inside the image container
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    latitude: '',
    longitude: '',
    status: ''
  });
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('general');
  const [previewImage, setPreviewImage] = useState(null);
  
  // Hooks для управления состоянием
  const imageZoom = useImageZoom();
  const previewZoom = useImageZoom();
  const fileUpload = useFileUpload();
  const video360Management = useVideo360Management(project?.videos360 || []);
  const scheduleManagement = useScheduleManagement(project?.schedule || []);
  const floorManagement = useFloorManagement(project?.floors || [
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
  
  // Refs
  const imageInputRef = useRef(null);

  // Конфигурация секций (мемоизируем для оптимизации)
  const sections = useMemo(() => [
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
      id: 'video360',
      title: 'Видео 360°',
      icon: 'fas fa-video',
      active: true
    },
    {
      id: 'schedule',
      title: 'План-график',
      icon: 'fas fa-calendar-alt',
      active: true
    },
    {
      id: 'bim',
      title: 'Загрузка BIM',
      icon: 'fas fa-cube',
      active: true
    }
  ], []);

  // Инициализация данных проекта
  useEffect(() => {
    if (project) {
      setFormData({
        propertyName: project.name || '',
        address: project.address || '',
        latitude: project.latitude || '',
        longitude: project.longitude || '',
        status: project.status || ''
      });
      setPreviewImage(project.preview || null);
    }
  }, [project]);

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    const hasModal = floorManagement.selectedFloor || floorManagement.editingFloor || floorManagement.addingFloor || scheduleManagement.editingTask;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [floorManagement.selectedFloor, floorManagement.editingFloor, floorManagement.addingFloor, scheduleManagement.editingTask]);

  // Обработчики форм
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

  const handleValidation = () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldErrors = validateSingleField(name, value, formData);
    
    setErrors(prev => ({
      ...prev,
      ...fieldErrors,
      // Убираем ошибку для этого поля, если валидация прошла успешно
      ...(Object.keys(fieldErrors).length === 0 && { [name]: '' })
    }));
  };

  // Навигация между секциями
  const handleNext = () => {
    if (activeSection === 'general') {
      if (handleValidation()) {
        console.log('Form data:', formData);
        setActiveSection('sheets');
      }
    } else if (activeSection === 'sheets') {
      setActiveSection('video360');
    } else if (activeSection === 'video360') {
      setActiveSection('schedule');
    } else if (activeSection === 'schedule') {
      setActiveSection('bim');
    } else if (activeSection === 'bim') {
      // Проверяем полную валидность формы перед завершением
      if (!isFormCompletelyValid(formData)) {
        alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
        setActiveSection('general');
        return;
      }
      
      console.log('Проект завершен');
      
      // Сохраняем изменения проекта
      if (onSave && project) {
        const updatedProject = {
          ...project,
          name: formData.propertyName,
          lastUpdate: new Date().toISOString(), // Включаем часы и минуты для точной сортировки
          address: formData.address,
          latitude: parseFloat(formData.latitude) || project.latitude,
          longitude: parseFloat(formData.longitude) || project.longitude,
          status: formData.status,
          preview: previewImage || project.preview,
          floors: floorManagement.floors,
          videos360: video360Management.videos,
          schedule: scheduleManagement.tasks,
          bimFiles: fileUpload.uploadedFiles
        };
        onSave(updatedProject);
      }
      
      onBack();
    }
  };

  const handleSectionClick = (sectionId) => {
    // Если пытаемся перейти с первой секции без валидации
    if (activeSection === 'general' && sectionId !== 'general' && !isFormValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      return;
    }
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    if (activeSection === 'sheets') {
      setActiveSection('general');
    } else if (activeSection === 'video360') {
      setActiveSection('sheets');
    } else if (activeSection === 'schedule') {
      setActiveSection('video360');
    } else if (activeSection === 'bim') {
      setActiveSection('schedule');
    } else {
      onBack();
    }
  };

  // Обработка изображения превью
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  // Закрытие модального окна превью
  const handleCloseFloorModal = () => {
    floorManagement.handleCloseModal();
    previewZoom.resetZoom();
  };

  // Закрытие модального окна редактирования
  const handleCancelFloorEdit = () => {
    floorManagement.handleCancelFloorEdit();
    imageZoom.resetZoom();
  };

  // Сохранение этажа
  const handleSaveFloor = () => {
    floorManagement.handleSaveFloor();
    imageZoom.resetZoom();
  };

  // Сохранение нового этажа
  const handleSaveNewFloor = () => {
    floorManagement.handleSaveNewFloor();
    imageZoom.resetZoom();
  };

  // Рендеринг активной секции
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <GeneralSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
          />
        );
      case 'sheets':
        return (
          <SheetsSection
            floors={floorManagement.floors}
            onFloorClick={floorManagement.handleFloorClick}
            onAddSheet={floorManagement.handleAddSheet}
            onEditFloor={floorManagement.handleEditFloor}
            onDeleteFloor={floorManagement.handleDeleteFloor}
          />
        );
      case 'video360':
        return (
          <Video360Section
            videos={video360Management.videos}
            dragActive={video360Management.dragActive}
            uploadProgress={video360Management.uploadProgress}
            onDragIn={video360Management.handleDragIn}
            onDragOut={video360Management.handleDragOut}
            onDrag={video360Management.handleDrag}
            onDrop={video360Management.handleDrop}
            onFileInput={video360Management.handleFileInput}
            onRemoveVideo={video360Management.removeVideo}
            onUpdateVideoName={video360Management.updateVideoName}
            formatFileSize={video360Management.formatFileSize}
          />
        );
      case 'schedule':
        return (
          <ScheduleSection
            tasks={scheduleManagement.tasks}
            editingTask={scheduleManagement.editingTask}
            taskFormData={scheduleManagement.taskFormData}
            onAddTask={scheduleManagement.addTask}
            onUpdateTask={scheduleManagement.updateTask}
            onRemoveTask={scheduleManagement.removeTask}
            onStartEditTask={scheduleManagement.startEditTask}
            onCancelEdit={scheduleManagement.cancelEdit}
            onSaveTask={scheduleManagement.saveTask}
            onUpdateTaskForm={scheduleManagement.updateTaskForm}
            getAvailableDependencies={scheduleManagement.getAvailableDependencies}
            getProjectStats={scheduleManagement.getProjectStats}
          />
        );
      case 'bim':
        return (
          <BIMSection
            dragActive={fileUpload.dragActive}
            uploadedFiles={fileUpload.uploadedFiles}
            uploadProgress={fileUpload.uploadProgress}
            onDragIn={fileUpload.handleDragIn}
            onDragOut={fileUpload.handleDragOut}
            onDrag={fileUpload.handleDrag}
            onDrop={fileUpload.handleDrop}
            onFileInput={fileUpload.handleFileInput}
            onRemoveFile={fileUpload.handleRemoveFile}
            formatFileSize={fileUpload.formatFileSize}
          />
        );
      default:
        return null;
    }
  };

  const formIsValid = isFormValid(formData);
  const formCompletelyValid = isFormCompletelyValid(formData);

  return (
    <div className="project-editor">
      <header className="editor-header">
        <h1>Редактирование проекта</h1>
        <NavigationTabs
          sections={sections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
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

        {activeSection === 'sheets' && <HelpfulTips />}
      </div>

      <div className="editor-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left"></i>
          {activeSection === 'general' ? 'НАЗАД К ПРОЕКТАМ' : 
           activeSection === 'sheets' ? 'НАЗАД К ОБЩЕЙ ИНФОРМАЦИИ' : 
           activeSection === 'video360' ? 'НАЗАД К СПИСКУ ЭТАЖЕЙ' :
           activeSection === 'schedule' ? 'НАЗАД К ВИДЕО 360°' :
           'НАЗАД К ПЛАНУ-ГРАФИКУ'}
        </button>
        <button 
          className={`btn btn-primary ${
            (activeSection === 'general' && !formIsValid) || 
            (activeSection === 'bim' && !formCompletelyValid) ? 'disabled' : ''
          }`}
          onClick={handleNext}
          disabled={
            (activeSection === 'general' && !formIsValid) || 
            (activeSection === 'bim' && !formCompletelyValid)
          }
        >
          {activeSection === 'bim' ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
          <i className={`fas ${activeSection === 'bim' ? 'fa-check' : 'fa-arrow-right'}`}></i>
        </button>
      </div>

      {/* Модальные окна */}
      {floorManagement.selectedFloor && (
        <FloorModal
          floor={floorManagement.selectedFloor}
          onClose={handleCloseFloorModal}
          zoom={previewZoom.zoom}
          pan={previewZoom.pan}
          isDragging={previewZoom.isDragging}
          onWheel={previewZoom.handleWheel}
          onMouseDown={previewZoom.handleMouseDown}
          onMouseMove={previewZoom.handleMouseMove}
          onMouseUp={previewZoom.handleMouseUp}
          onZoomIn={previewZoom.zoomIn}
          onZoomOut={previewZoom.zoomOut}
          onZoomReset={previewZoom.resetZoom}
        />
      )}

      {floorManagement.editingFloor && (
        <FloorEditModal
          floor={floorManagement.editingFloor}
          floorFormData={floorManagement.floorFormData}
          floorErrors={floorManagement.floorErrors}
          onClose={handleCancelFloorEdit}
          onSave={handleSaveFloor}
          onFormChange={floorManagement.handleFloorFormChange}
          onBlur={floorManagement.handleFloorBlur}
          onImageChange={floorManagement.handleFloorImageChange}
          zoom={imageZoom.zoom}
          pan={imageZoom.pan}
          isDragging={imageZoom.isDragging}
          onWheel={imageZoom.handleWheel}
          onMouseDown={imageZoom.handleMouseDown}
          onMouseMove={imageZoom.handleMouseMove}
          onMouseUp={imageZoom.handleMouseUp}
          onZoomIn={imageZoom.zoomIn}
          onZoomOut={imageZoom.zoomOut}
          onZoomReset={imageZoom.resetZoom}
        />
      )}

      {floorManagement.addingFloor && (
        <FloorAddModal
          floorFormData={floorManagement.floorFormData}
          floorErrors={floorManagement.floorErrors}
          onClose={handleCancelFloorEdit}
          onSave={handleSaveNewFloor}
          onFormChange={floorManagement.handleFloorFormChange}
          onBlur={floorManagement.handleFloorBlur}
          onImageChange={floorManagement.handleFloorImageChange}
          zoom={imageZoom.zoom}
          pan={imageZoom.pan}
          isDragging={imageZoom.isDragging}
          onWheel={imageZoom.handleWheel}
          onMouseDown={imageZoom.handleMouseDown}
          onMouseMove={imageZoom.handleMouseMove}
          onMouseUp={imageZoom.handleMouseUp}
          onZoomIn={imageZoom.zoomIn}
          onZoomOut={imageZoom.zoomOut}
          onZoomReset={imageZoom.resetZoom}
        />
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
  onSave: PropTypes.func,
};

export default ProjectEditor; 