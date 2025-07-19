import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestModal from './components/RequestModal';
import styles from './LandingPage.module.css';

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
    <div className={styles.landingPage}>
      {/* Header с навигацией */}
      <header className={styles.landingHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <h1>NameProject</h1>
              <p>Центр управления качеством и рисками</p>
            </div>
            
            <nav className={styles.navigation}>
              <ul className={styles.navList}>
                {navigationItems.map(item => (
                  <li key={item.id} className={styles.navItem}>
                    <a
                      href={item.href}
                      className={`${styles.navLink} ${activeSection === item.id ? styles.active : ''}`}
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

            <div className={styles.headerActions}>
              <button 
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={handleRequestClick}
              >
                Заявка
              </button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleLoginClick}
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero секция */}
      <section id="home" className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Управление строительными проектами нового поколения
            </h1>
            <p className={styles.heroDescription}>
              Инновационная платформа для контроля качества и управления рисками 
              в строительной отрасли города Москвы
            </p>
            <div className={styles.heroActions}>
              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                onClick={onEnterApp}
              >
                Перейти в приложение
              </button>
              <button 
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnLarge}`}
                onClick={() => handleNavClick('about')}
              >
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* О компании */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>О компании</h2>
            <p className={styles.sectionSubtitle}>
              Здесь будет общая информация о компании
            </p>
          </div>
          
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h3>Наша миссия</h3>
              <p>
                Мы создаем инновационные решения для управления качеством и рисками 
                в строительной отрасли. Наша платформа помогает строительным компаниям 
                повышать эффективность проектов и обеспечивать высокие стандарты качества.
              </p>
              
              <h3>Наши преимущества</h3>
              <ul className={styles.advantagesList}>
                <li>360° просмотр строительных объектов</li>
                <li>Управление BIM-моделями</li>
                <li>Контроль качества в реальном времени</li>
                <li>Анализ и управление рисками</li>
                <li>Интуитивно понятный интерфейс</li>
              </ul>
            </div>
            
            <div className={styles.aboutStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100+</div>
                <div className={styles.statLabel}>Завершенных проектов</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>50+</div>
                <div className={styles.statLabel}>Партнеров</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>99%</div>
                <div className={styles.statLabel}>Удовлетворенность клиентов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section id="services" className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Наши услуги</h2>
            <p className={styles.sectionSubtitle}>
              Комплексные решения для строительной отрасли
            </p>
          </div>
          
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🏗️</div>
              <h3>Управление проектами</h3>
              <p>Полный цикл управления строительными проектами от планирования до сдачи</p>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>📐</div>
              <h3>BIM-моделирование</h3>
              <p>Работа с 3D-моделями и интеграция BIM-технологий</p>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🔍</div>
              <h3>Контроль качества</h3>
              <p>Мониторинг качества выполнения работ в режиме реального времени</p>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>⚠️</div>
              <h3>Управление рисками</h3>
              <p>Выявление, анализ и минимизация рисков на всех этапах строительства</p>
            </div>
          </div>
        </div>
      </section>

      {/* Проекты */}
      <section id="projects" className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Проекты</h2>
            <p className={styles.sectionSubtitle}>
              Примеры наших успешных реализаций
            </p>
          </div>
          
          <div className={styles.projectsPreview}>
            <div className={styles.projectPreviewCard}>
              <h3>Жилой комплекс "Современный"</h3>
              <p>Многоэтажный жилой комплекс с применением современных технологий BIM</p>
            </div>
            
            <div className={styles.projectPreviewCard}>
              <h3>Торговый центр "Метрополис"</h3>
              <p>Крупный торговый комплекс с инновационными решениями управления качеством</p>
            </div>
            
            <div className={styles.projectPreviewCard}>
              <h3>Офисный центр "Технопарк"</h3>
              <p>Современный бизнес-центр с интеграцией цифровых технологий</p>
            </div>
          </div>
          
          <div className={styles.projectsCta}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onEnterApp}
            >
              Посмотреть все проекты
            </button>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contacts" className={styles.contactsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Контакты</h2>
            <p className={styles.sectionSubtitle}>
              Свяжитесь с нами для получения консультации
            </p>
          </div>
          
          <div className={styles.contactsContent}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <h4>Адрес</h4>
                <p>г. Москва, ул. Строительная, д. 1</p>
              </div>
              
              <div className={styles.contactItem}>
                <h4>Телефон</h4>
                <p>+7 (495) 123-45-67</p>
              </div>
              
              <div className={styles.contactItem}>
                <h4>Email</h4>
                <p>info@NameProject.ru</p>
              </div>
            </div>
            
            <div className={styles.contactForm}>
              <h4>Оставить заявку</h4>
              <p>Хотите узнать больше о наших услугах или обсудить ваш проект?</p>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleRequestClick}
              >
                Оставить заявку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.landingFooter}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3>NameProject</h3>
              <p>Центр управления качеством и рисками города Москва</p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Компания</h4>
                <ul>
                  <li><a href="#about">О нас</a></li>
                  <li><a href="#services">Услуги</a></li>
                  <li><a href="#projects">Проекты</a></li>
                </ul>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Поддержка</h4>
                <ul>
                  <li><a href="#contacts">Контакты</a></li>
                  <li><a href="#">Документация</a></li>
                  <li><a href="#">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
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