# 🔐 Guide d'accès à la page Admin

## Méthode 1: Comptes prédéfinis (Recommandé)

Utilisez un des comptes admin déjà créés :

### Super Admin
- **Email:** ethan@OLS.com  
  **Mot de passe:** ethan123

- **Email:** bastien@OLS.com  
  **Mot de passe:** bastien123

- **Email:** issam@OLS.com  
  **Mot de passe:** issam123

### Admin simple
- **Email:** admin  
  **Mot de passe:** admin123

---

## Méthode 2: Inscription en tant qu'Entreprise

Lors de l'inscription, choisissez "Entreprise" comme type de compte.
Les comptes entreprise reçoivent automatiquement le rôle 'admin'.

**Étapes:**
1. Aller sur `/register`
2. Choisir "Entreprise" à l'étape 1
3. Compléter l'inscription
4. Une fois connecté, accéder à `/admin`

---

## Méthode 3: Console du navigateur (Développement uniquement)

Si tu es déjà connecté et veux devenir admin :

1. Ouvrir la console du navigateur (F12)
2. Exécuter cette commande :

```javascript
localStorage.setItem('currentUserRole', 'admin');
window.location.reload();
```

Ou pour devenir super_admin :

```javascript
localStorage.setItem('currentUserRole', 'super_admin');
window.location.reload();
```

---

## Vérifier ton rôle actuel

Dans la console du navigateur :

```javascript
console.log('Rôle actuel:', localStorage.getItem('currentUserRole'));
console.log('Utilisateur:', localStorage.getItem('currentUser'));
```

---

## Accéder à la page Admin

Une fois que tu as le rôle 'admin' ou 'super_admin' :

1. **Via l'URL:** Aller directement sur `/admin`
2. **Via la Navbar:** Le lien "Admin" apparaît automatiquement dans la barre de navigation

---

## Différences entre les rôles

### user
- Accès aux pages publiques
- Accès à Munin et Hugin selon l'abonnement
- Pas d'accès à la page Admin

### admin
- Tous les accès de 'user'
- Accès à la page Admin
- Peut gérer les utilisateurs
- Peut voir les statistiques

### super_admin
- Tous les accès de 'admin'
- Accès complet à toutes les fonctionnalités
- Peut modifier les paramètres système

---

## Problèmes courants

### "Je ne vois pas le lien Admin dans la Navbar"
- Vérifier que tu es connecté
- Vérifier ton rôle avec la console
- Rafraîchir la page (F5)

### "Je suis redirigé vers /home quand j'accède à /admin"
- Ton rôle n'est pas 'admin' ou 'super_admin'
- Utiliser une des méthodes ci-dessus pour obtenir le rôle

### "Le compte est verrouillé"
- Attendre 15 minutes
- Ou utiliser un autre compte

---

## Pour la production

⚠️ **IMPORTANT:** Avant le déploiement en production :

1. Supprimer ou changer les mots de passe des comptes prédéfinis
2. Implémenter un système d'invitation pour les admins
3. Ajouter une authentification à deux facteurs (2FA)
4. Logger tous les accès à la page Admin

---

## Commandes utiles (Console)

### Lister tous les utilisateurs
```javascript
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_profile_')) {
        const user = JSON.parse(localStorage.getItem(key));
        console.log(user.email, '-', user.role);
    }
}
```

### Créer un admin manuellement
```javascript
const adminUser = {
    email: 'monadmin@test.com',
    password: 'hashed_password_here',
    username: 'monadmin',
    fullName: 'Mon Admin',
    role: 'admin',
    accountCategory: 'enterprise',
    subscription: {
        status: 'active',
        type: 'full',
        cycle: 'annual',
        modules: 'all',
        price: 2600
    },
    createdAt: new Date().toISOString()
};

localStorage.setItem('user_profile_monadmin@test.com', JSON.stringify(adminUser));
console.log('Admin créé !');
```

---

## Support

Si tu as toujours des problèmes d'accès :
1. Vérifier la console pour les erreurs
2. Vider le cache et les cookies
3. Utiliser le mode navigation privée
4. Contacter le support technique
