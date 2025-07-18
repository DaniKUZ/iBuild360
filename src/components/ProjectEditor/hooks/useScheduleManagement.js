import { useState, useCallback } from 'react';

const useScheduleManagement = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks.length > 0 ? initialTasks : [
    {
      id: 1,
      name: "Подготовительные работы",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      progress: 100,
      status: "completed",
      description: "Подготовка участка, геодезические работы",
      dependencies: [],
      responsible: "Инженер"
    },
    {
      id: 2,
      name: "Земляные работы",
      startDate: "2024-01-21",
      endDate: "2024-01-30",
      progress: 100,
      status: "completed",
      description: "Рытье котлована, планировка участка",
      dependencies: [1],
      responsible: "Бригада №1"
    },
    {
      id: 3,
      name: "Фундаментные работы",
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      progress: 75,
      status: "in_progress",
      description: "Заливка фундамента, армирование",
      dependencies: [2],
      responsible: "Бригада №2"
    },
    {
      id: 4,
      name: "Возведение стен",
      startDate: "2024-02-16",
      endDate: "2024-03-15",
      progress: 0,
      status: "planned",
      description: "Кладка стен, монтаж перекрытий",
      dependencies: [3],
      responsible: "Бригада №3"
    },
    {
      id: 5,
      name: "Кровельные работы",
      startDate: "2024-03-16",
      endDate: "2024-04-01",
      progress: 0,
      status: "planned",
      description: "Монтаж кровли, утепление",
      dependencies: [4],
      responsible: "Кровельщики"
    },
    {
      id: 6,
      name: "Отделочные работы",
      startDate: "2024-04-02",
      endDate: "2024-05-15",
      progress: 0,
      status: "planned",
      description: "Внутренняя и наружная отделка",
      dependencies: [5],
      responsible: "Отделочники"
    }
  ]);

  const [editingTask, setEditingTask] = useState(null);
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

  // Добавление новой задачи
  const addTask = useCallback(() => {
    const newTask = {
      id: Date.now() + Math.random(),
      name: "Новая задача",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      status: "planned",
      description: "",
      dependencies: [],
      responsible: ""
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
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

  return {
    tasks,
    editingTask,
    taskFormData,
    addTask,
    updateTask,
    removeTask,
    startEditTask,
    cancelEdit,
    saveTask,
    updateTaskForm,
    getAvailableDependencies,
    getProjectStats,
    getCriticalPath
  };
};

export default useScheduleManagement; 