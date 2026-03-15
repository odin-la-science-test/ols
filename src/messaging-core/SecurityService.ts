/**
 * Service de sécurité
 * 
 * Ce service gère la sanitization des entrées, la prévention XSS,
 * et la validation des données utilisateur.
 * 
 * Requirements: 11.6, 15.5-15.6 - Security and Input Validation
 */

import { MESSAGING_CONFIG } from './config';

export class SecurityService {
  /**
   * Sanitize le contenu d'un message pour prévenir les attaques XSS
   * Requirement: 15.6 - XSS Prevention
   */
  sanitizeMessageContent(content: string): string {
    // Échapper les caractères HTML dangereux
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valide la longueur d'un message
   * Requirement: 11.1 - Message Length Validation
   */
  validateMessageLength(content: string): { valid: boolean; error?: string } {
    if (content.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (content.length > MESSAGING_CONFIG.messages.maxLength) {
      return {
        valid: false,
        error: `Message exceeds maximum length of ${MESSAGING_CONFIG.messages.maxLength} characters`,
      };
    }

    return { valid: true };
  }

  /**
   * Valide le nom d'un canal
   * Requirement: 3.2 - Channel Name Validation
   */
  validateChannelName(name: string): { valid: boolean; error?: string } {
    if (name.length < MESSAGING_CONFIG.channels.nameMinLength) {
      return {
        valid: false,
        error: `Channel name must be at least ${MESSAGING_CONFIG.channels.nameMinLength} characters`,
      };
    }

    if (name.length > MESSAGING_CONFIG.channels.nameMaxLength) {
      return {
        valid: false,
        error: `Channel name cannot exceed ${MESSAGING_CONFIG.channels.nameMaxLength} characters`,
      };
    }

    // Vérifier les caractères autorisés (alphanumériques, tirets, underscores)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(name)) {
      return {
        valid: false,
        error: 'Channel name can only contain letters, numbers, hyphens, and underscores',
      };
    }

    return { valid: true };
  }

  /**
   * Valide la description d'un canal
   * Requirement: 3.3 - Channel Description Validation
   */
  validateChannelDescription(description: string): { valid: boolean; error?: string } {
    if (description.length > MESSAGING_CONFIG.channels.descriptionMaxLength) {
      return {
        valid: false,
        error: `Channel description cannot exceed ${MESSAGING_CONFIG.channels.descriptionMaxLength} characters`,
      };
    }

    return { valid: true };
  }

  /**
   * Valide un rôle
   * Requirement: 5.2 - Role Enumeration Constraint
   */
  validateRole(role: string): { valid: boolean; error?: string } {
    const validRoles = MESSAGING_CONFIG.roles.available;
    if (!validRoles.includes(role as any)) {
      return {
        valid: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Valide une préférence de notification
   * Requirement: 10.4 - Notification Preference Enumeration
   */
  validateNotificationPreference(preference: string): { valid: boolean; error?: string } {
    const validPreferences = MESSAGING_CONFIG.notifications.preferences;
    if (!validPreferences.includes(preference as any)) {
      return {
        valid: false,
        error: `Invalid notification preference. Must be one of: ${validPreferences.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Détecte et extrait les mentions @username dans un message
   * Requirement: 4.7 - Mention Detection
   */
  extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Détecte les URLs dans un message
   * Requirement: 11.3 - URL Detection
   */
  extractUrls(content: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    return urls || [];
  }

  /**
   * Échappe les caractères spéciaux SQL (utilisé en complément des requêtes paramétrées)
   * Requirement: 15.5 - SQL Injection Prevention
   * 
   * Note: Cette fonction est un complément de sécurité. La prévention principale
   * des injections SQL se fait via les requêtes paramétrées dans better-sqlite3.
   */
  escapeSqlString(value: string): string {
    return value.replace(/'/g, "''");
  }

  /**
   * Valide un UUID
   */
  validateUuid(uuid: string): { valid: boolean; error?: string } {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return { valid: false, error: 'Invalid UUID format' };
    }

    return { valid: true };
  }

  /**
   * Nettoie et normalise un username
   */
  normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }
}

// Export singleton instance
export const securityService = new SecurityService();
