import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Pause, RotateCcw, Trash2, Clock, Bell } from 'lucide-react';
import { useToast } from '../../components/ToastContext';

interface Timer {
    id: string;
    name: string;
    duration: number; // en secondes
    remaining: number;
    isRunning: boolean;
    color: string;
}

const LabTimer = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [timers, setTimers] = useState<Timer[]>([]);
    const [newTimerName, setNewTimerName] = useState('');
    const [newTimerMinutes, setNewTimerMinutes] = useState(5);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => prev.map(timer => {
                if (!timer.isRunning) return timer;
                
                const newRemaining = timer.remaining - 1;
                
                if (newRemaining <= 0) {
                    showToast(`⏰ Timer "${timer.name}" terminé!`, 'success');
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Timer Terminé', {
                            body: `Le timer "${timer.name}" est terminé!`,
                            icon: '/favicon.ico'
                        });
                    }
                    return { ...timer, remaining: 0, isRunning: false };
                }
                
                return { ...timer, remaining: newRemaining };
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [showToast]);

    const addTimer = () => {
        if (!newTimerName.trim()) {
            showToast('Veuillez entrer un nom pour le timer', 'error');
            return;
        }

        const newTimer: Timer = {
            id: Date.now().toString(),
            name: newTimerName,
            duration: newTimerMinutes * 60,
            remaining: newTimerMinutes * 60,
            isRunning: false,
            color: colors[timers.length % colors.length]
        };

        setTimers([...timers, newTimer]);
        setNewTimerName('');
        setNewTimerMinutes(5);
        showToast('Timer ajouté', 'success');
    };

    const toggleTimer = (id: string) => {
        setTimers(prev => prev.map(t => 
            t.id === id ? { ...t, isRunning: !t.isRunning } : t
        ));
    };

    const resetTimer = (id: string) => {
        setTimers(prev => prev.map(t => 
            t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t
        ));
    };

    const deleteTimer = (id: string) => {
        setTimers(prev => prev.filter(t => t.id !== id));
        showToast('Timer supprimé', 'info');
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <button
                    onClick={() => navigate('/hugin')}
                    className="btn"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} />
                    Retour au Labo
                </button>

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Clock size={32} color="var(--accent-hugin)" />
                        LabTimer - Gestionnaire de Timers
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Gérez plusieurs timers simultanément pour vos expériences
                    </p>
                </div>

                {/* Add Timer Form */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Nouveau Timer
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Nom de l'expérience
                            </label>
                            <input
                                type="text"
                                value={newTimerName}
                                onChange={(e) => setNewTimerName(e.target.value)}
                                placeholder="Ex: Incubation bactéries"
                                className="input-field"
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                        
                        <div style={{ width: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Durée (minutes)
                            </label>
                            <input
                                type="number"
                                value={newTimerMinutes}
                                onChange={(e) => setNewTimerMinutes(Number(e.target.value))}
                                min="1"
                                className="input-field"
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                        
                        <button
                            onClick={addTimer}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} />
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Timers Grid */}
                {timers.length === 0 ? (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        padding: '4rem',
                        textAlign: 'center'
                    }}>
                        <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--text-secondary)' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Aucun timer actif. Ajoutez-en un pour commencer!
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {timers.map(timer => {
                            const progress = (timer.remaining / timer.duration) * 100;
                            
                            return (
                                <div
                                    key={timer.id}
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '1rem',
                                        border: `2px solid ${timer.color}`,
                                        padding: '1.5rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: `${progress}%`,
                                            background: `${timer.color}15`,
                                            transition: 'height 1s linear'
                                        }}
                                    />
                                    
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, flex: 1 }}>
                                                {timer.name}
                                            </h3>
                                            <button
                                                onClick={() => deleteTimer(timer.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div style={{
                                            fontSize: '3rem',
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            marginBottom: '1rem',
                                            fontFamily: 'monospace',
                                            color: timer.remaining <= 60 ? '#ef4444' : timer.color
                                        }}>
                                            {formatTime(timer.remaining)}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => toggleTimer(timer.id)}
                                                className="btn"
                                                style={{
                                                    flex: 1,
                                                    background: timer.isRunning ? '#ef4444' : timer.color,
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {timer.isRunning ? <Pause size={18} /> : <Play size={18} />}
                                                {timer.isRunning ? 'Pause' : 'Démarrer'}
                                            </button>
                                            
                                            <button
                                                onClick={() => resetTimer(timer.id)}
                                                className="btn"
                                                style={{
                                                    padding: '0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabTimer;
