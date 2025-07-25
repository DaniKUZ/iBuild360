import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TopToolbar.module.css';

const TopToolbar = ({ onCreateFieldNote, onCreateVideo, onShare, onDownloadScreen, onDownloadImage360, isFieldNoteMode = false }) => {
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadRef = useRef(null);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setIsDownloadMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownloadClick = () => {
    setIsDownloadMenuOpen(!isDownloadMenuOpen);
  };

  const handleDownloadOption = (option) => {
    setIsDownloadMenuOpen(false);
    if (option === 'screen') {
      onDownloadScreen();
    } else if (option === 'image360') {
      onDownloadImage360();
    }
  };

  const handleCreateFieldNote = () => {
    onCreateFieldNote();
  };

  const handleCreateVideo = () => {
    onCreateVideo();
  };

  const handleShare = () => {
    onShare();
  };

  return (
    <div className={styles.topToolbar}>
      <div className={styles.toolbarContainer}>
        {/* Кнопка создания полевой заметки */}
        <button
          className={`${styles.toolbarButton} ${isFieldNoteMode ? styles.active : ''}`}
          onClick={handleCreateFieldNote}
          data-tooltip={isFieldNoteMode ? "Режим создания заметки активен. Кликните на изображение или нажмите снова для отмены" : "Создать полевую заметку"}
        >
          <i className={`fas ${isFieldNoteMode ? 'fa-crosshairs' : 'fa-sticky-note'}`}></i>
        </button>

        {/* Кнопка создания покадрового видео */}
        <button
          className={styles.toolbarButton}
          onClick={handleCreateVideo}
          data-tooltip="Покадровое видео"
        >
          <i className="fas fa-video"></i>
        </button>

        {/* Кнопка поделиться */}
        <button
          className={styles.toolbarButton}
          onClick={handleShare}
          data-tooltip="Поделиться"
        >
          <i className="fas fa-share-alt"></i>
        </button>

        {/* Кнопка скачать с выпадающим меню */}
        <div className={styles.downloadContainer} ref={downloadRef}>
          <button
            className={`${styles.toolbarButton} ${isDownloadMenuOpen ? styles.active : ''}`}
            onClick={handleDownloadClick}
            data-tooltip="Скачать"
          >
            <i className="fas fa-download"></i>
            <i className={`fas fa-chevron-down ${styles.chevron} ${isDownloadMenuOpen ? styles.rotated : ''}`}></i>
          </button>

          {/* Выпадающее меню */}
          {isDownloadMenuOpen && (
            <div className={styles.downloadMenu}>
              <button
                className={styles.downloadOption}
                onClick={() => handleDownloadOption('screen')}
              >
                <i className="fas fa-desktop"></i>
                <span>Загрузить текущий экран</span>
              </button>
              <button
                className={styles.downloadOption}
                onClick={() => handleDownloadOption('image360')}
              >
                <i className="fas fa-globe"></i>
                <span>Загрузить изображение 360°</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TopToolbar.propTypes = {
  onCreateFieldNote: PropTypes.func,
  onCreateVideo: PropTypes.func,
  onShare: PropTypes.func,
  onDownloadScreen: PropTypes.func,
  onDownloadImage360: PropTypes.func,
  isFieldNoteMode: PropTypes.bool,
};

TopToolbar.defaultProps = {
  onCreateFieldNote: () => {},
  onCreateVideo: () => {},
  onShare: () => {},
  onDownloadScreen: () => {},
  onDownloadImage360: () => {},
};

export default TopToolbar; 