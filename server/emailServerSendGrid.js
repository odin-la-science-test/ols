/**
 * Serveur Backend pour l'envoi d'emails avec SendGrid
 * Alternative à Gmail SMTP - Pas besoin de validation en 2 étapes
 */

const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration SendGrid
if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY non configurée dans .env');
    console.log('📝 Créez une clé API sur https://app.sendgrid.com/settings/api_keys');
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rate limiting
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 emails max par IP
    message: 'Trop de demandes d\'envoi d\'email. Réessayez plus tard.'
});

// Template HTML pour l'email
const getEmailTemplate = (code) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                                🔐 Odin La Science
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Vérification de sécurité
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 700;">
                                Code de vérification
                            </h2>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Vous avez demandé à vous connecter à votre compte Odin La Science. 
                                Utilisez le code ci-dessous pour finaliser votre connexion :
                            </p>
                            
                            <!-- Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 2px solid #667eea; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                                Votre code de vérification
                                            </p>
                                            <p style="margin: 0; color: #667eea; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                                ${code}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    ⏱️ <strong>Important :</strong> Ce code expire dans 5 minutes.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                Cet email a été envoyé par Odin La Science
                            </p>
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
    `;
};

// Route pour envoyer un code de vérification
app.post('/api/send-verification-code', emailLimiter, async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email et code requis'
            });
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'email invalide'
            });
        }

        // Validation du code (6 chiffres)
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                error: 'Le code doit contenir 6 chiffres'
            });
        }

        // Préparer le message
        const msg = {
            to: email,
            from: process.env.FROM_EMAIL || 'noreply@odinlascience.com',
            subject: '🔐 Code de vérification Odin La Science',
            html: getEmailTemplate(code),
            text: `
Odin La Science - Code de vérification

Vous avez demandé à vous connecter à votre compte Odin La Science.

Votre code de vérification : ${code}

Ce code expire dans 5 minutes.

Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.

---
© 2026 Odin La Science. Tous droits réservés.
            `.trim()
        };

        // Envoyer l'email via SendGrid
        await sgMail.send(msg);

        console.log('✅ Email envoyé via SendGrid:', {
            to: email,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Email envoyé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        
        // Erreurs spécifiques SendGrid
        if (error.response) {
            console.error('SendGrid Error:', error.response.body);
        }
        
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi de l\'email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SendGrid Email Server',
        timestamp: new Date().toISOString(),
        provider: 'SendGrid'
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📧 Serveur Email démarré avec succès !                  ║
║                                                            ║
║   🌐 Port: ${PORT}                                           ║
║   📮 Service: SendGrid                                     ║
║   ✉️  From: ${process.env.FROM_EMAIL || 'Non configuré'}                    ║
║                                                            ║
║   Endpoints disponibles:                                   ║
║   • POST /api/send-verification-code                       ║
║   • GET  /api/health                                       ║
║                                                            ║
║   💡 100 emails/jour gratuits avec SendGrid               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('❌ Erreur non gérée:', error);
});

module.exports = app;
