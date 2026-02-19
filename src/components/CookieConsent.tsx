import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { CookieManager } from '../utils/cookieManager';
import { useNavigate } from 'react-router-dom';

const CookieConsent = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const c = theme.colors;
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        functional: true,
        analytics: false,
        marketing: false
    });

    useEffect(() => {
        // Vérifier si l'utilisateur a déjà donné son consentement
        if (!CookieManager.hasGivenConsent()) {
            // Attendre 1 seconde avant d'afficher le bandeau
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAcceptAll = () => {
        CookieManager.acceptAll();
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        CookieManager.rejectAll();
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        CookieManager.saveConsent(preferences);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: `2px solid ${c.accentPrimary}`,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.4s ease-out'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                position: 'relative'
            }}>
                {/* Bouton fermer */}
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '0',
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = c.bgSecondary;
                        e.currentTarget.style.color = c.textPrimary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = c.textSecondary;
                    }}
                >
                    <X size={20} />
                </button>

                {!showDetails ? (
                    // Vue simple
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                padding: '0.75rem',
                                background: `${c.accentPrimary}20`,
                                borderRadius: '0.75rem',
                                flexShrink: 0
                            }}>
                                <Cookie size={28} color={c.accentPrimary} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    marginBottom: '0.5rem',
                                    color: '#fff'
                                }}>
                                    🍪 Nous utilisons des cookies
                                </h3>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.6,
                                    marginBottom: '0.5rem'
                                }}>
                                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                                    En cliquant sur "Tout accepter", vous consentez à l'utilisation de tous les cookies.
                                </p>
                                <a
                                    href="/rgpd"
                                    target="_blank"
                                    style={{
                                        color: c.accentPrimary,
                                        fontSize: '0.85rem',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    En savoir plus sur notre politique de confidentialité
                                </a>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowDetails(true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'transparent',
                                    border: `1px solid ${c.borderColor}`,
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = c.bgSecondary;
                                    e.currentTarget.style.borderColor = c.accentPrimary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = c.borderColor;
                                }}
                            >
                                <Settings size={18} />
                                Personnaliser
                            </button>
                            <button
                                onClick={handleRejectAll}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'transparent',
                                    border: `1px solid ${c.borderColor}`,
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = c.bgSecondary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Refuser tout
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`,
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: `0 4px 12px ${c.accentPrimary}44`,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Tout accepter
                            </button>
                        </div>
                    </div>
                ) : (
                    // Vue détaillée
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <Settings size={24} color={c.accentPrimary} />
                            Préférences des cookies
                        </h3>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            {/* Cookies essentiels */}
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Shield size={18} color="#10b981" />
                                        <strong style={{ color: '#fff' }}>Cookies essentiels</strong>
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}>
                                        Toujours actifs
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}>
                                    Nécessaires au fonctionnement du site (authentification, sécurité, préférences de session).
                                </p>
                            </div>

                            {/* Cookies fonctionnels */}
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                border: `1px solid ${preferences.functional ? c.accentPrimary : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <strong style={{ color: '#fff' }}>Cookies fonctionnels</strong>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={preferences.functional}
                                            onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                accentColor: c.accentPrimary
                                            }}
                                        />
                                    </label>
                                </div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}>
                                    Permettent de mémoriser vos préférences (thème, langue, favoris).
                                </p>
                            </div>

                            {/* Cookies analytiques */}
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                border: `1px solid ${preferences.analytics ? c.accentPrimary : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <strong style={{ color: '#fff' }}>Cookies analytiques</strong>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={preferences.analytics}
                                            onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                accentColor: c.accentPrimary
                                            }}
                                        />
                                    </label>
                                </div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}>
                                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                                </p>
                            </div>

                            {/* Cookies marketing */}
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                border: `1px solid ${preferences.marketing ? c.accentPrimary : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <strong style={{ color: '#fff' }}>Cookies marketing</strong>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={preferences.marketing}
                                            onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                accentColor: c.accentPrimary
                                            }}
                                        />
                                    </label>
                                </div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}>
                                    Utilisés pour personnaliser les publicités et mesurer leur efficacité.
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowDetails(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'transparent',
                                    border: `1px solid ${c.borderColor}`,
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = c.bgSecondary}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Retour
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`,
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: `0 4px 12px ${c.accentPrimary}44`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Check size={18} />
                                Enregistrer mes préférences
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default CookieConsent;
