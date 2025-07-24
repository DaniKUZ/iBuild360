import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getUserData, getUserAvatar, clearUserData } from '../../utils/userManager';
import styles from './TopNavbar.module.css';

const TopNavbar = ({ activeTab, onTabClick, onHelpClick, onUserClick, showProjectSettings = false, showProjectAdd = false }) => {
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const helpMenuRef = useRef(null);
  const helpButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'projects', label: 'Проекты', active: true },
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
    }
  ];

  const userData = getUserData();
  const userInfo = {
    name: userData.name,
    email: userData.email,
    avatar: getUserAvatar(userData)
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Закрытие меню помощи
      if (
        helpMenuRef.current && 
        !helpMenuRef.current.contains(event.target) &&
        helpButtonRef.current &&
        !helpButtonRef.current.contains(event.target)
      ) {
        setIsHelpMenuOpen(false);
      }

      // Закрытие меню пользователя
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isHelpMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHelpMenuOpen, isUserMenuOpen]);

  const handleHelpClick = () => {
    setIsHelpMenuOpen(!isHelpMenuOpen);
    setIsUserMenuOpen(false); // Закрываем другое меню
  };

  const handleUserClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsHelpMenuOpen(false); // Закрываем другое меню
  };

  const handleViewProfile = () => {
    console.log('Посмотреть профиль');
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('Выход из системы');
    clearUserData(); // Очищаем данные пользователя
    setIsUserMenuOpen(false);
    navigate('/'); // Переход на лендинговую страницу
  };

  return (
    <div className={styles.topNavbar}>
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className={styles.actionsContainer}>
        <div className={styles.helpContainer}>
          <button
            ref={helpButtonRef}
            className={`${styles.iconButton} ${isHelpMenuOpen ? styles.active : ''}`}
            onClick={handleHelpClick}
            title="Помощь"
            aria-label="Помощь"
            aria-expanded={isHelpMenuOpen}
          >
            <i className="fas fa-question"></i>
          </button>
          
          {isHelpMenuOpen && (
            <div ref={helpMenuRef} className={styles.helpMenu} role="menu">
              <div className={styles.helpMenuHeader}>
                <h3>Помощь</h3>
              </div>
              <div className={styles.helpMenuItems}>
                {helpMenuItems.map(item => (
                  <button
                    key={item.id}
                    className={styles.helpMenuItem}
                    onClick={item.onClick}
                    role="menuitem"
                  >
                    <i className={item.icon} aria-hidden="true"></i>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.userContainer}>
          <button
            ref={userButtonRef}
            className={`${styles.iconButton} ${isUserMenuOpen ? styles.active : ''}`}
            onClick={handleUserClick}
            title="Профиль пользователя"
            aria-label="Профиль пользователя"
            aria-expanded={isUserMenuOpen}
          >
            {userInfo.avatar}
          </button>

          {isUserMenuOpen && (
            <div ref={userMenuRef} className={styles.userMenu} role="menu">
              <div className={styles.userMenuHeader}>
                <div className={styles.userAvatar}>
                  {userInfo.avatar}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{userInfo.name}</div>
                  <div className={styles.userEmail}>{userInfo.email}</div>
                </div>
              </div>
              <div className={styles.userMenuItems}>
                <button
                  className={styles.userMenuItem}
                  onClick={handleViewProfile}
                  role="menuitem"
                >
                  <i className="fas fa-user" aria-hidden="true"></i>
                  <span>Посмотреть профиль</span>
                </button>
                <button
                  className={`${styles.userMenuItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TopNavbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabClick: PropTypes.func.isRequired,
  onHelpClick: PropTypes.func.isRequired,
  onUserClick: PropTypes.func.isRequired,
  showProjectSettings: PropTypes.bool,
  showProjectAdd: PropTypes.bool,
};

export default TopNavbar; 