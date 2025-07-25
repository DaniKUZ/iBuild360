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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
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

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});

module.exports = app; 