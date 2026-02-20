import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Plus, Trash2, Calendar, Flag, Clock, Layers,
    Users, Target, TrendingUp, CheckCircle2,
    Edit2, BarChart3, Search, Filter
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
}

interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'Pending' | 'Completed' | 'Overdue';
    priority: 'Low' | 'Medium' | 'High';
    tasks: Task[];
    progress: number;
}

interface Project {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
    team: string[];
    budget: number;
    milestones: Milestone[];
    tags: string[];
}

const ProjectMind = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [view, setView] = useState<'overview' | 'milestones' | 'tasks' | 'timeline'>('overview');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showNewMilestoneModal, setShowNewMilestoneModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingMilestone, setEditingMilestone] = useState<{ projectId: string; milestone: Milestone } | null>(null);
    const [editingTask, setEditingTask] = useState<{ projectId: string; milestoneId: string; task: Task } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const data = await fetchModuleData('hugin_projects');
                if (Array.isArray(data) && data.length > 0) {
                    // Vérifier que les données ont la bonne structure
                    const validProjects = data.filter(p => 
                        p && 
                        p.id && 
                        p.name && 
                        Array.isArray(p.milestones) &&
                        Array.isArray(p.team) &&
                        Array.isArray(p.tags)
                    );
                    
                    if (validProjects.length > 0) {
                        setProjects(validProjects);
                        setSelectedProjectId(validProjects[0].id);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // Si pas de données valides, créer un projet initial
                const initial: Project[] = [{
                    id: "p1",
                    name: "Étude CRISPR-Cas9",
                    description: "Optimisation de l'édition génomique sur E. coli.",
                    startDate: "2026-01-01",
                    endDate: "2026-12-31",
                    status: "active",
                    team: ["Dr. Martin", "Dr. Dupont"],
                    budget: 50000,
                    tags: ["Génétique", "Microbiologie"],
                    milestones: [{
                        id: "m1",
                        title: "Phase 1: Préparation",
                        description: "Extraction et purification de l'ADN",
                        dueDate: "2026-02-15",
                        status: "Completed" as const,
                        priority: "High" as const,
                        progress: 100,
                        tasks: [{
                            id: "t1",
                            title: "Extraction ADN",
                            description: "Extraire l'ADN des souches E. coli",
                            assignee: "Dr. Martin",
                            status: "done",
                            priority: "high",
                            dueDate: "2026-02-10"
                        }]
                    }]
                }];
                setProjects(initial);
                setSelectedProjectId(initial[0].id);
                await saveModuleItem('hugin_projects', initial[0]);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des projets:', error);
                // En cas d'erreur, créer un projet par défaut
                const initial: Project[] = [{
                    id: "p1",
                    name: "Étude CRISPR-Cas9",
                    description: "Optimisation de l'édition génomique sur E. coli.",
                    startDate: "2026-01-01",
                    endDate: "2026-12-31",
                    status: "active",
                    team: ["Dr. Martin", "Dr. Dupont"],
                    budget: 50000,
                    tags: ["Génétique", "Microbiologie"],
                    milestones: [{
                        id: "m1",
                        title: "Phase 1: Préparation",
                        description: "Extraction et purification de l'ADN",
                        dueDate: "2026-02-15",
                        status: "Completed" as const,
                        priority: "High" as const,
                        progress: 100,
                        tasks: [{
                            id: "t1",
                            title: "Extraction ADN",
                            description: "Extraire l'ADN des souches E. coli",
                            assignee: "Dr. Martin",
                            status: "done",
                            priority: "high",
                            dueDate: "2026-02-10"
                        }]
                    }]
                }];
                setProjects(initial);
                setSelectedProjectId(initial[0].id);
                setIsLoading(false);
            }
        };
        loadProjects();
    }, []);

    // Afficher un loader pendant le chargement
    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ width: '50px', height: '50px', border: '3px solid rgba(167, 139, 250, 0.3)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p>Chargement des projets...</p>
                </div>
            </div>
        );
    }

    const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

    const calculateProjectProgress = (project: Project | null) => {
        if (!project || !project.milestones || project.milestones.length === 0) return 0;
        const totalProgress = project.milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
        return Math.round(totalProgress / project.milestones.length);
    };

    const handleAddProject = async (project: Omit<Project, 'id'>) => {
        const newProject: Project = { ...project, id: Date.now().toString() };
        try {
            await saveModuleItem('hugin_projects', newProject);
            setProjects([...projects, newProject]);
            setSelectedProjectId(newProject.id);
            setShowNewProjectModal(false);
            showToast('Projet créé', 'success');
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleUpdateProject = async (updatedProject: Project) => {
        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
            setEditingProject(null);
            showToast('Projet mis à jour', 'success');
        } catch (e) {
            showToast('Erreur de mise à jour', 'error');
        }
    };

    const handleUpdateMilestone = async (projectId: string, updatedMilestone: Milestone) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedProject = {
            ...project,
            milestones: project.milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
        };

        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
            setEditingMilestone(null);
            showToast('Jalon mis à jour', 'success');
        } catch (e) {
            showToast('Erreur de mise à jour', 'error');
        }
    };

    const handleUpdateTask = async (projectId: string, milestoneId: string, updatedTask: Task) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedMilestones = project.milestones.map(m => {
            if (m.id === milestoneId) {
                const updatedTasks = m.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                const completedTasks = updatedTasks.filter(t => t.status === 'done').length;
                const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
                return { ...m, tasks: updatedTasks, progress };
            }
            return m;
        });

        const updatedProject = { ...project, milestones: updatedMilestones };

        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
            setEditingTask(null);
            showToast('Tâche mise à jour', 'success');
        } catch (e) {
            showToast('Erreur de mise à jour', 'error');
        }
    };

    const handleAddMilestone = async (projectId: string, milestone: Omit<Milestone, 'id'>) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newMilestone: Milestone = { ...milestone, id: Date.now().toString() };
        const updatedProject = { ...project, milestones: [...project.milestones, newMilestone] };
        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
            setShowNewMilestoneModal(false);
            showToast('Jalon ajouté', 'success');
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleAddTask = async (projectId: string, milestoneId: string, task: Omit<Task, 'id'>) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newTask: Task = { ...task, id: Date.now().toString() };
        const updatedMilestones = project.milestones.map(m => {
            if (m.id === milestoneId) {
                return { ...m, tasks: [...m.tasks, newTask] };
            }
            return m;
        });

        const updatedProject = { ...project, milestones: updatedMilestones };
        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
            setShowNewTaskModal(false);
            showToast('Tâche ajoutée', 'success');
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleUpdateTaskStatus = async (projectId: string, milestoneId: string, taskId: string, status: Task['status']) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedMilestones = project.milestones.map(m => {
            if (m.id === milestoneId) {
                const updatedTasks = m.tasks.map(t => t.id === taskId ? { ...t, status } : t);
                const completedTasks = updatedTasks.filter(t => t.status === 'done').length;
                const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
                return { ...m, tasks: updatedTasks, progress };
            }
            return m;
        });

        const updatedProject = { ...project, milestones: updatedMilestones };
        try {
            await saveModuleItem('hugin_projects', updatedProject);
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
        } catch (e) {
            showToast('Erreur de mise à jour', 'error');
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Supprimer ce projet et tous ses jalons ?')) {
            try {
                await deleteModuleItem('hugin_projects', id);
                setProjects(projects.filter(p => p.id !== id));
                if (selectedProjectId === id && projects.length > 1) {
                    setSelectedProjectId(projects.find(p => p.id !== id)?.id || '');
                }
                showToast('Projet supprimé', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return '#94a3b8';
            case 'active': return '#10b981';
            case 'completed': return '#3b82f6';
            case 'on-hold': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Vérifier que activeProject existe
    if (!activeProject && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(167, 139, 250, 0.2)', borderRadius: '1rem', color: '#a78bfa' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>ProjectMind</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestion avancée de projets scientifiques</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            style={{
                                paddingLeft: '2.5rem',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '0.875rem',
                                width: '200px'
                            }}
                        />
                    </div>
                    <button onClick={() => setShowNewProjectModal(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#a78bfa' }}>
                        <Plus size={18} /> Nouveau Projet
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', padding: '2rem' }}>
                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Filter */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={16} /> Filtrer
                        </h3>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="planning">Planification</option>
                            <option value="active">Actif</option>
                            <option value="completed">Terminé</option>
                            <option value="on-hold">En pause</option>
                        </select>
                    </div>

                    {/* Projects List */}
                    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Projets ({filteredProjects.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredProjects.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedProjectId(p.id)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        cursor: 'pointer',
                                        background: selectedProjectId === p.id ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${selectedProjectId === p.id ? '#a78bfa' : 'rgba(255,255,255,0.05)'}`,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: getStatusColor(p.status)
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        {p.milestones.length} jalons • {p.team.length} membres
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${calculateProjectProgress(p)}%`,
                                            height: '100%',
                                            background: '#a78bfa',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    {activeProject ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* View Tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {[
                                    { id: 'overview', label: 'Vue d\'ensemble', icon: <Target size={16} /> },
                                    { id: 'milestones', label: 'Jalons', icon: <Flag size={16} /> },
                                    { id: 'tasks', label: 'Tâches', icon: <CheckCircle2 size={16} /> },
                                    { id: 'timeline', label: 'Timeline', icon: <Calendar size={16} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setView(tab.id as any)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            background: view === tab.id ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: view === tab.id ? '#a78bfa' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontWeight: view === tab.id ? 600 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Overview View */}
                            {view === 'overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {/* Project Header */}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{activeProject.name}</h2>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        background: `${getStatusColor(activeProject.status)}20`,
                                                        color: getStatusColor(activeProject.status)
                                                    }}>
                                                        {activeProject.status}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{activeProject.description}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {activeProject.tags.map((tag, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: 'rgba(167, 139, 250, 0.1)',
                                                            borderRadius: '1rem',
                                                            fontSize: '0.75rem',
                                                            color: '#a78bfa'
                                                        }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setEditingProject(activeProject)} style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteProject(activeProject.id)} style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    color: '#ef4444',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    <Calendar size={14} />
                                                    Dates
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    {new Date(activeProject.startDate).toLocaleDateString()} - {new Date(activeProject.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    <Users size={14} />
                                                    Équipe
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>{activeProject.team.length} membres</div>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    <Target size={14} />
                                                    Jalons
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    {activeProject.milestones.filter(m => m.status === 'Completed').length} / {activeProject.milestones.length}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    <TrendingUp size={14} />
                                                    Progression
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>{activeProject ? calculateProjectProgress(activeProject) : 0}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <BarChart3 size={20} color="#a78bfa" /> Progression globale
                                        </h3>
                                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            <div style={{
                                                width: `${activeProject ? calculateProjectProgress(activeProject) : 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {activeProject ? calculateProjectProgress(activeProject) : 0}% complété
                                        </div>
                                    </div>

                                    {/* Milestones Summary */}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Flag size={20} color="#a78bfa" /> Jalons récents
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {activeProject.milestones.slice(0, 5).map(m => (
                                                <div key={m.id} style={{
                                                    padding: '1rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '1rem',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '0.75rem',
                                                        background: m.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: m.status === 'Completed' ? '#10b981' : 'white'
                                                    }}>
                                                        {m.status === 'Completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{m.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            Échéance: {new Date(m.dueDate).toLocaleDateString()} • {m.tasks.length} tâches
                                                        </div>
                                                    </div>
                                                    <div style={{ width: '60px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textAlign: 'center' }}>
                                                            {m.progress}%
                                                        </div>
                                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${m.progress}%`,
                                                                height: '100%',
                                                                background: '#a78bfa',
                                                                transition: 'width 0.3s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Milestones View */}
                            {view === 'milestones' && (
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Flag color="#a78bfa" /> Jalons du projet
                                        </h3>
                                        <button
                                            onClick={() => setShowNewMilestoneModal(true)}
                                            className="btn" style={{ background: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Plus size={16} /> Nouveau jalon
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {activeProject && activeProject.milestones.map(m => (
                                            <div key={m.id} style={{
                                                padding: '1.5rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '1rem',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{m.title}</h4>
                                                            <span style={{
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '1rem',
                                                                fontSize: '0.75rem',
                                                                background: `${getPriorityColor(m.priority)}20`,
                                                                color: getPriorityColor(m.priority)
                                                            }}>
                                                                {m.priority}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{m.description}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => setEditingMilestone({ projectId: activeProject.id, milestone: m })}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                border: 'none',
                                                                borderRadius: '0.5rem',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <select
                                                            value={m.status}
                                                            onChange={(e) => {
                                                                const newStatus = e.target.value as any;
                                                                const updatedProject = {
                                                                    ...activeProject,
                                                                    milestones: activeProject.milestones.map(ms =>
                                                                        ms.id === m.id ? { ...ms, status: newStatus } : ms
                                                                    )
                                                                };
                                                                handleUpdateProject(updatedProject);
                                                            }}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: 'rgba(0,0,0,0.3)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '0.5rem',
                                                                color: 'white',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            <option value="Pending">En attente</option>
                                                            <option value="Completed">Terminé</option>
                                                            <option value="Overdue">En retard</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={14} />
                                                        {new Date(m.dueDate).toLocaleDateString()}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle2 size={14} />
                                                        {m.tasks.length} tâches
                                                    </span>
                                                </div>

                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                        <span>Progression</span>
                                                        <span>{m.progress}%</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${m.progress}%`,
                                                            height: '100%',
                                                            background: '#a78bfa',
                                                            transition: 'width 0.3s'
                                                        }} />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedMilestoneId(m.id);
                                                        setShowNewTaskModal(true);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <Plus size={14} />
                                                    Ajouter une tâche
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tasks View */}
                            {view === 'tasks' && (
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle2 color="#a78bfa" /> Toutes les tâches
                                    </h3>

                                    {activeProject && activeProject.milestones.map(m => (
                                        m.tasks.length > 0 && (
                                            <div key={m.id} style={{ marginBottom: '2rem' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                                    {m.title}
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {m.tasks.map(t => (
                                                        <div key={t.id} style={{
                                                            padding: '1rem',
                                                            background: 'rgba(255,255,255,0.02)',
                                                            borderRadius: '0.75rem',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={t.status === 'done'}
                                                                onChange={(e) => {
                                                                    const newStatus = e.target.checked ? 'done' : 'todo';
                                                                    handleUpdateTaskStatus(activeProject.id, m.id, t.id, newStatus);
                                                                }}
                                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{
                                                                    fontWeight: 500,
                                                                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                                                                    opacity: t.status === 'done' ? 0.6 : 1
                                                                }}>
                                                                    {t.title}
                                                                </div>
                                                                {t.description && (
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                                        {t.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                                                                <button
                                                                    onClick={() => setEditingTask({ projectId: activeProject.id, milestoneId: m.id, task: t })}
                                                                    style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        border: 'none',
                                                                        borderRadius: '0.375rem',
                                                                        color: 'white',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <span style={{ color: 'var(--text-secondary)' }}>{t.assignee}</span>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '1rem',
                                                                    fontSize: '0.75rem',
                                                                    background: `${getPriorityColor(t.priority)}20`,
                                                                    color: getPriorityColor(t.priority)
                                                                }}>
                                                                    {t.priority}
                                                                </span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                                    {new Date(t.dueDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Timeline View */}
                            {view === 'timeline' && (
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Calendar color="#a78bfa" /> Timeline du projet
                                    </h3>

                                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '0.5rem',
                                            top: 0,
                                            bottom: 0,
                                            width: '2px',
                                            background: 'rgba(167, 139, 250, 0.3)'
                                        }} />

                                        {activeProject && activeProject.milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((m) => (
                                            <div key={m.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-1.5rem',
                                                    top: '0.5rem',
                                                    width: '1rem',
                                                    height: '1rem',
                                                    borderRadius: '50%',
                                                    background: m.status === 'Completed' ? '#10b981' : '#a78bfa',
                                                    border: '3px solid var(--bg-primary)'
                                                }} />

                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '1rem',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                        <div>
                                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>
                                                                {m.title}
                                                            </h4>
                                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                                {m.description}
                                                            </p>
                                                        </div>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: m.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(167, 139, 250, 0.2)',
                                                            color: m.status === 'Completed' ? '#10b981' : '#a78bfa'
                                                        }}>
                                                            {m.status}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Calendar size={14} />
                                                            {new Date(m.dueDate).toLocaleDateString()}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <CheckCircle2 size={14} />
                                                            {m.tasks.filter(t => t.status === 'done').length} / {m.tasks.length} tâches
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <TrendingUp size={14} />
                                                            {m.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                            Créez votre premier projet pour commencer le suivi.
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Nouveau Projet */}
            {showNewProjectModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowNewProjectModal(false)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '90%',
                            border: '1px solid var(--border-color)',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Plus size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Nouveau Projet
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddProject({
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                startDate: formData.get('startDate') as string,
                                endDate: formData.get('endDate') as string,
                                status: formData.get('status') as any,
                                team: (formData.get('team') as string).split(',').map(t => t.trim()).filter(t => t),
                                budget: Number(formData.get('budget')),
                                tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t),
                                milestones: []
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du projet</label>
                                <input
                                    name="name"
                                    required
                                    placeholder="Ex: Étude CRISPR-Cas9"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    placeholder="Description du projet..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date de début</label>
                                    <input
                                        name="startDate"
                                        type="date"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date de fin</label>
                                    <input
                                        name="endDate"
                                        type="date"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue="planning"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="planning">Planification</option>
                                        <option value="active">Actif</option>
                                        <option value="on-hold">En pause</option>
                                        <option value="completed">Terminé</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Budget (€)</label>
                                    <input
                                        name="budget"
                                        type="number"
                                        defaultValue={0}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Équipe (séparés par des virgules)</label>
                                <input
                                    name="team"
                                    placeholder="Dr. Martin, Dr. Dupont"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tags (séparés par des virgules)</label>
                                <input
                                    name="tags"
                                    placeholder="Génétique, Microbiologie"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Créer le projet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewProjectModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nouveau Jalon */}
            {showNewMilestoneModal && activeProject && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowNewMilestoneModal(false)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Flag size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Nouveau Jalon
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddMilestone(activeProject.id, {
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                dueDate: formData.get('dueDate') as string,
                                status: formData.get('status') as any,
                                priority: formData.get('priority') as any,
                                progress: 0,
                                tasks: []
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="Ex: Phase 1: Préparation"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Description du jalon..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date d'échéance</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Priorité</label>
                                    <select
                                        name="priority"
                                        defaultValue="Medium"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="Low">Basse</option>
                                        <option value="Medium">Moyenne</option>
                                        <option value="High">Haute</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue="Pending"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="Pending">En attente</option>
                                        <option value="Completed">Terminé</option>
                                        <option value="Overdue">En retard</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Créer le jalon
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewMilestoneModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nouvelle Tâche */}
            {showNewTaskModal && activeProject && selectedMilestoneId && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowNewTaskModal(false)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Nouvelle Tâche
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddTask(activeProject.id, selectedMilestoneId, {
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                assignee: formData.get('assignee') as string,
                                status: formData.get('status') as any,
                                priority: formData.get('priority') as any,
                                dueDate: formData.get('dueDate') as string
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="Ex: Extraction ADN"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Description de la tâche..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Assigné à</label>
                                <input
                                    name="assignee"
                                    required
                                    placeholder="Ex: Dr. Martin"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date d'échéance</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Priorité</label>
                                    <select
                                        name="priority"
                                        defaultValue="medium"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="low">Basse</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue="todo"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="todo">À faire</option>
                                        <option value="in-progress">En cours</option>
                                        <option value="done">Terminé</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Créer la tâche
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewTaskModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Édition Projet */}
            {editingProject && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setEditingProject(null)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '90%',
                            border: '1px solid var(--border-color)',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Edit2 size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Modifier le Projet
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleUpdateProject({
                                ...editingProject,
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                startDate: formData.get('startDate') as string,
                                endDate: formData.get('endDate') as string,
                                status: formData.get('status') as any,
                                team: (formData.get('team') as string).split(',').map(t => t.trim()).filter(t => t),
                                budget: Number(formData.get('budget')),
                                tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t)
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du projet</label>
                                <input
                                    name="name"
                                    required
                                    defaultValue={editingProject.name}
                                    placeholder="Ex: Étude CRISPR-Cas9"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    defaultValue={editingProject.description}
                                    placeholder="Description du projet..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date de début</label>
                                    <input
                                        name="startDate"
                                        type="date"
                                        required
                                        defaultValue={editingProject.startDate}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date de fin</label>
                                    <input
                                        name="endDate"
                                        type="date"
                                        required
                                        defaultValue={editingProject.endDate}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue={editingProject.status}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="planning">Planification</option>
                                        <option value="active">Actif</option>
                                        <option value="on-hold">En pause</option>
                                        <option value="completed">Terminé</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Budget (€)</label>
                                    <input
                                        name="budget"
                                        type="number"
                                        defaultValue={editingProject.budget}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Équipe (séparés par des virgules)</label>
                                <input
                                    name="team"
                                    defaultValue={editingProject.team.join(', ')}
                                    placeholder="Dr. Martin, Dr. Dupont"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tags (séparés par des virgules)</label>
                                <input
                                    name="tags"
                                    defaultValue={editingProject.tags.join(', ')}
                                    placeholder="Génétique, Microbiologie"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Édition Jalon */}
            {editingMilestone && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setEditingMilestone(null)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Edit2 size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Modifier le Jalon
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleUpdateMilestone(editingMilestone.projectId, {
                                ...editingMilestone.milestone,
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                dueDate: formData.get('dueDate') as string,
                                status: formData.get('status') as any,
                                priority: formData.get('priority') as any
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={editingMilestone.milestone.title}
                                    placeholder="Ex: Phase 1: Préparation"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    defaultValue={editingMilestone.milestone.description}
                                    placeholder="Description du jalon..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date d'échéance</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    required
                                    defaultValue={editingMilestone.milestone.dueDate}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Priorité</label>
                                    <select
                                        name="priority"
                                        defaultValue={editingMilestone.milestone.priority}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="Low">Basse</option>
                                        <option value="Medium">Moyenne</option>
                                        <option value="High">Haute</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue={editingMilestone.milestone.status}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="Pending">En attente</option>
                                        <option value="Completed">Terminé</option>
                                        <option value="Overdue">En retard</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMilestone(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Édition Tâche */}
            {editingTask && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setEditingTask(null)}>
                    <div
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Edit2 size={24} style={{ color: 'var(--accent-hugin)' }} />
                            Modifier la Tâche
                        </h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleUpdateTask(editingTask.projectId, editingTask.milestoneId, {
                                ...editingTask.task,
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                assignee: formData.get('assignee') as string,
                                status: formData.get('status') as any,
                                priority: formData.get('priority') as any,
                                dueDate: formData.get('dueDate') as string
                            });
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={editingTask.task.title}
                                    placeholder="Ex: Extraction ADN"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    defaultValue={editingTask.task.description}
                                    placeholder="Description de la tâche..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Assigné à</label>
                                <input
                                    name="assignee"
                                    required
                                    defaultValue={editingTask.task.assignee}
                                    placeholder="Ex: Dr. Martin"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date d'échéance</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    required
                                    defaultValue={editingTask.task.dueDate}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Priorité</label>
                                    <select
                                        name="priority"
                                        defaultValue={editingTask.task.priority}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="low">Basse</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut</label>
                                    <select
                                        name="status"
                                        defaultValue={editingTask.task.status}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="todo">À faire</option>
                                        <option value="in-progress">En cours</option>
                                        <option value="done">Terminé</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--accent-hugin)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectMind;

// Ajouter l'animation de spin
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
if (!document.querySelector('style[data-spin-animation]')) {
    style.setAttribute('data-spin-animation', 'true');
    document.head.appendChild(style);
}
