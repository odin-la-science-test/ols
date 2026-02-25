import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, Users, Tag, Download, Upload } from 'lucide-react';
import { showToast } from '../../components/ToastNotification';

interface Task {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number; // en jours
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignedTo: string;
  dependencies: string[]; // IDs des tâches dont celle-ci dépend
  resources: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  progress: number; // 0-100
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  tasks: Task[];
  team: string[];
  budget: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  experimentId: string;
  name: string;
  date: string;
  description: string;
  completed: boolean;
}

const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444'
};

const STATUS_COLORS = {
  'not-started': '#64748b',
  'in-progress': '#3b82f6',
  'completed': '#10b981',
  'blocked': '#ef4444'
};

export const ExperimentPlanner: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [view, setView] = useState<'list' | 'gantt' | 'calendar'>('gantt');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExperimentModal, setShowExperimentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [ganttScale, setGanttScale] = useState<'day' | 'week' | 'month'>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedExperiments = localStorage.getItem('experiment_planner_experiments');
    const savedMilestones = localStorage.getItem('experiment_planner_milestones');
    
    if (savedExperiments) setExperiments(JSON.parse(savedExperiments));
    if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
  };

  const saveExperiments = (data: Experiment[]) => {
    localStorage.setItem('experiment_planner_experiments', JSON.stringify(data));
    setExperiments(data);
  };

  const saveMilestones = (data: Milestone[]) => {
    localStorage.setItem('experiment_planner_milestones', JSON.stringify(data));
    setMilestones(data);
  };

  const addExperiment = (experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newExperiment: Experiment = {
      ...experiment,
      id: Date.now().toString(),
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveExperiments([...experiments, newExperiment]);
    showToast('success', '✅ Expérience créée');
  };

  const updateExperiment = (id: string, updates: Partial<Experiment>) => {
    const updated = experiments.map(e => 
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    );
    saveExperiments(updated);
    if (selectedExperiment?.id === id) {
      setSelectedExperiment({ ...selectedExperiment, ...updates });
    }
    showToast('success', '✅ Expérience mise à jour');
  };

  const deleteExperiment = (id: string) => {
    if (confirm('Supprimer cette expérience et toutes ses tâches ?')) {
      saveExperiments(experiments.filter(e => e.id !== id));
      if (selectedExperiment?.id === id) setSelectedExperiment(null);
      showToast('success', '🗑️ Expérience supprimée');
    }
  };

  const addTask = (experimentId: string, task: Omit<Task, 'id'>) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };

    const updatedTasks = [...experiment.tasks, newTask];
    updateExperiment(experimentId, { tasks: updatedTasks });
  };

  const updateTask = (experimentId: string, taskId: string, updates: Partial<Task>) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    const updatedTasks = experiment.tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    updateExperiment(experimentId, { tasks: updatedTasks });
  };

  const deleteTask = (experimentId: string, taskId: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      const experiment = experiments.find(e => e.id === experimentId);
      if (!experiment) return;

      const updatedTasks = experiment.tasks.filter(t => t.id !== taskId);
      updateExperiment(experimentId, { tasks: updatedTasks });
      showToast('success', '🗑️ Tâche supprimée');
    }
  };

  const calculateDatePosition = (date: string, startDate: string, endDate: string, width: number) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const current = new Date(date).getTime();
    const total = end - start;
    const elapsed = current - start;
    return (elapsed / total) * width;
  };

  const exportToJSON = () => {
    const data = {
      experiments,
      milestones,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-planner-${Date.now()}.json`;
    a.click();
    showToast('success', '📥 Export réussi');
  };

  const filteredExperiments = experiments.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonctions pour le calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const tasksOnDate: Array<{ task: Task; experiment: Experiment }> = [];
    
    experiments.forEach(experiment => {
      experiment.tasks.forEach(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        const checkDate = new Date(dateStr);
        
        if (checkDate >= taskStart && checkDate <= taskEnd) {
          tasksOnDate.push({ task, experiment });
        }
      });
    });
    
    return tasksOnDate;
  };

  const getMilestonesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return milestones.filter(m => m.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Modal Expérience */}
      {showExperimentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>
              {editingExperiment ? 'Modifier l\'Expérience' : 'Nouvelle Expérience'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const experimentData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                status: formData.get('status') as Experiment['status'],
                team: (formData.get('team') as string).split(',').map(t => t.trim()).filter(Boolean),
                budget: parseFloat(formData.get('budget') as string) || 0,
                tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean)
              };
              
              if (editingExperiment) {
                updateExperiment(editingExperiment.id, experimentData);
              } else {
                addExperiment(experimentData);
              }
              setShowExperimentModal(false);
              setEditingExperiment(null);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Nom de l'expérience *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingExperiment?.name}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    defaultValue={editingExperiment?.description}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Date début *
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={editingExperiment?.startDate}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Date fin *
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      required
                      defaultValue={editingExperiment?.endDate}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Statut *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingExperiment?.status || 'planning'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="planning">Planification</option>
                    <option value="active">Actif</option>
                    <option value="on-hold">En pause</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Équipe (séparés par virgules)
                  </label>
                  <input
                    name="team"
                    type="text"
                    defaultValue={editingExperiment?.team.join(', ')}
                    placeholder="Alice, Bob, Charlie"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Budget (€)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    step="0.01"
                    defaultValue={editingExperiment?.budget}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Tags (séparés par virgules)
                  </label>
                  <input
                    name="tags"
                    type="text"
                    defaultValue={editingExperiment?.tags.join(', ')}
                    placeholder="PCR, Clonage, Western Blot"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editingExperiment ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExperimentModal(false);
                    setEditingExperiment(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tâche */}
      {showTaskModal && selectedExperiment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>
              {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const taskData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                duration: parseInt(formData.get('duration') as string) || 1,
                status: formData.get('status') as Task['status'],
                assignedTo: formData.get('assignedTo') as string,
                dependencies: (formData.get('dependencies') as string).split(',').map(d => d.trim()).filter(Boolean),
                resources: (formData.get('resources') as string).split(',').map(r => r.trim()).filter(Boolean),
                tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
                priority: formData.get('priority') as Task['priority'],
                notes: formData.get('notes') as string,
                progress: parseInt(formData.get('progress') as string) || 0
              };
              
              if (editingTask) {
                updateTask(selectedExperiment.id, editingTask.id, taskData);
              } else {
                addTask(selectedExperiment.id, taskData);
              }
              setShowTaskModal(false);
              setEditingTask(null);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Nom de la tâche *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingTask?.name}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingTask?.description}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Date début *
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={editingTask?.startDate || selectedExperiment.startDate}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Date fin *
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      required
                      defaultValue={editingTask?.endDate || selectedExperiment.startDate}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Durée (jours) *
                    </label>
                    <input
                      name="duration"
                      type="number"
                      required
                      min="1"
                      defaultValue={editingTask?.duration || 1}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Statut *
                    </label>
                    <select
                      name="status"
                      required
                      defaultValue={editingTask?.status || 'not-started'}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="not-started">Non démarré</option>
                      <option value="in-progress">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="blocked">Bloqué</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Priorité *
                    </label>
                    <select
                      name="priority"
                      required
                      defaultValue={editingTask?.priority || 'medium'}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Assigné à
                  </label>
                  <input
                    name="assignedTo"
                    type="text"
                    defaultValue={editingTask?.assignedTo}
                    placeholder="Nom du responsable"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Progrès (0-100%)
                  </label>
                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingTask?.progress || 0}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Ressources (séparées par virgules)
                  </label>
                  <input
                    name="resources"
                    type="text"
                    defaultValue={editingTask?.resources.join(', ')}
                    placeholder="Microscope, Centrifugeuse"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Tags (séparés par virgules)
                  </label>
                  <input
                    name="tags"
                    type="text"
                    defaultValue={editingTask?.tags.join(', ')}
                    placeholder="Urgent, Critique"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Dépendances (IDs séparés par virgules)
                  </label>
                  <input
                    name="dependencies"
                    type="text"
                    defaultValue={editingTask?.dependencies.join(', ')}
                    placeholder="ID1, ID2"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingTask?.notes}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editingTask ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Planificateur d'Expériences
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {experiments.length} expérience(s) • {experiments.reduce((acc, e) => acc + e.tasks.length, 0)} tâche(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={exportToJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Download size={20} />
            Exporter
          </button>
          <button
            onClick={() => {
              setEditingExperiment(null);
              setShowExperimentModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Nouvelle Expérience
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {(['list', 'gantt', 'calendar'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: view === v ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: view === v ? 'white' : '#60a5fa',
              border: `1px solid ${view === v ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {v === 'list' ? 'Liste' : v === 'gantt' ? 'Timeline Gantt' : 'Calendrier'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher une expérience..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#f8fafc'
          }}
        />
      </div>

      {/* List View */}
      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredExperiments.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px'
            }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Aucune expérience trouvée</p>
            </div>
          ) : (
            filteredExperiments.map(experiment => (
              <div
                key={experiment.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedExperiment(experiment)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '600' }}>
                    {experiment.name}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: experiment.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' :
                                   experiment.status === 'active' ? 'rgba(59, 130, 246, 0.2)' :
                                   experiment.status === 'on-hold' ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(100, 116, 139, 0.2)',
                    color: experiment.status === 'completed' ? '#10b981' :
                          experiment.status === 'active' ? '#3b82f6' :
                          experiment.status === 'on-hold' ? '#f59e0b' :
                          '#94a3b8',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {experiment.status === 'completed' ? 'Terminé' :
                     experiment.status === 'active' ? 'Actif' :
                     experiment.status === 'on-hold' ? 'En pause' :
                     'Planification'}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {experiment.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {experiment.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        color: '#60a5fa',
                        fontSize: '0.75rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  {experiment.tasks.length} tâche(s) • {new Date(experiment.startDate).toLocaleDateString('fr-FR')} - {new Date(experiment.endDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Gantt View */}
      {view === 'gantt' && selectedExperiment && (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{selectedExperiment.name}</h2>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Plus size={16} />
              Ajouter Tâche
            </button>
          </div>

          {selectedExperiment.tasks.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Aucune tâche. Ajoutez votre première tâche pour commencer.
            </p>
          ) : (
            <div style={{ minWidth: '800px' }}>
              {/* Timeline Header */}
              <div style={{ display: 'flex', marginBottom: '1rem', paddingLeft: '200px' }}>
                <div style={{ flex: 1, borderBottom: '2px solid rgba(59, 130, 246, 0.3)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span>{new Date(selectedExperiment.startDate).toLocaleDateString('fr-FR')}</span>
                    <span>{new Date(selectedExperiment.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              {selectedExperiment.tasks.map(task => {
                const totalDays = (new Date(selectedExperiment.endDate).getTime() - new Date(selectedExperiment.startDate).getTime()) / (1000 * 60 * 60 * 24);
                const taskStart = (new Date(task.startDate).getTime() - new Date(selectedExperiment.startDate).getTime()) / (1000 * 60 * 60 * 24);
                const taskWidth = task.duration;
                const leftPercent = (taskStart / totalDays) * 100;
                const widthPercent = (taskWidth / totalDays) * 100;

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ width: '200px', paddingRight: '1rem' }}>
                      <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {task.name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {task.duration} jour(s)
                      </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '40px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: '100%',
                          backgroundColor: STATUS_COLORS[task.status],
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setEditingTask(task);
                          setShowTaskModal(true);
                        }}
                      >
                        {task.progress}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button
              onClick={previousMonth}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Précédent
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToToday}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Aujourd'hui
              </button>
            </div>
            
            <button
              onClick={nextMonth}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Suivant →
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div
                key={day}
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem'
          }}>
            {(() => {
              const daysInMonth = getDaysInMonth(currentMonth);
              const firstDay = getFirstDayOfMonth(currentMonth);
              const today = new Date();
              const cells = [];

              // Empty cells before first day
              for (let i = 0; i < firstDay; i++) {
                cells.push(
                  <div
                    key={`empty-${i}`}
                    style={{
                      minHeight: '120px',
                      backgroundColor: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '8px'
                    }}
                  />
                );
              }

              // Days of month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isToday = date.toDateString() === today.toDateString();
                const tasksOnDate = getTasksForDate(date);
                const milestonesOnDate = getMilestonesForDate(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();

                cells.push(
                  <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minHeight: '120px',
                      padding: '0.5rem',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                      border: isToday ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        color: isToday ? '#3b82f6' : '#f8fafc',
                        fontWeight: isToday ? '700' : '600',
                        fontSize: '0.9rem'
                      }}>
                        {day}
                      </span>
                      {(tasksOnDate.length > 0 || milestonesOnDate.length > 0) && (
                        <span style={{
                          padding: '0.15rem 0.4rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          {tasksOnDate.length + milestonesOnDate.length}
                        </span>
                      )}
                    </div>

                    {/* Milestones */}
                    {milestonesOnDate.slice(0, 1).map(milestone => (
                      <div
                        key={milestone.id}
                        style={{
                          padding: '0.25rem 0.4rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '4px',
                          marginBottom: '0.25rem',
                          fontSize: '0.7rem',
                          color: '#fbbf24',
                          fontWeight: '600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={milestone.name}
                      >
                        🎯 {milestone.name}
                      </div>
                    ))}

                    {/* Tasks */}
                    {tasksOnDate.slice(0, 2).map(({ task, experiment }) => (
                      <div
                        key={task.id}
                        style={{
                          padding: '0.25rem 0.4rem',
                          backgroundColor: `${STATUS_COLORS[task.status]}20`,
                          border: `1px solid ${STATUS_COLORS[task.status]}40`,
                          borderRadius: '4px',
                          marginBottom: '0.25rem',
                          fontSize: '0.7rem',
                          color: STATUS_COLORS[task.status],
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={`${experiment.name}: ${task.name}`}
                      >
                        {task.name}
                      </div>
                    ))}

                    {/* More indicator */}
                    {tasksOnDate.length + milestonesOnDate.length > 3 && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginTop: '0.25rem'
                      }}>
                        +{tasksOnDate.length + milestonesOnDate.length - 3} autre(s)
                      </div>
                    )}
                  </div>
                );
              }

              return cells;
            })()}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#f8fafc', fontSize: '1.2rem' }}>
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Fermer
                </button>
              </div>

              {/* Milestones for selected date */}
              {(() => {
                const milestonesOnDate = getMilestonesForDate(selectedDate);
                if (milestonesOnDate.length > 0) {
                  return (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🎯 Jalons ({milestonesOnDate.length})
                      </h4>
                      {milestonesOnDate.map(milestone => (
                        <div
                          key={milestone.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '6px',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <div style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {milestone.name}
                          </div>
                          {milestone.description && (
                            <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                              {milestone.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Tasks for selected date */}
              {(() => {
                const tasksOnDate = getTasksForDate(selectedDate);
                if (tasksOnDate.length === 0 && getMilestonesForDate(selectedDate).length === 0) {
                  return (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                      Aucune tâche ou jalon pour cette date
                    </p>
                  );
                }

                if (tasksOnDate.length > 0) {
                  return (
                    <div>
                      <h4 style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '0.75rem' }}>
                        Tâches ({tasksOnDate.length})
                      </h4>
                      {tasksOnDate.map(({ task, experiment }) => (
                        <div
                          key={task.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '8px',
                            marginBottom: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <div>
                              <div style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '0.25rem' }}>
                                {task.name}
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                {experiment.name}
                              </div>
                            </div>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: `${STATUS_COLORS[task.status]}20`,
                              color: STATUS_COLORS[task.status],
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {task.status === 'completed' ? 'Terminé' :
                               task.status === 'in-progress' ? 'En cours' :
                               task.status === 'blocked' ? 'Bloqué' :
                               'Non démarré'}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                              {task.description}
                            </p>
                          )}
                          
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                            <span>📅 {new Date(task.startDate).toLocaleDateString('fr-FR')} - {new Date(task.endDate).toLocaleDateString('fr-FR')}</span>
                            {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                            <span>📊 {task.progress}%</span>
                          </div>
                          
                          {task.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                              {task.tags.map(tag => (
                                <span
                                  key={tag}
                                  style={{
                                    padding: '0.15rem 0.5rem',
                                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '4px',
                                    color: '#60a5fa',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Legend */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Légende</h4>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                <span style={{ color: '#cbd5e1' }}>Terminé</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                <span style={{ color: '#cbd5e1' }}>En cours</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#64748b', borderRadius: '2px' }} />
                <span style={{ color: '#cbd5e1' }}>Non démarré</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span style={{ color: '#cbd5e1' }}>Bloqué</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24' }}>🎯</span>
                <span style={{ color: '#cbd5e1' }}>Jalon</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentPlanner;
