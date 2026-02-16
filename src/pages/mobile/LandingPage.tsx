import { useNavigate } from 'react-router-dom';
import { 
    Beaker, BookOpen, Zap, Shield, Users, TrendingUp, 
    ArrowRight, CheckCircle, Star, Sparkles, ChevronRight,
    FlaskConical, Database, Activity, Award
} from 'lucide-react';
import { useState } from 'react';
import '../../styles/mobile-app.css';

const MobileLandingPage = () => {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: <BookOpen size={32} />,
            title: 'Munin Atlas',
            description: 'Encyclopédie scientifique complète',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
            icon: <Beaker size={32} />,
            title: 'Hugin Lab',
            description: 'Gestion de laboratoire complète',
            color: '#6366f1',
            gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)'
        },
        {
            icon: <Activity size={32} />,
            title: 'Analyse Avancée',
            description: 'Outils d\'analyse puissants',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        }
    ];

    const benefits = [
        { icon: <Zap size={24} />, title: 'Rapide', color: '#f59e0b' },
        { icon: <Shield size={24} />, title: 'Sécurisé', color: '#10b981' },
        { icon: <Users size={24} />, title: 'Collaboratif', color: '#6366f1' },
        { icon: <TrendingUp size={24} />, title: 'Mobile', color: '#8b5cf6' }
    ];

    const stats = [
        { value: '10K+', label: 'Chercheurs' },
        { value: '500+', label: 'Labos' },
        { value: '1M+', label: 'Expériences' }
    ];

    const testimonials = [
        {
            name: 'Dr. Marie Dubois',
            role: 'BioEcoAgro',
            content: 'Odin a transformé notre façon de travailler.',
            rating: 5
        },
        {
            name: 'Prof. Jean Martin',
            role: 'INRAE',
            content: 'La meilleure plateforme pour la recherche.',
            rating: 5
        },
        {
            name: 'Dr. Sophie Laurent',
            role: 'UGSF',
            content: 'Indispensable pour notre équipe.',
            rating: 5
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0b1120 0%, #1e293b 100%)',
            color: '#f8fafc',
            overflow: 'hidden'
        }}>
            <nav style={{
                position: 'sticky',
                top: 0,
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo1.png" alt="Odin" style={{ height: '32px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#fff',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            Inscription
                        </button>
                    </div>
                </div>
            </nav>

            <section style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                position: 'relative'
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

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '2rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    position: 'relative'
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
                    WebkitTextFillColor: 'transparent',
                    position: 'relative'
                }}>
                    La science à portée de main
                </h1>

                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                    position: 'relative'
                }}>
                    Odin révolutionne la recherche scientifique avec des outils puissants
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                        marginBottom: '2rem',
                        position: 'relative'
                    }}
                >
                    Commencer gratuitement
                    <ArrowRight size={20} />
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem',
                    position: 'relative'
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1rem 0.5rem',
                            textAlign: 'center'
                        }}>
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
            </section>

            <section style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Modules principaux
                </h2>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            onClick={() => setActiveFeature(i)}
                            style={{
                                background: activeFeature === i 
                                    ? feature.gradient 
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${activeFeature === i ? feature.color : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '1rem',
                                background: activeFeature === i 
                                    ? 'rgba(255, 255, 255, 0.2)' 
                                    : `${feature.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: activeFeature === i ? '#fff' : feature.color,
                                flexShrink: 0
                            }}>
                                {feature.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    marginBottom: '0.25rem',
                                    color: activeFeature === i ? '#fff' : '#f8fafc'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: activeFeature === i ? 'rgba(255,255,255,0.9)' : '#94a3b8',
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                            <ChevronRight 
                                size={20} 
                                color={activeFeature === i ? '#fff' : '#64748b'} 
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section style={{
                padding: '2rem 1.5rem'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Pourquoi Odin ?
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {benefits.map((benefit, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: `${benefit.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem',
                                color: benefit.color
                            }}>
                                {benefit.icon}
                            </div>
                            <div style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#f8fafc'
                            }}>
                                {benefit.title}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    Ils nous font confiance
                </h2>

                <p style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                }}>
                    BioEcoAgro • INRAE • UGSF
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {testimonials.map((testimonial, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.25rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '0.25rem',
                                marginBottom: '0.75rem'
                            }}>
                                {[...Array(testimonial.rating)].map((_, j) => (
                                    <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                                ))}
                            </div>
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                lineHeight: 1.5,
                                marginBottom: '0.75rem'
                            }}>
                                "{testimonial.content}"
                            </p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <div>
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        marginBottom: '0.125rem'
                                    }}>
                                        {testimonial.name}
                                    </div>
                                    <div style={{
                                        color: '#64748b',
                                        fontSize: '0.75rem'
                                    }}>
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{
                padding: '2rem 1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                    }}>
                        <Award size={32} color="#fff" />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        marginBottom: '0.75rem'
                    }}>
                        Tarif académique
                    </h2>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem'
                    }}>
                        -30% pour les institutions académiques
                    </p>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: '#3b82f6',
                        marginBottom: '0.5rem'
                    }}>
                        2600€
                    </div>
                    <div style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem'
                    }}>
                        par mois
                    </div>
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
                            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        Essai gratuit 30 jours
                    </button>
                </div>
            </section>

            <section style={{
                padding: '3rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '1rem'
                }}>
                    Prêt à commencer ?
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                        marginBottom: '1rem'
                    }}
                >
                    S'inscrire gratuitement
                    <ArrowRight size={20} />
                </button>
                <button
                    onClick={() => navigate('/login')}
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
                    Déjà inscrit ? Se connecter
                </button>
            </section>

            <footer style={{
                padding: '2rem 1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    <img src="/logo1.png" alt="Odin" style={{ height: '24px' }} />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Odin</span>
                </div>
                <p style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                }}>
                    La plateforme scientifique nouvelle génération
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    fontSize: '0.8rem',
                    color: '#94a3b8'
                }}>
                    <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Confidentialité
                    </a>
                    <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Conditions
                    </a>
                    <a href="/support" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Support
                    </a>
                </div>
                <p style={{
                    color: '#475569',
                    fontSize: '0.75rem',
                    marginTop: '1.5rem'
                }}>
                    © 2024 Odin. Tous droits réservés.
                </p>
            </footer>
        </div>
    );
};

export default MobileLandingPage;
