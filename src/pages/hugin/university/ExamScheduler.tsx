import { useState } from 'react';
import { FileText, Calendar, Clock, MapPin, Users, Plus, Search, Filter, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { ExamSession } from '../../../types/university';

const ExamScheduler = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calendar' | 'sessions'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [examSessions] = useState<ExamSession[]>([
    {
      id: '1',
      type: 'final',
      courseId: 'BIO301',
      courseName: 'Biologie Moléculaire',
      instructor: 'Dr. Martin',
      date: new Date('2024-06-15'),
      startTime: '09:00',
      duration: 180,
      rooms: [
        { roomId: 'A101', capacity: 80, assignedStudents: ['S001', 'S002'] },
        { roomId: 'A102', capacity: 80, assignedStudents: ['S003', 'S004'] }
      ],
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'midterm',
      courseId: 'CHEM201',
      courseName: 'Chimie Organique',
      instructor: 'Prof. Dubois',
      date: new Date('2024-06-18'),
      startTime: '14:00',
      duration: 120,
      rooms: [
        { roomId: 'B201', capacity: 60, assignedStudents: ['S005', 'S006'] }
      ],
      status: 'scheduled'
    },
    {
      id: '3',
      type: 'practical',
      courseId: 'MICRO302',
      courseName: 'Microbiologie Appliquée',
      instructor: 'Dr. Laurent',
      date: new Date('2024-06-20'),
      startTime: '10:00',
      duration: 240,
      rooms: [
        { roomId: 'LAB3', capacity: 30, assignedStudents: ['S007', 'S008'] }
      ],
      status: 'in_progress'
    },
    {
      id: '4',
      type: 'oral',
      courseId: 'BIO401',
      courseName: 'Projet de Recherche',
      instructor: 'Prof. Bernard',
      date: new Date('2024-06-22'),
      startTime: '09:00',
      duration: 480,
      rooms: [
        { roomId: 'C301', capacity: 10, assignedStudents: ['S009'] }
      ],
      status: 'scheduled'
    },
    {
      id: '5',
      type: 'resit',
      courseId: 'BIO201',
      courseName: 'Génétique',
      instructor: 'Dr. Petit',
      date: new Date('2024-06-25'),
      startTime: '14:00',
      duration: 180,
      rooms: [
        { roomId: 'A103', capacity: 40, assignedStudents: ['S010', 'S011'] }
      ],
      status: 'scheduled'
    },
    {
      id: '6',
      type: 'final',
      courseId: 'BIOTECH301',
      courseName: 'Biotechnologies',
      instructor: 'Dr. Rousseau',
      date: new Date('2024-06-12'),
      startTime: '09:00',
      duration: 180,
      rooms: [
        { roomId: 'A104', capacity: 70, assignedStudents: ['S012', 'S013'] }
      ],
      status: 'completed'
    }
  ]);

  const filteredSessions = examSessions.filter(session => {
    const matchesSearch = session.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || session.type === filterType;
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: examSessions.length,
    scheduled: examSessions.filter(s => s.status === 'scheduled').length,
    inProgress: examSessions.filter(s => s.status === 'in_progress').length,
    completed: examSessions.filter(s => s.status === 'completed').length
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      midterm: 'Partiel',
      final: 'Final',
      resit: 'Rattrapage',
      oral: 'Oral',
      practical: 'Pratique'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      midterm: '#3b82f6',
      final: '#ef4444',
      resit: '#f59e0b',
      oral: '#8b5cf6',
      practical: '#10b981'
    };
    return colors[type] || '#6366f1';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6',
      in_progress: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Planifié',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalCapacity = (rooms: ExamSession['rooms']) => {
    return rooms.reduce((sum, room) => sum + room.capacity, 0);
  };

  const getTotalStudents = (rooms: ExamSession['rooms']) => {
    return rooms.reduce((sum, room) => sum + room.assignedStudents.length, 0);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/hugin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={20} />
          Retour à Hugin
        </button>

        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <FileText size={40} />
            Gestion des Examens
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Planning, surveillance et résultats
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
              <FileText size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total examens
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Calendar size={24} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.scheduled}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Planifiés
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Clock size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.inProgress}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              En cours
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.completed}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Terminés
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'calendar' ? '3px solid var(--accent-hugin)' : '3px solid transparent',
              color: activeTab === 'calendar' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'calendar' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Calendrier
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sessions' ? '3px solid var(--accent-hugin)' : '3px solid transparent',
              color: activeTab === 'sessions' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'sessions' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Sessions
          </button>
        </div>

        {activeTab === 'sessions' && (
          <>
            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
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
                  placeholder="Rechercher un examen..."
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
                <option value="midterm">Partiel</option>
                <option value="final">Final</option>
                <option value="resit">Rattrapage</option>
                <option value="oral">Oral</option>
                <option value="practical">Pratique</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
                style={{ width: '180px' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="scheduled">Planifié</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>

              <button 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => alert('Fonctionnalité à venir : Planifier un nouvel examen')}
              >
                <Plus size={20} />
                Nouvel Examen
              </button>
            </div>

            {/* Sessions List */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  className="card glass-panel"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => alert(`Détails de l'examen ${session.courseName} - Fonctionnalité à venir`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {session.courseName}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {session.courseId} • {session.instructor}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: `${getTypeColor(session.type)}20`,
                        border: `1px solid ${getTypeColor(session.type)}`,
                        borderRadius: '1rem',
                        color: getTypeColor(session.type),
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {getTypeLabel(session.type)}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: `${getStatusColor(session.status)}20`,
                        border: `1px solid ${getStatusColor(session.status)}`,
                        borderRadius: '1rem',
                        color: getStatusColor(session.status),
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {getStatusLabel(session.status)}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} style={{ color: 'var(--accent-hugin)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        {formatDate(session.date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: 'var(--accent-hugin)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        {session.startTime} ({session.duration} min)
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} style={{ color: 'var(--accent-hugin)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        {session.rooms.map(r => r.roomId).join(', ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: 'var(--accent-hugin)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        {getTotalStudents(session.rooms)} / {getTotalCapacity(session.rooms)}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {session.rooms.length} salle{session.rooms.length > 1 ? 's' : ''} réservée{session.rooms.length > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="card glass-panel" style={{ 
                padding: '3rem', 
                textAlign: 'center'
              }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Aucun examen trouvé
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'calendar' && (
          <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-hugin)' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Vue Calendrier
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Visualisation calendrier des examens - Fonctionnalité à venir
            </p>
            <button
              className="btn-primary"
              onClick={() => setActiveTab('sessions')}
            >
              Voir la liste des sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamScheduler;
