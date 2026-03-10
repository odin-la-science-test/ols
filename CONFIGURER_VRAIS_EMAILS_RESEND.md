# 📧 Configurer de Vrais Emails avec Resend

## 🔴 Problème Actuel

L'email `onboarding@resend.dev` est un email de **sandbox** (test) qui ne permet PAS d'envoyer de vrais emails à des adresses externes.

## ✅ Solutions pour Recevoir de Vrais Emails

### Option 1 : Utiliser votre propre domaine (Production)

#### Étapes :

1. **Créer un compte Resend**
   - Allez sur https://resend.com/
   - Créez un compte gratuit (100 emails/jour)

2. **Vérifier votre domaine**
   - Dans le dashboard Resend, allez dans "Domains"
   - Ajoutez votre domaine (ex: votresite.com)
   - Configurez les enregistrements DNS (SPF, DKIM, DMARC)
   - Attendez la vérification (quelques minutes à quelques heures)

3. **Obtenir une clé API**
   - Allez dans "API Keys"
   - Créez une nouvelle clé
   - Copiez-la (elle ne sera affichée qu'une fois)

4. **Configurer le serveur**
   
   Modifiez `server/.env` :
   ```env
   RESEND_API_KEY=re_votre_vraie_cle_ici
   FROM_EMAIL=noreply@votredomaine.com
   PORT=3001
   ```

5. **Redémarrer le serveur**
   ```bash
   # Arrêter le serveur actuel
   # Puis redémarrer
   node server/emailServerResend.js
   ```

---

### Option 2 : Utiliser Gmail SMTP (Plus Simple)

Si vous n'avez pas de domaine, utilisez Gmail :

#### Étapes :

1. **Activer la validation en 2 étapes sur Gmail**
   - Allez sur https://myaccount.google.com/security
   - Activez la validation en 2 étapes

2. **Créer un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Créez un mot de passe pour "Mail"
   - Copiez le mot de passe (16 caractères)

3. **Configurer le serveur**
   
   Créez `server/emailServerGmail.js` :
   ```javascript
   const express = require('express');
   const nodemailer = require('nodemailer');
   const cors = require('cors');
   require('dotenv').config({ path: require('path').join(__dirname, '.env') });

   const app = express();
   app.use(cors());
   app.use(express.json());

   const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
           user: process.env.GMAIL_USER,
           pass: process.env.GMAIL_APP_PASSWORD
       }
   });

   app.post('/api/send-verification-code', async (req, res) => {
       try {
           const { email, code } = req.body;
           
           await transporter.sendMail({
               from: process.env.GMAIL_USER,
               to: email,
               subject: '🔐 Code de vérification Odin La Science',
               html: `
                   <h1>Code de vérification</h1>
                   <p>Votre code : <strong>${code}</strong></p>
                   <p>Ce code expire dans 5 minutes.</p>
               `
           });

           res.json({ success: true });
       } catch (error) {
           res.status(500).json({ success: false, error: error.message });
       }
   });

   app.listen(3001, () => console.log('Serveur Gmail démarré sur port 3001'));
   ```

4. **Configurer `.env`**
   ```env
   GMAIL_USER=votre.email@gmail.com
   GMAIL_APP_PASSWORD=votre_mot_de_passe_app_16_caracteres
   PORT=3001
   ```

5. **Installer nodemailer**
   ```bash
   cd server
   npm install nodemailer
   ```

6. **Démarrer le serveur Gmail**
   ```bash
   node server/emailServerGmail.js
   ```

---

### Option 3 : Utiliser Mailtrap (Test uniquement)

Pour tester sans envoyer de vrais emails :

1. Créez un compte sur https://mailtrap.io/
2. Obtenez les credentials SMTP
3. Configurez comme Gmail mais avec les credentials Mailtrap
4. Les emails seront capturés dans Mailtrap (pas envoyés réellement)

---

## 🚀 Recommandation

**Pour tester rapidement** : Utilisez Gmail (Option 2)
- Plus simple à configurer
- Fonctionne immédiatement
- Pas besoin de domaine

**Pour la production** : Utilisez Resend avec votre domaine (Option 1)
- Plus professionnel
- Meilleure délivrabilité
- Statistiques d'envoi

---

## ⚠️ Limitations

### Resend (gratuit)
- 100 emails/jour
- 1 domaine vérifié
- Support par email

### Gmail
- 500 emails/jour
- Peut être marqué comme spam
- Nécessite mot de passe d'application

---

## 📝 Prochaines Étapes

1. Choisissez une option (Gmail recommandé pour commencer)
2. Suivez les étapes de configuration
3. Testez l'envoi d'email
4. Si ça fonctionne, passez à Resend plus tard

---

**Besoin d'aide ?** Dites-moi quelle option vous voulez utiliser et je vous aide à la configurer !
