export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.propertyName.trim()) {
    errors.propertyName = 'Название объекта обязательно';
  }
  
  if (!formData.address.trim()) {
    errors.address = 'Адрес обязателен';
  }
  
  return errors;
};

export const isFormValid = (formData) => {
  const errors = validateForm(formData);
  return Object.keys(errors).length === 0;
}; 