import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, FlaskConical, Beaker, Calendar, FileText, Database, TestTube, Microscope, Calculator, BookOpen } from 'lucide-react';
import { LOGOS } from '../utils/logoCache';

const DesktopHugin = () => {
    const navigate = useNavigate();

    // Scroll en haut au chargement
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const modules = [
        { id: 'lab-notebook', name: 'Cahier de Laboratoire', icon: <BookOpen size={32} />, path: '/hugin/lab-notebook', color: '#3b82f6' },
        { id: 'protocol-builder', name: 'Créateur de Protocoles', icon: <FileText size={32} />, path: '/hugin/protocol-builder', color: '#8b5cf6' },
        { id: 'chemical-inventory', name: 'Inventaire Chimique', icon: <Database size={32} />, path: '/hugin/chemical-inventory', color: '#ec4899' },
        { id: 'culture-cells', name: 'Culture Cellulaire', icon: <Microscope size={32} />, path: '/hugin/culture-cells', color: '#10b981' },
        { id: 'experiment-planner', name: 'Planificateur d\'Expériences', icon: <Calendar size={32} />, path: '/hugin/experiment-planner', color: '#f59e0b' },
        { id: 'equipment-booking', name: 'Réservation d\'Équipements', icon: <TestTube size={32} />, path: '/hugin/equipment-booking', color: '#06b6d4' },
        { id: 'buffer-calc', name: 'Calculateur de Tampons', icon: <Calculator size={32} />, path: '/hugin/buffer-calc', color: '#6366f1' },
        { id: 'protein-calculator', name: 'Calculateur de Protéines', icon: <Beaker size={32} />, path: '/hugin/protein-calculator', color: '#14b8a6' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b1120',
            color: '#f8fafc',
            padding: '3rem'
        }}>
            {/* Bouton retour */}
            <button
                onClick={() => navigate('/desktop-home')}
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
                Retour
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                <img src={LOGOS.hugin} alt="Hugin" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1rem' }} />
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#6366f1',
                    marginBottom: '0.5rem'
                }}>
                    Hugin Lab
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
                    Gestion complète de laboratoire
                </p>
            </div>

            {/* Grille de modules */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {modules.map((module) => (
                    <div
                        key={module.id}
                        onClick={() => navigate(module.path)}
                        style={{
                            background: `linear-gradient(135deg, ${module.color}15, ${module.color}08)`,
                            border: `1px solid ${module.color}40`,
                            borderRadius: '1rem',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = `${module.color}80`;
                            e.currentTarget.style.boxShadow = `0 10px 30px ${module.color}30`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = `${module.color}40`;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            color: module.color,
                            marginBottom: '1rem'
                        }}>
                            {module.icon}
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: module.color,
                            marginBottom: '0.5rem'
                        }}>
                            {module.name}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Section Beta */}
            <div style={{
                maxWidth: '1400px',
                margin: '4rem auto 0',
                textAlign: 'center'
            }}>
                <button
                    onClick={() => navigate('/beta-hub')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '0.75rem',
                        color: '#8b5cf6',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    }}
                >
                    Accéder au Beta Hub
                </button>
            </div>
        </div>
    );
};

export default DesktopHugin;
