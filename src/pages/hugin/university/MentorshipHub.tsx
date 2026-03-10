import { useState } from 'react';
import { Users, Calendar, TrendingUp, Plus } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { MentorshipMatch } from '../../../types/university';

const MentorshipHub = () => {
  const [matches] = useState<MentorshipMatch[]>([
    {
      id: '1',
      mentorId: 'M001',
      mentorName: 'Dr. Sophie Bernard',
      menteeId: 'S001',
      menteeName: 'Alice Martin',
      startDate: new Date('2025-10-01'),
      focus: ['Recherche', 'Orientation', 'Méthodologie'],
      sessions: [
        { date: new Date('2025-10-15'), duration: 60, topics: ['Choix de sujet de thèse'], notes: 'Discussion productive', nextSteps: ['Lire articles recommandés'] }
      ],
      status: 'active'
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={40} />
            Hub de Mentorat
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Accompagnement personnalisé et suivi</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Users size={24} style={{ color: 'var(--accent-hugin)', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{matches.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Binômes actifs</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Calendar size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{matches.reduce((sum, m) => sum + m.sessions.length, 0)}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sessions réalisées</div>
          </div>
        </div>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Plus size={20} />
          Nouveau Binôme
        </button>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {matches.map(match => (
            <div key={match.id} className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {match.mentorName} → {match.menteeName}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {match.focus.map((f, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--accent-hugin)', borderRadius: '1rem', fontSize: '0.85rem' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={match.status} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Début: {match.startDate.toLocaleDateString('fr-FR')} • {match.sessions.length} sessions
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorshipHub;
