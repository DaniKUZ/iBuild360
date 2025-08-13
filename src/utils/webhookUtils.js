import { API_CONFIG } from '../config/api';

/**
 * Утилиты для работы с webhook для получения изображений
 */

/**
 * Получает изображения с webhook
 * @param {string} siteId - ID объекта
 * @param {string} dateFrom - Дата начала в формате YYYY-MM-DD  
 * @param {string} dateTo - Дата окончания в формате YYYY-MM-DD
 * @returns {Promise<Array>} Массив объектов изображений
 */
export const fetchImagesFromWebhook = async (siteId = 'TI-001', dateFrom = null, dateTo = null) => {
  try {
    // Формируем параметры запроса
    const params = new URLSearchParams({
      site_id: siteId,
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    });

    // Заголовки с авторизацией
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.WEBHOOK_AUTH_KEY}`,
      'Key': API_CONFIG.WEBHOOK_AUTH_KEY
    };

    console.log(`Запрос изображений с webhook для объекта ${siteId}`);
    
    const response = await fetch(`${API_CONFIG.WEBHOOK_URL}?${params}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Получены изображения с webhook:', data);

    // Преобразуем ответ webhook в ожидаемый формат
    const images = Array.isArray(data) ? data : data.images || [];
    
    return images.map(img => ({
      url: img.url || img.image_url,
      date: img.date || img.taken_at,
      role: img.role || 'current',
      notes: img.notes || ''
    }));
    
  } catch (error) {
    console.error('Ошибка при получении изображений с webhook:', error);
    throw error;
  }
};

/**
 * Обновленная функция для анализа изображений с получением их через webhook
 * @param {string} siteId - ID объекта
 * @param {Date} beforeDate - Дата "до"
 * @param {Date} afterDate - Дата "после"
 * @returns {Promise<string>} Результат анализа
 */
export const analyzeImagesFromWebhook = async (siteId, beforeDate, afterDate) => {
  try {
    // Получаем изображения с webhook
    const beforeDateStr = beforeDate.toISOString().slice(0, 10);
    const afterDateStr = afterDate.toISOString().slice(0, 10);
    
    console.log(`Анализ изображений для ${siteId}: ${beforeDateStr} → ${afterDateStr}`);
    
    // Получаем изображения за указанные даты
    const images = await fetchImagesFromWebhook(siteId, beforeDateStr, afterDateStr);
    
    if (images.length < 2) {
      throw new Error(`Недостаточно изображений для анализа. Найдено: ${images.length}, требуется: 2`);
    }

    // Находим изображения "до" и "после"
    const beforeImage = images.find(img => 
      img.date.startsWith(beforeDateStr) || img.role === 'before'
    ) || images[0];
    
    const afterImage = images.find(img => 
      img.date.startsWith(afterDateStr) || img.role === 'after'
    ) || images[images.length - 1];

    // Формируем запрос к API
    const requestPayload = {
      site_id: siteId,
      images: [
        {
          role: 'before',
          taken_at: beforeDateStr,
          image_url: beforeImage.url
        },
        {
          role: 'after',
          taken_at: afterDateStr,
          image_url: afterImage.url
        }
      ]
    };

    // Отправляем на анализ через серверный прокси (который обращается к n8n)
    const response = await fetch(API_CONFIG.AGENT360_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Ответ от n8n агента (webhookUtils):', data);
    
    // Извлекаем результат анализа (n8n может возвращать в разных форматах)
    let analysisText = '';
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
    } else {
      // Fallback - преобразуем весь объект в строку
      analysisText = JSON.stringify(data, null, 2);
    }

    return analysisText;
    
  } catch (error) {
    console.error('Ошибка при анализе изображений через webhook:', error);
    throw error;
  }
};
