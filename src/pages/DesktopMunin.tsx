import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Grid, Activity, Dna, FlaskConical, Calculator, Users, Settings } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getCategory = (id: string): string => {
        const medical = ['anesthesie', 'cardiologie', 'chirurgie', 'geriatrie', 'immunologie', 'neurologie', 'odontologie', 'oncologie', 'orthophonie', 'pediatrie', 'pharmacie', 'pharmacologie', 'psychiatrie', 'radiologie', 'sante-publique', 'biomedicales', 'toxicologie', 'virologie'];
        const life = ['agronomie', 'agroecologie', 'astrobiologie', 'bacteriologie', 'bio-ingenierie', 'biochimie', 'bioinformatique', 'biologie', 'biophysique', 'biostatistique', 'biotechnologies', 'botanique', 'chronobiologie', 'ecologie', 'entomologie', 'ethologie', 'genetique', 'genomique', 'herpetologie', 'ichtyologie', 'limnologie', 'mammalogie', 'microbiologie', 'mycologie', 'neurobiologie', 'neurosciences', 'oceanographie-biologique', 'ornithologie', 'paleontologie', 'parasitologie', 'physiologie', 'proteomique', 'zoologie'];
        const physical = ['acoustique', 'astrometrie', 'astronomie', 'astrophysique', 'chimie', 'climatologie', 'cosmologie', 'cristallographie', 'geochimie', 'geologie', 'geomorphologie', 'geophysique', 'hydrogeologie', 'meteorologie', 'mineralogie', 'oceanographie', 'optique', 'petrologie', 'physique', 'planetologie', 'seismologie', 'spectroscopie', 'thermodynamique', 'volcanologie'];
        const formal = ['algorithmique', 'algebre', 'analyse-mathematique', 'apprentissage-automatique', 'cryptographie', 'cybersecurite', 'donnees', 'geometrie', 'informatique', 'intelligence-artificielle', 'logique', 'mathematiques', 'optimisation', 'probabilites', 'operationnelle', 'reseaux', 'statistique', 'theorie', 'topologie'];
        const social = ['anthropologie', 'archeologie', 'criminologie', 'demographie', 'ethnologie', 'geographie', 'histoire', 'linguistique', 'paleoanthropologie', 'prehistoire', 'psycholinguistique', 'psychologie', 'sociologie', 'politique', 'internationales'];
        const engineering = ['automatique', 'civil', 'materiaux', 'procedes', 'industriel', 'logiciel', 'mecanique', 'nucleaire', 'electrique', 'electronique', 'energetique', 'mecatronique', 'nanotechnologies', 'robotique', 'telecommunications'];

        if (medical.some(k => id.includes(k))) return 'Medical Sciences';
        if (life.some(k => id.includes(k))) return 'Life Sciences';
        if (physical.some(k => id.includes(k))) return 'Physical & Earth';
        if (formal.some(k => id.includes(k))) return 'Formal Sciences';
        if (social.some(k => id.includes(k))) return 'Social Sciences';
        if (engineering.some(k => id.includes(k))) return 'Engineering & Tech';
        return 'General Sciences';
    };

    const categories = [
        { name: 'All', icon: <Grid size={20} />, color: '#64748b', desc: 'Toutes les disciplines' },
        { name: 'Medical Sciences', icon: <Activity size={20} />, color: '#ef4444', desc: 'Médecine et santé' },
        { name: 'Life Sciences', icon: <Dna size={20} />, color: '#10b981', desc: 'Biologie et vie' },
        { name: 'Physical & Earth', icon: <FlaskConical size={20} />, color: '#3b82f6', desc: 'Physique et terre' },
        { name: 'Formal Sciences', icon: <Calculator size={20} />, color: '#8b5cf6', desc: 'Maths et info' },
        { name: 'Social Sciences', icon: <Users size={20} />, color: '#f59e0b', desc: 'Sciences sociales' },
        { name: 'Engineering & Tech', icon: <Settings size={20} />, color: '#06b6d4', desc: 'Ingénierie et tech' }
    ];

    const disciplines = disciplinesData as Discipline[];
    
    const categorizedDisciplines = disciplines.map(d => ({
        ...d,
        category: getCategory(d.id)
    })).filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeCategory === 'All' || d.category === activeCategory)
    );

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
                        src={LOGOS.munin} 
                        alt="Munin Atlas Logo" 
                        style={{ 
                            width: '400px', 
                            height: '400px', 
                            objectFit: 'contain', 
                            marginBottom: '0.5rem', 
                            filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))'
                        }} 
                    />
                    
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Munin Atlas
                    </h1>
                    
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        250+ domaines scientifiques disponibles
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
                                color: '#10b981' 
                            }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une discipline..."
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
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: activeCategory === cat.name ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                                    color: activeCategory === cat.name ? 'white' : '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeCategory !== cat.name) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeCategory !== cat.name) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                            >
                                {cat.icon}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Grille de disciplines */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {categorizedDisciplines.map((discipline: Discipline) => (
                        <div
                            key={discipline.id}
                            onClick={() => navigate(`/munin/${discipline.id}`)}
                            style={{
                                background: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#10b981',
                                marginBottom: '0.75rem'
                            }}>
                                {discipline.name}
                            </h3>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.9rem',
                                lineHeight: 1.6
                            }}>
                                {discipline.description}
                            </p>
                            <div style={{
                                marginTop: '1rem',
                                fontSize: '0.85rem',
                                color: '#10b981',
                                fontWeight: 600
                            }}>
                                {discipline.entities?.length || 0} entités →
                            </div>
                        </div>
                    ))}
                </div>

                {categorizedDisciplines.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: '#64748b'
                    }}>
                        <p style={{ fontSize: '1.25rem' }}>Aucune discipline trouvée</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopMunin;
