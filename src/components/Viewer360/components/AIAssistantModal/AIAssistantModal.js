import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChatMode from './components/ChatMode';
import VoiceMode from './components/VoiceMode';
import styles from './AIAssistantModal.module.css';

const AIAssistantModal = ({
  isVisible,
  onClose,
  chatMode,
  onChatModeToggle,
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
  messagesEndRef
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ bottom: 200, right: 30 });
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
      const newBottom = Math.max(20, Math.min(window.innerHeight - 620, prev.bottom + deltaY));
      
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
          onClose();
        }
      }
    };

    if (isVisible && !isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, isMinimized, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

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
    <div className={`${styles.modalOverlay} ${isMinimized ? styles.minimized : ''}`}>
      <div 
        ref={modalRef}
        className={`${styles.modal} ${isMinimized ? styles.minimizedModal : ''}`}
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header */}
        <div className={styles.header} onMouseDown={handleMouseDown}>
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
            {/* Mode Toggle */}
            <button
              className={`${styles.modeToggle} ${chatMode === 'voice' ? styles.voiceMode : styles.chatMode}`}
              onClick={onChatModeToggle}
              title={`Переключить на ${chatMode === 'chat' ? 'голосовой' : 'текстовый'} режим`}
              disabled={!speechSupported && chatMode === 'chat'}
            >
              <i className={chatMode === 'chat' ? 'fas fa-microphone' : 'fas fa-keyboard'}></i>
            </button>
            
            {/* Minimize/Restore */}
            <button
              className={styles.minimizeButton}
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Развернуть' : 'Свернуть'}
            >
              <i className={isMinimized ? 'fas fa-window-maximize' : 'fas fa-window-minimize'}></i>
            </button>
            
            {/* Clear Chat */}
            <button
              className={styles.clearButton}
              onClick={onClearChat}
              title="Очистить чат"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
            
            {/* Close */}
            <button
              className={styles.closeButton}
              onClick={onClose}
              title="Закрыть"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
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
              {chatMode === 'chat' ? (
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
              ) : (
                <VoiceMode
                  messages={messages}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isProcessing={isProcessing}
                  onToggleListening={onToggleListening}
                  onStopSpeaking={onStopSpeaking}
                  speechSupported={speechSupported}
                  messagesEndRef={messagesEndRef}
                  quickQuestions={quickQuestions}
                  onQuickQuestion={handleQuickQuestion}
                />
              )}
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
          </>
        )}
        
        {/* Minimized Content */}
        {isMinimized && (
          <div className={styles.minimizedContent}>
            <div className={styles.minimizedTitle}>AI Ассистент</div>
            <div className={styles.minimizedStatus}>
              {isProcessing ? 'Думаю...' :
               isListening ? 'Слушаю...' :
               isSpeaking ? 'Говорю...' :
               'Готов к работе'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AIAssistantModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chatMode: PropTypes.string.isRequired,
  onChatModeToggle: PropTypes.func.isRequired,
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
  messagesEndRef: PropTypes.object.isRequired
};

export default AIAssistantModal;
