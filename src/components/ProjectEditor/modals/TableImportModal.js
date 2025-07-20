import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';

const TableImportModal = ({ 
  isOpen, 
  onClose, 
  onImport 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    startDate: '',
    endDate: '',
    progress: '',
    status: '',
    description: '',
    responsible: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Поддерживаемые типы файлов
  const supportedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ];

  // Обработка drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Обработка выбора файла
  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  // Основная функция обработки файла
  const handleFile = useCallback(async (file) => {
    if (!supportedTypes.includes(file.type)) {
      setError('Поддерживаются только файлы Excel (.xlsx, .xls) и CSV');
      return;
    }

    setError('');
    setLoading(true);
    setSelectedFile(file);

    try {
      let data;
      
      if (file.type.includes('csv')) {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }
      
      setParsedData(data);
      autoMapColumns(data.headers);
    } catch (err) {
      setError(`Ошибка при обработке файла: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Парсинг CSV файла с улучшенной обработкой
  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          
          // Функция для парсинга CSV строки с учётом кавычек
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            let quoteChar = null;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
              } else if (inQuotes && char === quoteChar) {
                // Проверяем на двойные кавычки
                if (line[i + 1] === quoteChar) {
                  current += quoteChar;
                  i++; // пропускаем следующую кавычку
                } else {
                  inQuotes = false;
                  quoteChar = null;
                }
              } else if (!inQuotes && char === ',') {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            
            result.push(current.trim());
            return result;
          };
          
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('Файл пуст'));
            return;
          }
          
          // Парсим заголовки
          const headers = parseCSVLine(lines[0]).filter(h => h);
          
          if (headers.length === 0) {
            reject(new Error('Не найдены заголовки столбцов'));
            return;
          }
          
          // Парсим данные
          const rows = lines.slice(1)
            .map(line => {
              const values = parseCSVLine(line);
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            })
            .filter(row => Object.values(row).some(v => v.trim()));
          
          resolve({ headers, rows });
        } catch (error) {
          reject(new Error(`Ошибка парсинга CSV файла: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file, 'utf-8');
    });
  };

  // Парсинг Excel файла
  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Берем первый лист
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Конвертируем в JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '' 
          });
          
          if (jsonData.length === 0) {
            reject(new Error('Файл пуст или не содержит данных'));
            return;
          }
          
          // Первая строка - заголовки
          const headers = jsonData[0].map(h => String(h || '').trim()).filter(h => h);
          
          if (headers.length === 0) {
            reject(new Error('Не найдены заголовки столбцов'));
            return;
          }
          
          // Остальные строки - данные
          const rows = jsonData.slice(1)
            .filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
            .map(row => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = String(row[index] || '').trim();
              });
              return rowData;
            })
            .filter(row => Object.values(row).some(v => v.trim()));
          
          resolve({ headers, rows });
        } catch (error) {
          reject(new Error(`Ошибка парсинга Excel файла: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Автоматическое сопоставление колонок
  const autoMapColumns = (headers) => {
    const mapping = { ...columnMapping };
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('название') || lowerHeader.includes('задача') || lowerHeader.includes('name')) {
        mapping.name = header;
      } else if (lowerHeader.includes('начало') || lowerHeader.includes('start')) {
        mapping.startDate = header;
      } else if (lowerHeader.includes('окончание') || lowerHeader.includes('конец') || lowerHeader.includes('end')) {
        mapping.endDate = header;
      } else if (lowerHeader.includes('прогресс') || lowerHeader.includes('progress') || lowerHeader.includes('%')) {
        mapping.progress = header;
      } else if (lowerHeader.includes('статус') || lowerHeader.includes('status')) {
        mapping.status = header;
      } else if (lowerHeader.includes('описание') || lowerHeader.includes('description')) {
        mapping.description = header;
      } else if (lowerHeader.includes('ответственный') || lowerHeader.includes('responsible')) {
        mapping.responsible = header;
      }
    });
    
    setColumnMapping(mapping);
  };

  // Обновление сопоставления колонок
  const updateColumnMapping = (field, value) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Преобразование данных в задачи
  const convertToTasks = () => {
    if (!parsedData || !columnMapping.name) {
      setError('Необходимо указать колонку с названием задач');
      return;
    }

    const tasks = parsedData.rows.map((row, index) => {
      const task = {
        id: Date.now() + index,
        name: row[columnMapping.name] || `Задача ${index + 1}`,
        startDate: parseDate(row[columnMapping.startDate]) || new Date().toISOString().split('T')[0],
        endDate: parseDate(row[columnMapping.endDate]) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: parseInt(row[columnMapping.progress]) || 0,
        status: parseStatus(row[columnMapping.status]) || 'planned',
        description: row[columnMapping.description] || '',
        responsible: row[columnMapping.responsible] || '',
        dependencies: []
      };

      // Валидация прогресса
      task.progress = Math.max(0, Math.min(100, task.progress));

      return task;
    }).filter(task => task.name.trim());

    return tasks;
  };

  // Парсинг даты с поддержкой Excel формата
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Убираем пробелы
    const cleanDateStr = String(dateStr).trim();
    
    // Проверяем на Excel serial date (число дней с 1 января 1900)
    if (/^\d+(\.\d+)?$/.test(cleanDateStr)) {
      const excelDate = parseFloat(cleanDateStr);
      if (excelDate > 1 && excelDate < 100000) { // разумные границы для Excel дат
        // Excel считает 1 января 1900 как день 1, но есть баг с 1900 годом
        const excelEpoch = new Date(1899, 11, 30); // 30 декабря 1899
        const msPerDay = 24 * 60 * 60 * 1000;
        const resultDate = new Date(excelEpoch.getTime() + excelDate * msPerDay);
        
        if (!isNaN(resultDate.getTime())) {
          return resultDate.toISOString().split('T')[0];
        }
      }
    }
    
    // Стандартный парсинг даты
    const date = new Date(cleanDateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Попробуем различные форматы дат
    const formats = [
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/,        // DD.MM.YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,        // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,          // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/,          // DD-MM-YYYY
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,        // YYYY/MM/DD
      /(\d{1,2})\s+(\w+)\s+(\d{4})/,          // DD Month YYYY
    ];
    
    for (const format of formats) {
      const match = cleanDateStr.match(format);
      if (match) {
        let day, month, year;
        
        if (format.source.includes('(\\d{4}).*?(\\d{1,2}).*?(\\d{1,2})')) {
          // YYYY-MM-DD или YYYY/MM/DD формат
          [, year, month, day] = match;
        } else {
          // DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY формат
          [, day, month, year] = match;
        }
        
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  };

  // Парсинг статуса
  const parseStatus = (statusStr) => {
    if (!statusStr) return 'planned';
    
    const status = statusStr.toLowerCase();
    if (status.includes('завершен') || status.includes('complete')) return 'completed';
    if (status.includes('работе') || status.includes('progress')) return 'in_progress';
    return 'planned';
  };

  // Импорт данных
  const handleImport = () => {
    const tasks = convertToTasks();
    if (tasks.length === 0) {
      setError('Не удалось создать задачи из файла');
      return;
    }
    
    onImport(tasks);
    handleClose();
  };

  // Закрытие модального окна
  const handleClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setColumnMapping({
      name: '',
      startDate: '',
      endDate: '',
      progress: '',
      status: '',
      description: '',
      responsible: ''
    });
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content table-import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-file-import"></i>
            Импорт данных из таблицы
          </h3>
          <button className="btn-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {!parsedData ? (
            <>
              {/* Зона загрузки файла */}
              <div 
                className={`file-drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="drop-zone-content">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Перетащите файл сюда или выберите</p>
                  <input
                    type="file"
                    id="file-input"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input" className="btn btn-primary">
                    Выбрать файл
                  </label>
                  <p className="file-types">Поддерживаются: Excel (.xlsx, .xls), CSV файлы</p>
                </div>
              </div>

              {loading && (
                <div className="loading-indicator">
                  <i className="fas fa-spinner fa-spin"></i>
                  Обработка файла...
                </div>
              )}
            </>
          ) : (
            <>
              {/* Настройка сопоставления колонок */}
              <div className="column-mapping">
                <h4>Сопоставление колонок</h4>
                <p>Укажите, какие колонки соответствуют полям задач:</p>
                
                <div className="mapping-grid">
                  <div className="mapping-item">
                    <label>Название задачи *</label>
                    <select 
                      value={columnMapping.name} 
                      onChange={e => updateColumnMapping('name', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Дата начала</label>
                    <select 
                      value={columnMapping.startDate} 
                      onChange={e => updateColumnMapping('startDate', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Дата окончания</label>
                    <select 
                      value={columnMapping.endDate} 
                      onChange={e => updateColumnMapping('endDate', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Прогресс (%)</label>
                    <select 
                      value={columnMapping.progress} 
                      onChange={e => updateColumnMapping('progress', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Статус</label>
                    <select 
                      value={columnMapping.status} 
                      onChange={e => updateColumnMapping('status', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Описание</label>
                    <select 
                      value={columnMapping.description} 
                      onChange={e => updateColumnMapping('description', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mapping-item">
                    <label>Ответственный</label>
                    <select 
                      value={columnMapping.responsible} 
                      onChange={e => updateColumnMapping('responsible', e.target.value)}
                    >
                      <option value="">Выберите колонку</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Превью данных */}
              <div className="data-preview">
                <h4>Превью данных ({parsedData.rows.length} строк)</h4>
                <div className="preview-table">
                  <table>
                    <thead>
                      <tr>
                        {parsedData.headers.map(header => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {parsedData.headers.map(header => (
                            <td key={header}>{row[header] || '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 5 && (
                    <p className="preview-note">... и еще {parsedData.rows.length - 5} строк</p>
                  )}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          {parsedData && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => setParsedData(null)}
              >
                Выбрать другой файл
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleImport}
                disabled={!columnMapping.name}
              >
                <i className="fas fa-download"></i>
                Импортировать задачи
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

TableImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
};

export default TableImportModal; 