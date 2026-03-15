/**
 * Gestionnaire d'erreurs centralisé
 * 
 * Ce service gère la catégorisation, le formatage et le logging des erreurs
 * dans le système de messagerie.
 * 
 * Requirements: 6.5, 6.6 - Error Handling and Audit Logging
 */

import type { ErrorResponse, ErrorCode, ErrorCategory, AuditLogEntry, AuditAction } from '../messaging-types-v3/types';
import { getDatabase, executeWithRetry } from '../messaging-db/database';
import { v4 as uuidv4 } from 'uuid';

export class ErrorHandler {
  /**
   * Crée une réponse d'erreur standardisée
   * Requirement: 6.5 - Permission Denial Returns Error
   */
  createErrorResponse(code: ErrorCode, message: string, details?: any): ErrorResponse {
    return {
      error: {
        code,
        message,
        details,
        timestamp: Date.now(),
        requestId: uuidv4(),
      },
    };
  }

  /**
   * Log une erreur dans la console
   */
  logError(error: ErrorResponse): void {
    console.error('[Messaging Error]', {
      code: error.error.code,
      message: error.error.message,
      timestamp: new Date(error.error.timestamp).toISOString(),
      requestId: error.error.requestId,
      details: error.error.details,
    });
  }

  /**
   * Crée une entrée de log d'audit
   * Requirement: 6.6 - Permission Denial Audit Logging
   */
  async createAuditLog(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    details?: any
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: uuidv4(),
      userId,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: Date.now(),
    };

    // Log dans la console
    console.warn('[Messaging Audit]', {
      action: entry.action,
      user: entry.userId,
      resource: `${entry.resourceType}:${entry.resourceId}`,
      timestamp: new Date(entry.timestamp).toISOString(),
    });

    // Persister dans la base de données (optionnel - nécessite une table audit_logs)
    // Pour l'instant, on log uniquement dans la console
  }

  /**
   * Gère une erreur de permission
   */
  async handlePermissionError(userId: string, action: string, resourceId: string): Promise<ErrorResponse> {
    await this.createAuditLog(userId, 'permission_denied', action, resourceId);
    return this.createErrorResponse('PERMISSION_DENIED', 'You do not have permission to perform this action');
  }

  /**
   * Gère une erreur d'accès non autorisé
   */
  async handleUnauthorizedAccess(userId: string, resourceType: string, resourceId: string): Promise<ErrorResponse> {
    await this.createAuditLog(userId, 'unauthorized_access', resourceType, resourceId);
    return this.createErrorResponse('AUTHENTICATION_ERROR', 'Unauthorized access attempt');
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
