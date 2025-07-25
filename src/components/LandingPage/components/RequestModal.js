import React, { useState, useEffect } from 'react';
import PhoneInput from './PhoneInput';
import styles from './RequestModal.module.css';

const RequestModal = ({ isOpen, onClose, onSubmit, requestType = 'demo' }) => {
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

  // Определяем заголовок и описание в зависимости от типа запроса
  const getModalContent = () => {
    switch (requestType) {
      case 'expert':
        return {
          title: 'Поговорить с экспертом',
          description: 'Получите персональную консультацию от нашего эксперта по внедрению Napoleon Build в ваш строительный процесс.'
        };
      case 'demo':
      default:
        return {
          title: 'Получить демо',
          description: 'Запросите демонстрацию платформы Napoleon Build и убедитесь в эффективности нашего решения.'
        };
    }
  };

  const { title, description } = getModalContent();

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
        fullPhone: `${formData.countryCode} ${formData.phone}`,
        requestType
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

      // Показываем уведомление об успехе в зависимости от типа запроса
      const successMessage = requestType === 'expert' 
        ? 'Запрос на консультацию успешно отправлен! Наш эксперт свяжется с вами в ближайшее время.'
        : 'Запрос на демо успешно отправлен! Мы свяжемся с вами для организации демонстрации.';
      
      alert(successMessage);

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
    <div className={styles.requestModalOverlay} onClick={handleOverlayClick}>
      <div className={styles.requestModal}>
        <div className={styles.requestModalHeader}>
          <h2>{title}</h2>
          <button 
            className={styles.requestModalClose}
            onClick={handleClose}
            aria-label="Закрыть модальное окно"
          >
            ×
          </button>
        </div>

        <div className={styles.requestModalBody}>
          <p className={styles.requestModalDescription}>
            {description}
          </p>

          <form onSubmit={handleSubmit} className={styles.requestForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.formLabel}>
                  Имя *
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`${styles.formInput} ${errors.firstName ? styles.error : ''}`}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите ваше имя"
                />
                {errors.firstName && (
                  <span className={styles.formError}>{errors.firstName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.formLabel}>
                  Фамилия *
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`${styles.formInput} ${errors.lastName ? styles.error : ''}`}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите вашу фамилию"
                />
                {errors.lastName && (
                  <span className={styles.formError}>{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Электронная почта *
              </label>
              <input
                type="email"
                id="email"
                className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@company.com"
              />
              {errors.email && (
                <span className={styles.formError}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Номер телефона *
              </label>
              <PhoneInput
                value={formData.phone}
                countryCode={formData.countryCode}
                onChange={handlePhoneChange}
                error={errors.phone}
              />
              {errors.phone && (
                <span className={styles.formError}>{errors.phone}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="company" className={styles.formLabel}>
                Название компании *
              </label>
              <input
                type="text"
                id="company"
                className={`${styles.formInput} ${errors.company ? styles.error : ''}`}
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="ООО 'Название компании'"
              />
              {errors.company && (
                <span className={styles.formError}>{errors.company}</span>
              )}
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Отправка...
                  </>
                ) : (
                  requestType === 'expert' ? 'Запросить консультацию' : 'Запросить демо'
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