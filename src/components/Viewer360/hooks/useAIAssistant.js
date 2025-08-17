import { useState, useRef, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../../../config/api';
import { MOCK_NETWORK_SCHEDULE, getProjectStatus, getScheduleInsights } from '../../../data/mockNetworkSchedule';

/**
 * Хук для управления AI ассистентом с голосовым интерфейсом
 */
const useAIAssistant = () => {
  // Основные состояния
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [chatMode, setChatMode] = useState('chat'); // 'chat' | 'voice' | 'history'
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Привет! Я ваш AI ассистент по сетевому плану строительства. Могу рассказать о статусе проекта, критическом пути, вехах и ответить на ваши вопросы. Как дела на объекте?',
      timestamp: new Date()
    }
  ]);
  
  // Состояния для голосового интерфейса
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Состояния для текстового чата
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatModeRef = useRef(chatMode);

  // Обновляем ref при изменении chatMode
  useEffect(() => {
    chatModeRef.current = chatMode;
    console.log('chatMode updated to:', chatMode);
  }, [chatMode]);

  // Проверка поддержки голосовых технологий
  useEffect(() => {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    
    console.log('Speech Recognition supported:', speechRecognitionSupported);
    console.log('Speech Synthesis supported:', speechSynthesisSupported);
    
    setSpeechSupported(speechRecognitionSupported && speechSynthesisSupported);
    
    if (speechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognition result:', transcript);
        handleVoiceInput(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        addMessage('system', 'Произошла ошибка распознавания речи. Попробуйте еще раз.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [handleVoiceInput]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Функция для добавления сообщения
  const addMessage = useCallback((type, content, metadata = {}) => {
    const newMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      ...metadata
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Функция для генерации контекста сетевого плана
  const generateScheduleContext = () => {
    const status = getProjectStatus();
    const insights = getScheduleInsights();
    const activePhases = MOCK_NETWORK_SCHEDULE.phases.filter(p => p.status === 'В процессе');
    const delayedPhases = MOCK_NETWORK_SCHEDULE.phases.filter(p => p.issues?.length > 0);
    
    return {
      project: MOCK_NETWORK_SCHEDULE.project,
      currentStatus: status,
      insights,
      activePhases,
      delayedPhases,
      milestones: MOCK_NETWORK_SCHEDULE.milestones,
      criticalPath: MOCK_NETWORK_SCHEDULE.criticalPath,
      recentUpdates: MOCK_NETWORK_SCHEDULE.recentUpdates
    };
  };

  // Функция для обработки AI запроса
  const processAIRequest = useCallback(async (userMessage) => {
    setIsProcessing(true);
    
    // Искусственная задержка для имитации работы нейросети (1.5-3 секунды)
    const delay = Math.random() * 1500 + 1500; // от 1.5 до 3 секунд
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const context = generateScheduleContext();
      
      // Формируем промпт для AI ассистента
      const systemPrompt = `Ты - опытный ассистент прораба на строительном объекте "${context.project.name}". 

Твоя роль:
- Эксперт по сетевому планированию строительства
- Критически мыслящий специалист, не соглашающийся со всем подряд
- Говоришь кратко и по делу, как настоящий прораб
- Можешь поспорить, если видишь проблемы
- Отстаиваешь свою точку зрения на основе данных

Текущее состояние проекта:
- Общий прогресс: ${context.currentStatus.overallProgress}%
- Отставание: ${context.currentStatus.schedule.delay} дней
- Бюджет освоен на: ${context.currentStatus.budget.utilizationPercent}%
- Активные фазы: ${context.activePhases.map(p => p.name).join(', ')}
- Проблемные фазы: ${context.delayedPhases.map(p => p.name + ' (' + p.issues[0]?.description + ')').join('; ')}

Критический путь: ${context.criticalPath.join(' → ')}

Последние обновления:
${context.recentUpdates.slice(0, 3).map(u => `${u.date}: ${u.message}`).join('\n')}

Отвечай на русском языке, используй строительную терминологию. Будь конкретным и полезным.`;

      const requestPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      // Отправляем запрос к AI API
      const response = await fetch(API_CONFIG.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        console.warn(`AI API error: ${response.status}. Switching to mock responses.`);
        // При ошибке API (например, отсутствует ключ) используем mock ответы
        return generateMockResponse(userMessage);
      }

      const data = await response.json();
      
      // Извлекаем ответ AI
      let aiResponse = '';
      if (data.choices && data.choices[0]?.message?.content) {
        aiResponse = data.choices[0].message.content.trim();
      } else if (data.response) {
        aiResponse = data.response.trim();
      } else if (data.result) {
        aiResponse = data.result.trim();
      } else {
        aiResponse = 'Получен ответ от AI агента, но формат данных неожиданный. Попробуйте переформулировать вопрос.';
      }

      return aiResponse;
    } catch (error) {
      console.error('AI request error:', error);
      
      // Fallback ответы на основе mock данных
      return generateMockResponse(userMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Функция для генерации mock ответов (fallback)
  const generateMockResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const context = generateScheduleContext();
    
    if (lowerMessage.includes('статус') || lowerMessage.includes('дела') || lowerMessage.includes('как дела')) {
      return `Слушай, ситуация такая: проект идет с отставанием на ${context.currentStatus.schedule.delay} дня. Фундамент застрял из-за проблем с арматурой. Общий прогресс ${context.currentStatus.overallProgress}%, но это не радует - мы должны были быть дальше. Критический путь под угрозой.`;
    }
    
    if (lowerMessage.includes('критический') || lowerMessage.includes('критпуть')) {
      return `Критический путь у нас такой: земляные → фундамент → каркас → кровля. Сейчас застряли на фундаменте - арматура не пришла вовремя. Это значит, что весь проект может поехать. Надо срочно давить на поставщиков или искать альтернативы.`;
    }
    
    if (lowerMessage.includes('отставание') || lowerMessage.includes('задержка')) {
      return `Да, отстаем на ${context.currentStatus.schedule.delay} дня. И знаешь что меня бесит? Это предсказуемо было! Я еще месяц назад говорил, что с поставщиками арматуры проблемы будут. Но нет, все думали "пронесет". Теперь расхлебываем.`;
    }
    
    if (lowerMessage.includes('деньги') || lowerMessage.includes('бюджет')) {
      return `По деньгам пока не критично - освоили ${context.currentStatus.budget.utilizationPercent}% от планового бюджета. Но если отставание продолжится, штрафы за срыв сроков съедят всю прибыль. Плюс зимние работы дороже выйдут.`;
    }
    
    if (lowerMessage.includes('рабочие') || lowerMessage.includes('люди')) {
      return `Рабочих хватает - 38 человек на объекте из 45 запланированных. Но что толку, если арматуры нет? Людей перебросил на другие участки, чтобы простоя не было. Хотя понимаю, что это временное решение.`;
    }
    
    if (lowerMessage.includes('погода')) {
      return `Погода пока держится нормально, но скоро осень. Если с фундаментом не разберемся до холодов, то зимой работы встанут в копеечку. Бетон в мороз - это отдельная головная боль и лишние расходы.`;
    }
    
    return `Понял тебя. Вопрос серьезный, но давай по порядку разберем. Проект "${context.project.name}" сейчас в стадии фундаментных работ с небольшими проблемами. Если нужны конкретные детали - спрашивай, расскажу что знаю.`;
  };

  // Обработка голосового ввода
  const handleVoiceInput = useCallback(async (transcript) => {
    const currentChatMode = chatModeRef.current;
    console.log('handleVoiceInput called with chatMode from ref:', currentChatMode);
    setIsListening(false);
    
    if (!transcript.trim()) return;
    
    // Добавляем сообщение пользователя
    addMessage('user', transcript, { isVoice: true });
    
    // Обрабатываем запрос
    const aiResponse = await processAIRequest(transcript);
    
    // Добавляем ответ AI
    const assistantMessage = addMessage('assistant', aiResponse);
    
    // Озвучиваем ответ в голосовом режиме
    console.log('Current chatMode from ref:', currentChatMode);
    if (currentChatMode === 'voice') {
      console.log('Voice mode detected, scheduling speech...');
      setTimeout(() => {
        console.log('About to call speakText with response:', aiResponse);
        speakText(aiResponse);
      }, 500);
    } else {
      console.log('Not in voice mode, skipping speech');
    }
  }, [addMessage, processAIRequest, speakText]);

  // Обработка текстового ввода
  const handleTextInput = async (text) => {
    if (!text.trim()) return;
    
    // Добавляем сообщение пользователя
    addMessage('user', text);
    setInputValue('');
    
    // Показываем индикатор печати
    setIsTyping(true);
    
    // Обрабатываем запрос
    const aiResponse = await processAIRequest(text);
    
    setIsTyping(false);
    
    // Добавляем ответ AI
    addMessage('assistant', aiResponse);
    
    // Озвучиваем ответ, если включен голосовой режим
    if (chatMode === 'voice') {
      setTimeout(() => {
        speakText(aiResponse);
      }, 500);
    }
  };

  // Функция для озвучивания текста
  const speakText = useCallback((text) => {
    console.log('speakText called with:', text);
    console.log('speechSupported:', speechSupported);
    console.log('speechSynthesis available:', 'speechSynthesis' in window);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis не поддерживается браузером');
      return;
    }
    
    // Останавливаем предыдущее воспроизведение
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 2;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      console.log('Speech synthesis started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech synthesis ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    console.log('Starting speech synthesis...');
    window.speechSynthesis.speak(utterance);
    synthesisRef.current = utterance;
  }, [speechSupported]);

  // Начать/остановить прослушивание
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      addMessage('system', 'Голосовой ввод не поддерживается в этом браузере');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Остановить воспроизведение речи
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Переключение режима чата (циклично: chat -> voice -> history -> chat)
  const toggleChatMode = () => {
    let newMode;
    switch (chatMode) {
      case 'chat':
        newMode = 'voice';
        break;
      case 'voice':
        newMode = 'history';
        break;
      case 'history':
        newMode = 'chat';
        break;
      default:
        newMode = 'chat';
    }
    
    setChatMode(newMode);
    
    if (newMode !== 'voice') {
      stopSpeaking();
      if (isListening) {
        toggleListening();
      }
    }
  };

  // Прямое переключение на конкретный режим
  const setDirectChatMode = (mode) => {
    setChatMode(mode);
    
    if (mode !== 'voice') {
      stopSpeaking();
      if (isListening) {
        toggleListening();
      }
    }
  };

  // История чатов (в памяти, обнуляется при перезагрузке)
  const [chatHistory, setChatHistory] = useState([]);

  // Сохранение истории (только в памяти)
  const saveChatHistory = useCallback((history) => {
    setChatHistory(history);
  }, []);

  // Новый чат - сохраняет текущий в историю и создает новый
  const startNewChat = useCallback(() => {
    if (messages.length > 1) { // Если есть сообщения кроме приветственного
      const currentChat = {
        id: Date.now().toString(),
        title: messages[1]?.content?.substring(0, 50) + '...' || 'Новый разговор',
        messages: messages,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      const newHistory = [currentChat, ...chatHistory];
      saveChatHistory(newHistory);
    }

    // Создаем новый чат
    setMessages([
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Привет! Я ваш AI ассистент по сетевому плану строительства. Могу рассказать о статусе проекта, критическом пути, вехах и ответить на ваши вопросы. Как дела на объекте?',
        timestamp: new Date()
      }
    ]);
    setInputValue('');
  }, [messages, chatHistory, saveChatHistory]);

  // Очистка чата (старая функция для совместимости)
  const clearChat = () => {
    startNewChat();
  };

  // Загрузка чата из истории
  const loadChat = useCallback((chat) => {
    console.log('Loading chat:', chat);
    
    // Сохраняем текущий чат в историю если он не пустой
    if (messages.length > 1) {
      const currentChat = {
        id: Date.now().toString(),
        title: messages[1]?.content?.substring(0, 50) + '...' || 'Новый разговор',
        messages: messages,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      const newHistory = [currentChat, ...chatHistory];
      saveChatHistory(newHistory);
    }

    // Загружаем выбранный чат
    setMessages(chat.messages);
    setInputValue('');
    
    // Переключаемся в чат режим
    setChatMode('chat');
    
    console.log('Chat loaded successfully');
  }, [messages, chatHistory, saveChatHistory, setChatMode]);

  // Быстрые вопросы
  const quickQuestions = [
    'Как дела на объекте?',
    'Какой статус критического пути?',
    'Есть ли отставания?',
    'Когда следующая веха?',
    'Как с бюджетом?'
  ];

  return {
    // Основные состояния
    isAssistantVisible,
    setIsAssistantVisible,
    chatMode,
    setChatMode: toggleChatMode,
    setDirectChatMode,
    messages,
    
    // Голосовые состояния
    isListening,
    isSpeaking,
    isProcessing,
    speechSupported,
    
    // Текстовый чат
    inputValue,
    setInputValue,
    isTyping,
    
    // Функции
    handleTextInput,
    toggleListening,
    stopSpeaking,
    speakText,
    clearChat,
    startNewChat,
    loadChat,
    addMessage,
    
    // Утилиты
    messagesEndRef,
    quickQuestions,
    chatHistory,
    
    // Контекст проекта
    projectContext: generateScheduleContext()
  };
};

export default useAIAssistant;

