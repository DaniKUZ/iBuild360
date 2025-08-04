import { useState } from 'react';
import { API_CONFIG } from '../../../config/api';

/**
 * Хук для управления AI сравнением изображений
 */
const useAIComparison = () => {
  // Состояния для AI сравнения
  const [isAIComparisonSidebarVisible, setIsAIComparisonSidebarVisible] = useState(false);
  const [aiComparisonImages, setAIComparisonImages] = useState([]);
  const [aiAnalysisResult, setAIAnalysisResult] = useState(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  // Функция для анализа изображений с помощью OpenAI API
  const analyzeImagesWithAI = async (images) => {
    if (images.length !== 2) return;

    setIsAIAnalyzing(true);
    setAIAnalysisResult(null);

    try {
      // Конвертируем изображения в base64 с уменьшением размера
      const imageDataPromises = images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Создаем canvas для уменьшения размера
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Уменьшаем до максимум 800px по большей стороне
            const maxSize = 800;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Рисуем уменьшенное изображение
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем в base64 с качеством 0.7
            const base64data = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            resolve(base64data);
          };
          img.src = URL.createObjectURL(blob);
        });
      });

      const imageDataArray = await Promise.all(imageDataPromises);

      const systemMessage = "Ты - строительный аналитик.";
      const userPrompt = (
        "Перед тобой две фотографии со строительной площадки, снятые с одинаковых ракурсов. " +
        "Определи, какой прогресс сделан в строительных работах и выдай свой анализ. " +
        "Анализируй фото максимально детально и точно, вывод напиши не очень объемный " +
        "(вывод должен содержать, какие работы были завершены в промежутке между двумя фото)."
      );

      const messages = [
        { "role": "system", "content": systemMessage },
        { 
          "role": "user", 
          "content": [
            { "type": "text", "text": userPrompt },
            { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${imageDataArray[0]}` } },
            { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${imageDataArray[1]}` } }
          ]
        }
      ];

      // Если демо-режим, используем локальную заглушку
      if (API_CONFIG.USE_DEMO) {
        // Имитируем задержку анализа
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const demoResult = `🏗️ АНАЛИЗ СТРОИТЕЛЬНОГО ПРОГРЕССА:

📊 За период между фотографиями выполнены следующие работы:

✅ ЗАВЕРШЕННЫЕ РАБОТЫ:
• Установлена внутренняя перегородка в левой части помещения  
• Выполнена штукатурка стен в центральной зоне
• Проложена электропроводка по потолку
• Установлены оконные рамы

🔄 НАЧАТЫЕ РАБОТЫ:
• Подготовка пола под финишное покрытие
• Монтаж системы вентиляции

📈 ПРОГРЕСС: Примерно 65% работ по данному участку завершены.

⚠️ ДЕМО-РЕЖИМ: Для получения реального AI анализа необходимо настроить сервер с поддержкой OpenAI API.`;

        setAIAnalysisResult(demoResult);
        setIsAIAnalyzing(false);
        return;
      }

      // Для реального API
      let apiUrl = API_CONFIG.OPENAI_API_URL;
      let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 400,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content.trim();
      
      setAIAnalysisResult(analysisText);
    } catch (error) {
      console.error('Ошибка при анализе изображений:', error);
      setAIAnalysisResult('Произошла ошибка при анализе изображений. Попробуйте еще раз.');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Функция добавления изображений для AI сравнения
  const handleAddToAIComparison = (leftImage, rightImage, leftDate, rightDate) => {
    // Проверяем, что изображения из разных дат
    if (leftDate.getTime() === rightDate.getTime()) {
      alert('Нельзя сравнить одинаковые изображения. Выберите изображения из разных дат.');
      return;
    }

    const newImages = [
      {
        url: leftImage,
        date: leftDate.toISOString()
      },
      {
        url: rightImage,
        date: rightDate.toISOString()
      }
    ];

    setAIComparisonImages(newImages);
    setIsAIComparisonSidebarVisible(true);
  };

  // Функция закрытия AI сравнения
  const handleCloseAIComparison = () => {
    setIsAIComparisonSidebarVisible(false);
  };

  return {
    // Состояния
    isAIComparisonSidebarVisible,
    aiComparisonImages,
    aiAnalysisResult,
    isAIAnalyzing,
    
    // Функции
    analyzeImagesWithAI,
    handleAddToAIComparison,
    handleCloseAIComparison,
    
    // Сеттеры
    setIsAIComparisonSidebarVisible,
    setAIComparisonImages,
    setAIAnalysisResult,
    setIsAIAnalyzing,
  };
};

export default useAIComparison;