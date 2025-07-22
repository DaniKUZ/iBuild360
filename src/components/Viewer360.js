// Обновленный Viewer360 с использованием Three.js
// Этот файл теперь является оберткой для нового компонента
import React from 'react';
import Viewer360Container from './Viewer360/Viewer360Container';

// Реэкспорт нового компонента для обратной совместимости
const Viewer360 = (props) => {
  return <Viewer360Container {...props} />;
};

// Используем те же PropTypes что и в контейнере
Viewer360.propTypes = Viewer360Container.propTypes;

export default Viewer360; 