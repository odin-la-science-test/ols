import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BookOpen, FlaskConical, Sparkles, ArrowLeft } from 'lucide-react';
import SplashToHomeAnimation from '../components/SplashToHomeAnimation';
import { LOGOS } from '../utils/logoCache';

const DesktopHome = () => {
    const navigate = useNavigate();
    const [showSplash, setShowSplash] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const username = localStorage.getItem('currentUser')?.split('@')[0] || 'Utilisateur';

    // Vérifier si c'est la première visite après login (uniquement depuis desktop-login)
    useEffect(() => {
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
        const fromLogin = sessionStorage.getItem('fromDesktopLogin');
        
        console.log('🔍 Debug splash:', { hasSeenSplash, fromLogin });
        
        // Animation uniquement si on vient du login ET qu'on n'a pas encore vu le splash
        if (!hasSeenSplash && fromLogin === 'true') {
            console.log('✅ Déclenchement animation splash');
            setShowSplash(true);
            setShowContent(false);
            sessionStorage.setItem('hasSeenSplash', 'true');
            sessionStorage.removeItem('fromDesktopLogin'); // Nettoyer le flag
        } else {
            console.log('❌ Pas d\'animation - affichage direct');
            // Si pas de splash, afficher directement le contenu
            setShowContent(true);
        }
    }, []);

    const handleSplashComplete = () => {
        setShowSplash(false);
        // Attendre un instant pour que l'animation se termine complètement
        setTimeout(() => {
            setShowContent(true);
        }, 50);
    };

    if (showSplash) {
        return (
            <SplashToHomeAnimation onComplete={handleSplashComplete}>
                <div style={{
                    minHeight: '100vh',
                    background: '#0b1120',
                    color: '#f8fafc',
                    padding: '3rem'
                }}>
                    {/* Aperçu du contenu qui apparaîtra */}
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '1rem'
                        }}>
                            Bon retour, {username}
                        </h1>
                    </div>
                </div>
            </SplashToHomeAnimation>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b1120',
            color: '#f8fafc',
            padding: '3rem',
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.8s ease-in',
            transform: showContent ? 'scale(1)' : 'scale(0.95)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '0.8s',
            transitionTimingFunction: 'ease-out'
        }}>
            {/* Bouton retour (vers login/logout) */}
            <button
                onClick={() => {
                    localStorage.removeItem('currentUser');
                    navigate('/desktop-login');
                }}
                style={{
                    position: 'fixed',
                    top: '2rem',
                    left: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    zIndex: 100
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(-5px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                <ArrowLeft size={20} />
                Déconnexion
            </button>

            {/* Bouton TEST pour forcer l'animation */}
            <button
                onClick={() => {
                    sessionStorage.removeItem('hasSeenSplash');
                    sessionStorage.setItem('fromDesktopLogin', 'true');
                    window.location.reload();
                }}
                style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid #3b82f6',
                    borderRadius: '0.75rem',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    zIndex: 100
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.color = '#3b82f6';
                }}
            >
                🎬 TEST ANIMATION
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    Bon retour, {username}
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
                    Que souhaitez-vous faire aujourd'hui ?
                </p>
            </div>

            {/* Cartes principales */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Munin Atlas */}
                <div
                    onClick={() => navigate('/desktop-munin')}
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <img src={LOGOS.munin} alt="Munin" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>
                                Munin Atlas
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                                Encyclopédie scientifique
                            </p>
                        </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Explorez des milliers d'entités scientifiques, de la biologie à la chimie.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                        <BookOpen size={20} />
                        <span style={{ fontWeight: 600 }}>Accéder à l'atlas</span>
                    </div>
                </div>

                {/* Hugin Lab */}
                <div
                    onClick={() => navigate('/desktop-hugin')}
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <img src={LOGOS.hugin} alt="Hugin" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', marginBottom: '0.5rem' }}>
                                Hugin Lab
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                                Gestion de laboratoire
                            </p>
                        </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Gérez vos expériences, cultures, protocoles et bien plus encore.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1' }}>
                        <FlaskConical size={20} />
                        <span style={{ fontWeight: 600 }}>Accéder au lab</span>
                    </div>
                </div>
            </div>

            {/* Section Beta Hub */}
            <div style={{
                maxWidth: '1400px',
                margin: '4rem auto 0',
                textAlign: 'center'
            }}>
                <div
                    onClick={() => navigate('/beta-hub')}
                    style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'inline-block',
                        minWidth: '400px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <Sparkles size={32} color="#8b5cf6" />
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.25rem' }}>
                                Beta Hub
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                Testez les nouvelles fonctionnalités
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopHome;
