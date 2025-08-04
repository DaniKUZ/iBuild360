// Импорты изображений OP второго этажа
import opImg1Current from '../../../data/img/OPImg360_1_floor2.jpg';
import opImg2Current from '../../../data/img/OPImg360_2_floor2.jpg';
import opImg3Current from '../../../data/img/OPImg360_3_floor2.jpg';
import opImg4Current from '../../../data/img/OPImg360_4_floor2.jpg';
import opImg5Current from '../../../data/img/OPImg360_5_floor2.jpg';

import opImg1Past from '../../../data/img/OPImg360_1_past_floor2.jpg';
import opImg2Past from '../../../data/img/OPImg360_2_past_floor2.jpg';
import opImg3Past from '../../../data/img/OPImg360_3_past_floor2.jpg';
import opImg4Past from '../../../data/img/OPImg360_4_past_floor2.jpg';
import opImg5Past from '../../../data/img/OPImg360_5_past_floor2.jpg';

import opImg1PastPast from '../../../data/img/OPImg360_1_past_past_floor2.jpg';
import opImg2PastPast from '../../../data/img/OPImg360_2_past_past_floor2.jpg';
import opImg3PastPast from '../../../data/img/OPImg360_3_past_past_floor2.jpg';
import opImg4PastPast from '../../../data/img/OPImg360_4_past_past_floor2.jpg';
import opImg5PastPast from '../../../data/img/OPImg360_5_past_past_floor2.jpg';

// Импорты изображений OP первого этажа
import opImg1CurrentFloor1 from '../../../data/img/OPImg360_1_floor1.jpg';
import opImg2CurrentFloor1 from '../../../data/img/OPImg360_2_floor1.jpg';
import opImg3CurrentFloor1 from '../../../data/img/OPImg360_3_floor1.jpg';

import opImg1PastFloor1 from '../../../data/img/OPImg360_1_past_floor1.jpg';
import opImg2PastFloor1 from '../../../data/img/OPImg360_2_past_floor1.jpg';
import opImg3PastFloor1 from '../../../data/img/OPImg360_3_past_floor1.jpg';

import opImg1PastPastFloor1 from '../../../data/img/OPImg360_1_past_past_floor1.jpg';
import opImg2PastPastFloor1 from '../../../data/img/OPImg360_2_past_past_floor1.jpg';
import opImg3PastPastFloor1 from '../../../data/img/OPImg360_3_past_past_floor1.jpg';

import img360 from '../../../data/img/img360.jpg';

// Константы для изображений второго этажа
export const FLOOR2_IMAGES = {
  current: [
    opImg1Current,
    opImg2Current,
    opImg3Current,
    opImg4Current,
    opImg5Current,
  ],
  past: [
    opImg1Past,
    opImg2Past,
    opImg3Past,
    opImg4Past,
    opImg5Past,
  ],
  pastPast: [
    opImg1PastPast,
    opImg2PastPast,
    opImg3PastPast,
    opImg4PastPast,
    opImg5PastPast,
  ],
};

// Константы для изображений первого этажа
export const FLOOR1_IMAGES = {
  current: [
    opImg1CurrentFloor1,
    opImg2CurrentFloor1,
    opImg3CurrentFloor1,
  ],
  past: [
    opImg1PastFloor1,
    opImg2PastFloor1,
    opImg3PastFloor1,
  ],
  pastPast: [
    opImg1PastPastFloor1,
    opImg2PastPastFloor1,
    opImg3PastPastFloor1,
  ],
};

// Базовое изображение
export const DEFAULT_360_IMAGE = img360;

// Функция для получения изображения по этажу, индексу и типу
export const getImageByFloorAndType = (floor, index, type = 'current') => {
  const images = floor === 1 ? FLOOR1_IMAGES : FLOOR2_IMAGES;
  const imageArray = images[type];
  
  if (!imageArray || index < 1 || index > imageArray.length) {
    return DEFAULT_360_IMAGE;
  }
  
  return imageArray[index - 1]; // Преобразуем 1-based index в 0-based
};

// Функция для получения количества изображений на этаже
export const getImageCountForFloor = (floor) => {
  return floor === 1 ? FLOOR1_IMAGES.current.length : FLOOR2_IMAGES.current.length;
};

// Типы периодов времени
export const TIME_PERIODS = {
  CURRENT: 'current',
  PAST: 'past',
  PAST_PAST: 'pastPast',
};

// Доступные этажи
export const AVAILABLE_FLOORS = [1, 2];

// Экспорты отдельных изображений для обратной совместимости
export {
  // Floor 2 - Current
  opImg1Current,
  opImg2Current,
  opImg3Current,
  opImg4Current,
  opImg5Current,
  // Floor 2 - Past
  opImg1Past,
  opImg2Past,
  opImg3Past,
  opImg4Past,
  opImg5Past,
  // Floor 2 - Past Past
  opImg1PastPast,
  opImg2PastPast,
  opImg3PastPast,
  opImg4PastPast,
  opImg5PastPast,
  // Floor 1 - Current
  opImg1CurrentFloor1,
  opImg2CurrentFloor1,
  opImg3CurrentFloor1,
  // Floor 1 - Past
  opImg1PastFloor1,
  opImg2PastFloor1,
  opImg3PastFloor1,
  // Floor 1 - Past Past
  opImg1PastPastFloor1,
  opImg2PastPastFloor1,
  opImg3PastPastFloor1,
};