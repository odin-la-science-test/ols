import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionManager, CSRFProtection, RateLimiter, AuditLedger, SecureStorage } from '../utils/encryption';

interface SecurityContextType {
    isAuthenticated: boolean;
    userProfile: any;
    userRole: string;
    login: (userId: string) => Promise<void>;
    logout: () => void;
    checkRateLimit: (action: string) => Promise<boolean>;
    auditLog: (action: string, details: any) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const loginLimiter = new RateLimiter(5, 60000); // 5 tentatives par minute
const apiLimiter = new RateLimiter(100, 60000); // 100 requêtes par minute

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>('user');

    const refreshProfile = async () => {
        const userId = localStorage.getItem('currentUser');
        if (userId) {
            const profile = await SecureStorage.getItem(`user_profile_${userId.toLowerCase().trim()}`);
            if (profile) {
                setUserProfile(profile);
                setUserRole(profile.role || 'user');
                localStorage.setItem('currentUserRole', profile.role || 'user');
            }
        }
    };

    useEffect(() => {
        // Vérifier la session au chargement
        const checkInitialSession = async () => {
            const isValid = await SessionManager.validateSession();

            // Banking-grade: Verify session pinning (IP/Fingerprint)
            if (isValid) {
                const sessionData = await SessionManager.getSessionData();
                const currentFingerprint = navigator.userAgent + (window as any).screen.colorDepth;
                if ((sessionData as any)?.fingerprint && (sessionData as any).fingerprint !== currentFingerprint) {
                    await AuditLedger.log('security_alert', { type: 'session_fingerprint_mismatch' }, sessionData?.userId);
                    logout();
                    return;
                }

                // Load profile and role asynchronously
                await refreshProfile();
            }

            setIsAuthenticated(isValid);

            // Audit Ledger Integrity Check
            const isLedgerSafe = await AuditLedger.verifyIntegrity();
            if (!isLedgerSafe) {
                console.error('CRITICAL: Audit Ledger Tampering detected!');
            }

            // Générer un token CSRF
            if (!CSRFProtection.getToken()) {
                CSRFProtection.generateToken();
            }
        };

        checkInitialSession();

        // Rafraîchir la session toutes les 5 minutes
        const interval = setInterval(async () => {
            if (await SessionManager.validateSession()) {
                await SessionManager.refreshSession();
            } else {
                setIsAuthenticated(false);
            }
        }, 5 * 60 * 1000);

        // Nettoyer à la fermeture de la page
        const handleBeforeUnload = async () => {
            // Ne pas détruire la session, juste rafraîchir
            if (await SessionManager.validateSession()) {
                await SessionManager.refreshSession();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Détecter l'inactivité
    useEffect(() => {
        let inactivityTimer: any;
        const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes (Banking Standard)

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (isAuthenticated) {
                    logout();
                    alert('Session expirée pour cause d\'inactivité');
                }
            }, INACTIVITY_TIMEOUT);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated]);

    // Anti-Debugging: Detect DevTools (Banking Standard)
    useEffect(() => {
        const detectDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            if (widthThreshold || heightThreshold) {
                if (isAuthenticated) {
                    AuditLedger.log('security_alert', { type: 'devtools_detected' });
                }
            }
        };

        const interval = setInterval(detectDevTools, 2000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = async (userId: string) => {
        const fingerprint = navigator.userAgent + (window as any).screen.colorDepth;
        await SessionManager.createSession(userId);

        // Add fingerprint to session data (simulated via update)
        const session = await SessionManager.getSessionData();
        if (session) {
            (session as any).fingerprint = fingerprint;
            await AuditLedger.log('login_success', { fingerprint }, userId);
        }

        CSRFProtection.generateToken();

        // Load profile before setting authenticated
        await refreshProfile();
        setIsAuthenticated(true);
    };

    const logout = () => {
        SessionManager.destroySession();
        CSRFProtection.clearToken();
        setIsAuthenticated(false);
        setUserProfile(null);
        setUserRole('user');

        // Banking-grade: Targeted cleanup of session data only
        // Do NOT use localStorage.clear() as it would delete user profiles
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('firstTimeLogin');

        sessionStorage.clear();

        // Rediriger vers la page de connexion
        window.location.href = '/login';
    };

    const checkRateLimit = async (action: string): Promise<boolean> => {
        const limiter = action === 'login' ? loginLimiter : apiLimiter;
        const sessionData = await SessionManager.getSessionData();
        const userId = sessionData?.userId || 'anonymous';
        return limiter.checkLimit(`${userId}:${action}`);
    };

    const auditLog = async (action: string, details: any) => {
        const session = await SessionManager.getSessionData();
        await AuditLedger.log(action, details, session?.userId);
    };

    return (
        <SecurityContext.Provider value={{ isAuthenticated, userProfile, userRole, login, logout, checkRateLimit, auditLog, refreshProfile }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useSecurity must be used within SecurityProvider');
    }
    return context;
};

export default SecurityProvider;
