/**
 * Types TypeScript pour le système de messagerie interne
 * 
 * Ce fichier définit tous les types, enums et interfaces utilisés
 * dans le module de messagerie, incluant les modèles de données,
 * les interfaces de service et les types d'API.
 * 
 * Requirement: 13.1 - Module Isolation
 */

// Export all types from the types file
// Using inline 'type' keyword for each export to ensure proper ES module compatibility
export {
  type Role,
  type UserStatus,
  type NotificationPreference,
  type User,
  type Channel,
  type Message,
  type ChannelMember,
  type Notification,
  type DirectMessageConversation,
  type SearchFilters,
  type SearchResult,
  type ClientEventType,
  type ServerEventType,
  type MessageSendPayload,
  type TypingPayload,
  type PresenceUpdatePayload,
  type WebSocketMessage,
  type ErrorCategory,
  type ErrorCode,
  type ErrorResponse,
  type IMessageService,
  type IChannelService,
  type IPermissionService,
  type INotificationService,
  type IWebSocketManager,
  type Permission,
  type CreateChannelRequest,
  type UpdateChannelRequest,
  type SendMessageRequest,
  type SearchRequest,
  type AssignRoleRequest,
  type UpdateNotificationPreferencesRequest,
  type PaginatedResponse,
  type ValidationResult,
  type ValidationError,
  type AuditAction,
  type AuditLogEntry,
  type RateLimitState,
  type CacheEntry,
  type CacheOptions
} from './types';

// Export all constants from the constants file
export { 
  RoleValues, 
  UserStatusValues, 
  NotificationPreferenceValues, 
  ROLE_PERMISSIONS 
} from './constants';


