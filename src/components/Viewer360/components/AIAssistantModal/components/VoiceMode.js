import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './VoiceMode.module.css';

const VoiceMode = ({
  messages,
  isListening,
  isSpeaking,
  isProcessing,
  onToggleListening,
  onStopSpeaking,
  speechSupported,
  messagesEndRef,
  quickQuestions,
  onQuickQuestion
}) => {
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  const handleQuickQuestionClick = (question) => {
    onQuickQuestion(question);
    setShowQuickQuestions(false);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        return 'Слушаю...';
      case 'speaking':
        return 'Говорю...';
      case 'processing':
        return 'Думаю...';
      default:
        return 'Нажмите и говорите';
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
        return 'fas fa-spinner';
      default:
        return 'fas fa-microphone-slash';
    }
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
        <div className={styles.messageContent}>
          {!isUser && !isSystem && (
            <div className={styles.messageAvatar}>
              <i className="fas fa-robot"></i>
            </div>
          )}
          
          <div className={styles.messageBody}>
            <div className={styles.messageText}>
              {message.content}
            </div>
            
            <div className={styles.messageInfo}>
              <span className={styles.messageTime}>
                {formatMessageTime(message.timestamp)}
              </span>
              
              {message.isVoice && (
                <span className={styles.voiceIndicator}>
                  <i className="fas fa-microphone"></i>
                  Голос
                </span>
              )}
            </div>
          </div>
          
          {isUser && (
            <div className={styles.userAvatar}>
              <i className="fas fa-user"></i>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.voiceMode}>
      {/* Voice Control Center */}
      <div className={styles.voiceControlCenter}>
        <div className={styles.voiceVisualization}>
          {isListening && (
            <div className={styles.soundWaves}>
              <div className={styles.soundWave}></div>
              <div className={styles.soundWave}></div>
              <div className={styles.soundWave}></div>
              <div className={styles.soundWave}></div>
              <div className={styles.soundWave}></div>
            </div>
          )}
          
          {isSpeaking && (
            <div className={styles.speakingIndicator}>
              <div className={styles.speakingWave}></div>
              <div className={styles.speakingWave}></div>
              <div className={styles.speakingWave}></div>
            </div>
          )}
          
          {isProcessing && (
            <div className={styles.processingRing}>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
            </div>
          )}
        </div>
        
        <div className={styles.voiceControls}>
          {!speechSupported ? (
            <div className={styles.voiceUnsupported}>
              <i className="fas fa-microphone-slash"></i>
              <div className={styles.unsupportedText}>
                <div>Голосовой режим недоступен</div>
                <div>в вашем браузере</div>
              </div>
            </div>
          ) : (
            <>
              <button
                className={`${styles.voiceButton} ${styles[getVoiceButtonState()]}`}
                onClick={isListening ? onToggleListening : onToggleListening}
                disabled={isProcessing}
              >
                <div className={styles.voiceButtonIcon}>
                  <i className={getVoiceButtonIcon()}></i>
                </div>
              </button>
              
              {isSpeaking && (
                <button
                  className={styles.stopSpeakingButton}
                  onClick={onStopSpeaking}
                  title="Остановить воспроизведение"
                >
                  <i className="fas fa-stop"></i>
                </button>
              )}
            </>
          )}
        </div>
        
        <div className={styles.voiceStatus}>
          <div className={styles.statusText}>
            {!speechSupported ? 'Голос недоступен' : getVoiceButtonText()}
          </div>
          
          {speechSupported && !isProcessing && !isListening && !isSpeaking && (
            <div className={styles.voiceHint}>
              <i className="fas fa-info-circle"></i>
              Нажмите кнопку микрофона и говорите
            </div>
          )}
        </div>
      </div>
      
      {/* Messages History */}
      <div className={styles.messagesContainer}>
        <div className={styles.messagesHeader}>
          <i className="fas fa-history"></i>
          История разговора
        </div>
        
        <div className={styles.messagesList}>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick Questions for Voice */}
      {showQuickQuestions && messages.length <= 1 && speechSupported && (
        <div className={styles.quickQuestions}>
          <div className={styles.quickQuestionsTitle}>
            <i className="fas fa-lightning-bolt"></i>
            Попробуйте спросить:
          </div>
          <div className={styles.quickQuestionsList}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className={styles.quickQuestionButton}
                onClick={() => handleQuickQuestionClick(question)}
              >
                <i className="fas fa-comment-alt"></i>
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

VoiceMode.propTypes = {
  messages: PropTypes.array.isRequired,
  isListening: PropTypes.bool.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  onToggleListening: PropTypes.func.isRequired,
  onStopSpeaking: PropTypes.func.isRequired,
  speechSupported: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  quickQuestions: PropTypes.array.isRequired,
  onQuickQuestion: PropTypes.func.isRequired
};

export default VoiceMode;

