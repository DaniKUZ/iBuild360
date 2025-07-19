import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

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
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <button 
            className={styles.backButton}
            onClick={handleBackToLanding}
            aria-label="Вернуться на главную"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Вход в систему</h1>
          <p>Центр управления качеством и рисками города Москва</p>
        </div>

        <div className={styles.loginFormContainer}>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="login">Логин</label>
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className={errors.login ? styles.error : ''}
                placeholder="Введите логин"
                required
              />
              {errors.login && <span className={styles.errorMessage}>{errors.login}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? styles.error : ''}
                placeholder="Введите пароль"
                required
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>

            <button 
              type="button" 
              className={styles.forgotPasswordLink}
              onClick={handleForgotPassword}
            >
              Забыли пароль?
            </button>

            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Войти
              </button>
              
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnSecondary}`}
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