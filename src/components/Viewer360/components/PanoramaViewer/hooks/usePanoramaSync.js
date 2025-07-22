import { useRef, useCallback, useEffect } from 'react';

/**
 * Хук для синхронизации камер между двумя панорамными вьюверами
 * Обеспечивает плавную двустороннюю синхронизацию без рекурсии
 */
const usePanoramaSync = (mainViewerRef, comparisonViewerRef, isComparisonMode) => {
  const syncStateRef = useRef({
    isMainActive: false,
    isComparisonActive: false,
    lastSyncTime: 0
  });
  
  const mainToComparisonTimeoutRef = useRef(null);
  const comparisonToMainTimeoutRef = useRef(null);
  
  // Ref для актуального значения isComparisonMode (избегаем проблем с замыканиями)
  const isComparisonModeRef = useRef(isComparisonMode);
  
  // Обновляем ref при изменении значения
  useEffect(() => {
    isComparisonModeRef.current = isComparisonMode;
  }, [isComparisonMode]);

  // Минимальная задержка между синхронизациями для предотвращения перегрузки
  const SYNC_THROTTLE = 16; // ~60fps

  const syncFromMainToComparison = useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    if (!currentIsComparisonMode || !comparisonViewerRef.current || syncStateRef.current.isComparisonActive) {
      return;
    }

    const now = performance.now();
    if (now - syncStateRef.current.lastSyncTime < SYNC_THROTTLE) {
      return;
    }

    try {
      syncStateRef.current.isMainActive = true;
      comparisonViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, cameraData.fov);
      syncStateRef.current.lastSyncTime = now;
    } catch (error) {
      console.warn('Ошибка синхронизации с основного на сравнительный:', error);
    } finally {
      // Сбрасываем флаг в следующем кадре для предотвращения race conditions
      requestAnimationFrame(() => {
        syncStateRef.current.isMainActive = false;
      });
    }
  }, [comparisonViewerRef]); // Убираем isComparisonMode из зависимостей, используем ref

  const syncFromComparisonToMain = useCallback((cameraData) => {
    const currentIsComparisonMode = isComparisonModeRef.current;
    if (!currentIsComparisonMode || !mainViewerRef.current || syncStateRef.current.isMainActive) {
      return;
    }

    const now = performance.now();
    if (now - syncStateRef.current.lastSyncTime < SYNC_THROTTLE) {
      return;
    }

    try {
      syncStateRef.current.isComparisonActive = true;
      mainViewerRef.current.setCamera(cameraData.yaw, cameraData.pitch, cameraData.fov);
      syncStateRef.current.lastSyncTime = now;
    } catch (error) {
      console.warn('Ошибка синхронизации со сравнительного на основной:', error);
    } finally {
      // Сбрасываем флаг в следующем кадре для предотвращения race conditions
      requestAnimationFrame(() => {
        syncStateRef.current.isComparisonActive = false;
      });
    }
  }, [mainViewerRef]); // Убираем isComparisonMode из зависимостей, используем ref

  // Throttled версии для более плавной синхронизации во время движения
  const throttledSyncFromMain = useCallback((cameraData) => {
    if (mainToComparisonTimeoutRef.current) return;
    
    mainToComparisonTimeoutRef.current = setTimeout(() => {
      syncFromMainToComparison(cameraData);
      mainToComparisonTimeoutRef.current = null;
    }, SYNC_THROTTLE);
  }, [syncFromMainToComparison]);

  const throttledSyncFromComparison = useCallback((cameraData) => {
    if (comparisonToMainTimeoutRef.current) return;
    
    comparisonToMainTimeoutRef.current = setTimeout(() => {
      syncFromComparisonToMain(cameraData);
      comparisonToMainTimeoutRef.current = null;
    }, SYNC_THROTTLE);
  }, [syncFromComparisonToMain]);

  // Синхронизация навигационных точек
  const syncLookAt = useCallback((yaw, pitch, fov = null, duration = 1000) => {
    if (!isComparisonModeRef.current) return;

    // Синхронно перемещаем обе камеры к указанной точке
    if (mainViewerRef.current) {
      mainViewerRef.current.lookAt(yaw, pitch, fov, duration);
    }
    
    if (comparisonViewerRef.current) {
      comparisonViewerRef.current.lookAt(yaw, pitch, fov, duration);
    }
  }, [mainViewerRef, comparisonViewerRef]); // Убираем isComparisonMode из зависимостей, используем ref

  // Получение текущих позиций камер
  const getCameraPositions = useCallback(() => {
    const mainCamera = mainViewerRef.current ? mainViewerRef.current.getCamera() : null;
    const comparisonCamera = comparisonViewerRef.current ? comparisonViewerRef.current.getCamera() : null;
    
    return {
      main: mainCamera,
      comparison: comparisonCamera
    };
  }, [mainViewerRef, comparisonViewerRef]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (mainToComparisonTimeoutRef.current) {
        clearTimeout(mainToComparisonTimeoutRef.current);
      }
      if (comparisonToMainTimeoutRef.current) {
        clearTimeout(comparisonToMainTimeoutRef.current);
      }
    };
  }, []);

  // Сброс состояния синхронизации при изменении режима
  useEffect(() => {
    if (!isComparisonModeRef.current) {
      syncStateRef.current = {
        isMainActive: false,
        isComparisonActive: false,
        lastSyncTime: 0
      };
      
      if (mainToComparisonTimeoutRef.current) {
        clearTimeout(mainToComparisonTimeoutRef.current);
        mainToComparisonTimeoutRef.current = null;
      }
      if (comparisonToMainTimeoutRef.current) {
        clearTimeout(comparisonToMainTimeoutRef.current);
        comparisonToMainTimeoutRef.current = null;
      }
    }
  }, [isComparisonMode]);

  return {
    // Прямые синхронизации (для finalized событий)
    syncFromMainToComparison,
    syncFromComparisonToMain,
    
    // Throttled синхронизации (для движения в реальном времени)
    throttledSyncFromMain,
    throttledSyncFromComparison,
    
    // Навигация
    syncLookAt,
    getCameraPositions
  };
};

export default usePanoramaSync; 