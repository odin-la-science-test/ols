import { useState } from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import type { TeacherWorkload } from '../../../types/university';

const FacultyWorkload = () => {
  const navigate = useNavigate();

  const [workloads] = useState<TeacherWorkload[]>([
    {
      teacherId: 'T001',
      teacherName: 'Dr. Marie Dupont',
      status: 'MCF',
      statutoryHours: 192,
      courses: [
        { courseId: 'BIO301', courseName: 'Biologie Moléculaire', type: 'CM', hours: 24, tdEquivalent: 36, groups: 1, semester: 'S1' },
        { courseId: 'BIO302', courseName: 'TP Biologie', type: 'TP', hours: 48, tdEquivalent: 32, groups: 3, semester: 'S1' }
      ],
      totalTDEquivalent: 68,
      overload: 0,
      researchTime: 50,
      administrativeTasks: 10
    },
    {
      teacherId: 'T002',
      teacherName: 'Prof. Jean Martin',
      status: 'PR',
      statutoryHours: 192,
      courses: [
        { courseId: 'BIO401', courseName: 'Biotechnologies Avancées', type: 'CM', hours: 36, tdEquivalent: 54, groups: 1, semester: 'S1' },
        { courseId: 'BIO402', courseName: 'Séminaire Recherche', type: 'TD', hours: 24, tdEquivalent: 24, groups: 2, semester: 'S2' }
      ],
      totalTDEquivalent: 78,
      overload: 0,
      researchTime: 60,
      administrativeTasks: 20
    },
    {
      teacherId: 'T003',
      teacherName: 'Dr. Sophie Bernard',
      status: 'ATER',
      statutoryHours: 192,
      courses: [
        { courseId: 'BIO201', courseName: 'Biochimie Générale', type: 'TD', hours: 96, tdEquivalent: 96, groups: 4, semester: 'S1' },
        { courseId: 'BIO202', courseName: 'TP Biochimie', type: 'TP', hours: 72, tdEquivalent: 48, groups: 3, semester: 'S2' }
      ],
      totalTDEquivalent: 144,
      overload: 0,
      researchTime: 30,
      administrativeTasks: 5
    }
  ]);

  const getTDEquivalent = (type: string, hours: number) => {
    const coefficients = { CM: 1.5, TD: 1, TP: 0.67 };
    return Math.round(hours * (coefficients[type as keyof typeof coefficients] || 1));
  };

  const getWorkloadStatus = (workload: TeacherWorkload) => {
    const percentage = (workload.totalTDEquivalent / workload.statutoryHours) * 100;
    if (percentage < 80) return { status: 'low', color: '#f59e0b', label: 'Sous-charge' };
    if (percentage > 110) return { status: 'high', color: '#ef4444', label: 'Surcharge' };
    return { status: 'normal', color: '#10b981', label: 'Normal' };
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
            <Users size={40} />
            Gestion des Charges Enseignantes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Répartition et suivi des heures d'enseignement
          </p>
        </header>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Users size={24} style={{ color: 'var(--accent-hugin)', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
              {workloads.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enseignants</div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Clock size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {workloads.reduce((sum, w) => sum + w.totalTDEquivalent, 0)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Heures TD totales</div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <TrendingUp size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
              {Math.round((workloads.reduce((sum, w) => sum + w.totalTDEquivalent, 0) / (workloads.length * 192)) * 100)}%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Taux moyen</div>
          </div>
        </div>

        {/* Workload Cards */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {workloads.map((workload) => {
            const status = getWorkloadStatus(workload);
            const percentage = Math.round((workload.totalTDEquivalent / workload.statutoryHours) * 100);

            return (
              <div key={workload.teacherId} className="card glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{workload.teacherName}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid var(--accent-hugin)',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--accent-hugin)'
                      }}>
                        {workload.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {workload.statutoryHours}h statutaires
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: status.color }}>
                      {percentage}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: status.color, fontWeight: 600 }}>
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${status.color}, ${status.color}dd)`,
                    transition: 'width 0.3s'
                  }} />
                </div>

                {/* Courses Table */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Enseignements</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cours</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Type</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Heures</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Éq. TD</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Groupes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workload.courses.map((course, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '0.75rem' }}>{course.courseName}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(99, 102, 241, 0.15)',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}>
                                {course.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{course.hours}h</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--accent-hugin)' }}>{course.tdEquivalent}h</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{course.groups}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Éq. TD</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{workload.totalTDEquivalent}h</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Recherche</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{workload.researchTime}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Administratif</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{workload.administrativeTasks}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacultyWorkload;
