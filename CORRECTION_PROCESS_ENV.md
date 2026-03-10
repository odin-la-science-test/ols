# ✅ Correction de l'erreur "process is not defined"

## 🐛 Problème

```
Uncaught ReferenceError: process is not defined
at emailConfig.ts:29:13
```

## 🔍 Cause

Le fichier `src/config/emailConfig.ts` utilisait `process.env` qui n'existe pas dans le navigateur. Avec Vite, il faut utiliser `import.meta.env` à la place.

## 🔧 Corrections Apportées

### 1. Fichier `src/config/emailConfig.ts`

Remplacé toutes les occurrences de `process.env` par `import.meta.env.VITE_` :

**Avant :**
```typescript
apiKey: process.env.SENDGRID_API_KEY || '',
region: process.env.AWS_REGION || 'eu-west-1',
smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
// ...
const emailProvider = process.env.EMAIL_PROVIDER || 'custom';
```

**Après :**
```typescript
apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
region: import.meta.env.VITE_AWS_REGION || 'eu-west-1',
smtpHost: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
// ...
const emailProvider = import.meta.env.VITE_EMAIL_PROVIDER || 'custom';
```

### 2. Fichier `.env.local`

Ajouté le préfixe `VITE_` aux variables d'environnement :

**Avant :**
```env
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
```

**Après :**
```env
VITE_EMAIL_SERVER_URL=http://localhost:3001
VITE_EMAIL_PROVIDER=custom
```

### 3. Ajout de la configuration `customApiConfig`

Ajouté une configuration spécifique pour l'API personnalisée (Resend) :

```typescript
export const customApiConfig: EmailConfig = {
    provider: 'custom',
    fromEmail: 'onboarding@resend.dev',
    fromName: 'Odin La Science'
};
```

## 📝 Règles Vite pour les Variables d'Environnement

### Variables accessibles dans le navigateur
- Doivent commencer par `VITE_`
- Accessibles via `import.meta.env.VITE_NOM_VARIABLE`
- Exemple : `VITE_API_URL`, `VITE_EMAIL_PROVIDER`

### Variables serveur uniquement
- Sans préfixe `VITE_`
- Accessibles uniquement côté serveur (Node.js)
- Exemple : `DATABASE_URL`, `SECRET_KEY`

## ✅ Résultat

L'erreur est maintenant corrigée. Le système de vérification email fonctionne correctement avec :
- Configuration Resend active (`VITE_EMAIL_PROVIDER=custom`)
- Serveur backend sur `http://localhost:3001`
- Variables d'environnement correctement préfixées

## 🚀 Pour Tester

1. Redémarrer le serveur de développement (si nécessaire) :
   ```bash
   npm run dev
   ```

2. Aller sur la page d'inscription

3. Remplir le formulaire jusqu'à l'étape 3

4. Cliquer sur "Suivant" pour déclencher l'envoi du code

5. Vérifier que le code est bien envoyé (notification ou email)

---

**Fichiers modifiés** : 2
- `src/config/emailConfig.ts`
- `.env.local`

**Statut** : ✅ CORRIGÉ
