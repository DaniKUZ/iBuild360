import React from 'react';
import PropTypes from 'prop-types';

function GeneralSection({ formData, errors, onInputChange, onBlur }) {
  return (
    <>
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="constructionStartDate">
            Дата начала строительства
          </label>
          <input
            type="date"
            id="constructionStartDate"
            name="constructionStartDate"
            value={formData.constructionStartDate}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.constructionStartDate ? 'error' : ''}
          />
          {errors.constructionStartDate && (
            <div className="error-message">{errors.constructionStartDate}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="constructionEndDate">
            Дата окончания строительства
          </label>
          <input
            type="date"
            id="constructionEndDate"
            name="constructionEndDate"
            value={formData.constructionEndDate}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.constructionEndDate ? 'error' : ''}
          />
          {errors.constructionEndDate && (
            <div className="error-message">{errors.constructionEndDate}</div>
          )}
        </div>
      </div>
    </>
  );
}

GeneralSection.propTypes = {
  formData: PropTypes.shape({
    propertyName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    constructionStartDate: PropTypes.string,
    constructionEndDate: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

export default GeneralSection; 