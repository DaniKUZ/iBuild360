import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

// Hooks
import useImageZoom from './ProjectEditor/hooks/useImageZoom';
import useFileUpload from './ProjectEditor/hooks/useFileUpload';
import useFloorManagement from './ProjectEditor/hooks/useFloorManagement';
import useVideo360Management from './ProjectEditor/hooks/useVideo360Management';
// import useScheduleManagement from './ProjectEditor/hooks/useScheduleManagement';

// Components
import GeneralSection from './ProjectEditor/sections/GeneralSection';
import SheetsSection from './ProjectEditor/sections/SheetsSection';
import ZonesSection from './ProjectEditor/sections/ZonesSection';
import FieldNotesSection from './ProjectEditor/sections/FieldNotesSection';
import BIMSection from './ProjectEditor/sections/BIMSection';
import Video360Section from './ProjectEditor/sections/Video360Section';
import LandscapingSection from './ProjectEditor/sections/LandscapingSection';
import FloorModal from './ProjectEditor/modals/FloorModal';
import FloorEditModal from './ProjectEditor/modals/FloorEditModal';
import FloorAddModal from './ProjectEditor/modals/FloorAddModal';
import NavigationTabs from './ProjectEditor/components/NavigationTabs';
import HelpfulTips from './ProjectEditor/components/HelpfulTips';

// Utils
import { validateForm, isFormValid, isFormCompletelyValid, validateSingleField } from './ProjectEditor/utils/validation';

function ProjectEditor({ project, onBack, onSave, isSettingsMode = false }) {
  // Основные состояния    // Don't call preventDefault on passive wheel events
    // Only handle wheel events inside the image container
  const [formData, setFormData] = useState({
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
  
  // Состояние для полевых заметок
  const [fieldNotesTags, setFieldNotesTags] = useState(project?.fieldNotes?.tags || [
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
  ]);
  const [fieldNotesStatuses, setFieldNotesStatuses] = useState(project?.fieldNotes?.statuses || [
    { id: 1, name: 'Приоритет1', color: '#e53e3e' },
    { id: 2, name: 'Приоритет2', color: '#f56500' },
    { id: 3, name: 'Приоритет3', color: '#d69e2e' },
    { id: 4, name: 'Закрыто', color: '#38a169' },
    { id: 5, name: 'Проверено', color: '#3182ce' },
    { id: 6, name: 'В ходе выполнения', color: '#805ad5' }
  ]);

  // Hooks для управления состоянием
  const imageZoom = useImageZoom();
  const previewZoom = useImageZoom();
  const fileUpload = useFileUpload(project?.bimFiles || []);
  const video360Management = useVideo360Management(project?.videos360 || []);
  // const scheduleManagement = useScheduleManagement(project?.schedule || []);
  const floorManagement = useFloorManagement(project?.floors || [
    {
      id: 1,
      name: 'Первый этаж',
      thumbnail: require('../data/img/schemeFloor1.png'),
      fullImage: require('../data/img/schemeFloor1.png'),
      description: 'Главный этаж с входной зоной'
    },
    {
      id: 2,
      name: 'Второй этаж',
      thumbnail: require('../data/img/schemeFloor2.png'),
      fullImage: require('../data/img/schemeFloor2.png'),
      description: 'Жилая зона'
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
      id: 'landscaping',
      title: 'Благоустройство',
      icon: 'fas fa-seedling',
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
        constructionStartDate: project.constructionStartDate || '',
        constructionEndDate: project.constructionEndDate || ''
      });
      setPreviewImage(project.preview || null);
    }
  }, [project]);

  // Блокировка прокрутки body при открытии модального окна
  useEffect(() => {
    const hasModal = floorManagement.selectedFloor || floorManagement.editingFloor || floorManagement.addingFloor;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [floorManagement.selectedFloor, floorManagement.editingFloor, floorManagement.addingFloor]);

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
    // Проверяем валидность общей информации
    if (activeSection === 'general' && !isFormValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      return;
    }
    
    // Проверяем полную валидность формы перед сохранением
    if (!isFormCompletelyValid(formData)) {
      alert('Пожалуйста, заполните все обязательные поля в разделе "Общая информация"');
      setActiveSection('general');
      return;
    }
    
    console.log('Проект сохранен');
    
    // Сохраняем изменения проекта
    if (onSave && project) {
      const updatedProject = {
        ...project,
        name: formData.propertyName,
        address: formData.address,
        latitude: parseFloat(formData.latitude) || project.latitude,
        longitude: parseFloat(formData.longitude) || project.longitude,
        constructionStartDate: formData.constructionStartDate,
        constructionEndDate: formData.constructionEndDate,
        preview: previewImage || project.preview,
        floors: floorManagement.floors,
        videos360: video360Management.videos,
        schedule: project?.schedule || [],
        fieldNotes: {
          tags: fieldNotesTags,
          statuses: fieldNotesStatuses
        },
        bimFiles: fileUpload.uploadedFiles
      };
      onSave(updatedProject);
    }
    
    onBack();
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

  // Обработчики для полевых заметок
  const handleFieldNotesTagsUpdate = (newTags) => {
    setFieldNotesTags(newTags);
  };

  const handleFieldNotesStatusesUpdate = (newStatuses) => {
    setFieldNotesStatuses(newStatuses);
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
        return (
          <ZonesSection
            floors={floorManagement.floors}
            onFloorsUpdate={floorManagement.updateFloors}
          />
        );
      case 'field-notes':
        return (
          <FieldNotesSection
            tags={fieldNotesTags}
            statuses={fieldNotesStatuses}
            onTagsUpdate={handleFieldNotesTagsUpdate}
            onStatusesUpdate={handleFieldNotesStatusesUpdate}
          />
        );
      case 'video360':
        return (
          <Video360Section
            videos={video360Management.videos}
            floors={floorManagement.floors}
            dragActive={video360Management.dragActive}
            uploadProgress={video360Management.uploadProgress}
            onDragIn={video360Management.handleDragIn}
            onDragOut={video360Management.handleDragOut}
            onDrag={video360Management.handleDrag}
            onDrop={video360Management.handleDrop}
            onFileInput={video360Management.handleFileInput}
            onRemoveVideo={video360Management.removeVideo}
            onUpdateVideoName={video360Management.updateVideoName}
            onUpdateVideoShootingDate={video360Management.updateVideoShootingDate}
            onUpdateVideoServerStatus={video360Management.updateVideoServerStatus}
            onUpdateVideoAssignedFloor={video360Management.updateVideoAssignedFloor}
            onUpdateVideoTags={video360Management.updateVideoTags}
            formatFileSize={video360Management.formatFileSize}
          />
        );
      case 'landscaping':
        return (
          <LandscapingSection
            onPlanUpload={(file) => console.log('Plan uploaded:', file)}
            onPhotosUpload={(files) => console.log('Photos uploaded:', files)}
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
          <h1>Редактирование проекта</h1>
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

              <div className={`editor-content ${activeSection === 'zones' ? 'zones-active' : activeSection === 'field-notes' ? 'field-notes-active' : activeSection === 'video360' ? 'video360-active' : activeSection === 'landscaping' ? 'landscaping-active' : ''}`}>
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
            !isFormCompletelyValid(formData) ? 'disabled' : ''
          }`}
          onClick={handleNext}
          disabled={!isFormCompletelyValid(formData)}
        >
          СОХРАНИТЬ
          <i className="fas fa-save"></i>
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
  isSettingsMode: PropTypes.bool,
};

export default ProjectEditor; 