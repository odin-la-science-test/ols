import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Beaker, Activity, Database, Microscope, FlaskConical,
    Dna, Brain, ArrowLeft, CheckCircle, Zap, Shield, Users
} from 'lucide-react';

const MobileFeatures = () => {
    const navigate = useNavigate();

    const mainFeatures = [
        {
            icon: <BookOpen size={40} />,
            title: 'Munin Atlas',
            description: 'Encyclopédie scientifique complète avec des milliers d\'entités référencées',
            color: '#10b981',
            features: ['Base de données complète', 'Recherche avancée', 'Comparaison d\'entités']
        },
        {
            icon: <Beaker size={40} />,
            title: 'Hugin Lab',
            description: 'Gestion de cultures, suivi d\'expériences et cahier de laboratoire',
            color: '#6366f1',
            features: ['Gestion cultures', 'Cahier labo', 'Suivi expériences']
        },
        {
            icon: <Activity size={40} />,
            title: 'Analyse Avancée',
            description: 'Spectrométrie, cytométrie et analyse de données en temps réel',
            color: '#8b5cf6',
            features: ['Spectrométrie', 'Cytométrie', 'Analyse temps réel']
        },
        {
            icon: <Database size={40} />,
            title: 'Gestion Données',
            description: 'Stockage sécurisé et organisation intelligente',
            color: '#3b82f6',
            features: ['Cloud sécurisé', 'Backup auto', 'Export facile']
        }
    ];

    const modules = [
        { icon: <Microscope size={32} />, title: 'CryoKeeper', color: '#10b981' },
        { icon: <FlaskConical size={32} />, title: 'CultureTracking', color: '#6366f1' },
        { icon: <Dna size={32} />, title: 'SequenceLens', color: '#8b5cf6' },
        { icon: <Brain size={32} />, title: 'Excel Lab', color: '#3b82f6' }
    ];

    const benefits = [
        { icon: <Zap size={24} />, title: 'Gain de temps', desc: 'Automatisation complète', color: '#f59e0b' },
        { icon: <Shield size={24} />, title: 'Sécurité', desc: 'Cryptage de bout en bout', color: '#10b981' },
        { icon: <Users size={24} />, title: 'Collaboration', desc: 'Travail d\'équipe', color: '#6366f1' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b1120',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            paddingBottom: '2rem'
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(11, 17, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f8fafc',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                        Fonctionnalités
                    </h1>
                </div>
            </div>

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
                    Tout pour votre recherche
                </h2>
                <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Des outils puissants pour accélérer votre travail scientifique
                </p>
            </div>

            {/* Main Features */}
            <div style={{ padding: '0 1.5rem 2rem' }}>
                {mainFeatures.map((feature, i) => (
                    <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '1rem',
                            background: `${feature.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            {React.cloneElement(feature.icon, { color: feature.color })}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {feature.title}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                            {feature.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {feature.features.map((feat, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={16} color={feature.color} />
                                    <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Modules spécialisés
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {modules.map((module, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '1rem',
                                background: `${module.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                {React.cloneElement(module.icon, { color: module.color })}
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                                {module.title}
                            </h4>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits */}
            <div style={{ padding: '2rem 1.5rem' }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Avantages clés
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {benefits.map((benefit, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '0.75rem',
                                background: `${benefit.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {React.cloneElement(benefit.icon, { color: benefit.color })}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                    {benefit.title}
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {benefit.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ padding: '0 1.5rem 2rem', textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/register')}
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
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    Commencer gratuitement
                </button>
            </div>
        </div>
    );
};

export default MobileFeatures;
