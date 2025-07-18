import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Очищаем данные пользователя (локальное хранилище, токены и т.д.)
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Перенаправляем на лендинг
    navigate('/', { replace: true });
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  return (
    <div className="app">
      <Sidebar 
        activeItem="settings"
        onItemClick={(itemId) => {
          if (itemId === 'home') {
            navigate('/projects');
          }
        }}
      />
      <div className="app-content">
        <header className="app-header">
          <div className="settings-header">
            <button 
              className="btn btn-secondary back-btn"
              onClick={handleBackToProjects}
              aria-label="Вернуться к проектам"
            >
              <i className="fas fa-arrow-left"></i>
              Назад к проектам
            </button>
            <h1>Настройки</h1>
          </div>
        </header>
        
        <main className="app-main settings-main" role="main">
          <div className="settings-container">
            <div className="settings-section">
              <h2>Аккаунт</h2>
              <div className="settings-item">
                <div className="setting-info">
                  <h3>Выйти из аккаунта</h3>
                  <p>Завершить текущую сессию и вернуться на главную страницу</p>
                </div>
                <button 
                  className="btn btn-danger logout-btn"
                  onClick={handleLogout}
                  aria-label="Выйти из аккаунта"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Выйти
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h2>Приложение</h2>
              <div className="settings-item">
                <div className="setting-info">
                  <h3>Версия приложения</h3>
                  <p>NameProject v1.0.0</p>
                </div>
              </div>
              <div className="settings-item">
                <div className="setting-info">
                  <h3>Центр управления качеством и рисками</h3>
                  <p>Город Москва</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 