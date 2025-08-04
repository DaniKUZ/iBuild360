import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function LandscapingSection({ 
  onPlanUpload,
  onPhotosUpload 
}) {
  const [uploadedPlan, setUploadedPlan] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photosWithDates, setPhotosWithDates] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [planPreviewUrl, setPlanPreviewUrl] = useState(null);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [ganttChart, setGanttChart] = useState(null);
  const [selectedPhotoDate, setSelectedPhotoDate] = useState('');
  const [groupedPhotos, setGroupedPhotos] = useState({});
  const [progressData, setProgressData] = useState(null);
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  
  const planInputRef = useRef(null);
  const photosInputRef = useRef(null);

  // Типизированный эффект анимации текста
  useEffect(() => {
    if (!analysisResult || !showResult) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= analysisResult.length) {
        setDisplayedText(analysisResult.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 25); // 25ms на символ для эффекта печатания (ускорено в 2 раза)

    return () => clearInterval(interval);
  }, [analysisResult, showResult]);

  const isImageFile = (file) => {
    return file && file.type && file.type.startsWith('image/');
  };

  const handlePlanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Очищаем предыдущий URL если был
      if (planPreviewUrl) {
        URL.revokeObjectURL(planPreviewUrl);
      }
      
      setUploadedPlan(file);
      
      // Создаем превью для всех типов файлов
      if (isImageFile(file)) {
        const previewUrl = URL.createObjectURL(file);
        setPlanPreviewUrl(previewUrl);
      } else {
        setPlanPreviewUrl(null);
      }
      
      // Анализируем план-график для извлечения данных о задачах
      analyzeGanttChart(file);
      
      if (onPlanUpload) {
        onPlanUpload(file);
      }
    }
  };

  const analyzeGanttChart = (file) => {
    // Заглушка для анализа диаграммы Ганта
    setTimeout(() => {
      const mockGanttData = {
        tasks: [
          { id: 1, name: 'Подготовка территории', startDate: '2024-01-15', endDate: '2024-01-20', progress: 100 },
          { id: 2, name: 'Земляные работы', startDate: '2024-01-21', endDate: '2024-02-05', progress: 90 },
          { id: 3, name: 'Укладка тротуарной плитки', startDate: '2024-02-06', endDate: '2024-02-20', progress: 75 },
          { id: 4, name: 'Посадка деревьев', startDate: '2024-02-15', endDate: '2024-03-01', progress: 65 },
          { id: 5, name: 'Устройство газонов', startDate: '2024-02-25', endDate: '2024-03-10', progress: 55 },
          { id: 6, name: 'Монтаж освещения', startDate: '2024-03-05', endDate: '2024-03-15', progress: 45 },
          { id: 7, name: 'Установка скамеек', startDate: '2024-03-10', endDate: '2024-03-18', progress: 40 },
          { id: 8, name: 'Устройство детской площадки', startDate: '2024-03-12', endDate: '2024-03-25', progress: 30 },
          { id: 9, name: 'Финальная уборка', startDate: '2024-03-20', endDate: '2024-03-28', progress: 15 },
          { id: 10, name: 'Приемка работ', startDate: '2024-03-26', endDate: '2024-03-30', progress: 10 }
        ],
        totalProgress: 62
      };
      setGanttChart(mockGanttData);
    }, 1000);
  };

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Создаем объекты фотографий с метаданными
    const newPhotos = files.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      name: file.name,
      size: file.size,
      date: selectedPhotoDate || new Date().toISOString().split('T')[0],
      previewUrl: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));
    
    setPhotosWithDates(prev => [...prev, ...newPhotos]);
    groupPhotosByDate([...photosWithDates, ...newPhotos]);
    
    if (onPhotosUpload) {
      onPhotosUpload(newPhotos);
    }
    
    // Сбрасываем выбранную дату после загрузки
    setSelectedPhotoDate('');
  };

  const groupPhotosByDate = (photos) => {
    const grouped = photos.reduce((acc, photo) => {
      const date = photo.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(photo);
      return acc;
    }, {});
    setGroupedPhotos(grouped);
  };

  const handlePhotoDateChange = (photoId, newDate) => {
    setPhotosWithDates(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, date: newDate } : photo
    ));
    groupPhotosByDate(photosWithDates.map(photo => 
      photo.id === photoId ? { ...photo, date: newDate } : photo
    ));
  };

  const removePhotoWithDate = (photoId) => {
    const photo = photosWithDates.find(p => p.id === photoId);
    if (photo && photo.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    
    const updatedPhotos = photosWithDates.filter(p => p.id !== photoId);
    setPhotosWithDates(updatedPhotos);
    groupPhotosByDate(updatedPhotos);
  };

  const handleAnalyze = async () => {
    if (!uploadedPlan || photosWithDates.length === 0) {
      alert('Пожалуйста, загрузите план-график и хотя бы одну фотографию');
      return;
    }

    setIsAnalyzing(true);
    setShowResult(false);
    setDisplayedText('');

    // Расширенная имитация AI анализа
    setTimeout(() => {
      const analysisData = performAIAnalysis();
      setProgressData(analysisData);
      
      const mockResult = generateAnalysisReport(analysisData);
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      setShowResult(true);
    }, 4000);
  };

  const performAIAnalysis = () => {
    // Заглушка AI анализа на основе загруженных данных
    const photosByDate = Object.keys(groupedPhotos).sort();
    const analysisData = {
      totalPhotos: photosWithDates.length,
      dateRange: {
        first: photosByDate[0],
        last: photosByDate[photosByDate.length - 1]
      },
      completedTasks: [],
      inProgressTasks: [],
      notStartedTasks: [],
      recommendations: []
    };

    // Анализируем задачи на основе дат фотографий и плана
    if (ganttChart) {
      ganttChart.tasks.forEach(task => {
        const photosForTask = photosWithDates.filter(photo => {
          const photoDate = new Date(photo.date);
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);
          return photoDate >= taskStart && photoDate <= taskEnd;
        });

        if (task.progress >= 90) {
          analysisData.completedTasks.push({ ...task, photosCount: photosForTask.length });
        } else if (task.progress > 30) {
          analysisData.inProgressTasks.push({ ...task, photosCount: photosForTask.length });
        } else {
          analysisData.notStartedTasks.push({ ...task, photosCount: photosForTask.length });
        }
      });
    }

    // Генерируем рекомендации
    if (analysisData.inProgressTasks.length > 0) {
      analysisData.recommendations.push('Рекомендуется ускорить выполнение текущих задач');
    }
    if (analysisData.notStartedTasks.length > 0) {
      analysisData.recommendations.push('Необходимо начать работы по запланированным задачам');
    }

    return analysisData;
  };

  const generateAnalysisReport = (data) => {
    return `🔍 AI АНАЛИЗ БЛАГОУСТРОЙСТВА ТЕРРИТОРИИ
════════════════════════════════════════════════════════════

📊 ОБЩАЯ ИНФОРМАЦИЯ:
• Всего загружено фотографий: ${data.totalPhotos}
• Период анализа: ${data.dateRange.first} - ${data.dateRange.last}
• Всего задач в плане: ${ganttChart?.tasks.length || 0}

✅ ЗАВЕРШЕННЫЕ РАБОТЫ (${data.completedTasks.length}):
${data.completedTasks.map(task => 
  `• ${task.name} - ${task.progress}% (фото: ${task.photosCount})`
).join('\n')}

🚧 ВЫПОЛНЯЕМЫЕ РАБОТЫ (${data.inProgressTasks.length}):
${data.inProgressTasks.map(task => 
  `• ${task.name} - ${task.progress}% (фото: ${task.photosCount})`
).join('\n')}

⏳ ЗАПЛАНИРОВАННЫЕ РАБОТЫ (${data.notStartedTasks.length}):
${data.notStartedTasks.map(task => 
  `• ${task.name} - ${task.progress}% (фото: ${task.photosCount})`
).join('\n')}

💡 РЕКОМЕНДАЦИИ:
${data.recommendations.map(rec => `• ${rec}`).join('\n')}

📈 ОБЩИЙ ПРОГРЕСС: ${ganttChart?.totalProgress || 0}%
════════════════════════════════════════════════════════════`;
  };

  const removePlan = () => {
    // Очищаем URL превью
    if (planPreviewUrl) {
      URL.revokeObjectURL(planPreviewUrl);
    }
    
    setUploadedPlan(null);
    setPlanPreviewUrl(null);
    setGanttChart(null);
  };

  // Устаревшая функция, оставлена для совместимости
  const removePhoto = (index) => {
    // Очищаем URL превью
    if (photoPreviewUrls[index]) {
      URL.revokeObjectURL(photoPreviewUrls[index]);
    }
    
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const openPhotoModal = (photo) => {
    setActivePhotoModal(photo);
  };

  const closePhotoModal = () => {
    setActivePhotoModal(null);
  };

  const getTotalPhotosCount = () => {
    return photosWithDates.length;
  };

  const getPhotosForDateRange = (startDate, endDate) => {
    return photosWithDates.filter(photo => {
      const photoDate = new Date(photo.date);
      return photoDate >= new Date(startDate) && photoDate <= new Date(endDate);
    });
  };

  // Cleanup URLs при размонтировании компонента
  useEffect(() => {
    return () => {
      if (planPreviewUrl) {
        URL.revokeObjectURL(planPreviewUrl);
      }
      // Очищаем старые URL
      photoPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      // Очищаем новые URL с датами
      photosWithDates.forEach(photo => {
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, [planPreviewUrl, photoPreviewUrls, photosWithDates]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="landscaping-section">
      <div className="landscaping-header">
        <h3>
          <i className="fas fa-seedling"></i>
          Благоустройство территории
        </h3>
        <p className="landscaping-description">
          Загрузите план-график и фотографии для анализа благоустройства
        </p>
      </div>

      <div className="landscaping-content">
        {/* Загрузка плана */}
        <div className="upload-section">
          <h4>
            <i className="fas fa-chart-gantt"></i>
            План-график работ (Диаграмма Ганта)
          </h4>
          <p className="section-description">
            Поддерживаются любые форматы: Excel, PDF, изображения и другие
          </p>
          <div className="upload-area">
            <input
              ref={planInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
              onChange={handlePlanUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="upload-btn"
              onClick={() => planInputRef.current?.click()}
            >
              <i className="fas fa-upload"></i>
              Загрузить план-график
            </button>
            {uploadedPlan && (
              <div className="uploaded-file">
                {planPreviewUrl ? (
                  <div className="file-preview">
                    <img 
                      src={planPreviewUrl} 
                      alt={uploadedPlan.name}
                      className="landscaping-preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="preview-placeholder" style={{ display: 'none' }}>
                      <i className="fas fa-image"></i>
                      <span>Ошибка загрузки</span>
                    </div>
                    <div className="landscaping-file-info">
                      <span className="file-name">{uploadedPlan.name}</span>
                      <span className="file-size">({formatFileSize(uploadedPlan.size)})</span>
                    </div>
                  </div>
                ) : (
                  <div className="landscaping-file-info">
                    <i className="fas fa-file"></i>
                    <span className="file-name">{uploadedPlan.name}</span>
                    <span className="file-size">({formatFileSize(uploadedPlan.size)})</span>
                  </div>
                )}
                <button 
                  className="remove-btn"
                  onClick={removePlan}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            
            {/* Визуализация данных Ганта */}
            {ganttChart && (
              <div className="gantt-preview">
                <h5>
                  <i className="fas fa-tasks"></i>
                  Обнаружено задач: {ganttChart.tasks.length}
                </h5>
                <div className="progress-overview">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${ganttChart.totalProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{ganttChart.totalProgress}% выполнено</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Загрузка фотографий */}
        <div className="upload-section">
          <h4>
            <i className="fas fa-images"></i>
            Фотографии территории с привязкой к датам
          </h4>
          <p className="section-description">
            Загружайте фотографии и указывайте даты съемки для точного анализа прогресса
          </p>
          
          <div className="upload-controls">
            <div className="date-input-group">
              <label htmlFor="photo-date">
                <i className="fas fa-calendar"></i>
                Дата съемки:
              </label>
              <input
                id="photo-date"
                type="date"
                value={selectedPhotoDate}
                onChange={(e) => setSelectedPhotoDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="upload-area">
              <input
                ref={photosInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosUpload}
                style={{ display: 'none' }}
              />
              <button 
                className="upload-btn"
                onClick={() => photosInputRef.current?.click()}
              >
                <i className="fas fa-camera"></i>
                Загрузить фотографии
              </button>
            </div>
          </div>

          {/* Статистика */}
          {getTotalPhotosCount() > 0 && (
            <div className="photos-stats">
              <div className="stat-item">
                <i className="fas fa-camera"></i>
                <span>Всего фото: {getTotalPhotosCount()}</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-calendar-check"></i>
                <span>Дней съемки: {Object.keys(groupedPhotos).length}</span>
              </div>
            </div>
          )}

          {/* Фотографии, сгруппированные по датам */}
          {Object.keys(groupedPhotos).length > 0 && (
            <div className="grouped-photos">
              {Object.keys(groupedPhotos)
                .sort((a, b) => new Date(b) - new Date(a))
                .map(date => (
                <div key={date} className="photo-group">
                  <div className="photo-group-header">
                    <h5>
                      <i className="fas fa-calendar-day"></i>
                      {new Date(date).toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h5>
                    <span className="photo-count">
                      {groupedPhotos[date].length} фото
                    </span>
                  </div>
                  
                  <div className="photos-grid">
                    {groupedPhotos[date].map(photo => (
                      <div key={photo.id} className="photo-item">
                        <div className="photo-preview" onClick={() => openPhotoModal(photo)}>
                          <img 
                            src={photo.previewUrl} 
                            alt={photo.name}
                            className="landscaping-preview-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="preview-placeholder" style={{ display: 'none' }}>
                            <i className="fas fa-image"></i>
                            <span>Ошибка загрузки</span>
                          </div>
                          <div className="photo-overlay">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                        
                        <div className="photo-details">
                          <div className="landscaping-file-info">
                            <span className="file-name">{photo.name}</span>
                            <span className="file-size">({formatFileSize(photo.size)})</span>
                          </div>
                          
                          <div className="photo-controls">
                            <input
                              type="date"
                              value={photo.date}
                              onChange={(e) => handlePhotoDateChange(photo.id, e.target.value)}
                              className="mini-date-input"
                              title="Изменить дату"
                            />
                            <button 
                              className="remove-btn"
                              onClick={() => removePhotoWithDate(photo.id)}
                              title="Удалить фото"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка анализа */}
        <div className="analysis-section">
          <button 
            className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing || !uploadedPlan || photosWithDates.length === 0}
          >
            {isAnalyzing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Выполняется AI анализ...
              </>
            ) : (
              <>
                <i className="fas fa-brain"></i>
                Запустить AI анализ
              </>
            )}
          </button>
          
          {(uploadedPlan && photosWithDates.length > 0) && (
            <div className="analysis-preview">
              <p>
                <i className="fas fa-info-circle"></i>
                Готово к анализу: план-график и {photosWithDates.length} фотографий
              </p>
            </div>
          )}
        </div>

        {/* Визуализация временной шкалы */}
        {ganttChart && progressData && (
          <div className="timeline-section">
            <h4>
              <i className="fas fa-timeline"></i>
              Временная шкала выполнения работ
            </h4>
            <div className="timeline-visualization">
              {ganttChart.tasks.map(task => {
                const photosForTask = getPhotosForDateRange(task.startDate, task.endDate);
                return (
                  <div key={task.id} className="timeline-task">
                    <div className="task-info">
                      <span className="task-name">{task.name}</span>
                      <span className="task-dates">
                        {new Date(task.startDate).toLocaleDateString('ru-RU')} - 
                        {new Date(task.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-value">{task.progress}%</span>
                    </div>
                    <div className="task-photos">
                      <i className="fas fa-camera"></i>
                      <span>{photosForTask.length} фото</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Результаты анализа */}
        {showResult && (
          <div className="results-section">
            <h4>
              <i className="fas fa-chart-line"></i>
              Результаты AI анализа
            </h4>
            <div className="result-content">
              <pre>{displayedText}</pre>
              {displayedText.length < analysisResult.length && (
                <span className="typing-cursor">|</span>
              )}
            </div>
            
            {progressData && (
              <div className="analysis-summary">
                <div className="summary-cards">
                  <div className="summary-card completed">
                    <div className="card-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="card-content">
                      <h5>Завершено</h5>
                      <span className="card-number">{progressData.completedTasks.length}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card in-progress">
                    <div className="card-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="card-content">
                      <h5>В работе</h5>
                      <span className="card-number">{progressData.inProgressTasks.length}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card planned">
                    <div className="card-icon">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="card-content">
                      <h5>Запланировано</h5>
                      <span className="card-number">{progressData.notStartedTasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Модальное окно для просмотра фотографий */}
        {activePhotoModal && (
          <div className="photo-modal-overlay" onClick={closePhotoModal}>
            <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closePhotoModal}>
                <i className="fas fa-times"></i>
              </button>
              
              <div className="modal-content">
                <img 
                  src={activePhotoModal.previewUrl} 
                  alt={activePhotoModal.name}
                  className="modal-image"
                />
                
                <div className="modal-info">
                  <h5>{activePhotoModal.name}</h5>
                  <div className="modal-details">
                    <div className="detail-item">
                      <i className="fas fa-calendar"></i>
                      <span>Дата: {new Date(activePhotoModal.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-file"></i>
                      <span>Размер: {formatFileSize(activePhotoModal.size)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>Загружено: {activePhotoModal.uploadedAt.toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

LandscapingSection.propTypes = {
  onPlanUpload: PropTypes.func,
  onPhotosUpload: PropTypes.func
};

export default LandscapingSection; 