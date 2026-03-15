/**
 * Schéma de base de données SQLite pour le système de messagerie interne
 * 
 * Ce fichier définit toutes les tables et index nécessaires pour le système
 * de messagerie, incluant les utilisateurs, canaux, messages et notifications.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.5 - Data Persistence and Storage
 */

/**
 * Table des utilisateurs du système de messagerie
 * Requirement: 1.1 - User Authentication and Session Management
 */
export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS messaging_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'moderator', 'member')),
    status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'away', 'offline')),
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
  );
`;

/**
 * Table des canaux de communication
 * Requirement: 3.1 - Channel Creation and Management
 */
export const CREATE_CHANNELS_TABLE = `
  CREATE TABLE IF NOT EXISTS messaging_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_private INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES messaging_users(id)
  );
`;

/**
 * Index pour optimiser la recherche de canaux par nom
 */
export const CREATE_CHANNELS_NAME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_channels_name 
  ON messaging_channels(name);
`;

/**
 * Table des membres de canaux
 * Requirement: 7.1 - Channel Membership Management
 */
export const CREATE_CHANNEL_MEMBERS_TABLE = `
  CREATE TABLE IF NOT EXISTS messaging_channel_members (
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL,
    notification_preference TEXT NOT NULL DEFAULT 'all' 
      CHECK(notification_preference IN ('all', 'mentions', 'muted')),
    PRIMARY KEY (channel_id, user_id),
    FOREIGN KEY (channel_id) REFERENCES messaging_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES messaging_users(id) ON DELETE CASCADE
  );
`;

/**
 * Index pour optimiser la recherche des canaux d'un utilisateur
 */
export const CREATE_CHANNEL_MEMBERS_USER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_channel_members_user 
  ON messaging_channel_members(user_id);
`;

/**
 * Table des messages (canaux et messages directs)
 * Requirement: 2.1 - Direct Messaging, 4.1 - Channel Messaging
 */
export const CREATE_MESSAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS messaging_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    channel_id TEXT,
    recipient_id TEXT,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    deleted_at INTEGER,
    CHECK ((channel_id IS NOT NULL AND recipient_id IS NULL) OR 
           (channel_id IS NULL AND recipient_id IS NOT NULL)),
    FOREIGN KEY (sender_id) REFERENCES messaging_users(id),
    FOREIGN KEY (channel_id) REFERENCES messaging_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES messaging_users(id)
  );
`;

/**
 * Index pour optimiser la récupération des messages de canal
 */
export const CREATE_MESSAGES_CHANNEL_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_messages_channel 
  ON messaging_messages(channel_id, created_at);
`;

/**
 * Index pour optimiser la récupération des messages directs
 */
export const CREATE_MESSAGES_DM_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_messages_dm 
  ON messaging_messages(sender_id, recipient_id, created_at);
`;

/**
 * Index pour optimiser la recherche de messages par contenu
 */
export const CREATE_MESSAGES_CONTENT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_messages_content 
  ON messaging_messages(content);
`;

/**
 * Table des notifications
 * Requirement: 10.1 - Notification System
 */
export const CREATE_NOTIFICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS messaging_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    conversation_type TEXT NOT NULL CHECK(conversation_type IN ('channel', 'dm')),
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_read_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES messaging_users(id) ON DELETE CASCADE
  );
`;

/**
 * Index unique pour éviter les doublons de notifications
 */
export const CREATE_NOTIFICATIONS_USER_CONVERSATION_INDEX = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_conversation 
  ON messaging_notifications(user_id, conversation_id);
`;

/**
 * Liste de toutes les commandes SQL pour créer le schéma complet
 */
export const ALL_SCHEMA_COMMANDS = [
  CREATE_USERS_TABLE,
  CREATE_CHANNELS_TABLE,
  CREATE_CHANNELS_NAME_INDEX,
  CREATE_CHANNEL_MEMBERS_TABLE,
  CREATE_CHANNEL_MEMBERS_USER_INDEX,
  CREATE_MESSAGES_TABLE,
  CREATE_MESSAGES_CHANNEL_INDEX,
  CREATE_MESSAGES_DM_INDEX,
  CREATE_MESSAGES_CONTENT_INDEX,
  CREATE_NOTIFICATIONS_TABLE,
  CREATE_NOTIFICATIONS_USER_CONVERSATION_INDEX,
];

/**
 * Fonction utilitaire pour exécuter toutes les commandes de création de schéma
 * @param db Instance de base de données SQLite
 */
export function createSchema(db: any): void {
  for (const command of ALL_SCHEMA_COMMANDS) {
    db.exec(command);
  }
}
