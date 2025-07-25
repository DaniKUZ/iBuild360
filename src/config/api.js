// API Configuration
const isProduction = window.location.hostname === 'build.napoleonit.ru' || window.location.hostname === '193.8.184.254';

export const API_CONFIG = {
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  USE_DEMO: true, // Используем демо-режим до настройки сервера
  USE_CORS_PROXY: isProduction // Используем CORS прокси только на production
}; 