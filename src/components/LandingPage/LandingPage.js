import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestModal from './components/RequestModal';
import './LandingPage.css';

const LandingPage = ({ onEnterApp }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Главная', href: '#home' },
    { id: 'about', label: 'О\u00A0компании', href: '#about' },
    { id: 'services', label: 'Услуги', href: '#services' },
    { id: 'projects', label: 'Проекты', href: '#projects' },
    { id: 'contacts', label: 'Контакты', href: '#contacts' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    // Плавный скролл к секции
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestClick = () => {
    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
  };

  const handleSubmitRequest = (requestData) => {
    console.log('Данные заявки:', requestData);
    // Здесь будет отправка данных на сервер
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Header с навигацией */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>NameProject</h1>
              <p>Центр управления качеством и рисками</p>
            </div>
            
            <nav className="navigation">
              <ul className="nav-list">
                {navigationItems.map(item => (
                  <li key={item.id} className="nav-item">
                    <a
                      href={item.href}
                      className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="header-actions">
              <button 
                className="btn btn-outline"
                onClick={handleRequestClick}
              >
                Заявка
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleLoginClick}
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero секция */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Управление строительными проектами нового поколения
            </h1>
            <p className="hero-description">
              Инновационная платформа для контроля качества и управления рисками 
              в строительной отрасли города Москвы
            </p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={onEnterApp}
              >
                Перейти в приложение
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => handleNavClick('about')}
              >
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* О компании */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">О компании</h2>
            <p className="section-subtitle">
              Здесь будет общая информация о компании
            </p>
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <h3>Наша миссия</h3>
              <p>
                Мы создаем инновационные решения для управления качеством и рисками 
                в строительной отрасли. Наша платформа помогает строительным компаниям 
                повышать эффективность проектов и обеспечивать высокие стандарты качества.
              </p>
              
              <h3>Наши преимущества</h3>
              <ul className="advantages-list">
                <li>360° просмотр строительных объектов</li>
                <li>Управление BIM-моделями</li>
                <li>Контроль качества в реальном времени</li>
                <li>Анализ и управление рисками</li>
                <li>Интуитивно понятный интерфейс</li>
              </ul>
            </div>
            
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Завершенных проектов</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Партнеров</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">Удовлетворенность клиентов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Наши услуги</h2>
            <p className="section-subtitle">
              Комплексные решения для строительной отрасли
            </p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🏗️</div>
              <h3>Управление проектами</h3>
              <p>Полный цикл управления строительными проектами от планирования до сдачи</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📐</div>
              <h3>BIM-моделирование</h3>
              <p>Работа с 3D-моделями и интеграция BIM-технологий</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🔍</div>
              <h3>Контроль качества</h3>
              <p>Мониторинг качества выполнения работ в режиме реального времени</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">⚠️</div>
              <h3>Управление рисками</h3>
              <p>Выявление, анализ и минимизация рисков на всех этапах строительства</p>
            </div>
          </div>
        </div>
      </section>

      {/* Проекты */}
      <section id="projects" className="projects-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Проекты</h2>
            <p className="section-subtitle">
              Примеры наших успешных реализаций
            </p>
          </div>
          
          <div className="projects-preview">
            <div className="project-preview-card">
              <h3>Жилой комплекс "Современный"</h3>
              <p>Многоэтажный жилой комплекс с применением современных технологий BIM</p>
            </div>
            
            <div className="project-preview-card">
              <h3>Торговый центр "Метрополис"</h3>
              <p>Крупный торговый комплекс с инновационными решениями управления качеством</p>
            </div>
            
            <div className="project-preview-card">
              <h3>Офисный центр "Технопарк"</h3>
              <p>Современный бизнес-центр с интеграцией цифровых технологий</p>
            </div>
          </div>
          
          <div className="projects-cta">
            <button 
              className="btn btn-primary"
              onClick={onEnterApp}
            >
              Посмотреть все проекты
            </button>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contacts" className="contacts-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Контакты</h2>
            <p className="section-subtitle">
              Свяжитесь с нами для получения консультации
            </p>
          </div>
          
          <div className="contacts-content">
            <div className="contact-info">
              <div className="contact-item">
                <h4>Адрес</h4>
                <p>г. Москва, ул. Строительная, д. 1</p>
              </div>
              
              <div className="contact-item">
                <h4>Телефон</h4>
                <p>+7 (495) 123-45-67</p>
              </div>
              
              <div className="contact-item">
                <h4>Email</h4>
                <p>info@NameProject.ru</p>
              </div>
            </div>
            
            <div className="contact-form">
              <h4>Оставить заявку</h4>
              <p>Хотите узнать больше о наших услугах или обсудить ваш проект?</p>
              <button 
                className="btn btn-primary"
                onClick={handleRequestClick}
              >
                Оставить заявку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>NameProject</h3>
              <p>Центр управления качеством и рисками города Москва</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Компания</h4>
                <ul>
                  <li><a href="#about">О нас</a></li>
                  <li><a href="#services">Услуги</a></li>
                  <li><a href="#projects">Проекты</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Поддержка</h4>
                <ul>
                  <li><a href="#contacts">Контакты</a></li>
                  <li><a href="#">Документация</a></li>
                  <li><a href="#">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 NameProject. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Request Modal */}
      <RequestModal 
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
};

export default LandingPage; 