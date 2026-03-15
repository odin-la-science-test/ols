/**
 * Core type definitions for the messaging system
 * This file contains ONLY the type definitions without any const exports
 */

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export type Role = 'admin' | 'moderator' | 'member';
export type UserStatus = 'online' | 'away' | 'offline';
export type NotificationPreference = 'all' | 'mentions' | 'muted';

// ============================================================================
// DATA MODELS
// ============================================================================

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  createdAt: number;
  lastSeen: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  channelId?: string;
  recipientId?: string;
  content: string;
  createdAt: number;
  deletedAt?: number;
}

export interface ChannelMember {
  channelId: string;
  userId: string;
  joinedAt: number;
  notificationPreference: NotificationPreference;
}

export interface Notification {
  id: string;
  userId: string;
  conversationId: string;
  conversationType: 'channel' | 'dm';
  unreadCount: number;
  lastReadAt?: number;
}

export interface DirectMessageConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantStatus: UserStatus;
  lastMessage?: Message;
  unreadCount: number;
}

// ============================================================================
// SEARCH AND FILTERS
// ============================================================================

export interface SearchFilters {
  sender?: string;
  dateFrom?: number;
  dateTo?: number;
  channelId?: string;
}

export interface SearchResult {
  message: Message;
  senderName: string;
  channelName?: string;
  context: string;
  highlights: string[];
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export type ClientEventType = 
  | 'message:send'
  | 'typing:start'
  | 'typing:stop'
  | 'presence:update';

export type ServerEventType =
  | 'message:new'
  | 'message:deleted'
  | 'typing:indicator'
  | 'presence:changed'
  | 'notification:new';

export interface MessageSendPayload {
  channelId?: string;
  recipientId?: string;
  content: string;
}

export interface TypingPayload {
  conversationId: string;
}

export interface PresenceUpdatePayload {
  status: UserStatus;
}

export interface WebSocketMessage<T = any> {
  type: ClientEventType | ServerEventType;
  payload: T;
  timestamp: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ErrorCategory = 
  | 'validation'
  | 'permission'
  | 'resource'
  | 'system';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'WEBSOCKET_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'DUPLICATE_RESOURCE';

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: number;
    requestId?: string;
  };
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface IMessageService {
  sendDirectMessage(senderId: string, recipientId: string, content: string): Promise<Message>;
  sendChannelMessage(senderId: string, channelId: string, content: string): Promise<Message>;
  getDirectMessages(userId1: string, userId2: string, limit: number, offset: number): Promise<Message[]>;
  getChannelMessages(channelId: string, limit: number, offset: number): Promise<Message[]>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  searchMessages(userId: string, query: string, filters: SearchFilters): Promise<SearchResult[]>;
}

export interface IChannelService {
  createChannel(creatorId: string, name: string, description?: string, isPrivate?: boolean): Promise<Channel>;
  updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel>;
  deleteChannel(channelId: string): Promise<void>;
  getChannels(userId: string): Promise<Channel[]>;
  addMember(channelId: string, userId: string): Promise<void>;
  removeMember(channelId: string, userId: string): Promise<void>;
  getMembers(channelId: string): Promise<User[]>;
}

export interface IPermissionService {
  checkPermission(userId: string, permission: Permission): Promise<boolean>;
  assignRole(userId: string, role: Role): Promise<void>;
  getUserRole(userId: string): Promise<Role>;
  canAccessChannel(userId: string, channelId: string): Promise<boolean>;
  canDeleteMessage(userId: string, messageId: string): Promise<boolean>;
}

export interface INotificationService {
  notifyDirectMessage(recipientId: string, message: Message): Promise<void>;
  notifyMention(userId: string, message: Message): Promise<void>;
  getUnreadCount(userId: string, conversationId: string): Promise<number>;
  markAsRead(userId: string, conversationId: string): Promise<void>;
  updatePreferences(userId: string, channelId: string, preference: NotificationPreference): Promise<void>;
}

export interface IWebSocketManager {
  connect(userId: string, token: string): Promise<WebSocket>;
  disconnect(userId: string): void;
  send(userId: string, message: WebSocketMessage): void;
  broadcast(channelId: string, message: WebSocketMessage): void;
  getOnlineUsers(): string[];
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export type Permission =
  | 'create_channel'
  | 'delete_channel'
  | 'update_channel'
  | 'delete_message'
  | 'assign_role'
  | 'manage_members'
  | 'send_message'
  | 'join_public_channel'
  | 'invite_to_channel'
  | 'remove_from_channel';

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateChannelRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface SendMessageRequest {
  channelId?: string;
  recipientId?: string;
  content: string;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
}

export interface AssignRoleRequest {
  userId: string;
  role: Role;
}

export interface UpdateNotificationPreferencesRequest {
  channelId: string;
  preference: NotificationPreference;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditAction =
  | 'permission_denied'
  | 'unauthorized_access'
  | 'role_assigned'
  | 'channel_created'
  | 'channel_deleted'
  | 'message_deleted'
  | 'user_banned';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details?: any;
  timestamp: number;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

export interface RateLimitState {
  userId: string;
  messageCount: number;
  windowStart: number;
  isLimited: boolean;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  ttl: number;
  maxSize?: number;
}
