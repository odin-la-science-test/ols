# 🔒 Guide de Connexion avec Chiffrement AES-256

## ✅ Problème Résolu

Le système de connexion utilise maintenant **correctement** le chiffrement AES-256 pour tous les comptes utilisateurs.

### 🔧 Corrections Apportées

1. **ShieldUtils.ts** : Modifié pour utiliser `SecureStorage.getItem()` au lieu de `JSON.parse()` direct
   - Avant : Les profils chiffrés étaient considérés comme corrompus et supprimés
   - Après : Les profils chiffrés sont correctement déchiffrés avec AES-256

2. **Hugin.tsx** : Mise à jour pour gérer l'appel async de `getAccessData()`
   - Utilise `useState` et `useEffect` pour charger les données de manière asynchrone

3. **CommandPalette.tsx** : Même mise à jour pour la compatibilité async

4. **App.tsx** : Suppression de l'import inutilisé de `getAccessData`

## 🚀 Comment Utiliser

### Option 1 : Réinitialisation Complète (Recommandé)

1. Ouvrez dans votre navigateur : `http://localhost:3001/reset-and-init.html`
2. Cliquez sur **"🗑️ Nettoyer tout le localStorage"**
3. Cliquez sur **"✨ Initialiser les comptes (AES-256)"**
4. Attendez le message de confirmation
5. Allez sur `http://localhost:3001/login` et connectez-vous

### Option 2 : Laisser l'Application Initialiser

1. Faites un **hard refresh** : `Ctrl + Shift + R`
2. L'application initialisera automatiquement les comptes au démarrage
3. Allez sur `/login` et connectez-vous

## 👥 Comptes de Test Disponibles

Tous ces comptes sont créés avec chiffrement AES-256 :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| **ethan@ols.com** | ethan123 | super_admin |
| **bastien@ols.com** | bastien123 | super_admin |
| **issam@ols.com** | issam123 | super_admin |
| **admin** | admin123 | admin |
| **trinity@ols.com** | trinity123 | student |

## 🔐 Sécurité

### Chiffrement AES-256-GCM

- **Algorithme** : AES-256-GCM (Galois/Counter Mode)
- **Dérivation de clé** : PBKDF2 avec 100,000 itérations
- **Salt** : 16 bytes aléatoires par entrée
- **IV** : 12 bytes aléatoires par chiffrement
- **Hash des mots de passe** : SHA-256

### Stockage Sécurisé

Toutes les données sensibles sont stockées via `SecureStorage` :
- Profils utilisateurs
- Mots de passe (hashés avec SHA-256)
- Données de session
- Clés API

## 🐛 Dépannage

### "Email ou mot de passe incorrects"

1. Vérifiez que vous avez fait un hard refresh (`Ctrl + Shift + R`)
2. Ouvrez la console (F12) et vérifiez s'il y a des erreurs
3. Utilisez `http://localhost:3001/reset-and-init.html` pour réinitialiser
4. Vérifiez que vous utilisez les bons identifiants (voir tableau ci-dessus)

### Erreurs de déchiffrement dans la console

Si vous voyez des erreurs comme :
```
Decryption error: InvalidCharacterError: Failed to execute 'atob'
```

Cela signifie que vous avez des données corrompues ou non chiffrées dans le localStorage.

**Solution** : Utilisez l'outil de réinitialisation (`reset-and-init.html`)

### "Error parsing user profile, clearing corrupted data"

Ce message ne devrait plus apparaître. Si vous le voyez encore :
1. Vérifiez que vous avez bien les dernières modifications
2. Faites un hard refresh
3. Réinitialisez avec `reset-and-init.html`

## 📝 Notes Techniques

### Flux de Connexion

1. L'utilisateur entre email + mot de passe
2. Le mot de passe est hashé avec SHA-256
3. Le profil est récupéré via `SecureStorage.getItem()` (déchiffrement AES-256)
4. Le hash du mot de passe est comparé avec celui stocké
5. Si match : connexion réussie, session créée

### Compatibilité

Le système gère automatiquement :
- ✅ Données chiffrées avec AES-256 (nouveau système)
- ✅ Données legacy en base64 (ancien système)
- ✅ Données legacy en JSON brut (très ancien système)

### Fichiers Modifiés

- `src/utils/ShieldUtils.ts` - Lecture sécurisée des profils
- `src/pages/Hugin.tsx` - Gestion async de getAccessData
- `src/components/CommandPalette.tsx` - Gestion async de getAccessData
- `src/App.tsx` - Nettoyage des imports
- `public/reset-and-init.html` - Outil de réinitialisation (nouveau)

## ✨ Prochaines Étapes

1. Testez la connexion avec les comptes de test
2. Créez de nouveaux comptes via `/register` (ils seront automatiquement chiffrés)
3. Vérifiez que tous les modules Hugin sont accessibles selon les rôles

## 🎉 Résultat

Vous avez maintenant un système de connexion **sécurisé** avec :
- ✅ Chiffrement AES-256 pour tous les profils
- ✅ Hash SHA-256 pour les mots de passe
- ✅ Compatibilité avec les anciennes données
- ✅ Outil de réinitialisation facile
- ✅ Pas de suppression automatique des données chiffrées
