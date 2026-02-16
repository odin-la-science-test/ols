import React from 'react';
import MobilePageLayout from '../../components/MobilePageLayout';
import { Cookie, CheckCircle, XCircle, Settings } from 'lucide-react';

const MobileCookies = () => {
    const cookieTypes = [
        {
            icon: <CheckCircle size={24} />,
            title: 'Cookies essentiels',
            description: 'Nécessaires au fonctionnement du site',
            required: true,
            color: '#10b981'
        },
        {
            icon: <Settings size={24} />,
            title: 'Cookies fonctionnels',
            description: 'Améliorent votre expérience utilisateur',
            required: false,
            color: '#3b82f6'
        },
        {
            icon: <XCircle size={24} />,
            title: 'Cookies analytiques',
            description: 'Nous aident à comprendre l\'utilisation du site',
            required: false,
            color: '#8b5cf6'
        }
    ];

    return (
        <MobilePageLayout title="Politique Cookies">
            {/* Hero */}
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <Cookie size={32} color="#fff" />
                </div>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Politique des cookies
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Comment nous utilisons les cookies
                </p>
            </div>

            {/* Cookie Types */}
            <div style={{ padding: '0 1.5rem 2rem' }}>
                {cookieTypes.map((type, i) => (
                    <div
                        key={i}
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '0.75rem',
                                background: `${type.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {React.cloneElement(type.icon, { color: type.color })}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700
                                    }}>
                                        {type.title}
                                    </h3>
                                    {type.required && (
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#10b981'
                                        }}>
                                            REQUIS
                                        </span>
                                    )}
                                </div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6
                                }}>
                                    {type.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div style={{
                padding: '1.5rem',
                margin: '0 1.5rem 2rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem'
            }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#3b82f6' }}>
                    Gestion des cookies
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Vous pouvez gérer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur.
                </p>
            </div>

            {/* Actions */}
            <div style={{ padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    Accepter tous les cookies
                </button>
                <button
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Cookies essentiels uniquement
                </button>
            </div>
        </MobilePageLayout>
    );
};

export default MobileCookies;
