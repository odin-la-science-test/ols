/**
 * Advanced Security Features
 * Protection avancée contre les menaces modernes
 */

import { SecurityLogger } from './securityConfig';
import { generateSecureToken } from './encryption';

/**
 * Protection contre les attaques par timing
 */
export class TimingSafeComparison {
    static compare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            // Toujours comparer pour éviter les attaques par timing
            let dummy = 0;
            for (let i = 0; i < Math.max(a.length, b.length); i++) {
                dummy |= (a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length));
            }
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
}

/**
 * Protection contre le clickjacking
 */
export class ClickjackingProtection {
    static enable(): void {
        // Empêcher l'iframe
        if (window.self !== window.top) {
            SecurityLogger.log('clickjacking_attempt', undefined, { 
                referrer: document.referrer 
            });
            window.top!.location.href = window.self.location.href;
        }

        // Ajouter un style pour masquer le contenu si dans un iframe
        const style = document.createElement('style');
        style.innerHTML = `
            html {
                display: none;
            }
        `;
        document.head.appendChild(style);

        // Afficher seulement si pas dans un iframe
        if (window.self === window.top) {
            document.documentElement.style.display = 'block';
        }
    }
}

/**
 * Protection contre le credential stuffing
 */
export class CredentialStuffingProtection {
    private static commonPasswords = new Set([
        '123456', 'password', '123456789', '12345678', '12345',
        '1234567', 'password1', '123123', '1234567890', '000000',
        'qwerty', 'abc123', 'million2', '1234', 'iloveyou'
    ]);

    private static breachedEmails = new Set<string>();

    static isCommonPassword(password: string): boolean {
        return this.commonPasswords.has(password.toLowerCase());
    }

    static async checkBreachedPassword(password: string): Promise<boolean> {
        try {
            // Utiliser l'API Have I Been Pwned (k-anonymity)
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const text = await response.text();
            
            return text.includes(suffix);
        } catch (error) {
            console.error('Error checking breached password:', error);
            return false;
        }
    }

    static markEmailAsBreached(email: string): void {
        this.breachedEmails.add(email.toLowerCase());
        SecurityLogger.log('breached_email_detected', email);
    }

    static isBreachedEmail(email: string): boolean {
        return this.breachedEmails.has(email.toLowerCase());
    }
}

/**
 * Protection contre les attaques par force brute distribuées
 */
export class DistributedBruteForceProtection {
    private static globalAttempts: Map<string, number> = new Map();
    private static readonly GLOBAL_THRESHOLD = 100;
    private static readonly WINDOW_MS = 60 * 60 * 1000; // 1 heure

    static recordGlobalAttempt(action: string): boolean {
        const key = `global:${action}`;
        const count = (this.globalAttempts.get(key) || 0) + 1;
        
        this.globalAttempts.set(key, count);

        // Nettoyer après la fenêtre
        setTimeout(() => {
            const current = this.globalAttempts.get(key) || 0;
            if (current > 0) {
                this.globalAttempts.set(key, current - 1);
            }
        }, this.WINDOW_MS);

        if (count > this.GLOBAL_THRESHOLD) {
            SecurityLogger.log('distributed_attack_detected', undefined, { 
                action, 
                count 
            });
            return false;
        }

        return true;
    }
}

/**
 * Détection de bots et automatisation
 */
export class BotDetection {
    private static suspiciousPatterns = {
        mouseMovements: [] as Array<{ x: number; y: number; time: number }>,
        keystrokes: [] as Array<{ key: string; time: number }>,
        scrolls: [] as number[]
    };

    static initialize(): void {
        // Suivre les mouvements de souris
        document.addEventListener('mousemove', (e) => {
            this.suspiciousPatterns.mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now()
            });

            // Garder seulement les 100 derniers
            if (this.suspiciousPatterns.mouseMovements.length > 100) {
                this.suspiciousPatterns.mouseMovements.shift();
            }
        });

        // Suivre les frappes clavier
        document.addEventListener('keydown', (e) => {
            this.suspiciousPatterns.keystrokes.push({
                key: e.key,
                time: Date.now()
            });

            if (this.suspiciousPatterns.keystrokes.length > 100) {
                this.suspiciousPatterns.keystrokes.shift();
            }
        });

        // Suivre le scroll
        document.addEventListener('scroll', () => {
            this.suspiciousPatterns.scrolls.push(Date.now());

            if (this.suspiciousPatterns.scrolls.length > 50) {
                this.suspiciousPatterns.scrolls.shift();
            }
        });
    }

    static analyze(): { isBot: boolean; confidence: number; reasons: string[] } {
        const reasons: string[] = [];
        let suspicionScore = 0;

        // Vérifier les mouvements de souris
        if (this.suspiciousPatterns.mouseMovements.length < 5) {
            reasons.push('Peu ou pas de mouvements de souris');
            suspicionScore += 30;
        } else {
            // Vérifier si les mouvements sont trop linéaires (bot)
            const movements = this.suspiciousPatterns.mouseMovements;
            let linearCount = 0;
            
            for (let i = 2; i < movements.length; i++) {
                const dx1 = movements[i-1].x - movements[i-2].x;
                const dy1 = movements[i-1].y - movements[i-2].y;
                const dx2 = movements[i].x - movements[i-1].x;
                const dy2 = movements[i].y - movements[i-1].y;
                
                // Vérifier si les vecteurs sont presque identiques
                if (Math.abs(dx1 - dx2) < 2 && Math.abs(dy1 - dy2) < 2) {
                    linearCount++;
                }
            }

            if (linearCount > movements.length * 0.8) {
                reasons.push('Mouvements de souris trop linéaires');
                suspicionScore += 40;
            }
        }

        // Vérifier les frappes clavier
        if (this.suspiciousPatterns.keystrokes.length > 10) {
            const keystrokes = this.suspiciousPatterns.keystrokes;
            const intervals: number[] = [];
            
            for (let i = 1; i < keystrokes.length; i++) {
                intervals.push(keystrokes[i].time - keystrokes[i-1].time);
            }

            // Vérifier si les intervalles sont trop réguliers
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => {
                return sum + Math.pow(interval - avgInterval, 2);
            }, 0) / intervals.length;

            if (variance < 100) { // Très faible variance
                reasons.push('Frappes clavier trop régulières');
                suspicionScore += 35;
            }
        }

        // Vérifier les propriétés du navigateur
        if (!navigator.webdriver === undefined || (navigator as any).webdriver) {
            reasons.push('WebDriver détecté');
            suspicionScore += 50;
        }

        if (!navigator.plugins || navigator.plugins.length === 0) {
            reasons.push('Aucun plugin détecté');
            suspicionScore += 20;
        }

        // Vérifier les dimensions d'écran suspectes
        if (screen.width === 0 || screen.height === 0) {
            reasons.push('Dimensions d\'écran invalides');
            suspicionScore += 40;
        }

        const isBot = suspicionScore >= 60;
        const confidence = Math.min(suspicionScore, 100);

        if (isBot) {
            SecurityLogger.log('bot_detected', undefined, { 
                confidence, 
                reasons 
            });
        }

        return { isBot, confidence, reasons };
    }
}

/**
 * Protection contre l'exfiltration de données
 */
export class DataExfiltrationProtection {
    private static copyAttempts: number = 0;
    private static readonly MAX_COPY_ATTEMPTS = 10;
    private static readonly WINDOW_MS = 60 * 1000; // 1 minute

    static initialize(): void {
        // Surveiller les tentatives de copie
        document.addEventListener('copy', (e) => {
            this.copyAttempts++;

            if (this.copyAttempts > this.MAX_COPY_ATTEMPTS) {
                e.preventDefault();
                SecurityLogger.log('excessive_copy_attempts', undefined, {
                    attempts: this.copyAttempts
                });
                alert('Trop de tentatives de copie détectées. Action bloquée pour des raisons de sécurité.');
            }

            // Réinitialiser après la fenêtre
            setTimeout(() => {
                if (this.copyAttempts > 0) {
                    this.copyAttempts--;
                }
            }, this.WINDOW_MS);
        });

        // Surveiller les tentatives d'impression
        window.addEventListener('beforeprint', () => {
            SecurityLogger.log('print_attempt', undefined);
        });

        // Surveiller les captures d'écran (limité)
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                SecurityLogger.log('screenshot_attempt', undefined);
            }
        });
    }

    static protectSensitiveElement(element: HTMLElement): void {
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.addEventListener('contextmenu', (e) => e.preventDefault());
    }
}

/**
 * Détection de DevTools ouvert
 */
export class DevToolsDetection {
    private static isOpen = false;
    private static checkInterval: number | null = null;

    static initialize(onDetect?: () => void): void {
        const threshold = 160;

        const check = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            const orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (widthThreshold || heightThreshold) {
                if (!this.isOpen) {
                    this.isOpen = true;
                    SecurityLogger.log('devtools_opened', undefined, { orientation });
                    
                    if (onDetect) {
                        onDetect();
                    }
                }
            } else {
                this.isOpen = false;
            }
        };

        // Vérifier toutes les 500ms
        this.checkInterval = window.setInterval(check, 500);
        check();
    }

    static stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    static getStatus(): boolean {
        return this.isOpen;
    }
}

/**
 * Protection contre le tabnabbing
 */
export class TabnabbingProtection {
    static protectExternalLinks(): void {
        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Observer les nouveaux liens ajoutés dynamiquement
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'A') {
                        const link = node as HTMLAnchorElement;
                        if (link.target === '_blank') {
                            link.setAttribute('rel', 'noopener noreferrer');
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

/**
 * Gestionnaire de sécurité centralisé
 */
export class SecurityManager {
    private static initialized = false;

    static initialize(options: {
        enableClickjackingProtection?: boolean;
        enableBotDetection?: boolean;
        enableDataExfiltrationProtection?: boolean;
        enableDevToolsDetection?: boolean;
        enableTabnabbingProtection?: boolean;
        onDevToolsDetect?: () => void;
    } = {}): void {
        if (this.initialized) {
            console.warn('SecurityManager already initialized');
            return;
        }

        const {
            enableClickjackingProtection = true,
            enableBotDetection = true,
            enableDataExfiltrationProtection = true,
            enableDevToolsDetection = false, // Désactivé par défaut (peut être intrusif)
            enableTabnabbingProtection = true,
            onDevToolsDetect
        } = options;

        if (enableClickjackingProtection) {
            ClickjackingProtection.enable();
        }

        if (enableBotDetection) {
            BotDetection.initialize();
        }

        if (enableDataExfiltrationProtection) {
            DataExfiltrationProtection.initialize();
        }

        if (enableDevToolsDetection) {
            DevToolsDetection.initialize(onDevToolsDetect);
        }

        if (enableTabnabbingProtection) {
            TabnabbingProtection.protectExternalLinks();
        }

        this.initialized = true;
        SecurityLogger.log('security_manager_initialized', undefined, options);
    }

    static getSecurityReport(): {
        botDetection: ReturnType<typeof BotDetection.analyze>;
        devToolsOpen: boolean;
    } {
        return {
            botDetection: BotDetection.analyze(),
            devToolsOpen: DevToolsDetection.getStatus()
        };
    }
}

export default {
    TimingSafeComparison,
    ClickjackingProtection,
    CredentialStuffingProtection,
    DistributedBruteForceProtection,
    BotDetection,
    DataExfiltrationProtection,
    DevToolsDetection,
    TabnabbingProtection,
    SecurityManager
};
