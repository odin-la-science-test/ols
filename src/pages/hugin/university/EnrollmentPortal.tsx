import { useState } from 'react';
import { UserCheck, Upload, FileText, CheckCircle, Clock, XCircle, ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { EnrollmentApplication } from '../../../types/university';

const EnrollmentPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'new'>('applications');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [applications] = useState<EnrollmentApplication[]>([
    {
      id: '1',
      applicantId: 'APP001',
      programId: 'L3-BIO',
      academicYear: '2024-2025',
      status: 'under_review',
      submittedAt: new Date('2024-03-01'),
      documents: [
        { type: 'transcript', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'diploma', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'id', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'motivation_letter', url: '#', status: 'pending' }
      ]
    },
    {
      id: '2',
      applicantId: 'APP002',
      programId: 'M1-BIOTECH',
      academicYear: '2024-2025',
      status: 'accepted',
      submittedAt: new Date('2024-02-15'),
      reviewedAt: new Date('2024-02-28'),
      documents: [
        { type: 'transcript', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'diploma', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'cv', url: '#', status: 'approved', reviewedBy: 'admin' }
      ]
    },
    {
      id: '3',
      applicantId: 'APP003',
      programId: 'L2-CHIMIE',
      academicYear: '2024-2025',
      status: 'draft',
      documents: [
        { type: 'transcript', url: '#', status: 'pending' },
        { type: 'id', url: '#', status: 'pending' }
      ]
    },
    {
      id: '4',
      applicantId: 'APP004',
      programId: 'M2-MICRO',
      academicYear: '2024-2025',
      status: 'rejected',
      submittedAt: new Date('2024-02-20'),
      reviewedAt: new Date('2024-03-05'),
      documents: [
        { type: 'transcript', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'diploma', url: '#', status: 'rejected', reviewedBy: 'admin', comments: 'Document illisible' }
      ]
    },
    {
      id: '5',
      applicantId: 'APP005',
      programId: 'L3-BIO',
      academicYear: '2024-2025',
      status: 'waitlist',
      submittedAt: new Date('2024-03-10'),
      documents: [
        { type: 'transcript', url: '#', status: 'approved', reviewedBy: 'admin' },
        { type: 'diploma', url: '#', status: 'approved', reviewedBy: 'admin' }
      ]
    }
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.applicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.programId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#94a3b8',
      submitted: '#3b82f6',
      under_review: '#f59e0b',
      accepted: '#10b981',
      rejected: '#ef4444',
      waitlist: '#8b5cf6'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumis',
      under_review: 'En révision',
      accepted: 'Accepté',
      rejected: 'Refusé',
      waitlist: 'Liste d\'attente'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={20} />;
      case 'rejected': return <XCircle size={20} />;
      case 'under_review': return <Clock size={20} />;
      default: return <FileText size={20} />;
    }
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
            <UserCheck size={40} />
            Portail d'Inscriptions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Gestion des candidatures et admissions
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
              <FileText size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total candidatures
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Clock size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.pending}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              En révision
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.accepted}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Acceptées
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <XCircle size={24} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                {stats.rejected}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Refusées
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'applications' ? '3px solid var(--accent-hugin)' : '3px solid transparent',
              color: activeTab === 'applications' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'applications' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Mes Candidatures
          </button>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'new' ? '3px solid var(--accent-hugin)' : '3px solid transparent',
              color: activeTab === 'new' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'new' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Nouvelle Candidature
          </button>
        </div>

        {activeTab === 'applications' && (
          <>
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
                  placeholder="Rechercher une candidature..."
                  className="input-field"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
                style={{ width: '200px' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="under_review">En révision</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="waitlist">Liste d'attente</option>
              </select>
            </div>

            {/* Applications List */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  className="card glass-panel"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => alert(`Détails de la candidature ${app.applicantId} - Fonctionnalité à venir`)}
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
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {app.applicantId}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {app.programId} • {app.academicYear}
                      </p>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: `${getStatusColor(app.status)}20`,
                      border: `1px solid ${getStatusColor(app.status)}`,
                      borderRadius: '1rem',
                      color: getStatusColor(app.status),
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      {getStatusIcon(app.status)}
                      {getStatusLabel(app.status)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Documents ({app.documents.length})
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {app.documents.map((doc, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.25rem 0.6rem',
                            background: doc.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                       doc.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                       'rgba(100, 116, 139, 0.1)',
                            border: `1px solid ${doc.status === 'approved' ? '#10b981' : 
                                                 doc.status === 'rejected' ? '#ef4444' : '#64748b'}`,
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            color: doc.status === 'approved' ? '#10b981' : 
                                   doc.status === 'rejected' ? '#ef4444' : '#94a3b8'
                          }}
                        >
                          {doc.type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {app.submittedAt && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Soumis le {app.submittedAt.toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="card glass-panel" style={{ 
                padding: '3rem', 
                textAlign: 'center'
              }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Aucune candidature trouvée
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'new' && (
          <div className="card glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Nouvelle Candidature
            </h2>
            
            <div style={{
              padding: '2rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <Plus size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-hugin)' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                Formulaire de Candidature
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Cette fonctionnalité sera bientôt disponible
              </p>
              <button
                className="btn-primary"
                onClick={() => alert('Formulaire de candidature - Fonctionnalité à venir')}
              >
                Commencer une Candidature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentPortal;
