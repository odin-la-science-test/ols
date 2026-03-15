/**
 * Service de gestion des messages
 * 
 * Ce service gère l'envoi, la récupération et la suppression des messages
 * pour les conversations directes et les canaux.
 * 
 * Requirements: 2.1-2.7, 4.1-4.7 - Direct Messaging and Channel Messaging
 */

import { getDatabase, executeWithRetry } from '../messaging-db/database';
import type { Message, SearchFilters, SearchResult, IMessageService } from '../messaging-types-v3/types';
import { MESSAGING_CONFIG } from './config';
import { v4 as uuidv4 } from 'uuid';
import { permissionService } from './PermissionService';

export class MessageService implements IMessageService {
  /**
   * Envoie un message direct entre deux utilisateurs
   * Requirement: 2.1 - Direct Message Initiation
   */
  async sendDirectMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    // Valider la longueur du contenu
    if (content.length > MESSAGING_CONFIG.messages.maxLength) {
      throw new Error(`Message exceeds maximum length of ${MESSAGING_CONFIG.messages.maxLength} characters`);
    }

    const message: Message = {
      id: uuidv4(),
      senderId,
      recipientId,
      content,
      createdAt: Date.now(),
    };

    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_messages (id, sender_id, recipient_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(message.id, message.senderId, message.recipientId, message.content, message.createdAt);
    });

    return message;
  }

  /**
   * Envoie un message dans un canal
   * Requirement: 4.1 - Channel Member Messaging Permission
   */
  async sendChannelMessage(senderId: string, channelId: string, content: string): Promise<Message> {
    // Vérifier que l'utilisateur est membre du canal
    const canAccess = await permissionService.canAccessChannel(senderId, channelId);
    if (!canAccess) {
      throw new Error('User is not a member of this channel');
    }

    // Valider la longueur du contenu
    if (content.length > MESSAGING_CONFIG.messages.maxLength) {
      throw new Error(`Message exceeds maximum length of ${MESSAGING_CONFIG.messages.maxLength} characters`);
    }

    const message: Message = {
      id: uuidv4(),
      senderId,
      channelId,
      content,
      createdAt: Date.now(),
    };

    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_messages (id, sender_id, channel_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(message.id, message.senderId, message.channelId, message.content, message.createdAt);
    });

    return message;
  }

  /**
   * Récupère les messages directs entre deux utilisateurs
   * Requirement: 2.3 - Message Chronological Ordering
   */
  async getDirectMessages(userId1: string, userId2: string, limit: number, offset: number): Promise<Message[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, sender_id as senderId, recipient_id as recipientId, content, created_at as createdAt, deleted_at as deletedAt
      FROM messaging_messages
      WHERE deleted_at IS NULL
        AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `);

    const messages = stmt.all(userId1, userId2, userId2, userId1, limit, offset) as Message[];
    return messages;
  }

  /**
   * Récupère les messages d'un canal
   * Requirement: 4.3 - Message Chronological Ordering
   */
  async getChannelMessages(channelId: string, limit: number, offset: number): Promise<Message[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, sender_id as senderId, channel_id as channelId, content, created_at as createdAt, deleted_at as deletedAt
      FROM messaging_messages
      WHERE channel_id = ? AND deleted_at IS NULL
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `);

    const messages = stmt.all(channelId, limit, offset) as Message[];
    return messages;
  }

  /**
   * Supprime un message
   * Requirement: 2.6 - Message Deletion Visibility
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // Vérifier les permissions
    const canDelete = await permissionService.canDeleteMessage(userId, messageId);
    if (!canDelete) {
      throw new Error('User does not have permission to delete this message');
    }

    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        UPDATE messaging_messages
        SET deleted_at = ?
        WHERE id = ?
      `);
      stmt.run(Date.now(), messageId);
    });
  }

  /**
   * Recherche des messages avec filtres
   * Requirement: 9.1-9.7 - Message Search
   */
  async searchMessages(userId: string, query: string, filters: SearchFilters): Promise<SearchResult[]> {
    const db = getDatabase();
    
    // Construire la requête SQL dynamiquement
    let sql = `
      SELECT 
        m.id, m.sender_id as senderId, m.channel_id as channelId, 
        m.recipient_id as recipientId, m.content, m.created_at as createdAt,
        u.display_name as senderName,
        c.name as channelName
      FROM messaging_messages m
      JOIN messaging_users u ON m.sender_id = u.id
      LEFT JOIN messaging_channels c ON m.channel_id = c.id
      WHERE m.deleted_at IS NULL
        AND m.content LIKE ?
    `;

    const params: any[] = [`%${query}%`];

    // Ajouter les filtres
    if (filters.sender) {
      sql += ` AND m.sender_id = ?`;
      params.push(filters.sender);
    }

    if (filters.dateFrom) {
      sql += ` AND m.created_at >= ?`;
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      sql += ` AND m.created_at <= ?`;
      params.push(filters.dateTo);
    }

    if (filters.channelId) {
      sql += ` AND m.channel_id = ?`;
      params.push(filters.channelId);
    }

    // Filtrer uniquement les messages accessibles par l'utilisateur
    sql += `
      AND (
        m.channel_id IN (
          SELECT channel_id FROM messaging_channel_members WHERE user_id = ?
        )
        OR m.sender_id = ?
        OR m.recipient_id = ?
      )
    `;
    params.push(userId, userId, userId);

    sql += ` ORDER BY m.created_at DESC LIMIT 100`;

    const stmt = db.prepare(sql);
    const results = stmt.all(...params) as any[];

    // Formater les résultats
    return results.map(row => ({
      message: {
        id: row.id,
        senderId: row.senderId,
        channelId: row.channelId,
        recipientId: row.recipientId,
        content: row.content,
        createdAt: row.createdAt,
      },
      senderName: row.senderName,
      channelName: row.channelName,
      context: row.channelName ? `#${row.channelName}` : 'Direct Message',
      highlights: this.extractHighlights(row.content, query),
    }));
  }

  /**
   * Extrait les portions de texte correspondant à la recherche
   */
  private extractHighlights(content: string, query: string): string[] {
    const regex = new RegExp(`.{0,30}${query}.{0,30}`, 'gi');
    const matches = content.match(regex);
    return matches || [];
  }
}

// Export singleton instance
export const messageService = new MessageService();
