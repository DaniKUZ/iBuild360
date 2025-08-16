import { useState, useRef, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../../../config/api';
import { MOCK_NETWORK_SCHEDULE, getProjectStatus, getScheduleInsights } from '../../../data/mockNetworkSchedule';

/**
 * Хук для управления AI ассистентом с голосовым интерфейсом
 */
const useAIAssistant = () => {
  // Основные состояния
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [chatMode, setChatMode] = useState('chat'); // 'chat' | 'voice'
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

  // Проверка поддержки голосовых технологий
  useEffect(() => {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    setSpeechSupported(speechRecognitionSupported && speechSynthesisSupported);
    
    if (speechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
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
  }, []);

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
  const processAIRequest = async (userMessage) => {
    setIsProcessing(true);
    
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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      // Отправляем запрос к AI API
      const response = await fetch(API_CONFIG.AGENT360_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
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
  };

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
  const handleVoiceInput = async (transcript) => {
    setIsListening(false);
    
    if (!transcript.trim()) return;
    
    // Добавляем сообщение пользователя
    addMessage('user', transcript, { isVoice: true });
    
    // Обрабатываем запрос
    const aiResponse = await processAIRequest(transcript);
    
    // Добавляем ответ AI
    const assistantMessage = addMessage('assistant', aiResponse);
    
    // Озвучиваем ответ в голосовом режиме
    if (chatMode === 'voice' && speechSupported) {
      speakText(aiResponse);
    }
  };

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
  };

  // Функция для озвучивания текста
  const speakText = (text) => {
    if (!speechSupported || !('speechSynthesis' in window)) return;
    
    // Останавливаем предыдущее воспроизведение
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    synthesisRef.current = utterance;
  };

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

  // Переключение режима чата
  const toggleChatMode = () => {
    const newMode = chatMode === 'chat' ? 'voice' : 'chat';
    setChatMode(newMode);
    
    if (newMode === 'chat') {
      stopSpeaking();
      if (isListening) {
        toggleListening();
      }
    }
  };

  // Очистка чата
  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Чат очищен. Чем могу помочь?',
        timestamp: new Date()
      }
    ]);
  };

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
    addMessage,
    
    // Утилиты
    messagesEndRef,
    quickQuestions,
    
    // Контекст проекта
    projectContext: generateScheduleContext()
  };
};

export default useAIAssistant;

