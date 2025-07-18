import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Заглушка для входа
    console.log('Попытка входа:', formData);
    // Здесь будет реальная логика авторизации
    alert('Функция входа в разработке');
  };

  const handleTestLogin = () => {
    // Тестовый вход для разработки
    console.log('Тестовый вход в систему');
    navigate('/projects');
  };

  const handleForgotPassword = () => {
    // Заглушка для восстановления пароля
    alert('Функция восстановления пароля в разработке');
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button 
            className="back-button"
            onClick={handleBackToLanding}
            aria-label="Вернуться на главную"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Вход в систему</h1>
          <p>Центр управления качеством и рисками города Москва</p>
        </div>

        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login">Логин</label>
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className={errors.login ? 'error' : ''}
                placeholder="Введите логин"
                required
              />
              {errors.login && <span className="error-message">{errors.login}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Введите пароль"
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button 
              type="button" 
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Забыли пароль?
            </button>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary login-btn"
              >
                Войти
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary test-login-btn"
                onClick={handleTestLogin}
              >
                Тестовый вход
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 