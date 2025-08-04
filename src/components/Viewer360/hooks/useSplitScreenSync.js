import { useRef, useCallback, useEffect } from 'react';

/**
 * Специализированный хук синхронизации для split-screen режима
 * Отличается от usePanoramaSync упрощенной логикой без throttling
 * и оптимизацией под двухпанельную архитектуру
 * Поддерживает относительную синхронизацию с учетом разных начальных позиций
 */
const useSplitScreenSync = (leftViewerRef, rightViewerRef) => {
  // Refs для хранения функций получения начальных позиций
  const getLeftInitialRef = useRef(null);
  const getRightInitialRef = useRef(null);
  // Флаги активности панелей для предотвращения рекурсии
  const syncStateRef = useRef({
    isLeftActive: false,
    isRightActive: false
  });

  // Функция для нормализации углов в диапазоне 0-360°
  const normalizeAngle = useCallback((angle) => {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }, []);

  // Функция для вычисления разности углов с учетом цикличности
  const getAngleDifference = useCallback((current, initial) => {
    let diff = current - initial;
    // Приводим разность к диапазону [-180, 180]
    while (diff > 180) diff -= 360;
    while (diff <= -180) diff += 360;
    return diff;
  }, []);

  // Синхронизация с левой панели на правую
  const syncFromLeftToRight = useCallback((cameraData) => {
    const leftInit = getLeftInitialRef.current?.();
    const rightInit = getRightInitialRef.current?.();
    
    if (!rightViewerRef.current || syncStateRef.current.isRightActive || !leftInit || !rightInit) {

      return;
    }

    try {
      syncStateRef.current.isLeftActive = true;
      
      // Вычисляем относительные смещения от начальной позиции левой панели
      const yawOffset = getAngleDifference(cameraData.yaw, leftInit.yaw);
      const pitchOffset = cameraData.pitch - leftInit.pitch;
      const fovOffset = cameraData.fov - leftInit.fov;
      
      // Применяем смещения к начальной позиции правой панели
      const targetYaw = normalizeAngle(rightInit.yaw + yawOffset);
      const targetPitch = rightInit.pitch + pitchOffset;
      const targetFov = rightInit.fov + fovOffset;
      

      
      rightViewerRef.current.setCamera(targetYaw, targetPitch, targetFov);
    } catch (error) {
      console.warn('Ошибка синхронизации с левой на правую панель:', error);
    } finally {
      syncStateRef.current.isLeftActive = false;
    }
  }, [rightViewerRef, getAngleDifference, normalizeAngle]);

  // Синхронизация с правой панели на левую
  const syncFromRightToLeft = useCallback((cameraData) => {
    const leftInit = getLeftInitialRef.current?.();
    const rightInit = getRightInitialRef.current?.();
    
    if (!leftViewerRef.current || syncStateRef.current.isLeftActive || !leftInit || !rightInit) {

      return;
    }

    try {
      syncStateRef.current.isRightActive = true;
      
      // Вычисляем относительные смещения от начальной позиции правой панели
      const yawOffset = getAngleDifference(cameraData.yaw, rightInit.yaw);
      const pitchOffset = cameraData.pitch - rightInit.pitch;
      const fovOffset = cameraData.fov - rightInit.fov;
      
      // Применяем смещения к начальной позиции левой панели
      const targetYaw = normalizeAngle(leftInit.yaw + yawOffset);
      const targetPitch = leftInit.pitch + pitchOffset;
      const targetFov = leftInit.fov + fovOffset;
      

      
      leftViewerRef.current.setCamera(targetYaw, targetPitch, targetFov);
    } catch (error) {
      console.warn('Ошибка синхронизации с правой на левую панель:', error);
    } finally {
      syncStateRef.current.isRightActive = false;
    }
  }, [leftViewerRef, getAngleDifference, normalizeAngle]);

  // Двунаправленная синхронизация для навигационных точек
  const syncLookAt = useCallback((yaw, pitch, fov = null, duration = 1000) => {
    // Синхронно перемещаем обе камеры к указанной точке
    if (leftViewerRef.current) {
      leftViewerRef.current.lookAt(yaw, pitch, fov, duration);
    }
    
    if (rightViewerRef.current) {
      rightViewerRef.current.lookAt(yaw, pitch, fov, duration);
    }
  }, [leftViewerRef, rightViewerRef]);

  // Получение текущих позиций камер
  const getCameraPositions = useCallback(() => {
    const leftCamera = leftViewerRef.current ? leftViewerRef.current.getCamera() : null;
    const rightCamera = rightViewerRef.current ? rightViewerRef.current.getCamera() : null;
    
    return {
      left: leftCamera,
      right: rightCamera
    };
  }, [leftViewerRef, rightViewerRef]);

  // Функция для регистрации геттеров начальных позиций
  const setInitialCameraProviders = useCallback((getLeftInitial, getRightInitial) => {
    getLeftInitialRef.current = getLeftInitial;
    getRightInitialRef.current = getRightInitial;
  }, []);

  return {
    syncFromLeftToRight,
    syncFromRightToLeft,
    syncLookAt,
    getCameraPositions,
    setInitialCameraProviders
  };
};

export default useSplitScreenSync;