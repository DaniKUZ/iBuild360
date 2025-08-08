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

// Agent360 proxy for local development (expects process.env.OPENAI_API_KEY)
app.post('/api/agent360/chat/completions', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const AGENT360_MODEL_ID = process.env.AGENT360_MODEL_ID || 'gpt-4o-mini';

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY in environment' });
    }

    const { site_id: siteId = 'UNKNOWN', images = [], model } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const content = [
      { type: 'text', text: `Объект: ${siteId}. Сравни 'до' и 'после' и верни JSON по нашей схеме.` }
    ];

    for (const img of images) {
      const imageUrl = img?.image_url;
      const role = img?.role || 'current';
      const takenAt = img?.taken_at || '';
      const notes = img?.notes || '';
      if (!imageUrl) continue;
      content.push({ type: 'image_url', image_url: { url: imageUrl } });
      let meta = `role=${role} taken_at=${takenAt}`;
      if (notes) meta += ` notes=${notes}`;
      content.push({ type: 'text', text: meta });
    }

    const body = {
      model: model || AGENT360_MODEL_ID,
      messages: [{ role: 'user', content }],
      temperature: 0.1,
      max_tokens: 2000
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).send(text);
    }
    res.type('application/json').send(text);
  } catch (error) {
    console.error('Agent360 Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});

module.exports = app; 