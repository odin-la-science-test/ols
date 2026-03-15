/**
 * Module de Messagerie Interne
 * 
 * Point d'entrée principal du système de messagerie de type Discord.
 * Ce module est complètement isolé et peut être activé/désactivé indépendamment.
 * 
 * @module messaging
 */

// Export du composant principal
export { MessagingContainer, useMessaging } from './MessagingContainer';

// Export des composants individuels (si besoin d'utilisation séparée)
export { ChannelList } from './components/ChannelList';
export { MessageView } from './components/MessageView';
export { MessageInput } from './components/MessageInput';
export { UserList } from './components/UserList';

// Export du hook WebSocket
export { useWebSocket } from './hooks/useWebSocket';

// Export des utilitaires
export { formatMessage, linkifyUrls, formatMarkdown } from './utils/messageFormatter';
export { formatSmartTime, formatRelativeTime, formatAbsoluteTime } from './utils/timeUtils';

// Export des types - import directly from types file to avoid re-export issues
export type { Channel } from '../messaging-types-v4/types';
export type { DirectMessageConversation } from '../messaging-types-v4/types';
export type { Message } from '../messaging-types-v4/types';
export type { User } from '../messaging-types-v4/types';
export type { UserStatus } from '../messaging-types-v4/types';
export type { Role } from '../messaging-types-v4/types';
export type { NotificationPreference } from '../messaging-types-v4/types';

/**
 * Initialise le module de messagerie
 * 
 * @param config Configuration du module
 * @returns Objet avec les méthodes de contrôle du module
 * 
 * @example
 * ```tsx
 * import { initializeMessaging } from './messaging-ui';
 * 
 * const messaging = initializeMessaging({
 *   wsUrl: 'ws://localhost:8080',
 *   apiUrl: '/api/messaging',
 * });
 * 
 * // Démarrer le module
 * messaging.start();
 * 
 * // Arrêter le module
 * messaging.stop();
 * ```
 */
export interface MessagingConfig {
  wsUrl?: string;
  apiUrl?: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function initializeMessaging(config: MessagingConfig = {}) {
  const defaultConfig = {
    wsUrl: 'ws://localhost:8080',
    apiUrl: '/api/messaging',
    reconnectDelay: 1000,
    maxReconnectAttempts: 10,
  };

  const finalConfig = { ...defaultConfig, ...config };

  return {
    config: finalConfig,
    
    /**
     * Démarre le module de messagerie
     */
    start: () => {
      console.log('[Messaging] Module started with config:', finalConfig);
      // TODO: Initialiser les services si nécessaire
    },

    /**
     * Arrête le module de messagerie
     */
    stop: () => {
      console.log('[Messaging] Module stopped');
      // TODO: Nettoyer les ressources
    },

    /**
     * Vérifie si le module est actif
     */
    isActive: () => {
      return true; // TODO: Implémenter la vérification réelle
    },
  };
}

/**
 * Guide d'intégration
 * 
 * ## Installation
 * 
 * 1. Installer les dépendances:
 * ```bash
 * npm install better-sqlite3 ws uuid
 * npm install --save-dev @types/better-sqlite3 @types/ws @types/uuid
 * ```
 * 
 * 2. Démarrer le serveur WebSocket:
 * ```bash
 * node src/messaging-api/server.ts
 * ```
 * 
 * ## Utilisation dans React
 * 
 * ```tsx
 * import { MessagingContainer } from './messaging-ui';
 * 
 * function App() {
 *   const currentUserId = 'user-123';
 *   const authToken = 'your-auth-token';
 * 
 *   return (
 *     <MessagingContainer
 *       currentUserId={currentUserId}
 *       authToken={authToken}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Ajout d'une route
 * 
 * ```tsx
 * import { MessagingContainer } from './messaging-ui';
 * 
 * // Dans votre routeur
 * <Route path="/messaging" element={
 *   <MessagingContainer
 *     currentUserId={user.id}
 *     authToken={user.token}
 *   />
 * } />
 * ```
 * 
 * ## Configuration du serveur WebSocket
 * 
 * Le serveur WebSocket doit être démarré séparément:
 * 
 * ```typescript
 * import { startMessagingServer } from './messaging-api/server';
 * 
 * startMessagingServer();
 * ```
 * 
 * ## Base de données
 * 
 * La base de données SQLite sera créée automatiquement au premier démarrage
 * dans `databases/messaging.sqlite`.
 * 
 * ## Sécurité
 * 
 * - Tous les messages sont sanitizés contre les attaques XSS
 * - Rate limiting: 10 messages par 10 secondes par utilisateur
 * - Authentification requise pour toutes les opérations
 * - Contrôle d'accès basé sur les rôles (Admin, Moderator, Member)
 * 
 * ## Fonctionnalités
 * 
 * - ✅ Messages directs (DM)
 * - ✅ Canaux de discussion (publics et privés)
 * - ✅ Communication temps réel via WebSocket
 * - ✅ Reconnexion automatique avec backoff exponentiel
 * - ✅ Formatage Markdown (gras, italique, code)
 * - ✅ Mentions @username
 * - ✅ Détection automatique des URLs
 * - ✅ Support des emojis
 * - ✅ Indicateurs de typing
 * - ✅ Statuts de présence (online, away, offline)
 * - ✅ Notifications et compteurs de non lus
 * - ✅ Gestion des rôles et permissions
 * - ✅ Recherche de messages (à implémenter dans l'UI)
 * - ✅ Pagination des messages (50 par batch)
 * - ✅ Scroll infini
 * 
 * ## Architecture
 * 
 * ```
 * src/messaging-ui/          # Composants React
 * src/messaging-core/         # Services backend
 * src/messaging-api/          # Serveur WebSocket et routes REST
 * src/messaging-db/           # Schéma et gestion de la base de données
 * src/messaging-types/        # Définitions TypeScript
 * databases/messaging.sqlite  # Base de données SQLite
 * ```
 * 
 * ## Support
 * 
 * Pour plus d'informations, consultez:
 * - README: src/messaging-core/README.md
 * - Documentation technique: .kiro/specs/internal-messaging/design.md
 * - Requirements: .kiro/specs/internal-messaging/requirements.md
 */
