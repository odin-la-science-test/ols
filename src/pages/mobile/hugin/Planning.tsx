import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Clock, MapPin, User, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../../utils/persistence';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

const MobilePlanning = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [events, setEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [view, setView] = useState<'list' | 'add'>('list');
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        resource: '',
        description: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await fetchModuleData('planning');
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const addEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            showToast('Titre et date requis', 'error');
            return;
        }

        const event = {
            id: Date.now().toString(),
            ...newEvent,
            createdBy: localStorage.getItem('currentUser') || 'user@ols.com'
        };

        await saveModuleItem('planning', event);
        setEvents([...events, event]);
        setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', resource: '', description: '' });
        setView('list');
        showToast('Événement ajouté', 'success');
    };

    const deleteEvent = async (id: string) => {
        await deleteModuleItem('planning', id);
        setEvents(events.filter(e => e.id !== id));
        showToast('Événement supprimé', 'success');
    };

    const todayEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                day: date.getDate(),
                dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            });
        }
        return days;
    };

    return (
        <div className="mobile-app">
            {/* Header */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => view === 'list' ? navigate('/hugin') : setView('list')} 
                            className="mobile-btn-icon"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="mobile-header-title" style={{ fontSize: '1.5rem' }}>Planning</h1>
                            <p className="mobile-header-subtitle">{events.length} événements</p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button 
                            onClick={() => setView('add')} 
                            className="mobile-btn-icon"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mobile-content">
                {view === 'list' && (
                    <>
                        {/* Date Selector */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '0.75rem', 
                            overflowX: 'auto', 
                            paddingBottom: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            {getNextDays().map(day => (
                                <button
                                    key={day.date}
                                    onClick={() => setSelectedDate(day.date)}
                                    className="mobile-card"
                                    style={{
                                        minWidth: '70px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        border: selectedDate === day.date ? '2px solid var(--mobile-primary)' : '1px solid var(--mobile-border)',
                                        background: selectedDate === day.date ? 'rgba(102, 126, 234, 0.1)' : 'var(--mobile-card)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', color: 'var(--mobile-text-secondary)' }}>
                                        {day.dayName}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedDate === day.date ? 'var(--mobile-primary)' : 'var(--mobile-text)' }}>
                                        {day.day}
                                    </div>
                                    {day.isToday && (
                                        <div className="mobile-badge mobile-badge-primary" style={{ marginTop: '0.25rem', fontSize: '0.65rem' }}>
                                            Aujourd'hui
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Events List */}
                        {todayEvents.length === 0 ? (
                            <div className="mobile-empty">
                                <div className="mobile-empty-icon">
                                    <Calendar size={64} />
                                </div>
                                <div className="mobile-empty-title">Aucun événement</div>
                                <div className="mobile-empty-subtitle">Aucun événement prévu ce jour</div>
                            </div>
                        ) : (
                            <div className="mobile-list">
                                {todayEvents.map(event => (
                                    <div key={event.id} className="mobile-card mobile-card-elevated">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <h3 className="mobile-card-title" style={{ flex: 1 }}>
                                                {event.title}
                                            </h3>
                                            <button
                                                onClick={() => deleteEvent(event.id)}
                                                style={{
                                                    background: 'rgba(248, 113, 113, 0.1)',
                                                    border: 'none',
                                                    borderRadius: 'var(--mobile-radius-md)',
                                                    padding: '0.5rem',
                                                    color: 'var(--mobile-error)',
                                                    cursor: 'pointer',
                                                    marginLeft: '1rem'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--mobile-text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} />
                                                {event.time}
                                            </div>
                                            {event.resource && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <MapPin size={16} />
                                                    {event.resource}
                                                </div>
                                            )}
                                            {event.createdBy && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <User size={16} />
                                                    {event.createdBy.split('@')[0]}
                                                </div>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--mobile-text)' }}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {view === 'add' && (
                    <div className="mobile-card mobile-card-elevated">
                        <h2 className="mobile-card-title" style={{ marginBottom: '1.5rem' }}>Nouvel Événement</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Titre *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Réunion, Analyse, etc."
                                    className="mobile-input"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Date *</label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="mobile-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Heure</label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        className="mobile-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Lieu/Ressource</label>
                                <input
                                    type="text"
                                    value={newEvent.resource}
                                    onChange={(e) => setNewEvent({ ...newEvent, resource: e.target.value })}
                                    placeholder="Salle A, Équipement X, etc."
                                    className="mobile-input"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Détails de l'événement..."
                                    className="mobile-input"
                                    style={{ height: '100px', resize: 'vertical' }}
                                />
                            </div>

                            <button 
                                onClick={addEvent}
                                className="mobile-btn mobile-btn-primary"
                                style={{ width: '100%' }}
                            >
                                <Plus size={18} />
                                Ajouter l'événement
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* FAB for quick add */}
            {view === 'list' && (
                <button 
                    onClick={() => setView('add')}
                    className="mobile-fab"
                >
                    <Plus size={24} />
                </button>
            )}
        </div>
    );
};

export default MobilePlanning;
