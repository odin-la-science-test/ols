/**
 * Service de gestion des notifications
 * 
 * Ce service gère les notifications de messages, les mentions,
 * les compteurs de messages non lus et les préférences de notification.
 * 
 * Requirements: 10.1-10.7, 4.7 - Notification System
 */

import { getDatabase, executeWithRetry } from '../messaging-db/database';
import type { Message, NotificationPreference, INotificationService } from '../messaging-types-v3/types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService implements INotificationService {
  /**
   * Crée une notification pour un message direct
   * Requirement: 10.1 - Direct Message Notifications
   */
  async notifyDirectMessage(recipientId: string, message: Message): Promise<void> {
    const conversationId = this.getDirectMessageConversationId(message.senderId, recipientId);
    await this.incrementUnreadCount(recipientId, conversationId, 'dm');
  }

  /**
   * Crée une notification pour une mention
   * Requirement: 10.2 - Mention Notifications
   */
  async notifyMention(userId: string, message: Message): Promise<void> {
    if (!message.channelId) return;

    // Vérifier les préférences de notification
    const preference = await this.getChannelPreference(userId, message.channelId);
    
    // Si muted, ne pas notifier
    if (preference === 'muted') return;
    
    // Si mentions only, vérifier qu'il y a bien une mention
    if (preference === 'mentions' && !this.containsMention(message.content, userId)) {
      return;
    }

    await this.incrementUnreadCount(userId, message.channelId, 'channel');
  }

  /**
   * Obtient le nombre de messages non lus
   * Requirement: 10.6 - Unread Count Accuracy
   */
  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT unread_count
      FROM messaging_notifications
      WHERE user_id = ? AND conversation_id = ?
    `);

    const result = stmt.get(userId, conversationId) as { unread_count: number } | undefined;
    return result?.unread_count || 0;
  }

  /**
   * Marque une conversation comme lue
   * Requirement: 10.7 - Viewing Clears Unread
   */
  async markAsRead(userId: string, conversationId: string): Promise<void> {
    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_notifications (id, user_id, conversation_id, conversation_type, unread_count, last_read_at)
        VALUES (?, ?, ?, ?, 0, ?)
        ON CONFLICT(user_id, conversation_id) DO UPDATE SET
          unread_count = 0,
          last_read_at = ?
      `);
      const now = Date.now();
      const id = uuidv4();
      const type = conversationId.includes('-') ? 'dm' : 'channel';
      stmt.run(id, userId, conversationId, type, now, now);
    });
  }

  /**
   * Met à jour les préférences de notification pour un canal
   * Requirement: 10.3 - Notification Preference Storage
   */
  async updatePreferences(userId: string, channelId: string, preference: NotificationPreference): Promise<void> {
    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        UPDATE messaging_channel_members
        SET notification_preference = ?
        WHERE user_id = ? AND channel_id = ?
      `);
      stmt.run(preference, userId, channelId);
    });
  }

  /**
   * Incrémente le compteur de messages non lus
   */
  private async incrementUnreadCount(userId: string, conversationId: string, conversationType: 'channel' | 'dm'): Promise<void> {
    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_notifications (id, user_id, conversation_id, conversation_type, unread_count)
        VALUES (?, ?, ?, ?, 1)
        ON CONFLICT(user_id, conversation_id) DO UPDATE SET
          unread_count = unread_count + 1
      `);
      stmt.run(uuidv4(), userId, conversationId, conversationType);
    });
  }

  /**
   * Obtient la préférence de notification pour un canal
   */
  private async getChannelPreference(userId: string, channelId: string): Promise<NotificationPreference> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT notification_preference
      FROM messaging_channel_members
      WHERE user_id = ? AND channel_id = ?
    `);

    const result = stmt.get(userId, channelId) as { notification_preference: NotificationPreference } | undefined;
    return result?.notification_preference || 'all';
  }

  /**
   * Vérifie si un message contient une mention d'utilisateur
   * Requirement: 4.7 - Mention Detection
   */
  private containsMention(content: string, userId: string): boolean {
    // Récupérer le username de l'utilisateur
    const db = getDatabase();
    const stmt = db.prepare('SELECT username FROM messaging_users WHERE id = ?');
    const user = stmt.get(userId) as { username: string } | undefined;
    
    if (!user) return false;

    // Chercher @username dans le contenu
    const mentionRegex = new RegExp(`@${user.username}\\b`, 'i');
    return mentionRegex.test(content);
  }

  /**
   * Génère un ID de conversation pour les messages directs
   */
  private getDirectMessageConversationId(userId1: string, userId2: string): string {
    // Trier les IDs pour avoir un ID de conversation cohérent
    const [id1, id2] = [userId1, userId2].sort();
    return `${id1}-${id2}`;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
