import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getUserData, getUserAvatar, clearUserData } from '../../utils/userManager';
import styles from './TopNavbar.module.css';

const TopNavbar = ({ 
  activeTab, 
  onTabClick, 
  onHelpClick, 
  onUserClick, 
  showProjectSettings = false, 
  showProjectAdd = false,
  showWorkerStats = false 
}) => {
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const helpMenuRef = useRef(null);
  const helpButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'projects', label: 'Проекты', active: true },
    // Показываем вкладку статистики работников только когда это необходимо
    ...(showWorkerStats ? [{ id: 'worker-stats', label: 'Статистика работников', active: false }] : []),
    // Показываем вкладку настроек проекта только когда это необходимо
    ...(showProjectSettings ? [{ id: 'project-settings', label: 'Настройки проекта', active: false }] : []),
    // Показываем вкладку добавления проекта только когда это необходимо
    ...(showProjectAdd ? [{ id: 'project-add', label: 'Добавление проекта', active: false }] : []),
    // Здесь будут другие вкладки в будущем
  ];

  const helpMenuItems = [
    {
      id: 'search-help',
      icon: 'fas fa-search',
      label: 'Поиск справочных статей',
      onClick: () => {
        console.log('Поиск справочных статей');
        setIsHelpMenuOpen(false);
      }
    },
    {
      id: 'support-chat',
      icon: 'fas fa-comments',
      label: 'Чат со службой поддержки',
      onClick: () => {
        console.log('Чат со службой поддержки');
        setIsHelpMenuOpen(false);
      }
    },
    {
      id: 'whats-new',
      icon: 'fas fa-star',
      label: 'Что нового?',
      onClick: () => {
        console.log('Что нового?');
        setIsHelpMenuOpen(false);
      }
    },
    {
      id: 'bug-report',
      icon: 'fas fa-bug',
      label: 'Сообщить об ошибке',
      onClick: () => {
        console.log('Сообщить об ошибке');
        setIsHelpMenuOpen(false);
      }
    }
  ];

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target) && 
          helpButtonRef.current && !helpButtonRef.current.contains(event.target)) {
        setIsHelpMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) && 
          userButtonRef.current && !userButtonRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHelpButtonClick = () => {
    setIsHelpMenuOpen(!isHelpMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const handleUserButtonClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isHelpMenuOpen) setIsHelpMenuOpen(false);
  };

  const handleLogout = () => {
    clearUserData();
    navigate('/login');
  };

  const userData = getUserData();

  return (
    <header className={styles.topNavbar}>
      {/* Навигационные вкладки */}
      <nav className={styles.tabsNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabClick && onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Правая секция с действиями */}
      <div className={styles.actions}>
        {/* Кнопка помощи */}
        <div className={styles.helpContainer}>
          <button
            ref={helpButtonRef}
            className={`${styles.actionButton} ${isHelpMenuOpen ? styles.active : ''}`}
            onClick={handleHelpButtonClick}
            aria-label="Помощь"
          >
            <i className="fas fa-question-circle"></i>
          </button>
          {isHelpMenuOpen && (
            <div ref={helpMenuRef} className={styles.helpMenu}>
              {helpMenuItems.map(item => (
                <button
                  key={item.id}
                  className={styles.helpMenuItem}
                  onClick={item.onClick}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка пользователя */}
        <div className={styles.userContainer}>
          <button
            ref={userButtonRef}
            className={`${styles.actionButton} ${isUserMenuOpen ? styles.active : ''}`}
            onClick={handleUserButtonClick}
            aria-label="Профиль пользователя"
          >
            <i className="fas fa-user"></i>
          </button>
          {isUserMenuOpen && (
            <div ref={userMenuRef} className={styles.userMenu}>
              <div className={styles.userMenuHeader}>
                <img
                  src={getUserAvatar()}
                  alt="Аватар пользователя"
                  className={styles.userMenuAvatar}
                />
                <div className={styles.userMenuInfo}>
                  <div className={styles.userMenuName}>{userData?.name || 'Пользователь'}</div>
                  <div className={styles.userMenuEmail}>{userData?.email || 'user@example.com'}</div>
                </div>
              </div>
              <div className={styles.userMenuDivider}></div>
              <button className={styles.userMenuItem} onClick={() => onUserClick && onUserClick()}>
                <i className="fas fa-user"></i>
                <span>Мой профиль</span>
              </button>
              <button className={styles.userMenuItem}>
                <i className="fas fa-cog"></i>
                <span>Настройки</span>
              </button>
              <div className={styles.userMenuDivider}></div>
              <button className={styles.userMenuItem} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

TopNavbar.propTypes = {
  activeTab: PropTypes.string,
  onTabClick: PropTypes.func,
  onHelpClick: PropTypes.func,
  onUserClick: PropTypes.func,
  showProjectSettings: PropTypes.bool,
  showProjectAdd: PropTypes.bool,
  showWorkerStats: PropTypes.bool,
};

export default TopNavbar; 