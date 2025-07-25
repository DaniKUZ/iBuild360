// Утилиты для управления данными пользователя
import plugImg from '../data/img/plug_img.jpeg';

// Данные пользователя по умолчанию (для демо-режима)
const DEFAULT_USER_DATA = {
  id: 'user-1',
  name: 'Александр Иванов',
  firstName: 'Александр',
  lastName: 'Иванов',
  email: 'alexander.ivanov@company.ru',
  role: 'Администратор',
  avatar: 'А',
  company: 'ООО "СтройИнвест"',
  position: 'Руководитель проекта',
  phone: '+7 (999) 123-45-67'
};

// Получение данных пользователя
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      // Проверяем, что все необходимые поля присутствуют
      return {
        ...DEFAULT_USER_DATA,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
  }
  
  // Возвращаем данные по умолчанию, если ничего не найдено
  return DEFAULT_USER_DATA;
};

// Сохранение данных пользователя
export const setUserData = (userData) => {
  try {
    const updatedData = {
      ...getUserData(),
      ...userData
    };
    localStorage.setItem('userData', JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя:', error);
    return getUserData();
  }
};

// Очистка данных пользователя (при выходе)
export const clearUserData = () => {
  try {
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
  } catch (error) {
    console.error('Ошибка при очистке данных пользователя:', error);
  }
};

// Получение аватара пользователя (изображение plug_img.jpeg)
export const getUserAvatar = (userData = null) => {
  return plugImg;
};

// Получение полного имени пользователя
export const getUserFullName = (userData = null) => {
  const user = userData || getUserData();
  return `${user.firstName} ${user.lastName}`.trim() || user.name || 'Пользователь';
};

// Проверка, является ли пользователь администратором
export const isUserAdmin = (userData = null) => {
  const user = userData || getUserData();
  return user.role === 'Администратор';
}; 