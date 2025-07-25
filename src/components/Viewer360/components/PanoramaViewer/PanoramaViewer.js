import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import styles from './PanoramaViewer.module.css';

const PanoramaViewer = forwardRef(({ 
  imageUrl, 
  isComparison = false, 
  onCameraChange,
  className,
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
  const rotationRef = useRef({ x: 0, y: 0 });
  const isProgrammaticUpdateRef = useRef(false);
  
  // Состояния для инерции и плавности
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const momentumAnimationRef = useRef(null);
  const zoomAnimationRef = useRef(null);
  const targetFovRef = useRef(75);

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
        isProgrammaticUpdateRef.current = false;
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
    }
  }));

  // Обновление позиции камеры
  const updateCameraPosition = () => {
    if (cameraRef.current) {
      const distance = 1;
      cameraRef.current.position.set(
        distance * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x),
        distance * Math.sin(rotationRef.current.x),
        distance * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x)
      );
      cameraRef.current.lookAt(0, 0, 0);
      
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
    
    // Сбрасываем скорость
    velocityRef.current = { x: 0, y: 0 };
    lastMoveTimeRef.current = Date.now();
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current) return;

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

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      
      // Запускаем инерцию только если скорость достаточная
      const minStartVelocity = 0.001; // Уменьшен порог для более чувствительной инерции
      if (Math.abs(velocityRef.current.x) > minStartVelocity || Math.abs(velocityRef.current.y) > minStartVelocity) {
        startMomentumAnimation();
      }
    }
  };

  const handleWheel = (event) => {
    event.preventDefault();
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
    if (!mountRef.current || !imageUrl) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    cameraRef.current = camera;
    targetFovRef.current = 75; // Инициализируем целевой FOV

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Добавляем канвас в DOM
    mountRef.current.appendChild(renderer.domElement);

    // Загружаем текстуру
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
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
        
        // Устанавливаем начальную позицию камеры
        updateCameraPosition();
        
        // Запускаем рендер-лууп
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки панорамного изображения:', error);
      }
    );

    // Обработчики событий мыши
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Глобальные обработчики для корректной работы драга
    const globalMouseMove = (event) => handleMouseMove(event);
    const globalMouseUp = () => handleMouseUp();
    
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
      
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      if (renderer) {
        renderer.dispose();
      }
      
      if (sphereRef.current) {
        scene.remove(sphereRef.current);
        sphereRef.current.geometry.dispose();
        sphereRef.current.material.dispose();
      }
    };
  }, [imageUrl, isComparison]);

  return (
    <div 
      ref={mountRef} 
      className={`${styles.panoramaViewer} ${className || ''}`}
      style={{ width: '100%', height: '100%', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      {...props}
    />
  );
});

PanoramaViewer.displayName = 'PanoramaViewer';

PanoramaViewer.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  isComparison: PropTypes.bool,
  onCameraChange: PropTypes.func,
  className: PropTypes.string,
};

export default PanoramaViewer; 