import { useState } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, ArrowLeft, Calendar, Building, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import type { InternshipOffer } from '../../../types/university';

const InternshipBoard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [offers] = useState<InternshipOffer[]>([
    {
      id: '1',
      company: {
        name: 'BioTech Solutions',
        sector: 'Biotechnologie',
        location: 'Paris, France'
      },
      title: 'Stage en Recherche et Développement',
      description: 'Participation aux projets de recherche en biologie moléculaire et développement de nouveaux protocoles expérimentaux.',
      duration: 6,
      startDate: new Date('2024-09-01'),
      compensation: {
        type: 'paid',
        amount: 1200
      },
      status: 'open'
    },
    {
      id: '2',
      company: {
        name: 'PharmaCorp',
        sector: 'Pharmaceutique',
        location: 'Lyon, France'
      },
      title: 'Stage Contrôle Qualité',
      description: 'Analyse et contrôle qualité des produits pharmaceutiques, participation aux audits internes.',
      duration: 4,
      startDate: new Date('2024-07-01'),
      compensation: {
        type: 'paid',
        amount: 1000
      },
      status: 'open'
    },
    {
      id: '3',
      company: {
        name: 'Institut Pasteur',
        sector: 'Recherche',
        location: 'Paris, France'
      },
      title: 'Stage en Microbiologie',
      description: 'Étude des mécanismes de résistance aux antibiotiques, culture bactérienne et analyses moléculaires.',
      duration: 6,
      startDate: new Date('2024-09-15'),
      compensation: {
        type: 'paid',
        amount: 1400
      },
      status: 'open'
    },
    {
      id: '4',
      company: {
        name: 'GreenLab',
        sector: 'Environnement',
        location: 'Toulouse, France'
      },
      title: 'Stage Analyse Environnementale',
      description: 'Analyse de la qualité de l\'eau et des sols, prélèvements sur le terrain et analyses en laboratoire.',
      duration: 5,
      startDate: new Date('2024-08-01'),
      compensation: {
        type: 'paid',
        amount: 900
      },
      status: 'open'
    },
    {
      id: '5',
      company: {
        name: 'ChemLab Industries',
        sector: 'Chimie',
        location: 'Marseille, France'
      },
      title: 'Stage Synthèse Organique',
      description: 'Synthèse de molécules organiques, purification et caractérisation par spectroscopie.',
      duration: 6,
      startDate: new Date('2024-09-01'),
      compensation: {
        type: 'paid',
        amount: 1100
      },
      status: 'open'
    },
    {
      id: '6',
      company: {
        name: 'DataBio Analytics',
        sector: 'Bioinformatique',
        location: 'Bordeaux, France'
      },
      title: 'Stage Bioinformatique',
      description: 'Analyse de données génomiques, développement de pipelines d\'analyse et visualisation de données.',
      duration: 4,
      startDate: new Date('2024-07-15'),
      compensation: {
        type: 'paid',
        amount: 1300
      },
      status: 'open'
    },
    {
      id: '7',
      company: {
        name: 'MedTech Innovations',
        sector: 'Dispositifs Médicaux',
        location: 'Strasbourg, France'
      },
      title: 'Stage Développement Produit',
      description: 'Participation au développement de nouveaux dispositifs médicaux, tests et validation.',
      duration: 6,
      startDate: new Date('2024-09-01'),
      compensation: {
        type: 'paid',
        amount: 1250
      },
      status: 'filled'
    },
    {
      id: '8',
      company: {
        name: 'AgroScience',
        sector: 'Agronomie',
        location: 'Montpellier, France'
      },
      title: 'Stage Amélioration des Plantes',
      description: 'Recherche en amélioration génétique des plantes, culture in vitro et analyses moléculaires.',
      duration: 5,
      startDate: new Date('2024-08-15'),
      compensation: {
        type: 'paid',
        amount: 950
      },
      status: 'open'
    }
  ]);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.company.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = filterSector === 'all' || offer.company.sector === filterSector;
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    const matchesType = filterType === 'all' || 
                       (filterType === 'paid' && offer.compensation.type === 'paid') ||
                       (filterType === 'unpaid' && offer.compensation.type === 'unpaid');
    return matchesSearch && matchesSector && matchesStatus && matchesType;
  });

  const sectors = ['all', ...Array.from(new Set(offers.map(o => o.company.sector)))];

  const stats = {
    total: offers.length,
    open: offers.filter(o => o.status === 'open').length,
    filled: offers.filter(o => o.status === 'filled').length,
    avgCompensation: Math.round(
      offers.filter(o => o.compensation.type === 'paid')
        .reduce((sum, o) => sum + (o.compensation.amount || 0), 0) / 
      offers.filter(o => o.compensation.type === 'paid').length
    )
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Ouvert',
      closed: 'Fermé',
      filled: 'Pourvu'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#10b981',
      closed: '#ef4444',
      filled: '#f59e0b'
    };
    return colors[status] || '#64748b';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            <Briefcase size={40} />
            Plateforme de Stages
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Offres de stages et opportunités professionnelles
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
              <Briefcase size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total offres
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.open}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Offres ouvertes
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Users size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.filled}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Stages pourvus
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <DollarSign size={24} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
                {stats.avgCompensation}€
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Gratification moyenne
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
              placeholder="Rechercher un stage..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="input-field"
            style={{ width: '200px' }}
          >
            <option value="all">Tous les secteurs</option>
            {sectors.filter(s => s !== 'all').map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="filled">Pourvu</option>
            <option value="closed">Fermé</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les types</option>
            <option value="paid">Rémunéré</option>
            <option value="unpaid">Non rémunéré</option>
          </select>
        </div>

        {/* Offers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredOffers.map(offer => (
            <div
              key={offer.id}
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: offer.status === 'filled' ? 0.7 : 1
              }}
              onClick={() => alert(`Détails de l'offre "${offer.title}" - Fonctionnalité à venir`)}
              onMouseEnter={(e) => {
                if (offer.status !== 'filled') {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {offer.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Building size={16} style={{ color: 'var(--accent-hugin)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {offer.company.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-hugin)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {offer.company.location}
                    </span>
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: `${getStatusColor(offer.status)}20`,
                  border: `1px solid ${getStatusColor(offer.status)}`,
                  borderRadius: '1rem',
                  color: getStatusColor(offer.status),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {getStatusLabel(offer.status)}
                </span>
              </div>

              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem', 
                marginBottom: '1rem',
                lineHeight: 1.5
              }}>
                {offer.description}
              </p>

              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '0.25rem 0.6rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-hugin)'
                }}>
                  {offer.company.sector}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: 'var(--accent-hugin)' }} />
                  <span style={{ fontSize: '0.85rem' }}>
                    {offer.duration} mois
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: 'var(--accent-hugin)' }} />
                  <span style={{ fontSize: '0.85rem' }}>
                    {formatDate(offer.startDate)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <DollarSign size={16} style={{ color: 'var(--accent-hugin)' }} />
                  <span style={{ fontSize: '0.85rem' }}>
                    {offer.compensation.type === 'paid' 
                      ? `${offer.compensation.amount}€/mois` 
                      : 'Non rémunéré'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '0.9rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Postuler - Fonctionnalité à venir');
                  }}
                  disabled={offer.status === 'filled'}
                >
                  {offer.status === 'filled' ? 'Stage pourvu' : 'Postuler'}
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Voir les détails - Fonctionnalité à venir');
                  }}
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="card glass-panel" style={{ 
            padding: '3rem', 
            textAlign: 'center'
          }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aucune offre trouvée
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

export default InternshipBoard;
