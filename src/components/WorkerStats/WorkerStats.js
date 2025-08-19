import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell
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


const MAX_PER_HOUR = 26;
const generateEmptyHourlyData = () => {
    const hours = Array.from(
        { length: 24 },
        (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
    return hours.map((hour) => ({ hour, arrival: 0, departure: 0 }));
};

// Генерируем данные для всех дней в текущем году
const generateAllDatesData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 1); // 1 января текущего года
    const endDate = new Date(currentYear, 11, 31); // 31 декабря текущего года
    
    const dailyData = {};
    const workerDataCache = {};
    
    // Генерируем данные для каждого дня
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        
        // Пропускаем выходные (суббота и воскресенье) - генерируем данные только для рабочих дней
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // 0 = воскресенье, 6 = суббота
        
        // Определяем общее количество рабочих за день (максимум 26)
        const totalWorkersForDay = Math.min(26, 8 + Math.floor(Math.random() * 19)); // От 8 до 26
        
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

        // Применяем распределение прихода
        workingHours.forEach((hour, idx) => {
            hourlyData[hour].arrival = distribution[idx];
        });

        // Генерируем данные ухода (через 6-10 часов после прихода)
        const departureHours = [];
        const departureDistribution = [];

        workingHours.forEach((arrivalHour, idx) => {
            const workDuration = 6 + Math.floor(Math.random() * 5); // 6-10 часов работы
            const departureHour = Math.min(23, arrivalHour + workDuration);
            departureHours.push(departureHour);
            departureDistribution.push(distribution[idx]);
        });

        // Применяем распределение ухода
        departureHours.forEach((hour, idx) => {
            if (hour < 24) {
                hourlyData[hour].departure += departureDistribution[idx];
            }
        });

        dailyData[dateKey] = hourlyData;
    }
    
    return { dailyData, workerDataCache };
};

// Генерируем данные для всех дней
const { dailyData, workerDataCache } = generateAllDatesData();

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

    // Сначала создаем всех работников с временем прихода
    hourlyData.forEach((hourData) => {
        const hour = parseInt(hourData.hour.split(':')[0]);
        const workersCount = hourData.arrival;

        // Генерируем работников для этого часа
        for (let i = 0; i < workersCount && workerIndex < 26; i++) {
            const worker = uniqueWorkers[workerIndex];

            // Генерируем фиксированную минуту на основе индекса работника (чтобы было статично)
            const minute = (workerIndex * 7) % 60;
            const arrivalTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            workers.push({
                id: workerIndex + 1,
                src: faceImages[workerIndex],
                firstName: worker.firstName,
                lastName: worker.lastName,
                position: worker.position,
                arrivalTime: arrivalTime,
                departureTime: null, // Установим позже
                hour: hour,
                workerIndex: workerIndex
            });

            workerIndex++;
        }
    });

    // Теперь назначаем время ухода в соответствии с данными графика
    let assignedWorkers = [...workers];
    let departureWorkerIndex = 0;

    hourlyData.forEach((hourData) => {
        const hour = parseInt(hourData.hour.split(':')[0]);
        const departureCount = hourData.departure;

        // Назначаем время ухода работникам в этот час
        for (let i = 0; i < departureCount && departureWorkerIndex < assignedWorkers.length; i++) {
            if (assignedWorkers[departureWorkerIndex]) {
                const baseMinute = (assignedWorkers[departureWorkerIndex].workerIndex * 7) % 60;
                const departureMinute = (baseMinute + 30 + (assignedWorkers[departureWorkerIndex].workerIndex * 5) % 30) % 60;
                const departureTime = `${hour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;

                assignedWorkers[departureWorkerIndex].departureTime = departureTime;
                departureWorkerIndex++;
            }
        }
    });

    // Удаляем временное поле workerIndex
    const finalWorkers = assignedWorkers.map(worker => {
        const { workerIndex, ...cleanWorker } = worker;
        return cleanWorker;
    });

    // Сортируем по времени прихода (от раннего к позднему)
    const sortedWorkers = finalWorkers.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));

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

    const headers = ['№', 'Имя', 'Фамилия', 'Должность', 'Время входа', 'Время ухода'];
    const csvContent = [
        headers.join(','),
        ...workers.map((worker, index) => [
            index + 1,
            worker.firstName,
            worker.lastName,
            worker.position,
            worker.arrivalTime,
            worker.departureTime
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
const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
        const typeLabel = type === 'departure' ? 'ушло' : 'пришло';
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{`Время: ${label}`}</p>
                <p className={styles.tooltipValue}>
                    {`Работников ${typeLabel}: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

const CombinedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p.value]));
        const arrived = byKey.arrival ?? 0;
        const left = byKey.departure ?? 0;
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{`Время: ${label}`}</p>
                <p className={styles.tooltipValue}>{`Пришло: ${arrived}`}</p>
                <p className={styles.tooltipValue}>{`Ушло: ${left}`}</p>
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
    return data.reduce((acc, curr) => acc + curr.arrival, 0);
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
                        <div className={styles.modalTimes}>
                            <p className={styles.modalTime}>
                                <i className="fas fa-sign-in-alt"></i>
                                Время входа: {worker.arrivalTime}
                            </p>
                            <p className={styles.modalTime}>
                                <i className="fas fa-sign-out-alt"></i>
                                Время ухода: {worker.departureTime}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkerStats = () => {
    // Автоматически устанавливаем дату на сегодняшнюю или вчерашнюю (если сегодня выходной)
    const getInitialDate = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Если сегодня выходной, берем вчерашний день
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        }
        
        return today;
    };

    // Функция для проверки, является ли дата выходной
    const isWeekend = (date) => {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 = воскресенье, 6 = суббота
    };

    // Функция для проверки, является ли дата будущей
    const isFutureDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate > today;
    };

    // Функция для получения следующей доступной даты
    const getNextAvailableDate = (currentDate, direction) => {
        // Получаем доступные даты для этой функции
        const sortedDates = Object.keys(dailyData)
            .map(dateStr => new Date(dateStr))
            .filter(date => !isFutureDate(date))
            .sort((a, b) => a - b);
            
        if (sortedDates.length === 0) return null;
        
        const currentIndex = sortedDates.findIndex(date => 
            date.toDateString() === currentDate.toDateString()
        );
        
        if (currentIndex === -1) return sortedDates[0];
        
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < sortedDates.length) {
            return sortedDates[nextIndex];
        }
        
        return null;
    };

    const [selectedDate, setSelectedDate] = useState(getInitialDate());
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('hourly'); // 'hourly', 'daily', 'weekly', 'monthly'

    const selectedDateKey = selectedDate.toISOString().split('T')[0];
    const hourlyData = dailyData[selectedDateKey] || generateEmptyHourlyData();
    const totalWorkers = hourlyData.reduce((acc, curr) => acc + curr.arrival, 0);
    const hasData = totalWorkers > 0;
    const filteredData = hourlyData.filter(d => d.arrival > 0 || d.departure > 0);

    // Генерируем фотографии работников для текущей даты (данные кешируются)
    const workerPhotos = hasData ? generateWorkerPhotos(selectedDateKey, hourlyData) : [];

    // Часы, где есть движение (появление/уход)
    const activeHours = hourlyData
      .filter(d => (d.arrival ?? 0) > 0 || (d.departure ?? 0) > 0)
      .map(d => d.hour);

    // Выбранный час
    const [selectedHour, setSelectedHour] = useState(null);

    // При смене даты выбираем первый активный час
    useEffect(() => {
      setSelectedHour(activeHours[0] || null);
    }, [selectedDateKey]);

    const hourToInt = (hhmm) => parseInt(hhmm.split(':')[0], 10);

    // Подмножества работников за выбранный час
    const arrivalsAtHour = selectedHour
      ? workerPhotos.filter(w => hourToInt(w.arrivalTime) === hourToInt(selectedHour))
      : [];

    const departuresAtHour = selectedHour
      ? workerPhotos.filter(w => w.departureTime && hourToInt(w.departureTime) === hourToInt(selectedHour))
      : [];

    // Сколько было на объекте к началу часа (кумулятивно до selectedHour)
    const prevOnSite = selectedHour
      ? hourlyData.reduce((acc, h) => {
          const hInt = hourToInt(h.hour);
          return hInt < hourToInt(selectedHour)
            ? acc + (h.arrival || 0) - (h.departure || 0)
            : acc;
        }, 0)
      : 0;

    // «Неизменённые» — были и не ушли в этот час
    const unchangedAtHour = Math.max(prevOnSite - departuresAtHour.length, 0);

    // На объекте после часа (для подписи рядом с кольцом)
    const onSiteAfterHour = Math.max(prevOnSite - departuresAtHour.length + arrivalsAtHour.length, 0);

    // Данные для кольца
    const ringDataRaw = [
      { name: 'Пришли',     value: arrivalsAtHour.length,  color: '#22c55e' },
      { name: 'Ушли',       value: departuresAtHour.length, color: '#ef4444' },
      { name: 'На объекте', value: unchangedAtHour,         color: '#f59e0b' },
    ];
    const ringData = ringDataRaw.filter(s => s.value > 0);
    const isSingle = ringData.length === 1;

    // Функции для генерации данных за неделю и месяц
    const generateWeeklyData = (startDate) => {
        const weekData = [];
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Понедельник
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = dailyData[dateKey];
            
            if (dayData) {
                const totalWorkers = dayData.reduce((acc, curr) => acc + curr.arrival, 0);
                const totalArrivals = dayData.reduce((acc, curr) => acc + (curr.arrival || 0), 0);
                const totalDepartures = dayData.reduce((acc, curr) => acc + (curr.departure || 0), 0);
                const activeHoursCount = dayData.filter(d => (d.arrival || 0) > 0 || (d.departure || 0) > 0).length;
                
                weekData.push({
                    date: currentDate,
                    dateKey: dateKey,
                    dayName: currentDate.toLocaleDateString('ru-RU', { weekday: 'short' }),
                    totalWorkers,
                    totalArrivals,
                    totalDepartures,
                    activeHoursCount,
                    isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
                });
            } else {
                weekData.push({
                    date: currentDate,
                    dateKey: dateKey,
                    dayName: currentDate.toLocaleDateString('ru-RU', { weekday: 'short' }),
                    totalWorkers: 0,
                    totalArrivals: 0,
                    totalDepartures: 0,
                    activeHoursCount: 0,
                    isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
                });
            }
        }
        
        return weekData;
    };

    const generateMonthlyData = (year, month) => {
        const monthData = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = dailyData[dateKey];
            
            if (dayData) {
                const totalWorkers = dayData.reduce((acc, curr) => acc + curr.arrival, 0);
                const totalArrivals = dayData.reduce((acc, curr) => acc + (curr.arrival || 0), 0);
                const totalDepartures = dayData.reduce((acc, curr) => acc + (curr.departure || 0), 0);
                const activeHoursCount = dayData.filter(d => (d.arrival || 0) > 0 || (d.departure || 0) > 0).length;
                
                monthData.push({
                    date: currentDate,
                    dateKey: dateKey,
                    day: day,
                    totalWorkers,
                    totalArrivals,
                    totalDepartures,
                    activeHoursCount,
                    isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
                });
            } else {
                monthData.push({
                    date: currentDate,
                    dateKey: dateKey,
                    day: day,
                    totalWorkers: 0,
                    totalArrivals: 0,
                    totalDepartures: 0,
                    activeHoursCount: 0,
                    isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
                });
            }
        }
        
        return monthData;
    };

    // Генерируем данные для текущего режима
    const getCurrentPeriodData = () => {
        switch (viewMode) {
            case 'weekly':
                return generateWeeklyData(selectedDate);
            case 'monthly':
                return generateMonthlyData(selectedDate.getFullYear(), selectedDate.getMonth());
            default:
                return null;
        }
    };

    const currentPeriodData = getCurrentPeriodData();

    // Дополнительная статистика для недели/месяца
    const getPeriodStats = () => {
        if (!currentPeriodData) return null;
        
        const workingDays = currentPeriodData.filter(d => !d.isWeekend && d.totalWorkers > 0);
        const totalWorkers = currentPeriodData.reduce((acc, d) => acc + d.totalWorkers, 0);
        const totalArrivals = currentPeriodData.reduce((acc, d) => acc + d.totalArrivals, 0);
        const totalDepartures = currentPeriodData.reduce((acc, d) => acc + d.totalDepartures, 0);
        const avgWorkersPerDay = workingDays.length > 0 ? Math.round(totalWorkers / workingDays.length) : 0;
        const maxWorkersInDay = Math.max(...currentPeriodData.map(d => d.totalWorkers));
        const minWorkersInDay = Math.min(...currentPeriodData.filter(d => d.totalWorkers > 0).map(d => d.totalWorkers));
        
        return {
            totalWorkers,
            totalArrivals,
            totalDepartures,
            avgWorkersPerDay,
            maxWorkersInDay,
            minWorkersInDay,
            workingDaysCount: workingDays.length,
            totalDays: currentPeriodData.length
        };
    };

    const periodStats = getPeriodStats();

    // Получаем все доступные даты (исключаем будущие)
    const availableDates = Object.keys(dailyData)
        .map(dateStr => new Date(dateStr))
        .filter(date => !isFutureDate(date))
        .sort((a, b) => a - b);

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    // Проверяем, есть ли данные для выбранной даты
    const isDateAvailable = (date) => {
        const dateKey = date.toISOString().split('T')[0];
        // Не позволяем выбирать будущие даты
        if (isFutureDate(date)) {
            return false;
        }
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

    // Переключение режима просмотра
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
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

            {/* Переключатель режима просмотра */}
            {hasData && (
                <div className={styles.viewModeToggle}>
                    <div className={styles.toggleButtons}>
                        <button
                            className={`${styles.toggleButton} ${viewMode === 'hourly' ? styles.active : ''}`}
                            onClick={() => handleViewModeChange('hourly')}
                        >
                            <i className="fas fa-clock"></i>
                            Почасовой режим
                        </button>
                        <button
                            className={`${styles.toggleButton} ${viewMode === 'daily' ? styles.active : ''}`}
                            onClick={() => handleViewModeChange('daily')}
                        >
                            <i className="fas fa-calendar-day"></i>
                            Общий за день
                        </button>
                        <button
                            className={`${styles.toggleButton} ${viewMode === 'weekly' ? styles.active : ''}`}
                            onClick={() => handleViewModeChange('weekly')}
                        >
                            <i className="fas fa-calendar-week"></i>
                            За неделю
                        </button>
                        <button
                            className={`${styles.toggleButton} ${viewMode === 'monthly' ? styles.active : ''}`}
                            onClick={() => handleViewModeChange('monthly')}
                        >
                            <i className="fas fa-calendar-alt"></i>
                            За месяц
                        </button>
                    </div>
                </div>
            )}

            {/* Почасовой режим */}
            {viewMode === 'hourly' && (
                <>
                    <div className={styles.chartSection}>
                        <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem"
                            }}>
                            <h3 className={styles.sectionTitle}>
                                Время прихода и ухода работников
                            </h3>
                            <span
                                style={{
                                    fontWeight: "500",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.9rem"
                                }}
                            >
                                Общее количество работников за день: <span style={{ color: "var(--primary-color)" }}>{totalWorkers}</span>
                            </span>
                        </div>
                        {hasData ? (
                            <>
                                <ResponsiveContainer width="100%" height={320}>
                                  <BarChart
                                    data={filteredData}
                                    margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
                                    barCategoryGap="45%"
                                    barGap={8}
                                    barSize={14}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.25)" />

                                    <defs>
                                      <linearGradient id="arrivalGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.55" />
                                      </linearGradient>
                                      <linearGradient id="departureGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.55" />
                                      </linearGradient>
                                      <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.55" />
                                      </linearGradient>
                                      <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
                                      </linearGradient>
                                    </defs>

                                    <XAxis
                                      dataKey="hour"
                                      tick={{ fill: "#6b7280", fontSize: 12 }}
                                      angle={-45}
                                      textAnchor="end"
                                      height={60}
                                      interval={0}
                                      allowDuplicatedCategory={false}
                                    />
                                    <YAxis
                                      domain={[0, MAX_PER_HOUR]}
                                      allowDecimals={false}
                                      tickCount={Math.min(6, MAX_PER_HOUR + 1)}
                                      tick={{ fill: "#6b7280", fontSize: 12 }}
                                    />

                                    <Tooltip
                                      content={<CombinedTooltip />}
                                      cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 8 }} />

                                    <Bar
                                      dataKey="arrival"
                                      name="Пришли"
                                      fill="url(#arrivalGrad)"
                                      stroke="#15803d"
                                      radius={[6, 6, 0, 0]}
                                      isAnimationActive
                                      animationDuration={400}
                                      animationEasing="ease-out"
                                    />
                                    <Bar
                                      dataKey="departure"
                                      name="Ушли"
                                      fill="url(#departureGrad)"
                                      stroke="#b91c1c"
                                      radius={[6, 6, 0, 0]}
                                      isAnimationActive
                                      animationDuration={400}
                                      animationEasing="ease-out"
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                            </>
                        ) : (
                            <div className={styles.noDataState}>
                                <i className="fas fa-chart-bar" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                                <p>Нет данных о времени прихода за выбранную дату</p>
                            </div>
                        )}
                    </div>

                    {hasData && activeHours.length > 0 && (
                      <div
                        className={styles.chartSection}
                        style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--spacing-xl)' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeHours.map(h => {
                            const a = hourlyData.find(x => x.hour === h)?.arrival || 0;
                            const d = hourlyData.find(x => x.hour === h)?.departure || 0;
                            const isActive = selectedHour === h;
                            return (
                              <button
                                key={h}
                                onClick={() => setSelectedHour(h)}
                                style={{
                                  textAlign: 'left',
                                  padding: '10px 12px',
                                  borderRadius: 12,
                                  border: isActive ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                  background: isActive ? 'var(--background-secondary)' : 'var(--background-input)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontWeight: 500
                                }}
                                title={`Пришло: ${a} · Ушло: ${d}`}
                              >
                                <span>{h}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a}/{d}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--spacing-lg)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' , justifyContent: 'center'}}>
                            <PieChart width={220} height={220}>
                              {isSingle ? (
                                <Pie
                                  data={[{ value: ringData[0].value }]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx={110}
                                  cy={110}
                                  innerRadius={60}
                                  outerRadius={90}
                                  startAngle={90}
                                  endAngle={-270.0001}
                                  paddingAngle={0}
                                  cornerRadius={0}
                                  stroke="none"
                                  isAnimationActive
                                >
                                  <Cell fill={ringData[0].color} />
                                </Pie>
                              ) : (
                                <Pie
                                  data={ringData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx={110}
                                  cy={110}
                                  innerRadius={60}
                                  outerRadius={90}
                                  startAngle={90}
                                  endAngle={-270}
                                  paddingAngle={2}
                                  cornerRadius={6}
                                  stroke="var(--background-card)"
                                  strokeWidth={4}
                                  isAnimationActive
                                >
                                  {ringData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              )}
                            </PieChart>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                              <div><b>Час:</b> {selectedHour}</div>
                              <div><span style={{ color: '#22c55e' }}>Пришло:</span> {arrivalsAtHour.length}</div>
                              <div><span style={{ color: '#ef4444' }}>Ушло:</span> {departuresAtHour.length}</div>
                              <div><span style={{ color: '#f59e0b' }}>На объекте:</span> {onSiteAfterHour}</div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                            <div>
                              <h4 className={styles.sectionTitle} style={{ marginBottom: 8 }}>Пришли</h4>
                              {arrivalsAtHour.length ? (
                                <div className={styles.photosGrid}>
                                  {arrivalsAtHour.map(w => (
                                    <div key={`in-${w.id}`} className={styles.workerCard} onClick={() => handleWorkerClick(w)}>
                                      <img src={w.src} alt={`${w.firstName} ${w.lastName}`} className={styles.workerPhoto} />
                                      <div className={styles.workerTimes}>
                                        <div className={styles.workerTime}>
                                          <i className="fas fa-sign-in-alt"></i>{w.arrivalTime}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={styles.noDataState}><p>Никто не приходил в этот час</p></div>
                              )}
                            </div>

                            <div>
                              <h4 className={styles.sectionTitle} style={{ marginBottom: 8 }}>Ушли</h4>
                              {departuresAtHour.length ? (
                                <div className={styles.photosGrid}>
                                  {departuresAtHour.map(w => (
                                    <div key={`out-${w.id}`} className={styles.workerCard} onClick={() => handleWorkerClick(w)}>
                                      <img src={w.src} alt={`${w.firstName} ${w.lastName}`} className={styles.workerPhoto} />
                                      <div className={styles.workerTimes}>
                                        <div className={styles.workerTime}>
                                          <i className="fas fa-sign-out-alt"></i>{w.departureTime}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={styles.noDataState}><p>Никто не уходил в этот час</p></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </>
            )}

            {/* Общий режим за день */}
            {viewMode === 'daily' && hasData && (
                <div className={styles.chartSection}>
                    <h3 className={styles.sectionTitle}>Общая статистика за день</h3>
                    
                    <div className={styles.dailyStatsGrid}>
                        <div className={styles.dailyStatCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-users"></i>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>{totalWorkers}</div>
                                <div className={styles.statLabel}>Всего работников</div>
                            </div>
                        </div>

                        <div className={styles.dailyStatCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>{activeHours.length}</div>
                                <div className={styles.statLabel}>Активных часов</div>
                            </div>
                        </div>

                        <div className={styles.dailyStatCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-sign-in-alt"></i>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>
                                    {hourlyData.reduce((acc, curr) => acc + (curr.arrival || 0), 0)}
                                </div>
                                <div className={styles.statLabel}>Приходов</div>
                            </div>
                        </div>

                        <div className={styles.dailyStatCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-sign-out-alt"></i>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>
                                    {hourlyData.reduce((acc, curr) => acc + (curr.departure || 0), 0)}
                                </div>
                                <div className={styles.statLabel}>Уходов</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.dailyWorkersSection}>
                        <h4 className={styles.sectionTitle}>Все работники за день</h4>
                        <div className={styles.photosGrid}>
                            {workerPhotos.map(worker => (
                                <div key={worker.id} className={styles.workerCard} onClick={() => handleWorkerClick(worker)}>
                                    <img src={worker.src} alt={`${worker.firstName} ${worker.lastName}`} className={styles.workerPhoto} />
                                    <div className={styles.workerTimes}>
                                        <div className={styles.workerTime}>
                                            <i className="fas fa-sign-in-alt"></i>{worker.arrivalTime}
                                        </div>
                                        {worker.departureTime && (
                                            <div className={styles.workerTime}>
                                                <i className="fas fa-sign-out-alt"></i>{worker.departureTime}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Режим за неделю */}
            {viewMode === 'weekly' && currentPeriodData && (
                <div className={styles.chartSection}>
                    <h3 className={styles.sectionTitle}>
                        Статистика за неделю {currentPeriodData[0]?.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - {currentPeriodData[6]?.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </h3>
                    
                    {/* График по дням недели */}
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={currentPeriodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.25)" />
                            
                            <defs>
                                <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.55" />
                                </linearGradient>
                            </defs>
                            
                            <XAxis 
                                dataKey="dayName" 
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className={styles.customTooltip}>
                                                <p className={styles.tooltipLabel}>{`День: ${label}`}</p>
                                                <p className={styles.tooltipValue}>{`Работников: ${payload[0].value}`}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="totalWorkers" 
                                fill="url(#weeklyGrad)" 
                                radius={[4, 4, 0, 0]}
                                isAnimationActive
                                animationDuration={400}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Статистика за неделю */}
                    {periodStats && (
                        <div className={styles.periodStatsGrid}>
                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.totalWorkers}</div>
                                    <div className={styles.periodStatLabel}>Всего работников за неделю</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.avgWorkersPerDay}</div>
                                    <div className={styles.periodStatLabel}>Среднее за день</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-arrow-up"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.maxWorkersInDay}</div>
                                    <div className={styles.periodStatLabel}>Максимум за день</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.workingDaysCount}</div>
                                    <div className={styles.periodStatLabel}>Рабочих дней</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Детальная таблица по дням */}
                    <div className={styles.weeklyTableSection}>
                        <h4 className={styles.sectionTitle}>Детализация по дням</h4>
                        <div className={styles.weeklyTable}>
                            <div className={styles.weeklyTableHeader}>
                                <div className={styles.weeklyTableCell}>День</div>
                                <div className={styles.weeklyTableCell}>Работников</div>
                                <div className={styles.weeklyTableCell}>Приходов</div>
                                <div className={styles.weeklyTableCell}>Уходов</div>
                                <div className={styles.weeklyTableCell}>Активных часов</div>
                            </div>
                            {currentPeriodData.map((day, index) => (
                                <div key={index} className={`${styles.weeklyTableRow} ${day.isWeekend ? styles.weekendRow : ''}`}>
                                    <div className={styles.weeklyTableCell}>
                                        {day.isWeekend && <span className={styles.weekendIndicator} title="Выходной"></span>}
                                        <span className={styles.dayName}>{day.dayName}</span>
                                        <span className={styles.dayDate}>{day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })}</span>
                                        {day.isWeekend && <span className={styles.weekendLabel}>Выходной</span>}
                                    </div>
                                    <div className={styles.weeklyTableCell}>{day.totalWorkers}</div>
                                    <div className={styles.weeklyTableCell}>{day.totalArrivals}</div>
                                    <div className={styles.weeklyTableCell}>{day.totalDepartures}</div>
                                    <div className={styles.weeklyTableCell}>{day.activeHoursCount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Режим за месяц */}
            {viewMode === 'monthly' && currentPeriodData && (
                <div className={styles.chartSection}>
                    <h3 className={styles.sectionTitle}>
                        Статистика за {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h3>
                    
                    {/* График по дням месяца */}
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={currentPeriodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.25)" />
                            
                            <defs>
                                <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
                                </linearGradient>
                            </defs>
                            
                            <XAxis 
                                dataKey="day" 
                                tick={{ fill: "#6b7280", fontSize: 10 }}
                                tickLine={false}
                                interval={2}
                            />
                            <YAxis 
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const dayData = currentPeriodData.find(d => d.day === label);
                                        return (
                                            <div className={styles.customTooltip}>
                                                <p className={styles.tooltipLabel}>{`День: ${label}`}</p>
                                                <p className={styles.tooltipValue}>{`Работников: ${payload[0].value}`}</p>
                                                {dayData && (
                                                    <p className={styles.tooltipValue}>{`Приходов: ${dayData.totalArrivals}`}</p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="totalWorkers" 
                                fill="url(#monthlyGrad)" 
                                radius={[2, 2, 0, 0]}
                                isAnimationActive
                                animationDuration={400}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Статистика за месяц */}
                    {periodStats && (
                        <div className={styles.periodStatsGrid}>
                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.totalWorkers}</div>
                                    <div className={styles.periodStatLabel}>Всего работников за месяц</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.avgWorkersPerDay}</div>
                                    <div className={styles.periodStatLabel}>Среднее за день</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-arrow-up"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.maxWorkersInDay}</div>
                                    <div className={styles.periodStatLabel}>Максимум за день</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.minWorkersInDay}</div>
                                    <div className={styles.periodStatLabel}>Минимум за день</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.workingDaysCount}</div>
                                    <div className={styles.periodStatLabel}>Рабочих дней</div>
                                </div>
                            </div>

                            <div className={styles.periodStatCard}>
                                <div className={styles.periodStatIcon}>
                                    <i className="fas fa-calendar"></i>
                                </div>
                                <div className={styles.periodStatContent}>
                                    <div className={styles.periodStatValue}>{periodStats.totalDays}</div>
                                    <div className={styles.periodStatLabel}>Всего дней</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Детальная таблица по дням месяца */}
                    <div className={styles.monthlyTableSection}>
                        <h4 className={styles.sectionTitle}>Детализация по дням месяца</h4>
                        <div className={styles.monthlyTable}>
                            <div className={styles.monthlyTableHeader}>
                                <div className={styles.monthlyTableCell}>День</div>
                                <div className={styles.monthlyTableCell}>Работников</div>
                                <div className={styles.monthlyTableCell}>Приходов</div>
                                <div className={styles.monthlyTableCell}>Уходов</div>
                                <div className={styles.monthlyTableCell}>Активных часов</div>
                            </div>
                            <div className={styles.monthlyTableBody}>
                                {currentPeriodData.map((day, index) => (
                                    <div key={index} className={`${styles.monthlyTableRow} ${day.isWeekend ? styles.weekendRow : ''}`}>
                                        <div className={styles.monthlyTableCell}>
                                            {day.isWeekend && <span className={styles.weekendIndicator} title="Выходной"></span>}
                                            <span className={styles.dayNumber}>{day.day}</span>
                                            <span className={styles.dayName}>{day.date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                                            {day.isWeekend && <span className={styles.weekendLabel}>Выходной</span>}
                                        </div>
                                        <div className={styles.monthlyTableCell}>{day.totalWorkers}</div>
                                        <div className={styles.monthlyTableCell}>{day.totalArrivals}</div>
                                        <div className={styles.monthlyTableCell}>{day.totalDepartures}</div>
                                        <div className={styles.monthlyTableCell}>{day.activeHoursCount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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