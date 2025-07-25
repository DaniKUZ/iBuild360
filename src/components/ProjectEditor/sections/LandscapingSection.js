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
    }, 50); // 50ms на символ для эффекта печатания

    return () => clearInterval(interval);
  }, [analysisResult, showResult]);

  const handlePlanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedPlan(file);
      if (onPlanUpload) {
        onPlanUpload(file);
      }
    }
  };

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedPhotos(prev => [...prev, ...files]);
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
      const mockResult = `Анализ благоустройства завершен успешно.

Выявленные особенности территории:
• Общая площадь участка: 2,450 м²
• Зеленые насаждения: 65% территории
• Пешеходные дорожки: в хорошем состоянии
• Система освещения: требует модернизации

Рекомендации по благоустройству:
1. Установка дополнительных фонарей в северной части
2. Обновление детской площадки
3. Создание зоны отдыха с беседками
4. Посадка декоративных кустарников вдоль дорожек

Ориентировочная стоимость работ: 1,250,000 руб.
Срок выполнения: 45-60 дней

Анализ проведен на основе загруженного плана-графика и 
${uploadedPhotos.length} фотографий территории.`;

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      setShowResult(true);
    }, 3000);
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

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
                <i className="fas fa-file"></i>
                <span>{uploadedPlan.name}</span>
                <span className="file-size">({formatFileSize(uploadedPlan.size)})</span>
                <button 
                  className="remove-btn"
                  onClick={() => setUploadedPlan(null)}
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
                    <i className="fas fa-image"></i>
                    <span>{photo.name}</span>
                    <span className="file-size">({formatFileSize(photo.size)})</span>
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