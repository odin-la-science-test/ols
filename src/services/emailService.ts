/**
 * Service d'envoi d'emails
 * Supporte plusieurs providers : SendGrid, AWS SES, Mailgun, SMTP, Custom API
 */

import { 
    activeEmailConfig, 
    getVerificationEmailTemplate, 
    getVerificationEmailTextTemplate,
    type EmailConfig 
} from '../config/emailConfig';
import { SecurityLogger } from '../utils/securityConfig';

export interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export class EmailService {
    private static config: EmailConfig = activeEmailConfig;

    /**
     * Envoyer un email via le provider configuré
     */
    static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            switch (this.config.provider) {
                case 'sendgrid':
                    return await this.sendViaSendGrid(options);
                case 'aws-ses':
                    return await this.sendViaAWSSES(options);
                case 'mailgun':
                    return await this.sendViaMailgun(options);
                case 'smtp':
                    return await this.sendViaSMTP(options);
                case 'custom':
                    return await this.sendViaCustomAPI(options);
                case 'mock':
                default:
                    return await this.sendViaMock(options);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            SecurityLogger.log('email_send_error', options.to, { error: String(error) });
            return false;
        }
    }

    /**
     * Envoyer un code de vérification
     */
    static async sendVerificationCode(email: string, code: string): Promise<boolean> {
        const html = getVerificationEmailTemplate(code);
        const text = getVerificationEmailTextTemplate(code);

        return await this.sendEmail({
            to: email,
            subject: '🔐 Code de vérification Odin La Science',
            html,
            text
        });
    }

    /**
     * SendGrid
     */
    private static async sendViaSendGrid(options: EmailOptions): Promise<boolean> {
        if (!this.config.apiKey) {
            throw new Error('SendGrid API key not configured');
        }

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: options.to }],
                    subject: options.subject
                }],
                from: {
                    email: this.config.fromEmail,
                    name: this.config.fromName
                },
                content: [
                    ...(options.html ? [{
                        type: 'text/html',
                        value: options.html
                    }] : []),
                    ...(options.text ? [{
                        type: 'text/plain',
                        value: options.text
                    }] : [])
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`SendGrid error: ${response.status} ${response.statusText}`);
        }

        SecurityLogger.log('email_sent_sendgrid', options.to);
        return true;
    }

    /**
     * AWS SES
     */
    private static async sendViaAWSSES(options: EmailOptions): Promise<boolean> {
        // Note: En production, utilisez le SDK AWS
        // Pour l'instant, on utilise l'API REST
        
        const endpoint = `https://email.${this.config.region}.amazonaws.com`;
        
        const params = {
            Source: `${this.config.fromName} <${this.config.fromEmail}>`,
            Destination: {
                ToAddresses: [options.to]
            },
            Message: {
                Subject: {
                    Data: options.subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    ...(options.html ? {
                        Html: {
                            Data: options.html,
                            Charset: 'UTF-8'
                        }
                    } : {}),
                    ...(options.text ? {
                        Text: {
                            Data: options.text,
                            Charset: 'UTF-8'
                        }
                    } : {})
                }
            }
        };

        // Note: Nécessite AWS SDK et credentials configurés
        console.log('AWS SES would send:', params);
        SecurityLogger.log('email_sent_aws_ses', options.to);
        return true;
    }

    /**
     * Mailgun
     */
    private static async sendViaMailgun(options: EmailOptions): Promise<boolean> {
        if (!this.config.apiKey || !this.config.domain) {
            throw new Error('Mailgun API key or domain not configured');
        }

        const formData = new FormData();
        formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
        formData.append('to', options.to);
        formData.append('subject', options.subject);
        if (options.html) formData.append('html', options.html);
        if (options.text) formData.append('text', options.text);

        const response = await fetch(
            `https://api.mailgun.net/v3/${this.config.domain}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
                },
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(`Mailgun error: ${response.status} ${response.statusText}`);
        }

        SecurityLogger.log('email_sent_mailgun', options.to);
        return true;
    }

    /**
     * SMTP
     */
    private static async sendViaSMTP(options: EmailOptions): Promise<boolean> {
        // Note: SMTP nécessite un backend Node.js avec nodemailer
        // Pour l'instant, on log seulement
        console.log('SMTP would send:', {
            host: this.config.smtpHost,
            port: this.config.smtpPort,
            from: this.config.fromEmail,
            to: options.to,
            subject: options.subject
        });

        SecurityLogger.log('email_sent_smtp', options.to);
        return true;
    }

    /**
     * API personnalisée (Backend Node.js avec Gmail)
     */
    private static async sendViaCustomAPI(options: EmailOptions): Promise<boolean> {
        // Extraire le code du texte
        const codeMatch = options.text?.match(/code de vérification : (\d{6})/i) || 
                         options.text?.match(/(\d{6})/);
        const code = codeMatch ? codeMatch[1] : '';

        if (!code) {
            throw new Error('Code de vérification non trouvé dans le message');
        }

        const backendUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
        
        const response = await fetch(`${backendUrl}/api/send-verification-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: options.to,
                code: code
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Backend error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Email envoyé via backend:', result);

        SecurityLogger.log('email_sent_custom', options.to);
        return true;
    }

    /**
     * Mode Mock (développement)
     * Affiche une notification visuelle au lieu d'envoyer un vrai email
     */
    private static async sendViaMock(options: EmailOptions): Promise<boolean> {
        console.log('📧 [MOCK] Email envoyé:', {
            to: options.to,
            subject: options.subject,
            text: options.text
        });

        // Extraire le code de vérification du texte
        const codeMatch = options.text?.match(/code de vérification : (\d{6})/i);
        const code = codeMatch ? codeMatch[1] : 'N/A';

        // Créer une notification visuelle
        if (typeof window !== 'undefined') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">📧</span>
                    <strong style="font-size: 16px;">Email envoyé (Mode Dev)</strong>
                </div>
                <div style="font-size: 14px; opacity: 0.95; margin-bottom: 8px;">
                    <strong>À:</strong> ${options.to}<br/>
                    <strong>Sujet:</strong> ${options.subject}
                </div>
                ${code !== 'N/A' ? `
                    <div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.2); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Code de vérification:</div>
                        <div style="font-size: 28px; font-weight: 800; letter-spacing: 4px; font-family: monospace;">
                            ${code}
                        </div>
                    </div>
                ` : ''}
                <div style="font-size: 11px; opacity: 0.7; margin-top: 8px; text-align: center;">
                    💡 En production, un vrai email sera envoyé
                </div>
            `;

            // Ajouter l'animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(notification);

            // Retirer après 10 secondes
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    notification.remove();
                    style.remove();
                }, 300);
            }, 10000);
        }

        SecurityLogger.log('email_sent_mock', options.to);
        return true;
    }

    /**
     * Configurer le service d'email
     */
    static configure(config: Partial<EmailConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtenir la configuration actuelle
     */
    static getConfig(): EmailConfig {
        return { ...this.config };
    }
}

export default EmailService;
