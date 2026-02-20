import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Plus, Trash2, ChevronLeft, X, Save, Activity, Edit2, AlertTriangle,
    Wrench, BarChart3, TrendingUp, CheckCircle, XCircle, Package,
    MapPin, Filter, Search, Eye, Settings
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

interface Reservation {
    id: string;
    equipId: string;
    userId: string;
    userName: string;
    startTime: string;
    endTime: string;
    date: string;
    purpose: string;
}

interface MaintenanceRecord {
    id: string;
    equipId: string;
    type: 'preventive' | 'corrective' | 'calibration';
    date: string;
    description: string;
    technician: string;
    cost?: number;
    nextDate?: string;
}

interface Equipment {
    id: string;
    name: string;
    type: string;
    status: 'Operational' | 'Maintenance' | 'Down';
    location: string;
    description?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyEnd?: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    usageHours?: number;
    documents?: string[];
}

const EquipFlow = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [view, setView] = useState<'calendar' | 'equipment' | 'maintenance' | 'stats'>('calendar');
    const [isAddingReservation, setIsAddingReservation] = useState(false);
    const [isAddingEquipment, setIsAddingEquipment] = useState(false);
    const [isAddingMaintenance, setIsAddingMaintenance] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        const loadAll = async () => {
            const equipData = await fetchModuleData('hugin_equip_list');
            if (equipData && equipData.length > 0) {
                setEquipment(equipData);
            } else {
                const initial: Equipment[] = [
                    {
                        id: "e1",
                        name: "Centrifugeuse à froid",
                        type: "Centrifugeuse",
                        status: "Operational",
                        location: "Salle 101",
                        manufacturer: "Eppendorf",
                        model: "5810R",
                        serialNumber: "SN-12345",
                        purchaseDate: "2023-01-15",
                        warrantyEnd: "2026-01-15",
                        lastMaintenance: "2025-12-01",
                        nextMaintenance: "2026-06-01",
                        usageHours: 1250
                    },
                    {
                        id: "e2",
                        name: "PCR en temps réel",
                        type: "PCR",
                        status: "Operational",
                        location: "Salle 102",
                        manufacturer: "Bio-Rad",
                        model: "CFX96",
                        serialNumber: "SN-67890",
                        purchaseDate: "2024-03-20",
                        warrantyEnd: "2027-03-20",
                        lastMaintenance: "2026-01-10",
                        nextMaintenance: "2026-07-10",
                        usageHours: 580
                    }
                ];
                setEquipment(initial);
                for (const item of initial) await saveModuleItem('hugin_equip_list', item);
            }

            const resData = await fetchModuleData('hugin_equip_reservations');
            if (resData) setReservations(resData);

            const maintData = await fetchModuleData('hugin_equip_maintenance');
            if (maintData) setMaintenanceRecords(maintData);
        };
        loadAll();
    }, []);

    const handleAddReservation = async (res: Reservation) => {
        const conflict = reservations.find(r =>
            r.equipId === res.equipId &&
            r.date === res.date &&
            ((res.startTime >= r.startTime && res.startTime < r.endTime) ||
                (res.endTime > r.startTime && res.endTime <= r.endTime))
        );

        if (conflict) {
            showToast('Conflit de réservation détecté !', 'error');
            return;
        }

        try {
            await saveModuleItem('hugin_equip_reservations', res);
            setReservations([...reservations, res]);
            setIsAddingReservation(false);
            showToast('Réservation confirmée', 'success');
        } catch (e) {
            showToast('Erreur lors de la réservation', 'error');
        }
    };

    const handleDeleteReservation = async (id: string) => {
        try {
            await deleteModuleItem('hugin_equip_reservations', id);
            setReservations(reservations.filter(r => r.id !== id));
            showToast('Réservation annulée', 'success');
        } catch (e) {
            showToast('Erreur lors de l\'annulation', 'error');
        }
    };

    const handleSaveEquipment = async (equip: Equipment) => {
        try {
            await saveModuleItem('hugin_equip_list', equip);
            if (equipment.find(e => e.id === equip.id)) {
                setEquipment(equipment.map(e => e.id === equip.id ? equip : e));
                showToast('Équipement mis à jour', 'success');
            } else {
                setEquipment([...equipment, equip]);
                showToast('Équipement ajouté', 'success');
            }
            setIsAddingEquipment(false);
            setEditingEquipment(null);
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleDeleteEquipment = async (id: string) => {
        if (confirm('Supprimer cet équipement et toutes ses réservations ?')) {
            try {
                await deleteModuleItem('hugin_equip_list', id);
                setEquipment(equipment.filter(e => e.id !== id));
                setReservations(reservations.filter(r => r.equipId !== id));
                showToast('Équipement supprimé', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const handleAddMaintenance = async (record: MaintenanceRecord) => {
        try {
            await saveModuleItem('hugin_equip_maintenance', record);
            setMaintenanceRecords([...maintenanceRecords, record]);
            
            // Mettre l'équipement en maintenance si c'est une maintenance corrective ou préventive en cours
            const equip = equipment.find(e => e.id === record.equipId);
            if (equip && record.type !== 'calibration') {
                const updatedEquip = { ...equip, status: 'Maintenance' as const, lastMaintenance: record.date };
                if (record.nextDate) {
                    updatedEquip.nextMaintenance = record.nextDate;
                }
                await saveModuleItem('hugin_equip_list', updatedEquip);
                setEquipment(equipment.map(e => e.id === record.equipId ? updatedEquip : e));
            }
            
            setIsAddingMaintenance(false);
            showToast('Maintenance enregistrée', 'success');
        } catch (e) {
            showToast('Erreur d\'enregistrement', 'error');
        }
    };

    const handleCompleteMaintenance = async (equipId: string) => {
        const equip = equipment.find(e => e.id === equipId);
        if (!equip) return;

        if (confirm('Marquer la maintenance comme terminée et remettre l\'équipement en service ?')) {
            try {
                const updatedEquip = { ...equip, status: 'Operational' as const };
                await saveModuleItem('hugin_equip_list', updatedEquip);
                setEquipment(equipment.map(e => e.id === equipId ? updatedEquip : e));
                showToast('Équipement remis en service', 'success');
            } catch (e) {
                showToast('Erreur de mise à jour', 'error');
            }
        }
    };

    const dailyReservations = reservations.filter(r => r.date === selectedDate);
    
    const filteredEquipment = equipment.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || e.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const operationalCount = equipment.filter(e => e.status === 'Operational').length;
    const maintenanceCount = equipment.filter(e => e.status === 'Maintenance').length;
    const downCount = equipment.filter(e => e.status === 'Down').length;

    const needsMaintenanceSoon = equipment.filter(e => {
        if (!e.nextMaintenance) return false;
        const daysUntil = Math.floor((new Date(e.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 30;
    }).length;

    const totalUsageHours = equipment.reduce((sum, e) => sum + (e.usageHours || 0), 0);
    const avgUsageHours = equipment.length > 0 ? Math.round(totalUsageHours / equipment.length) : 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '1rem', color: '#ef4444' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>EquipFlow Pro</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestion complète des équipements</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {view === 'calendar' && (
                        <button onClick={() => setIsAddingReservation(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444' }}>
                            <Plus size={18} /> Réserver
                        </button>
                    )}
                    {view === 'equipment' && (
                        <button onClick={() => setIsAddingEquipment(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444' }}>
                            <Plus size={18} /> Ajouter Équipement
                        </button>
                    )}
                    {view === 'maintenance' && (
                        <button onClick={() => setIsAddingMaintenance(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444' }}>
                            <Plus size={18} /> Enregistrer Maintenance
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
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Opérationnels</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{operationalCount}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>En maintenance</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{maintenanceCount}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hors service</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{downCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Sélecteur de date (pour vue calendrier) */}
                    {view === 'calendar' && (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sélecteur de Date</h3>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                    )}

                    {/* Filtres (pour vue équipement) */}
                    {view === 'equipment' && (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} /> Filtres
                            </h3>
                            <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="Operational">Opérationnel</option>
                                <option value="Maintenance">En maintenance</option>
                                <option value="Down">Hors service</option>
                            </select>
                        </div>
                    )}

                    {/* Alertes */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> Alertes
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {needsMaintenanceSoon > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Wrench size={14} />
                                        {needsMaintenanceSoon} maintenance(s) prévue(s)
                                    </div>
                                </div>
                            )}
                            {downCount > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <XCircle size={14} />
                                        {downCount} hors service
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* État des machines (pour vue calendrier) */}
                    {view === 'calendar' && (
                        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>État des Machines</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {equipment.map(e => (
                                    <div key={e.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.name}</span>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.status === 'Operational' ? '#10b981' : (e.status === 'Maintenance' ? '#f59e0b' : '#ef4444') }} />
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{e.type} • {e.location}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main>
                    {/* View Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        {[
                            { id: 'calendar', label: 'Calendrier', icon: <Calendar size={16} /> },
                            { id: 'equipment', label: 'Équipements', icon: <Package size={16} /> },
                            { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={16} /> },
                            { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id as any)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: view === tab.id ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: view === tab.id ? '#ef4444' : 'var(--text-secondary)',
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

                    {/* Vue Calendrier */}
                    {view === 'calendar' && (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Calendar size={20} color="#ef4444" /> Programme du {new Date(selectedDate).toLocaleDateString()}
                            </h3>

                            {dailyReservations.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                    <Clock size={48} style={{ marginBottom: '1rem' }} />
                                    <p>Aucune réservation pour cette date.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {dailyReservations.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(res => {
                                        const equip = equipment.find(e => e.id === res.equipId);
                                        return (
                                            <div key={res.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', borderLeft: '4px solid #ef4444' }}>
                                                <div style={{ minWidth: '100px', fontSize: '1.1rem', fontWeight: 700 }}>{res.startTime} - {res.endTime}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{equip?.name || 'Inconnu'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Utilisateur: {res.userName} • Motif: {res.purpose}</div>
                                                </div>
                                                <button onClick={() => handleDeleteReservation(res.id)} className="btn-icon" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vue Équipements */}
                    {view === 'equipment' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Équipement</th>
                                        <th style={{ padding: '1rem' }}>Type</th>
                                        <th style={{ padding: '1rem' }}>Statut</th>
                                        <th style={{ padding: '1rem' }}>Emplacement</th>
                                        <th style={{ padding: '1rem' }}>Heures d'usage</th>
                                        <th style={{ padding: '1rem' }}>Prochaine maintenance</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEquipment.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                                Aucun équipement trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEquipment.map(equip => (
                                            <tr key={equip.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{equip.name}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{equip.manufacturer} {equip.model}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>{equip.type}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: equip.status === 'Operational' ? '#10b981' : (equip.status === 'Maintenance' ? '#f59e0b' : '#ef4444') }} />
                                                        <span style={{ fontSize: '0.85rem' }}>{equip.status}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                                        <MapPin size={14} opacity={0.5} /> {equip.location}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem' }}>{equip.usageHours || 0}h</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        {equip.nextMaintenance ? new Date(equip.nextMaintenance).toLocaleDateString() : '-'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => setSelectedEquipment(equip)} className="btn-icon" style={{ opacity: 0.6 }} title="Détails">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingEquipment(equip)} className="btn-icon" style={{ opacity: 0.6 }} title="Modifier">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteEquipment(equip.id)} className="btn-icon" style={{ opacity: 0.6, color: '#ef4444' }} title="Supprimer">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Vue Maintenance */}
                    {view === 'maintenance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Équipements en maintenance */}
                            {equipment.filter(e => e.status === 'Maintenance').length > 0 && (
                                <div className="glass-panel" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <AlertTriangle size={20} color="#f59e0b" /> Équipements en maintenance ({equipment.filter(e => e.status === 'Maintenance').length})
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                        {equipment.filter(e => e.status === 'Maintenance').map(equip => (
                                            <div key={equip.id} style={{
                                                padding: '1.5rem',
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                borderRadius: '1rem',
                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{equip.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        {equip.type} • {equip.location}
                                                    </div>
                                                    {equip.lastMaintenance && (
                                                        <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                                                            Dernière maintenance: {new Date(equip.lastMaintenance).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleCompleteMaintenance(equip.id)}
                                                    className="btn" 
                                                    style={{ 
                                                        background: '#10b981', 
                                                        width: '100%',
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.75rem'
                                                    }}
                                                >
                                                    <CheckCircle size={18} /> Remettre en service
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Historique de maintenance */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Wrench size={20} color="#ef4444" /> Historique de Maintenance
                                </h3>
                                {maintenanceRecords.length === 0 ? (
                                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                        Aucun enregistrement de maintenance.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {maintenanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50).map(record => {
                                            const equip = equipment.find(e => e.id === record.equipId);
                                            return (
                                                <div key={record.id} style={{
                                                    padding: '1rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '0.75rem',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '0.75rem',
                                                        background: record.type === 'preventive' ? 'rgba(16, 185, 129, 0.2)' : record.type === 'calibration' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: record.type === 'preventive' ? '#10b981' : record.type === 'calibration' ? '#3b82f6' : '#ef4444'
                                                    }}>
                                                        {record.type === 'preventive' ? <CheckCircle size={20} /> : record.type === 'calibration' ? <Settings size={20} /> : <Wrench size={20} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{equip?.name || 'Équipement inconnu'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            {record.description} • {record.technician}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                            {record.type === 'preventive' ? 'Préventive' : record.type === 'calibration' ? 'Calibration' : 'Corrective'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {new Date(record.date).toLocaleDateString()}
                                                        </div>
                                                        {record.cost && (
                                                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                                                                {record.cost}€
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vue Statistiques */}
                    {view === 'stats' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            {/* Répartition par statut */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Activity size={20} color="#ef4444" /> Répartition par statut
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Opérationnels</div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${(operationalCount / equipment.length) * 100}%`,
                                                    height: '100%',
                                                    background: '#10b981',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: '#10b981' }}>
                                            {operationalCount}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>En maintenance</div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${(maintenanceCount / equipment.length) * 100}%`,
                                                    height: '100%',
                                                    background: '#f59e0b',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: '#f59e0b' }}>
                                            {maintenanceCount}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Hors service</div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${(downCount / equipment.length) * 100}%`,
                                                    height: '100%',
                                                    background: '#ef4444',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: '#ef4444' }}>
                                            {downCount}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Utilisation */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={20} color="#3b82f6" /> Heures d'utilisation
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{totalUsageHours}h</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Moyenne par équipement</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{avgUsageHours}h</div>
                                    </div>
                                </div>
                            </div>

                            {/* Top équipements */}
                            <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1/-1' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TrendingUp size={20} color="#ef4444" /> Équipements les plus utilisés
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {equipment.sort((a, b) => (b.usageHours || 0) - (a.usageHours || 0)).slice(0, 6).map(equip => (
                                        <div key={equip.id} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{equip.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                {equip.type} • {equip.location}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
                                                {equip.usageHours || 0}h
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {isAddingReservation && (
                <ReservationModal
                    equipment={equipment}
                    selectedDate={selectedDate}
                    onClose={() => setIsAddingReservation(false)}
                    onSave={handleAddReservation}
                />
            )}

            {(isAddingEquipment || editingEquipment) && (
                <EquipmentModal
                    equipment={editingEquipment}
                    onClose={() => { setIsAddingEquipment(false); setEditingEquipment(null); }}
                    onSave={handleSaveEquipment}
                />
            )}

            {isAddingMaintenance && (
                <MaintenanceModal
                    equipment={equipment}
                    onClose={() => setIsAddingMaintenance(false)}
                    onSave={handleAddMaintenance}
                />
            )}

            {selectedEquipment && (
                <EquipmentDetailModal
                    equipment={selectedEquipment}
                    maintenanceRecords={maintenanceRecords.filter(m => m.equipId === selectedEquipment.id)}
                    reservations={reservations.filter(r => r.equipId === selectedEquipment.id)}
                    onClose={() => setSelectedEquipment(null)}
                />
            )}
        </div>
    );
};

const ReservationModal = ({ equipment, selectedDate, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Reservation>({
        id: Date.now().toString(),
        equipId: equipment[0]?.id || '',
        userId: 'u1',
        userName: 'Chercheur Principal',
        startTime: '09:00',
        endTime: '10:00',
        date: selectedDate,
        purpose: ''
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Réserver un Équipement</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Équipement</label>
                        <select
                            value={formData.equipId}
                            onChange={(e) => setFormData({ ...formData, equipId: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            {equipment.filter((e: any) => e.status === 'Operational').map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Début</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Fin</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Motif de l'utilisation</label>
                        <textarea
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            placeholder="Ex: Fractionnement de culture, Extraction ADN..."
                            style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#ef4444', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

const EquipmentModal = ({ equipment, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Equipment>(equipment || {
        id: Date.now().toString(),
        name: '',
        type: '',
        status: 'Operational',
        location: '',
        description: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyEnd: '',
        lastMaintenance: '',
        nextMaintenance: '',
        usageHours: 0,
        documents: []
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{equipment ? 'Modifier l\'Équipement' : 'Ajouter un Équipement'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Nom de l'équipement *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Centrifugeuse à froid"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Type *</label>
                        <input
                            type="text"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            placeholder="Ex: Centrifugeuse, PCR..."
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
                            <option value="Operational">Opérationnel</option>
                            <option value="Maintenance">En maintenance</option>
                            <option value="Down">Hors service</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Emplacement *</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Ex: Salle 101"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Fabricant</label>
                        <input
                            type="text"
                            value={formData.manufacturer}
                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                            placeholder="Ex: Eppendorf"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Modèle</label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            placeholder="Ex: 5810R"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Numéro de série</label>
                        <input
                            type="text"
                            value={formData.serialNumber}
                            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                            placeholder="Ex: SN-12345"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date d'achat</label>
                        <input
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Fin de garantie</label>
                        <input
                            type="date"
                            value={formData.warrantyEnd}
                            onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Prochaine maintenance</label>
                        <input
                            type="date"
                            value={formData.nextMaintenance}
                            onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Heures d'usage</label>
                        <input
                            type="number"
                            value={formData.usageHours}
                            onChange={(e) => setFormData({ ...formData, usageHours: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Description de l'équipement..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#ef4444', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

const MaintenanceModal = ({ equipment, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<MaintenanceRecord>({
        id: Date.now().toString(),
        equipId: equipment[0]?.id || '',
        type: 'preventive',
        date: new Date().toISOString().split('T')[0],
        description: '',
        technician: '',
        cost: 0,
        nextDate: ''
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Enregistrer une Maintenance</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Équipement *</label>
                        <select
                            value={formData.equipId}
                            onChange={(e) => setFormData({ ...formData, equipId: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            {equipment.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Type de maintenance *</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            <option value="preventive">Préventive</option>
                            <option value="corrective">Corrective</option>
                            <option value="calibration">Calibration</option>
                        </select>
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
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Technicien *</label>
                        <input
                            type="text"
                            value={formData.technician}
                            onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                            placeholder="Nom du technicien"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Coût (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Prochaine maintenance</label>
                        <input
                            type="date"
                            value={formData.nextDate}
                            onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Description de la maintenance effectuée..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#ef4444', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

const EquipmentDetailModal = ({ equipment, maintenanceRecords, reservations, onClose }: any) => {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Détails de l'Équipement</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Informations générales */}
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>{equipment.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Type:</span> {equipment.type}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Statut:</span> {equipment.status}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Emplacement:</span> {equipment.location}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Fabricant:</span> {equipment.manufacturer || '-'}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Modèle:</span> {equipment.model || '-'}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>N° Série:</span> {equipment.serialNumber || '-'}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Date d'achat:</span> {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '-'}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Fin garantie:</span> {equipment.warrantyEnd ? new Date(equipment.warrantyEnd).toLocaleDateString() : '-'}</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Heures d'usage:</span> {equipment.usageHours || 0}h</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Prochaine maintenance:</span> {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : '-'}</div>
                    </div>
                    {equipment.description && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</div>
                            <div style={{ fontSize: '0.9rem' }}>{equipment.description}</div>
                        </div>
                    )}
                </div>

                {/* Historique de maintenance */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wrench size={18} /> Historique de Maintenance ({maintenanceRecords.length})
                    </h3>
                    {maintenanceRecords.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                            Aucun enregistrement de maintenance
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {maintenanceRecords.slice(0, 5).map((record: any) => (
                                <div key={record.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600 }}>{record.type === 'preventive' ? 'Préventive' : record.type === 'calibration' ? 'Calibration' : 'Corrective'}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{record.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Réservations à venir */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} /> Réservations à venir ({reservations.filter((r: any) => new Date(r.date) >= new Date()).length})
                    </h3>
                    {reservations.filter((r: any) => new Date(r.date) >= new Date()).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                            Aucune réservation à venir
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {reservations.filter((r: any) => new Date(r.date) >= new Date()).slice(0, 5).map((res: any) => (
                                <div key={res.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600 }}>{new Date(res.date).toLocaleDateString()}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{res.startTime} - {res.endTime}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{res.userName} • {res.purpose}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipFlow;
