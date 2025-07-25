import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import DateSelector from '../Viewer360/components/DateSelector/DateSelector';
import styles from './WorkerStats.module.css';

// Импортируем все 26 изображений из папки data/img
import face1 from '../../data/img/faceImg_1.jpg';
import face2 from '../../data/img/faceImg_2.jpg';
import face3 from '../../data/img/faceImg_3.jpg';
import face4 from '../../data/img/faceImg_4.jpg';
import face5 from '../../data/img/faceImg_5.jpg';
import face6 from '../../data/img/faceImg_6.jpg';
import face7 from '../../data/img/faceImg_7.jpg';
import face8 from '../../data/img/faceImg_8.jpg';
import face9 from '../../data/img/faceImg_9.jpg';
import face10 from '../../data/img/faceImg_10.jpg';
import face11 from '../../data/img/faceImg_11.jpg';
import face12 from '../../data/img/faceImg_12.jpg';
import face13 from '../../data/img/faceImg_13.jpg';
import face14 from '../../data/img/faceImg_14.jpg';
import face15 from '../../data/img/faceImg_15.jpg';
import face16 from '../../data/img/faceImg_16.jpg';
import face17 from '../../data/img/faceImg_17.jpg';
import face18 from '../../data/img/faceImg_18.jpg';
import face19 from '../../data/img/faceImg_19.jpg';
import face20 from '../../data/img/faceImg_20.jpg';
import face21 from '../../data/img/faceImg_21.jpg';
import face22 from '../../data/img/faceImg_22.jpg';
import face23 from '../../data/img/faceImg_23.jpg';
import face24 from '../../data/img/faceImg_24.jpg';
import face25 from '../../data/img/faceImg_25.jpg';
import face26 from '../../data/img/faceImg_26.jpg';

const generateEmptyHourlyData = () => {
    const hours = Array.from(
        { length: 24 },
        (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
    return hours.map((hour) => ({ hour, workers: 0 }));
};

// Данные только для некоторых дат (случайно выбранные)
const availableDates = [
    new Date(2025, 5, 5),  // 5 июня
    new Date(2025, 5, 12), // 12 июня  
    new Date(2025, 5, 20), // 20 июня
    new Date(2025, 5, 28), // 28 июня
    new Date(2025, 6, 8),  // 8 июля
    new Date(2025, 6, 24), // 24 июля
];

const dailyData = {};
const workerDataCache = {}; // Кеш для статичных данных работников

// Генерируем данные только для доступных дат (с максимумом 26 рабочих за весь день)
availableDates.forEach((date, index) => {
    const dateKey = date.toISOString().split('T')[0];
    
    // Определяем общее количество рабочих за день (максимум 26)
    const totalWorkersForDay = Math.min(26, 12 + Math.floor(Math.random() * 15));
    
    // Генерируем паттерн распределения по часам
    const hourlyData = generateEmptyHourlyData();
    let remainingWorkers = totalWorkersForDay;
    
    // Создаем более рандомный выбор рабочих часов
    const allPossibleHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const numWorkingHours = Math.min(8, 3 + Math.floor(Math.random() * 6)); // От 3 до 8 рабочих часов
    
    // Различные стратегии выбора часов для большего разнообразия
    let workingHours = [];
    const strategy = Math.floor(Math.random() * 6);
    
    switch (strategy) {
        case 0: // Утренний акцент
            workingHours = [7, 8, 9].filter(() => Math.random() > 0.3);
            const additionalMorning = allPossibleHours.filter(h => h >= 10 && h <= 12);
            workingHours.push(...additionalMorning.filter(() => Math.random() > 0.5));
            break;
            
        case 1: // Дневной акцент  
            workingHours = [12, 13, 14].filter(() => Math.random() > 0.2);
            const additionalDay = allPossibleHours.filter(h => h >= 10 && h <= 16);
            workingHours.push(...additionalDay.filter(() => Math.random() > 0.6));
            break;
            
        case 2: // Вечерний акцент
            workingHours = [16, 17, 18].filter(() => Math.random() > 0.3);
            const additionalEvening = allPossibleHours.filter(h => h >= 14 && h <= 19);
            workingHours.push(...additionalEvening.filter(() => Math.random() > 0.5));
            break;
            
        case 3: // Двухпиковый (утро + вечер)
            workingHours.push(...[8, 9].filter(() => Math.random() > 0.4));
            workingHours.push(...[17, 18].filter(() => Math.random() > 0.4));
            const bridgeHours = [12, 13, 14].filter(() => Math.random() > 0.7);
            workingHours.push(...bridgeHours);
            break;
            
        case 4: // Равномерное распределение
            workingHours = allPossibleHours.filter(() => Math.random() > 0.6);
            break;
            
        case 5: // Случайный выбор
            const shuffled = [...allPossibleHours].sort(() => Math.random() - 0.5);
            workingHours = shuffled.slice(0, numWorkingHours);
            break;
    }
    
    // Удаляем дубликаты и сортируем
    workingHours = [...new Set(workingHours)].sort((a, b) => a - b);
    
    // Если часов получилось слишком мало, добавляем случайные
    while (workingHours.length < Math.max(2, Math.min(numWorkingHours, totalWorkersForDay))) {
        const randomHour = allPossibleHours[Math.floor(Math.random() * allPossibleHours.length)];
        if (!workingHours.includes(randomHour)) {
            workingHours.push(randomHour);
        }
    }
    
    workingHours.sort((a, b) => a - b);
    
    // Распределяем рабочих по часам более рандомно
    const distribution = [];
    for (let i = 0; i < workingHours.length; i++) {
        if (i === workingHours.length - 1) {
            // Последний час получает всех оставшихся
            distribution.push(remainingWorkers);
        } else {
            // Случайное распределение с весами
            const maxForThisHour = Math.max(1, Math.floor(remainingWorkers * 0.7));
            const minForThisHour = 1;
            const workersForHour = Math.min(
                remainingWorkers - (workingHours.length - i - 1), // Оставляем минимум по 1 на каждый оставшийся час
                Math.max(minForThisHour, Math.floor(Math.random() * maxForThisHour) + 1)
            );
            distribution.push(workersForHour);
            remainingWorkers -= workersForHour;
        }
    }
    
    // Применяем распределение
    workingHours.forEach((hour, idx) => {
        hourlyData[hour].workers = distribution[idx];
    });
    
    dailyData[dateKey] = hourlyData;
});

// Массив всех 26 импортированных изображений
const faceImages = [
    face1, face2, face3, face4, face5, face6, face7, face8, face9, face10,
    face11, face12, face13, face14, face15, face16, face17, face18, face19, face20,
    face21, face22, face23, face24, face25, face26
];

// 26 уникальных имен
const uniqueWorkers = [
    { firstName: 'Александр', lastName: 'Иванов', position: 'Прораб' },
    { firstName: 'Михаил', lastName: 'Петров', position: 'Электрик' },
    { firstName: 'Дмитрий', lastName: 'Сидоров', position: 'Сантехник' },
    { firstName: 'Сергей', lastName: 'Козлов', position: 'Маляр' },
    { firstName: 'Андрей', lastName: 'Новиков', position: 'Монтажник' },
    { firstName: 'Владимир', lastName: 'Морозов', position: 'Сварщик' },
    { firstName: 'Алексей', lastName: 'Попов', position: 'Отделочник' },
    { firstName: 'Николай', lastName: 'Волков', position: 'Каменщик' },
    { firstName: 'Иван', lastName: 'Лебедев', position: 'Плиточник' },
    { firstName: 'Евгений', lastName: 'Соколов', position: 'Кровельщик' },
    { firstName: 'Роман', lastName: 'Михайлов', position: 'Стекольщик' },
    { firstName: 'Павел', lastName: 'Новиков', position: 'Штукатур' },
    { firstName: 'Денис', lastName: 'Федоров', position: 'Паркетчик' },
    { firstName: 'Антон', lastName: 'Морозов', position: 'Плотник' },
    { firstName: 'Игорь', lastName: 'Волков', position: 'Бетонщик' },
    { firstName: 'Олег', lastName: 'Алексеев', position: 'Арматурщик' },
    { firstName: 'Виктор', lastName: 'Лебедев', position: 'Крановщик' },
    { firstName: 'Константин', lastName: 'Григорьев', position: 'Изолировщик' },
    { firstName: 'Максим', lastName: 'Степанов', position: 'Облицовщик' },
    { firstName: 'Артем', lastName: 'Семенов', position: 'Мостовщик' },
    { firstName: 'Юрий', lastName: 'Павлов', position: 'Слесарь' },
    { firstName: 'Виталий', lastName: 'Захаров', position: 'Токарь' },
    { firstName: 'Станислав', lastName: 'Казаков', position: 'Фрезеровщик' },
    { firstName: 'Вячеслав', lastName: 'Ершов', position: 'Шлифовщик' },
    { firstName: 'Георгий', lastName: 'Демидов', position: 'Водитель' },
    { firstName: 'Анатолий', lastName: 'Громов', position: 'Механик' }
];

// Генерируем статичные данные работников один раз для каждой даты
const generateWorkerPhotos = (dateKey, hourlyData) => {
    // Если данные уже сгенерированы для этой даты, возвращаем их
    if (workerDataCache[dateKey]) {
        return workerDataCache[dateKey];
    }
    
    const workers = [];
    let workerIndex = 0;
    
    // Проходим по каждому часу и генерируем точное количество работников
    hourlyData.forEach((hourData) => {
        const hour = parseInt(hourData.hour.split(':')[0]);
        const workersCount = hourData.workers;
        
        // Генерируем работников для этого часа
        for (let i = 0; i < workersCount && workerIndex < 26; i++) {
            const worker = uniqueWorkers[workerIndex];
            
            // Генерируем фиксированную минуту на основе индекса работника (чтобы было статично)
            const minute = (workerIndex * 7) % 60; // Используем простую формулу для генерации статичных минут
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            workers.push({
                id: workerIndex + 1,
                src: faceImages[workerIndex],
                firstName: worker.firstName,
                lastName: worker.lastName,
                position: worker.position,
                time: time,
                hour: hour
            });
            
            workerIndex++;
        }
    });
    
    // Сортируем по времени (от раннего к позднему)
    const sortedWorkers = workers.sort((a, b) => a.time.localeCompare(b.time));
    
    // Кешируем результат
    workerDataCache[dateKey] = sortedWorkers;
    
    return sortedWorkers;
};

// Функция экспорта данных в CSV
const exportToCSV = (workers, selectedDate) => {
    if (!workers || workers.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    const headers = ['№', 'Имя', 'Фамилия', 'Должность', 'Время входа'];
    const csvContent = [
        headers.join(','),
        ...workers.map((worker, index) => [
            index + 1,
            worker.firstName,
            worker.lastName,
            worker.position,
            worker.time
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const formattedDate = selectedDate.toLocaleDateString('ru-RU').replace(/\./g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `workers_${formattedDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Кастомный компонент Tooltip для графика
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{`Время: ${label}`}</p>
                <p className={styles.tooltipValue}>
                    {`Рабочие: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

// Функция для получения количества рабочих для определенной даты
const getWorkersCountForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const data = dailyData[dateKey];
    if (!data) return 0;
    return data.reduce((acc, curr) => acc + curr.workers, 0);
};

// Модальное окно с информацией о работнике
const WorkerModal = ({ worker, isOpen, onClose }) => {
    if (!isOpen || !worker) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalClose} onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <div className={styles.modalHeader}>
                    <img 
                        src={worker.src} 
                        alt={`${worker.firstName} ${worker.lastName}`}
                        className={styles.modalPhoto}
                    />
                    <div className={styles.modalInfo}>
                        <h3 className={styles.modalName}>
                            {worker.firstName} {worker.lastName}
                        </h3>
                        <p className={styles.modalPosition}>{worker.position}</p>
                        <p className={styles.modalTime}>
                            <i className="fas fa-clock"></i>
                            Время входа: {worker.time}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkerStats = () => {
    const [selectedDate, setSelectedDate] = useState(availableDates[1]); // 17 января по умолчанию
    const [selectedWorker, setSelectedWorker] = useState(null); // Выбранный работник для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const selectedDateKey = selectedDate.toISOString().split('T')[0];
    const hourlyData = dailyData[selectedDateKey] || generateEmptyHourlyData();
    const totalWorkers = hourlyData.reduce((acc, curr) => acc + curr.workers, 0);
    const hasData = totalWorkers > 0;
    
    // Генерируем фотографии работников для текущей даты (данные кешируются)
    const workerPhotos = hasData ? generateWorkerPhotos(selectedDateKey, hourlyData) : [];

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    // Проверяем, есть ли данные для выбранной даты
    const isDateAvailable = (date) => {
        const dateKey = date.toISOString().split('T')[0];
        return dailyData.hasOwnProperty(dateKey);
    };

    const formatSelectedDate = (date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Обработчик клика на фото работника
    const handleWorkerClick = (worker) => {
        setSelectedWorker(worker);
        setIsModalOpen(true);
    };

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWorker(null);
    };

    // Обработчик экспорта данных
    const handleExport = () => {
        exportToCSV(workerPhotos, selectedDate);
    };

    return (
        <div className={styles.workerStats}>
            <div className={styles.header}>
                <h2 className={styles.title}>Контроль сотрудников</h2>
                <div className={styles.headerControls}>
                    <div className={styles.dateSelector}>
                        <DateSelector
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            availableDates={availableDates}
                            isDateAvailable={isDateAvailable}
                            getWorkersCount={getWorkersCountForDate}
                            tooltipType="workers"
                        />
                        <div className={styles.selectedDateInfo}>
                            <span className={styles.dateText}>{formatSelectedDate(selectedDate)}</span>
                            {!hasData && (
                                <span className={styles.noDataIndicator}>
                                    <i className="fas fa-info-circle"></i>
                                    Нет данных за эту дату
                                </span>
                            )}
                        </div>
                    </div>
                    {hasData && (
                        <button 
                            className={styles.exportButton}
                            onClick={handleExport}
                            title="Экспортировать данные в CSV"
                        >
                            <i className="fas fa-download"></i>
                            Экспорт CSV
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.chartSection}>
                <h3 className={styles.sectionTitle}>
                    Количество работников по часам
                </h3>
                {hasData ? (
                    <>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="workers" 
                                    fill="var(--primary-color)" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className={styles.statsInfo}>
                            <p className={styles.totalStats}>
                                Всего за день: <span className={styles.totalCount}>{totalWorkers}</span>{" "}
                                работников
                            </p>
                            <p className={styles.maxWorkersInfo}>
                                Максимум: <span className={styles.maxCount}>26</span> работников
                            </p>
                        </div>
                    </>
                ) : (
                    <div className={styles.noDataState}>
                        <i className="fas fa-chart-bar" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                        <p>Нет данных о посещениях за выбранную дату</p>
                    </div>
                )}
            </div>

            <div className={styles.photosSection}>
                <h3 className={styles.sectionTitle}>
                    Фото сотрудников
                </h3>
                {hasData && workerPhotos.length > 0 ? (
                    <div className={styles.photosGrid}>
                        {workerPhotos.map((worker) => (
                            <div 
                                key={worker.id} 
                                className={styles.workerCard}
                                onClick={() => handleWorkerClick(worker)}
                            >
                                <img
                                    src={worker.src}
                                    alt={`${worker.firstName} ${worker.lastName}`}
                                    className={styles.workerPhoto}
                                />
                                <div className={styles.workerTime}>
                                    {worker.time}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noDataState}>
                        <i className="fas fa-users" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                        <p>Нет фотографий сотрудников за выбранную дату</p>
                    </div>
                )}
            </div>

            {/* Модальное окно */}
            <WorkerModal 
                worker={selectedWorker}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default WorkerStats; 