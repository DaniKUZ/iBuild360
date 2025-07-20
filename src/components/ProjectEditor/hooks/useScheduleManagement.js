import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

const useScheduleManagement = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks);

  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    progress: 0,
    status: 'planned',
    description: '',
    responsible: '',
    dependencies: []
  });

  // Начало добавления новой задачи (открытие модального окна)
  const addTask = useCallback(() => {
    setAddingTask(true);
    setTaskFormData({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      status: 'planned',
      description: '',
      responsible: '',
      dependencies: []
    });
  }, []);

  // Обновление задачи
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  // Удаление задачи
  const removeTask = useCallback((taskId) => {
    setTasks(prev => {
      // Также удаляем эту задачу из dependencies других задач
      const updatedTasks = prev.filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          dependencies: task.dependencies.filter(depId => depId !== taskId)
        }));
      return updatedTasks;
    });
  }, []);

  // Начало редактирования задачи
  const startEditTask = useCallback((task) => {
    setEditingTask(task);
    setTaskFormData({
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      progress: task.progress,
      status: task.status,
      description: task.description,
      responsible: task.responsible,
      dependencies: task.dependencies
    });
  }, []);

  // Отмена редактирования
  const cancelEdit = useCallback(() => {
    setEditingTask(null);
    setAddingTask(false);
    setTaskFormData({
      name: '',
      startDate: '',
      endDate: '',
      progress: 0,
      status: 'planned',
      description: '',
      responsible: '',
      dependencies: []
    });
  }, []);

  // Сохранение изменений задачи
  const saveTask = useCallback(() => {
    if (!editingTask) return;
    
    updateTask(editingTask.id, {
      ...taskFormData,
      progress: parseInt(taskFormData.progress),
      dependencies: taskFormData.dependencies
    });
    
    cancelEdit();
  }, [editingTask, taskFormData, updateTask, cancelEdit]);

  // Сохранение новой задачи
  const saveNewTask = useCallback(() => {
    if (!addingTask) return;
    
    const newTask = {
      id: Date.now() + Math.random(),
      name: taskFormData.name || "Новая задача",
      startDate: taskFormData.startDate,
      endDate: taskFormData.endDate,
      progress: parseInt(taskFormData.progress),
      status: taskFormData.status,
      description: taskFormData.description,
      dependencies: taskFormData.dependencies,
      responsible: taskFormData.responsible
    };
    
    setTasks(prev => [...prev, newTask]);
    cancelEdit();
  }, [addingTask, taskFormData]);

  // Обновление формы редактирования
  const updateTaskForm = useCallback((field, value) => {
    setTaskFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Получение доступных задач для зависимостей
  const getAvailableDependencies = useCallback((currentTaskId) => {
    return tasks.filter(task => task.id !== currentTaskId);
  }, [tasks]);

  // Вычисление статистики проекта
  const getProjectStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const planned = tasks.filter(task => task.status === 'planned').length;
    
    const overallProgress = tasks.length > 0 
      ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
      : 0;
    
    return {
      total,
      completed,
      inProgress,
      planned,
      overallProgress
    };
  }, [tasks]);

  // Получение критического пути
  const getCriticalPath = useCallback(() => {
    // Упрощенная версия - находим самую длинную цепочку зависимостей
    const findLongestPath = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return 0;
      visited.add(taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (!task) return 0;
      
      const taskDuration = new Date(task.endDate) - new Date(task.startDate);
      const dependentTasks = tasks.filter(t => t.dependencies.includes(taskId));
      
      let maxPath = 0;
      dependentTasks.forEach(depTask => {
        const pathLength = findLongestPath(depTask.id, new Set(visited));
        maxPath = Math.max(maxPath, pathLength);
      });
      
      return taskDuration + maxPath;
    };
    
    const rootTasks = tasks.filter(task => task.dependencies.length === 0);
    let criticalPath = [];
    let maxDuration = 0;
    
    rootTasks.forEach(task => {
      const duration = findLongestPath(task.id);
      if (duration > maxDuration) {
        maxDuration = duration;
        criticalPath = [task.id]; // Упрощенно - только начальная задача
      }
    });
    
    return criticalPath;
  }, [tasks]);

  // Функции для работы с импортом/экспортом
  const openImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  // Импорт задач из таблицы
  const importTasks = useCallback((importedTasks, replaceAll = false) => {
    if (replaceAll) {
      setTasks(importedTasks);
    } else {
      setTasks(prev => [...prev, ...importedTasks]);
    }
    setShowImportModal(false);
  }, []);

  // Экспорт задач в CSV
  const exportToCSV = useCallback(() => {
    if (tasks.length === 0) {
      alert('Нет задач для экспорта');
      return;
    }

    const headers = [
      'Название задачи',
      'Дата начала',
      'Дата окончания',
      'Прогресс (%)',
      'Статус',
      'Описание',
      'Ответственный'
    ];

    const rows = tasks.map(task => [
      task.name,
      task.startDate,
      task.endDate,
      task.progress,
      getStatusText(task.status),
      task.description || '',
      task.responsible || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `план-график_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tasks]);

  // Экспорт в формате диаграммы Ганта (упрощенный CSV)
  const exportToGanttCSV = useCallback(() => {
    if (tasks.length === 0) {
      alert('Нет задач для экспорта');
      return;
    }

    const headers = [
      'Task Name',
      'Start Date',
      'End Date',
      'Duration (days)',
      'Progress',
      'Status',
      'Resource',
      'Predecessor'
    ];

    const rows = tasks.map(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      return [
        task.name,
        task.startDate,
        task.endDate,
        duration,
        `${task.progress}%`,
        getStatusText(task.status),
        task.responsible || '',
        task.dependencies.join(';')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `gantt-chart_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tasks]);

  // Экспорт в Excel формат
  const exportToExcel = useCallback(() => {
    if (tasks.length === 0) {
      alert('Нет задач для экспорта');
      return;
    }

    const worksheetData = [
      // Заголовки
      [
        'Название задачи',
        'Дата начала',
        'Дата окончания',
        'Длительность (дней)',
        'Прогресс (%)',
        'Статус',
        'Описание',
        'Ответственный'
      ],
      // Данные
      ...tasks.map(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        return [
          task.name,
          task.startDate,
          task.endDate,
          duration,
          task.progress,
          getStatusText(task.status),
          task.description || '',
          task.responsible || ''
        ];
      })
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Настройка ширины колонок
    const columnWidths = [
      { wch: 30 }, // Название задачи
      { wch: 12 }, // Дата начала
      { wch: 12 }, // Дата окончания
      { wch: 15 }, // Длительность
      { wch: 10 }, // Прогресс
      { wch: 12 }, // Статус
      { wch: 40 }, // Описание
      { wch: 20 }  // Ответственный
    ];
    worksheet['!cols'] = columnWidths;

    // Создание рабочей книги
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'План-график');

    // Сохранение файла
    XLSX.writeFile(workbook, `план-график_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [tasks]);

  // Экспорт диаграммы Ганта в Excel
  const exportToGanttExcel = useCallback(() => {
    if (tasks.length === 0) {
      alert('Нет задач для экспорта');
      return;
    }

    const worksheetData = [
      // Заголовки для диаграммы Ганта
      [
        'Task Name',
        'Start Date',
        'End Date',
        'Duration (days)',
        'Progress',
        'Status',
        'Resource',
        'Predecessor',
        'Notes'
      ],
      // Данные
      ...tasks.map(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 1000));
        
        return [
          task.name,
          task.startDate,
          task.endDate,
          duration,
          `${task.progress}%`,
          getStatusText(task.status),
          task.responsible || '',
          task.dependencies.length > 0 ? task.dependencies.join(';') : '',
          task.description || ''
        ];
      })
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Настройка ширины колонок для Ганта
    const columnWidths = [
      { wch: 25 }, // Task Name
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 15 }, // Duration
      { wch: 10 }, // Progress
      { wch: 12 }, // Status
      { wch: 20 }, // Resource
      { wch: 15 }, // Predecessor
      { wch: 30 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gantt Chart');

    XLSX.writeFile(workbook, `gantt-chart_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [tasks]);

  // Вспомогательная функция для получения текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В работе';
      case 'planned': return 'Запланировано';
      default: return 'Неизвестно';
    }
  };

  return {
    tasks,
    editingTask,
    addingTask,
    showImportModal,
    taskFormData,
    addTask,
    updateTask,
    removeTask,
    startEditTask,
    cancelEdit,
    saveTask,
    saveNewTask,
    updateTaskForm,
    getAvailableDependencies,
    getProjectStats,
    getCriticalPath,
    openImportModal,
    closeImportModal,
    importTasks,
    exportToCSV,
    exportToGanttCSV,
    exportToExcel,
    exportToGanttExcel
  };
};

export default useScheduleManagement; 