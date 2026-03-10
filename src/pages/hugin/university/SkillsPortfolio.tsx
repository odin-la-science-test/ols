import { useState } from 'react';
import { Award, TrendingUp, Briefcase, Star } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import type { SkillsProfile } from '../../../types/university';

const SkillsPortfolio = () => {
  const [profile] = useState<SkillsProfile>({
    studentId: 'STU001',
    studentName: 'Alice Martin',
    technicalSkills: [
      { name: 'Biologie Moléculaire', category: 'Laboratoire', level: 85, acquiredFrom: ['BIO301', 'BIO302'], lastUpdated: new Date() },
      { name: 'Bioinformatique', category: 'Informatique', level: 70, acquiredFrom: ['BIO401'], lastUpdated: new Date() },
      { name: 'Microscopie', category: 'Laboratoire', level: 90, acquiredFrom: ['BIO201', 'BIO302'], lastUpdated: new Date() }
    ],
    softSkills: [
      { name: 'Travail d\'équipe', category: 'Collaboration', level: 88, acquiredFrom: ['Projet1', 'Projet2'], lastUpdated: new Date() },
      { name: 'Communication', category: 'Présentation', level: 75, acquiredFrom: ['Séminaire1'], lastUpdated: new Date() }
    ],
    certifications: [
      { name: 'Sécurité en Laboratoire', issuer: 'Université', issueDate: new Date('2025-09-01'), credentialId: 'CERT-2025-001' }
    ],
    projects: [
      { title: 'Analyse du Génome Bactérien', description: 'Projet de bioinformatique', technologies: ['Python', 'BLAST'], role: 'Chef de projet', startDate: new Date('2025-10-01'), endDate: new Date('2026-01-15'), images: [] }
    ],
    endorsements: [
      { skillName: 'Biologie Moléculaire', endorsedBy: 'Dr. Dupont', endorsedByRole: 'Enseignant', date: new Date(), comment: 'Excellente maîtrise technique' }
    ]
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={40} />
            Portfolio de Compétences
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Cartographie et valorisation des compétences</p>
        </header>

        <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{profile.studentName}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ID: {profile.studentId}</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} />
            Compétences Techniques
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile.technicalSkills.map((skill, index) => (
              <div key={index} className="card glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{skill.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{skill.category}</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{skill.level}%</div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ height: '100%', width: `${skill.level}%`, background: 'linear-gradient(90deg, var(--accent-hugin), #8b5cf6)', transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Acquis via: {skill.acquiredFrom.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={24} />
            Soft Skills
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {profile.softSkills.map((skill, index) => (
              <div key={index} className="card glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{skill.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${skill.level}%`, background: '#10b981' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>{skill.level}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={24} />
            Certifications
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile.certifications.map((cert, index) => (
              <div key={index} className="card glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{cert.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Délivré par: {cert.issuer}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Date: {cert.issueDate.toLocaleDateString('fr-FR')} • ID: {cert.credentialId}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={24} />
            Projets
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile.projects.map((project, index) => (
              <div key={index} className="card glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {project.technologies.map((tech, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--accent-hugin)', borderRadius: '1rem', fontSize: '0.85rem' }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {project.role} • {project.startDate.toLocaleDateString('fr-FR')} - {project.endDate?.toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPortfolio;
