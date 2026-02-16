/**
 * Système d'archivage automatique pour Odin
 * - Messages de plus de 1 mois → Archives
 * - Événements de planning de plus de 1 semaine → Archives
 * - Watchlist de recherche scientifique → Vérification automatique
 */

import { fetchModuleData, saveModuleItem, deleteModuleItem } from './persistence';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Archive automatiquement les messages de plus de 1 mois
 */
export const archiveOldMessages = async (): Promise<number> => {
    try {
        const messages = await fetchModuleData('messaging');
        if (!messages || !Array.isArray(messages)) return 0;

        const now = Date.now();
        let archivedCount = 0;

        for (const message of messages) {
            // Skip messages already in trash
            if (message.folder === 'trash') continue;

            const messageDate = new Date(message.date).getTime();
            const age = now - messageDate;

            // Archive messages older than 1 month
            if (age > ONE_MONTH_MS) {
                const archiveItem = {
                    id: `arch_msg_${message.id}_${Date.now()}`,
                    name: `Message: ${message.subject}`,
                    category: 'Internal',
                    size: `${(JSON.stringify(message).length / 1024).toFixed(1)} KB`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Archived message from ${message.sender} to ${message.recipient} regarding ${message.subject}.`,
                    originalData: message,
                    autoArchived: true
                };

                await saveModuleItem('hugin_it_archives', archiveItem);
                await deleteModuleItem('messaging', message.id);
                archivedCount++;
            }
        }

        return archivedCount;
    } catch (error) {
        console.error('Error archiving old messages:', error);
        return 0;
    }
};

/**
 * Archive automatiquement les événements de planning de plus de 1 semaine
 */
export const archiveOldPlanningEvents = async (): Promise<number> => {
    try {
        const events = await fetchModuleData('planning');
        if (!events || !Array.isArray(events)) return 0;

        const now = Date.now();
        let archivedCount = 0;

        for (const event of events) {
            const eventDate = new Date(event.date).getTime();
            const age = now - eventDate;

            // Archive events older than 1 week
            if (age > ONE_WEEK_MS) {
                const archiveItem = {
                    id: `arch_plan_${event.id}_${Date.now()}`,
                    name: `Planning: ${event.title}`,
                    category: 'Planning',
                    size: `${(JSON.stringify(event).length / 1024).toFixed(1)} KB`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Archived planning event: ${event.title} at ${event.resource} on ${event.date} at ${event.time}.`,
                    originalData: event,
                    autoArchived: true
                };

                await saveModuleItem('hugin_it_archives', archiveItem);
                await deleteModuleItem('planning', event.id);
                archivedCount++;
            }
        }

        return archivedCount;
    } catch (error) {
        console.error('Error archiving old planning events:', error);
        return 0;
    }
};

/**
 * Exécute la veille automatique de recherche scientifique
 */
export const runAutoWatchSearch = async (): Promise<number> => {
    try {
        const watchList = await fetchModuleData('research_watchlist');
        if (!watchList || !Array.isArray(watchList)) return 0;

        let searchCount = 0;

        for (const watchItem of watchList) {
            // Trigger search for each watch item
            // This would integrate with the search functions in ScientificResearch.tsx
            console.log(`Auto-watch search for: ${watchItem.type} - ${watchItem.value}`);
            searchCount++;
        }

        return searchCount;
    } catch (error) {
        console.error('Error running auto-watch search:', error);
        return 0;
    }
};

/**
 * Exécute tous les processus d'archivage automatique
 */
export const runAutoArchive = async (): Promise<{
    messages: number;
    planning: number;
    watchSearches: number;
}> => {
    const [messages, planning, watchSearches] = await Promise.all([
        archiveOldMessages(),
        archiveOldPlanningEvents(),
        runAutoWatchSearch()
    ]);

    return { messages, planning, watchSearches };
};

/**
 * Initialise l'archivage automatique périodique
 * Exécute toutes les 6 heures
 */
export const initAutoArchive = () => {
    // Run immediately on init
    runAutoArchive().then(result => {
        console.log('Auto-archive completed:', result);
    });

    // Run every 6 hours
    setInterval(() => {
        runAutoArchive().then(result => {
            console.log('Auto-archive completed:', result);
        });
    }, 6 * 60 * 60 * 1000);
};
