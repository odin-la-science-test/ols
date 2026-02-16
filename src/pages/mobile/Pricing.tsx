import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobilePageLayout from '../../components/MobilePageLayout';
import { CheckCircle, Star } from 'lucide-react';

const MobilePricing = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Munin Atlas',
            price: '250€',
            period: '/mois',
            description: 'Encyclopédie scientifique',
            color: '#94a3b8',
            features: [
                'Encyclopédie complète',
                'Gestion des entités',
                'Base de connaissances',
                'Support par email'
            ],
            popular: false
        },
        {
            name: 'Pack Complet',
            price: '2600€',
            period: '/mois',
            description: 'Tous les modules inclus',
            color: '#3b82f6',
            features: [
                'Munin Atlas',
                'Hugin Core (Messagerie, Planning)',
                'Hugin Lab (Cultures, Stocks)',
                'Hugin Analysis (Spectrométrie)',
                'Support prioritaire 24/7',
                'API & intégrations'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Sur mesure',
            period: '',
            description: 'Pour grands laboratoires',
            color: '#8b5cf6',
            features: [
                'Tout du plan Professional',
                'Utilisateurs illimités',
                'Stockage illimité',
                'Modules personnalisés',
                'Support dédié',
                'Formation sur site',
                'SLA garanti'
            ],
            popular: false
        }
    ];

    return (
        <MobilePageLayout title="Tarifs">
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
                    Choisissez votre formule
                </h2>
                <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Plans adaptés à tous les besoins
                </p>
            </div>

            {/* Plans */}
            <div style={{ padding: '0 1.5rem' }}>
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        style={{
                            background: plan.popular
                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))'
                                : 'rgba(255, 255, 255, 0.02)',
                            border: plan.popular ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            marginBottom: '1rem',
                            position: 'relative'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '0.375rem 1rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                borderRadius: '2rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <Star size={12} fill="#fff" />
                                POPULAIRE
                            </div>
                        )}

                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            color: plan.color
                        }}>
                            {plan.name}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {plan.description}
                        </p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <span style={{
                                fontSize: plan.period ? '2rem' : '1.5rem',
                                fontWeight: 900
                            }}>
                                {plan.price}
                            </span>
                            {plan.period && (
                                <span style={{ color: '#94a3b8' }}>{plan.period}</span>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            {plan.features.map((feature, j) => (
                                <div key={j} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem'
                                }}>
                                    <CheckCircle size={16} color="#10b981" />
                                    <span style={{ color: '#cbd5e1' }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: plan.popular
                                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                fontWeight: plan.popular ? 700 : 600,
                                cursor: 'pointer',
                                boxShadow: plan.popular ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
                            }}
                        >
                            {plan.price === 'Sur mesure' ? 'Nous contacter' : 'Commencer'}
                        </button>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: '2rem'
            }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Questions fréquentes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Puis-je changer de plan ?
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Oui, vous pouvez changer de plan à tout moment depuis votre compte.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Y a-t-il un essai gratuit ?
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Oui, 14 jours d'essai gratuit sans carte bancaire requise.
                        </p>
                    </div>
                </div>
            </div>
        </MobilePageLayout>
    );
};

export default MobilePricing;
