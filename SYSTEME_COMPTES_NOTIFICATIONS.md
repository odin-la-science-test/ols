# Système de Gestion des Comptes et Notifications

## 📋 Vue d'ensemble

Ce document décrit le système complet de gestion des comptes hiérarchiques et des notifications pour Odin La Science.

## 👥 Types de Comptes

### Hiérarchie des Comptes

```
Super Admin (Ethan, Bastien, Issam)
    ↓
Directeur
    ↓
Chef de Département
    ↓
Chef d'Équipe
    ↓
Membres (Techniciens, Ingénieurs, Professeurs, Étudiants, Personnel)
```

### 1. Super Administrateur
- **Qui**: Ethan, Bastien, Issam
- **Permissions**:
  - Accès total à toutes les fonctionnalités
  - Création illimitée de tous types de comptes
  - Attribution de quotas illimités
  - Gestion des notifications système
  - Pas de paiement requis

### 2. Directeur
- **Permissions**:
  - Accès complet (Munin + Hugin complet + Budget)
  - Création de comptes selon l'abonnement payé
  - Attribution de quotas aux chefs de département
  - Gestion de l'organisation
  - Visualisation des analytics
- **Paiement**: Achète un nombre de comptes pour son organisation

### 3. Chef de Département
- **Permissions**:
  - Accès complet (Munin + Hugin complet + Budget)
  - Création de comptes dans le quota alloué
  - Attribution de quotas aux chefs d'équipe
  - Gestion du département
- **Quota**: Défini par le Directeur

### 4. Chef d'Équipe
- **Permissions**:
  - Accès Munin + Hugin Core + Hugin Lab + Hugin Analysis
  - Création de comptes selon le quota attribué
  - Gestion de l'équipe
- **Quota**: Défini par le Chef de Département

### 5. Technicien Supérieur
- **Permissions**:
  - Accès Munin + Hugin complet
  - Export de données
- **Quota**: Aucun

### 6. Technicien
- **Permissions**:
  - Accès Munin + Hugin Core + Hugin Lab
- **Quota**: Aucun

### 7. Ingénieur
- **Permissions**:
  - Accès Munin + Hugin complet
  - Export de données
- **Quota**: Aucun

### 8. Professeur Chercheur
- **Permissions**:
  - Accès Munin + Hugin complet
  - Export de données
- **Quota**: Aucun

### 9. Étudiant
- **Permissions**:
  - Accès Munin + Hugin Core uniquement
- **Quota**: Aucun

### 10. Personnel
- **Permissions**:
  - Accès Munin + Hugin Core uniquement
- **Quota**: Aucun

## 💰 Système de Paiement et Quotas

### Modèle de Paiement

1. **Directeur achète des comptes**
   - Exemple: 50 comptes pour 500€/mois
   - Peut distribuer ces 50 comptes comme il le souhaite

2. **Distribution des quotas**
   ```
   Directeur (50 comptes achetés)
       ↓ Attribue 20 au Département A
       ↓ Attribue 30 au Département B
   
   Chef Département A (20 comptes)
       ↓ Attribue 10 à l'Équipe 1
       ↓ Attribue 10 à l'Équipe 2
   
   Chef Équipe 1 (10 comptes)
       ↓ Crée 5 comptes Techniciens
       ↓ Crée 3 comptes Étudiants
       ↓ Crée 2 comptes Ingénieurs
   ```

3. **Super Admins**
   - Peuvent créer n'importe quel type de compte gratuitement
   - Peuvent attribuer des quotas illimités
   - Utilisé pour les comptes de démonstration ou partenaires

## 🔔 Système de Notifications

### Types de Notifications

1. **Maintenance**
   - Date et heure programmées
   - Durée estimée
   - Modules affectés
   - Priorité: Haute

2. **Évolution**
   - Numéro de version
   - Liste des nouvelles fonctionnalités
   - Priorité: Moyenne

3. **Mise à jour**
   - Corrections de bugs
   - Améliorations mineures
   - Priorité: Basse

4. **Alerte**
   - Problèmes critiques
   - Actions requises
   - Priorité: Critique

5. **Info**
   - Informations générales
   - Conseils d'utilisation
   - Priorité: Basse

### Gestion des Notifications

- **Création**: Réservée aux Super Admins
- **Affichage**: Tous les utilisateurs
- **Marquage lu/non lu**: Par utilisateur
- **Expiration**: Configurable
- **Nettoyage**: Automatique après 90 jours

## 📊 Structure des Données

### OrganizationAccount
```typescript
{
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
}
```

### Organization
```typescript
{
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
```

### Notification
```typescript
{
  id: string;
  type: 'maintenance' | 'evolution' | 'update' | 'alert' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  date: string;
  scheduledDate?: string;
  duration?: string;
  affectedModules?: string[];
  version?: string;
  features?: string[];
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}
```

## 🔧 Utilisation

### Créer un compte

```typescript
import { AccountManager } from './utils/accountManagement';

const result = AccountManager.createAccount({
  email: 'user@example.com',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  accountType: 'technician',
  organizationId: 'org-123',
  departmentId: 'dept-456',
}, creatorId);

if (result.success) {
  console.log('Compte créé:', result.account);
} else {
  console.error('Erreur:', result.error);
}
```

### Attribuer un quota

```typescript
const result = AccountManager.assignQuota(
  assignerId,
  teamLeaderId,
  10 // 10 comptes
);
```

### Créer une notification de maintenance

```typescript
import { NotificationManager } from './utils/notificationSystem';

const notification = NotificationManager.createMaintenanceNotification({
  title: 'Maintenance Serveur',
  message: 'Maintenance programmée pour améliorer les performances',
  scheduledDate: '2026-03-01T02:00:00Z',
  duration: '2 heures',
  affectedModules: ['Hugin Lab', 'Hugin Analysis'],
  priority: 'high',
  createdBy: 'ethan@OLS.com',
});
```

### Créer une notification d'évolution

```typescript
const notification = NotificationManager.createEvolutionNotification({
  title: 'Version 2.5.0 Disponible',
  message: 'Nouvelles fonctionnalités ajoutées',
  version: '2.5.0',
  features: [
    'Nouveau module PCR Designer',
    'Amélioration du Gel Simulator',
    'Export PDF pour les rapports',
  ],
  priority: 'medium',
  createdBy: 'ethan@OLS.com',
});
```

### Récupérer les notifications non lues

```typescript
const unreadNotifications = NotificationManager.getUnreadNotifications(userId);
const unreadCount = NotificationManager.getUnreadCount(userId);
```

## 🎨 Interface Utilisateur

### Page d'Administration (Super Admin)

1. **Gestion des Comptes**
   - Liste de tous les comptes
   - Création de nouveaux comptes
   - Attribution de quotas
   - Activation/Désactivation

2. **Gestion des Notifications**
   - Créer une maintenance
   - Créer une évolution
   - Créer une alerte
   - Historique des notifications

3. **Statistiques**
   - Nombre total de comptes
   - Comptes par type
   - Utilisation des quotas
   - Notifications actives

### Centre de Notifications (Tous les utilisateurs)

1. **Liste des notifications**
   - Filtre par type
   - Filtre par priorité
   - Tri par date
   - Marquage lu/non lu

2. **Détails de notification**
   - Titre et message complet
   - Date et heure
   - Informations spécifiques (maintenance, évolution)
   - Actions possibles

3. **Badge de notification**
   - Nombre de notifications non lues
   - Indicateur visuel
   - Mise à jour en temps réel

## 🔐 Sécurité

- Toutes les actions sont loggées
- Vérification des permissions à chaque opération
- Validation des quotas avant création
- Tokens sécurisés pour les IDs
- Chiffrement des données sensibles

## 📈 Prochaines Étapes

1. Créer l'interface d'administration
2. Créer le centre de notifications
3. Intégrer avec le système de paiement
4. Ajouter les emails de notification
5. Créer un dashboard analytics
6. Implémenter l'API backend

---

**Fichiers créés**:
- `src/types/accountTypes.ts` - Définitions des types
- `src/utils/accountManagement.ts` - Gestion des comptes
- `src/utils/notificationSystem.ts` - Système de notifications
