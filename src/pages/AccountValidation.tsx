import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Building, GraduationCap, FileText, Eye, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import { 
  getPendingRequests, 
  getValidationRequests, 
  updateRequestStatus,
  getValidationStats 
} from '../utils/accountValidation';
import type { AccountValidationRequest } from '../types/accountValidation';

const AccountValidation = () => {
  const [requests, setRequests] = useState<AccountValidationRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<AccountValidationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState(getValidationStats());

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = () => {
    const allRequests = getValidationRequests();
    const filtered = filter === 'all' 
      ? allRequests 
      : allRequests.filter(r => r.status === filter);
    
    setRequests(filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()));
    setStats(getValidationStats());
  };

  const handleApprove = async (requestId: string) => {
    const currentUser = localStorage.getItem('currentUser') || 'admin';
    const success = await updateRequestStatus(requestId, {
      requestId,
      decision: 'approve',
      reviewedBy: currentUser
    });

    if (success) {
      alert('✅ Compte approuvé et créé avec succès !');
      loadRequests();
      setSelectedRequest(null);
    } else {
      alert('❌ Erreur lors de la création du compte');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de refus');
      return;
    }

    const currentUser = localStorage.getItem('currentUser') || 'admin';
    const success = await updateRequestStatus(requestId, {
      requestId,
      decision: 'reject',
      reason: rejectionReason,
      reviewedBy: currentUser
    });

    if (success) {
      alert('❌ Demande refusée');
      loadRequests();
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={20} />;
      case 'approved': return <CheckCircle size={20} />;
      case 'rejected': return <XCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <CheckCircle size={40} />
            Validation des Comptes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Gérer les demandes de création de compte
          </p>
        </header>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Clock size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>En attente</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <CheckCircle size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{stats.approved}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Approuvés</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <XCircle size={24} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{stats.rejected}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Refusés</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <User size={24} style={{ color: 'var(--accent-hugin)', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{stats.total}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === f ? 'var(--accent-hugin)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${filter === f ? 'var(--accent-hugin)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '0.5rem',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvées' : 'Refusées'}
            </button>
          ))}
        </div>

        {/* Liste des demandes */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map(request => (
            <div
              key={request.id}
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `1px solid ${getStatusColor(request.status)}40`
              }}
              onClick={() => setSelectedRequest(request)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${getStatusColor(request.status)}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    {request.isStudent ? (
                      <GraduationCap size={24} style={{ color: '#3b82f6' }} />
                    ) : request.enterpriseType === 'public' ? (
                      <Building size={24} style={{ color: '#8b5cf6' }} />
                    ) : (
                      <User size={24} style={{ color: '#6b7280' }} />
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {request.fullName}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {request.email}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: request.isStudent ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                      border: `1px solid ${request.isStudent ? '#3b82f6' : '#8b5cf6'}`,
                      borderRadius: '1rem',
                      color: request.isStudent ? '#3b82f6' : '#8b5cf6'
                    }}>
                      {request.isStudent ? '🎓 Étudiant' : request.enterpriseType === 'public' ? '🏛️ Institution publique' : '🏢 Entreprise'}
                    </span>
                    {request.companyName && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {request.companyName}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {request.submittedAt.toLocaleDateString('fr-FR')} à {request.submittedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: `${getStatusColor(request.status)}20`,
                  border: `1px solid ${getStatusColor(request.status)}`,
                  borderRadius: '1rem',
                  color: getStatusColor(request.status),
                  fontWeight: 600
                }}>
                  {getStatusIcon(request.status)}
                  {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvé' : 'Refusé'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Aucune demande</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande trouvée'}
            </p>
          </div>
        )}

        {/* Modal de détails */}
        {selectedRequest && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={() => setSelectedRequest(null)}
          >
            <div
              className="card glass-panel"
              style={{
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Détails de la demande</h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Informations</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div><strong>Nom complet:</strong> {selectedRequest.fullName}</div>
                  <div><strong>Email:</strong> {selectedRequest.email}</div>
                  <div><strong>Type:</strong> {selectedRequest.isStudent ? 'Étudiant' : selectedRequest.enterpriseType === 'public' ? 'Institution publique' : 'Entreprise'}</div>
                  {selectedRequest.companyName && <div><strong>Organisation:</strong> {selectedRequest.companyName}</div>}
                  <div><strong>Soumis le:</strong> {selectedRequest.submittedAt.toLocaleString('fr-FR')}</div>
                </div>
              </div>

              {/* Justificatifs */}
              {(selectedRequest.studentCardUrl || selectedRequest.publicJustificationUrl) && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} />
                    Justificatif
                  </h3>
                  {selectedRequest.studentCardUrl && (
                    <div>
                      <img 
                        src={selectedRequest.studentCardUrl} 
                        alt="Carte étudiant" 
                        style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                      />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Carte d'étudiant</p>
                    </div>
                  )}
                  {selectedRequest.publicJustificationUrl && (
                    <div>
                      <img 
                        src={selectedRequest.publicJustificationUrl} 
                        alt="Justificatif institution" 
                        style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                      />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Justificatif d'institution publique</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Raison du refus (optionnel)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Indiquez la raison si vous refusez..."
                      className="input-field"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: '#10b981'
                      }}
                    >
                      <CheckCircle size={20} />
                      Approuver et créer le compte
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: '#ef4444',
                        color: 'white'
                      }}
                    >
                      <XCircle size={20} />
                      Refuser
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div style={{
                  padding: '1rem',
                  background: `${getStatusColor(selectedRequest.status)}20`,
                  border: `1px solid ${getStatusColor(selectedRequest.status)}`,
                  borderRadius: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    {selectedRequest.status === 'approved' ? '✅ Compte approuvé' : '❌ Demande refusée'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Par {selectedRequest.reviewedBy} le {selectedRequest.reviewedAt?.toLocaleString('fr-FR')}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <strong>Raison:</strong> {selectedRequest.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="btn-secondary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountValidation;
