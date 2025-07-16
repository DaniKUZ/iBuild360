import React from 'react';
import PropTypes from 'prop-types';
import { projectStatuses } from '../../../data/mockData';

function GeneralAddSection({ formData, errors, onInputChange, onBlur }) {

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">
            Имя <span className="required">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.firstName ? 'error' : ''}
            placeholder="Введите имя"
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">
            Фамилия <span className="required">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.lastName ? 'error' : ''}
            placeholder="Введите фамилию"
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
          )}
        </div>
      </div>



      <div className="form-group">
        <label htmlFor="propertyName">
          Название объекта <span className="required">*</span>
        </label>
        <input
          type="text"
          id="propertyName"
          name="propertyName"
          value={formData.propertyName}
          onChange={onInputChange}
          onBlur={onBlur}
          className={errors.propertyName ? 'error' : ''}
          placeholder="Введите название объекта"
        />
        {errors.propertyName && (
          <span className="error-message">{errors.propertyName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address">
          Адрес <span className="required">*</span>
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          onBlur={onBlur}
          className={errors.address ? 'error' : ''}
          placeholder="Введите адрес объекта"
        />
        {errors.address && (
          <span className="error-message">{errors.address}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Широта</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.latitude ? 'error' : ''}
            placeholder="0.000000"
            step="any"
          />
          {errors.latitude && (
            <span className="error-message">{errors.latitude}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="longitude">Долгота</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.longitude ? 'error' : ''}
            placeholder="0.000000"
            step="any"
          />
          {errors.longitude && (
            <span className="error-message">{errors.longitude}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status">Статус проекта</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={onInputChange}
          className="form-select"
        >
          <option value="" disabled>Выберите статус</option>
          {projectStatuses.filter(s => s.value !== 'all').map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>


    </>
  );
}

GeneralAddSection.propTypes = {
  formData: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    propertyName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string.isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

export default GeneralAddSection; 