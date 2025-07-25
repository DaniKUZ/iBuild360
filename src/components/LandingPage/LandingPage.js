import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestModal from './components/RequestModal';
import styles from './LandingPage.module.css';

const LandingPage = ({ onEnterApp }) => {
  const navigate = useNavigate();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('demo'); // 'demo' or 'expert'

  const handleRequestClick = (type = 'demo') => {
    setRequestType(type);
    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
  };

  const handleSubmitRequest = (requestData) => {
    console.log('Данные заявки:', requestData);
    // Здесь будет отправка данных на сервер
  };

  const handlePilotProjectClick = () => {
    navigate('/projects');
  };

  return (
    <div className={styles.landingPage}>
      {/* Hero секция */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Napoleon Build: Цифровой контроль строительства с искусственным интеллектом
            </h1>
            <p className={styles.heroDescription}>
              Фиксируйте. Анализируйте. Стройте с уверенностью. Полностью российская платформа для управления строительством.
            </p>
            <div className={styles.heroActions}>
              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                onClick={() => handleRequestClick('demo')}
              >
                Получить демо
              </button>
              <button 
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnLarge}`}
                onClick={() => handleRequestClick('expert')}
              >
                Поговорить с экспертом
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Почему выбирают Napoleon Build */}
      <section className={styles.whyChooseSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Почему строительные компании выбирают Napoleon Build</h2>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔍</div>
              <h3>Прозрачность</h3>
              <p>Каждый этап строительства документируется в фотографиях и автоматически привязывается к плану объекта, обеспечивая полный визуальный контроль.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Скорость</h3>
              <p>Формирование полных отчетов о ходе строительства занимает минуты вместо часов или дней. Время от съемки до готового отчета — всего 15 минут.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>Контроль</h3>
              <p>Все зоны объекта, все даты проведения работ и все подрядчики находятся под постоянным наблюдением. Ничто не ускользнет от вашего внимания.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3>Безопасность</h3>
              <p>Все серверы расположены в России, платформа полностью соответствует требованиям 152-ФЗ о персональных данных. Ваши данные под надежной защитой.</p>
            </div>
          </div>

          <div className={styles.sectionDescription}>
            <p>Napoleon Build помогает подрядчикам, заказчикам и девелоперам фиксировать каждый этап работ, выявлять проблемы до официальных проверок и сдавать объекты без лишних нервов и проблем.</p>
          </div>
        </div>
      </section>

      {/* ИИ секция */}
      <section className={styles.aiSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Искусственный интеллект, созданный специально для стройки</h2>
          </div>
          
          <div className={styles.aiContent}>
            <div className={styles.aiDescription}>
              <h3>Не ради хайпа, а ради дела</h3>
              <p>Наш ИИ обучен на тысячах фотографий с реальных объектов по всей России. Он различает стадии работ, замечает отклонения от графика и точно определяет зону, где был сделан снимок.</p>
              
              <p>Платформа поддерживает русский язык и строительную терминологию — ИИ понимает, что такое ППР, гипсокартон, маяки и даже выражение "ну там почти доделали".</p>
              
              <p>Вам не нужно быть "айтишником", чтобы пользоваться нашим ИИ. Он просто помогает делать вашу работу лучше, быстрее и спокойнее.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-функции */}
      <section className={styles.aiFunctionsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>AI-функции платформы Napoleon Build</h2>
          </div>
          
          <div className={styles.functionsGrid}>
            <div className={styles.functionCard}>
              <h3>Автоматическое сравнение "до/после"</h3>
              <p>Система создает автоматические таймлайны по каждой зоне объекта, позволяя наглядно видеть, как менялся объект день за днём на протяжении всего периода строительства.</p>
            </div>
            
            <div className={styles.functionCard}>
              <h3>Генерация отчетов с пояснениями</h3>
              <p>ИИ не только анализирует фотоматериалы, но и пишет понятные пояснения к прогрессу, замечает отставания и предлагает грамотный поясняющий текст для отчетов.</p>
            </div>
            
            <div className={styles.functionCard}>
              <h3>Анализ тысяч фотографий</h3>
              <p>Система анализирует тысячи фотографий за считанные секунды и находит отклонения от проектной модели или плана, что было бы невозможно сделать вручную за разумное время.</p>
            </div>
            
            <div className={styles.functionCard}>
              <h3>Интеграция в рабочий процесс</h3>
              <p>ИИ встроен прямо в рабочий процесс — вы просто снимаете фотографии, а система автоматически анализирует их и распределяет по нужным категориям и зонам.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Контроль прогресса */}
      <section className={styles.progressTrackingSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Контроль прогресса и трекинг отставаний с помощью AI</h2>
            <p className={styles.sectionSubtitle}>
              Мы разработали уникальный AI-модуль для визуального трекинга хода строительства. Он не просто распознаёт фотографии — он оценивает реальный прогресс:
            </p>
          </div>
          
          <div className={styles.progressFeatures}>
            <div className={styles.progressFeature}>
              <h3>AI-трекер прогресса по зонам</h3>
              <p>Система автоматически отмечает, какие зоны завершены, находятся в работе или просрочены, предоставляя полную картину состояния объекта.</p>
            </div>
            
            <div className={styles.progressFeature}>
              <h3>Детекция отставаний</h3>
              <p>Анализируя фотографии по времени и план-графику, ИИ выявляет участки, где нет движения, что позволяет своевременно реагировать на проблемы.</p>
            </div>
            
            <div className={styles.progressFeature}>
              <h3>Динамика на графиках и оповещения</h3>
              <p>Вы видите, как двигается стройка, где провалы, где перегруз. Можно настроить алерты на отклонения от графика, чтобы оперативно получать информацию о проблемах.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Решения для участников */}
      <section className={styles.solutionsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Решения для всех участников строительного процесса</h2>
          </div>
          
          <div className={styles.solutionsGrid}>
            <div className={styles.solutionCard}>
              <h3>Генподрядчики</h3>
              <ul>
                <li>Цифровой контроль субподрядчиков в режиме реального времени</li>
                <li>Значительное сокращение времени на актирование работ</li>
                <li>Полная документация без необходимости постоянных выездов на объект</li>
                <li>Быстрое разрешение спорных ситуаций с помощью фотодоказательств</li>
              </ul>
            </div>
            
            <div className={styles.solutionCard}>
              <h3>Заказчики / Девелоперы</h3>
              <ul>
                <li>Прозрачный прогресс по каждому помещению и участку объекта</li>
                <li>Существенная экономия на авторском надзоре и инспекциях</li>
                <li>Фотодоказательства для страховых компаний и инвесторов</li>
                <li>Полный контроль над проектом без необходимости постоянного присутствия</li>
              </ul>
            </div>
            
            <div className={styles.solutionCard}>
              <h3>Субподрядчики</h3>
              <ul>
                <li>Надежное подтверждение факта выполнения всех работ</li>
                <li>Значительно меньше споров при приёмке выполненных работ</li>
                <li>Быстрая сдача объектов и своевременная оплата</li>
                <li>Защита от необоснованных претензий со стороны генподрядчика</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Результаты */}
      <section className={styles.resultsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Впечатляющие результаты Napoleon Build</h2>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>1M+ м²</div>
              <div className={styles.statLabel}>Площадь объектов</div>
              <div className={styles.statDescription}>Общая площадь задокументированных строительных объектов на нашей платформе</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>500K+</div>
              <div className={styles.statLabel}>Фотофиксаций</div>
              <div className={styles.statDescription}>Количество фотографий, обработанных и проанализированных нашим ИИ</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>15 мин</div>
              <div className={styles.statLabel}>Скорость отчетов</div>
              <div className={styles.statDescription}>Среднее время от момента съёмки до получения готового отчёта</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-80%</div>
              <div className={styles.statLabel}>Меньше ручной работы</div>
              <div className={styles.statDescription}>Сокращение объема ручной работы по документированию и контролю</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-70%</div>
              <div className={styles.statLabel}>Меньше выездов</div>
              <div className={styles.statDescription}>Сокращение количества выездов на объект для контроля работ</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-60%</div>
              <div className={styles.statLabel}>Экономия времени</div>
              <div className={styles.statDescription}>Экономия времени на координации и управлении процессами на объекте</div>
            </div>
          </div>
        </div>
      </section>

      {/* Как работает */}
      <section className={styles.howItWorksSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Как работает Napoleon Build</h2>
          </div>
          
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3>Снимаете фото</h3>
              <p>Используйте обычный смартфон или специальную 360° камеру для фиксации хода строительных работ. Система работает с любыми фотографиями.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3>ИИ анализирует</h3>
              <p>Искусственный интеллект автоматически анализирует полученные фотографии и распознаёт стадии выполнения работ в каждой зоне объекта.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3>Фото на плане</h3>
              <p>Все фотографии автоматически привязываются к соответствующим зонам на плане объекта, формируя наглядную картину прогресса.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3>Отчеты и таймлайны</h3>
              <p>Система создает подробные отчеты о ходе работ и формирует таймлайны по каждой зоне, показывая прогресс во времени.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>5</div>
              <h3>Онлайн-доступ</h3>
              <p>Все данные доступны онлайн через защищенный интерфейс. Серверы находятся в России, обеспечивая высокую скорость доступа и безопасность.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Проблемы */}
      <section className={styles.problemsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Какие проблемы решает Napoleon Build</h2>
          </div>
          
          <div className={styles.problemsGrid}>
            <div className={styles.problemCard}>
              <h3>Споры с заказчиками и подрядчиками</h3>
              <p>Полная фотодокументация всех этапов работ позволяет избежать разногласий и предоставляет неоспоримые доказательства выполненных работ.</p>
            </div>
            
            <div className={styles.problemCard}>
              <h3>Переделки без причины</h3>
              <p>Благодаря фотофиксации каждого этапа работ, значительно снижается риск необоснованных требований о переделке уже выполненных работ.</p>
            </div>
            
            <div className={styles.problemCard}>
              <h3>Потерянные фотоматериалы</h3>
              <p>Больше никаких потерянных фотографий "на телефоне" — все материалы надежно хранятся в системе и доступны в любой момент.</p>
            </div>
            
            <div className={styles.problemCard}>
              <h3>Пустые командировки</h3>
              <p>Сократите количество выездов на объект благодаря возможности удаленного контроля за ходом работ через детальные фотоотчеты.</p>
            </div>
            
            <div className={styles.problemCard}>
              <h3>Бюрократия и бумажная волокита</h3>
              <p>Значительно упростите процесс оформления актов и документации по скрытым работам с помощью автоматического формирования отчетов.</p>
            </div>
            
            <div className={styles.problemCard}>
              <h3>Отставание от графика</h3>
              <p>Система автоматически выявляет отставания от графика и отправляет уведомления, позволяя оперативно реагировать на проблемы.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ключевые функции */}
      <section className={styles.keyFeaturesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ключевые функции платформы</h2>
          </div>
          
          <div className={styles.keyFeaturesGrid}>
            <div className={styles.keyFeatureCard}>
              <h3>Умный поиск и сравнение</h3>
              <p>Мгновенный поиск и сравнение фотографий по дате, зоне и другим параметрам. Найдите нужные материалы за считанные секунды.</p>
            </div>
            
            <div className={styles.keyFeatureCard}>
              <h3>История прогресса</h3>
              <p>Детальная история прогресса по каждому помещению с возможностью просмотра всех этапов строительства в хронологическом порядке.</p>
            </div>
            
            <div className={styles.keyFeatureCard}>
              <h3>Контроль темпа работ</h3>
              <p>Постоянный мониторинг темпа выполнения работ с автоматическим выявлением отставаний от графика и проблемных зон.</p>
            </div>
            
            <div className={styles.keyFeatureCard}>
              <h3>Гибкий экспорт данных</h3>
              <p>Выгрузка отчетов в формате PDF, данных в Excel, архивов фотографий и других материалов для использования в любых целях.</p>
            </div>
            
            <div className={styles.keyFeatureCard}>
              <h3>Гибкое управление доступом</h3>
              <p>Настройка различных уровней доступа для разных пользователей — от полного контроля до просмотра конкретных зон.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Безопасность */}
      <section className={styles.securitySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Безопасность и соответствие законодательству</h2>
            <h3 className={styles.sectionSubheading}>Полное соответствие российскому законодательству</h3>
            <p className={styles.sectionSubtitle}>
              Napoleon Build обеспечивает максимальный уровень безопасности ваших данных и полное соответствие требованиям российского законодательства:
            </p>
          </div>
          
          <div className={styles.securityFeatures}>
            <ul className={styles.securityList}>
              <li>Все серверы расположены на территории Российской Федерации, что гарантирует полное соответствие требованиям о локализации данных</li>
              <li>Многоуровневая система шифрования данных и гибкое разграничение прав доступа</li>
              <li>Полное соответствие требованиям Федерального закона №152-ФЗ "О персональных данных"</li>
              <li>Регулярное резервное копирование данных и защита от несанкционированного доступа</li>
              <li>Выделенные серверы с повышенным уровнем защиты для особо важных объектов</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          </div>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqCard}>
              <h3>Можно ли использовать без интернета?</h3>
              <p>Да, система поддерживает работу в офлайн-режиме. Все фотографии, сделанные без доступа к интернету, будут автоматически синхронизированы с сервером, как только соединение будет восстановлено.</p>
            </div>
            
            <div className={styles.faqCard}>
              <h3>Можно ли вести несколько объектов?</h3>
              <p>Да, платформа позволяет вести неограниченное количество объектов. У вас будет централизованный доступ ко всем стройкам через единый интерфейс с возможностью быстрого переключения между ними.</p>
            </div>
            
            <div className={styles.faqCard}>
              <h3>Как быстро можно начать?</h3>
              <p>Мы запускаем пилотный проект за 1 день, а обучение вашей команды работе с системой занимает всего 30 минут. Платформа интуитивно понятна и не требует специальных технических знаний.</p>
            </div>
            
            <div className={styles.faqCard}>
              <h3>Насколько это безопасно?</h3>
              <p>Ваши данные хранятся на российских серверах с использованием современных технологий шифрования. Вся работа системы полностью соответствует требованиям российского законодательства о защите данных.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Готовы начать?</h2>
            <p className={styles.ctaDescription}>
              Попробуйте Napoleon Build уже сегодня и убедитесь в эффективности нашего решения
            </p>
            <div className={styles.ctaActions}>
              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                onClick={() => handleRequestClick('demo')}
              >
                Запросить демонстрацию
              </button>
              <button 
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnLarge}`}
                onClick={handlePilotProjectClick}
              >
                Запустить пилотный проект
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Request Modal */}
      <RequestModal 
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        onSubmit={handleSubmitRequest}
        requestType={requestType}
      />
    </div>
  );
};

export default LandingPage; 