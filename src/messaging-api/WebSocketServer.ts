/**
 * Serveur WebSocket pour la messagerie temps réel
 * 
 * Ce serveur gère les connexions WebSocket, l'authentification,
 * et la distribution des messages en temps réel.
 * 
 * Requirements: 8.1-8.7 - Real-Time Communication
 */

import { WebSocketServer, WebSocket } from 'ws';
import { MESSAGING_CONFIG } from '../messaging-core/config';
import { webSocketManager } from '../messaging-core/WebSocketManager';
import { messageService } from '../messaging-core/MessageService';
import { notificationService } from '../messaging-core/NotificationService';
import { rateLimiter } from '../messaging-core/RateLimiter';
import type { 
  WebSocketMessage, 
  MessageSendPayload, 
  TypingPayload, 
  PresenceUpdatePayload 
} from '../messaging-types-v3/types';

export class MessagingWebSocketServer {
  private wss: WebSocketServer | null = null;
  private connectionMap: Map<WebSocket, string> = new Map(); // socket -> userId

  /**
   * Démarre le serveur WebSocket
   * Requirement: 8.1 - WebSocket Server Setup
   */
  start(port: number = MESSAGING_CONFIG.websocket.port): void {
    this.wss = new WebSocketServer({ port });

    console.log(`[WebSocket Server] Starting on port ${port}...`);

    this.wss.on('connection', (socket: WebSocket, request) => {
      this.handleConnection(socket, request);
    });

    this.wss.on('error', (error) => {
      console.error('[WebSocket Server] Error:', error);
    });

    console.log(`[WebSocket Server] Listening on port ${port}`);
  }

  /**
   * Gère une nouvelle connexion WebSocket
   */
  private handleConnection(socket: WebSocket, request: any): void {
    console.log('[WebSocket Server] New connection attempt');

    // Extraire le token d'authentification de l'URL ou des headers
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('userId');

    if (!token || !userId) {
      console.warn('[WebSocket Server] Connection rejected: missing credentials');
      socket.close(1008, 'Authentication required');
      return;
    }

    // TODO: Valider le token avec le système d'authentification
    // Pour l'instant, on accepte toutes les connexions

    // Enregistrer la connexion
    this.connectionMap.set(socket, userId);
    console.log(`[WebSocket Server] User ${userId} connected`);

    // Configurer les gestionnaires d'événements
    socket.on('message', (data) => {
      this.handleMessage(socket, userId, data);
    });

    socket.on('close', () => {
      this.handleDisconnection(socket, userId);
    });

    socket.on('error', (error) => {
      console.error(`[WebSocket Server] Socket error for user ${userId}:`, error);
    });

    // Envoyer un message de confirmation
    this.sendToSocket(socket, {
      type: 'connection:established',
      payload: { userId },
      timestamp: Date.now(),
    });
  }

  /**
   * Gère un message reçu d'un client
   */
  private async handleMessage(socket: WebSocket, userId: string, data: any): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'message:send':
          await this.handleMessageSend(userId, message.payload as MessageSendPayload);
          break;

        case 'typing:start':
          this.handleTypingStart(userId, message.payload as TypingPayload);
          break;

        case 'typing:stop':
          this.handleTypingStop(userId, message.payload as TypingPayload);
          break;

        case 'presence:update':
          this.handlePresenceUpdate(userId, message.payload as PresenceUpdatePayload);
          break;

        default:
          console.warn(`[WebSocket Server] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WebSocket Server] Error handling message:', error);
      this.sendToSocket(socket, {
        type: 'error',
        payload: { message: 'Invalid message format' },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Gère l'envoi d'un message
   */
  private async handleMessageSend(userId: string, payload: MessageSendPayload): Promise<void> {
    // Vérifier le rate limiting
    const rateLimitCheck = rateLimiter.canSendMessage(userId);
    if (!rateLimitCheck.allowed) {
      this.broadcastToUser(userId, {
        type: 'error',
        payload: { 
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many messages. Please wait.',
          retryAfter: rateLimitCheck.retryAfter 
        },
        timestamp: Date.now(),
      });
      return;
    }

    try {
      let message;

      if (payload.channelId) {
        // Message de canal
        message = await messageService.sendChannelMessage(userId, payload.channelId, payload.content);
        
        // Diffuser à tous les membres du canal
        this.broadcastToChannel(payload.channelId, {
          type: 'message:new',
          payload: { message },
          timestamp: Date.now(),
        });

      } else if (payload.recipientId) {
        // Message direct
        message = await messageService.sendDirectMessage(userId, payload.recipientId, payload.content);
        
        // Envoyer au destinataire
        this.broadcastToUser(payload.recipientId, {
          type: 'message:new',
          payload: { message },
          timestamp: Date.now(),
        });

        // Notifier le destinataire
        await notificationService.notifyDirectMessage(payload.recipientId, message);
      }

      // Enregistrer le message pour le rate limiting
      rateLimiter.recordMessage(userId);

      // Confirmer l'envoi à l'expéditeur
      this.broadcastToUser(userId, {
        type: 'message:sent',
        payload: { message },
        timestamp: Date.now(),
      });

    } catch (error: any) {
      console.error('[WebSocket Server] Error sending message:', error);
      this.broadcastToUser(userId, {
        type: 'error',
        payload: { message: error.message },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Gère le début de frappe
   */
  private handleTypingStart(userId: string, payload: TypingPayload): void {
    // Diffuser l'indicateur de frappe aux autres participants
    this.broadcastToConversation(payload.conversationId, userId, {
      type: 'typing:indicator',
      payload: { userId, conversationId: payload.conversationId, isTyping: true },
      timestamp: Date.now(),
    });
  }

  /**
   * Gère la fin de frappe
   */
  private handleTypingStop(userId: string, payload: TypingPayload): void {
    this.broadcastToConversation(payload.conversationId, userId, {
      type: 'typing:indicator',
      payload: { userId, conversationId: payload.conversationId, isTyping: false },
      timestamp: Date.now(),
    });
  }

  /**
   * Gère la mise à jour de présence
   */
  private handlePresenceUpdate(userId: string, payload: PresenceUpdatePayload): void {
    // Diffuser le changement de statut à tous les utilisateurs connectés
    this.broadcast({
      type: 'presence:changed',
      payload: { userId, status: payload.status },
      timestamp: Date.now(),
    });
  }

  /**
   * Gère la déconnexion d'un client
   */
  private handleDisconnection(socket: WebSocket, userId: string): void {
    console.log(`[WebSocket Server] User ${userId} disconnected`);
    this.connectionMap.delete(socket);
    webSocketManager.disconnect(userId);
  }

  /**
   * Envoie un message à un socket spécifique
   */
  private sendToSocket(socket: WebSocket, message: WebSocketMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  /**
   * Diffuse un message à un utilisateur spécifique
   */
  private broadcastToUser(userId: string, message: WebSocketMessage): void {
    for (const [socket, socketUserId] of this.connectionMap.entries()) {
      if (socketUserId === userId) {
        this.sendToSocket(socket, message);
      }
    }
  }

  /**
   * Diffuse un message à tous les membres d'un canal
   */
  private broadcastToChannel(channelId: string, message: WebSocketMessage): void {
    // TODO: Récupérer les membres du canal et diffuser
    webSocketManager.broadcast(channelId, message);
  }

  /**
   * Diffuse un message à tous les participants d'une conversation (sauf l'expéditeur)
   */
  private broadcastToConversation(conversationId: string, excludeUserId: string, message: WebSocketMessage): void {
    // Si c'est un canal
    if (!conversationId.includes('-')) {
      this.broadcastToChannel(conversationId, message);
    } else {
      // Si c'est un DM, extraire les deux IDs
      const [userId1, userId2] = conversationId.split('-');
      const recipientId = userId1 === excludeUserId ? userId2 : userId1;
      this.broadcastToUser(recipientId, message);
    }
  }

  /**
   * Diffuse un message à tous les clients connectés
   */
  private broadcast(message: WebSocketMessage): void {
    for (const socket of this.connectionMap.keys()) {
      this.sendToSocket(socket, message);
    }
  }

  /**
   * Arrête le serveur WebSocket
   */
  stop(): void {
    if (this.wss) {
      this.wss.close(() => {
        console.log('[WebSocket Server] Server stopped');
      });
    }
  }
}

// Export singleton instance
export const messagingWebSocketServer = new MessagingWebSocketServer();
