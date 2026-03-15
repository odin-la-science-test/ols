/**
 * Point d'entrée du serveur WebSocket de messagerie
 * 
 * Ce fichier démarre le serveur WebSocket et initialise
 * tous les services nécessaires.
 * 
 * Requirements: 8.1, 13.3 - WebSocket Server Initialization
 */

import { messagingWebSocketServer } from './WebSocketServer';
import { getDatabase, initializeAutoBackup } from '../messaging-db/database';
import { MESSAGING_CONFIG } from '../messaging-core/config';

/**
 * Démarre le serveur de messagerie
 */
export function startMessagingServer(): void {
  console.log('[Messaging Server] Initializing...');

  // Initialiser la base de données
  console.log('[Messaging Server] Initializing database...');
  getDatabase();

  // Initialiser le système de backup automatique
  console.log('[Messaging Server] Initializing auto-backup...');
  initializeAutoBackup();

  // Démarrer le serveur WebSocket
  console.log('[Messaging Server] Starting WebSocket server...');
  messagingWebSocketServer.start(MESSAGING_CONFIG.websocket.port);

  console.log('[Messaging Server] Server started successfully!');
  console.log(`[Messaging Server] WebSocket listening on port ${MESSAGING_CONFIG.websocket.port}`);
}

/**
 * Arrête le serveur de messagerie
 */
export function stopMessagingServer(): void {
  console.log('[Messaging Server] Stopping...');
  messagingWebSocketServer.stop();
  console.log('[Messaging Server] Server stopped');
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  startMessagingServer();

  // Gérer l'arrêt gracieux
  process.on('SIGINT', () => {
    console.log('\n[Messaging Server] Received SIGINT, shutting down...');
    stopMessagingServer();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[Messaging Server] Received SIGTERM, shutting down...');
    stopMessagingServer();
    process.exit(0);
  });
}
