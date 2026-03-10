import { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';

const AccreditationTracker = () => {
  const [criteria] = useState([
    { id: '1', organization: 'HCERES', criterion: 'Qualité de la formation', category: 'Pédagogie', status: 'compliant', evidence: 3, lastReview: new Date('2025-09-01'), nextReview: new Date('2026-09-01') },
    { id: '2', organization: 'CTI', criterion: 'Insertion professionnelle', category: 'Débouchés', status: 'partial', evidence: 2, lastReview: new Date('2025-10-01'), nextReview: new Date('2026-10-01') }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={40} />
            Suivi des Accréditations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Conformité et préparation des dossiers</p>
        </header>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {criteria.map(c => (
            <div key={c.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c.criterion}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{c.organization} • {c.category}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div><FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{c.evidence} preuves</div>
                <div>Prochaine révision: {c.nextReview.toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccreditationTracker;
