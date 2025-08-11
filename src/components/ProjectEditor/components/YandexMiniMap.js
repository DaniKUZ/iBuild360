import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Лёгкий мини-компонент Яндекс.Карт для оверлея
 * Требуется ключ API в REACT_APP_YANDEX_MAPS_API_KEY или передайте через prop apiKey
 */
function YandexMiniMap({
  apiKey,
  center = [55.751244, 37.618423],
  zoom = 14,
  className = '',
  style,
  showMarker = true,
  enabled = true,
  usePortal = false,
  refreshKey,
}) {
  const containerRef = useRef(null);
  const portalHostRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [portalReady, setPortalReady] = useState(false);

  const resolveApiKey = () => {
    // Пытаемся прочитать ключ из разных окружений (Vite/CRA/глобал)
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        const k = import.meta.env.VITE_YANDEX_MAPS_API_KEY || import.meta.env.REACT_APP_YANDEX_MAPS_API_KEY;
        if (k) return k;
      }
    } catch (_) {}
    try {
      if (typeof process !== 'undefined' && process.env) {
        const k = process.env.REACT_APP_YANDEX_MAPS_API_KEY || process.env.VITE_YANDEX_MAPS_API_KEY;
        if (k) return k;
      }
    } catch (_) {}
    try {
      if (typeof window !== 'undefined') {
        const k = window.REACT_APP_YANDEX_MAPS_API_KEY || window.VITE_YANDEX_MAPS_API_KEY;
        if (k) return k;
      }
    } catch (_) {}
    return undefined;
  };

  const effectiveApiKey = apiKey || resolveApiKey();

  // Инициализация карты: один раз (или при смене ключа/включения)
  useEffect(() => {
    if (!enabled) return undefined;
    let isCancelled = false;

    const loadYmaps = () => {
      if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
      if (window.ymaps3 && window.ymaps3.ready) {
        return Promise.resolve(window.ymaps3);
      }
      if (!effectiveApiKey) {
        return Promise.reject(new Error('missing-api-key'));
      }
      if (!window.__ymaps3LoaderPromise) {
        window.__ymaps3LoaderPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'yandex-maps3-script';
          script.type = 'text/javascript';
          script.async = true;
          script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(effectiveApiKey)}&lang=ru_RU`;
          script.onload = () => {
            if (window.ymaps3) resolve(window.ymaps3);
            else reject(new Error('ymaps3-not-found'));
          };
          script.onerror = () => reject(new Error('ymaps3-load-failed'));
          document.head.appendChild(script);
        });
      }
      return window.__ymaps3LoaderPromise;
    };

    const delayId = setTimeout(() => {
      loadYmaps()
        .then((ymaps3) => {
          if (isCancelled) return;
          (async () => {
            try {
              await ymaps3.ready;
              if (isCancelled || !containerRef.current) return;

              // Уничтожаем предыдущую карту только при реинициализации (смена ключа/включения)
              if (mapInstanceRef.current) {
                try { mapInstanceRef.current.destroy?.(); } catch (_) {}
                mapInstanceRef.current = null;
              }

              const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
              const map = new YMap(
                containerRef.current,
                { location: { center, zoom } },
                []
              );
              map.addChild(new YMapDefaultSchemeLayer());
              map.addChild(new YMapDefaultFeaturesLayer());

              if (showMarker && YMapMarker) {
                const marker = document.createElement('div');
                marker.className = 'yandex-mini-map__marker';
                map.addChild(new YMapMarker({ coordinates: center }), marker);
              }

              mapInstanceRef.current = map;

              if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                  try {
                    // Принудительно триггерим перерисовку через корректный вызов
                    // update({ location }) вместо setLocation({ location })
                    map.update({ location: { center, zoom } });
                  } catch (_) {}
                });
                ro.observe(containerRef.current);
              }
            } catch (err) {
              if (!isCancelled) setLoadError(err);
            }
          })();
        })
        .catch((err) => {
          if (!isCancelled) setLoadError(err);
        });
    }, 100);

    return () => {
      clearTimeout(delayId);
      isCancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.destroy(); } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [effectiveApiKey, enabled, usePortal, portalReady]);

  // Обновляем локацию без пересоздания карты при смене центра/зума/refreshKey
  useEffect(() => {
    if (!enabled) return;
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      // Используем корректный контракт методов
      map.setLocation({ center, zoom });
    } catch (_) {
      try {
        map.update({ location: { center, zoom } });
      } catch (_) {}
    }
  }, [center, zoom, enabled, refreshKey]);

  // Портал для ФС-режима: создаём host в body
  useEffect(() => {
    if (!usePortal) {
      // Выходим из портала: помечаем, что портала нет
      setPortalReady(false);
      if (portalHostRef.current) {
        try {
          document.body.removeChild(portalHostRef.current);
        } catch (_) {}
        portalHostRef.current = null;
      }
      return;
    }
    const parent = document.fullscreenElement || document.body;
    const host = document.createElement('div');
    host.className = 'mini-map-portal';
    parent.appendChild(host);
    portalHostRef.current = host;
    // Фикс: форсируем повторный рендер после готовности портала
    setPortalReady(true);
    return () => {
      setPortalReady(false);
      if (portalHostRef.current) {
        try { portalHostRef.current.parentElement?.removeChild(portalHostRef.current); } catch (_) {}
        portalHostRef.current = null;
      }
    };
  }, [usePortal]);

  // Следим за переходом в/из полноэкранного режима: переносим портал в актуальный корень и пингуем карту
  useEffect(() => {
    if (!usePortal) return;
    const onFsChange = () => {
      try {
        // Пересоздаём host в новом parent
        if (portalHostRef.current) {
          try { portalHostRef.current.parentElement?.removeChild(portalHostRef.current); } catch (_) {}
          portalHostRef.current = null;
        }
        const parent = document.fullscreenElement || document.body;
        const host = document.createElement('div');
        host.className = 'mini-map-portal';
        parent.appendChild(host);
        portalHostRef.current = host;
        setPortalReady(true);
      } catch (_) {}
      // Принудительно обновляем локацию, чтобы карта перерисовалась
      const map = mapInstanceRef.current;
      if (map) {
        try { map.update({ location: { center, zoom } }); } catch (_) {
          try { map.setLocation({ center, zoom }); } catch (_) {}
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [usePortal, center, zoom]);

  const content = (
    <div className={`yandex-mini-map ${className}`} style={style}>
      {enabled && !effectiveApiKey && (
        <div className="yandex-mini-map__placeholder">
          Укажите REACT_APP_YANDEX_MAPS_API_KEY или VITE_YANDEX_MAPS_API_KEY
        </div>
      )}
      {enabled && loadError && effectiveApiKey && (
        <div className="yandex-mini-map__placeholder">
          Карта недоступна
        </div>
      )}
      {enabled && <div ref={containerRef} className="yandex-mini-map__container" />}
    </div>
  );

  if (usePortal && portalHostRef.current && portalReady) {
    return createPortal(content, portalHostRef.current);
  }
  if (usePortal) {
    // Пока портал не инициализирован, ничего не рендерим
    return null;
  }
  return content;
}

YandexMiniMap.propTypes = {
  apiKey: PropTypes.string,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  showMarker: PropTypes.bool,
};

export default YandexMiniMap;


