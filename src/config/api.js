// API Configuration

// Полифилл для process в браузере
if (typeof process === 'undefined') {
  window.process = {
    env: {}
  };
}

const isProduction = window.location.hostname === 'build.napoleonit.ru' || window.location.hostname === '193.8.184.254';

export const API_CONFIG = {
  // Прямой OpenAI для локальной отладки через локальный прокси
  OPENAI_API_URL: isProduction
    ? '/api/openai/chat/completions'
    : 'http://localhost:3001/api/openai/chat/completions',

  // Агент 360 (серверный PHP прокси)
  AGENT360_API_URL: isProduction
    ? '/api/agent360/chat/completions'
    : 'http://localhost:3001/api/agent360/chat/completions',

  // LIMS (лабораторные испытания) — базовый URL
  // Уточнить у бэкенда реальный префикс. По умолчанию шлём через локальный прокси в деве
  LIMS_API_URL: isProduction
    ? '/api/lims'
    : 'http://localhost:3001/api/lims',

  // Идентификатор объекта по умолчанию
  SITE_ID: 'TI-001',

  // Ключ в браузер не кладем
  OPENAI_API_KEY: '',

  // Демо режим отключаем для использования реального API
  USE_DEMO: false,
  USE_CORS_PROXY: false,

  // Webhook configuration для получения изображений (из переменных окружения)
  WEBHOOK_URL: process.env.REACT_APP_N8N_WEBHOOK_URL || '',
  WEBHOOK_AUTH_HEADER: process.env.REACT_APP_N8N_AUTH_HEADER || 'N8N',
  WEBHOOK_AUTH_KEY: process.env.REACT_APP_N8N_AUTH_KEY || ''
};