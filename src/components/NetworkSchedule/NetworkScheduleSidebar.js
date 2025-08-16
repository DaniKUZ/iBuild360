import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './NetworkScheduleSidebar.module.css';
import { MOCK_NETWORK_SCHEDULE, getProjectStatus, getScheduleInsights } from '../../data/mockNetworkSchedule';

const TAB_ITEMS = [
	{ id: 'current-schedule', label: 'Текущий план', icon: 'fas fa-calendar-check' },
	{ id: 'critical-path', label: 'Критический путь', icon: 'fas fa-route' },
	{ id: 'milestones', label: 'Вехи проекта', icon: 'fas fa-flag' }
];

const NetworkScheduleSidebar = ({ defaultTab = 'current-schedule' }) => {
	const [activeTab, setActiveTab] = useState(defaultTab);
	const projectStatus = getProjectStatus();
	const insights = getScheduleInsights();

	return (
		<div className={styles.sidebar}>
			<div className={styles.header}>
				<div className={styles.title}><i className="fas fa-project-diagram"></i> Сетевой план</div>
				<div className={styles.meta}>
					<span className={styles.project}>{MOCK_NETWORK_SCHEDULE.project.name}</span>
					<span className={styles.progress}>{projectStatus.overallProgress}%</span>
					<span className={`${styles.health} ${styles[insights.overallHealth]}`}></span>
				</div>
			</div>

			<div className={styles.tabs}>
				{TAB_ITEMS.map(tab => (
					<button
						key={tab.id}
						className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
						onClick={() => setActiveTab(tab.id)}
					>
						<i className={`${tab.icon}`}></i>
						{tab.label}
					</button>
				))}
			</div>

			<div className={styles.body}>
				{activeTab === 'current-schedule' && (
					<div className={styles.section}>Сводка текущего плана: отставание 5 дней из‑за арматуры. Критичный ресурс: башенный кран №2.</div>
				)}
				{activeTab === 'critical-path' && (
					<div className={styles.section}>Критический путь: Фундамент → Каркас → Монтаж этажей → Кровля → Фасад → Инженерные сети → Отделка → Пусконаладка.</div>
				)}
				{activeTab === 'milestones' && (
					<div className={styles.section}>Ближайшие вехи: Завершение каркаса 3-го этажа (Т+7), Поставка окон (Т+21).</div>
				)}
			</div>
		</div>
	);
};

NetworkScheduleSidebar.propTypes = {
	defaultTab: PropTypes.string
};

export default NetworkScheduleSidebar;



