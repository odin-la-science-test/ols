/**
 * Configuration du module de messagerie interne
 * 
 * Ce fichier centralise toutes les configurations du système de messagerie,
 * incluant les paramètres WebSocket, les limites de messages, et les options
 * de base de données.
 */

export const MESSAGING_CONFIG = {
  // Configuration WebSocket
  websocket: {
    port: 8080,
    reconnectAttempts: 6,
    reconnectDelays: [1000, 2000, 4000, 8000, 16000, 30000], // Backoff exponentiel
    connectionTimeout: 30000, // 30 secondes
    heartbeatInterval: 30000, // 30 secondes
  },

  // Limites de messages
  messages: {
    maxLength: 2000,
    initialLoadLimit: 50,
    paginationBatchSize: 50,
    typingIndicatorTimeout: 3000, // 3 secondes
  },

  // Limites de canaux
  channels: {
    nameMinLength: 3,
    nameMaxLength: 50,
    descriptionMaxLength: 500,
  },

  // Rate limiting
  rateLimiting: {
    maxMessagesPerWindow: 10,
    windowDurationMs: 10000, // 10 secondes
  },

  // Configuration de la base de données
  database: {
    path: 'databases/messaging.sqlite',
    backupInterval: 86400000, // 24 heures en millisecondes
    retryAttempts: 1,
    retryDelayMs: 100,
  },

  // Délais de performance
  performance: {
    messageDeliveryMaxMs: 2000,
    searchMaxMs: 3000,
  },

  // Options de notification
  notifications: {
    preferences: ['all', 'mentions', 'muted'] as const,
  },

  // Rôles et permissions
  roles: {
    available: ['admin', 'moderator', 'member'] as const,
    default: 'member' as const,
  },

  // Statuts utilisateur
  userStatus: {
    available: ['online', 'away', 'offline'] as const,
    default: 'offline' as const,
  },
} as const;

// Types dérivés de la configuration
export type NotificationPreference = typeof MESSAGING_CONFIG.notifications.preferences[number];
export type UserRole = typeof MESSAGING_CONFIG.roles.available[number];
export type UserStatus = typeof MESSAGING_CONFIG.userStatus.available[number];
