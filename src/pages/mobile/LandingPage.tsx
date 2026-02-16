import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Beaker, BookOpen, Activity, Database,
    ArrowRight, Play, Zap, Shield, Users, TrendingUp,
    CheckCircle, Star, Menu, X, Sparkles
} from 'lucide-react';

const MobileLandingPage = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const features = [
        {
            icon: <BookOpen size={32} />,
            title: 'Munin Atlas',
            description: 'Encyclopédie scientifique complète',
            color: '#10b981'
        },
        {
            icon: <Beaker size={32} />,
            title: 'Hugin Lab',
            description: 'Gestion de laboratoire',
            color: '#6366f1'
        },
        {
            icon: <Activity size={32} />,
            title: 'Analyse',
            description: 'Données en temps réel',
            color: '#8b5cf6'
        },
        {
            icon: <Database size={32} />,
            title: 'Stockage',
            description: 'Cloud sécurisé',
            color: '#3b82f6'
        }
    ];

    const benefits = [
        { icon: <Zap size={24} />, title: 'Gain de temps', color: '#f59e0b' },
        { icon: <Shield size={24} />, title: 'Sécurité maximale', color: '#10b981' },
        { icon: <Users size={24} />, title: 'Collaboration', color: '#6366f1' },
        { icon: <TrendingUp size={24} />, title: 'Mobile-first', color: '#8b5cf6' }
    ];

    const stats = [
        { value: '10K+', label: 'Chercheurs' },
        { value: '500+', label: 'Laboratoires' },
        { value: '1M+', label: 'Expériences' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b1120',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Mobile Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: 'rgba(11, 17, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                         onClick={() => navigate('/')}>
                        <img src="/logo1.png" alt="Odin" style={{ height: '32px' }} />
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Odin
                        </span>
                    </div>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f8fafc',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(11, 17, 32, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', padding: '0.5rem' }}
                           onClick={() => setMenuOpen(false)}>
                            Fonctionnalités
                        </a>
                        <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', padding: '0.5rem' }}
                           onClick={() => setMenuOpen(false)}>
                            Tarifs
                        </a>
                        <button
                            onClick={() => { navigate('/login'); setMenuOpen(false); }}
                            style={{
                                padding: '0.75rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => { navigate('/register'); setMenuOpen(false); }}
                            style={{
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}
                        >
                            Inscription
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                padding: '5rem 1.5rem 3rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '-20%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '-20%',
                    width: '250px',
                    height: '250px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '2rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        <Sparkles size={14} color="#3b82f6" />
                        Nouvelle génération
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        La science à portée de main
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        color: '#94a3b8',
                        lineHeight: 1.6,
                        marginBottom: '2rem'
                    }}>
                        Odin révolutionne la recherche scientifique avec des outils puissants pour gérer vos expériences.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            S'inscrire
                            <ArrowRight size={20} />
                        </button>
                        <button
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.75rem',
                                color: '#f8fafc',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Play size={20} />
                            Voir la démo
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    color: '#3b82f6',
                                    marginBottom: '0.25rem'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{
                padding: '3rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {features.map((feature, i) => (
                        <div key={i} style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '1rem',
                                background: `${feature.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                {React.cloneElement(feature.icon, { color: feature.color })}
                            </div>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                marginBottom: '0.5rem'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                lineHeight: 1.5
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section id="features" style={{
                padding: '3rem 1.5rem'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '0.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Pourquoi Odin ?
                </h2>
                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Des avantages concrets
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {benefits.map((benefit, i) => (
                        <div key={i} style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: `${benefit.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                {React.cloneElement(benefit.icon, { color: benefit.color })}
                            </div>
                            <h3 style={{
                                fontSize: '0.95rem',
                                fontWeight: 700
                            }}>
                                {benefit.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" style={{
                padding: '3rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '0.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Tarifs
                </h2>
                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Plans adaptés à tous
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {/* Munin Plan */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            color: '#94a3b8'
                        }}>
                            Munin Atlas
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900 }}>250€</span>
                            <span style={{ color: '#64748b' }}>/mois</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Encyclopédie complète</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Support email</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Commencer
                        </button>
                    </div>

                    {/* Pack Complet */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        border: '2px solid #3b82f6',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '0.375rem 1rem',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '2rem',
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            ⭐ POPULAIRE
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            color: '#3b82f6'
                        }}>
                            Pack Complet
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900 }}>2600€</span>
                            <span style={{ color: '#94a3b8' }}>/mois</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Tous les modules</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Support 24/7</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>API & intégrations</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            Essai gratuit
                        </button>
                    </div>

                    {/* Enterprise */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            color: '#8b5cf6'
                        }}>
                            Enterprise
                        </h3>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 900,
                            marginBottom: '1rem'
                        }}>
                            Sur mesure
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Utilisateurs illimités</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ color: '#cbd5e1' }}>Modules personnalisés</span>
                            </div>
                        </div>
                        <button
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Nous contacter
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section style={{
                padding: '3rem 1.5rem',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Prêt à commencer ?
                </h2>
                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    marginBottom: '2rem'
                }}>
                    Rejoignez des milliers de chercheurs
                </p>
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
            </section>
        </div>
    );
};

export default MobileLandingPage;
