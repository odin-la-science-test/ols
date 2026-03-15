import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Plus, 
    ChevronLeft, 
    ChevronRight, 
    Archive, 
    Trash2, 
    AlertCircle,
    CheckCircle2,
    Filter,
    ArrowLeft,
    MoreVertical,
    Save,
    X
} from 'lucide-react';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';
import { useToast } from '../../components/ToastContext';

// --- TYPES & CONSTANTS ---

interface Event {
    id: string;
    title: string;
    date: string; // ISO yyyy-mm-dd
    time: string; // hh:mm
    resource: string;
    module: string;
    archived: boolean;
    reminder: boolean;
    priority: 'critique' | 'importante' | 'secondaire';
    objective: string;
    safetyChecked: boolean;
}

const MODULE_NAME = 'planning'; // Consistent with MobilePlanning

const RESOURCES = [
    'Poste de Sécurité Microbiologique (PSM)',
    'Salle de Culture Cellulaire',
    'Séquenceur Illumina',
    'Spectromètre de Masse',
    'Microscope Confocal',
    'Autoclave Central',
    'Paillasse Microbiologie',
    'Salle d\'Analyse Bio-informatique'
];

const PRIORITIES = [
    { id: 'critique', name: 'Critique', color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' },
    { id: 'importante', name: 'Importante', color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },
    { id: 'secondaire', name: 'Opérationnelle', color: '#2563eb', bg: '#f0f9ff', border: '#e0f2fe' }
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const MODULES = [
    { id: 'whonet', name: 'WHONET', path: '/hugin/whonet' },
    { id: 'qiime2', name: 'QIIME2', path: '/hugin/qiime2' }
];

// --- COMPONENT ---

const Planning: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // Safely retrieve user data (handles both JSON objects and raw email strings)
    const getUserSafe = () => {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return 'Chercheur';
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' ? (parsed.name || parsed.email || 'Chercheur') : parsed;
        } catch (e) {
            return raw; // It's a raw string (e.g., email)
        }
    };
    
    const currentUser = getUserSafe();

    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
    const [isCreating, setIsCreating] = useState(false);
    
    const [newEvent, setNewEvent] = useState({
        title: '',
        time: '09:00',
        resource: RESOURCES[0],
        priority: 'secondaire' as 'critique' | 'importante' | 'secondaire',
        objective: '',
        reminder: true
    });

    useEffect(() => {
        const loadData = async () => {
            const stored = await fetchModuleData(MODULE_NAME);
            if (stored && Array.isArray(stored)) {
                setEvents(stored);
            }
        };
        loadData();
    }, []);

    const handleCreateEvent = async () => {
        if (!newEvent.title.trim()) {
            showToast('Le titre est requis', 'error');
            return;
        }

        const eventData: Event = {
            id: Date.now().toString(),
            ...newEvent,
            date: selectedDate,
            archived: false,
            module: '',
            safetyChecked: newEvent.priority === 'critique' ? true : false
        };

        try {
            const result = await saveModuleItem(MODULE_NAME, eventData);
            if (result.success) {
                setEvents(prev => [...prev, { ...eventData, id: result.id || eventData.id }]);
                setIsCreating(false);
                setNewEvent({
                    title: '',
                    time: '09:00',
                    resource: RESOURCES[0],
                    priority: 'secondaire',
                    objective: '',
                    reminder: true
                });
                showToast('Activité enregistrée au registre', 'success');
            } else {
                console.error('Save failed:', result);
                showToast('Erreur persistante lors de l\'enregistrement', 'error');
            }
        } catch (err) {
            console.error('Persistence error:', err);
            showToast('Erreur critique du système de stockage', 'error');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        const result = await deleteModuleItem(MODULE_NAME, id);
        if (result.success) {
            setEvents(prev => prev.filter(e => e.id !== id));
            showToast('Entrée supprimée', 'info');
        }
    };

    const archiveEvent = async (event: Event) => {
        const updatedEvent = { ...event, archived: true };
        const result = await saveModuleItem(MODULE_NAME, updatedEvent);
        if (result.success) {
            setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
            showToast('Activité archivée', 'success');
        }
    };

    // --- HELPERS ---
    
    // Safer local date string conversion (YYYY-MM-DD)
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getWeekDates = () => {
        const current = new Date(selectedDate);
        const day = current.getDay(); // 0 is Sunday, 1 is Monday...
        // adjust to Monday start: if Sunday (0), we need to go back 6 days.
        const diff = (day === 0 ? -6 : 1 - day);
        const monday = new Date(current);
        monday.setDate(current.getDate() + diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return formatDate(d);
        });
    };

    const getMonthDates = () => {
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Offset for Monday start: Mon=0, Tue=1... Sun=6
        // firstDay: Sun=0 -> 6, Mon=1 -> 0, Tue=2 -> 1, ... Sat=6 -> 5
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        
        const dates: (string | null)[] = Array(offset).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(formatDate(new Date(year, month, i)));
        }
        return dates;
    };

    const navigateDate = (dir: 'prev' | 'next') => {
        const d = new Date(selectedDate);
        if (viewMode === 'day') d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
        if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
        if (viewMode === 'month') d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    // --- RENDERERS ---

    const renderEventItem = (event: Event) => {
        const priority = PRIORITIES.find(p => p.id === event.priority) || PRIORITIES[2];
        return (
            <div key={event.id} style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                padding: '1.25rem 0', 
                borderBottom: '1px solid var(--border-color)',
                position: 'relative',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <div style={{ width: '60px', fontWeight: 700, fontSize: '0.9rem', color: '#64748b', paddingTop: '0.2rem' }}>
                    {event.time}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</h4>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Clock size={14} /> {event.resource}
                                </span>
                                {event.safetyChecked && (
                                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <CheckCircle2 size={14} /> Sécurité Validée
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <span style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '4px',
                                background: priority.bg,
                                color: priority.color,
                                border: `1px solid ${priority.border}`
                            }}>
                                {priority.name}
                            </span>
                            <div className="actions" style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => archiveEvent(event)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}>
                                    <Archive size={16} />
                                </button>
                                <button onClick={() => handleDeleteEvent(event.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '0.2rem' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {event.objective && (
                        <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            background: 'var(--bg-secondary)', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)' 
                        }}>
                            <span style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                color: 'var(--text-secondary)', 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                letterSpacing: '0.05em'
                            }}>Objectif Scientifique</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, opacity: 0.9 }}>{event.objective}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={containerStyle}>
            {/* TOP BAR / NAVIGATION */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        onClick={() => navigate('/hugin')}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={18} /> Labo
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Registre des Activités</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', padding: '0.2rem', borderRadius: '8px' }}>
                        {(['day', 'week', 'month'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    background: viewMode === mode ? '#ffffff' : 'transparent',
                                    color: viewMode === mode ? '#0f172a' : '#64748b',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => navigateDate('prev')} style={navBtnStyle}><ChevronLeft size={18} /></button>
                        <button onClick={() => navigateDate('next')} style={navBtnStyle}><ChevronRight size={18} /></button>
                        <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
                             <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    outline: 'none',
                                    color: '#0f172a'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={contentWrapperStyle}>
                <main style={ledgerSheetStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', opacity: 0.8, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Protocoles Hugin Lab</p>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                {viewMode === 'day' && new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {viewMode === 'week' && `Semaine du ${new Date(getWeekDates()[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
                                {viewMode === 'month' && new Date(selectedDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </h1>
                        </div>
                        <button 
                            onClick={() => setIsCreating(true)}
                            style={{ 
                                background: '#2563eb', 
                                color: '#ffffff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                padding: '0.75rem 1.5rem', 
                                fontWeight: 700, 
                                fontSize: '0.9rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            <Plus size={18} /> Inscrire une activité
                        </button>
                    </div>

                    {/* CREATION MODAL / PANEL */}
                    {isCreating && (
                        <div style={{ 
                            position: 'fixed', 
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}>
                            <div style={{ 
                                background: 'var(--bg-primary)', 
                                borderRadius: '16px', 
                                width: '100%', 
                                maxWidth: '600px', 
                                boxShadow: 'var(--shadow-app)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden',
                                animation: 'modalOpen 0.3s ease-out'
                            }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Nouvelle Entrée au Registre</h3>
                                    <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Titre de la Manipulation</label>
                                            <input type="text" style={inputStyle} value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="ex: Analyse d'échantillons cliniques..." />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Horaire de Début</label>
                                            <input 
                                                type="time" 
                                                style={inputStyle} 
                                                value={newEvent.time} 
                                                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Ressource / Salle</label>
                                            <input 
                                                type="text" 
                                                style={inputStyle} 
                                                list="resource-suggestions"
                                                value={newEvent.resource} 
                                                onChange={e => setNewEvent({ ...newEvent, resource: e.target.value })} 
                                                placeholder="Saisissez ou choisissez..."
                                            />
                                            <datalist id="resource-suggestions">
                                                {RESOURCES.map(r => <option key={r} value={r} />)}
                                            </datalist>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Priorité et Niveau de Risque</label>
                                            <select style={inputStyle} value={newEvent.priority} onChange={e => setNewEvent({ ...newEvent, priority: e.target.value as any })}>
                                                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Objectif Scientifique & Académique</label>
                                            <textarea 
                                                style={{ ...inputStyle, height: 'auto', minHeight: '100px', resize: 'none' }} 
                                                value={newEvent.objective} 
                                                onChange={e => setNewEvent({ ...newEvent, objective: e.target.value })} 
                                                placeholder="Précisez les objectifs, protocoles ou contraintes de sécurité..."
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                        <button onClick={() => setIsCreating(false)} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>Annuler</button>
                                        <button onClick={handleCreateEvent} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', padding: '0.75rem 2rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}>Enregistrer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTENT SECTION */}
                    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                        {viewMode === 'day' && (
                            <div>
                                {events.filter(e => e.date === selectedDate).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                        <AlertCircle size={40} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Aucune entrée enregistrée pour cette date.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {events
                                            .filter(e => e.date === selectedDate)
                                            .sort((a, b) => a.time.localeCompare(b.time))
                                            .map(renderEventItem)
                                        }
                                    </div>
                                )}
                            </div>
                        )}

                        {viewMode === 'week' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                                {getWeekDates().map(date => {
                                    const isSelected = date === selectedDate;
                                    const dayEvents = events.filter(e => e.date === date);
                                    return (
                                        <div key={date} style={{ background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                                            <div 
                                                onClick={() => setSelectedDate(date)}
                                                style={{ 
                                                    padding: '0.75rem', 
                                                    textAlign: 'center', 
                                                    borderBottom: '1px solid #e2e8f0',
                                                    background: isSelected ? '#2563eb' : 'transparent',
                                                    color: isSelected ? '#fff' : '#64748b',
                                                    cursor: 'pointer',
                                                    fontWeight: 800,
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'][getWeekDates().indexOf(date)]} {new Date(date).getDate()}
                                            </div>
                                            <div style={{ padding: '0.5rem', flex: 1 }}>
                                                {dayEvents.sort((a, b) => a.time.localeCompare(b.time)).map(e => (
                                                    <div key={e.id} style={{ 
                                                        background: PRIORITIES.find(p => p.id === e.priority)?.bg,
                                                        border: `1px solid ${PRIORITIES.find(p => p.id === e.priority)?.border}`,
                                                        borderRadius: '4px',
                                                        padding: '0.4rem',
                                                        marginBottom: '0.4rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: '#0f172a'
                                                    }}>
                                                        {e.time} - {e.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {viewMode === 'month' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                                    {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map(d => (
                                        <div key={d} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{d}</div>
                                    ))}
                                    {getMonthDates().map((date, i) => (
                                        <div key={i} style={{ 
                                            background: date === selectedDate ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
                                            minHeight: '100px', 
                                            padding: '0.5rem',
                                            opacity: date ? 1 : 0.3
                                        }} onClick={() => date && setSelectedDate(date)}>
                                            {date && (
                                                <>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: date === selectedDate ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                                        {new Date(date).getDate()}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        {events.filter(e => e.date === date).slice(0, 3).map(e => (
                                                            <div key={e.id} style={{ height: '3px', borderRadius: '2px', background: PRIORITIES.find(p => p.id === e.priority)?.color }} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* QUICK ACCESS MODULES */}
                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem' }}>
                        {MODULES.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => navigate(m.path)}
                                style={{ 
                                    flex: 1, 
                                    background: 'var(--card-bg)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '12px', 
                                    padding: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'var(--text-primary)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'var(--card-bg)';
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                                    <AlertCircle size={20} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accéder à l'outil</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes modalOpen {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .actions {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                div:hover > div > div > .actions {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

// --- STYLES ---

const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-family)'
};

const headerStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)'
};

const contentWrapperStyle: React.CSSProperties = {
    background: 'transparent',
    padding: '2rem 0',
    minHeight: 'calc(100vh - 80px)'
};

const ledgerSheetStyle: React.CSSProperties = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 2rem'
};

const navBtnStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default Planning;
