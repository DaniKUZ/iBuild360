import { useState, useCallback } from 'react';

const useVideo360Management = (initialVideos = []) => {
  const [videos, setVideos] = useState(initialVideos);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Добавление нового видео
  const addVideo = useCallback((file, name) => {
    const newVideo = {
      id: Date.now() + Math.random(),
      file: file,
      name: name || file.name.replace(/\.[^/.]+$/, ""), // Убираем расширение из названия
      fileName: file.name,
      size: file.size,
      uploadDate: new Date().toLocaleDateString('ru-RU'),
      duration: null, // Будет определена после загрузки
      thumbnail: null, // Будет сгенерирована после загрузки
      status: 'uploading' // uploading, ready, error
    };

    setVideos(prev => [...prev, newVideo]);

    // Симуляция прогресса загрузки
    simulateUpload(newVideo.id);

    return newVideo.id;
  }, []);

  // Симуляция загрузки видео
  const simulateUpload = useCallback((videoId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [videoId]: 100 }));
        setVideos(prev => prev.map(video => 
          video.id === videoId ? { ...video, status: 'ready' } : video
        ));
      } else {
        setUploadProgress(prev => ({ ...prev, [videoId]: progress }));
      }
    }, 200);
  }, []);

  // Обновление названия видео
  const updateVideoName = useCallback((videoId, newName) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, name: newName } : video
    ));
  }, []);

  // Удаление видео
  const removeVideo = useCallback((videoId) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[videoId];
      return newProgress;
    });
  }, []);

  // Обработчики drag and drop
  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      
      if (videoFiles.length !== files.length) {
        alert('Пожалуйста, выберите только видео файлы');
        return;
      }

      videoFiles.forEach((file, index) => {
        setTimeout(() => {
          addVideo(file);
        }, index * 100); // Небольшая задержка для плавности
      });
    }
  }, [addVideo]);

  // Обработка выбора файлов через input
  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      
      if (videoFiles.length !== files.length) {
        alert('Пожалуйста, выберите только видео файлы');
        return;
      }

      videoFiles.forEach((file, index) => {
        setTimeout(() => {
          addVideo(file);
        }, index * 100);
      });
    }
  }, [addVideo]);

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
    uploadProgress,
    dragActive,
    addVideo,
    updateVideoName,
    removeVideo,
    handleDragIn,
    handleDragOut,
    handleDrag,
    handleDrop,
    handleFileInput,
    formatFileSize
  };
};

export default useVideo360Management; 