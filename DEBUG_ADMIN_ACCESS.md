# 🔍 Debug - Accès Admin

## Problème résolu

La page Admin vérifiait uniquement le rôle 'admin' mais pas 'super_admin'.

**Correction effectuée :**
```typescript
// AVANT
if (currentUserRole !== 'admin') {
    navigate('/home');
    return;
}

// APRÈS
if (currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
    navigate('/home');
    return;
}
```

---

## Comment vérifier ton accès

### 1. Ouvre la console du navigateur (F12)

### 2. Vérifie ton rôle actuel
```javascript
console.log('Rôle:', localStorage.getItem('currentUserRole'));
console.log('Utilisateur:', localStorage.getItem('currentUser'));
console.log('Connecté:', localStorage.getItem('isLoggedIn'));
```

### 3. Si tu n'es pas admin, deviens-le
```javascript
localStorage.setItem('currentUserRole', 'admin');
// OU
localStorage.setItem('currentUserRole', 'super_admin');
```

### 4. Recharge la page
```javascript
window.location.reload();
```

---

## Comptes de test disponibles

### Super Admin (accès complet)
- **ethan@OLS.com** / ethan123
- **bastien@OLS.com** / bastien123
- **issam@OLS.com** / issam123

### Admin simple
- **admin** / admin123

---

## Vérification rapide

Si la page se ferme immédiatement, c'est que :
1. Tu n'es pas connecté → Va sur `/login`
2. Ton rôle n'est pas 'admin' ou 'super_admin' → Utilise la console
3. Le localStorage est vide → Reconnecte-toi

---

## Solution rapide (si déjà connecté)

**Dans la console du navigateur :**
```javascript
// Devenir super admin
localStorage.setItem('currentUserRole', 'super_admin');
window.location.href = '/admin';
```

Cela te redirigera directement vers la page admin avec les bons droits !

---

## Tester maintenant

1. Ouvre la console (F12)
2. Copie-colle cette commande :
```javascript
localStorage.setItem('currentUserRole', 'super_admin');
alert('Tu es maintenant super admin ! Recharge la page.');
```
3. Recharge la page (F5)
4. Va sur `/admin`

✅ Ça devrait fonctionner maintenant !
