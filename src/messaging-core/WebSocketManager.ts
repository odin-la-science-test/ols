/**
 * Gestionnaire WebSocket
 * 
 * Ce service gère les connexions WebSocket, la diffusion des messages
 * en temps réel et le suivi des utilisateurs en ligne.
 * 
 * Requirements: 8.1-8.7 - Real-Time Communication
 */

import { WebSocket } from 'ws';
import type { WebSocketMessage, IWebSocketManager, UserStatus } from '../messaging-types-v3/types';
import { getDatabase, executeWithRetry } from '../messaging-db/database';

interface ConnectionInfo {
  userId: string;
  socket: WebSocket;
  lastActivity: number;
}

export class WebSocketManager implements IWebSocketManager {
  private connections: Map<string, ConnectionInfo> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of connection IDs

  /**
   * Enregistre une nouvelle connexion WebSocket
   * Requirement: 8.1 - WebSocket Connection Management
   */
  async connect(userId: string, token: string): Promise<any> {
    // Note: Dans une implémentation réelle, valider le token ici
    // Pour l'instant, on accepte toutes les connexions
    
    const connectionId = `${userId}-${Date.now()}`;
    
    // Créer un socket fictif pour l'instant (sera remplacé par le vrai socket côté serveur)
    const socket = {} as WebSocket;
    
    const connectionInfo: ConnectionInfo = {
      userId,
      socket,
      lastActivity: Date.now(),
    };

    this.connections.set(connectionId, connectionInfo);

    // Ajouter à la map userId -> sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(connectionId);

    // Mettre à jour le statut de l'utilisateur
    await this.updateUserStatus(userId, 'online');

    console.log(`[WebSocket] User ${userId} connected (${connectionId})`);

    return socket;
  }

  /**
   * Déconnecte un utilisateur
   * Requirement: 1.3 - Disconnection Updates Status
   */
  disconnect(userId: string): void {
    const connectionIds = this.userSockets.get(userId);
    
    if (connectionIds) {
      for (const connectionId of connectionIds) {
        this.connections.delete(connectionId);
      }
      this.userSockets.delete(userId);
    }

    // Mettre à jour le statut de l'utilisateur
    this.updateUserStatus(userId, 'offline');

    console.log(`[WebSocket] User ${userId} disconnected`);
  }

  /**
   * Envoie un message à un utilisateur spécifique
   * Requirement: 8.2 - Real-Time Message Delivery
   */
  send(userId: string, message: WebSocketMessage): void {
    const connectionIds = this.userSockets.get(userId);
    
    if (!connectionIds) {
      console.warn(`[WebSocket] User ${userId} not connected`);
      return;
    }

    for (const connectionId of connectionIds) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(JSON.stringify(message));
        connection.lastActivity = Date.now();
      }
    }
  }

  /**
   * Diffuse un message à tous les membres d'un canal
   * Requirement: 8.2 - Real-Time Message Delivery
   */
  broadcast(channelId: string, message: WebSocketMessage): void {
    // Récupérer tous les membres du canal
    const members = this.getChannelMembers(channelId);

    for (const userId of members) {
      this.send(userId, message);
    }
  }

  /**
   * Obtient la liste des utilisateurs en ligne
   * Requirement: 1.4 - User Online Status Display
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Vérifie si un utilisateur est en ligne
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Met à jour le statut d'un utilisateur dans la base de données
   */
  private async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare(`
        UPDATE messaging_users
        SET status = ?, last_seen = ?
        WHERE id = ?
      `);
      stmt.run(status, Date.now(), userId);
    });
  }

  /**
   * Récupère les membres d'un canal
   */
  private getChannelMembers(channelId: string): string[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT user_id
      FROM messaging_channel_members
      WHERE channel_id = ?
    `);
    const results = stmt.all(channelId) as { user_id: string }[];
    return results.map(r => r.user_id);
  }

  /**
   * Nettoie les connexions inactives
   */
  cleanupInactiveConnections(timeoutMs: number = 300000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [connectionId, connection] of this.connections.entries()) {
      if (now - connection.lastActivity > timeoutMs) {
        toRemove.push(connectionId);
      }
    }

    for (const connectionId of toRemove) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.disconnect(connection.userId);
      }
    }
  }
}

// Export singleton instance
export const webSocketManager = new WebSocketManager();

// Nettoyer les connexions inactives toutes les 5 minutes
setInterval(() => {
  webSocketManager.cleanupInactiveConnections();
}, 300000);
