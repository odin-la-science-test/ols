/**
 * Utilitaire pour nettoyer les messages fantômes
 * À exécuter une fois pour supprimer les messages bloqués
 */

export const clearPhantomMessages = () => {
    try {
        // Nettoyer les notifications
        const notificationsKey = 'odin-notifications';
        localStorage.removeItem(notificationsKey);
        
        // Nettoyer les messages de messagerie
        const messagingKeys = Object.keys(localStorage).filter(key => 
            key.includes('messaging') || key.includes('message')
        );
        
        messagingKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(data)) {
                    // Filtrer les messages invalides ou fantômes
                    const cleaned = data.filter(msg => 
                        msg && 
                        msg.id && 
                        msg.sender && 
                        msg.recipient &&
                        msg.date
                    );
                    localStorage.setItem(key, JSON.stringify(cleaned));
                }
            } catch (e) {
                console.error(`Error cleaning ${key}:`, e);
            }
        });

        // Nettoyer les toasts persistants
        const toastKeys = Object.keys(localStorage).filter(key => 
            key.includes('toast') || key.includes('notification')
        );
        toastKeys.forEach(key => localStorage.removeItem(key));

        console.log('✅ Messages fantômes nettoyés');
        return true;
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        return false;
    }
};

/**
 * Nettoyer automatiquement au démarrage si nécessaire
 */
export const autoCleanOnStart = () => {
    const lastClean = localStorage.getItem('last-phantom-clean');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Nettoyer une fois par jour maximum
    if (!lastClean || (now - parseInt(lastClean)) > oneDay) {
        clearPhantomMessages();
        localStorage.setItem('last-phantom-clean', now.toString());
    }
};
