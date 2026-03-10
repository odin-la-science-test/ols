import { useState } from 'react';
import { Globe, MapPin, Calendar, Users, Plane, Search, Filter, ArrowLeft, Award, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import type { ExchangeProgram } from '../../../types/university';

const MobilityPrograms = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');

  const [programs] = useState<ExchangeProgram[]>([
    {
      id: '1',
      name: 'Erasmus+ Sciences de la Vie',
      type: 'erasmus',
      partnerUniversity: {
        name: 'Universität Heidelberg',
        country: 'Allemagne',
        city: 'Heidelberg'
      },
      availablePlaces: 5,
      duration: '1 semestre'
    },
    {
      id: '2',
      name: 'Échange Bilatéral Biotechnologies',
      type: 'bilateral',
      partnerUniversity: {
        name: 'ETH Zürich',
        country: 'Suisse',
        city: 'Zürich'
      },
      availablePlaces: 3,
      duration: '1 an'
    },
    {
      id: '3',
      name: 'Summer School Microbiologie',
      type: 'summer',
      partnerUniversity: {
        name: 'University of Cambridge',
        country: 'Royaume-Uni',
        city: 'Cambridge'
      },
      availablePlaces: 10,
      duration: '6 semaines'
    },
    {
      id: '4',
      name: 'Erasmus+ Chimie',
      type: 'erasmus',
      partnerUniversity: {
        name: 'Universitat de Barcelona',
        country: 'Espagne',
        city: 'Barcelone'
      },
      availablePlaces: 4,
      duration: '1 semestre'
    },
    {
      id: '5',
      name: 'Programme de Recherche',
      type: 'research',
      partnerUniversity: {
        name: 'Karolinska Institutet',
        country: 'Suède',
        city: 'Stockholm'
      },
      availablePlaces: 2,
      duration: '6 mois'
    },
    {
      id: '6',
      name: 'Erasmus+ Bioinformatique',
      type: 'erasmus',
      partnerUniversity: {
        name: 'Università di Bologna',
        country: 'Italie',
        city: 'Bologne'
      },
      availablePlaces: 3,
      duration: '1 semestre'
    },
    {
      id: '7',
      name: 'Échange Bilatéral Pharmacologie',
      type: 'bilateral',
      partnerUniversity: {
        name: 'KU Leuven',
        country: 'Belgique',
        city: 'Louvain'
      },
      availablePlaces: 4,
      duration: '1 an'
    },
    {
      id: '8',
      name: 'Summer School Génétique',
      type: 'summer',
      partnerUniversity: {
        name: 'University of Copenhagen',
        country: 'Danemark',
        city: 'Copenhague'
      },
      availablePlaces: 8,
      duration: '4 semaines'
    },
    {
      id: '9',
      name: 'Programme de Recherche Environnement',
      type: 'research',
      partnerUniversity: {
        name: 'Wageningen University',
        country: 'Pays-Bas',
        city: 'Wageningen'
      },
      availablePlaces: 3,
      duration: '6 mois'
    },
    {
      id: '10',
      name: 'Erasmus+ Biologie Marine',
      type: 'erasmus',
      partnerUniversity: {
        name: 'Universidade de Lisboa',
        country: 'Portugal',
        city: 'Lisbonne'
      },
      availablePlaces: 5,
      duration: '1 semestre'
    }
  ]);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.partnerUniversity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.partnerUniversity.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.partnerUniversity.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || program.type === filterType;
    const matchesCountry = filterCountry === 'all' || program.partnerUniversity.country === filterCountry;
    return matchesSearch && matchesType && matchesCountry;
  });

  const countries = ['all', ...Array.from(new Set(programs.map(p => p.partnerUniversity.country)))];

  const stats = {
    total: programs.length,
    erasmus: programs.filter(p => p.type === 'erasmus').length,
    bilateral: programs.filter(p => p.type === 'bilateral').length,
    totalPlaces: programs.reduce((sum, p) => sum + p.availablePlaces, 0)
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      erasmus: 'Erasmus+',
      bilateral: 'Bilatéral',
      summer: 'Summer School',
      research: 'Recherche'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      erasmus: '#3b82f6',
      bilateral: '#8b5cf6',
      summer: '#f59e0b',
      research: '#10b981'
    };
    return colors[type] || '#6366f1';
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Allemagne': '🇩🇪',
      'Suisse': '🇨🇭',
      'Royaume-Uni': '🇬🇧',
      'Espagne': '🇪🇸',
      'Suède': '🇸🇪',
      'Italie': '🇮🇹',
      'Belgique': '🇧🇪',
      'Danemark': '🇩🇰',
      'Pays-Bas': '🇳🇱',
      'Portugal': '🇵🇹'
    };
    return flags[country] || '🌍';
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/hugin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={20} />
          Retour à Hugin
        </button>

        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Globe size={40} />
            Mobilité Internationale
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Programmes d'échange et opportunités internationales
          </p>
        </header>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Globe size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Programmes disponibles
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Award size={24} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.erasmus}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Programmes Erasmus+
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Plane size={24} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
                {stats.bilateral}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Échanges bilatéraux
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Users size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.totalPlaces}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Places disponibles
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un programme..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '200px' }}
          >
            <option value="all">Tous les types</option>
            <option value="erasmus">Erasmus+</option>
            <option value="bilateral">Bilatéral</option>
            <option value="summer">Summer School</option>
            <option value="research">Recherche</option>
          </select>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="input-field"
            style={{ width: '200px' }}
          >
            <option value="all">Tous les pays</option>
            {countries.filter(c => c !== 'all').map(country => (
              <option key={country} value={country}>
                {getCountryFlag(country)} {country}
              </option>
            ))}
          </select>
        </div>

        {/* Programs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredPrograms.map(program => (
            <div
              key={program.id}
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => alert(`Détails du programme "${program.name}" - Fonctionnalité à venir`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {program.name}
                  </h3>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: `${getTypeColor(program.type)}20`,
                  border: `1px solid ${getTypeColor(program.type)}`,
                  borderRadius: '1rem',
                  color: getTypeColor(program.type),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {getTypeLabel(program.type)}
                </span>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {getCountryFlag(program.partnerUniversity.country)}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {program.partnerUniversity.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {program.partnerUniversity.city}, {program.partnerUniversity.country}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Durée
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--accent-hugin)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {program.duration}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Places disponibles
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: 'var(--accent-hugin)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {program.availablePlaces}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Candidater - Fonctionnalité à venir');
                }}
              >
                <CheckCircle size={16} />
                Candidater
              </button>
            </div>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="card glass-panel" style={{ 
            padding: '3rem', 
            textAlign: 'center'
          }}>
            <Globe size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aucun programme trouvé
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilityPrograms;
