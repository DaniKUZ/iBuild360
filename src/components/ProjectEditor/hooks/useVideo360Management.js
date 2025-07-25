import { useState, useCallback } from 'react';

const useVideo360Management = (initialVideos = []) => {
  // Нормализуем существующие видео, добавляя недостающие поля
  const normalizedVideos = initialVideos.map(video => ({
    ...video,
    serverStatus: video.serverStatus || 'not_sent',
    assignedFloorId: video.assignedFloorId || null,
    tags: video.tags || []
  }));
  
  const [videos, setVideos] = useState(normalizedVideos);
  const [uploadProgress, setUploadProgress] = useState({});
  const [analysisProgress, setAnalysisProgress] = useState({});
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
      shootingDate: '', // Дата съемки (пользователь вводит)
      duration: null, // Будет определена после загрузки
      thumbnail: null, // Будет сгенерирована после загрузки
      status: 'uploading', // uploading, ready, error
      analysisStatus: 'not_analyzed', // not_analyzed, analyzing, analyzed, error
      serverStatus: 'not_sent', // not_sent, sending, sent, error
      assignedFloorId: null, // ID привязанного этажа/схемы
      tags: [], // Теги для видео
      extractedFrames: [], // Извлеченные кадры после анализа
      walkthrough: null // Данные для навигации по маршруту
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

  // Реальное извлечение кадров из видео
  const extractVideoFrames = useCallback(async (videoFile, videoId) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.preload = 'metadata';
      video.muted = true;
      
      // Тайм-аут для предотвращения зависания
      const timeout = setTimeout(() => {
        reject(new Error('Тайм-аут загрузки видео (превышено 30 секунд)'));
      }, 30000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        
        const duration = Math.floor(video.duration);
        const frames = [];
        let currentTime = 0;
        let processedFrames = 0;
        
        console.log(`Длительность видео: ${duration} секунд, будет извлечено ~${duration} кадров`);
        
        // Ограничиваем максимальное количество кадров для предотвращения перегрузки памяти
        const maxFrames = Math.min(duration, 300); // Максимум 5 минут
        if (duration > maxFrames) {
          console.warn(`Видео длиной ${duration} секунд будет обрезано до ${maxFrames} кадров`);
        }
        
        canvas.width = 640; // Разрешение кадра (можно увеличить)
        canvas.height = 320;
        
        const extractFrame = () => {
          if (currentTime >= duration || processedFrames >= maxFrames) {
            // Завершили извлечение всех кадров
            console.log(`Извлечение завершено: ${frames.length} кадров`);
            resolve(frames);
            return;
          }
          
          video.currentTime = currentTime;
        };
        
        video.onseeked = () => {
          try {
            // Рисуем текущий кадр на canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Конвертируем canvas в data URL
            const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Создаем объект кадра
            const frame = {
              id: `frame_${videoId}_${processedFrames}`,
              timestamp: currentTime,
              imageUrl: imageUrl,
              position: { x: processedFrames * 10, y: 0 }, // Виртуальные координаты
              hasGPS: false // TODO: Извлечь GPS из метаданных если есть
            };
            
            frames.push(frame);
            processedFrames++;
            
            // Обновляем прогресс
            const progress = (currentTime / duration) * 100;
            setAnalysisProgress(prev => ({ ...prev, [videoId]: progress }));
            
            // Переходим к следующей секунде
            currentTime += 1; // Каждую секунду
            extractFrame();
            
          } catch (error) {
            console.error('Ошибка извлечения кадра:', error);
            currentTime += 1;
            extractFrame();
          }
        };
        
                 video.onerror = (error) => {
           clearTimeout(timeout);
           console.error('Ошибка загрузки видео:', error);
           reject(new Error('Не удалось загрузить видео. Проверьте формат файла.'));
         };
         
         // Начинаем извлечение
         extractFrame();
       };
       
       video.onloadeddata = () => {
         console.log('Видео загружено, начинаем извлечение кадров');
       };
       
       video.onloadstart = () => {
         console.log('Начинается загрузка видео...');
       };
      
             // Загружаем видео файл
       const fileURL = URL.createObjectURL(videoFile);
       video.src = fileURL;
       video.load();
       
       // Очистка ресурсов при завершении
       const cleanup = () => {
         URL.revokeObjectURL(fileURL);
         video.removeAttribute('src');
         video.load();
       };
       
       // Добавляем очистку к промисам
       const originalResolve = resolve;
       const originalReject = reject;
       
       resolve = (result) => {
         cleanup();
         originalResolve(result);
       };
       
       reject = (error) => {
         cleanup();
         originalReject(error);
       };
     });
   }, []);

  // Анализ видео с реальным извлечением кадров
  const analyzeVideoReal = useCallback(async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.file) {
      console.error('Видео не найдено или файл отсутствует');
      return;
    }

    try {
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, analysisStatus: 'analyzing' } : v
      ));

      console.log('Начинаем анализ видео:', video.name);
      
      // Извлекаем кадры
      const extractedFrames = await extractVideoFrames(video.file, videoId);
      
      console.log(`Извлечено ${extractedFrames.length} кадров`);
      
      // Обновляем видео с извлеченными кадрами
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { 
          ...v, 
          analysisStatus: 'analyzed',
          extractedFrames: extractedFrames,
          duration: extractedFrames.length, // Продолжительность в секундах
          walkthrough: {
            type: 'timeline',
            totalFrames: extractedFrames.length,
            duration: extractedFrames.length,
            hasGPS: false
          }
        } : v
      ));

      // Завершаем прогресс
      setAnalysisProgress(prev => ({ ...prev, [videoId]: 100 }));
      
      // Убираем прогресс через секунду
      setTimeout(() => {
        setAnalysisProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[videoId];
          return newProgress;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка анализа видео:', error);
      
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, analysisStatus: 'error' } : v
      ));
      
      setAnalysisProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoId];
        return newProgress;
      });
      
      alert('Ошибка при анализе видео: ' + error.message);
    }
  }, [videos, extractVideoFrames]);

  // Обновление названия видео
  const updateVideoName = useCallback((videoId, newName) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, name: newName } : video
    ));
  }, []);

  // Обновление даты съемки видео
  const updateVideoShootingDate = useCallback((videoId, shootingDate) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, shootingDate } : video
    ));
  }, []);

  // Обновление статуса отправки на сервер
  const updateVideoServerStatus = useCallback((videoId, serverStatus) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, serverStatus } : video
    ));
  }, []);

  // Обновление привязанного этажа
  const updateVideoAssignedFloor = useCallback((videoId, floorId) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, assignedFloorId: floorId } : video
    ));
  }, []);

  // Обновление тегов видео
  const updateVideoTags = useCallback((videoId, tags) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, tags } : video
    ));
  }, []);

  // Запуск анализа видео
  const analyzeVideo = useCallback((videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    if (video.status !== 'ready') {
      alert('Дождитесь завершения загрузки видео');
      return;
    }

    if (video.analysisStatus === 'analyzing') {
      alert('Анализ уже выполняется');
      return;
    }

    if (video.analysisStatus === 'analyzed') {
      const confirmed = window.confirm('Видео уже проанализировано. Повторить анализ?');
      if (!confirmed) return;
    }

    analyzeVideoReal(videoId);
  }, [videos, analyzeVideoReal]);

  // Удаление видео
  const removeVideo = useCallback((videoId) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[videoId];
      return newProgress;
    });
    setAnalysisProgress(prev => {
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
    analysisProgress,
    dragActive,
    addVideo,
    updateVideoName,
    updateVideoShootingDate,
    updateVideoServerStatus,
    updateVideoAssignedFloor,
    updateVideoTags,
    analyzeVideo,
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