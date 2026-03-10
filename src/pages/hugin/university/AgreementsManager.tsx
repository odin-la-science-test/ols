import { useState } from 'react';
import { FileText, Plus, Download } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';

const AgreementsManager = () => {
  const [agreements] = useState([
    { id: '1', type: 'internship', studentName: 'Alice Martin', organization: 'BioTech Corp', startDate: new Date('2026-03-01'), endDate: new Date('2026-08-31'), status: 'signed' }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText size={40} />
            Gestion des Conventions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Génération et suivi des conventions</p>
        </header>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Plus size={20} />
          Nouvelle Convention
        </button>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {agreements.map(a => (
            <div key={a.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{a.studentName} - {a.organization}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {a.type === 'internship' ? 'Stage' : 'Alternance'} • {a.startDate.toLocaleDateString('fr-FR')} - {a.endDate.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge status={a.status} />
                  <button className="btn-secondary" style={{ padding: '0.5rem' }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgreementsManager;
