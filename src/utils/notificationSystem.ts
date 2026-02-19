/**
 * Système de notifications pour maintenances et évolutions
 */

import { generateSecureToken } from './encryption';

export type NotificationType = 'maintenance' | 'evolution' | 'update' | 'alert' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  date: string;
  scheduledDate?: string; // Pour les maintenances planifiées
  duration?: string; // Durée estimée de la maintenance
  affectedModules?: string[]; // Modules concernés
  version?: string; // Pour les évolutions
  features?: string[]; // Nouvelles fonctionnalités
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export class NotificationManager {
  private static readonly STORAGE_KEY = 'ols_notifications';
  private static readonly READ_KEY = 'ols_notifications_read';

  /**
   * Créer une notification de maintenance
   */
  static createMaintenanceNotification(data: {
    title: string;
    message: string;
    scheduledDate: string;
    duration: string;
    affectedModules?: string[];
    priority?: NotificationPriority;
    createdBy: string;
  }): Notification {
    const notification: Notification = {
      id: generateSecureToken(16),
      type: 'maintenance',
      priority: data.priority || 'high',
      title: data.title,
      message: data.message,
      date: new Date().toISOString(),
      scheduledDate: data.scheduledDate,
      duration: data.duration,
      affectedModules: data.affectedModules,
      isRead: false,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
    };

    this.saveNotification(notification);
    return notification;
  }

  /**
   * Créer une notification d'évolution
   */
  static createEvolutionNotification(data: {
    title: string;
    message: string;
    version: string;
    features: string[];
    priority?: NotificationPriority;
    createdBy: string;
  }): Notification {
    const notification: Notification = {
      id: generateSecureToken(16),
      type: 'evolution',
      priority: data.priority || 'medium',
      title: data.title,
      message: data.message,
      date: new Date().toISOString(),
      version: data.version,
      features: data.features,
      isRead: false,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
    };

    this.saveNotification(notification);
    return notification;
  }

  /**
   * Créer une notification générique
   */
  static createNotification(data: {
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    createdBy: string;
    expiresAt?: string;
  }): Notification {
    const notification: Notification = {
      id: generateSecureToken(16),
      type: data.type,
      priority: data.priority,
      title: data.title,
      message: data.message,
      date: new Date().toISOString(),
      isRead: false,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
    };

    this.saveNotification(notification);
    return notification;
  }

  /**
   * Récupérer toutes les notifications
   */
  static getAllNotifications(): Notification[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const notifications: Notification[] = data ? JSON.parse(data) : [];

    // Filtrer les notifications expirées
    const now = new Date().getTime();
    return notifications.filter(notif => {
      if (!notif.expiresAt) return true;
      return new Date(notif.expiresAt).getTime() > now;
    });
  }

  /**
   * Récupérer les notifications non lues
   */
  static getUnreadNotifications(userId: string): Notification[] {
    const notifications = this.getAllNotifications();
    const readIds = this.getReadNotificationIds(userId);
    
    return notifications.filter(notif => !readIds.includes(notif.id));
  }

  /**
   * Récupérer les notifications par type
   */
  static getNotificationsByType(type: NotificationType): Notification[] {
    return this.getAllNotifications().filter(notif => notif.type === type);
  }

  /**
   * Récupérer les maintenances à venir
   */
  static getUpcomingMaintenances(): Notification[] {
    const now = new Date().getTime();
    return this.getNotificationsByType('maintenance')
      .filter(notif => {
        if (!notif.scheduledDate) return false;
        return new Date(notif.scheduledDate).getTime() > now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.scheduledDate!).getTime();
        const dateB = new Date(b.scheduledDate!).getTime();
        return dateA - dateB;
      });
  }

  /**
   * Récupérer les dernières évolutions
   */
  static getLatestEvolutions(limit: number = 5): Notification[] {
    return this.getNotificationsByType('evolution')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Marquer une notification comme lue
   */
  static markAsRead(notificationId: string, userId: string): void {
    const readIds = this.getReadNotificationIds(userId);
    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId);
      this.saveReadNotificationIds(userId, readIds);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static markAllAsRead(userId: string): void {
    const notifications = this.getAllNotifications();
    const readIds = notifications.map(notif => notif.id);
    this.saveReadNotificationIds(userId, readIds);
  }

  /**
   * Supprimer une notification
   */
  static deleteNotification(notificationId: string, deleterId: string): { success: boolean; error?: string } {
    // Vérifier les permissions (seulement super_admin peut supprimer)
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      return { success: false, error: 'Non authentifié' };
    }

    const user = JSON.parse(currentUser);
    if (user.role !== 'super_admin') {
      return { success: false, error: 'Permission refusée' };
    }

    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(notif => notif.id !== notificationId);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));

    return { success: true };
  }

  /**
   * Sauvegarder une notification
   */
  private static saveNotification(notification: Notification): void {
    const notifications = this.getAllNotifications();
    notifications.push(notification);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }

  /**
   * Récupérer les IDs des notifications lues par un utilisateur
   */
  private static getReadNotificationIds(userId: string): string[] {
    const key = `${this.READ_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarder les IDs des notifications lues
   */
  private static saveReadNotificationIds(userId: string, ids: string[]): void {
    const key = `${this.READ_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(ids));
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  static getUnreadCount(userId: string): number {
    return this.getUnreadNotifications(userId).length;
  }

  /**
   * Nettoyer les anciennes notifications
   */
  static cleanupOldNotifications(daysToKeep: number = 90): void {
    const notifications = this.getAllNotifications();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTime = cutoffDate.getTime();

    const filtered = notifications.filter(notif => {
      const notifTime = new Date(notif.createdAt).getTime();
      return notifTime > cutoffTime;
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

/**
 * Notifications prédéfinies pour les super admins
 */
export const PREDEFINED_NOTIFICATIONS = {
  maintenance: {
    title: 'Maintenance Programmée',
    message: 'Une maintenance est prévue pour améliorer les performances de la plateforme.',
    priority: 'high' as NotificationPriority,
  },
  evolution: {
    title: 'Nouvelle Version Disponible',
    message: 'De nouvelles fonctionnalités ont été ajoutées à Odin La Science.',
    priority: 'medium' as NotificationPriority,
  },
  update: {
    title: 'Mise à Jour',
    message: 'Des améliorations et corrections ont été apportées.',
    priority: 'low' as NotificationPriority,
  },
};

export default NotificationManager;
