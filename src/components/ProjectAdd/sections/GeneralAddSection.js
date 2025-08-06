import React from 'react';
import PropTypes from 'prop-types';

function GeneralAddSection({ formData, errors, onInputChange, onBlur }) {

  return (
    <>
      <div className="form-group">
        <label>Тип проекта</label>
        <div className="project-type-toggle">
          <label className="project-type-option">
            <input
              type="radio"
              name="projectType"
              value="roads"
              checked={formData.projectType === 'roads'}
              onChange={onInputChange}
            />
            <span>Дороги</span>
          </label>
          <label className="project-type-option">
            <input
              type="radio"
              name="projectType"
              value="object"
              checked={formData.projectType === 'object'}
              onChange={onInputChange}
            />
            <span>Объект</span>
          </label>
        </div>
      </div>
      
      {formData.projectType === 'object' && (
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
      )}

      {formData.projectType === 'roads' && (
        <div className="form-group">
          <label htmlFor="propertyName">
            Название дорожного участка <span className="required">*</span>
          </label>
          <input
            type="text"
            id="propertyName"
            name="propertyName"
            value={formData.propertyName}
            onChange={onInputChange}
            onBlur={onBlur}
            className={errors.propertyName ? 'error' : ''}
            placeholder="Например: Автодорога М-1 Москва-Минск"
          />
          {errors.propertyName && (
            <span className="error-message">{errors.propertyName}</span>
          )}
        </div>
      )}

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

      {formData.projectType === 'object' && (
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
      )}

      {formData.projectType === 'roads' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roadLength">
                Протяженность дороги (км)
              </label>
              <input
                type="number"
                id="roadLength"
                name="roadLength"
                value={formData.roadLength || ''}
                onChange={onInputChange}
                onBlur={onBlur}
                className={errors.roadLength ? 'error' : ''}
                placeholder="0.0"
                step="0.1"
                min="0"
              />
              {errors.roadLength && (
                <div className="error-message">{errors.roadLength}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="roadCategory">
                Категория дороги
              </label>
              <select
                id="roadCategory"
                name="roadCategory"
                value={formData.roadCategory || ''}
                onChange={onInputChange}
                onBlur={onBlur}
                className={errors.roadCategory ? 'error' : ''}
              >
                <option value="">Выберите категорию</option>
                <option value="federal">Федеральная</option>
                <option value="regional">Региональная</option>
                <option value="municipal">Муниципальная</option>
                <option value="local">Местная</option>
              </select>
              {errors.roadCategory && (
                <div className="error-message">{errors.roadCategory}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="surveyStartDate">
                Дата начала обследования
              </label>
              <input
                type="date"
                id="surveyStartDate"
                name="surveyStartDate"
                value={formData.surveyStartDate || ''}
                onChange={onInputChange}
                onBlur={onBlur}
                className={errors.surveyStartDate ? 'error' : ''}
              />
              {errors.surveyStartDate && (
                <div className="error-message">{errors.surveyStartDate}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="surveyEndDate">
                Дата окончания обследования
              </label>
              <input
                type="date"
                id="surveyEndDate"
                name="surveyEndDate"
                value={formData.surveyEndDate || ''}
                onChange={onInputChange}
                onBlur={onBlur}
                className={errors.surveyEndDate ? 'error' : ''}
              />
              {errors.surveyEndDate && (
                <div className="error-message">{errors.surveyEndDate}</div>
              )}
            </div>
          </div>
        </>
      )}


    </>
  );
}

GeneralAddSection.propTypes = {
  formData: PropTypes.shape({
    propertyName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    constructionStartDate: PropTypes.string,
    constructionEndDate: PropTypes.string,
    projectType: PropTypes.oneOf(['roads', 'object']).isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

export default GeneralAddSection; 