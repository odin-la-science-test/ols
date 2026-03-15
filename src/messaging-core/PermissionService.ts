/**
 * Service de gestion des permissions et rôles
 * 
 * Ce service gère l'attribution des rôles, la vérification des permissions
 * et le contrôle d'accès basé sur les rôles (RBAC).
 * 
 * Requirements: 5.1-5.7, 6.1-6.7 - Role Assignment and Permission System
 */

import { getDatabase, executeWithRetry } from '../messaging-db/database';
import { Role, Permission, IPermissionService } from '../messaging-types-v3/types';
import { ROLE_PERMISSIONS } from '../messaging-types-v3/constants';

export class PermissionService implements IPermissionService {
  /**
   * Vérifie si un utilisateur a une permission spécifique
   * Requirement: 6.1 - Permission Enforcement
   */
  async checkPermission(userId: string, permission: Permission): Promise<boolean> {
    const role = await this.getUserRole(userId);
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes(permission);
  }

  /**
   * Assigne un rôle à un utilisateur
   * Requirement: 5.1, 5.4 - Admin-Only Role Assignment
   */
  async assignRole(userId: string, role: Role): Promise<void> {
    // Vérifier qu'on ne retire pas le dernier admin
    if (role !== Role.ADMIN) {
      const adminCount = await this.getAdminCount();
      const currentRole = await this.getUserRole(userId);
      
      if (currentRole === Role.ADMIN && adminCount <= 1) {
        throw new Error('Cannot remove the last admin user');
      }
    }

    const db = getDatabase();
    await executeWithRetry(() => {
      const stmt = db.prepare('UPDATE messaging_users SET role = ? WHERE id = ?');
      stmt.run(role, userId);
    });
  }

  /**
   * Obtient le rôle d'un utilisateur
   * Requirement: 5.2 - Role Enumeration
   */
  async getUserRole(userId: string): Promise<Role> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT role FROM messaging_users WHERE id = ?');
    const result = stmt.get(userId) as { role: Role } | undefined;
    
    if (!result) {
      throw new Error(`User not found: ${userId}`);
    }
    
    return result.role;
  }

  /**
   * Vérifie si un utilisateur peut accéder à un canal
   * Requirement: 15.2 - Access Control Enforcement
   */
  async canAccessChannel(userId: string, channelId: string): Promise<boolean> {
    const db = getDatabase();
    
    // Vérifier si l'utilisateur est membre du canal
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messaging_channel_members 
      WHERE channel_id = ? AND user_id = ?
    `);
    const result = stmt.get(channelId, userId) as { count: number };
    
    return result.count > 0;
  }

  /**
   * Vérifie si un utilisateur peut supprimer un message
   * Requirement: 6.7 - Moderator/Admin Message Deletion
   */
  async canDeleteMessage(userId: string, messageId: string): Promise<boolean> {
    const db = getDatabase();
    const role = await this.getUserRole(userId);
    
    // Les admins et modérateurs peuvent supprimer n'importe quel message
    if (role === Role.ADMIN || role === Role.MODERATOR) {
      return true;
    }
    
    // Les membres peuvent supprimer leurs propres messages
    const stmt = db.prepare('SELECT sender_id FROM messaging_messages WHERE id = ?');
    const result = stmt.get(messageId) as { sender_id: string } | undefined;
    
    return result?.sender_id === userId;
  }

  /**
   * Compte le nombre d'administrateurs
   * Requirement: 5.7 - Last Admin Protection
   */
  private async getAdminCount(): Promise<number> {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM messaging_users WHERE role = ?`);
    const result = stmt.get(Role.ADMIN) as { count: number };
    return result.count;
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
