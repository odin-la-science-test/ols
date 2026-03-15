/**
 * Constants and enums for the messaging system
 * This file contains the const exports separate from types
 */

import type { Role, UserStatus, NotificationPreference, Permission } from './types';

// ============================================================================
// ROLE CONSTANTS
// ============================================================================

export const RoleValues = {
  ADMIN: 'admin' as Role,
  MODERATOR: 'moderator' as Role,
  MEMBER: 'member' as Role
} as const;

// ============================================================================
// USER STATUS CONSTANTS
// ============================================================================

export const UserStatusValues = {
  ONLINE: 'online' as UserStatus,
  AWAY: 'away' as UserStatus,
  OFFLINE: 'offline' as UserStatus
} as const;

// ============================================================================
// NOTIFICATION PREFERENCE CONSTANTS
// ============================================================================

export const NotificationPreferenceValues = {
  ALL: 'all' as NotificationPreference,
  MENTIONS: 'mentions' as NotificationPreference,
  MUTED: 'muted' as NotificationPreference
} as const;

// ============================================================================
// ROLE PERMISSIONS MAPPING
// ============================================================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'admin': [
    'create_channel',
    'delete_channel',
    'update_channel',
    'delete_message',
    'assign_role',
    'manage_members',
    'send_message',
    'join_public_channel',
    'invite_to_channel',
    'remove_from_channel'
  ],
  'moderator': [
    'create_channel',
    'update_channel',
    'delete_message',
    'manage_members',
    'send_message',
    'join_public_channel',
    'invite_to_channel',
    'remove_from_channel'
  ],
  'member': [
    'send_message',
    'join_public_channel'
  ]
};
