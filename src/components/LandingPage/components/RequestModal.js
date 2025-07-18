import React, { useState, useEffect } from 'react';
import PhoneInput from './PhoneInput';
import './RequestModal.css';

const RequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+7',
    company: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    // Сбрасываем ошибки валидации при закрытии
    setErrors({});
    // Сбрасываем состояние отправки
    setIsSubmitting(false);
    onClose();
  };

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл body когда модальное окно открыто
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting]);

  const validateForm = () => {
    const newErrors = {};

    // Валидация имени
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }

    // Валидация фамилии
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна для заполнения';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    // Валидация телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Номер телефона обязателен для заполнения';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    // Валидация компании
    if (!formData.company.trim()) {
      newErrors.company = 'Название компании обязательно для заполнения';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Название компании должно содержать минимум 2 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (phone, countryCode) => {
    setFormData(prev => ({
      ...prev,
      phone,
      countryCode
    }));

    // Очищаем ошибку для телефона при изменении
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Имитация отправки данных
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Вызываем callback с данными формы
      onSubmit({
        ...formData,
        fullPhone: `${formData.countryCode} ${formData.phone}`
      });

      // Сброс формы
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '+7',
        company: ''
      });

      // Сброс ошибок
      setErrors({});

      // Закрываем модальное окно
      onClose();

      // Показываем уведомление об успехе
      alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');

    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
      alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="request-modal-overlay" onClick={handleOverlayClick}>
      <div className="request-modal">
        <div className="request-modal-header">
          <h2>Оставить заявку</h2>
          <button 
            className="request-modal-close"
            onClick={handleClose}
            aria-label="Закрыть модальное окно"
          >
            ×
          </button>
        </div>

        <div className="request-modal-body">
          <p className="request-modal-description">
            Заполните форму ниже, и наш менеджер свяжется с вами для обсуждения деталей сотрудничества.
          </p>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Имя *
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите ваше имя"
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Фамилия *
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите вашу фамилию"
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Электронная почта *
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@company.com"
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Номер телефона *
              </label>
              <PhoneInput
                value={formData.phone}
                countryCode={formData.countryCode}
                onChange={handlePhoneChange}
                error={errors.phone}
              />
              {errors.phone && (
                <span className="form-error">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Название компании *
              </label>
              <input
                type="text"
                id="company"
                className={`form-input ${errors.company ? 'error' : ''}`}
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="ООО 'Название компании'"
              />
              {errors.company && (
                <span className="form-error">{errors.company}</span>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Отправка...
                  </>
                ) : (
                  'Отправить заявку'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal; 