import React from 'react';
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


  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
    }
  };

  const handleQuickQuestionClick = (question) => {
    onQuickQuestion(question);
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
      <div key={message.id} className={`${styles.message} ${isUser ? styles.user : isSystem ? styles.system : styles.assistant}`}>
        <div className={styles.messageContent}>
          {isUser ? (
            <>
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
              
              <div className={styles.userAvatar}>
                <i className="fas fa-user"></i>
              </div>
            </>
          ) : !isSystem ? (
            <>
              <div className={styles.messageAvatar}>
                <i className="fas fa-robot"></i>
              </div>
              
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
            </>
          ) : (
            <div className={styles.messageBody}>
              <div className={styles.messageText}>
                {message.content}
              </div>
              
              <div className={styles.messageInfo}>
                <span className={styles.messageTime}>
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
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
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        

      </div>
      
      {/* Quick Questions - Horizontal scrollable buttons */}
      {quickQuestions && quickQuestions.length > 0 && !messages.some(msg => msg.type === 'user') && (
        <div className={styles.quickQuestionsContainer}>
          <div className={styles.quickQuestionsScroll}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className={styles.quickQuestionButton}
                onClick={() => handleQuickQuestionClick(question)}
                disabled={isTyping}
              >
                <i className="fas fa-comment-alt"></i>
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

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

