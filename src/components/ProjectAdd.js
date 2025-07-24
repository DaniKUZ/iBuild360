import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

// Hooks
import useImageZoom from './ProjectEditor/hooks/useImageZoom';
import useFileUpload from './ProjectEditor/hooks/useFileUpload';
import useFloorManagement from './ProjectEditor/hooks/useFloorManagement';
import useVideo360Management from './ProjectEditor/hooks/useVideo360Management';
import useScheduleManagement from './ProjectEditor/hooks/useScheduleManagement';

// Components
import GeneralAddSection from './ProjectAdd/sections/GeneralAddSection';
import SheetsSection from './ProjectEditor/sections/SheetsSection';
import ZonesSection from './ProjectEditor/sections/ZonesSection';
import FieldNotesSection from './ProjectEditor/sections/FieldNotesSection';
import Video360Section from './ProjectEditor/sections/Video360Section';
import ScheduleSection from './ProjectEditor/sections/ScheduleSection';
import BIMSection from './ProjectEditor/sections/BIMSection';
import FloorModal from './ProjectEditor/modals/FloorModal';
import FloorEditModal from './ProjectEditor/modals/FloorEditModal';
import FloorAddModal from './ProjectEditor/modals/FloorAddModal';
import NavigationTabs from './ProjectEditor/components/NavigationTabs';
import HelpfulTips from './ProjectEditor/components/HelpfulTips';

// Utils
import { validateAddForm, isAddFormValid, isAddFormCompletelyValid, validateSingleField } from './ProjectAdd/utils/validation';

function ProjectAdd({ onBack, onSave, isSettingsMode = false }) {
  // Основные состояния
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    propertyName: '',
    address: '',
    latitude: '',
    longitude: '',
    constructionStartDate: '',
    constructionEndDate: ''
  });
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('general');
  const [previewImage, setPreviewImage] = useState(null);
  
  // Hooks для управления состоянием
  const imageZoom = useImageZoom();
  const previewZoom = useImageZoom();
  const fileUpload = useFileUpload();
  const video360Management = useVideo360Management([]);
  const scheduleManagement = useScheduleManagement([]);
  const floorManagement = useFloorManagement([]); // Пустой массив для новых проектов
  
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
      id: 'schemes',
      title: 'Схемы',
      icon: 'fas fa-layer-group',
      active: true
    },
    {
      id: 'zones',
      title: 'Зоны',
      icon: 'fas fa-map-marked-alt',
      active: true
    },
    {
      id: 'field-notes',
      title: 'Полевые заметки',
      icon: 'fas fa-sticky-note',
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

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    const hasModal = floorManagement.selectedFloor || floorManagement.editingFloor || floorManagement.addingFloor || scheduleManagement.editingTask || scheduleManagement.addingTask;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [floorManagement.selectedFloor, floorManagement.editingFloor, floorManagement.addingFloor, scheduleManagement.editingTask, scheduleManagement.addingTask]);

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
    const validationErrors = validateAddForm(formData);
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
    // Проверяем валидность общей информации
    if (activeSection === 'general' && !isAddFormValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      return;
    }
    
    // Проверяем полную валидность формы перед созданием проекта
    if (!isAddFormCompletelyValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      setActiveSection('general');
      return;
    }
    
    console.log('Проект создан');
    // Создаем объект проекта
    const newProject = {
      id: Date.now(), // Временный ID
      name: formData.propertyName,
      lastUpdate: new Date().toISOString(), // Включаем часы и минуты для точной сортировки
      user: `${formData.firstName} ${formData.lastName}`,
      address: formData.address,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      constructionStartDate: formData.constructionStartDate,
      constructionEndDate: formData.constructionEndDate,
      firstName: formData.firstName,
      lastName: formData.lastName,
      startDate: new Date().toISOString().split('T')[0], // Сегодняшняя дата
      preview: previewImage || require('../data/img/plug_img.jpeg'),
      floors: floorManagement.floors,
      videos360: video360Management.videos,
      schedule: scheduleManagement.tasks,
      bimFiles: fileUpload.uploadedFiles
    };
    
    if (onSave) {
      onSave(newProject);
    }
    onBack();
  };

  const handleSectionClick = (sectionId) => {
    // Если пытаемся перейти с первой секции без валидации
    if (activeSection === 'general' && sectionId !== 'general' && !isAddFormValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      return;
    }
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    onBack();
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
          <GeneralAddSection
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
          />
        );
      case 'schemes':
        return (
          <SheetsSection
            floors={floorManagement.floors}
            onFloorClick={floorManagement.handleFloorClick}
            onAddSheet={floorManagement.handleAddSheet}
            onEditFloor={floorManagement.handleEditFloor}
            onDeleteFloor={floorManagement.handleDeleteFloor}
          />
        );
      case 'zones':
        return <ZonesSection />;
      case 'field-notes':
        return <FieldNotesSection />;
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
            addingTask={scheduleManagement.addingTask}
            showImportModal={scheduleManagement.showImportModal}
            taskFormData={scheduleManagement.taskFormData}
            onAddTask={scheduleManagement.addTask}
            onUpdateTask={scheduleManagement.updateTask}
            onRemoveTask={scheduleManagement.removeTask}
            onStartEditTask={scheduleManagement.startEditTask}
            onCancelEdit={scheduleManagement.cancelEdit}
            onSaveTask={scheduleManagement.saveTask}
            onSaveNewTask={scheduleManagement.saveNewTask}
            onUpdateTaskForm={scheduleManagement.updateTaskForm}
            getAvailableDependencies={scheduleManagement.getAvailableDependencies}
            getProjectStats={scheduleManagement.getProjectStats}
            onOpenImportModal={scheduleManagement.openImportModal}
            onCloseImportModal={scheduleManagement.closeImportModal}
            onImportTasks={scheduleManagement.importTasks}
            onExportCSV={scheduleManagement.exportToCSV}
            onExportGanttCSV={scheduleManagement.exportToGanttCSV}
            onExportExcel={scheduleManagement.exportToExcel}
            onExportGanttExcel={scheduleManagement.exportToGanttExcel}
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



  return (
    <div className={`project-editor ${isSettingsMode ? 'settings-mode' : ''}`}>
      {!isSettingsMode && (
        <header className="editor-header">
          <h1>Добавление нового проекта</h1>
          <NavigationTabs
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </header>
      )}

      {isSettingsMode && (
        <header className="editor-header settings-header">
          <NavigationTabs
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </header>
      )}

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
                  src={previewImage || require('../data/img/plug_img.jpeg')} 
                  alt="Превью проекта" 
                  className="preview-image"
                />
                <div className="image-overlay">
                  <i className="fas fa-camera"></i>
                  <span>Добавить изображение</span>
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
                {(formData.firstName || formData.lastName) && (
                  <p className="author">
                    Автор: {formData.firstName} {formData.lastName}
                  </p>
                )}
                <p className="start-date">
                  Дата создания: {new Date().toLocaleDateString('ru-RU')}
                </p>
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

        {activeSection === 'schemes' && <HelpfulTips />}
      </div>

      <div className="editor-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left"></i>
          НАЗАД К ПРОЕКТАМ
        </button>
        <button 
          className={`btn btn-primary ${
            !isAddFormCompletelyValid(formData) ? 'disabled' : ''
          }`}
          onClick={handleNext}
          disabled={!isAddFormCompletelyValid(formData)}
        >
          ДОБАВИТЬ
          <i className="fas fa-plus"></i>
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

ProjectAdd.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  isSettingsMode: PropTypes.bool,
};

export default ProjectAdd; 