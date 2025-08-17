import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChatHistory.module.css';

const ChatHistory = ({
  messages,
  messagesEndRef,
  onClearChat,
  chatHistory = [],
  onLoadChat
}) => {
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={styles.chatHistory}>
      {/* Header */}
      <div className={styles.historyHeader}>
        <div className={styles.historyTitle}>
          <i className="fas fa-history"></i>
          История разговоров
        </div>
        
        <div className={styles.historyStats}>
          <span className={styles.messageCount}>
            {chatHistory.length + (messages.length > 1 ? 1 : 0)} чатов
          </span>
          
          {messages.length > 1 && (
            <button
              className={styles.clearAllButton}
              onClick={onClearChat}
              title="Очистить всю историю"
            >
              <i className="fas fa-trash-alt"></i>
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {chatHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-comments"></i>
            <h3>История пуста</h3>
            <p>Начните разговор в режиме чата или голоса</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {/* Текущий активный чат */}
            {messages.length > 1 && (
              <div className={styles.currentChatGroup}>
                <div className={styles.currentChatHeader}>
                  <span className={styles.currentChatLabel}>
                    <i className="fas fa-comment-dots"></i>
                    Текущий разговор
                  </span>
                </div>
                <div className={styles.chatPreview}>
                  {messages.slice(1, 4).map(msg => (
                    <div key={msg.id} className={`${styles.previewMessage} ${styles[msg.type]}`}>
                      <strong>{msg.type === 'user' ? 'Вы' : 'AI'}:</strong> {msg.content.substring(0, 80)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Сохраненная история */}
            {chatHistory.map((chat) => (
              <div 
                key={chat.id} 
                className={`${styles.historyChat} ${onLoadChat ? styles.clickable : ''}`}
                onClick={() => onLoadChat && onLoadChat(chat)}
                title={onLoadChat ? "Нажмите, чтобы загрузить этот чат" : ""}
              >
                <div className={styles.chatHeader}>
                  <div className={styles.chatTitle}>{chat.title}</div>
                  <div className={styles.chatDate}>
                    {formatMessageDate(chat.createdAt)}
                  </div>
                </div>
                <div className={styles.chatPreview}>
                  {chat.messages.slice(1, 3).map(msg => (
                    <div key={msg.id} className={`${styles.previewMessage} ${styles[msg.type]}`}>
                      <strong>{msg.type === 'user' ? 'Вы' : 'AI'}:</strong> {msg.content.substring(0, 80)}...
                    </div>
                  ))}
                </div>
                <div className={styles.chatStats}>
                  <span>{chat.messages.length} сообщений</span>
                  <span>{formatMessageTime(chat.lastActivity)}</span>
                  {onLoadChat && (
                    <span className={styles.loadHint}>
                      <i className="fas fa-mouse-pointer"></i>
                      Загрузить
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.historyFooter}>
        <div className={styles.footerInfo}>
          <i className="fas fa-info-circle"></i>
          <span>История сохраняется локально в браузере</span>
        </div>
      </div>
    </div>
  );
};

ChatHistory.propTypes = {
  messages: PropTypes.array.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  onClearChat: PropTypes.func.isRequired,
  chatHistory: PropTypes.array,
  onLoadChat: PropTypes.func
};

export default ChatHistory;
