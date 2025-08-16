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
  className = ''
}) => {
  const [position, setPosition] = useState({ bottom: 120, right: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    lastPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;

    setPosition(prev => {
      const newRight = Math.max(20, Math.min(window.innerWidth - 100, prev.right - deltaX));
      const newBottom = Math.max(20, Math.min(window.innerHeight - 100, prev.bottom - deltaY));
      
      return {
        right: newRight,
        bottom: newBottom
      };
    });

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    if (!isDragging) {
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
      {/* Tooltip */}
      <div className={`${styles.tooltip} ${isActive ? styles.hidden : ''}`}>
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipTitle}>AI Ассистент прораба</div>
          <div className={styles.tooltipText}>
            Спросите о статусе объекта, критическом пути или отставаниях
          </div>
          <div className={styles.tooltipHint}>
            Кликните для открытия чата
          </div>
        </div>
        <div className={styles.tooltipArrow}></div>
      </div>
      
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
      
      {/* Quick Actions (when active) */}
      {isActive && (
        <div className={styles.quickActions}>
          <button 
            className={styles.quickAction}
            title="Статус проекта"
            onClick={(e) => {
              e.stopPropagation();
              // This will be handled by parent component
            }}
          >
            <i className="fas fa-chart-line"></i>
          </button>
          <button 
            className={styles.quickAction}
            title="Критический путь"
            onClick={(e) => {
              e.stopPropagation();
              // This will be handled by parent component
            }}
          >
            <i className="fas fa-route"></i>
          </button>
          <button 
            className={styles.quickAction}
            title="Проблемы"
            onClick={(e) => {
              e.stopPropagation();
              // This will be handled by parent component
            }}
          >
            <i className="fas fa-exclamation-triangle"></i>
          </button>
        </div>
      )}
    </div>
  );
};

AIAssistantButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  isListening: PropTypes.bool,
  isSpeaking: PropTypes.bool,
  isProcessing: PropTypes.bool,
  hasUnreadMessages: PropTypes.bool,
  className: PropTypes.string
};

export default AIAssistantButton;
