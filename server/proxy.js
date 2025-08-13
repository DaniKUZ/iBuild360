const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Demo endpoint for testing (when OpenAI is not available)
app.post('/api/demo/chat/completions', async (req, res) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const demoResponse = {
    choices: [{
      message: {
        content: `🏗️ АНАЛИЗ СТРОИТЕЛЬНОГО ПРОГРЕССА:

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

⚠️ ВНИМАНИЕ: Это демо-версия анализа. Для получения реального AI анализа необходимо настроить доступ к OpenAI API.`
      }
    }]
  };
  
  res.json(demoResponse);
});

// Proxy endpoint for OpenAI API
app.post('/api/openai/chat/completions', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY in environment' });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      
      let userFriendlyMessage = `OpenAI API error: ${response.status}`;
      
      if (errorText.includes('unsupported_country_region_territory')) {
        userFriendlyMessage = 'OpenAI API недоступен в вашем регионе. Для работы AI сравнения необходимо использовать VPN или альтернативный AI сервис.';
      } else if (response.status === 403) {
        userFriendlyMessage = 'Ошибка авторизации OpenAI API. Проверьте действительность API ключа.';
      } else if (response.status === 429) {
        userFriendlyMessage = 'Превышен лимит запросов к OpenAI API. Попробуйте позже.';
      }
      
      return res.status(response.status).json({ 
        error: userFriendlyMessage,
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Agent360 proxy for n8n webhook
app.post('/api/agent360/chat/completions', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    
    // n8n webhook configuration (из переменных окружения)
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const N8N_AUTH_HEADER = process.env.N8N_AUTH_HEADER || 'N8N';
    const N8N_AUTH_KEY = process.env.N8N_AUTH_KEY;

    if (!N8N_WEBHOOK_URL || !N8N_AUTH_KEY) {
      return res.status(500).json({ 
        error: 'Server misconfigured: Missing N8N_WEBHOOK_URL or N8N_AUTH_KEY environment variables' 
      });
    }

    const { site_id: siteId = 'UNKNOWN', images = [] } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    console.log(`📡 Прокси: перенаправляем запрос для объекта ${siteId} с ${images.length} изображениями в n8n...`);

    // Передаём данные через URL parameters (GET запрос)
    const params = new URLSearchParams();
    params.append('site_id', siteId);
    params.append(N8N_AUTH_HEADER, N8N_AUTH_KEY);
    
    // Добавляем изображения как параметры
    images.forEach((img, index) => {
      params.append(`image_${index}_role`, img.role || 'current');
      params.append(`image_${index}_taken_at`, img.taken_at || '');
      params.append(`image_${index}_url`, img.image_url || '');
      if (img.notes) params.append(`image_${index}_notes`, img.notes);
    });
    
    const webhookUrlWithParams = `${N8N_WEBHOOK_URL}?${params.toString()}`;
    
    console.log('🔗 Отправляем GET запрос на n8n webhook');
    console.log('📦 Параметров:', params.toString().length, 'chars');
    console.log('🖼️ Изображений:', images.length);
    
    const response = await fetch(webhookUrlWithParams, {
      method: 'GET',
      headers: {
        [N8N_AUTH_HEADER]: N8N_AUTH_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n Webhook Error:', response.status, errorText);
      
      let userFriendlyMessage = `n8n webhook error: ${response.status}`;
      
      if (response.status === 403) {
        userFriendlyMessage = 'Ошибка авторизации n8n webhook. Проверьте ключ авторизации.';
      } else if (response.status === 404) {
        userFriendlyMessage = 'n8n webhook не найден. Проверьте URL webhook.';
      }
      
      return res.status(response.status).json({ 
        error: userFriendlyMessage,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Получен ответ от n8n агента');
    
    res.json(data);
  } catch (error) {
    console.error('Agent360 n8n Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});

module.exports = app; 