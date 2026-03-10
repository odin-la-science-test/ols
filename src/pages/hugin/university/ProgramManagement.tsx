import { useState } from 'react';
import { BookOpen, Plus, Search, Filter, Users, Award, TrendingUp, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { AcademicProgram } from '../../../types/university';

const ProgramManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const [programs] = useState<AcademicProgram[]>([
    {
      id: '1',
      code: 'L3-BIO',
      name: 'Licence 3 Biologie',
      type: 'licence',
      department: 'Sciences de la Vie',
      faculty: 'Faculté des Sciences',
      duration: 6,
      totalCredits: 180,
      enrolledStudents: 245,
      graduationRate: 87,
      description: 'Formation complète en biologie avec spécialisations en biologie moléculaire, cellulaire et physiologie'
    },
    {
      id: '2',
      code: 'M1-BIOTECH',
      name: 'Master 1 Biotechnologies',
      type: 'master',
      department: 'Sciences de la Vie',
      faculty: 'Faculté des Sciences',
      duration: 2,
      totalCredits: 60,
      enrolledStudents: 87,
      graduationRate: 92,
      description: 'Master spécialisé en biotechnologies appliquées et génie génétique'
    },
    {
      id: '3',
      code: 'L2-CHIMIE',
      name: 'Licence 2 Chimie',
      type: 'licence',
      department: 'Chimie',
      faculty: 'Faculté des Sciences',
      duration: 4,
      totalCredits: 120,
      enrolledStudents: 198,
      graduationRate: 85,
      description: 'Formation en chimie générale, organique et analytique'
    },
    {
      id: '4',
      code: 'M2-MICRO',
      name: 'Master 2 Microbiologie',
      type: 'master',
      department: 'Sciences de la Vie',
      faculty: 'Faculté des Sciences',
      duration: 1,
      totalCredits: 60,
      enrolledStudents: 42,
      graduationRate: 95,
      description: 'Master recherche en microbiologie fondamentale et appliquée'
    },
    {
      id: '5',
      code: 'DOC-BIO',
      name: 'Doctorat Biologie',
      type: 'doctorat',
      department: 'Sciences de la Vie',
      faculty: 'École Doctorale',
      duration: 6,
      totalCredits: 180,
      enrolledStudents: 28,
      graduationRate: 78,
      description: 'Programme doctoral en sciences biologiques'
    }
  ]);

  const departments = ['all', ...Array.from(new Set(programs.map(p => p.department)))];

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesDepartment = filterDepartment === 'all' || p.department === filterDepartment;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const stats = {
    totalPrograms: programs.length,
    totalStudents: programs.reduce((sum, p) => sum + p.enrolledStudents, 0),
    avgGraduationRate: Math.round(programs.reduce((sum, p) => sum + p.graduationRate, 0) / programs.length),
    departments: new Set(programs.map(p => p.department)).size
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      licence: 'Licence',
      master: 'Master',
      doctorat: 'Doctorat',
      diplome: 'Diplôme'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      licence: '#3b82f6',
      master: '#8b5cf6',
      doctorat: '#ec4899',
      diplome: '#10b981'
    };
    return colors[type] || '#6366f1';
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <BookOpen size={40} />
            Gestion des Programmes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Cursus, parcours et crédits ECTS
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <BookOpen size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.totalPrograms}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Programmes actifs
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Users size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.totalStudents}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Étudiants inscrits
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.avgGraduationRate}%
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Taux de réussite moyen
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <GraduationCap size={24} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
                {stats.departments}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Départements
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un programme..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les types</option>
            <option value="licence">Licence</option>
            <option value="master">Master</option>
            <option value="doctorat">Doctorat</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input-field"
            style={{ width: '220px' }}
          >
            <option value="all">Tous les départements</option>
            {departments.filter(d => d !== 'all').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => alert('Fonctionnalité à venir : Créer un nouveau programme')}
          >
            <Plus size={20} />
            Nouveau Programme
          </button>
        </div>

        {/* Programs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredPrograms.map(program => (
            <UniversityCard
              key={program.id}
              title={program.name}
              description={`${program.code} • ${program.department}`}
              icon={<BookOpen size={24} />}
              badge={getTypeLabel(program.type)}
              badgeColor={getTypeColor(program.type)}
              stats={[
                { label: 'Étudiants', value: program.enrolledStudents },
                { label: 'ECTS', value: program.totalCredits },
                { label: 'Réussite', value: `${program.graduationRate}%` }
              ]}
              onClick={() => alert(`Détails du programme ${program.name} - Fonctionnalité à venir`)}
            />
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="card glass-panel" style={{ 
            padding: '3rem', 
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aucun programme trouvé
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramManagement;
