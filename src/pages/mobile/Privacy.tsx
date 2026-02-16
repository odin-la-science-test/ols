import React from 'react';
import MobilePageLayout from '../../components/MobilePageLayout';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const MobilePrivacy = () => {
    const sections = [
        {
            icon: <Shield size={24} />,
            title: 'Protection des données',
            content: 'Vos données sont cryptées de bout en bout et stockées de manière sécurisée.',
            color: '#10b981'
        },
        {
            icon: <Lock size={24} />,
            title: 'Sécurité',
            content: 'Nous utilisons les dernières technologies de sécurité pour protéger vos informations.',
            color: '#3b82f6'
        },
        {
            icon: <Eye size={24} />,
            title: 'Transparence',
            content: 'Vous avez un contrôle total sur vos données et pouvez les exporter à tout moment.',
            color: '#8b5cf6'
        },
        {
            icon: <Database size={24} />,
            title: 'Stockage',
            content: 'Vos données sont stockées dans des centres de données certifiés en Europe.',
            color: '#6366f1'
        },
        {
            icon: <UserCheck size={24} />,
            title: 'Vos droits',
            content: 'Droit d\'accès, de rectification, de suppression et de portabilité de vos données.',
            color: '#f59e0b'
        },
        {
            icon: <FileText size={24} />,
            title: 'Conformité RGPD',
            content: 'Nous sommes entièrement conformes au Règlement Général sur la Protection des Données.',
            color: '#ec4899'
        }
    ];

    return (
        <MobilePageLayout title="Confidentialité">
            {/* Hero */}
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Politique de confidentialité
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Dernière mise à jour : 16 février 2026
                </p>
            </div>

            {/* Sections */}
            <div style={{ padding: '0 1.5rem 2rem' }}>
                {sections.map((section, i) => (
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
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '0.75rem',
                            background: `${section.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            {React.cloneElement(section.icon, { color: section.color })}
                        </div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem'
                        }}>
                            {section.title}
                        </h3>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            lineHeight: 1.6
                        }}>
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* Contact */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                }}>
                    Des questions ?
                </h3>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                }}>
                    Contactez notre équipe pour toute question concernant vos données personnelles.
                </p>
                <a
                    href="mailto:privacy@odin-science.com"
                    style={{
                        display: 'inline-block',
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    Nous contacter
                </a>
            </div>
        </MobilePageLayout>
    );
};

export default MobilePrivacy;
