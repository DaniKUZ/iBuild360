import { useState, useCallback } from 'react';

const useDroneVideoManagement = (initialVideos = []) => {
  const [videos, setVideos] = useState(initialVideos);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Обработчики drag and drop
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

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processVideoFiles(files);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    processVideoFiles(files);
    // Очищаем input для возможности повторной загрузки того же файла
    e.target.value = '';
  }, []);

  // Обработка файлов
  const processVideoFiles = useCallback((files) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      alert('Пожалуйста, выберите видеофайлы');
      return;
    }

    videoFiles.forEach(file => {
      // Проверяем размер файла (максимум 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер: 2GB`);
        return;
      }

      const videoId = Date.now() + Math.random();
      
      // Создаем объект видео
      const newVideo = {
        id: videoId,
        fileName: file.name,
        name: file.name.replace(/\.[^/.]+$/, ''), // Убираем расширение
        size: file.size,
        type: file.type,
        file: file,
        uploadDate: new Date().toISOString().split('T')[0],
        date: '',
        description: '',
        thumbnail: null,
        duration: null
      };

      // Добавляем видео в список
      setVideos(prev => [...prev, newVideo]);

      // Генерируем thumbnail (если возможно)
      generateVideoThumbnail(file, videoId);

      // Имитируем загрузку с прогрессом
      simulateUpload(videoId);
    });
  }, []);

  // Генерация thumbnail для видео
  const generateVideoThumbnail = useCallback((file, videoId) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Берем кадр на 1 секунде
      video.currentTime = 1;
    };

    video.onloadeddata = () => {
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      
      // Обновляем видео с thumbnail
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, thumbnail, duration: formatDuration(video.duration) } : v
      ));
    };

    video.src = URL.createObjectURL(file);
  }, []);

  // Имитация загрузки
  const simulateUpload = useCallback((videoId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => {
          const { [videoId]: removed, ...rest } = prev;
          return rest;
        });
      } else {
        setUploadProgress(prev => ({ ...prev, [videoId]: Math.round(progress) }));
      }
    }, 200);
  }, []);

  // Форматирование длительности
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Удаление видео
  const removeVideo = useCallback((videoId) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    setUploadProgress(prev => {
      const { [videoId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Обновление названия видео
  const updateVideoName = useCallback((videoId, name) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, name } : v
    ));
  }, []);

  // Обновление даты видео
  const updateVideoDate = useCallback((videoId, date) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, date } : v
    ));
  }, []);

  // Обновление описания видео
  const updateVideoDescription = useCallback((videoId, description) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, description } : v
    ));
  }, []);

  // Форматирование размера файла
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    videos,
    dragActive,
    uploadProgress,
    handleDragIn,
    handleDragOut,
    handleDrag,
    handleDrop,
    handleFileInput,
    removeVideo,
    updateVideoName,
    updateVideoDate,
    updateVideoDescription,
    formatFileSize,
    setVideos
  };
};

export default useDroneVideoManagement;