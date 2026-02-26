import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { LOGOS } from '../utils/logoCache';
import disciplinesData from '../data/disciplines.json';

interface Discipline {
    id: string;
    name: string;
    description: string;
    icon?: string;
    entities?: any[];
}

const DesktopMunin = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Scroll en haut au chargement
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const disciplines = disciplinesData as Discipline[];
    
    const filteredDisciplines = disciplines.filter((discipline: Discipline) =>
        discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discipline.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <img src={LOGOS.munin} alt="Munin" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1rem' }} />
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#10b981',
                    marginBottom: '0.5rem'
                }}>
                    Munin Atlas
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
                    Encyclopédie scientifique complète
                </p>
            </div>

            {/* Barre de recherche */}
            <div style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
                <div style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Search size={20} style={{
                        position: 'absolute',
                        left: '1.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }} />
                    <input
                        type="text"
                        placeholder="Rechercher une discipline..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1.25rem 1.5rem 1.25rem 4rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#f8fafc',
                            fontSize: '1.1rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Grille de disciplines */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {filteredDisciplines.map((discipline: Discipline) => (
                    <div
                        key={discipline.id}
                        onClick={() => navigate(`/munin/${discipline.id}`)}
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            fontSize: '2.5rem',
                            marginBottom: '1rem'
                        }}>
                            {discipline.icon}
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#10b981',
                            marginBottom: '0.75rem'
                        }}>
                            {discipline.name}
                        </h3>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            lineHeight: 1.6
                        }}>
                            {discipline.description}
                        </p>
                        <div style={{
                            marginTop: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            <BookOpen size={16} />
                            {discipline.entities?.length || 0} entités
                        </div>
                    </div>
                ))}
            </div>

            {filteredDisciplines.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#64748b'
                }}>
                    <p style={{ fontSize: '1.25rem' }}>Aucune discipline trouvée</p>
                </div>
            )}
        </div>
    );
};

export default DesktopMunin;
