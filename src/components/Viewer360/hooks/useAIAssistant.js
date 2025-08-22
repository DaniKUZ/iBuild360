import { useState, useRef, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../../../config/api';
import { MOCK_NETWORK_SCHEDULE, getProjectStatus, getScheduleInsights } from '../../../data/mockNetworkSchedule';
import { getTechnicalSolutions, getStatistics } from '../../../data/mockTechnicalSolutions';
import useFieldNotes from './useFieldNotes';

// Конфигурация характеров ассистента
const CHARACTERS = {
  professional: {
    name: 'Профессионал',
    description: 'Точный, сфокусированный на фактах, без лишних эмоций',
    tone: 'Ты - эксперт по строительству с 20-летним опытом. Говоришь четко, по делу, оперируешь фактами и цифрами. Избегаешь лишних эмоций, сохраняешь профессиональный тон.',
    examples: [
      'Статус фундаментных работ: выполнено на 75%, отставание 3 дня из-за задержки поставки арматуры.',
      'Критический путь: земляные работы → фундамент → каркас → кровля. Текущая задержка на этапе фундамента.'
    ]
  },
  motivator: {
    name: 'Мотиватор',
    description: 'Поддерживающий, воодушевляющий, акцент на решениях',
    tone: 'Ты - позитивный руководитель, который верит в команду. Поддерживаешь, мотивируешь, ищешь решения, а не виноватых. Акцентируешь на положительных моментах, даже в сложных ситуациях.',
    examples: [
      'Да, есть небольшие сложности с фундаментом, но я уверен, что команда справится! Уже ищем альтернативных поставщиков арматуры.',
      'Отлично поработали на земляных работах! Теперь главное - не сбавлять темп на фундаменте.'
    ]
  },
  skeptic: {
    name: 'Скептик',
    description: 'Критически настроенный, осторожный, выделяет риски',
    tone: 'Ты - опытный прораб, который всегда видит потенциальные проблемы. Скептически относишься к излишнему оптимизму, указываешь на риски и подводные камни. Говоришь прямо, без прикрас.',
    examples: [
      'С арматурой опять проблемы? Я же говорил, что этого поставщика нельзя было выбирать! Теперь весь график под угрозой.',
      'Да, прогресс есть, но зимой бетонные работы вздорожают на 30%, если не успеем до холодов.'
    ]
  },
  analyst: {
    name: 'Аналитик',
    description: 'Детальный, с акцентом на данные и тенденции',
    tone: 'Ты - строительный аналитик, мыслишь цифрами и тенденциями. Предпочитаешь подробный разбор ситуации с анализом причин и возможных последствий. Строишь прогнозы на основе данных.',
    examples: [
      'Анализ показывает, что задержка на 3 дня на текущем этапе увеличит общее время проекта на 5-7 дней из-за последующих зависимых задач.',
      'За последние 2 недели производительность на фундаментных работах упала на 15% compared to плановым показателям.'
    ]
  }
};

// Конфигурация стилей ответа (только объем текста)
const RESPONSE_STYLES = {
  brief: {
    name: 'Кратко',
    description: 'Только ключевая информация, без деталей',
    instruction: 'Отвечай максимально кратко, но информативно. Фокусируйся только на самой сути вопроса. Не больше 3-4 предложений. Без вступлений и заключений. Только ключевые факты и выводы.',
    maxTokens: 500
  },
  balanced: {
    name: 'Сбалансировано',
    description: 'Оптимальное соотношение деталей и лаконичности',
    instruction: 'Давай развернутый, но сфокусированный ответ. Включи ключевые факты, анализ и практические рекомендации. 5-7 предложений с четкой структурой: проблема → анализ → рекомендация.',
    maxTokens: 1000
  },
  detailed: {
    name: 'Подробно',
    description: 'Детальный разбор с анализом и рекомендациями',
    instruction: 'Давай максимально подробный ответ с глубоким анализом. Включи: контекст, анализ причин, возможные последствия, альтернативные решения, конкретные рекомендации и прогнозы. 8-12 предложений с четкой структурой.',
    maxTokens: 2000
  }
};

/**
 * Хук для управления AI ассистентом с голосовым интерфейсом
 * Можно передать внешний state полевых заметок, чтобы ассистент видел те же данные,
 * что и основной вьювер. Если не передан, создаст собственное локальное состояние.
 */
const useAIAssistant = (externalFieldNotesState = null) => {
  // Получаем данные о полевых заметках (используем внешний state, если передан)
  const fieldNotesState = externalFieldNotesState || useFieldNotes();
  
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
  
  // Состояния для настроек ассистента
  const [selectedCharacter, setSelectedCharacter] = useState('professional');
  const [selectedResponseStyle, setSelectedResponseStyle] = useState('balanced');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatModeRef = useRef(chatMode);
  const fieldNotesRef = useRef([]);

  // Обновляем ref при изменении chatMode
  useEffect(() => {
    chatModeRef.current = chatMode;
    
  }, [chatMode]);

  // Держим актуальные полевые заметки в ref, чтобы избежать проблем со свежестью в колбэках
  useEffect(() => {
    fieldNotesRef.current = Array.isArray(fieldNotesState?.fieldNotes)
      ? fieldNotesState.fieldNotes
      : [];
  }, [fieldNotesState?.fieldNotes]);

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
  const generateScheduleContext = useCallback((overrideFieldNotes = null) => {
    const status = getProjectStatus();
    const insights = getScheduleInsights();
    const activePhases = MOCK_NETWORK_SCHEDULE.phases.filter(p => p.status === 'В процессе');
    const delayedPhases = MOCK_NETWORK_SCHEDULE.phases.filter(p => p.issues?.length > 0);
    
    // Получаем данные о технических решениях
    const technicalSolutions = getTechnicalSolutions();
    const technicalStatistics = getStatistics();
    
    // Получаем данные о полевых заметках
    const fieldNotes = Array.isArray(overrideFieldNotes)
      ? overrideFieldNotes
      : (fieldNotesRef.current || []);
    
    
    return {
      project: MOCK_NETWORK_SCHEDULE.project,
      currentStatus: status,
      insights,
      activePhases,
      delayedPhases,
      milestones: MOCK_NETWORK_SCHEDULE.milestones,
      criticalPath: MOCK_NETWORK_SCHEDULE.criticalPath,
      recentUpdates: MOCK_NETWORK_SCHEDULE.recentUpdates,
      technicalSolutions,
      technicalStatistics,
      fieldNotes
    };
  }, [fieldNotesState?.fieldNotes]);

  // Функция для обработки AI запроса
  const processAIRequest = useCallback(async (userMessage, overrideFieldNotes = null) => {
    setIsProcessing(true);
    
    // Искусственная задержка для имитации работы нейросети (1.5-3 секунды)
    const delay = Math.random() * 1500 + 1500; // от 1.5 до 3 секунд
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      
      const context = generateScheduleContext(overrideFieldNotes);
      
      
      // Получаем настройки характера и стиля
      const character = CHARACTERS[selectedCharacter];
      const responseStyle = RESPONSE_STYLES[selectedResponseStyle];
      
      // Формируем промпт для AI ассистента
      const systemPrompt = `Ты - ассистент прораба на строительном объекте "${context.project.name}". 

Твой характер и стиль общения:
${character.tone}

Стиль ответа:
${responseStyle.instruction}

Текущее состояние проекта:
- Общий прогресс: ${context.currentStatus.overallProgress}%
- Отставание: ${context.currentStatus.schedule.delay} дней
- Бюджет освоен на: ${context.currentStatus.budget.utilizationPercent}%
- Активные фазы: ${context.activePhases.map(p => p.name).join(', ')}
- Проблемные фазы: ${context.delayedPhases.map(p => p.name + ' (' + p.issues[0]?.description + ')').join('; ')}

Детальная информация по бюджету:
- Запланировано: ${context.currentStatus.budget.planned?.toLocaleString('ru-RU') || 'н/д'} ₽
- Потрачено: ${context.currentStatus.budget.spent?.toLocaleString('ru-RU') || 'н/д'} ₽
- Остаток: ${context.currentStatus.budget.remaining?.toLocaleString('ru-RU') || 'н/д'} ₽
- Освоение бюджета: ${context.currentStatus.budget.utilizationPercent}%

Критический путь: ${context.criticalPath.join(' → ')}

Последние обновления:
${context.recentUpdates.slice(0, 3).map(u => `${u.date}: ${u.message}`).join('\n')}

Технические решения:
- Всего решений: ${context.technicalStatistics.total}
- По статусам: Ожидают согласования - ${context.technicalStatistics.byStatus.pending || 0}, В процессе - ${context.technicalStatistics.byStatus.in_progress || 0}, Согласованные - ${context.technicalStatistics.byStatus.approved || 0}, Отклоненные - ${context.technicalStatistics.byStatus.rejected || 0}
- Общее влияние на бюджет: +${context.technicalStatistics.totalCostImpact?.toLocaleString('ru-RU') || 0} ₽
- Влияние на сроки: +${context.technicalStatistics.totalScheduleImpact || 0} дней

Активные технические решения:
${context.technicalSolutions.filter(ts => ts.status === 'pending' || ts.status === 'in_progress').slice(0, 5).map(ts => 
  `- ${ts.title} (${ts.status === 'pending' ? 'ожидает согласования' : 'в процессе'}): ${ts.description.substring(0, 100)}...`
).join('\n')}

Полевые заметки:
- Всего заметок на объекте: ${context.fieldNotes.length}
${context.fieldNotes.length > 0 ? `- Последние заметки:\n${context.fieldNotes.slice(-3).map(note => {
  const floorLabel = note.position?.floor ? `этаж ${note.position.floor}` : 'этаж н/д';
  const statusLabel = note.status?.name ? `, статус: ${note.status.name}` : '';
  const tagsLabel = (note.tags && note.tags.length) ? `, теги: ${note.tags.join(', ')}` : '';
  return `  • ${note.title || 'Заметка'} (${floorLabel}${statusLabel}${tagsLabel}): ${note.description?.substring(0, 80) || 'Без описания'}...`;
}).join('\n')}` : '- Заметок пока нет'}

Отвечай на русском языке, используй строительную терминологию. Будь конкретным и полезным.`;

      const requestPayload = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: responseStyle.maxTokens,
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
      
      
      // Fallback ответы на основе mock данных
      return generateMockResponse(userMessage, overrideFieldNotes);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCharacter, selectedResponseStyle, generateScheduleContext]);

  // Функция для генерации mock ответов (fallback)
  const generateMockResponse = (userMessage, overrideFieldNotes = null) => {
    const lowerMessage = userMessage.toLowerCase();
    const context = generateScheduleContext(overrideFieldNotes);
    
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
      const budget = context.currentStatus.budget;
      return `По деньгам такая картина: запланировано ${(budget.planned / 1000000).toFixed(0)} млн рублей, потратили ${budget.utilizationPercent}% (${(budget.spent / 1000000).toFixed(1)} млн). Остается ${(budget.remaining / 1000000).toFixed(1)} млн. Пока укладываемся в план, но надо следить чтобы не потратить лишнего - техрешения добавляют расходов.`;
    }
    
    if (lowerMessage.includes('технические') || lowerMessage.includes('решения') || lowerMessage.includes('тех')) {
      const pendingSolutions = context.technicalSolutions.filter(ts => ts.status === 'pending').length;
      const approvedSolutions = context.technicalSolutions.filter(ts => ts.status === 'approved').length;
      return `По техническим решениям ситуация такая: всего у нас ${context.technicalStatistics.total} решений. ${pendingSolutions} штук ждут согласования, ${approvedSolutions} уже утвердили. Общий удар по бюджету - плюс ${(context.technicalStatistics.totalCostImpact / 1000000).toFixed(1)} млн рублей. Плюс задержка на ${context.technicalStatistics.totalScheduleImpact} дней. Не радует, честно говоря.`;
    }
    
    if (lowerMessage.includes('рабочие') || lowerMessage.includes('люди')) {
      return `Рабочих хватает - 38 человек на объекте из 45 запланированных. Но что толку, если арматуры нет? Людей перебросил на другие участки, чтобы простоя не было. Хотя понимаю, что это временное решение.`;
    }
    
    if (lowerMessage.includes('заметки') || lowerMessage.includes('полевые')) {
      const notes = context.fieldNotes || [];
      const notesCount = notes.length;
      if (notesCount === 0) {
        return `Полевых заметок пока нет на объекте. А зря - они помогают отслеживать все нюансы работ. Советую начать их вести, особенно для проблемных участков и важных моментов строительства.`;
      }
      const lastNotes = notes.slice(-2).map(note => {
        const floorLabel = note.position?.floor ? `этаж ${note.position.floor}` : 'этаж н/д';
        const statusLabel = note.status?.name ? `, статус: ${note.status.name}` : '';
        const tagsLabel = (note.tags && note.tags.length) ? `, теги: ${note.tags.join(', ')}` : '';
        return `"${note.title || 'Без названия'}" (${floorLabel}${statusLabel}${tagsLabel})`;
      }).join(', ');
      return `У нас на объекте ${notesCount} полевых заметок. Последние: ${lastNotes}.`;
    }
    
    if (lowerMessage.includes('погода')) {
      return `Погода пока держится нормально, но скоро осень. Если с фундаментом не разберемся до холодов, то зимой работы встанут в копеечку. Бетон в мороз - это отдельная головная боль и лишние расходы.`;
    }
    
    return `Понял тебя. Вопрос серьезный, но давай по порядку разберем. Проект "${context.project.name}" сейчас в стадии фундаментных работ с небольшими проблемами. Если нужны конкретные детали - спрашивай, расскажу что знаю.`;
  };

  // Обработка голосового ввода
  const handleVoiceInput = useCallback(async (transcript) => {
    const currentChatMode = chatModeRef.current;
    
    setIsListening(false);
    
    if (!transcript.trim()) return;
    
    // Добавляем сообщение пользователя
    addMessage('user', transcript, { isVoice: true });
    
    // Обрабатываем запрос
    const currentNotesSnapshot = Array.isArray(fieldNotesRef.current)
      ? [...fieldNotesRef.current]
      : [];
    const aiResponse = await processAIRequest(transcript, currentNotesSnapshot);
    
    // Добавляем ответ AI
    const assistantMessage = addMessage('assistant', aiResponse);
    
    // Озвучиваем ответ в голосовом режиме
    if (currentChatMode === 'voice') {
      setIsSpeaking(true);
      speakText(aiResponse);
    } else {
      
    }
  }, [addMessage, processAIRequest, speakText, fieldNotesState?.fieldNotes]);

  // Обработка текстового ввода
  const handleTextInput = async (text) => {
    if (!text.trim()) return;
    
    // Добавляем сообщение пользователя
    addMessage('user', text);
    setInputValue('');
    
    // Показываем индикатор печати
    setIsTyping(true);
    
    // Обрабатываем запрос
    const currentNotesSnapshot = Array.isArray(fieldNotesRef.current)
      ? [...fieldNotesRef.current]
      : [];
    const aiResponse = await processAIRequest(text, currentNotesSnapshot);
    
    setIsTyping(false);
    
    // Добавляем ответ AI
    addMessage('assistant', aiResponse);
    
    // Озвучиваем ответ, если включен голосовой режим
    if (chatMode === 'voice') {
      setIsSpeaking(true);
      speakText(aiResponse);
    }
  };

  // Функция для озвучивания текста
  const speakText = useCallback((text) => {
    
    
    if (!('speechSynthesis' in window)) {
      
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
      
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      // Ошибка "interrupted" — нормальная ситуация при прерывании речи, не считаем её ошибкой
      if (event?.error === 'interrupted' || event?.name === 'interrupted') {
        
      } else {
        
      }
      setIsSpeaking(false);
    };
    
    
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
    
    // Настройки ассистента
    selectedCharacter,
    setSelectedCharacter,
    selectedResponseStyle,
    setSelectedResponseStyle,
    isSettingsOpen,
    setIsSettingsOpen,
    characters: CHARACTERS,
    responseStyles: RESPONSE_STYLES,
    
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

