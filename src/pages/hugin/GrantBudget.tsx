import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Plus, Trash2, ChevronLeft, X, Save, TrendingUp, DollarSign,
    FileText, Edit2, AlertTriangle, BarChart3, PieChart, Target, Clock, CheckCircle,
    Filter, Search, Download
} from 'lucide-react';
import Plotly from 'react-plotly.js';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    grantId: string;
    status: 'pending' | 'approved' | 'paid';
    invoiceNumber?: string;
    projectId: string;
}

interface Grant {
    id: string;
    name: string;
    totalAmount: number;
    spent: number;
    expiryDate: string;
    funder: string;
    startDate: string;
    status: 'active' | 'completed' | 'pending';
    description?: string;
    pi: string;
    projectId: string;
}

interface BudgetProject {
    id: string;
    name: string;
    description?: string;
    createdDate: string;
    color: string;
}

const GrantBudget = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [grants, setGrants] = useState<Grant[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [projects, setProjects] = useState<BudgetProject[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [view, setView] = useState<'overview' | 'expenses' | 'grants' | 'stats'>('overview');
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isAddingGrant, setIsAddingGrant] = useState(false);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [editingGrant, setEditingGrant] = useState<Grant | null>(null);
    const [editingProject, setEditingProject] = useState<BudgetProject | null>(null);
    const [selectedGrantId, setSelectedGrantId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        const loadFinanceData = async () => {
            // Charger les projets
            const pData = await fetchModuleData('hugin_budget_projects');
            if (pData && pData.length > 0) {
                setProjects(pData);
                setSelectedProjectId(pData[0].id);
            } else {
                const initialProjects: BudgetProject[] = [
                    { 
                        id: "p1", 
                        name: "Laboratoire Principal", 
                        description: "Budget principal du laboratoire",
                        createdDate: "2026-01-01",
                        color: "#10b981"
                    }
                ];
                setProjects(initialProjects);
                setSelectedProjectId(initialProjects[0].id);
                for (const p of initialProjects) {
                    await saveModuleItem('hugin_budget_projects', p);
                }
            }

            const gData = await fetchModuleData('hugin_grants');
            const eData = await fetchModuleData('hugin_expenses');

            if (gData && gData.length > 0) {
                setGrants(gData);
                const firstGrant = gData[0];
                setSelectedGrantId(firstGrant.id);
            } else {
                const initialGrants: Grant[] = [
                    { 
                        id: "g1", name: "ANR-CRISPR-2026", totalAmount: 150000, spent: 45000, 
                        expiryDate: "2027-12-31", startDate: "2026-01-01", funder: "ANR", 
                        status: "active", pi: "Dr. Martin", 
                        description: "Projet de recherche sur l'édition génomique CRISPR",
                        projectId: "p1"
                    },
                    { 
                        id: "g2", name: "ERC-BioSim", totalAmount: 80000, spent: 12000, 
                        expiryDate: "2026-06-30", startDate: "2025-07-01", funder: "ERC", 
                        status: "active", pi: "Dr. Dupont",
                        description: "Simulation de systèmes biologiques complexes",
                        projectId: "p1"
                    }
                ];
                setGrants(initialGrants);
                setSelectedGrantId(initialGrants[0].id);
                for (const g of initialGrants) {
                    await saveModuleItem('hugin_grants', g);
                }
            }

            if (eData) {
                setExpenses(eData);
            }
        };
        loadFinanceData();
    }, []);

    const handleSaveProject = async (project: BudgetProject) => {
        try {
            await saveModuleItem('hugin_budget_projects', project);
            if (projects.find(p => p.id === project.id)) {
                setProjects(projects.map(p => p.id === project.id ? project : p));
                showToast('Projet mis à jour', 'success');
            } else {
                setProjects([...projects, project]);
                setSelectedProjectId(project.id);
                showToast('Projet créé', 'success');
            }
            setIsAddingProject(false);
            setEditingProject(null);
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (projects.length === 1) {
            showToast('Impossible de supprimer le dernier projet', 'error');
            return;
        }
        
        if (confirm('Supprimer ce projet et toutes ses données (grants et dépenses) ?')) {
            try {
                await deleteModuleItem('hugin_budget_projects', id);
                setProjects(projects.filter(p => p.id !== id));
                
                // Supprimer tous les grants et dépenses du projet
                const projectGrants = grants.filter(g => g.projectId === id);
                for (const grant of projectGrants) {
                    await deleteModuleItem('hugin_grants', grant.id);
                }
                setGrants(grants.filter(g => g.projectId !== id));
                
                const projectExpenses = expenses.filter(e => e.projectId === id);
                for (const exp of projectExpenses) {
                    await deleteModuleItem('hugin_expenses', exp.id);
                }
                setExpenses(expenses.filter(e => e.projectId !== id));
                
                // Sélectionner un autre projet
                const remainingProjects = projects.filter(p => p.id !== id);
                if (remainingProjects.length > 0) {
                    setSelectedProjectId(remainingProjects[0].id);
                }
                
                showToast('Projet supprimé', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const handleUpdateExpenseStatus = async (expenseId: string, newStatus: 'pending' | 'approved' | 'paid') => {
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense) return;

        const oldStatus = expense.status;
        const updatedExpense = { ...expense, status: newStatus };

        try {
            await saveModuleItem('hugin_expenses', updatedExpense);
            setExpenses(expenses.map(e => e.id === expenseId ? updatedExpense : e));

            // Mettre à jour le montant dépensé du grant
            const grant = grants.find(g => g.id === expense.grantId);
            if (grant) {
                let newSpent = grant.spent;
                
                // Si on passe de non-payé à payé, ajouter le montant
                if (oldStatus !== 'paid' && newStatus === 'paid') {
                    newSpent += expense.amount;
                }
                // Si on passe de payé à non-payé, retirer le montant
                else if (oldStatus === 'paid' && newStatus !== 'paid') {
                    newSpent -= expense.amount;
                }

                if (newSpent !== grant.spent) {
                    const updatedGrant = { ...grant, spent: newSpent };
                    await saveModuleItem('hugin_grants', updatedGrant);
                    setGrants(grants.map(g => g.id === expense.grantId ? updatedGrant : g));
                }
            }

            showToast('Statut mis à jour', 'success');
        } catch (e) {
            showToast('Erreur de mise à jour', 'error');
        }
    };

    const handleAddExpense = async (expense: Expense) => {
        try {
            await saveModuleItem('hugin_expenses', expense);
            setExpenses([expense, ...expenses]);

            const grant = grants.find(g => g.id === expense.grantId);
            if (grant && expense.status === 'paid') {
                const updatedGrant = { ...grant, spent: grant.spent + expense.amount };
                await saveModuleItem('hugin_grants', updatedGrant);
                setGrants(grants.map(g => g.id === expense.grantId ? updatedGrant : g));
            }

            setIsAddingExpense(false);
            showToast('Dépense enregistrée', 'success');
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleDeleteExpense = async (id: string) => {
        const expense = expenses.find(e => e.id === id);
        if (!expense) return;

        if (confirm('Supprimer cette dépense ?')) {
            try {
                await deleteModuleItem('hugin_expenses', id);
                setExpenses(expenses.filter(e => e.id !== id));

                const grant = grants.find(g => g.id === expense.grantId);
                if (grant && expense.status === 'paid') {
                    const updatedGrant = { ...grant, spent: grant.spent - expense.amount };
                    await saveModuleItem('hugin_grants', updatedGrant);
                    setGrants(grants.map(g => g.id === expense.grantId ? updatedGrant : g));
                }
                showToast('Dépense supprimée', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const handleSaveGrant = async (grant: Grant) => {
        try {
            await saveModuleItem('hugin_grants', grant);
            if (grants.find(g => g.id === grant.id)) {
                setGrants(grants.map(g => g.id === grant.id ? grant : g));
                showToast('Grant mis à jour', 'success');
            } else {
                setGrants([...grants, grant]);
                showToast('Grant ajouté', 'success');
            }
            setIsAddingGrant(false);
            setEditingGrant(null);
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleDeleteGrant = async (id: string) => {
        if (confirm('Supprimer ce grant et toutes ses dépenses ?')) {
            try {
                await deleteModuleItem('hugin_grants', id);
                setGrants(grants.filter(g => g.id !== id));
                
                const grantExpenses = expenses.filter(e => e.grantId === id);
                for (const exp of grantExpenses) {
                    await deleteModuleItem('hugin_expenses', exp.id);
                }
                setExpenses(expenses.filter(e => e.grantId !== id));
                
                showToast('Grant supprimé', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Grant', 'Description', 'Catégorie', 'Montant', 'Statut', 'N° Facture'];
        const rows = expenses.map(e => {
            const grant = grants.find(g => g.id === e.grantId);
            return [
                e.date,
                grant?.name || '',
                e.description,
                e.category,
                e.amount,
                e.status,
                e.invoiceNumber || ''
            ];
        });
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('Export réussi', 'success');
    };

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
        const matchesProject = e.projectId === selectedProjectId;
        return matchesSearch && matchesCategory && matchesStatus && matchesProject;
    });

    const projectGrants = grants.filter(g => g.projectId === selectedProjectId);
    const projectExpenses = expenses.filter(e => e.projectId === selectedProjectId);
    
    const totalBudget = projectGrants.reduce((sum, g) => sum + g.totalAmount, 0);
    const totalSpent = projectGrants.reduce((sum, g) => sum + g.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const activeGrants = projectGrants.filter(g => g.status === 'active').length;
    const expiringGrants = projectGrants.filter(g => {
        const daysUntil = Math.floor((new Date(g.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 90 && g.status === 'active';
    }).length;

    const categories = ['Consommables', 'Équipement', 'Prestations', 'Voyages', 'Publications', 'Personnel', 'Autre'];
    const currentProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '1rem', color: '#10b981' }}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>BudgetFlow Pro</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {currentProject ? currentProject.name : 'Gestion financière'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Sélecteur de projet */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            style={{ 
                                padding: '0.6rem 1rem', 
                                borderRadius: '0.75rem', 
                                background: 'rgba(255,255,255,0.1)', 
                                border: '1px solid rgba(255,255,255,0.2)', 
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => setIsAddingProject(true)} 
                            className="btn" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                background: 'rgba(59, 130, 246, 0.2)', 
                                color: '#3b82f6',
                                padding: '0.6rem'
                            }}
                            title="Nouveau projet"
                        >
                            <Plus size={18} />
                        </button>
                        {projects.length > 1 && (
                            <button 
                                onClick={() => setEditingProject(currentProject || null)} 
                                className="btn" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.6rem'
                                }}
                                title="Gérer les projets"
                            >
                                <Edit2 size={18} />
                            </button>
                        )}
                    </div>
                    {view === 'overview' && (
                        <>
                            <button onClick={() => setIsAddingGrant(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
                                <Plus size={18} /> Nouveau Grant
                            </button>
                            <button onClick={() => setIsAddingExpense(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                                <Plus size={18} /> Nouvelle Dépense
                            </button>
                        </>
                    )}
                    {view === 'expenses' && (
                        <>
                            <button onClick={exportToCSV} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                                <Download size={18} /> Export CSV
                            </button>
                            <button onClick={() => setIsAddingExpense(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
                                <Plus size={18} /> Nouvelle Dépense
                            </button>
                        </>
                    )}
                    {view === 'grants' && (
                        <button onClick={() => setIsAddingGrant(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
                            <Plus size={18} /> Nouveau Grant
                        </button>
                    )}
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '2rem' }}>
                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Stats rapides */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vue d'ensemble</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Budget Total</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{totalBudget.toLocaleString()} €</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Dépensé</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{totalSpent.toLocaleString()} €</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Restant</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{totalRemaining.toLocaleString()} €</div>
                            </div>
                        </div>
                    </div>

                    {/* Alertes */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> Alertes
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <CheckCircle size={14} />
                                    {activeGrants} grant(s) actif(s)
                                </div>
                            </div>
                            {expiringGrants > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Clock size={14} />
                                        {expiringGrants} expire(nt) bientôt
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filtres (pour vue dépenses) */}
                    {view === 'expenses' && (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} /> Filtres
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                >
                                    <option value="all">Toutes catégories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                >
                                    <option value="all">Tous statuts</option>
                                    <option value="pending">En attente</option>
                                    <option value="approved">Approuvé</option>
                                    <option value="paid">Payé</option>
                                </select>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main>
                    {/* View Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: <PieChart size={16} /> },
                            { id: 'expenses', label: 'Dépenses', icon: <FileText size={16} /> },
                            { id: 'grants', label: 'Grants', icon: <Target size={16} /> },
                            { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id as any)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: view === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: view === tab.id ? '#10b981' : 'var(--text-secondary)',
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

                    {/* Vue d'ensemble */}
                    {view === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Graphique principal */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <PieChart size={20} color="#10b981" /> Répartition Globale du Budget
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Plotly
                                        data={[{
                                            values: [totalSpent, totalRemaining],
                                            labels: ['Dépensé', 'Restant'],
                                            type: 'pie',
                                            marker: { colors: ['#ef4444', '#10b981'] },
                                            textinfo: 'label+percent',
                                            hole: 0.4
                                        }]}
                                        layout={{
                                            width: 500, height: 400,
                                            paper_bgcolor: 'transparent',
                                            plot_bgcolor: 'transparent',
                                            font: { color: 'white', size: 14 },
                                            showlegend: false,
                                            margin: { t: 20, b: 20, l: 20, r: 20 }
                                        }}
                                        config={{ displayModeBar: false }}
                                    />
                                </div>
                            </div>

                            {/* Grants actifs */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Target size={20} color="#10b981" /> Grants Actifs
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                                    {projectGrants.filter(g => g.status === 'active').map(grant => {
                                        const percentage = (grant.spent / grant.totalAmount) * 100;
                                        const daysRemaining = Math.floor((new Date(grant.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <div key={grant.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{grant.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{grant.funder} • PI: {grant.pi}</div>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: daysRemaining < 90 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: daysRemaining < 90 ? '#f59e0b' : '#10b981', borderRadius: '0.5rem' }}>
                                                        {daysRemaining}j restants
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                        <span>{percentage.toFixed(1)}% utilisé</span>
                                                        <span>{grant.spent.toLocaleString()} / {grant.totalAmount.toLocaleString()} €</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${percentage}%`, height: '100%', background: percentage > 90 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981', transition: 'width 0.3s' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                    <div style={{ flex: 1, padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Restant</div>
                                                        <div style={{ fontWeight: 700, color: '#10b981' }}>{(grant.totalAmount - grant.spent).toLocaleString()} €</div>
                                                    </div>
                                                    <div style={{ flex: 1, padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Dépenses</div>
                                                        <div style={{ fontWeight: 700, color: '#3b82f6' }}>{expenses.filter(e => e.grantId === grant.id).length}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vue Dépenses */}
                    {view === 'expenses' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                        <th style={{ padding: '1rem' }}>Description</th>
                                        <th style={{ padding: '1rem' }}>Grant</th>
                                        <th style={{ padding: '1rem' }}>Catégorie</th>
                                        <th style={{ padding: '1rem' }}>Montant</th>
                                        <th style={{ padding: '1rem' }}>Statut</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                                Aucune dépense trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                                            const grant = projectGrants.find(g => g.id === expense.grantId);
                                            return (
                                                <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontSize: '0.9rem' }}>{new Date(expense.date).toLocaleDateString()}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{expense.description}</div>
                                                        {expense.invoiceNumber && (
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Facture: {expense.invoiceNumber}</div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.5rem' }}>
                                                            {grant?.name || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.8rem' }}>{expense.category}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444' }}>
                                                            {expense.amount.toLocaleString()} €
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.5rem',
                                                            background: expense.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : expense.status === 'approved' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                            color: expense.status === 'paid' ? '#10b981' : expense.status === 'approved' ? '#3b82f6' : '#f59e0b'
                                                        }}>
                                                            {expense.status === 'paid' ? 'Payé' : expense.status === 'approved' ? 'Approuvé' : 'En attente'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            {expense.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')} 
                                                                    className="btn-icon" 
                                                                    style={{ opacity: 0.8, color: '#3b82f6', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                    title="Approuver"
                                                                >
                                                                    Approuver
                                                                </button>
                                                            )}
                                                            {(expense.status === 'pending' || expense.status === 'approved') && (
                                                                <button 
                                                                    onClick={() => handleUpdateExpenseStatus(expense.id, 'paid')} 
                                                                    className="btn-icon" 
                                                                    style={{ opacity: 0.8, color: '#10b981', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                    title="Marquer comme payé"
                                                                >
                                                                    Payer
                                                                </button>
                                                            )}
                                                            {expense.status === 'paid' && (
                                                                <button 
                                                                    onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')} 
                                                                    className="btn-icon" 
                                                                    style={{ opacity: 0.6, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                    title="Repasser en approuvé"
                                                                >
                                                                    Annuler
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDeleteExpense(expense.id)} className="btn-icon" style={{ opacity: 0.6, color: '#ef4444' }} title="Supprimer">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Vue Grants */}
                    {view === 'grants' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Nom</th>
                                        <th style={{ padding: '1rem' }}>Financeur</th>
                                        <th style={{ padding: '1rem' }}>PI</th>
                                        <th style={{ padding: '1rem' }}>Budget</th>
                                        <th style={{ padding: '1rem' }}>Dépensé</th>
                                        <th style={{ padding: '1rem' }}>Période</th>
                                        <th style={{ padding: '1rem' }}>Statut</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectGrants.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                                Aucun grant enregistré.
                                            </td>
                                        </tr>
                                    ) : (
                                        projectGrants.map(grant => {
                                            const percentage = (grant.spent / grant.totalAmount) * 100;
                                            return (
                                                <tr key={grant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{grant.name}</div>
                                                        {grant.description && (
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>{grant.description.substring(0, 50)}...</div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.9rem' }}>{grant.funder}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.9rem' }}>{grant.pi}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 700 }}>{grant.totalAmount.toLocaleString()} €</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: 600, color: '#ef4444' }}>{grant.spent.toLocaleString()} €</span>
                                                            <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.7 }}>({percentage.toFixed(1)}%)</span>
                                                        </div>
                                                        <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${percentage}%`, height: '100%', background: percentage > 90 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981' }} />
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            {new Date(grant.startDate).toLocaleDateString()} - {new Date(grant.expiryDate).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '0.5rem',
                                                            background: grant.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : grant.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                            color: grant.status === 'active' ? '#10b981' : grant.status === 'completed' ? '#3b82f6' : '#f59e0b'
                                                        }}>
                                                            {grant.status === 'active' ? 'Actif' : grant.status === 'completed' ? 'Terminé' : 'En attente'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => setEditingGrant(grant)} className="btn-icon" style={{ opacity: 0.6 }} title="Modifier">
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteGrant(grant.id)} className="btn-icon" style={{ opacity: 0.6, color: '#ef4444' }} title="Supprimer">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Vue Statistiques */}
                    {view === 'stats' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            {/* Dépenses par catégorie */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <BarChart3 size={20} color="#10b981" /> Dépenses par Catégorie
                                </h3>
                                <Plotly
                                    data={[{
                                        x: categories,
                                        y: categories.map(cat => projectExpenses.filter(e => e.category === cat && e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)),
                                        type: 'bar',
                                        marker: { color: '#10b981' }
                                    }]}
                                    layout={{
                                        width: 500, height: 350,
                                        paper_bgcolor: 'transparent',
                                        plot_bgcolor: 'transparent',
                                        font: { color: 'white' },
                                        xaxis: { title: { text: 'Catégorie' } },
                                        yaxis: { title: { text: 'Montant (€)' } },
                                        margin: { t: 20, b: 80, l: 60, r: 20 }
                                    }}
                                    config={{ displayModeBar: false }}
                                />
                            </div>

                            {/* Évolution mensuelle */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TrendingUp size={20} color="#3b82f6" /> Évolution Mensuelle
                                </h3>
                                <Plotly
                                    data={[{
                                        x: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                                        y: Array.from({ length: 12 }, (_, i) => {
                                            const month = i + 1;
                                            return projectExpenses.filter(e => {
                                                const expMonth = new Date(e.date).getMonth() + 1;
                                                return expMonth === month && e.status === 'paid';
                                            }).reduce((sum, e) => sum + e.amount, 0);
                                        }),
                                        type: 'scatter',
                                        mode: 'lines+markers',
                                        line: { color: '#3b82f6', width: 3 },
                                        marker: { size: 8, color: '#3b82f6' }
                                    }]}
                                    layout={{
                                        width: 500, height: 350,
                                        paper_bgcolor: 'transparent',
                                        plot_bgcolor: 'transparent',
                                        font: { color: 'white' },
                                        xaxis: { title: { text: 'Mois' } },
                                        yaxis: { title: { text: 'Dépenses (€)' } },
                                        margin: { t: 20, b: 60, l: 60, r: 20 }
                                    }}
                                    config={{ displayModeBar: false }}
                                />
                            </div>

                            {/* Répartition par grant */}
                            <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1/-1' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Target size={20} color="#ef4444" /> Répartition par Grant
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Plotly
                                        data={[{
                                            values: projectGrants.map(g => g.spent),
                                            labels: projectGrants.map(g => g.name),
                                            type: 'pie',
                                            textinfo: 'label+percent',
                                            marker: {
                                                colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                                            }
                                        }]}
                                        layout={{
                                            width: 600, height: 400,
                                            paper_bgcolor: 'transparent',
                                            plot_bgcolor: 'transparent',
                                            font: { color: 'white', size: 12 },
                                            showlegend: true,
                                            legend: { orientation: 'h', x: 0, y: -0.2 },
                                            margin: { t: 20, b: 80, l: 20, r: 20 }
                                        }}
                                        config={{ displayModeBar: false }}
                                    />
                                </div>
                            </div>

                            {/* Métriques clés */}
                            <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1/-1' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Métriques Clés</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dépense Moyenne</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                                            {projectExpenses.length > 0 ? Math.round(projectExpenses.reduce((sum, e) => sum + e.amount, 0) / projectExpenses.length).toLocaleString() : 0} €
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Dépenses</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3b82f6' }}>{projectExpenses.length}</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>En Attente</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                                            {projectExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0).toLocaleString()} €
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Taux d'utilisation</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>
                                            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {isAddingExpense && (
                <ExpenseModal
                    grants={projectGrants}
                    selectedGrantId={projectGrants.length > 0 ? projectGrants[0].id : ''}
                    projectId={selectedProjectId}
                    onClose={() => setIsAddingExpense(false)}
                    onSave={handleAddExpense}
                />
            )}

            {(isAddingGrant || editingGrant) && (
                <GrantModal
                    grant={editingGrant}
                    projectId={selectedProjectId}
                    onClose={() => { setIsAddingGrant(false); setEditingGrant(null); }}
                    onSave={handleSaveGrant}
                />
            )}

            {(isAddingProject || editingProject) && (
                <ProjectModal
                    project={editingProject}
                    projects={projects}
                    onClose={() => { setIsAddingProject(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                    onDelete={handleDeleteProject}
                />
            )}
        </div>
    );
};

const ExpenseModal = ({ grants, selectedGrantId, projectId, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Expense>({
        id: Date.now().toString(),
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Consommables',
        grantId: selectedGrantId || (grants.length > 0 ? grants[0].id : ''),
        status: 'pending',
        invoiceNumber: '',
        projectId: projectId
    });

    const categories = ['Consommables', 'Équipement', 'Prestations', 'Voyages', 'Publications', 'Personnel', 'Autre'];

    if (grants.length === 0) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Aucun Grant Disponible</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                    </div>
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                        <AlertTriangle size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
                        <p>Vous devez d'abord créer un grant avant de pouvoir enregistrer des dépenses.</p>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={onClose} className="btn" style={{ background: '#10b981' }}>Compris</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Enregistrer une Dépense</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Projet / Grant *</label>
                        <select
                            value={formData.grantId}
                            onChange={(e) => {
                                const newGrantId = e.target.value;
                                const grant = grants.find((g: Grant) => g.id === newGrantId);
                                setFormData({ ...formData, grantId: newGrantId, projectId: grant?.projectId || '' });
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            {grants.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description *</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Achat Taq Polymerase..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Montant (€) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Catégorie *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Statut *</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvé</option>
                            <option value="paid">Payé</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Numéro de facture</label>
                        <input
                            type="text"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            placeholder="Ex: INV-2026-001"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#10b981', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

const GrantModal = ({ grant, projectId, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Grant>(grant || {
        id: Date.now().toString(),
        name: '',
        totalAmount: 0,
        spent: 0,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        funder: '',
        status: 'pending',
        pi: '',
        description: '',
        projectId: projectId
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{grant ? 'Modifier le Grant' : 'Nouveau Grant'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Nom du grant *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: ANR-CRISPR-2026"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Financeur *</label>
                        <input
                            type="text"
                            value={formData.funder}
                            onChange={(e) => setFormData({ ...formData, funder: e.target.value })}
                            placeholder="Ex: ANR, ERC, FRM..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Investigateur Principal *</label>
                        <input
                            type="text"
                            value={formData.pi}
                            onChange={(e) => setFormData({ ...formData, pi: e.target.value })}
                            placeholder="Ex: Dr. Martin"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Budget Total (€) *</label>
                        <input
                            type="number"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Statut *</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            <option value="pending">En attente</option>
                            <option value="active">Actif</option>
                            <option value="completed">Terminé</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date de début *</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date de fin *</label>
                        <input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Description du projet de recherche..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#10b981', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectModal = ({ project, projects, onClose, onSave, onDelete }: any) => {
    const [formData, setFormData] = useState<BudgetProject>(project || {
        id: Date.now().toString(),
        name: '',
        description: '',
        createdDate: new Date().toISOString().split('T')[0],
        color: '#10b981'
    });

    const colors = [
        { value: '#10b981', label: 'Vert' },
        { value: '#3b82f6', label: 'Bleu' },
        { value: '#f59e0b', label: 'Orange' },
        { value: '#ef4444', label: 'Rouge' },
        { value: '#8b5cf6', label: 'Violet' },
        { value: '#ec4899', label: 'Rose' }
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        {project ? 'Gérer le Projet' : 'Nouveau Projet Budgétaire'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Nom du projet *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Laboratoire Principal, Projet ANR..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Description du projet budgétaire..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Couleur</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                            {colors.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => setFormData({ ...formData, color: c.value })}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        background: c.value,
                                        border: formData.color === c.value ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {project && projects.length > 1 && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 600 }}>Zone de danger</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                La suppression du projet supprimera également tous les grants et dépenses associés.
                            </div>
                            <button 
                                onClick={() => onDelete(project.id)} 
                                className="btn" 
                                style={{ background: '#ef4444', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Trash2 size={18} /> Supprimer le Projet
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#10b981', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> {project ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GrantBudget;
