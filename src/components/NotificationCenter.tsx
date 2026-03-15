import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    useEffect(() => {
        const loadNotifications = () => {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                })));
            }
        };

        loadNotifications();
        const interval = setInterval(loadNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    // Charger le nombre de messages non lus depuis la messagerie
    useEffect(() => {
        const loadUnreadMessages = async () => {
            try {
                const authToken = localStorage.getItem('authToken');
                if (!authToken) return;

                const response = await fetch('/api/messaging/unread-count', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnreadMessagesCount(data.count || 0);
                }
            } catch (error) {
                // Silently fail - messaging system might not be running
                console.debug('Could not load unread messages count');
            }
        };

        loadUnreadMessages();
        const interval = setInterval(loadUnreadMessages, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const totalUnread = unreadCount + unreadMessagesCount;

    const markAsRead = (id: string) => {
        const updated = notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.removeItem('notifications');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="#10b981" />;
            case 'error': return <AlertCircle size={20} color="#ef4444" />;
            case 'warning': return <AlertCircle size={20} color="#f59e0b" />;
            default: return <Info size={20} color="#3b82f6" />;
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
        return `Il y a ${Math.floor(seconds / 86400)} j`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: '0.5rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <Bell size={20} />
                {totalUnread > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700
                    }}>
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '400px',
                        maxHeight: '500px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#0f172a'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                                Notifications {totalUnread > 0 && `(${totalUnread})`}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {notifications.length > 0 && (
                                    <>
                                        <button
                                            onClick={markAllAsRead}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'transparent',
                                                border: '1px solid #334155',
                                                borderRadius: '0.375rem',
                                                color: '#94a3b8',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Tout lire
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'transparent',
                                                border: '1px solid #334155',
                                                borderRadius: '0.375rem',
                                                color: '#94a3b8',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Effacer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Lien vers la messagerie si des messages non lus */}
                        {unreadMessagesCount > 0 && (
                            <div
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/hugin'); // MESSAGING DISABLED
                                }}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid #334155',
                                    cursor: 'pointer',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-hugin)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <MessageSquare size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#f1f5f9' }}>
                                        Nouveaux messages
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                                        {unreadMessagesCount} message{unreadMessagesCount > 1 ? 's' : ''} non lu{unreadMessagesCount > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#6366f1'
                                }} />
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: 'auto', background: '#1e293b' }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: '3rem',
                                    textAlign: 'center',
                                    color: '#94a3b8'
                                }}>
                                    <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid #334155',
                                            cursor: 'pointer',
                                            background: notif.read ? '#1e293b' : 'rgba(99, 102, 241, 0.1)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = notif.read ? '#1e293b' : 'rgba(99, 102, 241, 0.1)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ marginTop: '0.25rem' }}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <h4 style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        margin: 0,
                                                        color: '#f1f5f9'
                                                    }}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.read && (
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: '#6366f1',
                                                            marginTop: '0.25rem'
                                                        }} />
                                                    )}
                                                </div>
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    color: '#94a3b8',
                                                    margin: '0 0 0.5rem 0',
                                                    lineHeight: 1.4
                                                }}>
                                                    {notif.message}
                                                </p>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.75rem',
                                                    color: '#64748b',
                                                    opacity: 0.7
                                                }}>
                                                    <Clock size={12} />
                                                    {getTimeAgo(notif.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;

export const addNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string
) => {
    const stored = localStorage.getItem('notifications');
    const notifications = stored ? JSON.parse(stored) : [];
    
    const newNotif = {
        id: Date.now().toString(),
        type,
        title,
        message,
        timestamp: new Date(),
        read: false
    };
    
    notifications.unshift(newNotif);
    
    if (notifications.length > 50) {
        notifications.splice(50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
};
