import React from 'react';

function HelpfulTips() {
  return (
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
}

export default HelpfulTips; 