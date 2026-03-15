/**
 * Service de rate limiting
 * 
 * Ce service implémente un système de limitation de débit pour prévenir
 * le spam et les abus du système de messagerie.
 * 
 * Requirements: 15.7 - Rate Limiting Enforcement
 */

import { MESSAGING_CONFIG } from './config';
import { RateLimitState } from '../messaging-types-v3/types';

export class RateLimiter {
  private userStates: Map<string, RateLimitState> = new Map();

  /**
   * Vérifie si un utilisateur peut envoyer un message
   * Requirement: 15.7 - Rate Limiting Enforcement (10 messages per 10 seconds)
   */
  canSendMessage(userId: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const state = this.getUserState(userId);

    // Si la fenêtre a expiré, réinitialiser
    if (now - state.windowStart >= MESSAGING_CONFIG.rateLimiting.windowDurationMs) {
      this.resetUserState(userId);
      return { allowed: true };
    }

    // Vérifier si la limite est atteinte
    if (state.messageCount >= MESSAGING_CONFIG.rateLimiting.maxMessagesPerWindow) {
      const retryAfter = MESSAGING_CONFIG.rateLimiting.windowDurationMs - (now - state.windowStart);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Enregistre l'envoi d'un message
   */
  recordMessage(userId: string): void {
    const state = this.getUserState(userId);
    state.messageCount++;
    state.isLimited = state.messageCount >= MESSAGING_CONFIG.rateLimiting.maxMessagesPerWindow;
    this.userStates.set(userId, state);
  }

  /**
   * Obtient l'état du rate limiter pour un utilisateur
   */
  private getUserState(userId: string): RateLimitState {
    const existing = this.userStates.get(userId);
    
    if (existing) {
      return existing;
    }

    const newState: RateLimitState = {
      userId,
      messageCount: 0,
      windowStart: Date.now(),
      isLimited: false,
    };

    this.userStates.set(userId, newState);
    return newState;
  }

  /**
   * Réinitialise l'état d'un utilisateur
   */
  private resetUserState(userId: string): void {
    const newState: RateLimitState = {
      userId,
      messageCount: 0,
      windowStart: Date.now(),
      isLimited: false,
    };
    this.userStates.set(userId, newState);
  }

  /**
   * Nettoie les états expirés (à appeler périodiquement)
   */
  cleanup(): void {
    const now = Date.now();
    const expiredUsers: string[] = [];

    for (const [userId, state] of this.userStates.entries()) {
      if (now - state.windowStart >= MESSAGING_CONFIG.rateLimiting.windowDurationMs * 2) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      this.userStates.delete(userId);
    }
  }

  /**
   * Obtient les statistiques de rate limiting pour un utilisateur
   */
  getStats(userId: string): { messageCount: number; limit: number; resetIn: number } {
    const state = this.getUserState(userId);
    const now = Date.now();
    const resetIn = Math.max(0, MESSAGING_CONFIG.rateLimiting.windowDurationMs - (now - state.windowStart));

    return {
      messageCount: state.messageCount,
      limit: MESSAGING_CONFIG.rateLimiting.maxMessagesPerWindow,
      resetIn,
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Nettoyer les états expirés toutes les minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 60000);
