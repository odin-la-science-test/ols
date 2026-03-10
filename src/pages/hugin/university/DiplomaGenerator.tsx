import { useState } from 'react';
import { Award, Download, Search, Filter, ArrowLeft, QrCode, CheckCircle, FileText, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { Diploma } from '../../../types/university';

const DiplomaGenerator = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMention, setFilterMention] = useState<string>('all');

  const [diplomas] = useState<Diploma[]>([
    {
      id: '1',
      type: 'licence',
      studentId: 'S2021001',
      studentName: 'Marie Dupont',
      programId: 'L3-BIO',
      programName: 'Licence Biologie',
      finalGrade: 15.8,
      mention: 'bien',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-001',
      qrCode: 'QR-2024-001'
    },
    {
      id: '2',
      type: 'master',
      studentId: 'S2022045',
      studentName: 'Thomas Martin',
      programId: 'M2-BIOTECH',
      programName: 'Master Biotechnologies',
      finalGrade: 17.2,
      mention: 'tres_bien',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-002',
      qrCode: 'QR-2024-002'
    },
    {
      id: '3',
      type: 'licence',
      studentId: 'S2021089',
      studentName: 'Sophie Bernard',
      programId: 'L3-CHIMIE',
      programName: 'Licence Chimie',
      finalGrade: 13.5,
      mention: 'assez_bien',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-003',
      qrCode: 'QR-2024-003'
    },
    {
      id: '4',
      type: 'master',
      studentId: 'S2022012',
      studentName: 'Lucas Petit',
      programId: 'M2-MICRO',
      programName: 'Master Microbiologie',
      finalGrade: 18.5,
      mention: 'excellent',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-004',
      qrCode: 'QR-2024-004'
    },
    {
      id: '5',
      type: 'doctorat',
      studentId: 'S2019034',
      studentName: 'Emma Rousseau',
      programId: 'DOC-BIO',
      programName: 'Doctorat Biologie',
      finalGrade: 16.8,
      mention: 'tres_bien',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-005',
      qrCode: 'QR-2024-005'
    },
    {
      id: '6',
      type: 'licence',
      studentId: 'S2021156',
      studentName: 'Alexandre Laurent',
      programId: 'L3-BIO',
      programName: 'Licence Biologie',
      finalGrade: 12.3,
      mention: 'passable',
      graduationDate: new Date('2024-06-30'),
      issueDate: new Date('2024-07-15'),
      registrationNumber: 'DIP-2024-006',
      qrCode: 'QR-2024-006'
    }
  ]);

  const filteredDiplomas = diplomas.filter(diploma => {
    const matchesSearch = diploma.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diploma.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diploma.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diploma.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || diploma.type === filterType;
    const matchesMention = filterMention === 'all' || diploma.mention === filterMention;
    return matchesSearch && matchesType && matchesMention;
  });

  const stats = {
    total: diplomas.length,
    licence: diplomas.filter(d => d.type === 'licence').length,
    master: diplomas.filter(d => d.type === 'master').length,
    doctorat: diplomas.filter(d => d.type === 'doctorat').length
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      licence: 'Licence',
      master: 'Master',
      doctorat: 'Doctorat',
      certificate: 'Certificat'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      licence: '#3b82f6',
      master: '#8b5cf6',
      doctorat: '#ec4899',
      certificate: '#10b981'
    };
    return colors[type] || '#6366f1';
  };

  const getMentionLabel = (mention: string) => {
    const labels: Record<string, string> = {
      passable: 'Passable',
      assez_bien: 'Assez Bien',
      bien: 'Bien',
      tres_bien: 'Très Bien',
      excellent: 'Excellent'
    };
    return labels[mention] || mention;
  };

  const getMentionColor = (mention: string) => {
    const colors: Record<string, string> = {
      passable: '#94a3b8',
      assez_bien: '#3b82f6',
      bien: '#10b981',
      tres_bien: '#f59e0b',
      excellent: '#ec4899'
    };
    return colors[mention] || '#6366f1';
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
            <Award size={40} />
            Gestion des Diplômes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Génération, validation et registre
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
              <Award size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total diplômes
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <FileText size={24} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.licence}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Licences
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Award size={24} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
                {stats.master}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Masters
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Award size={24} style={{ color: '#ec4899' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ec4899' }}>
                {stats.doctorat}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Doctorats
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
              placeholder="Rechercher un diplôme..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les types</option>
            <option value="licence">Licence</option>
            <option value="master">Master</option>
            <option value="doctorat">Doctorat</option>
          </select>

          <select
            value={filterMention}
            onChange={(e) => setFilterMention(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Toutes les mentions</option>
            <option value="passable">Passable</option>
            <option value="assez_bien">Assez Bien</option>
            <option value="bien">Bien</option>
            <option value="tres_bien">Très Bien</option>
            <option value="excellent">Excellent</option>
          </select>
        </div>

        {/* Diplomas Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredDiplomas.map(diploma => (
            <div
              key={diploma.id}
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => alert(`Détails du diplôme ${diploma.registrationNumber} - Fonctionnalité à venir`)}
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
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {diploma.studentName}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {diploma.studentId}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: `${getTypeColor(diploma.type)}20`,
                    border: `1px solid ${getTypeColor(diploma.type)}`,
                    borderRadius: '1rem',
                    color: getTypeColor(diploma.type),
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {getTypeLabel(diploma.type)}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {diploma.programName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {diploma.programId}
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
                    Note finale
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                    {diploma.finalGrade.toFixed(1)}/20
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Mention
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: `${getMentionColor(diploma.mention)}20`,
                    border: `1px solid ${getMentionColor(diploma.mention)}`,
                    borderRadius: '0.5rem',
                    color: getMentionColor(diploma.mention),
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    {getMentionLabel(diploma.mention)}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Calendar size={14} />
                    {diploma.graduationDate.toLocaleDateString('fr-FR')}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    N° {diploma.registrationNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Télécharger le diplôme - Fonctionnalité à venir');
                    }}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Afficher le QR code - Fonctionnalité à venir');
                    }}
                  >
                    <QrCode size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDiplomas.length === 0 && (
          <div className="card glass-panel" style={{ 
            padding: '3rem', 
            textAlign: 'center'
          }}>
            <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aucun diplôme trouvé
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

export default DiplomaGenerator;
