import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Beaker, BookOpen, Activity, Database,
    ChevronRight, Sparkles, Menu, X,
    Zap, Shield, Users, TrendingUp,
    Microscope, FlaskConical, Dna, Brain, Star
} from 'lucide-react';

const MobileLandingPage = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const features = [
        {
            icon: <BookOpen size={20} />,
            title: 'Munin Atlas',
            description: 'Encyclopédie scientifique complète',
            color: '#10b981'
        },
        {
            icon: <Beaker size={20} />,
            title: 'Hugin Lab',
            description: 'Gestion de laboratoire numérique',
            color: '#6366f1'
        },
        {
            icon: <Activity size={20} />,
            title: 'Analyse Avancée',
            description: 'Outils d\'analyse en temps réel',
            color: '#8b5cf6'
        },
        {
            icon: <Database size={20} />,
            title: 'Gestion de Données',
            description: 'Stockage sécurisé et intelligent',
            color: '#3b82f6'
        }
    ];

    const benefits = [
        {
            icon: <Zap size={24} />,
            title: 'Gain de temps',
            description: 'Automatisez vos tâches répétitives',
            color: '#f59e0b'
        },
        {
            icon: <Shield size={24} />,
            title: 'Sécurité',
            description: 'Données cryptées et sauvegardées',
            color: '#10b981'
        },
        {
            icon: <Users size={24} />,
            title: 'Collaboration',
            description: 'Travaillez en équipe facilement',
            color: '#6366f1'
        },
        {
            icon: <TrendingUp size={24} />,
            title: 'Mobile',
            description: 'Accès depuis n\'importe où',
            color: '#8b5cf6'
        }
    ];

    const modules = [
        {
            icon: <Microscope size={32} />,
            title: 'CryoKeeper',
            description: 'Gestion d\'échantillons cryogéniques'
        },
        {
            icon: <FlaskConical size={32} />,
            title: 'CultureTracking',
            description: 'Suivi de cultures microbiennes'
        },
        {
            icon: <Dna size={32} />,
            title: 'SequenceLens',
            description: 'Analyse de séquences génétiques'
        },
        {
            icon: <Brain size={32} />,
            title: 'Excel Lab',
            description: 'Tableur scientifique avancé'
        }
    ];

    return (
        <div className="app-viewport" style={{
            background: '#0b1120',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Navigation Mobile */}
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
                            fontSize: '1.1rem',
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
                            padding: '0.5rem',
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Menu déroulant */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(11, 17, 32, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        padding: '1rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    setMenuOpen(false);
                                }}
                                style={{
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                    color: '#f8fafc',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    minHeight: '44px'
                                }}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/register');
                                    setMenuOpen(false);
                                }}
                                style={{
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    minHeight: '44px'
                                }}
                            >
                                Inscription Gratuite
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <div className="app-scrollbox">
                {/* Hero Section */}
                <section style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '6rem 1rem 2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
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
                            fontSize: '1rem',
                            color: '#94a3b8',
                            lineHeight: 1.6,
                            marginBottom: '2rem',
                            padding: '0 1rem'
                        }}>
                            Odin révolutionne la recherche scientifique avec des outils puissants pour 
                            gérer vos expériences et analyser vos données.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 1rem' }}>
                            <button
                                onClick={() => navigate('/register')}
                                style={{
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Commencer gratuitement
                                <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.75rem',
                                    color: '#f8fafc',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    minHeight: '48px'
                                }}
                            >
                                Se connecter
                            </button>
                        </div>

                        <div style={{
                            marginTop: '3rem',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>10K+</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Chercheurs</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>500+</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Labos</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>1M+</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expériences</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section style={{ padding: '3rem 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Fonctionnalités principales
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            Tout ce dont vous avez besoin pour votre recherche
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    background: `${feature.color}20`,
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: feature.color
                                }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem',
                                        color: '#f8fafc'
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        lineHeight: 1.5
                                    }}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section style={{ padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Pourquoi Odin?
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                    }}>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: `${benefit.color}20`,
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: benefit.color,
                                    margin: '0 auto 0.75rem'
                                }}>
                                    {benefit.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    marginBottom: '0.5rem',
                                    color: '#f8fafc'
                                }}>
                                    {benefit.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#94a3b8',
                                    lineHeight: 1.4
                                }}>
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Modules Section */}
                <section style={{ padding: '3rem 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Modules populaires
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            Des outils spécialisés pour chaque besoin
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {modules.map((module, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{
                                    minWidth: '56px',
                                    minHeight: '56px',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#8b5cf6'
                                }}>
                                    {module.icon}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        marginBottom: '0.25rem',
                                        color: '#f8fafc'
                                    }}>
                                        {module.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#94a3b8',
                                        lineHeight: 1.4
                                    }}>
                                        {module.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Testimonials Section */}
                <section style={{ padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Ils nous font confiance
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            {
                                name: 'Dr. Marie Dubois',
                                role: 'BioEcoAgro',
                                content: 'Odin a transformé notre façon de travailler. Gain de 40% de temps!',
                                rating: 5
                            },
                            {
                                name: 'Prof. Jean Martin',
                                role: 'INRAE',
                                content: 'La meilleure plateforme pour la recherche. Interface intuitive.',
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                    ))}
                                </div>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: '#cbd5e1',
                                    lineHeight: 1.6,
                                    marginBottom: '1rem'
                                }}>
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                                        {testimonial.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section style={{ padding: '3rem 1rem 4rem' }}>
                    <div style={{
                        padding: '2rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            marginBottom: '0.75rem',
                            color: '#f8fafc'
                        }}>
                            Prêt à commencer?
                        </h2>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#94a3b8',
                            marginBottom: '1.5rem',
                            lineHeight: 1.5
                        }}>
                            Rejoignez des milliers de chercheurs qui utilisent Odin pour accélérer leur recherche.
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
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '1rem',
                                minHeight: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Inscription gratuite
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    padding: '2rem 1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <img src="/logo1.png" alt="Odin" style={{ height: '32px', margin: '0 auto' }} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Confidentialité</a>
                        <a href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Conditions</a>
                        <a href="/cookies" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cookies</a>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        © 2024 Odin la Science. Tous droits réservés.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default MobileLandingPage;
