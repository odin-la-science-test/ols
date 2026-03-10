import { useState } from 'react';
import { Briefcase, Calendar, Users, Plus } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { StudentProject } from '../../../types/university';

const StudentProjectsHub = () => {
  const [projects] = useState<StudentProject[]>([
    {
      id: '1',
      type: 'pfe',
      title: 'Développement d\'un système LIMS',
      studentId: 'S001',
      studentName: 'Alice Martin',
      supervisorId: 'T001',
      supervisorName: 'Dr. Dupont',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-06-30'),
      milestones: [
        { title: 'Cahier des charges', dueDate: new Date('2025-11-01'), status: 'completed', completedAt: new Date('2025-10-28') },
        { title: 'Prototype', dueDate: new Date('2026-02-01'), status: 'in_progress' }
      ],
      deliverables: [
        { title: 'Rapport final', type: 'report', dueDate: new Date('2026-06-15') }
      ]
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Briefcase size={40} />
            Projets Étudiants
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>PFE, stages et projets tutorés</p>
        </header>

        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Plus size={20} />
          Nouveau Projet
        </button>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {projects.map(project => (
            <div key={project.id} className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {project.studentName} • Encadrant: {project.supervisorName}
                  </p>
                </div>
                <StatusBadge status={project.type} label={project.type === 'pfe' ? 'PFE' : project.type === 'internship' ? 'Stage' : 'Projet tutoré'} />
              </div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div><Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {project.startDate.toLocaleDateString('fr-FR')} - {project.endDate.toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                  {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length} jalons
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-hugin)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                  {project.deliverables.length} livrables
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProjectsHub;
