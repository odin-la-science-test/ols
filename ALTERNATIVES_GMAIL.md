# 📧 Alternatives pour l'Envoi d'Emails

## ⚠️ Problème : Pas d'accès aux Mots de Passe d'Application Gmail

Si vous n'avez pas accès à https://myaccount.google.com/apppasswords, voici plusieurs alternatives.

## 🎯 Solutions Disponibles

### Option 1 : Activer la Validation en 2 Étapes (Recommandé)

Les mots de passe d'application nécessitent la validation en 2 étapes.

**Étapes :**

1. Allez sur https://myaccount.google.com/security
2. Cliquez sur "Validation en 2 étapes"
3. Suivez les instructions pour l'activer
4. Une fois activée, retournez sur https://myaccount.google.com/apppasswords
5. Créez un mot de passe d'application

**Avantages :**
- ✅ Gratuit
- ✅ 500 emails/jour
- ✅ Fiable
- ✅ Facile à configurer

---

### Option 2 : SendGrid (Gratuit - Recommandé)

SendGrid offre 100 emails/jour gratuitement, sans besoin de validation en 2 étapes.

**Installation :**

```bash
cd server
npm install @sendgrid/mail
```

**Configuration :**

1. Créez un compte sur https://sendgrid.com/
2. Allez dans Settings > API Keys
3. Créez une nouvelle clé API
4. Copiez la clé

**Modifier `server/.env` :**

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=votre_clé_api_sendgrid
FROM_EMAIL=noreply@votredomaine.com
```

**Modifier `server/emailServer.js` :**

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-verification-code', async (req, res) => {
    const { email, code } = req.body;
    
    try {
        await sgMail.send({
            to: email,
            from: process.env.FROM_EMAIL,
            subject: '🔐 Code de vérification Odin La Science',
            html: getEmailTemplate(code),
            text: `Votre code : ${code}`
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

**Avantages :**
- ✅ 100 emails/jour gratuit
- ✅ Pas besoin de validation en 2 étapes
- ✅ API simple
- ✅ Analytics inclus

---

### Option 3 : Mailtrap (Développement uniquement)

Pour tester sans envoyer de vrais emails.

**Installation :**

```bash
cd server
npm install nodemailer
```

**Configuration :**

1. Créez un compte sur https://mailtrap.io/
2. Copiez les credentials SMTP

**Modifier `server/.env` :**

```env
EMAIL_PROVIDER=mailtrap
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=votre_user
MAILTRAP_PASSWORD=votre_password
```

**Modifier `server/emailServer.js` :**

```javascript
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
    }
});
```

**Avantages :**
- ✅ Gratuit
- ✅ Parfait pour le développement
- ✅ Pas de vrais emails envoyés
- ✅ Interface de test

**Inconvénients :**
- ❌ Pas de vrais emails (développement uniquement)

---

### Option 4 : Outlook/Hotmail SMTP

Si vous avez un compte Outlook/Hotmail.

**Configuration :**

**Modifier `server/.env` :**

```env
EMAIL_PROVIDER=outlook
OUTLOOK_USER=votre.email@outlook.com
OUTLOOK_PASSWORD=votre_mot_de_passe
```

**Modifier `server/emailServer.js` :**

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASSWORD
    }
});
```

**Avantages :**
- ✅ Gratuit
- ✅ Pas besoin de validation en 2 étapes
- ✅ Simple

**Inconvénients :**
- ⚠️ Limites d'envoi strictes
- ⚠️ Peut être bloqué pour spam

---

### Option 5 : Brevo (ex-Sendinblue) - Gratuit

300 emails/jour gratuitement.

**Installation :**

```bash
cd server
npm install sib-api-v3-sdk
```

**Configuration :**

1. Créez un compte sur https://www.brevo.com/
2. Allez dans Settings > SMTP & API
3. Créez une clé API

**Modifier `server/.env` :**

```env
EMAIL_PROVIDER=brevo
BREVO_API_KEY=votre_clé_api
FROM_EMAIL=votre.email@example.com
```

**Avantages :**
- ✅ 300 emails/jour gratuit
- ✅ Interface simple
- ✅ Support français

---

## 🚀 Solution Recommandée : SendGrid

Pour la plupart des cas, **SendGrid** est la meilleure option :

### Installation Complète SendGrid

**1. Créer un compte SendGrid**

```
https://signup.sendgrid.com/
```

**2. Vérifier votre email**

Vérifiez votre boîte email et cliquez sur le lien de confirmation.

**3. Créer une clé API**

- Allez dans Settings > API Keys
- Cliquez sur "Create API Key"
- Nom : "Odin La Science"
- Permissions : "Full Access"
- Cliquez sur "Create & View"
- **Copiez la clé** (vous ne pourrez plus la voir après)

**4. Installer les dépendances**

```bash
cd server
npm install @sendgrid/mail
```

**5. Créer `server/emailServerSendGrid.js`**

```javascript
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de demandes'
});

const getEmailTemplate = (code) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0;">🔐 Odin La Science</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Vérification de sécurité</p>
        </div>
        <h2 style="color: #1a1a1a;">Code de vérification</h2>
        <p style="color: #666; line-height: 1.6;">
            Vous avez demandé à vous connecter à votre compte Odin La Science.
            Utilisez le code ci-dessous pour finaliser votre connexion :
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 2px solid #667eea; border-radius: 12px; padding: 30px; display: inline-block;">
                <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase;">
                    Votre code de vérification
                </p>
                <p style="margin: 0; color: #667eea; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: monospace;">
                    ${code}
                </p>
            </div>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏱️ <strong>Important :</strong> Ce code expire dans 5 minutes.
            </p>
        </div>
        <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
        </p>
    </div>
</body>
</html>
    `;
};

app.post('/api/send-verification-code', emailLimiter, async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Email et code requis' });
        }

        const msg = {
            to: email,
            from: process.env.FROM_EMAIL,
            subject: '🔐 Code de vérification Odin La Science',
            html: getEmailTemplate(code),
            text: `Votre code de vérification : ${code}\n\nCe code expire dans 5 minutes.`
        };

        await sgMail.send(msg);

        console.log('✅ Email envoyé à:', email);
        res.json({ success: true, message: 'Email envoyé avec succès' });

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de l\'envoi',
            details: error.message 
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SendGrid Email Server' });
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   📧 Serveur Email SendGrid démarré !                     ║
║   🌐 Port: ${PORT}                                           ║
║   📮 Service: SendGrid                                     ║
╚════════════════════════════════════════════════════════════╝
    `);
});
```

**6. Configurer `server/.env`**

```env
EMAIL_SERVER_PORT=3001
SENDGRID_API_KEY=votre_clé_api_sendgrid
FROM_EMAIL=noreply@votredomaine.com
NODE_ENV=development
```

**7. Modifier `server/package.json`**

```json
{
  "scripts": {
    "start": "node emailServerSendGrid.js",
    "dev": "nodemon emailServerSendGrid.js",
    "test": "node test-email.js"
  }
}
```

**8. Tester**

```bash
cd server
npm start
```

Dans un autre terminal :

```bash
cd server
npm test votre.email@gmail.com
```

---

## 📊 Comparaison des Options

| Service | Gratuit | Emails/jour | Difficulté | Vrais emails |
|---------|---------|-------------|------------|--------------|
| Gmail (App Password) | ✅ | 500 | ⭐⭐ | ✅ |
| SendGrid | ✅ | 100 | ⭐ | ✅ |
| Mailtrap | ✅ | Illimité | ⭐ | ❌ (dev only) |
| Outlook | ✅ | ~100 | ⭐ | ✅ |
| Brevo | ✅ | 300 | ⭐ | ✅ |

## 🎯 Recommandation Finale

**Pour le développement :** Mailtrap  
**Pour la production :** SendGrid ou Brevo  
**Si vous activez la 2FA Gmail :** Gmail App Password  

## 🆘 Besoin d'Aide ?

Choisissez l'option qui vous convient et je vous aiderai à la configurer !

---

**Version** : 1.0.0  
**Date** : Mars 2026
