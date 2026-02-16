import React from 'react';
import MobilePageLayout from '../../components/MobilePageLayout';
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';

const MobileTerms = () => {
    const sections = [
        {
            title: '1. Acceptation des conditions',
            content: 'En utilisant Odin, vous acceptez ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser nos services.'
        },
        {
            title: '2. Utilisation du service',
            content: 'Vous vous engagez à utiliser Odin de manière légale et conforme à toutes les lois applicables. Toute utilisation abusive peut entraîner la suspension de votre compte.'
        },
        {
            title: '3. Propriété intellectuelle',
            content: 'Tous les contenus, marques et logos sont la propriété d\'Odin ou de ses partenaires. Toute reproduction non autorisée est interdite.'
        },
        {
            title: '4. Responsabilités',
            content: 'Odin s\'efforce de fournir un service fiable mais ne peut garantir une disponibilité à 100%. Nous ne sommes pas responsables des pertes de données dues à des facteurs externes.'
        },
        {
            title: '5. Modifications',
            content: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants.'
        },
        {
            title: '6. Résiliation',
            content: 'Vous pouvez résilier votre compte à tout moment. Nous pouvons également suspendre ou résilier votre accès en cas de violation des conditions.'
        }
    ];

    return (
        <MobilePageLayout title="Conditions d'utilisation">
            {/* Hero */}
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <Scale size={32} color="#fff" />
                </div>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Conditions d'utilisation
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
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                            color: '#3b82f6'
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

            {/* Important Notice */}
            <div style={{
                padding: '1.5rem',
                margin: '0 1.5rem 2rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '1rem',
                display: 'flex',
                gap: '1rem'
            }}>
                <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f59e0b' }}>
                        Important
                    </h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        En continuant à utiliser Odin, vous acceptez ces conditions d'utilisation et notre politique de confidentialité.
                    </p>
                </div>
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
                    Questions juridiques ?
                </h3>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                }}>
                    Notre équipe juridique est à votre disposition.
                </p>
                <a
                    href="mailto:legal@odin-science.com"
                    style={{
                        display: 'inline-block',
                        padding: '0.875rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}
                >
                    Contacter l'équipe juridique
                </a>
            </div>
        </MobilePageLayout>
    );
};

export default MobileTerms;
