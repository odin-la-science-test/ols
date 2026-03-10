# 🚀 Démarrer le Serveur Email

## ⚠️ IMPORTANT

Le serveur email **DOIT** être démarré pour que la vérification par email fonctionne !

## 🎯 Méthode Rapide

### Option 1 : Script PowerShell (Recommandé)

```powershell
.\demarrer-serveur-email.ps1
```

### Option 2 : Commande directe

```bash
node server/emailServerResend.js
```

## 📋 Étapes Détaillées

### 1. Vérifier la configuration

Le fichier `server/.env` doit contenir :

```env
RESEND_API_KEY=re_MrYFWRFj_6ADBL9pZn2Bh1Ti5NhQ46N5h
FROM_EMAIL=onboarding@resend.dev
PORT=3001
```

### 2. Démarrer le serveur

Ouvrez un **nouveau terminal** et exécutez :

```bash
node server/emailServerResend.js
```

Vous devriez voir :

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📧 Serveur Email Resend démarré !                       ║
║                                                            ║
║   🌐 Port: 3001                                           ║
║   📮 Service: Resend                                      ║
║   📧 From: onboarding@resend.dev                          ║
║                                                            ║
║   ✅ Prêt à envoyer des emails !                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### 3. Tester le serveur

Dans un autre terminal :

```bash
# Test de santé
curl http://localhost:3001/api/health

# Devrait retourner :
# {"status":"ok","service":"Resend Email Server","configured":true,"port":3001}
```

### 4. Démarrer l'application

Dans un autre terminal :

```bash
npm run dev
```

## 🔧 Dépannage

### Erreur : Port 3001 déjà utilisé

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erreur : RESEND_API_KEY non configurée

Vérifiez que le fichier `server/.env` existe et contient la clé API.

### Erreur 404 lors de l'envoi

Le serveur n'est pas démarré. Suivez les étapes ci-dessus.

## 📝 Workflow Complet

1. **Terminal 1** : Démarrer le serveur email
   ```bash
   node server/emailServerResend.js
   ```

2. **Terminal 2** : Démarrer l'application
   ```bash
   npm run dev
   ```

3. **Navigateur** : Aller sur http://localhost:5173

4. **Tester** : Créer un compte et vérifier l'email

## 🎯 Vérification Rapide

✅ Le serveur email est démarré si vous voyez le message de démarrage  
✅ L'application peut envoyer des emails si `http://localhost:3001/api/health` répond  
✅ Tout fonctionne si vous recevez le code par email lors de l'inscription

## 💡 Astuce

Pour éviter de démarrer manuellement le serveur à chaque fois, vous pouvez :

1. Utiliser `concurrently` pour démarrer les deux en même temps
2. Créer un script npm dans `package.json`
3. Utiliser un gestionnaire de processus comme PM2

---

**Note** : Le serveur doit rester actif pendant toute la durée d'utilisation de l'application.
