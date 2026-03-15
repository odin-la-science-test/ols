/**
 * Hook React pour la gestion WebSocket
 * 
 * Ce hook gère la connexion WebSocket, la reconnexion automatique,
 * et la synchronisation des messages.
 * 
 * Requirements: 8.5-8.7 - WebSocket Reconnection
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MESSAGING_CONFIG } from '../../messaging-core/config';
import type { WebSocketMessage } from '../../messaging-types-v3/types';

interface UseWebSocketOptions {
  userId: string;
  token: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  send: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

/**
 * Hook pour gérer la connexion WebSocket avec reconnexion automatique
 * Requirement: 8.5, 8.6, 8.7 - Automatic Reconnection
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { userId, token, onMessage, onConnect, onDisconnect, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestamp = useRef<number>(0);

  /**
   * Établit la connexion WebSocket
   */
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://localhost:${MESSAGING_CONFIG.websocket.port}?userId=${userId}&token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectAttempt(0);
      lastMessageTimestamp.current = Date.now();
      onConnect?.();
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        lastMessageTimestamp.current = Date.now();
        onMessage?.(message);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      onDisconnect?.();
      scheduleReconnect();
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      onError?.(error);
    };

    socketRef.current = socket;
  }, [userId, token, onMessage, onConnect, onDisconnect, onError]);

  /**
   * Planifie une tentative de reconnexion avec backoff exponentiel
   * Requirement: 8.5 - Exponential Backoff Reconnection
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempt >= MESSAGING_CONFIG.websocket.reconnectAttempts) {
      console.warn('[WebSocket] Max reconnection attempts reached');
      setIsReconnecting(false);
      
      // Afficher une notification après 30 secondes
      setTimeout(() => {
        console.warn('[WebSocket] Connection failed after 30 seconds');
        // TODO: Afficher une notification à l'utilisateur
      }, 30000);
      
      return;
    }

    setIsReconnecting(true);
    const delay = MESSAGING_CONFIG.websocket.reconnectDelays[reconnectAttempt];
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1}/${MESSAGING_CONFIG.websocket.reconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempt(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempt, connect]);

  /**
   * Envoie un message via WebSocket
   */
  const send = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);

  /**
   * Force une reconnexion
   */
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setReconnectAttempt(0);
    connect();
  }, [connect]);

  /**
   * Synchronise les messages manqués après reconnexion
   * Requirement: 8.7 - Reconnection Triggers Sync
   */
  const syncMissedMessages = useCallback(async () => {
    if (lastMessageTimestamp.current === 0) return;

    try {
      // TODO: Appeler l'API pour récupérer les messages manqués
      console.log('[WebSocket] Syncing missed messages since', new Date(lastMessageTimestamp.current));
    } catch (error) {
      console.error('[WebSocket] Error syncing missed messages:', error);
    }
  }, []);

  // Établir la connexion au montage
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Synchroniser les messages après reconnexion
  useEffect(() => {
    if (isConnected && reconnectAttempt > 0) {
      syncMissedMessages();
    }
  }, [isConnected, reconnectAttempt, syncMissedMessages]);

  return {
    isConnected,
    isReconnecting,
    send,
    reconnect,
  };
}
