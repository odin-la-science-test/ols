# 🚀 Démarrage Rapide - Système Email Gmail

## ⚡ Installation en 3 Commandes

```powershell
# 1. Installer et configurer
.\setup-email-server.ps1

# 2. Démarrer les serveurs
.\start-with-email.ps1

# 3. Ouvrir l'application
# http://localhost:5173
```

C'est tout ! 🎉

## 📋 Prérequis

Avant de commencer, vous devez avoir :

1. ✅ **Node.js installé** (version 14+)
   - Télécharger : https://nodejs.org/

2. ✅ **Un compte Gmail**
   - Avec validation en 2 étapes activée

3. ✅ **Un mot de passe d'application Gmail**
   - Créer ici : https://myaccount.google.com/apppasswords

## 🎯 Étapes Détaillées

### Étape 1 : Créer un Mot de Passe d'Application

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Entrez "Odin La Science"
4. Cliquez sur "Générer"
5. **Copiez le mot de passe** (16 caractères)

### Étape 2 : Installer

```powershell
.\setup-email-server.ps1
```

Le script va vous demander :
- Votre adresse Gmail
- Le mot de passe d'application (sans espaces)

### Étape 3 : Démarrer

```powershell
.\start-with-email.ps1
```

Deux fenêtres vont s'ouvrir :
- 📧 Serveur Email (port 3001)
- 🌐 Application (port 5173)

### Étape 4 : Tester

```powershell
cd server
npm test votre.email@gmail.com
```

Vous devriez recevoir un email avec un code !

## 🧪 Test Complet

1. Ouvrir http://localhost:5173
2. Aller sur la page de connexion
3. Entrer vos identifiants
4. **Vérifier votre boîte Gmail** 📧
5. Entrer le code reçu
6. Connexion réussie ! ✅

## 🔧 Commandes Utiles

```powershell
# Installer les dépendances
cd server
npm install

# Démarrer seulement le serveur email
cd server
npm start

# Démarrer seulement l'application
npm run dev

# Tester l'envoi d'email
cd server
npm test votre.email@gmail.com

# Vérifier que le serveur fonctionne
curl http://localhost:3001/api/health
```

## 🚨 Problèmes Courants

### "Invalid login"

**Solution** : Vérifiez votre mot de passe d'application
```powershell
# Éditez server/.env
notepad server\.env

# Vérifiez que le mot de passe n'a pas d'espaces
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

### "Port already in use"

**Solution** : Un autre processus utilise le port
```powershell
# Trouver le processus
netstat -ano | findstr :3001

# Tuer le processus (remplacez PID)
taskkill /PID <PID> /F
```

### "Module not found"

**Solution** : Réinstaller les dépendances
```powershell
cd server
rm -rf node_modules
npm install
```

## 📊 Vérifications

### ✅ Serveur Email OK

```powershell
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{"status":"ok","service":"Email Server"}
```

### ✅ Application OK

Ouvrir http://localhost:5173 dans votre navigateur

### ✅ Envoi Email OK

```powershell
cd server
npm test votre.email@gmail.com
```

Vous devriez voir :
```
✅ Email envoyé avec succès !
📬 Message ID: <...>
🎉 Test réussi ! Vérifiez votre boîte email.
```

## 📁 Fichiers Importants

```
server/.env          # Configuration Gmail (NE PAS COMMIT)
.env.local          # Configuration frontend
server/emailServer.js    # Code du serveur
```

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne commitez JAMAIS vos fichiers `.env` !

Les fichiers suivants sont dans `.gitignore` :
- `server/.env`
- `.env.local`

## 📚 Documentation Complète

- `README_EMAIL_GMAIL.md` - Guide complet
- `GUIDE_GMAIL_SMTP.md` - Configuration détaillée
- `SYSTEME_VERIFICATION_EMAIL_COMPLET.md` - Architecture

## 🎓 Ressources

- [Nodemailer](https://nodemailer.com/)
- [Gmail SMTP](https://support.google.com/mail/answer/7126229)
- [App Passwords](https://support.google.com/accounts/answer/185833)

## 💡 Conseils

1. **Développement** : Utilisez Gmail SMTP
2. **Production** : Passez à SendGrid ou AWS SES
3. **Monitoring** : Surveillez les logs
4. **Sécurité** : Utilisez HTTPS en production

## 🎉 C'est Parti !

Vous êtes prêt à envoyer des emails vers Gmail !

```powershell
# Démarrer tout
.\start-with-email.ps1
```

Puis ouvrez http://localhost:5173 🚀

---

**Temps d'installation** : ~3 minutes  
**Difficulté** : ⭐ Facile  
**Support** : Consultez les logs et la documentation
