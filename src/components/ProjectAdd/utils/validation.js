// Валидация для формы добавления проекта
export const validateAddForm = (formData) => {
  const errors = {};

  // Проверка имени
  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.firstName = 'Имя обязательно для заполнения';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'Имя должно содержать минимум 2 символа';
  }

  // Проверка фамилии
  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Фамилия обязательна для заполнения';
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'Фамилия должна содержать минимум 2 символа';
  }



  // Проверка названия объекта
  if (!formData.propertyName || formData.propertyName.trim() === '') {
    errors.propertyName = 'Название объекта обязательно для заполнения';
  } else if (formData.propertyName.trim().length < 3) {
    errors.propertyName = 'Название объекта должно содержать минимум 3 символа';
  }

  // Проверка адреса
  if (!formData.address || formData.address.trim() === '') {
    errors.address = 'Адрес обязателен для заполнения';
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

  // Проверка корректности дат (только если обе заполнены)
  if (formData.constructionStartDate && formData.constructionEndDate) {
    const startDate = new Date(formData.constructionStartDate);
    const endDate = new Date(formData.constructionEndDate);
    
    if (startDate >= endDate) {
      errors.constructionEndDate = 'Дата окончания должна быть позже даты начала строительства';
    }
  }

  return errors;
};

// Проверка валидности всей формы
export const isAddFormValid = (formData) => {
  // Проверяем только основные обязательные поля для первой страницы
  const requiredFields = ['firstName', 'lastName', 'propertyName', 'address'];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      return false;
    }
  }
  
  // Дополнительные проверки
  if (formData.firstName && formData.firstName.trim().length < 2) return false;
  if (formData.lastName && formData.lastName.trim().length < 2) return false;
  if (formData.propertyName && formData.propertyName.trim().length < 3) return false;
  if (formData.address && formData.address.trim().length < 5) return false;
  
  // Проверка корректности дат
  if (formData.constructionStartDate && formData.constructionEndDate) {
    const startDate = new Date(formData.constructionStartDate);
    const endDate = new Date(formData.constructionEndDate);
    if (startDate >= endDate) {
      return false;
    }
  }
  
  return true;
};

// Проверка валидности формы для завершения проекта
export const isAddFormCompletelyValid = (formData) => {
  const errors = validateAddForm(formData);
  return Object.keys(errors).length === 0;
};

// Валидация отдельного поля для onBlur
export const validateSingleField = (fieldName, value, formData) => {
  const errors = {};

  switch (fieldName) {
    case 'firstName':
      if (!value || value.trim() === '') {
        errors.firstName = 'Имя обязательно для заполнения';
      } else if (value.trim().length < 2) {
        errors.firstName = 'Имя должно содержать минимум 2 символа';
      }
      break;

    case 'lastName':
      if (!value || value.trim() === '') {
        errors.lastName = 'Фамилия обязательна для заполнения';
      } else if (value.trim().length < 2) {
        errors.lastName = 'Фамилия должна содержать минимум 2 символа';
      }
      break;

    case 'propertyName':
      if (!value || value.trim() === '') {
        errors.propertyName = 'Название объекта обязательно для заполнения';
      } else if (value.trim().length < 3) {
        errors.propertyName = 'Название объекта должно содержать минимум 3 символа';
      }
      break;

    case 'address':
      if (!value || value.trim() === '') {
        errors.address = 'Адрес обязателен для заполнения';
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

    case 'constructionStartDate':
      if (value && formData.constructionEndDate) {
        const startDate = new Date(value);
        const endDate = new Date(formData.constructionEndDate);
        if (startDate >= endDate) {
          errors.constructionStartDate = 'Дата начала должна быть раньше даты окончания';
        }
      }
      break;

    case 'constructionEndDate':
      if (value && formData.constructionStartDate) {
        const startDate = new Date(formData.constructionStartDate);
        const endDate = new Date(value);
        if (startDate >= endDate) {
          errors.constructionEndDate = 'Дата окончания должна быть позже даты начала строительства';
        }
      }
      break;

    default:
      break;
  }

  return errors;
}; 