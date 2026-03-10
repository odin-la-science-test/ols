import { useState } from 'react';
import { Lightbulb, Video, Gamepad2, TrendingUp } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const InnovativePedagogy = () => {
  const [methods] = useState([
    { id: '1', courseName: 'Biologie Moléculaire', method: 'flipped_classroom', description: 'Classe inversée avec vidéos préparatoires', resources: [{ type: 'video', title: 'Introduction ADN', url: '#', duration: 15, completionRate: 85 }], effectiveness: { studentSatisfaction: 4.5, learningOutcomes: 4.2, engagementRate: 88, completionRate: 92 } },
    { id: '2', courseName: 'Génétique', method: 'serious_game', description: 'Jeu sérieux sur les croisements génétiques', resources: [{ type: 'game', title: 'GeneticQuest', url: '#', completionRate: 78 }], effectiveness: { studentSatisfaction: 4.7, learningOutcomes: 4.4, engagementRate: 95, completionRate: 85 } }
  ]);

  const getMethodIcon = (method: string) => {
    if (method === 'flipped_classroom') return <Video size={24} />;
    if (method === 'serious_game') return <Gamepad2 size={24} />;
    return <Lightbulb size={24} />;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      flipped_classroom: 'Classe Inversée',
      pbl: 'Apprentissage par Problèmes',
      serious_game: 'Serious Game',
      vr_ar: 'Réalité Virtuelle/Augmentée',
      peer_instruction: 'Instruction par les Pairs'
    };
    return labels[method] || method;
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Lightbulb size={40} />
            Pédagogie Innovante
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Méthodes d'enseignement avancées</p>
        </header>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {methods.map(m => (
            <div key={m.id} className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '0.75rem', color: 'var(--accent-hugin)' }}>
                  {getMethodIcon(m.method)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.courseName}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--accent-hugin)', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      {getMethodLabel(m.method)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Ressources</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {m.resources.map((r, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        {r.duration && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.duration} min</div>}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>{r.completionRate}% complété</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} />
                  Efficacité
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Satisfaction</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{m.effectiveness.studentSatisfaction}/5</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Résultats</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{m.effectiveness.learningOutcomes}/5</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Engagement</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{m.effectiveness.engagementRate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Complétion</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.effectiveness.completionRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InnovativePedagogy;
