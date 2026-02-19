/**
 * Système de gestion des comptes et organisations
 */

import type { 
  AccountType, 
  OrganizationAccount, 
  Organization, 
  Department, 
  Team,
  AccountQuota,
  AccountPermissions
} from '../types/accountTypes';
import { DEFAULT_PERMISSIONS } from '../types/accountTypes';
import { SecurityLogger } from './securityConfig';
import { generateSecureToken } from './encryption';

/**
 * Gestionnaire de comptes
 */
export class AccountManager {
  private static readonly STORAGE_KEY = 'ols_accounts';
  private static readonly ORG_STORAGE_KEY = 'ols_organizations';

  /**
   * Créer un nouveau compte
   */
  static createAccount(
    accountData: Partial<OrganizationAccount>,
    creatorId: string
  ): { success: boolean; account?: OrganizationAccount; error?: string } {
    try {
      const creator = this.getAccount(creatorId);
      if (!creator) {
        return { success: false, error: 'Créateur non trouvé' };
      }

      // Vérifier les permissions
      if (!creator.permissions.canCreateAccounts) {
        SecurityLogger.log('unauthorized_account_creation', creatorId);
        return { success: false, error: 'Permission refusée' };
      }

      // Vérifier le quota
      if (!this.checkQuota(creator, accountData.accountType!)) {
        return { success: false, error: 'Quota de comptes atteint' };
      }

      // Créer le compte
      const account: OrganizationAccount = {
        id: generateSecureToken(16),
        email: accountData.email!,
        name: accountData.name!,
        firstName: accountData.firstName!,
        lastName: accountData.lastName!,
        accountType: accountData.accountType!,
        organizationId: accountData.organizationId || creator.organizationId,
        departmentId: accountData.departmentId,
        teamId: accountData.teamId,
        createdBy: creatorId,
        createdAt: new Date().toISOString(),
        permissions: DEFAULT_PERMISSIONS[accountData.accountType!],
        isActive: true,
      };

      // Sauvegarder
      this.saveAccount(account);

      // Mettre à jour les quotas
      this.updateQuotaUsage(creator.id, accountData.accountType!, 1);

      SecurityLogger.log('account_created', creatorId, {
        newAccountId: account.id,
        accountType: account.accountType,
      });

      return { success: true, account };
    } catch (error) {
      console.error('Error creating account:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  }

  /**
   * Vérifier le quota disponible
   */
  private static checkQuota(creator: OrganizationAccount, accountType: AccountType): boolean {
    // Super admins ont un quota illimité
    if (creator.accountType === 'super_admin') {
      return true;
    }

    // Directeurs : vérifier le quota de l'organisation
    if (creator.accountType === 'director') {
      const org = this.getOrganization(creator.organizationId);
      if (!org) return false;
      return org.accountsUsed < org.accountsPurchased;
    }

    // Chefs de département : vérifier le quota du département
    if (creator.accountType === 'department_head' && creator.departmentId) {
      const dept = this.getDepartment(creator.organizationId, creator.departmentId);
      if (!dept) return false;
      return dept.accountsUsed < dept.accountQuota;
    }

    // Chefs d'équipe : vérifier le quota de l'équipe
    if (creator.accountType === 'team_leader' && creator.teamId) {
      const team = this.getTeam(creator.organizationId, creator.departmentId!, creator.teamId);
      if (!team) return false;
      return team.accountsUsed < team.accountQuota;
    }

    return false;
  }

  /**
   * Mettre à jour l'utilisation du quota
   */
  private static updateQuotaUsage(creatorId: string, accountType: AccountType, delta: number): void {
    const creator = this.getAccount(creatorId);
    if (!creator) return;

    if (creator.accountType === 'director') {
      const org = this.getOrganization(creator.organizationId);
      if (org) {
        org.accountsUsed += delta;
        this.saveOrganization(org);
      }
    } else if (creator.accountType === 'department_head' && creator.departmentId) {
      const dept = this.getDepartment(creator.organizationId, creator.departmentId);
      if (dept) {
        dept.accountsUsed += delta;
        this.saveDepartment(creator.organizationId, dept);
      }
    } else if (creator.accountType === 'team_leader' && creator.teamId) {
      const team = this.getTeam(creator.organizationId, creator.departmentId!, creator.teamId);
      if (team) {
        team.accountsUsed += delta;
        this.saveTeam(creator.organizationId, creator.departmentId!, team);
      }
    }
  }

  /**
   * Attribuer un quota à un chef d'équipe
   */
  static assignQuota(
    assignerId: string,
    targetId: string,
    quota: number
  ): { success: boolean; error?: string } {
    const assigner = this.getAccount(assignerId);
    const target = this.getAccount(targetId);

    if (!assigner || !target) {
      return { success: false, error: 'Compte non trouvé' };
    }

    if (!assigner.permissions.canAssignAccountQuota) {
      return { success: false, error: 'Permission refusée' };
    }

    if (target.accountType !== 'team_leader') {
      return { success: false, error: 'Le quota ne peut être attribué qu\'aux chefs d\'équipe' };
    }

    // Mettre à jour le quota de l'équipe
    if (target.teamId) {
      const team = this.getTeam(target.organizationId, target.departmentId!, target.teamId);
      if (team) {
        team.accountQuota = quota;
        this.saveTeam(target.organizationId, target.departmentId!, team);
        
        SecurityLogger.log('quota_assigned', assignerId, {
          targetId,
          quota,
        });

        return { success: true };
      }
    }

    return { success: false, error: 'Équipe non trouvée' };
  }

  /**
   * Récupérer un compte
   */
  static getAccount(accountId: string): OrganizationAccount | null {
    const accounts = this.getAllAccounts();
    return accounts.find(acc => acc.id === accountId) || null;
  }

  /**
   * Récupérer tous les comptes
   */
  static getAllAccounts(): OrganizationAccount[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarder un compte
   */
  private static saveAccount(account: OrganizationAccount): void {
    const accounts = this.getAllAccounts();
    const index = accounts.findIndex(acc => acc.id === account.id);
    
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
  }

  /**
   * Récupérer une organisation
   */
  static getOrganization(orgId: string): Organization | null {
    const orgs = this.getAllOrganizations();
    return orgs.find(org => org.id === orgId) || null;
  }

  /**
   * Récupérer toutes les organisations
   */
  static getAllOrganizations(): Organization[] {
    const data = localStorage.getItem(this.ORG_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarder une organisation
   */
  private static saveOrganization(org: Organization): void {
    const orgs = this.getAllOrganizations();
    const index = orgs.findIndex(o => o.id === org.id);
    
    if (index >= 0) {
      orgs[index] = org;
    } else {
      orgs.push(org);
    }

    localStorage.setItem(this.ORG_STORAGE_KEY, JSON.stringify(orgs));
  }

  /**
   * Récupérer un département
   */
  static getDepartment(orgId: string, deptId: string): Department | null {
    const org = this.getOrganization(orgId);
    return org?.departments.find(dept => dept.id === deptId) || null;
  }

  /**
   * Sauvegarder un département
   */
  private static saveDepartment(orgId: string, dept: Department): void {
    const org = this.getOrganization(orgId);
    if (!org) return;

    const index = org.departments.findIndex(d => d.id === dept.id);
    if (index >= 0) {
      org.departments[index] = dept;
    } else {
      org.departments.push(dept);
    }

    this.saveOrganization(org);
  }

  /**
   * Récupérer une équipe
   */
  static getTeam(orgId: string, deptId: string, teamId: string): Team | null {
    const dept = this.getDepartment(orgId, deptId);
    return dept?.teams.find(team => team.id === teamId) || null;
  }

  /**
   * Sauvegarder une équipe
   */
  private static saveTeam(orgId: string, deptId: string, team: Team): void {
    const dept = this.getDepartment(orgId, deptId);
    if (!dept) return;

    const index = dept.teams.findIndex(t => t.id === team.id);
    if (index >= 0) {
      dept.teams[index] = team;
    } else {
      dept.teams.push(team);
    }

    this.saveDepartment(orgId, dept);
  }

  /**
   * Désactiver un compte
   */
  static deactivateAccount(accountId: string, deactivatorId: string): { success: boolean; error?: string } {
    const account = this.getAccount(accountId);
    const deactivator = this.getAccount(deactivatorId);

    if (!account || !deactivator) {
      return { success: false, error: 'Compte non trouvé' };
    }

    if (!deactivator.permissions.canManageAccounts) {
      return { success: false, error: 'Permission refusée' };
    }

    account.isActive = false;
    this.saveAccount(account);

    SecurityLogger.log('account_deactivated', deactivatorId, { accountId });

    return { success: true };
  }

  /**
   * Réactiver un compte
   */
  static reactivateAccount(accountId: string, activatorId: string): { success: boolean; error?: string } {
    const account = this.getAccount(accountId);
    const activator = this.getAccount(activatorId);

    if (!account || !activator) {
      return { success: false, error: 'Compte non trouvé' };
    }

    if (!activator.permissions.canManageAccounts) {
      return { success: false, error: 'Permission refusée' };
    }

    account.isActive = true;
    this.saveAccount(account);

    SecurityLogger.log('account_reactivated', activatorId, { accountId });

    return { success: true };
  }
}

export default AccountManager;
