/**
 * Serveur Email avec Resend
 * Alternative moderne et simple à SendGrid
 */

const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting : 5 emails par 15 minutes par IP
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Trop de demandes d\'envoi d\'email. Réessayez dans 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Template HTML pour l'email de vérification
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
    `.trim();
};

/**
 * Route : Envoyer un code de vérification
 */
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

        console.log(`📧 Envoi du code de vérification à: ${email}`);

        // Envoyer l'email via Resend
        const data = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: '🔐 Code de vérification Odin La Science',
            html: getEmailTemplate(code),
            text: `Votre code de vérification : ${code}\n\nCe code expire dans 5 minutes.\n\nSi vous n'avez pas demandé ce code, vous pouvez ignorer cet email.`
        });

        console.log('✅ Email envoyé avec succès:', data.id);

        res.json({ 
            success: true, 
            message: 'Email envoyé avec succès',
            emailId: data.id
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        
        // Gestion des erreurs spécifiques à Resend
        if (error.message.includes('API key')) {
            return res.status(500).json({ 
                success: false, 
                error: 'Clé API Resend non configurée ou invalide',
                details: 'Vérifiez RESEND_API_KEY dans le fichier .env'
            });
        }

        if (error.message.includes('from')) {
            return res.status(500).json({ 
                success: false, 
                error: 'Email expéditeur non vérifié',
                details: 'Utilisez onboarding@resend.dev ou vérifiez votre domaine'
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
    const isConfigured = !!process.env.RESEND_API_KEY;
    
    res.json({ 
        status: 'ok',
        service: 'Resend Email Server',
        configured: isConfigured,
        port: PORT,
        fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev'
    });
});

/**
 * Route : Test (pour vérifier la configuration)
 */
app.get('/api/test', async (req, res) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'RESEND_API_KEY non configurée'
            });
        }

        res.json({
            success: true,
            message: 'Configuration OK',
            fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📧 Serveur Email Resend démarré !                       ║
║                                                            ║
║   🌐 Port: ${PORT}                                           ║
║   📮 Service: Resend                                      ║
║   📧 From: ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}                    ║
║                                                            ║
║   ✅ Prêt à envoyer des emails !                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Vérifier la configuration
    if (!process.env.RESEND_API_KEY) {
        console.log('');
        console.log('⚠️  ATTENTION : RESEND_API_KEY non configurée !');
        console.log('');
        console.log('Pour configurer :');
        console.log('1. Créez un compte sur https://resend.com/');
        console.log('2. Obtenez une clé API');
        console.log('3. Ajoutez-la dans server/.env :');
        console.log('   RESEND_API_KEY=re_votre_clé_ici');
        console.log('');
    } else {
        console.log('');
        console.log('✅ Configuration OK !');
        console.log('');
        console.log('Test de connexion :');
        console.log(`   curl http://localhost:${PORT}/api/health`);
        console.log('');
        console.log('Test d\'envoi :');
        console.log(`   npm test votre.email@gmail.com`);
        console.log('');
    }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('❌ Erreur non gérée:', error);
});

process.on('SIGTERM', () => {
    console.log('👋 Arrêt du serveur...');
    process.exit(0);
});

module.exports = app;
