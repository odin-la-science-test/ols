import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { useToast } from '../../components/ToastContext';
import { 
    ChevronLeft, Plus, Download, Upload,
    Beaker, Search, Grid as GridIcon, List,
    Edit, Trash2, History, Snowflake, Flame, Calendar,
    AlertCircle
} from 'lucide-react';
import { CultureModal, MilieuModal, CryoModal, HistoryModal } from '../../components/CultureModals';

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

export interface HistoryEntry {
    id: string;
    date: string;
    type: 'creation' | 'repiquage' | 'cryo' | 'reprise' | 'modification';
    details: any;
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

    // Charger les données depuis IndexedDB
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const db = await openDB();
            const culturesTx = db.transaction('cultures', 'readonly');
            const milieuxTx = db.transaction('milieux', 'readonly');
            
            const culturesRequest = culturesTx.objectStore('cultures').getAll();
            const milieuxRequest = milieuxTx.objectStore('milieux').getAll();
            
            culturesRequest.onsuccess = () => setCultures(culturesRequest.result);
            milieuxRequest.onsuccess = () => setMilieux(milieuxRequest.result);
        } catch (error) {
            console.error('Erreur chargement:', error);
            showToast('Erreur lors du chargement des données', 'error');
        }
    };

    const saveData = async () => {
        try {
            const db = await openDB();
            const tx = db.transaction(['cultures', 'milieux'], 'readwrite');
            
            const culturesStore = tx.objectStore('cultures');
            const milieuxStore = tx.objectStore('milieux');
            
            await culturesStore.clear();
            await milieuxStore.clear();
            
            for (const culture of cultures) {
                await culturesStore.add(culture);
            }
            for (const milieu of milieux) {
                await milieuxStore.add(milieu);
            }
            
            showToast('Données sauvegardées', 'success');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // IndexedDB
    const openDB = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('CultureCellsDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (!db.objectStoreNames.contains('cultures')) {
                    db.createObjectStore('cultures', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('milieux')) {
                    db.createObjectStore('milieux', { keyPath: 'id' });
                }
            };
        });
    };

    // CRUD Cultures
    const addCulture = async (culture: Omit<Culture, 'id' | 'history'>) => {
        const newCulture: Culture = {
            ...culture,
            id: Date.now().toString(),
            history: [{
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'creation',
                details: { nom: culture.nom }
            }]
        };
        
        setCultures(prev => [...prev, newCulture]);
        showToast('Culture ajoutée', 'success');
        
        try {
            const db = await openDB();
            await db.transaction('cultures', 'readwrite').objectStore('cultures').add(newCulture);
        } catch (error) {
            console.error('Erreur ajout:', error);
        }
    };

    const updateCulture = async (id: string, updates: Partial<Culture>) => {
        setCultures(prev => prev.map(c => {
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
        }));
        
        showToast('Culture mise à jour', 'success');
        
        try {
            const db = await openDB();
            const culture = cultures.find(c => c.id === id);
            if (culture) {
                await db.transaction('cultures', 'readwrite').objectStore('cultures').put({ ...culture, ...updates });
            }
        } catch (error) {
            console.error('Erreur mise à jour:', error);
        }
    };

    const deleteCulture = async (id: string) => {
        if (!confirm('Supprimer cette culture ?')) return;
        
        setCultures(prev => prev.filter(c => c.id !== id));
        showToast('Culture supprimée', 'success');
        
        try {
            const db = await openDB();
            await db.transaction('cultures', 'readwrite').objectStore('cultures').delete(id);
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const repiquerCulture = async (id: string) => {
        const culture = cultures.find(c => c.id === id);
        if (!culture) return;
        
        const updates = {
            lastRepiquage: new Date().toISOString(),
            passage: culture.passage + 1
        };
        
        setCultures(prev => prev.map(c => {
            if (c.id === id) {
                const updated = { ...c, ...updates };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'repiquage',
                    details: { passage: updated.passage }
                }];
                return updated;
            }
            return c;
        }));
        
        showToast(`Culture repiquée (P${updates.passage})`, 'success');
        
        try {
            const db = await openDB();
            const updatedCulture = { ...culture, ...updates };
            await db.transaction('cultures', 'readwrite').objectStore('cultures').put(updatedCulture);
        } catch (error) {
            console.error('Erreur repiquage:', error);
        }
    };

    const cryopreserverCulture = async (cultureId: string, cryoData: any) => {
        const culture = cultures.find(c => c.id === cultureId);
        if (!culture) return;
        
        const updates = {
            statut: 'cryoconservée' as const,
            cryoDate: new Date().toISOString(),
            ...cryoData
        };
        
        setCultures(prev => prev.map(c => {
            if (c.id === cultureId) {
                const updated = { ...c, ...updates };
                updated.history = [...c.history, {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'cryo',
                    details: cryoData
                }];
                return updated;
            }
            return c;
        }));
        
        showToast('Culture cryoconservée', 'success');
        
        try {
            const db = await openDB();
            const updatedCulture = { ...culture, ...updates };
            await db.transaction('cultures', 'readwrite').objectStore('cultures').put(updatedCulture);
        } catch (error) {
            console.error('Erreur cryo:', error);
        }
    };

    const reprendreCulture = async (id: string) => {
        setCultures(prev => prev.map(c => {
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
        }));
        
        showToast('Culture reprise', 'success');
    };

    // CRUD Milieux
    const addMilieu = async (milieu: Omit<Milieu, 'id'>) => {
        const newMilieu: Milieu = {
            ...milieu,
            id: Date.now().toString()
        };
        
        setMilieux(prev => [...prev, newMilieu]);
        showToast('Milieu ajouté', 'success');
        
        try {
            const db = await openDB();
            await db.transaction('milieux', 'readwrite').objectStore('milieux').add(newMilieu);
        } catch (error) {
            console.error('Erreur ajout milieu:', error);
        }
    };

    const deleteMilieu = async (id: string) => {
        if (!confirm('Supprimer ce milieu ?')) return;
        
        setMilieux(prev => prev.filter(m => m.id !== id));
        showToast('Milieu supprimé', 'success');
        
        try {
            const db = await openDB();
            await db.transaction('milieux', 'readwrite').objectStore('milieux').delete(id);
        } catch (error) {
            console.error('Erreur suppression milieu:', error);
        }
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
                    await saveData();
                    showToast('Données importées', 'success');
                }
            } catch (error) {
                showToast('Erreur lors de l\'import', 'error');
            }
        };
        reader.readAsText(file);
    };

    // Calculer les statistiques
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

    // Filtrer les cultures
    const filteredCultures = cultures.filter(culture => {
        // Filtre par recherche
        if (searchQuery && !culture.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        
        // Filtre par mode
        if (filterMode === 'active' && culture.statut !== 'active') return false;
        if (filterMode === 'repiquage') {
            if (culture.statut !== 'active') return false;
            const referenceDate = new Date(culture.lastRepiquage || culture.date);
            const today = new Date();
            const daysSince = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince < culture.intervalle) return false;
        }
        
        // Filtre par onglet
        if (activeTab === 'cryo' && culture.statut !== 'cryoconservée') return false;
        if (activeTab === 'cultures' && culture.statut === 'cryoconservée') return false;
        
        return true;
    });

    // Calculer les jours depuis dernier repiquage
    const getDaysSinceRepiquage = (culture: Culture) => {
        const referenceDate = new Date(culture.lastRepiquage || culture.date);
        const today = new Date();
        return Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Obtenir le statut de repiquage
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
            paddingTop: '80px'
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
                                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                                    Gestionnaire de Cultures Cellulaires
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: c.textSecondary }}>
                                    Suivi et gestion des cultures
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
                                className="btn"
                                style={{
                                    background: activeTab === 'cultures' ? c.accentPrimary : 'transparent',
                                    color: activeTab === 'cultures' ? 'white' : c.textPrimary,
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                🔬 Cultures
                            </button>
                            <button
                                onClick={() => setActiveTab('milieux')}
                                className="btn"
                                style={{
                                    background: activeTab === 'milieux' ? c.accentPrimary : 'transparent',
                                    color: activeTab === 'milieux' ? 'white' : c.textPrimary,
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                🧪 Milieux
                            </button>
                        </div>

                        <button className="btn" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={() => {
                            setEditingCulture(null);
                            setShowCultureModal(true);
                        }}
                        >
                            <Plus size={18} /> Culture
                        </button>

                        <button className="btn" style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
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

                        <button className="btn" style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onClick={() => setShowCryoModal(true)}
                        >
                            <Snowflake size={18} /> Cryo
                        </button>

                        <button className="btn" style={{
                            background: c.cardBg,
                            color: c.textPrimary,
                            border: `1px solid ${c.borderColor}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
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
                            fontWeight: 600,
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

            {/* Container */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
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
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {stats.total}
                        </div>
                        <div style={{ color: c.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Cultures totales
                        </div>
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
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {stats.active}
                        </div>
                        <div style={{ color: c.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Cultures actives
                        </div>
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
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {stats.cryo}
                        </div>
                        <div style={{ color: c.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Souches cryoconservées
                        </div>
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
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {stats.repiquage}
                        </div>
                        <div style={{ color: c.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            À repiquer
                        </div>
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
                        <Search 
                            size={20} 
                            style={{ 
                                position: 'absolute', 
                                left: '1rem', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: c.textSecondary
                            }} 
                        />
                        <input
                            type="text"
                            placeholder="🔍 Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${c.borderColor}`,
                                background: c.cardBg,
                                color: c.textPrimary,
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: c.textSecondary, fontSize: '0.9rem', fontWeight: 600 }}>
                            Affichage:
                        </span>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: `2px solid ${viewMode === 'grid' ? c.accentPrimary : c.borderColor}`,
                                background: viewMode === 'grid' ? c.accentPrimary : c.cardBg,
                                color: viewMode === 'grid' ? 'white' : c.textPrimary,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <GridIcon size={16} /> Carte
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: `2px solid ${viewMode === 'list' ? c.accentPrimary : c.borderColor}`,
                                background: viewMode === 'list' ? c.accentPrimary : c.cardBg,
                                color: viewMode === 'list' ? 'white' : c.textPrimary,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <List size={16} /> Liste
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'milieux' ? (
                    // Vue Milieux
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {milieux.map(milieu => (
                                <div key={milieu.id} style={{
                                    background: c.cardBg,
                                    border: `1px solid ${c.borderColor}`,
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                                                {milieu.nom}
                                            </h3>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: c.textSecondary }}>
                                                {milieu.type}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteMilieu(milieu.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: c.textSecondary }}>
                                        <p><strong>Fournisseur:</strong> {milieu.fournisseur}</p>
                                        <p><strong>Stockage:</strong> {milieu.stockage}</p>
                                        {milieu.notes && <p><strong>Notes:</strong> {milieu.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {milieux.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: c.bgSecondary,
                                borderRadius: '1rem',
                                border: `1px solid ${c.borderColor}`
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧪</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Aucun milieu enregistré</h3>
                                <p style={{ color: c.textSecondary }}>
                                    Utilisez le bouton "➕ Milieu" pour en ajouter un
                                </p>
                            </div>
                        )}
                    </div>
                ) : filteredCultures.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: c.bgSecondary,
                        borderRadius: '1rem',
                        border: `1px solid ${c.borderColor}`
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧫</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Aucune culture trouvée</h3>
                        <p style={{ color: c.textSecondary }}>
                            {cultures.length === 0 
                                ? 'Utilisez le bouton "➕ Culture" pour en ajouter une'
                                : 'Aucune culture ne correspond aux filtres sélectionnés'
                            }
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' 
                            ? 'repeat(auto-fill, minmax(320px, 1fr))' 
                            : '1fr',
                        gap: '1.5rem'
                    }}>
                        {filteredCultures.map(culture => {
                            const repiquageStatus = getRepiquageStatus(culture);
                            const daysSince = getDaysSinceRepiquage(culture);
                            const milieu = milieux.find(m => m.id === culture.milieuId);
                            
                            return (
                                <div key={culture.id} style={{
                                    background: c.cardBg,
                                    border: `2px solid ${
                                        repiquageStatus === 'urgent' ? '#ef4444' :
                                        repiquageStatus === 'warning' ? '#f59e0b' :
                                        c.borderColor
                                    }`,
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Badge statut */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: culture.statut === 'active' ? 'rgba(16, 185, 129, 0.2)' :
                                                   culture.statut === 'cryoconservée' ? 'rgba(59, 130, 246, 0.2)' :
                                                   'rgba(156, 163, 175, 0.2)',
                                        color: culture.statut === 'active' ? '#10b981' :
                                              culture.statut === 'cryoconservée' ? '#3b82f6' :
                                              '#9ca3af'
                                    }}>
                                        {culture.statut === 'active' ? '🟢 Active' :
                                         culture.statut === 'cryoconservée' ? '❄️ Cryo' :
                                         '⚫ Terminée'}
                                    </div>

                                    {/* Header */}
                                    <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
                                        <h3 style={{ 
                                            margin: 0, 
                                            fontSize: '1.2rem', 
                                            fontWeight: 700,
                                            marginBottom: '0.5rem'
                                        }}>
                                            {culture.nom}
                                        </h3>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            color: c.textSecondary
                                        }}>
                                            <Calendar size={14} />
                                            <span>Passage {culture.passage}</span>
                                            <span>•</span>
                                            <span>{milieu?.nom || 'Milieu inconnu'}</span>
                                        </div>
                                    </div>

                                    {/* Alerte repiquage */}
                                    {repiquageStatus !== 'none' && repiquageStatus !== 'ok' && (
                                        <div style={{
                                            background: repiquageStatus === 'urgent' 
                                                ? 'rgba(239, 68, 68, 0.1)' 
                                                : 'rgba(245, 158, 11, 0.1)',
                                            border: `1px solid ${repiquageStatus === 'urgent' ? '#ef4444' : '#f59e0b'}`,
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            color: repiquageStatus === 'urgent' ? '#ef4444' : '#f59e0b'
                                        }}>
                                            <AlertCircle size={16} />
                                            <span>
                                                {repiquageStatus === 'urgent' 
                                                    ? `⚠️ Repiquage urgent (${daysSince}j/${culture.intervalle}j)`
                                                    : `⏰ Repiquage bientôt (${daysSince}j/${culture.intervalle}j)`
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* Info cryo */}
                                    {culture.statut === 'cryoconservée' && culture.cryoDate && (
                                        <div style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: '1px solid #3b82f6',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            marginBottom: '1rem',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <Snowflake size={14} />
                                                <strong>Cryoconservée</strong>
                                            </div>
                                            <div style={{ color: c.textSecondary, fontSize: '0.8rem' }}>
                                                {new Date(culture.cryoDate).toLocaleDateString()}
                                                {culture.cryoLocation && ` • ${culture.cryoLocation}`}
                                            </div>
                                        </div>
                                    )}

                                    {/* Conditions */}
                                    {culture.conditions && culture.conditions.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: '0.5rem',
                                                fontSize: '0.8rem'
                                            }}>
                                                {culture.conditions.map((cond, idx) => (
                                                    <span key={idx} style={{
                                                        background: c.bgSecondary,
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        border: `1px solid ${c.borderColor}`
                                                    }}>
                                                        {cond}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {culture.notes && (
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: c.textSecondary,
                                            marginBottom: '1rem',
                                            fontStyle: 'italic'
                                        }}>
                                            "{culture.notes}"
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '0.5rem', 
                                        flexWrap: 'wrap',
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: `1px solid ${c.borderColor}`
                                    }}>
                                        {culture.statut === 'active' && (
                                            <button
                                                onClick={() => repiquerCulture(culture.id)}
                                                style={{
                                                    flex: 1,
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <Flame size={16} /> Repiquer
                                            </button>
                                        )}
                                        
                                        {culture.statut === 'cryoconservée' && (
                                            <button
                                                onClick={() => reprendreCulture(culture.id)}
                                                style={{
                                                    flex: 1,
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <Flame size={16} /> Reprendre
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => {
                                                setSelectedCulture(culture);
                                                setShowHistoryModal(true);
                                            }}
                                            style={{
                                                background: c.cardBg,
                                                border: `1px solid ${c.borderColor}`,
                                                color: c.textPrimary,
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <History size={16} />
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                setEditingCulture(culture);
                                                setShowCultureModal(true);
                                            }}
                                            style={{
                                                background: c.cardBg,
                                                border: `1px solid ${c.borderColor}`,
                                                color: c.textPrimary,
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        
                                        <button
                                            onClick={() => deleteCulture(culture.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* Modals */}
            <CultureModal
                show={showCultureModal}
                onClose={() => {
                    setShowCultureModal(false);
                    setEditingCulture(null);
                }}
                onSave={(data) => {
                    if (editingCulture) {
                        updateCulture(editingCulture.id, data);
                    } else {
                        addCulture(data);
                    }
                    setShowCultureModal(false);
                    setEditingCulture(null);
                }}
                editing={editingCulture}
                milieux={milieux}
                theme={theme}
            />

            <MilieuModal
                show={showMilieuModal}
                onClose={() => setShowMilieuModal(false)}
                onSave={(data) => {
                    addMilieu(data);
                    setShowMilieuModal(false);
                }}
                theme={theme}
            />

            <CryoModal
                show={showCryoModal}
                onClose={() => setShowCryoModal(false)}
                onSave={(cultureId, cryoData) => {
                    cryopreserverCulture(cultureId, cryoData);
                    setShowCryoModal(false);
                }}
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
