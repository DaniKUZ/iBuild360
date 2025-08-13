import { useState } from 'react';
import { API_CONFIG } from '../../../config/api';
import { analyzeImagesFromWebhook } from '../../../utils/webhookUtils';

/**
 * Хук для управления AI сравнением изображений
 */
const useAIComparison = () => {
  // Состояния для AI сравнения
  const [isAIComparisonSidebarVisible, setIsAIComparisonSidebarVisible] = useState(false);
  const [aiComparisonImages, setAIComparisonImages] = useState([]);
  const [aiAnalysisResult, setAIAnalysisResult] = useState(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  // Функция для анализа изображений через webhook (альтернативная)
  const analyzeImagesWithWebhook = async (beforeDate, afterDate, siteId = API_CONFIG.SITE_ID) => {
    if (!beforeDate || !afterDate) return;

    setIsAIAnalyzing(true);
    setAIAnalysisResult(null);

    try {
      console.log('Анализ изображений через webhook...');
      const analysisText = await analyzeImagesFromWebhook(siteId, beforeDate, afterDate);
      setAIAnalysisResult(analysisText);
    } catch (error) {
      console.error('Ошибка при анализе через webhook:', error);
      setAIAnalysisResult(`Произошла ошибка при анализе изображений через webhook: ${error.message}`);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Функция для анализа изображений с помощью OpenAI API (локальные изображения)
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
            
            // Сильно уменьшаем для экономии места в URL (GET запрос)
            const maxSize = 200;
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
            
            // Конвертируем в base64 с низким качеством для экономии места в URL
            const base64data = canvas.toDataURL('image/jpeg', 0.3).split(',')[1];
            resolve(base64data);
          };
          img.src = URL.createObjectURL(blob);
        });
      });

      const imageDataArray = await Promise.all(imageDataPromises);

      // Формируем данные для нашего серверного прокси в формате Агент 360
      const requestPayload = {
        site_id: API_CONFIG.SITE_ID,
        images: [
          {
            role: 'before',
            taken_at: new Date(images[0].date).toISOString().slice(0, 10),
            image_url: `data:image/jpeg;base64,${imageDataArray[0]}`
          },
          {
            role: 'after', 
            taken_at: new Date(images[1].date).toISOString().slice(0, 10),
            image_url: `data:image/jpeg;base64,${imageDataArray[1]}`
          }
        ]
      };

      // Если демо-режим, используем локальную заглушку
      // Отключаем демо-режим - теперь используем реальный API
      if (API_CONFIG.USE_DEMO) {
        console.warn('Demo mode is disabled. Using real API.');
      }

      // Используем серверный прокси для обхода CORS
      let apiUrl = API_CONFIG.AGENT360_API_URL;
      let headers = {
        'Content-Type': 'application/json'
      };

      console.log('Отправляем запрос через серверный прокси в n8n агент:', requestPayload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Ответ от n8n агента:', data);
      
      // n8n может возвращать данные в разных форматах
      let analysisText = '';
      
      // Проверяем различные возможные форматы ответа от n8n
      if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Формат OpenAI API
        analysisText = String(data.choices[0].message.content).trim();
      } else if (data && data.response) {
        // Прямой ответ в поле response
        analysisText = String(data.response).trim();
      } else if (data && data.result) {
        // Ответ в поле result
        analysisText = String(data.result).trim();
      } else if (data && data.analysis) {
        // Ответ в поле analysis
        analysisText = String(data.analysis).trim();
      } else if (typeof data === 'string') {
        // Простая строка
        analysisText = data.trim();
      } else if (data && data.message === 'Workflow was started') {
        // n8n запустил workflow но еще не вернул результат
        analysisText = `🚀 Workflow запущен в n8n! 

⏳ Агент начал анализ изображений...

📊 Переданные данные:
• Объект: ${API_CONFIG.SITE_ID}
• Изображений: 2
• Даты: ${new Date(images[0].date).toLocaleDateString('ru-RU')} → ${new Date(images[1].date).toLocaleDateString('ru-RU')}

⚠️ n8n агент может работать асинхронно. Если результат не появляется, попросите коллегу проверить:
1. Настроен ли workflow для возврата результата
2. Работает ли AI анализ в n8n
3. Нужно ли время для обработки запроса

🔧 Технические детали: ${JSON.stringify(data)}`;
      } else {
        // Fallback - преобразуем весь объект в строку
        analysisText = `🤖 Получен ответ от n8n агента:

${JSON.stringify(data, null, 2)}

⚠️ Это не похоже на результат анализа. Возможные причины:
1. Workflow еще обрабатывает запрос
2. Нужна настройка возврата результата в n8n
3. Агент настроен для асинхронной работы

💡 Попросите коллегу проверить настройки workflow в n8n.`;
      }
      
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
    analyzeImagesWithWebhook,
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