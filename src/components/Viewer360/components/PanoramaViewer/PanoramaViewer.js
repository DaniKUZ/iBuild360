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
        
        if (cameraRef.current.fov !== fov) {
          cameraRef.current.fov = fov;
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
          cameraRef.current.fov = startFov + (fov - startFov) * easeProgress;
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

  // Обработчики мыши
  const handleMouseDown = (event) => {
    isDraggingRef.current = true;
    mouseRef.current = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current) return;

    const deltaX = event.clientX - mouseRef.current.x;
    const deltaY = event.clientY - mouseRef.current.y;

    rotationRef.current.y += deltaX * 0.01;
    rotationRef.current.x -= deltaY * 0.01;

    // Ограничиваем поворот по вертикали
    rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x));

    updateCameraPosition();

    mouseRef.current = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    if (cameraRef.current) {
      const delta = event.deltaY > 0 ? 5 : -5;
      cameraRef.current.fov = Math.max(30, Math.min(130, cameraRef.current.fov + delta));
      cameraRef.current.updateProjectionMatrix();
      
      if (onCameraChange) {
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
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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