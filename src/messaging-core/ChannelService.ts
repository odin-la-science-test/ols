/**
 * Service de gestion des canaux
 * Requirements: 3.1-3.7, 7.1-7.7 - Channel Creation and Membership Management
 */

import { getDatabase, executeWithRetry } from '../messaging-db/database';
import type { Channel, User, IChannelService } from '../messaging-types-v3/types';
import { permissionService } from './PermissionService';
import { v4 as uuidv4 } from 'uuid';

export class ChannelService implements IChannelService {
  async createChannel(creatorId: string, name: string, description?: string, isPrivate: boolean = false): Promise<Channel> {
    // Validation du nom
    if (name.length < 3 || name.length > 50) {
      throw new Error('Channel name must be between 3 and 50 characters');
    }
    
    if (description && description.length > 500) {
      throw new Error('Channel description must not exceed 500 characters');
    }

    const db = getDatabase();
    const channel: Channel = {
      id: uuidv4(),
      name,
      description,
      isPrivate,
      createdBy: creatorId,
      createdAt: Date.now()
    };

    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_channels (id, name, description, is_private, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(channel.id, channel.name, channel.description, channel.isPrivate ? 1 : 0, channel.createdBy, channel.createdAt);
      
      // Ajouter le créateur comme membre
      const memberStmt = db.prepare(`
        INSERT INTO messaging_channel_members (channel_id, user_id, joined_at, notification_preference)
        VALUES (?, ?, ?, 'all')
      `);
      memberStmt.run(channel.id, creatorId, Date.now());
    });

    return channel;
  }

  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      if (updates.name.length < 3 || updates.name.length > 50) {
        throw new Error('Channel name must be between 3 and 50 characters');
      }
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 500) {
        throw new Error('Channel description must not exceed 500 characters');
      }
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.isPrivate !== undefined) {
      fields.push('is_private = ?');
      values.push(updates.isPrivate ? 1 : 0);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(channelId);

    await executeWithRetry(() => {
      const stmt = db.prepare(`UPDATE messaging_channels SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    });

    return this.getChannelById(channelId);
  }

  async deleteChannel(channelId: string): Promise<void> {
    const db = getDatabase();
    
    await executeWithRetry(() => {
      // Marquer tous les messages comme supprimés
      const msgStmt = db.prepare('UPDATE messaging_messages SET deleted_at = ? WHERE channel_id = ?');
      msgStmt.run(Date.now(), channelId);
      
      // Supprimer le canal (cascade supprimera les membres)
      const stmt = db.prepare('DELETE FROM messaging_channels WHERE id = ?');
      stmt.run(channelId);
    });
  }

  async getChannels(userId: string): Promise<Channel[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT c.* FROM messaging_channels c
      INNER JOIN messaging_channel_members m ON c.id = m.channel_id
      WHERE m.user_id = ?
      ORDER BY c.name ASC
    `);
    
    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isPrivate: row.is_private === 1,
      createdBy: row.created_by,
      createdAt: row.created_at
    }));
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        INSERT INTO messaging_channel_members (channel_id, user_id, joined_at, notification_preference)
        VALUES (?, ?, ?, 'all')
      `);
      stmt.run(channelId, userId, Date.now());
    });
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    await executeWithRetry(() => {
      const stmt = db.prepare('DELETE FROM messaging_channel_members WHERE channel_id = ? AND user_id = ?');
      stmt.run(channelId, userId);
    });
  }

  async getMembers(channelId: string): Promise<User[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT u.* FROM messaging_users u
      INNER JOIN messaging_channel_members m ON u.id = m.user_id
      WHERE m.channel_id = ?
    `);
    
    const rows = stmt.all(channelId) as any[];
    return rows.map(row => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      lastSeen: row.last_seen
    }));
  }

  private async getChannelById(channelId: string): Promise<Channel> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM messaging_channels WHERE id = ?');
    const row = stmt.get(channelId) as any;
    
    if (!row) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isPrivate: row.is_private === 1,
      createdBy: row.created_by,
      createdAt: row.created_at
    };
  }
}

export const channelService = new ChannelService();
