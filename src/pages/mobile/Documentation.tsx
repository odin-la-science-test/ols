import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Search, ChevronRight, FileText,
    Video, Code, HelpCircle, Download
} from 'lucide-react';

const MobileDocumentation = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const sections = [
        {
            icon: <BookOpen size={24} />,
            title: 'Guide de démarrage',
            desc: 'Premiers pas avec Odin',
            color: '#10b981',
            articles: 5
        },
        {
            icon: <FileText size={24} />,
            title: 'Munin Atlas',
            desc: 'Documentation complète',
            color: '#6366f1',
            articles: 12
        },
        {
            icon: <Code size={24} />,
            title: 'Hugin Lab',
            desc: 'Gestion de laboratoire',
            color: '#8b5cf6',
            articles: 18
        },
        {
            icon: <Video size={24} />,
            title: 'Tutoriels vidéo',
            desc: 'Guides visuels',
            color: '#f59e0b',
            articles: 8
        },
        {
            icon: <HelpCircle size={24} />,
            title: 'FAQ',
            desc: 'Questions fréquentes',
            color: '#3b82f6',
            articles: 25
        },
        {
            icon: <Download size={24} />,
            title: 'Ressources',
            desc: 'Téléchargements',
            color: '#ec4899',
            articles: 6
        }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
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
                        Documentation
                    </h1>
                </div>

                {/* Search */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search size={20} style={{
                        position: 'absolute',
                        left: '1rem',
                        color: '#64748b'
                    }} />
                    <input
                        type="text"
                        placeholder="Rechercher dans la documentation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 3rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
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
                    Centre d'aide
                </h2>
                <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Trouvez toutes les réponses à vos questions
                </p>
            </div>

            {/* Sections */}
            <div style={{ padding: '0 1.5rem' }}>
                {sections.map((section, i) => (
                    <div
                        key={i}
                        onClick={() => {/* Navigate to section */}}
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer'
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
                            flexShrink: 0
                        }}>
                            {React.cloneElement(section.icon, { color: section.color })}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {section.title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                {section.desc} • {section.articles} articles
                            </p>
                        </div>
                        <ChevronRight size={20} color="#64748b" />
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: '2rem'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                }}>
                    Liens rapides
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a href="#" style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ChevronRight size={16} />
                        Guide de démarrage rapide
                    </a>
                    <a href="#" style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ChevronRight size={16} />
                        API Documentation
                    </a>
                    <a href="#" style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ChevronRight size={16} />
                        Contacter le support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MobileDocumentation;
