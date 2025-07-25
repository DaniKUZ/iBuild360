import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function LandscapingSection({ 
  onPlanUpload,
  onPhotosUpload 
}) {
  const [uploadedPlan, setUploadedPlan] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [planPreviewUrl, setPlanPreviewUrl] = useState(null);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  
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
      
      // Создаем превью только для изображений
      if (isImageFile(file)) {
        const previewUrl = URL.createObjectURL(file);
        setPlanPreviewUrl(previewUrl);
      } else {
        setPlanPreviewUrl(null);
      }
      
      if (onPlanUpload) {
        onPlanUpload(file);
      }
    }
  };

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedPhotos(prev => [...prev, ...files]);
    
    // Создаем превью для новых фотографий
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    if (onPhotosUpload) {
      onPhotosUpload(files);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedPlan || uploadedPhotos.length === 0) {
      alert('Пожалуйста, загрузите план и хотя бы одно фото');
      return;
    }

    setIsAnalyzing(true);
    setShowResult(false);
    setDisplayedText('');

    // Имитация анализа
    setTimeout(() => {
      const mockResult = `Отчет по выполнению работ по благоустройству:

1. Подготовка территории ............................ 100%
2. Земляные работы ................................... 90%
3. Укладка тротуарной плитки ........................ 75%
4. Посадка деревьев .................................. 65%
5. Устройство газонов ................................ 55%
6. Монтаж освещения .................................. 45%
7. Установка скамеек ................................. 40%
8. Устройство детской площадки ...................... 30%
9. Финальная уборка .................................. 15%
10. Приемка работ ..................................... 10%

Общий прогресс выполнения работ: 62%`;

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      setShowResult(true);
    }, 3000);
  };

  const removePlan = () => {
    // Очищаем URL превью
    if (planPreviewUrl) {
      URL.revokeObjectURL(planPreviewUrl);
    }
    
    setUploadedPlan(null);
    setPlanPreviewUrl(null);
  };

  const removePhoto = (index) => {
    // Очищаем URL превью
    if (photoPreviewUrls[index]) {
      URL.revokeObjectURL(photoPreviewUrls[index]);
    }
    
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup URLs при размонтировании компонента
  useEffect(() => {
    return () => {
      if (planPreviewUrl) {
        URL.revokeObjectURL(planPreviewUrl);
      }
      photoPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [planPreviewUrl, photoPreviewUrls]);

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
            План-график работ
          </h4>
          <div className="upload-area">
            <input
              ref={planInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
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
          </div>
        </div>

        {/* Загрузка фотографий */}
        <div className="upload-section">
          <h4>
            <i className="fas fa-images"></i>
            Фотографии территории
          </h4>
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
            {uploadedPhotos.length > 0 && (
              <div className="uploaded-photos">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="uploaded-photo">
                    <div className="photo-preview">
                      <img 
                        src={photoPreviewUrls[index]} 
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
                      <div className="landscaping-file-info">
                        <span className="file-name">{photo.name}</span>
                        <span className="file-size">({formatFileSize(photo.size)})</span>
                      </div>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removePhoto(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка анализа */}
        <div className="analysis-section">
          <button 
            className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing || !uploadedPlan || uploadedPhotos.length === 0}
          >
            {isAnalyzing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Анализируем...
              </>
            ) : (
              <>
                <i className="fas fa-brain"></i>
                Анализировать
              </>
            )}
          </button>
        </div>

        {/* Результаты анализа */}
        {showResult && (
          <div className="results-section">
            <h4>
              <i className="fas fa-chart-line"></i>
              Результаты анализа
            </h4>
            <div className="result-content">
              <pre>{displayedText}</pre>
              {displayedText.length < analysisResult.length && (
                <span className="typing-cursor">|</span>
              )}
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