// API Configuration
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

  // Идентификатор объекта по умолчанию
  SITE_ID: 'TI-001',

  // Ключ в браузер не кладем
  OPENAI_API_KEY: '',

  // Демо используем только вне продакшена
  USE_DEMO: !isProduction,
  USE_CORS_PROXY: false
};