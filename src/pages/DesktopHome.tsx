import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, Mail, Calendar, Search, StickyNote } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import GlobalSearch from '../components/GlobalSearch';
import QuickNotes from '../components/QuickNotes';

const DesktopHome = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const username = localStorage.getItem('currentUser')?.split('@')[0] || 'Utilisateur';

    const [currentTime, setCurrentTime] = useState(new Date());
    const [unreadCount, setUnreadCount] = useState(0);
    const [todayEvents, setTodayEvents] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadUnreadMessages = async () => {
            try {
                const { fetchModuleData } = await import('../utils/persistence');
                const messages = await fetchModuleData('messaging');
                if (messages && Array.isArray(messages)) {
                    const unread = messages.filter((msg: any) => 
                        msg.folder === 'inbox' && msg.read === false
                    ).length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
                setUnreadCount(0);
            }
        };

        loadUnreadMessages();
        const interval = setInterval(loadUnreadMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadTodayEvents = async () => {
            try {
                const { fetchModuleData } = await import('../utils/persistence');
                const events = await fetchModuleData('planning');
                if (events && Array.isArray(events)) {
                    const today = new Date().toISOString().split('T')[0];
                    const todayEventsFiltered = events
                        .filter((event: any) => event.date === today)
                        .sort((a: any, b: any) => a.time.localeCompare(b.time))
                        .slice(0, 4);
                    setTodayEvents(todayEventsFiltered);
                }
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };

        loadTodayEvents();
        const interval = setInterval(loadTodayEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.colors.bgPrimary,
            color: theme.colors.textPrimary,
            padding: '2rem'
        }}>
            {/* Header avec recherche et notes */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        background: `linear-gradient(135deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {getGreeting()}, {username}
                    </h1>
                    <p style={{ color: theme.colors.textSecondary, fontSize: '1.1rem' }}>
                        {formatDate(currentTime)}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: theme.colors.bgSecondary,
                            border: `1px solid ${theme.colors.accentPrimary}40`,
                            borderRadius: '0.75rem',
                            color: theme.colors.textPrimary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Search size={20} />
                        Rechercher (Ctrl+K)
                    </button>

                    <button
                        onClick={() => setIsNotesOpen(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: theme.colors.bgSecondary,
                            border: `1px solid ${theme.colors.accentSecondary}40`,
                            borderRadius: '0.75rem',
                            color: theme.colors.textPrimary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <StickyNote size={20} />
                        Notes rapides
                    </button>
                </div>
            </div>

            {/* Cartes d'information */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Horloge */}
                <div style={{
                    background: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.accentPrimary}20`,
                    borderRadius: '1rem',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <Clock size={48} style={{ color: theme.colors.accentPrimary, marginBottom: '1rem' }} />
                    <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {formatTime(currentTime)}
                    </div>
                    <div style={{ color: theme.colors.textSecondary }}>
                        Heure actuelle
                    </div>
                </div>

                {/* Messages */}
                <div 
                    onClick={() => navigate('/hugin/messaging')}
                    style={{
                        background: theme.colors.bgSecondary,
                        border: `1px solid ${theme.colors.accentPrimary}20`,
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <Mail size={48} style={{ color: theme.colors.accentPrimary, marginBottom: '1rem' }} />
                    <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {unreadCount}
                    </div>
                    <div style={{ color: theme.colors.textSecondary }}>
                        Messages non lus
                    </div>
                </div>

                {/* Événements */}
                <div 
                    onClick={() => navigate('/hugin/planning')}
                    style={{
                        background: theme.colors.bgSecondary,
                        border: `1px solid ${theme.colors.accentSecondary}20`,
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <Calendar size={48} style={{ color: theme.colors.accentSecondary, marginBottom: '1rem' }} />
                    <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {todayEvents.length}
                    </div>
                    <div style={{ color: theme.colors.textSecondary }}>
                        Événements aujourd'hui
                    </div>
                </div>
            </div>

            {/* Événements du jour */}
            {todayEvents.length > 0 && (
                <div style={{
                    background: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.accentPrimary}20`,
                    borderRadius: '1rem',
                    padding: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        📅 Événements d'aujourd'hui
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {todayEvents.map((event, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1rem',
                                    background: theme.colors.bgPrimary,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${theme.colors.accentPrimary}20`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {event.title}
                                    </div>
                                    {event.description && (
                                        <div style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>
                                            {event.description}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: theme.colors.accentPrimary + '20',
                                    borderRadius: '0.5rem',
                                    color: theme.colors.accentPrimary,
                                    fontWeight: 600
                                }}>
                                    {event.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {isSearchOpen && (
                <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            )}

            {isNotesOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: theme.colors.bgSecondary,
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <QuickNotes showFloatingButton={false} />
                        <button
                            onClick={() => setIsNotesOpen(false)}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: theme.colors.accentPrimary,
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#ffffff',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesktopHome;
