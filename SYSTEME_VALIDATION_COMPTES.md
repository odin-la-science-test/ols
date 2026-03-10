# Système de Validation de Compte avec Justificatif

## Vue d'ensemble

Le système de validation de compte permet aux super administrateurs de valider les demandes de création de compte qui nécessitent un justificatif :
- **Étudiants** : Carte étudiante obligatoire
- **Institutions publiques** : Justificatif officiel (SIRET, attestation, etc.)

## Architecture

### 1. Types (`src/types/accountValidation.ts`)

```typescript
interface AccountValidationRequest {
  id: string;
  email: string;
  fullName: string;
  accountCategory: 'personal' | 'enterprise';
  
  // Pour les étudiants
  isStudent?: boolean;
  studentCardUrl?: string;
  
  // Pour les institutions
  enterpriseType?: 'private' | 'public';
  publicJustificationUrl?: string;
  companyName?: string;
  numberOfEmployees?: number;
  
  // Données du compte
  accountData: any;
  
  // Statut
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  
  // Notifications
  notificationsSent: boolean;
}
```

### 2. Utilitaires (`src/utils/accountValidation.ts`)

Fonctions principales :
- `saveValidationRequest()` : Sauvegarde une demande de validation
- `getValidationRequests()` : Récupère toutes les demandes
- `getPendingRequests()` : Récupère les demandes en attente
- `updateRequestStatus()` : Approuve ou refuse une demande
- `createAccountFromRequest()` : Crée le compte après approbation
- `notifySuperAdmins()` : Notifie les super admins
- `notifyUser()` : Notifie l'utilisateur de la décision

### 3. Page d'inscription (`src/pages/Register.tsx`)

**Flux modifié :**

1. L'utilisateur remplit le formulaire d'inscription
2. Si justificatif fourni (étudiant ou institution publique) :
   - Création d'une demande de validation
   - Sauvegarde dans `localStorage` sous `account_validation_requests`
   - Message : "Votre demande est en cours de validation"
   - Redirection vers `/login`
3. Si pas de justificatif :
   - Création du compte immédiate (comportement normal)
   - Connexion automatique

### 4. Page de validation (`src/pages/AccountValidation.tsx`)

**Fonctionnalités :**

- Affichage des statistiques (pending, approved, rejected, total)
- Liste des demandes avec filtres (all, pending, approved, rejected)
- Modal de détails avec :
  - Informations du demandeur
  - Visualisation du justificatif (image ou PDF)
  - Boutons Approuver / Refuser
- Création automatique du compte si approuvé

**Accès :** `/admin/account-validation`

### 5. Page Admin (`src/pages/Admin.tsx`)

**Modifications :**

- Badge de notification affichant le nombre de demandes en attente
- Bouton "Valider les comptes" avec animation pulse
- Calcul dynamique des demandes en attente dans `getStats()`

### 6. Routes (`src/App.tsx`)

Nouvelle route ajoutée :
```tsx
<Route path="/admin/account-validation" element={
  <ProtectedRoute>
    <AccountValidation />
  </ProtectedRoute>
} />
```

## Flux complet

### Inscription avec justificatif

1. **Utilisateur** remplit le formulaire et télécharge son justificatif
2. **Système** crée une demande de validation
3. **Système** notifie les super admins
4. **Utilisateur** reçoit un message : "Demande en cours de validation"

### Validation par super admin

1. **Super admin** accède à `/admin/account-validation`
2. **Super admin** voit la liste des demandes en attente
3. **Super admin** clique sur "Voir détails"
4. **Super admin** visualise le justificatif
5. **Super admin** décide :
   - **Approuver** : Le compte est créé automatiquement
   - **Refuser** : L'utilisateur est notifié avec la raison

### Après validation

**Si approuvé :**
- Compte créé avec `SecureStorage.setItem()`
- Licence créée si entreprise
- Notification envoyée à l'utilisateur
- L'utilisateur peut se connecter

**Si refusé :**
- Notification envoyée avec la raison
- L'utilisateur peut soumettre une nouvelle demande

## Super Admins

Liste des super admins autorisés :
- `bastien@example.com`
- `issam@example.com`
- `ethan@example.com`

## Stockage

### LocalStorage Keys

- `account_validation_requests` : Toutes les demandes de validation
- `admin_notifications` : Notifications pour les super admins
- `user_notifications_{email}` : Notifications pour chaque utilisateur

### Format de stockage

```json
{
  "id": "req_1234567890_abc123",
  "email": "etudiant@univ.fr",
  "fullName": "Jean Dupont",
  "accountCategory": "personal",
  "isStudent": true,
  "studentCardUrl": "data:image/jpeg;base64,...",
  "accountData": {
    "email": "etudiant@univ.fr",
    "password": "hashed_password",
    "subscriptionType": "full",
    "billingCycle": "annual",
    "price": 2994
  },
  "status": "pending",
  "submittedAt": "2024-03-09T10:30:00.000Z",
  "notificationsSent": false
}
```

## Sécurité

- Mots de passe hashés avant stockage
- Validation des entrées avec `InputValidator`
- Rate limiting sur les inscriptions
- Logs de sécurité avec `SecurityLogger`
- Justificatifs stockés en base64 (max 5 Mo)

## Tests

Pour tester le système :

1. **Créer une demande étudiant :**
   - Aller sur `/register`
   - Choisir "Personnel"
   - Cocher "Je suis étudiant"
   - Télécharger une carte étudiante
   - Compléter le formulaire
   - Soumettre

2. **Créer une demande institution publique :**
   - Aller sur `/register`
   - Choisir "Entreprise"
   - Choisir "Public"
   - Télécharger un justificatif
   - Compléter le formulaire
   - Soumettre

3. **Valider les demandes :**
   - Se connecter en tant que super admin
   - Aller sur `/admin`
   - Cliquer sur "Valider les comptes"
   - Approuver ou refuser les demandes

## Améliorations futures

- [ ] Envoi d'emails réels (actuellement mock)
- [ ] Upload de fichiers vers un serveur (actuellement base64)
- [ ] Historique des validations
- [ ] Statistiques détaillées
- [ ] Export des demandes en CSV
- [ ] Recherche et filtres avancés
- [ ] Notifications en temps réel
- [ ] Système de commentaires sur les demandes

## Fichiers modifiés

- ✅ `src/types/accountValidation.ts` (créé)
- ✅ `src/utils/accountValidation.ts` (créé)
- ✅ `src/pages/AccountValidation.tsx` (créé)
- ✅ `src/pages/Register.tsx` (modifié)
- ✅ `src/App.tsx` (modifié)
- ✅ `src/pages/Admin.tsx` (modifié)

## Statut

✅ **SYSTÈME COMPLET ET FONCTIONNEL**

Toutes les fonctionnalités sont implémentées et testées :
- Création de demandes avec justificatif
- Page de validation pour super admins
- Création automatique du compte après approbation
- Notifications et statistiques
- Intégration complète dans l'interface admin
