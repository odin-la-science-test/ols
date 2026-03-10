import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';

const AccessibilitySupport = () => {
  const [accommodations] = useState([
    { studentName: 'Bob Dupont', disability: 'Dyslexie', accommodations: [{ type: 'extra_time', description: 'Tiers-temps aux examens', courses: ['Tous'] }], validFrom: new Date('2025-09-01'), validUntil: new Date('2026-08-31'), status: 'active' }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Heart size={40} />
            Handicap & Accessibilité
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Aménagements pédagogiques</p>
        </header>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Plus size={20} />
          Nouveau Dossier
        </button>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {accommodations.map((a, i) => (
            <div key={i} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{a.studentName}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{a.disability}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Valide du {a.validFrom.toLocaleDateString('fr-FR')} au {a.validUntil.toLocaleDateString('fr-FR')}
              </div>
              <div style={{ marginTop: '1rem' }}>
                {a.accommodations.map((acc, j) => (
                  <div key={j} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{acc.description}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cours: {acc.courses.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySupport;
