export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.propertyName || !formData.propertyName.trim()) {
    errors.propertyName = 'Название объекта обязательно';
  } else if (formData.propertyName.trim().length < 3) {
    errors.propertyName = 'Название объекта должно содержать минимум 3 символа';
  }
  
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'Адрес обязателен';
  } else if (formData.address.trim().length < 5) {
    errors.address = 'Адрес должен содержать минимум 5 символов';
  }
  
  // Проверка координат (опционально)
  if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
    errors.latitude = 'Широта должна быть числом от -90 до 90';
  }

  if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
    errors.longitude = 'Долгота должна быть числом от -180 до 180';
  }
  
  return errors;
};

export const isFormValid = (formData) => {
  const errors = validateForm(formData);
  return Object.keys(errors).length === 0;
};

// Проверка валидности формы для завершения редактирования
export const isFormCompletelyValid = (formData) => {
  const errors = validateForm(formData);
  return Object.keys(errors).length === 0;
};

// Валидация одного поля при выходе из фокуса
export const validateSingleField = (fieldName, value, formData) => {
  const errors = {};
  
  switch (fieldName) {
    case 'propertyName':
      if (!value || !value.trim()) {
        errors.propertyName = 'Название объекта обязательно';
      } else if (value.trim().length < 3) {
        errors.propertyName = 'Название объекта должно содержать минимум 3 символа';
      }
      break;
      
    case 'address':
      if (!value || !value.trim()) {
        errors.address = 'Адрес обязателен';
      } else if (value.trim().length < 5) {
        errors.address = 'Адрес должен содержать минимум 5 символов';
      }
      break;
      
    case 'latitude':
      if (value && (isNaN(value) || value < -90 || value > 90)) {
        errors.latitude = 'Широта должна быть числом от -90 до 90';
      }
      break;
      
    case 'longitude':
      if (value && (isNaN(value) || value < -180 || value > 180)) {
        errors.longitude = 'Долгота должна быть числом от -180 до 180';
      }
      break;
      
    default:
      break;
  }
  
  return errors;
}; 