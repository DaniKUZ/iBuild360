import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './AIAssistantButton.module.css';

const AIAssistantButton = ({ 
  onClick,
  isActive = false,
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  hasUnreadMessages = false,
  className = '',
  onPositionChange,
  externalPosition
}) => {
  const [position, setPosition] = useState(externalPosition || { bottom: 150, right: 30 });

  // Обновляем позицию при изменении externalPosition
  React.useEffect(() => {
    if (externalPosition) {
      setPosition(externalPosition);
    }
  }, [externalPosition]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);
  const dragRef = useRef(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    setHasActuallyDragged(false);
    lastPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    
    // Отмечаем, что было реальное перетаскивание (если сдвиг больше 5px)
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasActuallyDragged(true);
    }

    setPosition(prev => {
      const newRight = Math.max(20, Math.min(window.innerWidth - 100, prev.right - deltaX));
      const newBottom = Math.max(20, Math.min(window.innerHeight - 100, prev.bottom - deltaY));
      
      const newPosition = {
        right: newRight,
        bottom: newBottom
      };
      
      // Передаем позицию в родительский компонент (отложенно чтобы избежать setState во время рендеринга)
      if (onPositionChange) {
        setTimeout(() => onPositionChange(newPosition), 0);
      }
      
      return newPosition;
    });

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Сбрасываем флаг через небольшой таймаут, чтобы handleClick успел его проверить
    setTimeout(() => {
      setHasActuallyDragged(false);
    }, 100);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleClick = (e) => {
    if (!isDragging && !hasActuallyDragged) {
      // Передаем текущую позицию при клике (отложенно чтобы избежать setState во время рендеринга)
      if (onPositionChange) {
        setTimeout(() => onPositionChange(position), 0);
      }
      onClick(e);
    }
  };
  const getButtonState = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isActive) return 'active';
    return 'default';
  };

  const getButtonIcon = () => {
    const state = getButtonState();
    
    switch (state) {
      case 'listening':
        return 'fas fa-microphone';
      case 'speaking':
        return 'fas fa-volume-up';
      case 'processing':
        return 'fas fa-spinner';
      default:
        return 'fas fa-robot';
    }
  };

  const getButtonText = () => {
    const state = getButtonState();
    
    switch (state) {
      case 'listening':
        return 'Слушаю...';
      case 'speaking':
        return 'Говорю...';
      case 'processing':
        return 'Думаю...';
      case 'active':
        return 'AI Ассистент';
      default:
        return 'AI Ассистент';
    }
  };

  const buttonState = getButtonState();
  const buttonIcon = getButtonIcon();
  const buttonText = getButtonText();

  return (
    <div 
      ref={dragRef}
      className={`${styles.aiAssistantButton} ${className}`}
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >

      
      {/* Main Button */}
      <button
        className={`${styles.button} ${styles[buttonState]}`}
        onClick={handleClick}
        aria-label={buttonText}
        title={buttonText}
      >
        {/* Background Animation */}
        <div className={styles.backgroundAnimation}>
          <div className={styles.pulse}></div>
          <div className={styles.wave}></div>
        </div>
        
        {/* Icon */}
        <div className={styles.iconContainer}>
          <i className={`${buttonIcon} ${styles.icon}`}></i>
          
          {/* Activity Indicator */}
          {(isListening || isProcessing) && (
            <div className={styles.activityIndicator}>
              <div className={styles.activityRing}></div>
            </div>
          )}
          
          {/* Unread Messages Badge */}
          {hasUnreadMessages && !isActive && (
            <div className={styles.unreadBadge}>
              <div className={styles.unreadDot}></div>
            </div>
          )}
        </div>
        
        {/* Voice Visualization */}
        {isListening && (
          <div className={styles.voiceVisualization}>
            <div className={styles.voiceBar}></div>
            <div className={styles.voiceBar}></div>
            <div className={styles.voiceBar}></div>
            <div className={styles.voiceBar}></div>
          </div>
        )}
      </button>
      
      {/* Status Text */}
      <div className={`${styles.statusText} ${isActive || isListening || isSpeaking || isProcessing ? styles.visible : ''}`}>
        {buttonText}
      </div>
      

    </div>
  );
};

AIAssistantButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  onPositionChange: PropTypes.func,
  externalPosition: PropTypes.object,
  isActive: PropTypes.bool,
  isListening: PropTypes.bool,
  isSpeaking: PropTypes.bool,
  isProcessing: PropTypes.bool,
  hasUnreadMessages: PropTypes.bool,
  className: PropTypes.string
};

export default AIAssistantButton;
