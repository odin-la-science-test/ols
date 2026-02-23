import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, Mail, Calendar, Search, StickyNote, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import GlobalSearch from '../components/GlobalSearch';
import QuickNotes from '../components/QuickNotes';

interface Event {
    id?: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    type?: string;
}

const DesktopHome = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const username = localStorage.getItem('currentUser')?.split('@')[0] || 'Utilisateur';

    const [currentTime, setCurrentTime] = useState(new Date());
    const [unreadCount, setUnreadCount] = useState(0);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
        const loadEvents = async () => {
            try {
                const { fetchModuleData } = await import('../utils/persistence');
                const events = await fetchModuleData('planning');
                if (events && Array.isArray(events)) {
                    setAllEvents(events);
                }
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };

        loadEvents();
        const interval = setInterval(loadEvents, 30000);
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

    // Fonctions pour le calendrier
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek };
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return allEvents.filter(event => event.date === dateStr);
    };

    const getTodayEvents = () => {
        const today = new Date().toISOString().split('T')[0];
        return allEvents
            .filter(event => event.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    const getSelectedDateEvents = () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        return allEvents
            .filter(event => event.date === dateStr)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isSelectedDate = (date: Date) => {
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];
        const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        // En-tête des jours
        const header = weekDays.map(day => (
            <div key={day} style={{
                padding: '0.5rem',
                textAlign: 'center',
                fontWeight: 600,
                color: theme.colors.textSecondary,
                fontSize: '0.85rem'
            }}>
                {day}
            </div>
        ));

        // Jours vides avant le début du mois
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} />);
        }

        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const isTodayDate = isToday(date);
            const isSelected = isSelectedDate(date);

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    style={{
                        padding: '0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '0.5rem',
                        background: isSelected 
                            ? theme.colors.accentPrimary 
                            : isTodayDate 
                            ? theme.colors.accentPrimary + '20'
                            : 'transparent',
                        color: isSelected ? '#ffffff' : theme.colors.textPrimary,
                        fontWeight: isTodayDate || isSelected ? 700 : 400,
                        border: isTodayDate && !isSelected ? `2px solid ${theme.colors.accentPrimary}` : 'none',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.background = theme.colors.bgTertiary;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.background = isTodayDate 
                                ? theme.colors.accentPrimary + '20'
                                : 'transparent';
                        }
                    }}
                >
                    {day}
                    {hasEvents && (
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: isSelected ? '#ffffff' : theme.colors.accentSecondary
                        }} />
                    )}
                </div>
            );
        }

        return (
            <>
                {header}
                {days}
            </>
        );
    };

    const todayEvents = getTodayEvents();
    const selectedDateEvents = getSelectedDateEvents();

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
                gridTemplateColumns: 'repeat(3, 1fr)',
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

            {/* Planning et événements */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Calendrier */}
                <div style={{
                    background: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.accentPrimary}20`,
                    borderRadius: '1rem',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <button
                            onClick={previousMonth}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textPrimary,
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            margin: 0
                        }}>
                            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={nextMonth}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textPrimary,
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '0.25rem'
                    }}>
                        {renderCalendar()}
                    </div>
                    <button
                        onClick={() => navigate('/hugin/planning')}
                        style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem',
                            background: theme.colors.accentPrimary,
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#ffffff',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        <Plus size={20} />
                        Ajouter un événement
                    </button>
                </div>

                {/* Événements du jour sélectionné */}
                <div style={{
                    background: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.accentSecondary}20`,
                    borderRadius: '1rem',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Calendar size={24} />
                        {isToday(selectedDate) ? "Aujourd'hui" : selectedDate.toLocaleDateString('fr-FR', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map((event, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '1rem',
                                        background: theme.colors.bgPrimary,
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${theme.colors.accentPrimary}20`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => navigate('/hugin/planning')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = theme.colors.accentPrimary + '20';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                            {event.title}
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            background: theme.colors.accentPrimary + '20',
                                            borderRadius: '0.25rem',
                                            color: theme.colors.accentPrimary,
                                            fontWeight: 600,
                                            fontSize: '0.85rem'
                                        }}>
                                            {event.time}
                                        </div>
                                    </div>
                                    {event.description && (
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: theme.colors.textSecondary,
                                            lineHeight: '1.4'
                                        }}>
                                            {event.description}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: theme.colors.textSecondary
                            }}>
                                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Aucun événement prévu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Événements d'aujourd'hui (si différent de la date sélectionnée) */}
            {!isToday(selectedDate) && todayEvents.length > 0 && (
                <div style={{
                    background: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.accentPrimary}20`,
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                        📅 Événements d'aujourd'hui
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
