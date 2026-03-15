import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { useToast } from '../../components/ToastContext';
import { 
    ChevronLeft, Plus, Download, Upload,
    Beaker, Search, Grid as GridIcon, List,
    Edit, Trash2, History as LucideHistory, Snowflake, Flame, Calendar,
    AlertCircle, Activity, Clock
} from 'lucide-react';
import { CultureModal, MilieuModal, CryoModal, HistoryModal } from '../../components/CultureModals';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

export interface HistoryEntry {
    id: string;
    date: string;
    type: 'creation' | 'repiquage' | 'cryo' | 'reprise' | 'modification';
    details: any;
}

export interface Milieu {
    id: string;
    nom: string;
    type: string;
    fournisseur: string;
    dateAjout: string;
    composition: string;
    proprietes: string;
    stockage: string;
    notes: string;
}

export interface Culture {
    id: string;
    nom: string;
    date: string;
    lastRepiquage: string;
    intervalle: number;
    passage: number;
    statut: 'active' | 'terminée' | 'cryoconservée';
    milieuId: string;
    notes: string;
    conditions: string[];
    cryoDate?: string;
    cryoDuration?: number;
    cryoLocation?: string;
    cryoAgent?: string;
    cryoNotes?: string;
    history: HistoryEntry[];
}

const CultureCells = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { showToast } = useToast();
    
    const [cultures, setCultures] = useState<Culture[]>([]);
    const [milieux, setMilieux] = useState<Milieu[]>([]);
    const [activeTab, setActiveTab] = useState<'cultures' | 'milieux' | 'cryo'>('cultures');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'active' | 'repiquage'>('all');
    
    // Modals
    const [showCultureModal, setShowCultureModal] = useState(false);
    const [showMilieuModal, setShowMilieuModal] = useState(false);
    const [showCryoModal, setShowCryoModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [editingCulture, setEditingCulture] = useState<Culture | null>(null);
    const [editingMilieu, setEditingMilieu] = useState<Milieu | null>(null);
    const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
    
    const c = theme.colors;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const culturesData = await fetchModuleData('cultures');
            const milieuxData = await fetchModuleData('milieux');
            if (culturesData) setCultures(culturesData);
            if (milieuxData) setMilieux(milieuxData);
        } catch (error) {
            console.error('Erreur chargement:', error);
            showToast('Erreur lors du chargement des données', 'error');
        }
    };

    const schedulePlanningEvent = async (culture: Culture, nextDateStr: string) => {
        const eventData = {
            id: Date.now().toString(),
            title: `Repiquage : ${culture.nom}`,
            resource: 'Salle de Culture A',
            time: '09:00',
            date: nextDateStr,
            module: 'Cultures Cellulaires',
            reminder: true,
            priority: 'importante',
            objective: `Passage de la lignée ${culture.nom}. Passage P${culture.passage}.`,
            safetyChecked: false,
            archived: false
        };

        try {
            await saveModuleItem('planning', eventData);
        } catch (error) {
            console.error('Error scheduling planning event:', error);
        }
    };

    // CRUD Cultures
    const addCulture = async (data: any) => {
        const newCulture: Culture = {
            ...data,
            id: Date.now().toString(),
            history: [{
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'creation',
                details: { nom: data.nom }
            }]
        };
        
        setCultures(prev => [...prev, newCulture]);
        showToast('Culture ajoutée', 'success');
        
        const nextDate = new Date(newCulture.date);
        nextDate.setDate(nextDate.getDate() + (newCulture.intervalle || 3));
        await schedulePlanningEvent(newCulture, nextDate.toISOString().split('T')[0]);
        
        await saveModuleItem('cultures', newCulture);
    };

    const updateCulture = async (id: string, updates: Partial<Culture>) => {
        const updatedCultures = cultures.map(c => {
            if (c.id === id) {
                const updated = { ...c, ...updates };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'modification',
                    details: updates
                }];
                return updated;
            }
            return c;
        });
        
        setCultures(updatedCultures);
        showToast('Culture mise à jour', 'success');
        
        const updated = updatedCultures.find(c => c.id === id);
        if (updated) {
            await saveModuleItem('cultures', updated);
        }
    };

    const deleteCulture = async (id: string) => {
        if (!confirm('Supprimer cette culture ?')) return;
        
        setCultures(prev => prev.filter(c => c.id !== id));
        showToast('Culture supprimée', 'success');
        await deleteModuleItem('cultures', id);
    };

    const repiquerCulture = async (id: string) => {
        const culture = cultures.find(c => c.id === id);
        if (!culture) return;
        
        const today = new Date().toISOString().split('T')[0];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + culture.intervalle);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        const updatedCultures = cultures.map(c => {
            if (c.id === id) {
                const updated = { 
                    ...c, 
                    lastRepiquage: today,
                    passage: c.passage + 1
                };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'repiquage',
                    details: { passage: updated.passage }
                }];
                return updated;
            }
            return c;
        });
        
        setCultures(updatedCultures);
        showToast(`Culture repiquée (P${culture.passage + 1})`, 'success');
        await schedulePlanningEvent(culture, nextDateStr);
        
        const updated = updatedCultures.find(c => c.id === id);
        if (updated) {
            await saveModuleItem('cultures', updated);
        }
    };

    const cryopreserverCulture = async (cultureId: string, cryoData: any) => {
        const updatedCultures = cultures.map(c => {
            if (c.id === cultureId) {
                const updated = { 
                    ...c, 
                    statut: 'cryoconservée' as const,
                    cryoDate: new Date().toISOString(),
                    ...cryoData
                };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'cryo',
                    details: cryoData
                }];
                return updated;
            }
            return c;
        });
        
        setCultures(updatedCultures);
        showToast('Culture cryoconservée', 'success');
        
        const updated = updatedCultures.find(c => c.id === cultureId);
        if (updated) {
            await saveModuleItem('cultures', updated);
        }
    };

    const reprendreCulture = async (id: string) => {
        const updatedCultures = cultures.map(c => {
            if (c.id === id) {
                const updated = { ...c, statut: 'active' as const };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'reprise',
                    details: { from: 'cryo' }
                }];
                return updated;
            }
            return c;
        });
        
        setCultures(updatedCultures);
        showToast('Culture reprise', 'success');
        
        const updated = updatedCultures.find(c => c.id === id);
        if (updated) {
            await saveModuleItem('cultures', updated);
        }
    };

    // CRUD Milieux
    const addMilieu = async (data: any) => {
        const newMilieu: Milieu = {
            ...data,
            id: Date.now().toString(),
            dateAjout: new Date().toISOString()
        };
        
        setMilieux(prev => [...prev, newMilieu]);
        showToast('Milieu ajouté', 'success');
        await saveModuleItem('milieux', newMilieu);
    };

    const deleteMilieu = async (id: string) => {
        if (!confirm('Supprimer ce milieu ?')) return;
        
        setMilieux(prev => prev.filter(m => m.id !== id));
        showToast('Milieu supprimé', 'success');
        await deleteModuleItem('milieux', id);
    };

    // Export/Import
    const exportData = () => {
        const data = { cultures, milieux, exportDate: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cultures_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Données exportées', 'success');
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.cultures && data.milieux) {
                    setCultures(data.cultures);
                    setMilieux(data.milieux);
                    showToast('Données importées', 'success');
                }
            } catch (error) {
                showToast('Erreur lors de l\'import', 'error');
            }
        };
        reader.readAsText(file);
    };

    // Stats
    const stats = {
        total: cultures.length,
        active: cultures.filter(c => c.statut === 'active').length,
        cryo: cultures.filter(c => c.statut === 'cryoconservée').length,
        repiquage: cultures.filter(c => {
            if (c.statut !== 'active') return false;
            const referenceDate = new Date(c.lastRepiquage || c.date);
            const today = new Date();
            const daysSince = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSince >= c.intervalle;
        }).length
    };

    const filteredCultures = cultures.filter(culture => {
        if (searchQuery && !culture.nom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        if (filterMode === 'active' && culture.statut !== 'active') return false;
        if (filterMode === 'repiquage') {
            if (culture.statut !== 'active') return false;
            const referenceDate = new Date(culture.lastRepiquage || culture.date);
            const today = new Date();
            const daysSince = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince < culture.intervalle) return false;
        }
        
        if (activeTab === 'cryo' && culture.statut !== 'cryoconservée') return false;
        if (activeTab === 'cultures' && culture.statut === 'cryoconservée') return false;
        
        return true;
    });

    const getDaysSinceRepiquage = (culture: Culture) => {
        const referenceDate = new Date(culture.lastRepiquage || culture.date);
        const today = new Date();
        return Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getRepiquageStatus = (culture: Culture) => {
        if (culture.statut !== 'active') return 'none';
        const days = getDaysSinceRepiquage(culture);
        if (days >= culture.intervalle) return 'urgent';
        if (days >= culture.intervalle * 0.8) return 'warning';
        return 'ok';
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: c.bgPrimary, 
            color: c.textPrimary,
            paddingTop: '80px',
            fontFamily: 'var(--font-family)'
        }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: c.bgSecondary,
                borderBottom: `1px solid ${c.borderColor}`,
                padding: '1.5rem 2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/hugin')}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: c.textPrimary,
                                padding: '0.6rem',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(102, 126, 234, 0.2)',
                                borderRadius: '1rem',
                                color: '#667eea'
                            }}>
                                <Beaker size={24} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                                    Gestionnaire de Cultures Cellulaires
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: c.textSecondary, fontWeight: 600 }}>
                                    SUIVI ET GESTION SCIENTIFIQUE
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            padding: '0.3rem',
                            background: c.cardBg,
                            borderRadius: '0.75rem',
                            border: `1px solid ${c.borderColor}`
                        }}>
                            <button
                                onClick={() => setActiveTab('cultures')}
                                style={{
                                    background: activeTab === 'cultures' ? c.accentPrimary : 'transparent',
                                    color: activeTab === 'cultures' ? 'white' : c.textPrimary,
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Beaker size={16} /> Cultures
                            </button>
                            <button
                                onClick={() => setActiveTab('milieux')}
                                style={{
                                    background: activeTab === 'milieux' ? c.accentPrimary : 'transparent',
                                    color: activeTab === 'milieux' ? 'white' : c.textPrimary,
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Activity size={16} /> Milieux
                            </button>
                        </div>

                        <button style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={() => {
                            setEditingCulture(null);
                            setShowCultureModal(true);
                        }}
                        >
                            <Plus size={18} /> Souche
                        </button>

                        <button style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={() => {
                            setEditingMilieu(null);
                            setShowMilieuModal(true);
                        }}
                        >
                            <Plus size={18} /> Milieu
                        </button>

                        <button style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={() => setShowCryoModal(true)}
                        >
                            <Snowflake size={18} /> Cryo
                        </button>

                        <button style={{
                            background: c.cardBg,
                            color: c.textPrimary,
                            border: `1px solid ${c.borderColor}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={exportData}
                        >
                            <Download size={18} /> Export
                        </button>

                        <label style={{
                            background: c.cardBg,
                            color: c.textPrimary,
                            border: `1px solid ${c.borderColor}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Upload size={18} /> Import
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={importData}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {/* Stats Bar */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    background: c.bgSecondary,
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${c.borderColor}`
                }}>
                    <div 
                        onClick={() => setFilterMode('all')}
                        style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: c.cardBg,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            border: `2px solid ${filterMode === 'all' ? c.accentPrimary : 'transparent'}`
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: c.accentPrimary }}>{stats.total}</div>
                        <div style={{ color: c.textSecondary, fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>Cultures totales</div>
                    </div>

                    <div 
                        onClick={() => setFilterMode('active')}
                        style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: c.cardBg,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            border: `2px solid ${filterMode === 'active' ? c.accentPrimary : 'transparent'}`
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38ef7d' }}>{stats.active}</div>
                        <div style={{ color: c.textSecondary, fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>Cultures actives</div>
                    </div>

                    <div 
                        onClick={() => setActiveTab('cryo')}
                        style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: c.cardBg,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#60a5fa' }}>{stats.cryo}</div>
                        <div style={{ color: c.textSecondary, fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>Cryoconservées</div>
                    </div>

                    <div 
                        onClick={() => setFilterMode('repiquage')}
                        style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: c.cardBg,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            border: `2px solid ${filterMode === 'repiquage' ? c.accentPrimary : 'transparent'}`
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{stats.repiquage}</div>
                        <div style={{ color: c.textSecondary, fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>À repiquer</div>
                    </div>
                </div>

                {/* View Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    background: c.bgSecondary,
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${c.borderColor}`
                }}>
                    <div style={{ flex: 1, minWidth: '250px', maxWidth: '400px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: c.accentPrimary }} />
                        <input
                            type="text"
                            placeholder="Rechercher une souche..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${c.borderColor}`,
                                background: c.cardBg,
                                color: c.textPrimary,
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                background: viewMode === 'grid' ? c.accentPrimary : c.cardBg,
                                color: viewMode === 'grid' ? 'white' : c.textPrimary,
                                border: `1px solid ${c.borderColor}`,
                                cursor: 'pointer'
                            }}
                        >
                            <GridIcon size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                background: viewMode === 'list' ? c.accentPrimary : c.cardBg,
                                color: viewMode === 'list' ? 'white' : c.textPrimary,
                                border: `1px solid ${c.borderColor}`,
                                cursor: 'pointer'
                            }}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'cultures' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                        gap: '1.5rem'
                    }}>
                        {filteredCultures.map(culture => {
                            const status = getRepiquageStatus(culture);
                            const milieu = milieux.find(m => m.id === culture.milieuId);
                            
                            return (
                                <div key={culture.id} style={{
                                    background: c.bgSecondary,
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '4px',
                                        height: '100%',
                                        background: status === 'urgent' ? '#ef4444' : status === 'warning' ? '#f59e0b' : c.accentPrimary
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{culture.nom}</h3>
                                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: c.textSecondary, fontWeight: 700 }}>
                                                PASSAGE P{culture.passage}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => { setSelectedCulture(culture); setShowHistoryModal(true); }}
                                                style={{ background: 'none', border: 'none', color: c.textSecondary, cursor: 'pointer' }}
                                            >
                                                <LucideHistory size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setEditingCulture(culture); setShowCultureModal(true); }}
                                                style={{ background: 'none', border: 'none', color: c.textSecondary, cursor: 'pointer' }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => deleteCulture(culture.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <Activity size={16} style={{ color: c.accentPrimary }} />
                                            <span>Milieu: <strong>{milieu?.nom || 'Non spécifié'}</strong></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <Calendar size={16} style={{ color: c.accentPrimary }} />
                                            <span>Dernier passage: {new Date(culture.lastRepiquage || culture.date).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <Clock size={16} style={{ color: c.accentPrimary }} />
                                            <span>Age: {getDaysSinceRepiquage(culture)} jours / {culture.intervalle} j</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => repiquerCulture(culture.id)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            background: status === 'urgent' ? '#ef4444' : c.accentPrimary,
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        <Flame size={18} /> Marquer passage
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'milieux' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {milieux.map(milieu => (
                            <div key={milieu.id} style={{
                                background: c.bgSecondary,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                border: `1px solid ${c.borderColor}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{milieu.nom}</h3>
                                    <button 
                                        onClick={() => deleteMilieu(milieu.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '0.5rem' }}>Type: {milieu.type}</p>
                                <p style={{ fontSize: '0.85rem', color: c.textSecondary }}>Fournisseur: {milieu.fournisseur}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'cryo' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredCultures.map(culture => (
                            <div key={culture.id} style={{
                                background: c.bgSecondary,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                border: `1px solid ${c.borderColor}`,
                                borderLeft: `4px solid #60a5fa`
                            }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800 }}>{culture.nom}</h3>
                                <div style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '1.5rem' }}>
                                    <p style={{ margin: '0 0 0.5rem 0' }}>Emplacement: {culture.cryoLocation}</p>
                                    <p style={{ margin: '0' }}>Date: {new Date(culture.cryoDate || '').toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => reprendreCulture(culture.id)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        background: '#60a5fa',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Snowflake size={18} /> Reprendre culture
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <CultureModal
                show={showCultureModal}
                onClose={() => {
                    setShowCultureModal(false);
                    setEditingCulture(null);
                }}
                onSave={(data: any) => {
                    if (editingCulture) updateCulture(editingCulture.id, data);
                    else addCulture(data);
                }}
                editing={editingCulture}
                milieux={milieux}
                theme={theme}
            />

            <MilieuModal
                show={showMilieuModal}
                onClose={() => setShowMilieuModal(false)}
                onSave={addMilieu}
                theme={theme}
            />

            <CryoModal
                show={showCryoModal}
                onClose={() => setShowCryoModal(false)}
                onSave={cryopreserverCulture}
                cultures={cultures}
                theme={theme}
            />

            <HistoryModal
                show={showHistoryModal}
                onClose={() => {
                    setShowHistoryModal(false);
                    setSelectedCulture(null);
                }}
                culture={selectedCulture}
                theme={theme}
            />
        </div>
    );
};

export default CultureCells;
