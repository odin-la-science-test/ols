# 📧 Guide d'Installation - Envoi d'Emails Gmail

Ce guide vous explique comment configurer l'envoi de vrais emails vers des boîtes Gmail.

## 🎯 Vue d'ensemble

Le système utilise :
- **Backend Node.js** avec Express
- **Nodemailer** pour l'envoi d'emails
- **Gmail SMTP** comme service d'envoi
- **Rate limiting** pour éviter les abus

## 📋 Prérequis

1. Un compte Gmail
2. Node.js installé (version 14 ou supérieure)
3. npm ou yarn

## 🚀 Installation Rapide

### Étape 1 : Créer un Mot de Passe d'Application Gmail

⚠️ **IMPORTANT** : N'utilisez JAMAIS votre mot de passe Gmail normal !

1. **Activer la validation en 2 étapes** (si ce n'est pas déjà fait)
   - Allez sur https://myaccount.google.com/security
   - Cliquez sur "Validation en 2 étapes"
   - Suivez les instructions pour l'activer

2. **Créer un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)"
   - Entrez "Odin La Science Email Server"
   - Cliquez sur "Générer"
   - **Copiez le mot de passe de 16 caractères** (format: xxxx xxxx xxxx xxxx)

### Étape 2 : Installer les Dépendances

```bash
# Aller dans le dossier server
cd server

# Installer les dépendances
npm install
```

### Étape 3 : Configurer les Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
notepad .env  # ou votre éditeur préféré
```

Remplissez avec vos informations :

```env
EMAIL_SERVER_PORT=3001
GMAIL_USER=votre.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NODE_ENV=development
```

⚠️ **Retirez les espaces** du mot de passe d'application : `xxxxxxxxxxxxxxxx`

### Étape 4 : Démarrer le Serveur

```bash
# Démarrage normal
npm start

# Ou en mode développement (avec auto-reload)
npm run dev
```

Vous devriez voir :

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📧 Serveur Email démarré avec succès !                  ║
║                                                            ║
║   🌐 Port: 3001                                            ║
║   📮 Service: Gmail SMTP                                   ║
║   ✉️  Email: votre.email@gmail.com                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Étape 5 : Tester l'Envoi

```bash
# Test avec votre email
npm test votre.email@gmail.com
```

Vous devriez recevoir un email avec un code de vérification !

### Étape 6 : Configurer le Frontend

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
```

### Étape 7 : Démarrer l'Application

```bash
# Dans le dossier racine du projet
npm run dev
```

## 🧪 Test Complet

1. **Ouvrir l'application** : http://localhost:5173
2. **Aller sur la page de connexion avec vérification**
3. **Entrer vos identifiants**
4. **Vérifier votre boîte Gmail** - vous devriez recevoir un email avec le code
5. **Entrer le code** dans l'interface
6. **Connexion réussie !** 🎉

## 📁 Structure des Fichiers

```
server/
├── emailServer.js          # Serveur Express principal
├── package.json            # Dépendances Node.js
├── .env.example           # Exemple de configuration
├── .env                   # Configuration (à créer)
└── test-email.js          # Script de test
```

## 🔧 Configuration Avancée

### Changer le Port du Serveur

Dans `server/.env` :
```env
EMAIL_SERVER_PORT=3002
```

Dans `.env.local` (racine) :
```env
VITE_EMAIL_SERVER_URL=http://localhost:3002
```

### Utiliser un Autre Service SMTP

Modifiez `server/emailServer.js` :

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});
```

### Personnaliser le Template d'Email

Éditez la fonction `getEmailTemplate()` dans `server/emailServer.js`.

## 🔒 Sécurité

### Mesures Implémentées

✅ **Rate Limiting** : 5 emails max par IP toutes les 15 minutes  
✅ **Validation des entrées** : Email et code validés  
✅ **CORS** : Configuré pour accepter les requêtes du frontend  
✅ **Mot de passe d'application** : Pas de mot de passe Gmail stocké  
✅ **Variables d'environnement** : Credentials sécurisés  

### Recommandations Supplémentaires

1. **En production** :
   - Utilisez HTTPS
   - Configurez CORS pour votre domaine uniquement
   - Utilisez un service d'email professionnel (SendGrid, AWS SES)
   - Ajoutez une authentification API

2. **Monitoring** :
   - Surveillez les logs d'envoi
   - Configurez des alertes pour les échecs
   - Limitez le nombre d'emails par utilisateur

## 🚨 Dépannage

### Erreur : "Invalid login"

**Cause** : Mot de passe d'application incorrect ou validation en 2 étapes non activée

**Solution** :
1. Vérifiez que la validation en 2 étapes est activée
2. Générez un nouveau mot de passe d'application
3. Retirez les espaces du mot de passe dans `.env`

### Erreur : "Connection timeout"

**Cause** : Pare-feu ou antivirus bloque la connexion SMTP

**Solution** :
1. Vérifiez votre pare-feu
2. Autorisez Node.js dans votre antivirus
3. Essayez avec un autre réseau

### Erreur : "Daily sending quota exceeded"

**Cause** : Gmail limite à 500 emails/jour pour les comptes gratuits

**Solution** :
1. Attendez 24h
2. Utilisez un compte Google Workspace (2000 emails/jour)
3. Passez à un service professionnel (SendGrid, AWS SES)

### Le serveur ne démarre pas

**Vérifications** :
```bash
# Vérifier que Node.js est installé
node --version

# Vérifier que les dépendances sont installées
cd server
npm install

# Vérifier que le port 3001 est libre
netstat -ano | findstr :3001
```

### L'email n'arrive pas

**Vérifications** :
1. Vérifiez le dossier Spam/Courrier indésirable
2. Vérifiez les logs du serveur
3. Testez avec `npm test votre.email@gmail.com`
4. Vérifiez que l'email expéditeur est correct

## 📊 Limites Gmail

| Type de compte | Limite quotidienne |
|----------------|-------------------|
| Gmail gratuit  | 500 emails/jour   |
| Google Workspace | 2000 emails/jour |

Pour plus d'emails, utilisez :
- **SendGrid** : 100 emails/jour gratuit, puis payant
- **AWS SES** : 62,000 emails/mois gratuit (si hébergé sur AWS)
- **Mailgun** : 5,000 emails/mois gratuit

## 🔄 Migration vers un Service Professionnel

Quand votre application grandit, migrez vers un service professionnel :

### SendGrid (Recommandé)

```bash
# Installer le SDK
npm install @sendgrid/mail

# Dans emailServer.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
    to: email,
    from: 'noreply@votredomaine.com',
    subject: 'Code de vérification',
    html: getEmailTemplate(code)
});
```

### AWS SES

```bash
# Installer le SDK
npm install @aws-sdk/client-ses

# Configuration dans emailServer.js
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
```

## 📝 Scripts Utiles

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement
npm run dev

# Tester l'envoi d'email
npm test votre.email@gmail.com

# Vérifier les logs
# Les logs s'affichent dans la console
```

## 🎓 Ressources

- [Documentation Nodemailer](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Express.js Documentation](https://expressjs.com/)

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Mot de passe d'application Gmail créé
- [ ] Variables d'environnement configurées
- [ ] Serveur testé localement
- [ ] Rate limiting configuré
- [ ] CORS configuré pour votre domaine
- [ ] HTTPS activé
- [ ] Monitoring en place
- [ ] Logs configurés
- [ ] Backup des configurations

## 🎉 Félicitations !

Vous pouvez maintenant envoyer de vrais emails vers des boîtes Gmail !

Pour toute question, consultez les logs du serveur ou testez avec `npm test`.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mars 2026  
**Support** : Consultez les logs et la documentation Nodemailer
