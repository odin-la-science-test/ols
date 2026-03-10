/**
 * Configuration pour l'envoi d'emails de vérification
 * Configurez votre service d'email préféré ici
 */

export interface EmailConfig {
    provider: 'sendgrid' | 'aws-ses' | 'mailgun' | 'smtp' | 'custom' | 'mock';
    apiKey?: string;
    domain?: string;
    fromEmail: string;
    fromName: string;
    region?: string; // Pour AWS SES
    smtpHost?: string; // Pour SMTP
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
}

// Configuration par défaut (mode développement)
export const defaultEmailConfig: EmailConfig = {
    provider: 'mock', // Utilise des notifications visuelles au lieu d'emails réels
    fromEmail: 'noreply@odinlascience.com',
    fromName: 'Odin La Science'
};

// Configuration pour SendGrid
export const sendgridConfig: EmailConfig = {
    provider: 'sendgrid',
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
    fromEmail: 'noreply@odinlascience.com',
    fromName: 'Odin La Science'
};

// Configuration pour AWS SES
export const awsSesConfig: EmailConfig = {
    provider: 'aws-ses',
    region: import.meta.env.VITE_AWS_REGION || 'eu-west-1',
    fromEmail: 'noreply@odinlascience.com',
    fromName: 'Odin La Science'
};

// Configuration pour Mailgun
export const mailgunConfig: EmailConfig = {
    provider: 'mailgun',
    apiKey: import.meta.env.VITE_MAILGUN_API_KEY || '',
    domain: import.meta.env.VITE_MAILGUN_DOMAIN || '',
    fromEmail: 'noreply@odinlascience.com',
    fromName: 'Odin La Science'
};

// Configuration pour SMTP personnalisé
export const smtpConfig: EmailConfig = {
    provider: 'smtp',
    smtpHost: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
    smtpUser: import.meta.env.VITE_SMTP_USER || '',
    smtpPassword: import.meta.env.VITE_SMTP_PASSWORD || '',
    fromEmail: 'noreply@odinlascience.com',
    fromName: 'Odin La Science'
};

// Configuration pour API personnalisée (Resend via backend)
export const customApiConfig: EmailConfig = {
    provider: 'custom',
    fromEmail: 'onboarding@resend.dev',
    fromName: 'Odin La Science'
};

// Sélectionner la configuration active
const emailProvider = import.meta.env.VITE_EMAIL_PROVIDER || 'custom';
export const activeEmailConfig: EmailConfig = 
    emailProvider === 'sendgrid' ? sendgridConfig :
    emailProvider === 'aws-ses' ? awsSesConfig :
    emailProvider === 'mailgun' ? mailgunConfig :
    emailProvider === 'smtp' ? smtpConfig :
    emailProvider === 'custom' ? customApiConfig :
    defaultEmailConfig;

/**
 * Template HTML pour l'email de vérification
 */
export const getVerificationEmailTemplate = (code: string, expiryMinutes: number = 5): string => {
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
                                        <div style="background: linear-gradient(135deg, #667eea15, #764ba215); border: 2px solid #667eea; border-radius: 12px; padding: 30px; display: inline-block;">
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
                                    ⏱️ <strong>Important :</strong> Ce code expire dans ${expiryMinutes} minutes.
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
                            <div style="margin-top: 20px;">
                                <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Aide</a>
                                <span style="color: #cccccc;">|</span>
                                <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Confidentialité</a>
                                <span style="color: #cccccc;">|</span>
                                <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Conditions</a>
                            </div>
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
 * Template texte brut pour l'email de vérification
 */
export const getVerificationEmailTextTemplate = (code: string, expiryMinutes: number = 5): string => {
    return `
Odin La Science - Code de vérification

Vous avez demandé à vous connecter à votre compte Odin La Science.

Votre code de vérification : ${code}

Ce code expire dans ${expiryMinutes} minutes.

Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.

---
© 2026 Odin La Science. Tous droits réservés.
    `.trim();
};

export default {
    activeEmailConfig,
    getVerificationEmailTemplate,
    getVerificationEmailTextTemplate
};
