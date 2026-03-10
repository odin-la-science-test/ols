import { useState } from 'react';
import { Scale, Users, FileText, CheckCircle } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { JuryComposition } from '../../../types/university';

const JuryManagement = () => {
  const [juries] = useState<JuryComposition[]>([
    {
      id: '1',
      type: 'deliberation',
      date: new Date('2026-06-20'),
      members: [
        { userId: 'U001', name: 'Prof. Martin', role: 'president' },
        { userId: 'U002', name: 'Dr. Dupont', role: 'examiner' },
        { userId: 'U003', name: 'Dr. Bernard', role: 'examiner' }
      ],
      students: ['Alice Martin', 'Bob Dupont', 'Claire Petit'],
      decisions: [
        { studentId: 'S001', studentName: 'Alice Martin', finalGrade: 15.5, mention: 'bien', comments: 'Bon parcours', compensations: [] }
      ]
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Scale size={40} />
            Gestion des Jurys
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Délibérations et décisions académiques</p>
        </header>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {juries.map(jury => (
            <div key={jury.id} className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {jury.type === 'deliberation' ? 'Délibération' : jury.type === 'defense' ? 'Soutenance' : 'Examen'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{jury.date.toLocaleDateString('fr-FR')}</p>
                </div>
                <StatusBadge status="scheduled" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} />
                  Membres du Jury
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {jury.members.map((member, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
                      <span>{member.name}</span>
                      <span style={{ color: 'var(--accent-hugin)', fontWeight: 600 }}>
                        {member.role === 'president' ? 'Président' : member.role === 'supervisor' ? 'Directeur' : 'Examinateur'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} />
                  Étudiants ({jury.students.length})
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {jury.students.map((student, i) => (
                    <span key={i} style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-hugin)', borderRadius: '0.5rem' }}>
                      {student}
                    </span>
                  ))}
                </div>
              </div>

              {jury.decisions.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 600, color: '#10b981' }}>{jury.decisions.length} décisions enregistrées</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JuryManagement;
