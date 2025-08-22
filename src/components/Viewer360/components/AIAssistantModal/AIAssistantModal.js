import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChatMode from './components/ChatMode';
import VoiceMode from './components/VoiceMode';
import ChatHistory from './components/ChatHistory';
import styles from './AIAssistantModal.module.css';

const AIAssistantModal = ({
  isVisible,
  onClose,
  chatMode,
  onChatModeToggle,
  setDirectChatMode,
  onStartNewChat,
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isListening,
  isSpeaking,
  isProcessing,
  isTyping,
  onToggleListening,
  onStopSpeaking,
  speechSupported,
  onClearChat,
  quickQuestions,
  projectContext,
  messagesEndRef,
  chatHistory,
  onLoadChat,
  initialPosition,
  onPositionChange,
  // Новые пропы для настроек
  selectedCharacter,
  setSelectedCharacter,
  selectedResponseStyle,
  setSelectedResponseStyle,
  isSettingsOpen,
  setIsSettingsOpen,
  characters,
  responseStyles
}) => {
  const [position, setPosition] = useState(initialPosition || { bottom: 250, right: 30 });

  // Обновляем позицию при изменении initialPosition
  React.useEffect(() => {
    if (initialPosition) {
      // Проверяем границы экрана и корректируем позицию
      const modalHeight = 620; // примерная высота модального окна
      const modalWidth = 420; // примерная ширина модального окна
      
      const correctedPosition = {
        right: Math.max(20, Math.min(window.innerWidth - modalWidth, initialPosition.right)),
        bottom: Math.max(20, Math.min(window.innerHeight - modalHeight, initialPosition.bottom))
      };
      
      setPosition(correctedPosition);
    }
  }, [initialPosition]);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Handle dragging
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
      const newRight = Math.max(20, Math.min(window.innerWidth - 420, prev.right - deltaX));
      const newBottom = Math.max(20, Math.min(window.innerHeight - 620, prev.bottom - deltaY));
      
      const newPosition = {
        right: newRight,
        bottom: newBottom
      };
      
      // Передаем новую позицию родительскому компоненту (отложенно чтобы избежать setState во время рендеринга)
      if (onPositionChange) {
        setTimeout(() => onPositionChange(newPosition), 0);
      }
      
      return newPosition;
    });

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Don't close if clicking on the AI button
        if (!event.target.closest('[class*="aiAssistantButton"]')) {
          // Передаем текущую позицию при закрытии (отложенно чтобы избежать setState во время рендеринга)
          if (onPositionChange) {
            setTimeout(() => onPositionChange(position), 0);
          }
          onClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose, position, onPositionChange]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        // Передаем текущую позицию при закрытии (отложенно чтобы избежать setState во время рендеринга)
        if (onPositionChange) {
          setTimeout(() => onPositionChange(position), 0);
        }
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose, position, onPositionChange]);

  if (!isVisible) return null;

  const handleQuickQuestion = (question) => {
    onSendMessage(question);
  };

  const getProjectStatusSummary = () => {
    if (!projectContext) return 'Загрузка данных...';
    
    const { currentStatus, insights } = projectContext;
    return `Проект: ${currentStatus.overallProgress}% готов, ${insights.overallHealth === 'good' ? 'в срок' : 'есть отставания'}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div 
        ref={modalRef}
        className={styles.modal}
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header */}
        <div className={styles.header} onMouseDown={handleMouseDown}>
          <div className={styles.headerTop}>
            <div className={styles.headerLeft}>
              <div className={styles.assistantAvatar}>
                <i className={`fas fa-robot ${isProcessing ? styles.processing : ''}`}></i>
              </div>
              <div className={styles.assistantInfo}>
                <h3 className={styles.assistantName}>AI Ассистент прораба</h3>
                <div className={styles.assistantStatus}>
                  {isProcessing ? 'Думаю...' :
                   isListening ? 'Слушаю...' :
                   isSpeaking ? 'Говорю...' :
                   'Онлайн'}
                </div>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {/* New Chat */}
              <button
                className={styles.newChatButton}
                onClick={onStartNewChat}
                title="Начать новый чат"
              >
                <i className="fas fa-plus"></i>
              </button>
              
              {/* Close */}
              <button
                className={styles.closeButton}
                onClick={() => {
                  // Передаем текущую позицию при закрытии (отложенно чтобы избежать setState во время рендеринга)
                  if (onPositionChange) {
                    setTimeout(() => onPositionChange(position), 0);
                  }
                  onClose();
                }}
                title="Закрыть"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className={styles.headerBottom}>
            {/* Mode Tabs */}
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${!isSettingsOpen && chatMode === 'chat' ? styles.active : ''}`}
                onClick={() => {
                  setIsSettingsOpen(false);
                  setDirectChatMode('chat');
                }}
                title="Текстовый чат"
              >
                <i className="fas fa-comments"></i>
                <span>Чат</span>
              </button>
              
              <button
                className={`${styles.modeTab} ${!isSettingsOpen && chatMode === 'voice' ? styles.active : ''}`}
                onClick={() => {
                  setIsSettingsOpen(false);
                  setDirectChatMode('voice');
                }}
                title="Голосовое общение"
                disabled={!speechSupported}
              >
                <i className="fas fa-microphone"></i>
                <span>Голос</span>
              </button>
              
              <button
                className={`${styles.modeTab} ${!isSettingsOpen && chatMode === 'history' ? styles.active : ''}`}
                onClick={() => {
                  setIsSettingsOpen(false);
                  setDirectChatMode('history');
                }}
                title="История разговоров"
              >
                <i className="fas fa-history"></i>
                <span>История</span>
              </button>
              
              <button
                className={`${styles.modeTab} ${isSettingsOpen ? styles.active : ''}`}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Настройки ассистента"
              >
                <i className="fas fa-cog"></i>
                <span>Настройки</span>
              </button>
            </div>
          </div>
        </div>
        
            {/* Project Status Bar */}
            <div className={styles.projectStatus}>
              <div className={styles.statusIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className={styles.statusText}>
                {getProjectStatusSummary()}
              </div>
              {projectContext?.insights?.overallHealth !== 'good' && (
                <div className={styles.alertIcon}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              )}
            </div>
            
            {/* Mode Content */}
            <div className={styles.content}>
              {isSettingsOpen ? (
                <div className={styles.settingsMode}>
                  <div className={styles.settingsContent}>
                    <h3>Настройки ассистента</h3>
                    
                    <div className={styles.settingGroup}>
                      <label>Стиль общения</label>
                      <div className={styles.characterOptions}>
                        {Object.entries(characters).map(([key, character]) => (
                          <div 
                            key={key}
                            className={`${styles.characterOption} ${selectedCharacter === key ? styles.selected : ''}`}
                            onClick={() => setSelectedCharacter(key)}
                          >
                            <div className={styles.characterName}>{character.name}</div>
                            <div className={styles.characterDescription}>{character.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.settingGroup}>
                      <label>Длина ответов</label>
                      <div className={styles.responseStyleOptions}>
                        {Object.entries(responseStyles).map(([key, style]) => (
                          <div 
                            key={key}
                            className={`${styles.responseStyleOption} ${selectedResponseStyle === key ? styles.selected : ''}`}
                            onClick={() => setSelectedResponseStyle(key)}
                          >
                            <div className={styles.styleName}>{style.name}</div>
                            <div className={styles.styleDescription}>{style.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.settingsFooter}>
                      <button 
                        className={styles.saveButton}
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        Применить настройки
                      </button>
                    </div>
                  </div>
                </div>
              ) : chatMode === 'chat' ? (
                <ChatMode
                  messages={messages}
                  inputValue={inputValue}
                  onInputChange={onInputChange}
                  onSendMessage={onSendMessage}
                  isTyping={isTyping}
                  messagesEndRef={messagesEndRef}
                  quickQuestions={quickQuestions}
                  onQuickQuestion={handleQuickQuestion}
                />
              ) : chatMode === 'voice' ? (
                <VoiceMode
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isProcessing={isProcessing}
                  onToggleListening={onToggleListening}
                  onStopSpeaking={onStopSpeaking}
                  speechSupported={speechSupported}
                />
              ) : chatMode === 'history' ? (
                <ChatHistory
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  onClearChat={onClearChat}
                  chatHistory={chatHistory}
                  onLoadChat={onLoadChat}
                />
              ) : null}
            </div>
            
            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                <div className={styles.aiStatus}>
                  <div className={styles.aiIndicator}></div>
                  <span>Powered by AI</span>
                </div>
              </div>
              
              <div className={styles.footerRight}>
                {!speechSupported && (
                  <div className={styles.voiceWarning}>
                    <i className="fas fa-microphone-slash"></i>
                    <span>Голос недоступен</span>
                  </div>
                )}
                
                <div className={styles.messageCount}>
                  {messages.length} сообщений
                </div>
              </div>
            </div>
        

      </div>
    </div>
  );
};

AIAssistantModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialPosition: PropTypes.object,
  onPositionChange: PropTypes.func,
  chatMode: PropTypes.string.isRequired,
  onChatModeToggle: PropTypes.func.isRequired,
  setDirectChatMode: PropTypes.func.isRequired,
  onStartNewChat: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  inputValue: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isListening: PropTypes.bool.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  isTyping: PropTypes.bool.isRequired,
  onToggleListening: PropTypes.func.isRequired,
  onStopSpeaking: PropTypes.func.isRequired,
  speechSupported: PropTypes.bool.isRequired,
  onClearChat: PropTypes.func.isRequired,
  quickQuestions: PropTypes.array.isRequired,
  projectContext: PropTypes.object,
  messagesEndRef: PropTypes.object.isRequired,
  chatHistory: PropTypes.array,
  onLoadChat: PropTypes.func
};

export default AIAssistantModal;
