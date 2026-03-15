/**
 * Gestionnaire de base de données SQLite pour le système de messagerie
 * 
 * Ce module gère la connexion à la base de données SQLite dédiée et
 * fournit des méthodes pour initialiser le schéma.
 * 
 * Requirements: 12.1, 13.2 - Data Persistence and Module Isolation
 */

// @ts-ignore
import Database from 'better-sqlite3';
import { MESSAGING_CONFIG } from '../messaging-core/config';
import { createSchema } from './schema';
import * as fs from 'fs';
import * as path from 'path';

let dbInstance: any = null;

/**
 * Obtient l'instance de base de données (singleton)
 * Requirement: 12.1 - Dedicated SQLite Database
 */
export function getDatabase(): any {
  if (!dbInstance) {
    // Créer le dossier databases s'il n'existe pas
    const dbDir = path.dirname(MESSAGING_CONFIG.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Ouvrir la connexion à la base de données
    dbInstance = new Database(MESSAGING_CONFIG.database.path);
    
    // Activer les clés étrangères
    dbInstance.pragma('foreign_keys = ON');
    
    // Initialiser le schéma
    createSchema(dbInstance);
    
    console.log(`[Messaging DB] Database initialized at ${MESSAGING_CONFIG.database.path}`);
  }

  return dbInstance;
}

/**
 * Ferme la connexion à la base de données
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[Messaging DB] Database connection closed');
  }
}

/**
 * Exécute une requête avec retry en cas d'échec
 * Requirement: 12.7 - Database Write Retry on Failure
 */
export async function executeWithRetry<T>(
  operation: () => T,
  retries: number = MESSAGING_CONFIG.database.retryAttempts
): Promise<T> {
  try {
    return operation();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`[Messaging DB] Operation failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, MESSAGING_CONFIG.database.retryDelayMs));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}

/**
 * Crée une sauvegarde de la base de données
 * Requirement: 12.6 - Daily Database Backups
 */
export function createBackup(): void {
  const db = getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${MESSAGING_CONFIG.database.path}.backup-${timestamp}`;
  
  db.backup(backupPath)
    .then(() => {
      console.log(`[Messaging DB] Backup created at ${backupPath}`);
    })
    .catch((error: any) => {
      console.error('[Messaging DB] Backup failed:', error);
    });
}

/**
 * Initialise le système de backup automatique
 */
export function initializeAutoBackup(): void {
  // Créer un backup immédiatement
  createBackup();
  
  // Planifier des backups quotidiens
  setInterval(() => {
    createBackup();
  }, MESSAGING_CONFIG.database.backupInterval);
  
  console.log('[Messaging DB] Auto-backup initialized (every 24 hours)');
}
