import { useState, useRef, useEffect, useCallback } from 'react';

function useFileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const activeIntervals = useRef(new Set());
  const fileIntervals = useRef(new Map());

  // Очищаем все активные интервалы при размонтировании
  useEffect(() => {
    return () => {
      activeIntervals.current.forEach(interval => {
        clearInterval(interval);
      });
      activeIntervals.current.clear();
      fileIntervals.current.clear();
    };
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const simulateUpload = useCallback((fileId) => {
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[fileId] || 0;
        const newProgress = Math.min(currentProgress + 10, 100);
        
        if (newProgress === 100) {
          clearInterval(interval);
          activeIntervals.current.delete(interval);
          fileIntervals.current.delete(fileId);
          setTimeout(() => {
            setUploadProgress(prev => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });
          }, 1000);
        }
        
        return { ...prev, [fileId]: newProgress };
      });
    }, 200);

    activeIntervals.current.add(interval);
    fileIntervals.current.set(fileId, interval);
    
    return interval;
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files) => {
    const validExtensions = ['.ifc', '.rvt', '.bim'];
    const validFiles = files.filter(file => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return validExtensions.includes(extension);
    });

    if (validFiles.length === 0) {
      alert('Пожалуйста, выберите файлы с расширением .IFC, .RVT или .BIM');
      return;
    }

    // Фильтруем файлы, исключая дубликаты
    const newFiles = validFiles.filter(file => {
      const isDuplicate = uploadedFiles.some(uploadedFile => 
        uploadedFile.name === file.name && uploadedFile.size === file.size
      );
      return !isDuplicate;
    });

    if (newFiles.length === 0) {
      alert('Выбранные файлы уже загружены');
      return;
    }

    if (newFiles.length < validFiles.length) {
      const duplicateCount = validFiles.length - newFiles.length;
      alert(`${duplicateCount} файл(ов) уже загружен(ы) и будет пропущен(ы)`);
    }

    newFiles.forEach(file => {
      const fileId = Date.now() + Math.random();
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toLocaleDateString()
      };

      setUploadedFiles(prev => [...prev, newFile]);
      simulateUpload(fileId);
    });
  }, [uploadedFiles, simulateUpload]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Очищаем input для возможности повторной загрузки того же файла
    e.target.value = '';
  }, [handleFiles]);

  const handleRemoveFile = useCallback((fileId) => {
    // Останавливаем загрузку, если она еще идет
    const interval = fileIntervals.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      activeIntervals.current.delete(interval);
      fileIntervals.current.delete(fileId);
    }
    
    // Удаляем файл из списка
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Убираем прогресс загрузки
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  }, []);

  return {
    dragActive,
    uploadedFiles,
    uploadProgress,
    formatFileSize,
    handleDrag,
    handleDragIn,
    handleDragOut,
    handleDrop,
    handleFileInput,
    handleRemoveFile
  };
}

export default useFileUpload; 