/**
 * Service de cache en mémoire
 * 
 * Ce service implémente un cache LRU (Least Recently Used) pour optimiser
 * les performances en réduisant les accès à la base de données.
 * 
 * Requirements: 8.2 - Performance Optimization
 */

import { CacheEntry, CacheOptions, Channel, User } from '../messaging-types-v3/types';

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000;

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl: number = 300000): void {
    // Si le cache est plein, supprimer l'entrée la plus ancienne
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Supprime toutes les entrées correspondant à un pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // À implémenter si nécessaire
    };
  }

  /**
   * Cache un canal
   */
  cacheChannel(channel: Channel): void {
    this.set(`channel:${channel.id}`, channel, 600000); // 10 minutes
  }

  /**
   * Récupère un canal du cache
   */
  getCachedChannel(channelId: string): Channel | null {
    return this.get<Channel>(`channel:${channelId}`);
  }

  /**
   * Cache un utilisateur
   */
  cacheUser(user: User): void {
    this.set(`user:${user.id}`, user, 600000); // 10 minutes
  }

  /**
   * Récupère un utilisateur du cache
   */
  getCachedUser(userId: string): User | null {
    return this.get<User>(`user:${userId}`);
  }

  /**
   * Invalide le cache d'un canal
   */
  invalidateChannel(channelId: string): void {
    this.delete(`channel:${channelId}`);
  }

  /**
   * Invalide le cache d'un utilisateur
   */
  invalidateUser(userId: string): void {
    this.delete(`user:${userId}`);
  }
}

// Export singleton instance
export const cacheService = new CacheService();
