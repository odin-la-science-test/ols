import { useState } from 'react';
import { MapPin, TrendingUp, Award, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { AcademicPath } from '../../../types/university';

const AcademicPathways = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>('current');

  const [pathData] = useState<AcademicPath>({
    id: '1',
    studentId: 'STU001',
    currentProgram: 'Master 1 Biotechnologies',
    currentSemester: 3,
    completedCourses: [
      { courseId: 'BIO301', courseName: 'Biologie Moléculaire', credits: 6, grade: 15.5, semester: 'S1', status: 'passed' },
      { courseId: 'BIO302', courseName: 'Génétique Avancée', credits: 6, grade: 14.0, semester: 'S1', status: 'passed' },
      { courseId: 'BIO303', courseName: 'Biochimie Structurale', credits: 6, grade: 16.0, semester: 'S2', status: 'passed' }
    ],
    plannedCourses: [
      { courseId: 'BIO401', courseName: 'Biotechnologies Appliquées', credits: 6, semester: 'S3', priority: 'high' },
      { courseId: 'BIO402', courseName: 'Génie Génétique', credits: 6, semester: 'S3', priority: 'high' }
    ],
    recommendations: [
      { type: 'course', title: 'Bioinformatique Avancée', reason: 'Complète votre profil en analyse de données', priority: 1 },
      { type: 'internship', title: 'Stage en laboratoire R&D', reason: 'Expérience pratique recommandée', priority: 2 },
      { type: 'specialization', title: 'Spécialisation Immunologie', reason: 'Forte demande du marché', priority: 3 }
    ],
    alternativePaths: [
      { programId: 'M2-BIOINFO', programName: 'Master 2 Bioinformatique', compatibility: 85, requiredCredits: 60, transferableCredits: 48 },
      { programId: 'M2-IMMUNO', programName: 'Master 2 Immunologie', compatibility: 78, requiredCredits: 60, transferableCredits: 42 }
    ],
    progressPercentage: 65
  });

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
            <MapPin size={40} />
            Orientation & Parcours Académique
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Cartographie et recommandations personnalisées
          </p>
        </header>

        {/* Progress Overview */}
        <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{pathData.currentProgram}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Semestre {pathData.currentSemester}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {pathData.progressPercentage}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Progression</div>
            </div>
          </div>
          
          <div style={{
            height: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${pathData.progressPercentage}%`,
              background: 'linear-gradient(90deg, var(--accent-hugin), #8b5cf6)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <CheckCircle size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {pathData.completedCourses.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cours validés</div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <TrendingUp size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
              {pathData.plannedCourses.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cours planifiés</div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <Award size={24} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
              {pathData.completedCourses.reduce((sum, c) => sum + c.credits, 0)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ECTS acquis</div>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={24} />
            Recommandations Personnalisées
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pathData.recommendations.map((rec, index) => (
              <div key={index} className="card glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <StatusBadge status={rec.type} label={rec.type === 'course' ? 'Cours' : rec.type === 'internship' ? 'Stage' : 'Spécialisation'} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{rec.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{rec.reason}</p>
                  </div>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Explorer
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Paths */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Parcours Alternatifs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {pathData.alternativePaths.map((alt, index) => (
              <UniversityCard
                key={index}
                title={alt.programName}
                description={`Compatibilité: ${alt.compatibility}%`}
                icon={<MapPin size={24} />}
                stats={[
                  { label: 'ECTS requis', value: alt.requiredCredits },
                  { label: 'ECTS transférables', value: alt.transferableCredits }
                ]}
                onClick={() => alert(`Détails du parcours ${alt.programName}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicPathways;
