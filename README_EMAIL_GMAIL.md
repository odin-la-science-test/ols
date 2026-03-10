# 📧 Système d'Envoi d'Emails Gmail - Guide Complet

## 🎯 Vue d'ensemble

Système complet de vérification par email avec envoi automatique de codes à 6 chiffres vers de vraies boîtes Gmail.

## ✨ Fonctionnalités

- ✅ Envoi de vrais emails vers Gmail
- ✅ Backend Node.js avec Express
- ✅ Templates HTML professionnels
- ✅ Rate limiting (5 emails/15min par IP)
- ✅ Validation des entrées
- ✅ Logs détaillés
- ✅ Interface utilisateur intuitive
- ✅ Support du copier-coller
- ✅ Timer d'expiration (5 minutes)

## 🚀 Installation Rapide (3 minutes)

### Option 1 : Script Automatique (Recommandé)

```powershell
# Exécuter le script d'installation
.\setup-email-server.ps1
```

Le script va :
1. Vérifier Node.js
2. Installer les dépendances
3. Créer les fichiers de configuration
4. Vous guider pour la configuration Gmail

### Option 2 : Installation Manuelle

#### Étape 1 : Créer un Mot de Passe d'Application Gmail

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Entrez "Odin La Science"
4. Cliquez sur "Générer"
5. Copiez le mot de passe (16 caractères)

#### Étape 2 : Installer les Dépendances

```bash
cd server
npm install
```

#### Étape 3 : Configuration

Créez `server/.env` :

```env
EMAIL_SERVER_PORT=3001
GMAIL_USER=votre.email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
NODE_ENV=development
```

Créez `.env.local` à la racine :

```env
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
```

## 🎮 Utilisation

### Démarrer le Serveur Email

```bash
cd server
npm start
```

Vous verrez :
```
╔════════════════════════════════════════════════════════════╗
║   📧 Serveur Email démarré avec succès !                  ║
║   🌐 Port: 3001                                            ║
║   📮 Service: Gmail SMTP                                   ║
╚════════════════════════════════════════════════════════════╝
```

### Démarrer l'Application

Dans un autre terminal :

```bash
npm run dev
```

### Tester l'Envoi

```bash
cd server
npm test votre.email@gmail.com
```

## 📁 Structure des Fichiers

```
.
├── server/
│   ├── emailServer.js          # Serveur Express
│   ├── package.json            # Dépendances
│   ├── test-email.js           # Script de test
│   ├── .env.example           # Exemple de config
│   └── .env                   # Configuration (à créer)
│
├── src/
│   ├── components/
│   │   └── EmailVerification.tsx    # Interface de vérification
│   ├── services/
│   │   └── emailService.ts          # Service d'envoi
│   ├── config/
│   │   └── emailConfig.ts           # Configuration
│   └── utils/
│       └── securityEnhancements.ts  # Système 2FA
│
├── setup-email-server.ps1      # Script d'installation
├── GUIDE_GMAIL_SMTP.md        # Documentation détaillée
└── README_EMAIL_GMAIL.md      # Ce fichier
```

## 🧪 Tests

### Test 1 : Vérifier le Serveur

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "service": "Email Server",
  "timestamp": "2026-03-06T..."
}
```

### Test 2 : Envoyer un Email de Test

```bash
cd server
npm test votre.email@gmail.com
```

### Test 3 : Test Complet dans l'Application

1. Ouvrir http://localhost:5173
2. Aller sur la page de connexion
3. Entrer vos identifiants
4. Vérifier votre boîte Gmail
5. Entrer le code reçu

## 🔧 Configuration Avancée

### Changer le Port

Dans `server/.env` :
```env
EMAIL_SERVER_PORT=3002
```

Dans `.env.local` :
```env
VITE_EMAIL_SERVER_URL=http://localhost:3002
```

### Personnaliser le Template

Éditez `server/emailServer.js`, fonction `getEmailTemplate()`.

### Ajuster le Rate Limiting

Dans `server/emailServer.js` :

```javascript
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Fenêtre de temps
    max: 10,                    // Nombre max d'emails
    message: 'Trop de demandes'
});
```

## 🔒 Sécurité

### Mesures Implémentées

✅ Rate limiting (5 emails/15min)  
✅ Validation des entrées (email + code)  
✅ CORS configuré  
✅ Mot de passe d'application Gmail  
✅ Variables d'environnement  
✅ Logs de sécurité  

### Recommandations Production

- [ ] Utiliser HTTPS
- [ ] Configurer CORS pour votre domaine uniquement
- [ ] Ajouter une authentification API
- [ ] Utiliser un service professionnel (SendGrid, AWS SES)
- [ ] Implémenter un monitoring
- [ ] Configurer des alertes

## 🚨 Dépannage

### Erreur : "Invalid login"

**Solution** :
1. Vérifiez que la validation en 2 étapes est activée
2. Générez un nouveau mot de passe d'application
3. Retirez les espaces du mot de passe dans `.env`

### Erreur : "Connection timeout"

**Solution** :
1. Vérifiez votre pare-feu
2. Autorisez Node.js dans votre antivirus
3. Essayez avec un autre réseau

### Le serveur ne démarre pas

**Vérifications** :
```bash
# Vérifier Node.js
node --version

# Réinstaller les dépendances
cd server
rm -rf node_modules
npm install

# Vérifier le port
netstat -ano | findstr :3001
```

### L'email n'arrive pas

**Vérifications** :
1. Vérifiez le dossier Spam
2. Vérifiez les logs du serveur
3. Testez avec `npm test`
4. Vérifiez la configuration Gmail

## 📊 Limites Gmail

| Type de compte | Limite quotidienne |
|----------------|-------------------|
| Gmail gratuit  | 500 emails/jour   |
| Google Workspace | 2000 emails/jour |

## 🔄 Alternatives Professionnelles

### SendGrid (Recommandé)

- 100 emails/jour gratuit
- Templates avancés
- Analytics détaillés
- Support professionnel

### AWS SES

- 62,000 emails/mois gratuit (si hébergé sur AWS)
- Très scalable
- Intégration AWS

### Mailgun

- 5,000 emails/mois gratuit
- API simple
- Logs détaillés

## 📝 Scripts Disponibles

```bash
# Démarrer le serveur
cd server
npm start

# Mode développement (auto-reload)
npm run dev

# Tester l'envoi
npm test votre.email@gmail.com

# Installer les dépendances
npm install
```

## 🎓 Ressources

- [Documentation Nodemailer](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Express.js](https://expressjs.com/)

## 📋 Checklist de Déploiement

Avant de déployer en production :

- [ ] Mot de passe d'application créé
- [ ] Variables d'environnement configurées
- [ ] Serveur testé localement
- [ ] Rate limiting configuré
- [ ] CORS configuré
- [ ] HTTPS activé
- [ ] Monitoring en place
- [ ] Logs configurés
- [ ] Backup des configurations
- [ ] Documentation à jour

## 🆘 Support

### Problème avec Gmail ?

1. Vérifiez https://myaccount.google.com/security
2. Assurez-vous que la validation en 2 étapes est activée
3. Générez un nouveau mot de passe d'application

### Problème avec le Serveur ?

1. Vérifiez les logs dans la console
2. Testez avec `npm test`
3. Vérifiez le fichier `.env`

### Problème avec l'Application ?

1. Vérifiez `.env.local`
2. Vérifiez que le serveur est démarré
3. Vérifiez la console du navigateur

## 🎉 Félicitations !

Vous pouvez maintenant envoyer de vrais emails vers Gmail !

## 📞 Contact

Pour toute question :
- Consultez `GUIDE_GMAIL_SMTP.md` pour plus de détails
- Vérifiez les logs du serveur
- Testez avec `npm test`

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mars 2026  
**Statut** : ✅ Production Ready
