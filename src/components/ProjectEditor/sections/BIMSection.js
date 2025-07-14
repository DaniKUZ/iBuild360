import React from 'react';
import PropTypes from 'prop-types';

function BIMSection({ 
  dragActive, 
  uploadedFiles, 
  uploadProgress, 
  onDragIn, 
  onDragOut, 
  onDrag, 
  onDrop, 
  onFileInput, 
  onRemoveFile, 
  formatFileSize 
}) {
  return (
    <div className="bim-section">
      <div className="bim-header">
        <h3>
          <i className="fas fa-cube"></i>
          Загрузка BIM
        </h3>
        <p className="bim-description">
          Загрузите BIM-модели для вашего проекта. Поддерживаются форматы: .IFC, .RVT, .BIM
        </p>
      </div>

      <div className="bim-content">
        <div 
          className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={onDragIn}
          onDragLeave={onDragOut}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <div className="drag-drop-content">
            <i className="fas fa-cube drag-drop-icon"></i>
            <h4>Drag and drop here</h4>
            <p>или нажмите кнопку ниже для выбора файлов</p>
            <input
              type="file"
              multiple
              accept=".ifc,.rvt,.bim"
              onChange={onFileInput}
              style={{ display: 'none' }}
              id="bim-file-input"
            />
            <label htmlFor="bim-file-input" className="btn btn-primary upload-btn">
              <i className="fas fa-upload"></i>
              Загрузить
            </label>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h4>Загруженные файлы:</h4>
            <div className="files-list">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <i className="fas fa-cube"></i>
                    </div>
                    <div className="file-details">
                      <h5>{file.name}</h5>
                      <p>{formatFileSize(file.size)} • {file.uploadDate}</p>
                    </div>
                  </div>
                  
                  {uploadProgress[file.id] !== undefined && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        ></div>
                      </div>
                      <span>{uploadProgress[file.id]}%</span>
                    </div>
                  )}
                  
                  <button 
                    className="remove-file-btn"
                    onClick={() => onRemoveFile(file.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bim-instructions">
          <h4>Инструкции по загрузке:</h4>
          <ul>
            <li>Поддерживаемые форматы: .IFC, .RVT, .BIM</li>
            <li>Максимальный размер файла: 500 MB</li>
            <li>Можно загружать несколько файлов одновременно</li>
            <li>Файлы будут автоматически обработаны после загрузки</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

BIMSection.propTypes = {
  dragActive: PropTypes.bool.isRequired,
  uploadedFiles: PropTypes.array.isRequired,
  uploadProgress: PropTypes.object.isRequired,
  onDragIn: PropTypes.func.isRequired,
  onDragOut: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileInput: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired
};

export default BIMSection; 