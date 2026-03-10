import { useState } from 'react';
import { Award, Plus } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';

const VAEAssessment = () => {
  const [applications] = useState([
    { id: '1', applicantName: 'Jean Durand', targetDiploma: 'Master Biotechnologies', professionalExperience: [{ company: 'BioLab', position: 'Technicien', startDate: new Date('2020-01-01'), description: '5 ans d\'expérience en laboratoire', skills: ['PCR', 'Culture cellulaire'] }], status: 'under_review' }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={40} />
            Validation des Acquis (VAE/VAP)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Reconnaissance de l'expérience professionnelle</p>
        </header>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Plus size={20} />
          Nouvelle Demande
        </button>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {applications.map(a => (
            <div key={a.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{a.applicantName}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Diplôme visé: {a.targetDiploma}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Expérience professionnelle</h4>
                {a.professionalExperience.map((exp, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{exp.position} - {exp.company}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{exp.description}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {exp.skills.map((skill, j) => (
                        <span key={j} style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--accent-hugin)', borderRadius: '1rem', fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
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

export default VAEAssessment;
