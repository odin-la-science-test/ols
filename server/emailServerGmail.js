/**
 * Serveur Email avec Gmail SMTP
 * Solution simple pour envoyer de vrais emails
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de demandes d\'envoi d\'email. Réessayez dans 15 minutes.'
});

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

/**
 * Template HTML pour l'email
 */
const getEmailTemplate = (code) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🔐 Odin La Science</h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9);">Vérification de sécurité</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a;">Code de vérification</h2>
                            <p style="margin: 0 0 30px; color: #666666; line-height: 1.6;">
                                Vous avez demandé à vous connecter à votre compte Odin La Science. 
                                Utilisez le code ci-dessous pour finaliser votre connexion :
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 2px solid #667eea; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">Votre code de vérification</p>
                                            <p style="margin: 0; color: #667eea; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: monospace;">
                                                ${code}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    ⏱️ <strong>Important :</strong> Ce code expire dans 5 minutes.
                                </p>
                            </div>
                            <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                                Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2026 Odin La Science. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};

/**
 * Route : Envoyer un code de vérification
 */
app.post('/api/send-verification-code', emailLimiter, async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email et code requis' 
            });
        }

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le code doit contenir 6 chiffres' 
            });
        }

        console.log(`📧 Envoi du code de vérification à: ${email}`);

        const info = await transporter.sendMail({
            from: `"Odin La Science" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '🔐 Code de vérification Odin La Science',
            html: getEmailTemplate(code),
            text: `Votre code de vérification : ${code}\n\nCe code expire dans 5 minutes.`
        });

        console.log('✅ Email envoyé avec succès:', info.messageId);

        res.json({ 
            success: true, 
            message: 'Email envoyé avec succès',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        
        if (error.message.includes('Invalid login')) {
            return res.status(500).json({ 
                success: false, 
                error: 'Identifiants Gmail invalides',
                details: 'Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans .env'
            });
        }

        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de l\'envoi de l\'email',
            details: error.message 
        });
    }
});

/**
 * Route : Health check
 */
app.get('/api/health', (req, res) => {
    const isConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    
    res.json({ 
        status: 'ok',
        service: 'Gmail SMTP Server',
        configured: isConfigured,
        port: PORT,
        fromEmail: process.env.GMAIL_USER || 'non configuré'
    });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📧 Serveur Email Gmail démarré !                        ║
║                                                            ║
║   🌐 Port: ${PORT}                                           ║
║   📮 Service: Gmail SMTP                                  ║
║   📧 From: ${process.env.GMAIL_USER || 'NON CONFIGURÉ'}                           ║
║                                                            ║
║   ${process.env.GMAIL_USER ? '✅ Prêt à envoyer des emails !' : '⚠️  Configuration requise'}                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('');
        console.log('⚠️  ATTENTION : Gmail non configuré !');
        console.log('');
        console.log('Pour configurer :');
        console.log('1. Activez la validation en 2 étapes sur Gmail');
        console.log('2. Créez un mot de passe d\'application :');
        console.log('   https://myaccount.google.com/apppasswords');
        console.log('3. Ajoutez dans server/.env :');
        console.log('   GMAIL_USER=votre.email@gmail.com');
        console.log('   GMAIL_APP_PASSWORD=votre_mot_de_passe_app');
        console.log('');
    } else {
        console.log('');
        console.log('✅ Configuration OK !');
        console.log('');
    }
});

module.exports = app;
