import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './VoiceMode.module.css';

const VoiceMode = ({
  isListening,
  isSpeaking,
  isProcessing,
  onToggleListening,
  onStopSpeaking,
  speechSupported
}) => {
  const [currentResponse, setCurrentResponse] = useState('');

  const getVoiceButtonState = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const getVoiceButtonText = () => {
    const state = getVoiceButtonState();
    switch (state) {
      case 'listening':
        return 'Слушаю вас...';
      case 'speaking':
        return 'Отвечаю...';
      case 'processing':
        return 'Обрабатываю...';
      default:
        return 'Нажмите чтобы начать говорить';
    }
  };

  const getVoiceButtonIcon = () => {
    const state = getVoiceButtonState();
    switch (state) {
      case 'listening':
        return 'fas fa-microphone';
      case 'speaking':
        return 'fas fa-volume-up';
      case 'processing':
        return 'fas fa-brain';
      default:
        return 'fas fa-microphone';
    }
  };

  const getStatusMessage = () => {
    const state = getVoiceButtonState();
    switch (state) {
      case 'listening':
        return 'Говорите сейчас, я вас слушаю';
      case 'speaking':
        return 'Сейчас я отвечу на ваш вопрос';
      case 'processing':
        return 'Анализирую ваш запрос и готовлю ответ';
      default:
        return 'Готов к голосовому общению';
    }
  };



  return (
    <div className={styles.voiceMode}>
      <div className={styles.voiceInterface}>
        
        {/* Central Voice Control */}
        <div className={styles.voiceControlCenter}>
          
          {/* Main Voice Button */}
          <div className={styles.voiceButtonContainer}>
            <button
              className={`${styles.voiceButton} ${styles[getVoiceButtonState()]}`}
              onClick={onToggleListening}
              disabled={!speechSupported}
              title={getVoiceButtonText()}
            >
              {/* Voice Button Icon */}
              <div className={styles.voiceButtonIcon}>
                <i className={getVoiceButtonIcon()}></i>
              </div>
              
              {/* Pulse Animation for Listening */}
              {isListening && (
                <div className={styles.pulseContainer}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`${styles.pulseRing} ${styles[`ring${i + 1}`]}`}
                    ></div>
                  ))}
                </div>
              )}
              

              
              {/* Processing Animation */}
              {isProcessing && (
                <div className={styles.processingAnimation}>
                  <div className={styles.processingDots}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                  </div>
                </div>
              )}
            </button>
          </div>
          
          {/* Voice Status Text */}
          <div className={styles.voiceStatusText}>
            <h3 className={styles.statusTitle}>{getVoiceButtonText()}</h3>
            <p className={styles.statusMessage}>{getStatusMessage()}</p>
          </div>
          
          {/* Stop Speaking Button (when speaking) */}
          {isSpeaking && (
            <button
              className={styles.stopButton}
              onClick={onStopSpeaking}
              title="Остановить речь"
            >
              <i className="fas fa-stop"></i>
              Остановить речь
            </button>
          )}
        </div>



        {/* Voice Status Indicator */}
        <div className={styles.voiceStatusBar}>
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${styles[getVoiceButtonState()]}`}></div>
            <span className={styles.statusText}>
              {speechSupported ? 'Голосовой интерфейс активен' : 'Голосовой интерфейс недоступен'}
            </span>
          </div>
          
          {!speechSupported && (
            <div className={styles.noSpeechWarning}>
              <i className="fas fa-exclamation-triangle"></i>
              Для голосового общения необходим современный браузер с поддержкой Web Speech API
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VoiceMode.propTypes = {
  isListening: PropTypes.bool.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  onToggleListening: PropTypes.func.isRequired,
  onStopSpeaking: PropTypes.func.isRequired,
  speechSupported: PropTypes.bool.isRequired
};

export default VoiceMode;

