import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import styles from './PanoramaViewer.module.css';

const PanoramaViewer = forwardRef(({ 
  imageUrl, 
  isComparison = false, 
  onCameraChange,
  onPanoramaClick,
  className,
  initialCamera = { yaw: 0, pitch: 0, fov: 75 },
  isFieldNoteMode = false,
  ...props 
}, ref) => {

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sphereRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  
  // Состояние для отслеживания взаимодействия
  const isDraggingRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseDownPositionRef = useRef({ x: 0, y: 0 }); // Позиция начала клика
  const rotationRef = useRef({ x: 0, y: 0 }); // Начальная позиция камеры
  const isProgrammaticUpdateRef = useRef(false);
  
  // Состояния для инерции и плавности
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const momentumAnimationRef = useRef(null);
  const zoomAnimationRef = useRef(null);
  const targetFovRef = useRef(75);

  // Добавляем состояния загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Refs to keep latest values inside event handlers
  const isFieldNoteModeRef = useRef(isFieldNoteMode);
  const onPanoramaClickRef = useRef(onPanoramaClick);

  // Update refs whenever props change
  useEffect(() => {
    isFieldNoteModeRef.current = isFieldNoteMode;
  }, [isFieldNoteMode]);

  useEffect(() => {
    onPanoramaClickRef.current = onPanoramaClick;
  }, [onPanoramaClick]);

  // Предоставляем API для родительского компонента
  useImperativeHandle(ref, () => ({
    setCamera: (yaw, pitch, fov) => {
      if (cameraRef.current) {
        
        // Устанавливаем флаг программного обновления
        isProgrammaticUpdateRef.current = true;
        
        // Конвертируем углы в радианы для Three.js
        const yawRad = THREE.MathUtils.degToRad(yaw);
        const pitchRad = THREE.MathUtils.degToRad(pitch);
        
        rotationRef.current.x = pitchRad;
        rotationRef.current.y = yawRad;
        
        if (fov && cameraRef.current.fov !== fov) {
          cameraRef.current.fov = fov;
          targetFovRef.current = fov;
          cameraRef.current.updateProjectionMatrix();
        }
        
        updateCameraPosition();
        
        // Сбрасываем флаг после обновления
        setTimeout(() => {
          isProgrammaticUpdateRef.current = false;
        }, 0);
      }
    },
    getCamera: () => {
      if (cameraRef.current) {
        const yaw = THREE.MathUtils.radToDeg(rotationRef.current.y);
        const pitch = THREE.MathUtils.radToDeg(rotationRef.current.x);
        return {
          yaw: ((yaw % 360) + 360) % 360,
          pitch: pitch,
          fov: cameraRef.current.fov
        };
      }
      return { yaw: 0, pitch: 0, fov: 75 };
    },
    lookAt: (yaw, pitch, fov = null, duration = 1000) => {
      // Плавный переход к указанной позиции
      const targetYaw = THREE.MathUtils.degToRad(yaw);
      const targetPitch = THREE.MathUtils.degToRad(pitch);
      
      const startYaw = rotationRef.current.y;
      const startPitch = rotationRef.current.x;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        rotationRef.current.y = startYaw + (targetYaw - startYaw) * easeProgress;
        rotationRef.current.x = startPitch + (targetPitch - startPitch) * easeProgress;
        
        if (fov && cameraRef.current) {
          const startFov = cameraRef.current.fov;
          const newFov = startFov + (fov - startFov) * easeProgress;
          cameraRef.current.fov = newFov;
          targetFovRef.current = newFov;
          cameraRef.current.updateProjectionMatrix();
        }
        
        updateCameraPosition();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    },
    getCanvas: () => {
      // Возвращаем canvas из Three.js рендерера
      return rendererRef.current?.domElement || null;
    }
  }));

  // Обновление позиции камеры
  const updateCameraPosition = () => {
    if (cameraRef.current) {
      const distance = 1;
      const newPosition = {
        x: distance * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x),
        y: distance * Math.sin(rotationRef.current.x),
        z: distance * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x)
      };
      
      cameraRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
      cameraRef.current.lookAt(0, 0, 0);
      
      // Логируем только при программном обновлении для отладки
      if (isProgrammaticUpdateRef.current) {
        console.log('PanoramaViewer: Camera position updated programmatically:', {
          rotation: {
            x: THREE.MathUtils.radToDeg(rotationRef.current.x),
            y: THREE.MathUtils.radToDeg(rotationRef.current.y)
          },
          fov: cameraRef.current.fov
        });
      }
      
      // Уведомляем родительский компонент об изменении камеры
      // Уведомляем только при пользовательском взаимодействии, не при программной синхронизации
      if (onCameraChange && !isProgrammaticUpdateRef.current) {
        const yaw = THREE.MathUtils.radToDeg(rotationRef.current.y);
        const pitch = THREE.MathUtils.radToDeg(rotationRef.current.x);
        onCameraChange({
          yaw: ((yaw % 360) + 360) % 360,
          pitch: pitch,
          fov: cameraRef.current.fov
        });
      }
    }
  };

  // Анимация инерции (скольжения)
  const startMomentumAnimation = () => {
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }

    const friction = 0.97; // Увеличен коэффициент трения для более плавного затухания
    const minVelocity = 0.0005; // Уменьшена минимальная скорость для более долгого скольжения

    const animate = () => {
      // Применяем скорость к вращению
      rotationRef.current.y += velocityRef.current.x;
      rotationRef.current.x += velocityRef.current.y;

      // Ограничиваем поворот по вертикали
      rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x));

      // Применяем трение
      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;

      updateCameraPosition();

      // Продолжаем анимацию если скорость достаточная
      if (Math.abs(velocityRef.current.x) > minVelocity || Math.abs(velocityRef.current.y) > minVelocity) {
        momentumAnimationRef.current = requestAnimationFrame(animate);
      } else {
        momentumAnimationRef.current = null;
      }
    };

    momentumAnimationRef.current = requestAnimationFrame(animate);
  };

  // Плавное изменение зума
  const animateZoom = (targetFov) => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
    }

    const startFov = cameraRef.current.fov;
    const startTime = Date.now();
    const duration = 300; // Увеличена длительность анимации для более плавного зума

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing функция (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentFov = startFov + (targetFov - startFov) * easeProgress;
      cameraRef.current.fov = currentFov;
      cameraRef.current.updateProjectionMatrix();
      
      // Уведомляем о изменении зума
      if (onCameraChange && !isProgrammaticUpdateRef.current) {
        const yaw = THREE.MathUtils.radToDeg(rotationRef.current.y);
        const pitch = THREE.MathUtils.radToDeg(rotationRef.current.x);
        onCameraChange({
          yaw: ((yaw % 360) + 360) % 360,
          pitch: pitch,
          fov: currentFov
        });
      }
      
      if (progress < 1) {
        zoomAnimationRef.current = requestAnimationFrame(animate);
      } else {
        zoomAnimationRef.current = null;
      }
    };

    zoomAnimationRef.current = requestAnimationFrame(animate);
  };

  // Обработчики мыши
  const handleMouseDown = (event) => {
    // Останавливаем текущие анимации
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }

    isDraggingRef.current = true;
    mouseRef.current = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Сохраняем начальную позицию для определения клика
    mouseDownPositionRef.current = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Сбрасываем скорость
    velocityRef.current = { x: 0, y: 0 };
    lastMoveTimeRef.current = Date.now();
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current || isFieldNoteModeRef.current) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastMoveTimeRef.current;
    
    const deltaX = event.clientX - mouseRef.current.x;
    const deltaY = event.clientY - mouseRef.current.y;

    // Применяем сглаживание для более плавного движения
    const sensitivity = 0.004; // Еще больше уменьшена чувствительность для очень плавного движения
    const rotationDeltaX = deltaX * sensitivity;
    const rotationDeltaY = deltaY * sensitivity;

    rotationRef.current.y += rotationDeltaX;
    rotationRef.current.x -= rotationDeltaY;

    // Ограничиваем поворот по вертикали
    rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x));

    // Вычисляем скорость для инерции (если прошло достаточно времени)
    if (deltaTime > 0) {
      const velocityX = rotationDeltaX / deltaTime * 12; // Уменьшено для более плавной инерции
      const velocityY = -rotationDeltaY / deltaTime * 12;
      
      // Применяем более сильное сглаживание к скорости
      const smoothing = 0.5;
      velocityRef.current.x = velocityRef.current.x * (1 - smoothing) + velocityX * smoothing;
      velocityRef.current.y = velocityRef.current.y * (1 - smoothing) + velocityY * smoothing;
    }

    updateCameraPosition();

    mouseRef.current = {
      x: event.clientX,
      y: event.clientY
    };
    lastMoveTimeRef.current = currentTime;
  };

  const handleMouseUp = (event) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      
      // Проверяем, был ли это клик (мышь не двигалась значительно)
      const dragThreshold = 5; // Пиксели
      const deltaX = Math.abs(event.clientX - mouseDownPositionRef.current.x);
      const deltaY = Math.abs(event.clientY - mouseDownPositionRef.current.y);
      const isClick = deltaX < dragThreshold && deltaY < dragThreshold;
      
      if (isClick && onPanoramaClickRef.current) {
        // Вызываем обработчик клика, передавая event
        onPanoramaClickRef.current(event);
      } else if (!isClick && !isFieldNoteModeRef.current) {
        // Запускаем инерцию только если было движение мыши, скорость достаточная, и НЕ в режиме заметок
        const minStartVelocity = 0.001;
        if (Math.abs(velocityRef.current.x) > minStartVelocity || Math.abs(velocityRef.current.y) > minStartVelocity) {
          startMomentumAnimation();
        }
      }
    }
  };

  const handleWheel = (event) => {
    event.preventDefault();
    // В режиме заметок блокируем зум
    if (isFieldNoteModeRef.current) return;
    if (cameraRef.current) {
      // Плавное изменение зума
      const zoomSpeed = 2; // Еще больше уменьшена скорость зума для очень плавного зума
      const delta = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
      
      // Вычисляем новое значение FOV
      const currentFov = targetFovRef.current || cameraRef.current.fov;
      const newFov = Math.max(30, Math.min(130, currentFov + delta));
      
      // Сохраняем целевое значение
      targetFovRef.current = newFov;
      
      // Запускаем плавную анимацию зума
      animateZoom(newFov);
    }
  };

  // Инициализация Three.js сцены
  useEffect(() => {
    if (!mountRef.current || !imageUrl) {
      console.warn('PanoramaViewer: mount ref or imageUrl missing', { 
        mountRef: !!mountRef.current, 
        imageUrl: !!imageUrl
      });
      return;
    }

    console.log('PanoramaViewer: Initializing with imageUrl:', imageUrl);
    setIsLoading(true);
    setLoadError(null);
    
    // Объявляем переменные в области видимости всего useEffect
    let scene, camera, renderer, tempSphere, tempGeometry, tempMaterial;

    try {
      // Создаем сцену
      scene = new THREE.Scene();
      sceneRef.current = scene;

      // Создаем камеру
      const containerWidth = mountRef.current.clientWidth;
      const containerHeight = mountRef.current.clientHeight;

      camera = new THREE.PerspectiveCamera(
        initialCamera.fov || 75, 
        containerWidth / containerHeight, 
        0.1, 
        1000
      );
      cameraRef.current = camera;
      targetFovRef.current = initialCamera.fov || 75; // Инициализируем целевой FOV

      // Создаем рендерер
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      
      // Добавляем канвас в DOM
      mountRef.current.appendChild(renderer.domElement);

      // Создаем временную черную сферу, которая будет показываться пока загружается изображение
      tempGeometry = new THREE.SphereGeometry(500, 60, 40);
      tempGeometry.scale(-1, 1, 1);
      tempMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
      tempSphere = new THREE.Mesh(tempGeometry, tempMaterial);
      scene.add(tempSphere);

      // Устанавливаем начальную позицию камеры из пропсов
      rotationRef.current = { 
        x: THREE.MathUtils.degToRad(initialCamera.pitch || 0), 
        y: THREE.MathUtils.degToRad(initialCamera.yaw || 0)
      };
      console.log('PanoramaViewer: Setting initial camera position:', initialCamera);
      updateCameraPosition();
      
      // Запускаем рендер-лууп
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    } catch (error) {
      console.error('PanoramaViewer: Error during Three.js initialization:', error);
      setLoadError(`Ошибка инициализации 3D движка: ${error.message}`);
      setIsLoading(false);
      return;
    }

    // Загружаем текстуру
    const loader = new THREE.TextureLoader();
    
    loader.load(
      imageUrl,
      (texture) => {
        console.log('PanoramaViewer: Texture loaded successfully');
        
        // Проверяем что все объекты еще существуют
        if (!scene || !tempSphere) {
          console.warn('PanoramaViewer: Scene or tempSphere missing during texture load');
          return;
        }
        
        // Удаляем временную сферу
        scene.remove(tempSphere);
        tempGeometry.dispose();
        tempMaterial.dispose();
        
        // Правильно настраиваем текстуру для 360° панорамы
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1; // Исправляем зеркальность

        // Создаем сферу для панорамы
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        // Инвертируем нормали для корректного отображения изнутри
        geometry.scale(-1, 1, 1);
        
        const material = new THREE.MeshBasicMaterial({
          map: texture
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphereRef.current = sphere;
        scene.add(sphere);
        
        // Восстанавливаем позицию камеры (она уже установлена выше)
        updateCameraPosition();
        
        setIsLoading(false);
        setLoadError(null);
      },
      undefined,
      (error) => {
        console.error('PanoramaViewer: Ошибка загрузки панорамного изображения:', error, 'URL:', imageUrl);
        setIsLoading(false);
        setLoadError(`Не удалось загрузить изображение: ${error.message || 'Неизвестная ошибка'}`);
        
        // Проверяем что все объекты еще существуют
        if (scene && tempSphere) {
          // Удаляем временную сферу и показываем ошибку
          scene.remove(tempSphere);
          tempGeometry.dispose();
          tempMaterial.dispose();
          
          // Создаем красную сферу как индикатор ошибки
          const errorGeometry = new THREE.SphereGeometry(500, 60, 40);
          errorGeometry.scale(-1, 1, 1);
          const errorMaterial = new THREE.MeshBasicMaterial({ color: 0x660000 });
          const errorSphere = new THREE.Mesh(errorGeometry, errorMaterial);
          sphereRef.current = errorSphere;
          scene.add(errorSphere);
        }
      }
    );

    // Обработчики событий мыши
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Глобальные обработчики для корректной работы драга
    const globalMouseMove = (event) => handleMouseMove(event);
    const globalMouseUp = (event) => handleMouseUp(event);
    
    document.addEventListener('mousemove', globalMouseMove);
    document.addEventListener('mouseup', globalMouseUp);

    // Обработчик изменения размера
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', globalMouseMove);
      document.removeEventListener('mouseup', globalMouseUp);
      window.removeEventListener('resize', handleResize);
      
      // Останавливаем все анимации
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
      }
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
      
      if (mountRef.current && rendererRef.current) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('PanoramaViewer: Could not remove canvas from DOM:', e);
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sphereRef.current && sceneRef.current) {
        sceneRef.current.remove(sphereRef.current);
        sphereRef.current.geometry.dispose();
        sphereRef.current.material.dispose();
      }
    };
    // ВАЖНО: isFieldNoteMode и onPanoramaClick НЕ включены в зависимости,
    // чтобы избежать пересоздания всей Three.js сцены при переключении режима заметок.
    // Режим заметок обрабатывается через ref в обработчиках событий.
  }, [imageUrl, isComparison]);

  // Дополнительный эффект для сброса состояний при смене URL
  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      setLoadError(null);
    }
  }, [imageUrl]);

  return (
    <div 
      className={`${styles.panoramaViewer} ${className || ''}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      {...props}
    >
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: isFieldNoteMode ? 'crosshair' : (isDraggingRef.current ? 'grabbing' : 'grab') 
        }}
      />
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Загрузка изображения...</div>
        </div>
      )}
      
      {/* Индикатор ошибки */}
      {loadError && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText}>{loadError}</div>
          <div className={styles.errorHint}>Проверьте соединение с интернетом или обратитесь к администратору</div>
        </div>
      )}
    </div>
  );
});

PanoramaViewer.displayName = 'PanoramaViewer';

PanoramaViewer.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  isComparison: PropTypes.bool,
  onCameraChange: PropTypes.func,
  onPanoramaClick: PropTypes.func,
  className: PropTypes.string,
  initialCamera: PropTypes.shape({
    yaw: PropTypes.number,
    pitch: PropTypes.number,
    fov: PropTypes.number
  }),
  isFieldNoteMode: PropTypes.bool,
};

export default PanoramaViewer; 