/**
 * Cookie Manager - Gestion des cookies conforme RGPD
 */

export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: number;
}

export class CookieManager {
    private static CONSENT_COOKIE = 'odin_cookie_consent';
    private static CONSENT_EXPIRY_DAYS = 365;

    /**
     * Définir un cookie
     */
    static setCookie(name: string, value: string, days: number = 365, category: CookieCategory = 'essential'): void {
        // Vérifier le consentement avant de définir le cookie
        if (!this.hasConsent(category)) {
            console.warn(`Cookie ${name} non défini : consentement ${category} requis`);
            return;
        }

        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        
        const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
        document.cookie = cookieString;
    }

    /**
     * Obtenir un cookie
     */
    static getCookie(name: string): string | null {
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }

    /**
     * Supprimer un cookie
     */
    static deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    /**
     * Sauvegarder les préférences de consentement
     */
    static saveConsent(consent: Omit<CookieConsent, 'timestamp'>): void {
        const consentData: CookieConsent = {
            ...consent,
            essential: true, // Toujours true
            timestamp: Date.now()
        };

        // Sauvegarder dans un cookie essentiel
        const consentString = JSON.stringify(consentData);
        const expires = new Date();
        expires.setTime(expires.getTime() + this.CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        
        document.cookie = `${this.CONSENT_COOKIE}=${encodeURIComponent(consentString)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;

        // Nettoyer les cookies non autorisés
        this.cleanupUnauthorizedCookies(consentData);

        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consentData }));
    }

    /**
     * Obtenir les préférences de consentement
     */
    static getConsent(): CookieConsent | null {
        const consentString = this.getCookie(this.CONSENT_COOKIE);
        if (!consentString) return null;

        try {
            return JSON.parse(consentString);
        } catch {
            return null;
        }
    }

    /**
     * Vérifier si l'utilisateur a donné son consentement pour une catégorie
     */
    static hasConsent(category: CookieCategory): boolean {
        // Les cookies essentiels sont toujours autorisés
        if (category === 'essential') return true;

        const consent = this.getConsent();
        if (!consent) return false;

        return consent[category] === true;
    }

    /**
     * Vérifier si le consentement a été donné
     */
    static hasGivenConsent(): boolean {
        return this.getConsent() !== null;
    }

    /**
     * Nettoyer les cookies non autorisés
     */
    private static cleanupUnauthorizedCookies(consent: CookieConsent): void {
        const allCookies = document.cookie.split(';');
        
        for (let cookie of allCookies) {
            const cookieName = cookie.split('=')[0].trim();
            
            // Ne pas supprimer le cookie de consentement
            if (cookieName === this.CONSENT_COOKIE) continue;

            // Déterminer la catégorie du cookie et supprimer si non autorisé
            if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid')) {
                if (!consent.analytics) this.deleteCookie(cookieName);
            } else if (cookieName.startsWith('_fbp') || cookieName.startsWith('_fbc')) {
                if (!consent.marketing) this.deleteCookie(cookieName);
            }
        }
    }

    /**
     * Accepter tous les cookies
     */
    static acceptAll(): void {
        this.saveConsent({
            essential: true,
            functional: true,
            analytics: true,
            marketing: true
        });
    }

    /**
     * Refuser tous les cookies non essentiels
     */
    static rejectAll(): void {
        this.saveConsent({
            essential: true,
            functional: false,
            analytics: false,
            marketing: false
        });
    }

    /**
     * Réinitialiser le consentement
     */
    static resetConsent(): void {
        this.deleteCookie(this.CONSENT_COOKIE);
        window.dispatchEvent(new CustomEvent('cookieConsentReset'));
    }

    /**
     * Cookies essentiels (authentification, sécurité)
     */
    static setAuthCookie(token: string, days: number = 7): void {
        this.setCookie('odin_auth_token', token, days, 'essential');
    }

    static getAuthCookie(): string | null {
        return this.getCookie('odin_auth_token');
    }

    static deleteAuthCookie(): void {
        this.deleteCookie('odin_auth_token');
    }

    /**
     * Cookies fonctionnels (préférences utilisateur)
     */
    static setThemePreference(theme: string): void {
        this.setCookie('odin_theme', theme, 365, 'functional');
    }

    static getThemePreference(): string | null {
        return this.getCookie('odin_theme');
    }

    /**
     * Cookies analytiques
     */
    static setAnalyticsCookie(name: string, value: string): void {
        this.setCookie(name, value, 365, 'analytics');
    }

    /**
     * Obtenir tous les cookies actifs
     */
    static getAllCookies(): { [key: string]: string } {
        const cookies: { [key: string]: string } = {};
        const allCookies = document.cookie.split(';');
        
        for (let cookie of allCookies) {
            const [name, value] = cookie.split('=').map(c => c.trim());
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        }
        
        return cookies;
    }
}
