import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Search, Beaker, Calendar, Mail, HardDrive, Brain, Book,
    Activity, Calculator, Dna, Camera, Layers, ShieldAlert, TrendingUp, Grid
} from 'lucide-react';
import { LOGOS } from '../utils/logoCache';

const DesktopHugin = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tout');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const modules = [
        // Core
        { id: 'messaging', name: 'Messagerie', desc: 'Gestion des messages et communications', icon: <Mail size={24} />, category: 'Core', path: '/hugin/messaging' },
        { id: 'planning', name: 'Planning', desc: 'Planification et calendrier', icon: <Calendar size={24} />, category: 'Core', path: '/hugin/planning' },
        { id: 'documents', name: 'Documents', desc: 'Gestion documentaire', icon: <HardDrive size={24} />, category: 'Core', path: '/hugin/documents' },
        { id: 'inventory', name: 'Inventaire', desc: 'Gestion de l\'inventaire', icon: <Beaker size={24} />, category: 'Core', path: '/hugin/inventory' },
        { id: 'tableur', name: 'Tableur', desc: 'Tableur scientifique', icon: <Grid size={24} />, category: 'Core', path: '/hugin/tableur' },
        
        // Lab Management
        { id: 'safety', name: 'Sécurité', desc: 'Protocoles de sécurité', icon: <ShieldAlert size={24} />, category: 'Lab', path: '/hugin/safety' },
        { id: 'culture_cells', name: 'Culture cellulaire', desc: 'Gestion des cultures cellulaires', icon: <Activity size={24} />, category: 'Lab', path: '/hugin/culture-cells' },
        
        // Research
        { id: 'research', name: 'Recherche', desc: 'Projets de recherche', icon: <Brain size={24} />, category: 'Research', path: '/hugin/research' },
        { id: 'notebook', name: 'Cahier de labo', desc: 'Cahier de laboratoire numérique', icon: <Book size={24} />, category: 'Research', path: '/hugin/notebook' },
        
        // Analysis
        { id: 'bioanalyzer', name: 'BioAnalyzer', desc: 'Analyse de données biologiques', icon: <Dna size={24} />, category: 'Analysis', path: '/hugin/bioanalyzer' },
        { id: 'imageanalyzer', name: 'Analyse d\'images', desc: 'Traitement d\'images scientifiques', icon: <Camera size={24} />, category: 'Analysis', path: '/hugin/imageanalyzer' },
        { id: 'statistics', name: 'Statistiques', desc: 'Analyses statistiques', icon: <TrendingUp size={24} />, category: 'Analysis', path: '/hugin/statistics' },
        { id: 'proteinfold', name: 'Repliement protéique', desc: 'Prédiction de structure', icon: <Layers size={24} />, category: 'Analysis', path: '/hugin/protein-fold' },
        { id: 'buffercalc', name: 'Calcul de tampons', desc: 'Préparation de solutions tampons', icon: <Beaker size={24} />, category: 'Analysis', path: '/hugin/buffer-calc' },
        { id: 'biotools', name: 'Outils Bio', desc: 'Calculateurs et convertisseurs', icon: <Calculator size={24} />, category: 'Analysis', path: '/hugin/biotools' }
    ];

    const categories = ['Tout', 'Core', 'Lab', 'Research', 'Analysis'];

    const filteredModules = modules.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Tout' || m.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#ffffff', paddingBottom: '4rem' }}>
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

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {/* Header */}
                <header style={{ marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                        src={LOGOS.hugin} 
                        alt="Hugin Lab Logo" 
                        style={{ 
                            width: '400px', 
                            height: '400px', 
                            objectFit: 'contain', 
                            marginBottom: '0.5rem', 
                            filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px rgba(99, 102, 241, 0.3))' 
                        }} 
                    />
                    
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Hugin Lab
                    </h1>
                    
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        Outils de laboratoire avancés
                    </p>

                    {/* Barre de recherche */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                        <Search
                            size={20}
                            style={{ 
                                position: 'absolute', 
                                left: '1.25rem', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#6366f1' 
                            }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un module..."
                            style={{
                                width: '100%',
                                paddingLeft: '3.5rem',
                                height: '54px',
                                fontSize: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '1.5rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                color: '#ffffff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Filtres catégories */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: activeCategory === cat ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                                    color: activeCategory === cat ? 'white' : '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeCategory !== cat) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeCategory !== cat) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Grille de modules */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredModules.map((module) => (
                        <div
                            key={module.id}
                            onClick={() => navigate(module.path)}
                            style={{
                                background: 'rgba(99, 102, 241, 0.05)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ color: '#6366f1' }}>
                                {module.icon}
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#6366f1',
                                    marginBottom: '0.5rem'
                                }}>
                                    {module.name}
                                </h3>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6
                                }}>
                                    {module.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredModules.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: '#64748b'
                    }}>
                        <p style={{ fontSize: '1.25rem' }}>Aucun module trouvé</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopHugin;
