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

// Импортируем изображения напрямую
import face1 from '../../assets/images/faceImg_1.jpg';
import face2 from '../../assets/images/faceImg_2.jpg';
import face3 from '../../assets/images/faceImg_3.jpg';
import face4 from '../../assets/images/faceImg_4.jpg';
import face5 from '../../assets/images/faceImg_5.jpg';
import face6 from '../../assets/images/faceImg_6.jpg';
import face7 from '../../assets/images/faceImg_7.jpg';
import face8 from '../../assets/images/faceImg_8.jpg';

const generateEmptyHourlyData = () => {
    const hours = Array.from(
        { length: 24 },
        (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
    return hours.map((hour) => ({ hour, workers: 0 }));
};

// Данные только для некоторых дат (случайно выбранные)
const availableDates = [
    new Date(2025, 0, 15), // 15 января
    new Date(2025, 0, 17), // 17 января  
    new Date(2025, 0, 20), // 20 января
    new Date(2025, 0, 22), // 22 января
    new Date(2025, 0, 25), // 25 января
    new Date(2025, 0, 28), // 28 января
    new Date(2025, 1, 3),  // 3 февраля
    new Date(2025, 1, 7),  // 7 февраля
    new Date(2025, 1, 12), // 12 февраля
    new Date(2025, 1, 18), // 18 февраля
];

const dailyData = {};

// Генерируем данные только для доступных дат
availableDates.forEach((date, index) => {
    const dateKey = date.toISOString().split('T')[0];
    
    // Различные паттерны активности для разнообразия
    switch (index % 4) {
        case 0: // Утренняя активность
            dailyData[dateKey] = generateEmptyHourlyData().map((entry, idx) => {
                if (idx >= 7 && idx <= 9) return { ...entry, workers: 15 + Math.floor(Math.random() * 10) };
                if (idx >= 17 && idx <= 18) return { ...entry, workers: 8 + Math.floor(Math.random() * 5) };
                return entry;
            });
            break;
        case 1: // Равномерная активность в течение дня
            dailyData[dateKey] = generateEmptyHourlyData().map((entry, idx) => {
                if (idx >= 8 && idx <= 17) return { ...entry, workers: 5 + Math.floor(Math.random() * 15) };
                return entry;
            });
            break;
        case 2: // Пиковая активность в обед
            dailyData[dateKey] = generateEmptyHourlyData().map((entry, idx) => {
                if (idx >= 8 && idx <= 10) return { ...entry, workers: 10 + Math.floor(Math.random() * 8) };
                if (idx >= 12 && idx <= 14) return { ...entry, workers: 20 + Math.floor(Math.random() * 12) };
                if (idx >= 16 && idx <= 17) return { ...entry, workers: 7 + Math.floor(Math.random() * 6) };
                return entry;
            });
            break;
        case 3: // Вечерняя активность
            dailyData[dateKey] = generateEmptyHourlyData().map((entry, idx) => {
                if (idx >= 14 && idx <= 19) return { ...entry, workers: 8 + Math.floor(Math.random() * 18) };
                return entry;
            });
            break;
    }
});

// Массив импортированных изображений
const faceImages = [face1, face2, face3, face4, face5, face6, face7, face8];

// Массив имен, фамилий и должностей для разнообразия
const firstNames = ['Александр', 'Михаил', 'Дмитрий', 'Сергей', 'Андрей', 'Владимир', 'Алексей', 'Николай'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Попов', 'Волков'];
const positions = ['Строитель', 'Электрик', 'Сантехник', 'Маляр', 'Прораб', 'Монтажник', 'Сварщик', 'Отделочник'];

// Используем реальные фотографии лиц
const generateWorkerPhotos = (dateKey, hourlyData) => {
    const workers = [];
    let workerId = 1;
    
    // Проходим по каждому часу и генерируем точное количество работников
    hourlyData.forEach((hourData) => {
        const hour = parseInt(hourData.hour.split(':')[0]);
        const workersCount = hourData.workers;
        
        // Генерируем работников для этого часа
        for (let i = 0; i < workersCount; i++) {
            const randomFaceIndex = Math.floor(Math.random() * 8);
            const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            
            // Генерируем случайную минуту в пределах этого часа
            const randomMinute = Math.floor(Math.random() * 60);
            const time = `${hour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
            
            workers.push({
                id: workerId++,
                src: faceImages[randomFaceIndex],
                firstName: randomFirstName,
                lastName: randomLastName,
                position: randomPosition,
                time: time,
                hour: hour
            });
        }
    });
    
    // Сортируем по времени (от раннего к позднему)
    return workers.sort((a, b) => a.time.localeCompare(b.time));
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
    
    // Генерируем фотографии работников для текущей даты
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

    return (
        <div className={styles.workerStats}>
            <div className={styles.header}>
                <h2 className={styles.title}>Контроль сотрудников</h2>
                <div className={styles.dateSelector}>
                    <DateSelector
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        availableDates={availableDates}
                        isDateAvailable={isDateAvailable}
                        getWorkersCount={getWorkersCountForDate}
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
                        <p className={styles.totalStats}>
                            Всего за день: <span className={styles.totalCount}>{totalWorkers}</span>{" "}
                            работников
                        </p>
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