import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Search, Plus, FileText, AlertTriangle, Users, ClipboardCheck, HardHat, Trash2, Edit2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import MobileBottomNav from '../../../components/MobileBottomNav';
import { SafetyModal } from '../../../components/SafetyModals';
import '../../../styles/mobile-app.css';

interface SDS {
    id: string;
    chemical: string;
    hazardSymbols: string[];
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
    storage: string;
    lastChecked: string;
}

interface Incident {
    id: string;
    date: string;
    type: 'Chimique' | 'Biologique' | 'Physique' | 'Autre';
    severity: 'Mineur' | 'Modéré' | 'Grave' | 'Critique';
    description: string;
    actions: string;
    reportedBy: string;
    status: 'Ouvert' | 'En cours' | 'Résolu';
}

interface Training {
    id: string;
    title: string;
    date: string;
    instructor: string;
    participants: number;
    duration: string;
    status: 'Planifiée' | 'Terminée' | 'Annulée';
}

interface Inspection {
    id: string;
    date: string;
    area: string;
    inspector: string;
    score: number;
    issues: number;
    status: 'Conforme' | 'Non-conforme' | 'À améliorer';
}

interface PPE {
    id: string;
    name: string;
    type: 'Protection respiratoire' | 'Protection des yeux' | 'Protection des mains' | 'Protection du corps' | 'Autre';
    stock: number;
    minStock: number;
    location: string;
}

type View = 'sds' | 'incidents' | 'trainings' | 'inspections' | 'ppe';

const MobileSafetyHub = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<View>('sds');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [sdsList, setSdsList] = useState<SDS[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [ppeList, setPpeList] = useState<PPE[]>([]);

    useEffect(() => {
        const savedSDS = localStorage.getItem('safety_sds');
        const savedIncidents = localStorage.getItem('safety_incidents');
        const savedTrainings = localStorage.getItem('safety_trainings');
        const savedInspections = localStorage.getItem('safety_inspections');
        const savedPPE = localStorage.getItem('safety_ppe');

        if (savedSDS) setSdsList(JSON.parse(savedSDS));
        else setSdsList([
            { id: '1', chemical: 'Ethanol 70%', hazardSymbols: ['🔥', '⚠️'], riskLevel: 'Moderate', storage: 'Armoire solvants', lastChecked: '2026-01-10' },
            { id: '2', chemical: 'Chloroforme', hazardSymbols: ['💀', '☢️'], riskLevel: 'Extreme', storage: 'Hotte ventilée', lastChecked: '2025-12-05' },
        ]);

        if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
        else setIncidents([
            { id: '1', date: '2026-02-20', type: 'Chimique', severity: 'Modéré', description: 'Renversement de solvant', actions: 'Nettoyage immédiat', reportedBy: 'Dr. Martin', status: 'Résolu' }
        ]);

        if (savedTrainings) setTrainings(JSON.parse(savedTrainings));
        else setTrainings([
            { id: '1', title: 'Manipulation produits chimiques', date: '2026-03-15', instructor: 'Dr. Dupont', participants: 12, duration: '3h', status: 'Planifiée' }
        ]);

        if (savedInspections) setInspections(JSON.parse(savedInspections));
        else setInspections([
            { id: '1', date: '2026-02-15', area: 'Laboratoire Bio', inspector: 'M. Bernard', score: 85, issues: 2, status: 'Conforme' }
        ]);

        if (savedPPE) setPpeList(JSON.parse(savedPPE));
        else setPpeList([
            { id: '1', name: 'Gants nitrile', type: 'Protection des mains', stock: 150, minStock: 50, location: 'Armoire A1' },
            { id: '2', name: 'Lunettes de protection', type: 'Protection des yeux', stock: 25, minStock: 30, location: 'Armoire A2' }
        ]);
    }, []);

    useEffect(() => { localStorage.setItem('safety_sds', JSON.stringify(sdsList)); }, [sdsList]);
    useEffect(() => { localStorage.setItem('safety_incidents', JSON.stringify(incidents)); }, [incidents]);
    useEffect(() => { localStorage.setItem('safety_trainings', JSON.stringify(trainings)); }, [trainings]);
    useEffect(() => { localStorage.setItem('safety_inspections', JSON.stringify(inspections)); }, [inspections]);
    useEffect(() => { localStorage.setItem('safety_ppe', JSON.stringify(ppeList)); }, [ppeList]);

    const handleOpenModal = (item?: any) => {
        setEditingItem(item || null);
        setShowModal(true);
    };

    const handleSave = (data: any) => {
        switch (currentView) {
            case 'sds':
                if (editingItem) {
                    setSdsList(prev => prev.map(item => item.id === data.id ? data : item));
                } else {
                    setSdsList(prev => [...prev, data]);
                }
                break;
            case 'incidents':
                if (editingItem) {
                    setIncidents(prev => prev.map(item => item.id === data.id ? data : item));
                } else {
                    setIncidents(prev => [...prev, data]);
                }
                break;
            case 'trainings':
                if (editingItem) {
                    setTrainings(prev => prev.map(item => item.id === data.id ? data : item));
                } else {
                    setTrainings(prev => [...prev, data]);
                }
                break;
            case 'inspections':
                if (editingItem) {
                    setInspections(prev => prev.map(item => item.id === data.id ? data : item));
                } else {
                    setInspections(prev => [...prev, data]);
                }
                break;
            case 'ppe':
                if (editingItem) {
                    setPpeList(prev => prev.map(item => item.id === data.id ? data : item));
                } else {
                    setPpeList(prev => [...prev, data]);
                }
                break;
        }
        setShowModal(false);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Confirmer la suppression ?')) return;
        switch (currentView) {
            case 'sds': setSdsList(prev => prev.filter(item => item.id !== id)); break;
            case 'incidents': setIncidents(prev => prev.filter(item => item.id !== id)); break;
            case 'trainings': setTrainings(prev => prev.filter(item => item.id !== id)); break;
            case 'inspections': setInspections(prev => prev.filter(item => item.id !== id)); break;
            case 'ppe': setPpeList(prev => prev.filter(item => item.id !== id)); break;
        }
    };

    const filteredSDS = sdsList.filter(s => s.chemical.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredIncidents = incidents.filter(i => i.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredTrainings = trainings.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredInspections = inspections.filter(i => i.area.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredPPE = ppeList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="mobile-container">
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/hugin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--mobile-text)',
                            padding: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '0.75rem' }}>
                            <ShieldAlert size={20} color="#f43f5e" />
                        </div>
                        <h1 className="mobile-title" style={{ marginBottom: 0 }}>SafetyHub</h1>
                    </div>
                </div>
            </div>

            <div className="mobile-content">
                {/* View Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                    <ViewTab icon={<FileText size={16} />} label="SDS" active={currentView === 'sds'} onClick={() => setCurrentView('sds')} />
                    <ViewTab icon={<AlertTriangle size={16} />} label="Incidents" active={currentView === 'incidents'} onClick={() => setCurrentView('incidents')} />
                    <ViewTab icon={<Users size={16} />} label="Formations" active={currentView === 'trainings'} onClick={() => setCurrentView('trainings')} />
                    <ViewTab icon={<ClipboardCheck size={16} />} label="Inspections" active={currentView === 'inspections'} onClick={() => setCurrentView('inspections')} />
                    <ViewTab icon={<HardHat size={16} />} label="EPI" active={currentView === 'ppe'} onClick={() => setCurrentView('ppe')} />
                </div>

                {/* Search Bar */}
                <div className="mobile-search">
                    <Search className="mobile-search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Add Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button
                        onClick={() => handleOpenModal()}
                        className="mobile-btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>

                {/* Content */}
                {currentView === 'sds' && (
                    <div>
                        {filteredSDS.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <FileText size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--mobile-text-secondary)' }} />
                                <p style={{ color: 'var(--mobile-text-secondary)' }}>Aucune fiche SDS</p>
                            </div>
                        ) : (
                            filteredSDS.map(s => (
                                <div key={s.id} className="mobile-card" style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                        <div style={{ fontSize: '1.5rem' }}>{s.hazardSymbols.join(' ')}</div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.chemical}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.25rem' }}>
                                                Stockage: {s.storage}
                                            </p>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: s.riskLevel === 'Extreme' ? 'rgba(244, 63, 94, 0.2)' : s.riskLevel === 'High' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: s.riskLevel === 'Extreme' ? '#f43f5e' : s.riskLevel === 'High' ? '#fbbf24' : '#10b981'
                                            }}>
                                                {s.riskLevel}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(s)} style={{ background: 'transparent', border: 'none', color: 'var(--mobile-text)', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {currentView === 'incidents' && (
                    <div>
                        {filteredIncidents.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <AlertTriangle size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--mobile-text-secondary)' }} />
                                <p style={{ color: 'var(--mobile-text-secondary)' }}>Aucun incident</p>
                            </div>
                        ) : (
                            filteredIncidents.map(inc => (
                                <div key={inc.id} className="mobile-card" style={{ marginBottom: '0.75rem', borderLeft: `3px solid ${inc.severity === 'Critique' ? '#f43f5e' : inc.severity === 'Grave' ? '#fbbf24' : '#10b981'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{inc.type}</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--mobile-text-secondary)' }}>{inc.date} • {inc.reportedBy}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: inc.severity === 'Critique' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: inc.severity === 'Critique' ? '#f43f5e' : '#10b981'
                                            }}>
                                                {inc.severity}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{inc.description}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.75rem' }}>
                                        Actions: {inc.actions}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleOpenModal(inc)} style={{ background: 'transparent', border: 'none', color: 'var(--mobile-text)', padding: '0.25rem', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(inc.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '0.25rem', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {currentView === 'trainings' && (
                    <div>
                        {filteredTrainings.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <Users size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--mobile-text-secondary)' }} />
                                <p style={{ color: 'var(--mobile-text-secondary)' }}>Aucune formation</p>
                            </div>
                        ) : (
                            filteredTrainings.map(tr => (
                                <div key={tr.id} className="mobile-card" style={{ marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{tr.title}</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.75rem' }}>
                                        <p style={{ marginBottom: '0.25rem' }}>📅 {tr.date}</p>
                                        <p style={{ marginBottom: '0.25rem' }}>👨‍🏫 {tr.instructor}</p>
                                        <p>👥 {tr.participants} participants • ⏱️ {tr.duration}</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: tr.status === 'Terminée' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                            color: tr.status === 'Terminée' ? '#10b981' : '#3b82f6'
                                        }}>
                                            {tr.status}
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(tr)} style={{ background: 'transparent', border: 'none', color: 'var(--mobile-text)', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tr.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {currentView === 'inspections' && (
                    <div>
                        {filteredInspections.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <ClipboardCheck size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--mobile-text-secondary)' }} />
                                <p style={{ color: 'var(--mobile-text-secondary)' }}>Aucune inspection</p>
                            </div>
                        ) : (
                            filteredInspections.map(insp => (
                                <div key={insp.id} className="mobile-card" style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center', minWidth: '50px' }}>
                                            <div style={{
                                                fontSize: '1.75rem',
                                                fontWeight: 900,
                                                color: insp.score >= 80 ? '#10b981' : insp.score >= 60 ? '#fbbf24' : '#f43f5e'
                                            }}>
                                                {insp.score}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Score</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{insp.area}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.5rem' }}>
                                                {insp.date} • {insp.inspector}
                                            </p>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: insp.status === 'Conforme' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                                color: insp.status === 'Conforme' ? '#10b981' : '#f43f5e'
                                            }}>
                                                {insp.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(insp)} style={{ background: 'transparent', border: 'none', color: 'var(--mobile-text)', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(insp.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {currentView === 'ppe' && (
                    <div>
                        {filteredPPE.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <HardHat size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--mobile-text-secondary)' }} />
                                <p style={{ color: 'var(--mobile-text-secondary)' }}>Aucun EPI</p>
                            </div>
                        ) : (
                            filteredPPE.map(ppe => (
                                <div key={ppe.id} className="mobile-card" style={{
                                    marginBottom: '0.75rem',
                                    border: `1px solid ${ppe.stock <= ppe.minStock ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255,255,255,0.1)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{ppe.name}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.25rem' }}>
                                                Type: {ppe.type}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)' }}>
                                                Localisation: {ppe.location}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <button onClick={() => handleOpenModal(ppe)} style={{ background: 'transparent', border: 'none', color: 'var(--mobile-text)', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(ppe.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', padding: '0.25rem', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 900,
                                                color: ppe.stock <= ppe.minStock ? '#f43f5e' : '#10b981'
                                            }}>
                                                {ppe.stock}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Stock (min: {ppe.minStock})</div>
                                        </div>
                                        {ppe.stock <= ppe.minStock && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: 'rgba(244, 63, 94, 0.2)',
                                                color: '#f43f5e'
                                            }}>
                                                ⚠️ Réappro
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <SafetyModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                }}
                onSave={handleSave}
                editingItem={editingItem}
                type={currentView}
            />

            <MobileBottomNav />
        </div>
    );
};

const ViewTab = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: active ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '0.75rem',
            color: active ? '#f43f5e' : 'var(--mobile-text-secondary)',
            cursor: 'pointer',
            fontWeight: active ? 600 : 400,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap'
        }}
    >
        {icon} {label}
    </button>
);

export default MobileSafetyHub;
