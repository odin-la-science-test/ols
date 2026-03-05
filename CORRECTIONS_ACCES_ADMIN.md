# Corrections d'accès Admin

## Problème
Le compte `admin` avec le rôle `super_admin` n'avait pas accès à la page `/admin`.

## Causes identifiées

1. **Rôles incorrects dans LoginSimple.tsx**
   - Les comptes ethan, bastien, issam avaient le rôle `'user'` au lieu de `'super_admin'`
   - Seul le compte admin avait le bon rôle

2. **Rôle incorrect dans initTestAccounts.ts**
   - Le compte admin avait le rôle `'admin'` au lieu de `'super_admin'`

3. **Vérification d'accès dans Admin.tsx**
   - La liste des super admins utilisait des emails en majuscules (`@OLS.com`)
   - Le localStorage sauvegarde les emails en minuscules (`toLowerCase()`)
   - Le compte `admin` n'était pas dans la liste initiale

## Corrections appliquées

### 1. LoginSimple.tsx
```typescript
const testAccounts: TestAccount[] = [
  { email: 'ethan@ols.com', password: 'ethan123', code: '1234', role: 'super_admin' },
  { email: 'bastien@ols.com', password: 'bastien123', code: '5678', role: 'super_admin' },
  { email: 'issam@ols.com', password: 'issam123', code: '9012', role: 'super_admin' },
  { email: 'admin', password: 'admin123', code: '0000', role: 'super_admin' },
  { email: 'trinity@ols.com', password: 'trinity123', code: '4321', role: 'student' }
];
```

### 2. initTestAccounts.ts
```typescript
{
  email: 'admin',
  password: 'admin123',
  role: 'super_admin',  // Changé de 'admin' à 'super_admin'
  firstName: 'Admin',
  lastName: 'User'
}
```

### 3. Admin.tsx
```typescript
useEffect(() => {
  // Vérifier si l'utilisateur est un super admin
  const currentUserEmail = localStorage.getItem('currentUser');
  const currentUserRole = localStorage.getItem('currentUserRole');
  const superAdmins = ['ethan@ols.com', 'bastien@ols.com', 'issam@ols.com', 'admin'];
  
  // Autoriser l'accès si :
  // 1. L'email est dans la liste des super admins (en minuscules)
  // 2. OU le rôle est 'super_admin'
  const isAuthorized = currentUserEmail && (
    superAdmins.includes(currentUserEmail.toLowerCase()) || 
    currentUserRole === 'super_admin'
  );
  
  if (!isAuthorized) {
    console.log('🚫 Accès refusé à /admin - Redirection vers /home');
    navigate('/home');
    return;
  }

  console.log('✅ Accès autorisé à /admin pour:', currentUserEmail);
  loadUsers();
}, [navigate]);
```

## Test de la correction

### Étapes de test
1. Vider le localStorage : `localStorage.clear()` dans la console (F12)
2. Recharger la page : `Ctrl+Shift+R`
3. Se connecter avec :
   - Email: `admin`
   - Password: `admin123`
   - Code: `0000`
4. Vérifier le rôle dans la console :
   ```javascript
   localStorage.getItem('currentUserRole')
   // Doit afficher: "super_admin"
   ```
5. Aller sur `http://localhost:3001/admin`
6. L'accès doit être autorisé

### Comptes de test avec accès admin

| Email | Password | Code | Rôle | Accès Admin |
|-------|----------|------|------|-------------|
| ethan@ols.com | ethan123 | 1234 | super_admin | ✅ |
| bastien@ols.com | bastien123 | 5678 | super_admin | ✅ |
| issam@ols.com | issam123 | 9012 | super_admin | ✅ |
| admin | admin123 | 0000 | super_admin | ✅ |
| trinity@ols.com | trinity123 | 4321 | student | ❌ |

## Vérification dans la console

Après connexion, vérifier :
```javascript
// Doit afficher l'email en minuscules
localStorage.getItem('currentUser')

// Doit afficher 'super_admin'
localStorage.getItem('currentUserRole')

// Doit afficher 'true'
localStorage.getItem('isLoggedIn')
```

## Messages de log

Dans la console, vous devriez voir :
- `✅ Accès autorisé à /admin pour: admin` (ou autre email)
- `Connexion reussie: admin Role: super_admin`

Si l'accès est refusé :
- `🚫 Accès refusé à /admin - Redirection vers /home`

## Fichiers modifiés

1. `src/pages/LoginSimple.tsx` - Rôles des comptes de test corrigés
2. `src/utils/initTestAccounts.ts` - Rôle du compte admin corrigé
3. `src/pages/Admin.tsx` - Vérification d'accès améliorée

## Notes importantes

- Les emails sont toujours sauvegardés en minuscules dans localStorage
- La vérification d'accès vérifie maintenant :
  1. Si l'email est dans la liste des super admins
  2. OU si le rôle est 'super_admin'
- Cela permet une flexibilité pour ajouter de nouveaux super admins sans modifier le code
