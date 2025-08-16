import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ChatMode.module.css';

const ChatMode = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isTyping,
  messagesEndRef,
  quickQuestions,
  onQuickQuestion
}) => {
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setShowQuickQuestions(false);
    }
  };

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
    <div className={styles.chatMode}>
      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.map(renderMessage)}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageContent}>
                <div className={styles.messageAvatar}>
                  <i className="fas fa-robot"></i>
                </div>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className={styles.typingText}>Печатает...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Questions */}
        {showQuickQuestions && messages.length <= 1 && (
          <div className={styles.quickQuestions}>
            <div className={styles.quickQuestionsTitle}>
              <i className="fas fa-lightning-bolt"></i>
              Быстрые вопросы:
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
      
      {/* Input Form */}
      <div className={styles.inputContainer}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Спросите о статусе проекта, критическом пути или отставаниях..."
              className={styles.messageInput}
              disabled={isTyping}
            />
            
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isTyping}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <div className={styles.inputHint}>
            <i className="fas fa-info-circle"></i>
            Нажмите Enter для отправки или выберите быстрый вопрос
          </div>
        </form>
      </div>
    </div>
  );
};

ChatMode.propTypes = {
  messages: PropTypes.array.isRequired,
  inputValue: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isTyping: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  quickQuestions: PropTypes.array.isRequired,
  onQuickQuestion: PropTypes.func.isRequired
};

export default ChatMode;

