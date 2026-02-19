/**
 * Types de comptes et système de permissions
 */

export type AccountType = 
  | 'super_admin'        // Ethan, Bastien, Issam - Accès total
  | 'director'           // Directeur - Peut créer des comptes et gérer son organisation
  | 'department_head'    // Chef de département - Peut créer des comptes dans son département
  | 'team_leader'        // Chef d'équipe - Peut créer le nombre de comptes attribués
  | 'senior_technician'  // Technicien supérieur
  | 'technician'         // Technicien
  | 'engineer'           // Ingénieur
  | 'research_professor' // Professeur chercheur
  | 'student'            // Étudiant
  | 'personal';          // Personnel/Autre

/**
 * Prix par compte selon le type (en €/mois)
 */
export const ACCOUNT_PRICES: Record<AccountType, number> = {
  super_admin: 0,
  director: 150,
  department_head: 120,
  team_leader: 100,
  senior_technician: 80,
  technician: 60,
  engineer: 90,
  research_professor: 100,
  student: 40,
  personal: 50,
};

export interface AccountPermissions {
  // Accès aux modules
  canAccessMunin: boolean;
  canAccessHugin: boolean;
  canAccessHuginCore: boolean;
  canAccessHuginLab: boolean;
  canAccessHuginAnalysis: boolean;
  canAccessBudget: boolean;
  canAccessAdmin: boolean;

  // Gestion des comptes
  canCreateAccounts: boolean;
  canManageAccounts: boolean;
  maxAccountsToCreate: number | 'unlimited';
  canAssignAccountQuota: boolean;

  // Autres permissions
  canViewAllData: boolean;
  canExportData: boolean;
  canManageOrganization: boolean;
  canViewAnalytics: boolean;
}

export interface AccountQuota {
  accountType: AccountType;
  allocated: number;      // Nombre de comptes alloués
  used: number;          // Nombre de comptes utilisés
  remaining: number;     // Nombre de comptes restants
}

export interface OrganizationAccount {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  organizationId: string;
  departmentId?: string;
  teamId?: string;
  createdBy: string;
  createdAt: string;
  permissions: AccountPermissions;
  accountQuotas?: AccountQuota[];
  isActive: boolean;
  lastLogin?: string;
  subscription?: {
    planType: string;
    modules: string[];
    expiresAt?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  directorId: string;
  accountsPurchased: number;
  accountsUsed: number;
  createdAt: string;
  subscription: {
    planType: 'basic' | 'professional' | 'enterprise';
    modules: string[];
    maxAccounts: number;
    expiresAt: string;
  };
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  organizationId: string;
  headId: string;
  accountQuota: number;
  accountsUsed: number;
  teams: Team[];
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leaderId: string;
  accountQuota: number;
  accountsUsed: number;
}

/**
 * Permissions par défaut pour chaque type de compte
 */
export const DEFAULT_PERMISSIONS: Record<AccountType, AccountPermissions> = {
  super_admin: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: true,
    canAccessAdmin: true,
    canCreateAccounts: true,
    canManageAccounts: true,
    maxAccountsToCreate: 'unlimited',
    canAssignAccountQuota: true,
    canViewAllData: true,
    canExportData: true,
    canManageOrganization: true,
    canViewAnalytics: true,
  },
  director: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: true,
    canAccessAdmin: false,
    canCreateAccounts: true,
    canManageAccounts: true,
    maxAccountsToCreate: 'unlimited', // Limité par l'abonnement
    canAssignAccountQuota: true,
    canViewAllData: true,
    canExportData: true,
    canManageOrganization: true,
    canViewAnalytics: true,
  },
  department_head: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: true,
    canAccessAdmin: false,
    canCreateAccounts: true,
    canManageAccounts: true,
    maxAccountsToCreate: 'unlimited', // Limité par le quota du département
    canAssignAccountQuota: true,
    canViewAllData: false,
    canExportData: true,
    canManageOrganization: false,
    canViewAnalytics: true,
  },
  team_leader: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: true,
    canManageAccounts: false,
    maxAccountsToCreate: 0, // Défini par le chef de département
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: true,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  senior_technician: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: true,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  technician: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: false,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: false,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  engineer: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: true,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  research_professor: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: true,
    canAccessHuginAnalysis: true,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: true,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  student: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: false,
    canAccessHuginAnalysis: false,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: false,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
  personal: {
    canAccessMunin: true,
    canAccessHugin: true,
    canAccessHuginCore: true,
    canAccessHuginLab: false,
    canAccessHuginAnalysis: false,
    canAccessBudget: false,
    canAccessAdmin: false,
    canCreateAccounts: false,
    canManageAccounts: false,
    maxAccountsToCreate: 0,
    canAssignAccountQuota: false,
    canViewAllData: false,
    canExportData: false,
    canManageOrganization: false,
    canViewAnalytics: false,
  },
};

/**
 * Labels pour l'affichage
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  super_admin: 'Super Administrateur',
  director: 'Directeur',
  department_head: 'Chef de Département',
  team_leader: 'Chef d\'Équipe',
  senior_technician: 'Technicien Supérieur',
  technician: 'Technicien',
  engineer: 'Ingénieur',
  research_professor: 'Professeur Chercheur',
  student: 'Étudiant',
  personal: 'Personnel',
};

/**
 * Descriptions des types de comptes
 */
export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  super_admin: 'Accès complet à toutes les fonctionnalités et gestion globale',
  director: 'Gestion de l\'organisation, création de comptes et accès complet',
  department_head: 'Gestion du département, création de comptes dans le quota alloué',
  team_leader: 'Gestion d\'équipe, création de comptes selon le quota attribué',
  senior_technician: 'Accès complet aux outils de laboratoire et d\'analyse',
  technician: 'Accès aux outils de base du laboratoire',
  engineer: 'Accès complet aux outils techniques et d\'analyse',
  research_professor: 'Accès complet pour la recherche et l\'enseignement',
  student: 'Accès de base pour l\'apprentissage',
  personal: 'Accès personnel limité',
};
