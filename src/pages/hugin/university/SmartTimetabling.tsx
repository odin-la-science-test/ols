import { useState } from 'react';
import { 
  Calendar, AlertTriangle, CheckCircle, RefreshCw, Download, Plus, 
  Edit2, Trash2, X, Save, Users, MapPin, Clock, Filter, Search,
  Copy, Grid, List, Settings, Zap
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import type { TimetableSlot } from '../../../types/university';

const SmartTimetabling = () => {
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'CM' | 'TD' | 'TP'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);

  const days = [
    { id: 'monday', label: 'Lundi', short: 'Lun' },
    { id: 'tuesday', label: 'Mardi', short: 'Mar' },
    { id: 'wednesday', label: 'Mercredi', short: 'Mer' },
    { id: 'thursday', label: 'Jeudi', short: 'Jeu' },
    { id: 'friday', label: 'Vendredi', short: 'Ven' },
    { id: 'saturday', label: 'Samedi', short: 'Sam' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  const [timetable, setTimetable] = useState<TimetableSlot[]>([
    {
      id: '1',
      day: 'monday',
      startTime: '08:00',
      endTime: '10:00',
      courseId: 'BIO301',
      courseName: 'Biologie Moléculaire',
      type: 'CM',
      teacherId: 'T001',
      teacherName: 'Dr. Dupont',
      roomId: 'A101',
      roomName: 'Amphi A',
      groups: ['L3-BIO-G1', 'L3-BIO-G2'],
      conflicts: []
    },
    {
      id: '2',
      day: 'monday',
      startTime: '10:00',
      endTime: '12:00',
      courseId: 'BIO302',
      courseName: 'TP Biologie',
      type: 'TP',
      teacherId: 'T001',
      teacherName: 'Dr. Dupont',
      roomId: 'L201',
      roomName: 'Labo 201',
      groups: ['L3-BIO-G1'],
      conflicts: [
        { type: 'teacher', severity: 'warning', description: 'Enchaînement serré pour l\'enseignant' }
      ]
    },
    {
      id: '3',
      day: 'tuesday',
      startTime: '14:00',
      endTime: '16:00',
      courseId: 'BIO401',
      courseName: 'Biotechnologies Avancées',
      type: 'CM',
      teacherId: 'T002',
      teacherName: 'Prof. Martin',
      roomId: 'A102',
      roomName: 'Amphi B',
      groups: ['M1-BIOTECH'],
      conflicts: []
    },
    {
      id: '4',
      day: 'wednesday',
      startTime: '09:00',
      endTime: '11:00',
      courseId: 'CHM201',
      courseName: 'Chimie Organique',
      type: 'TD',
      teacherId: 'T003',
      teacherName: 'Dr. Bernard',
      roomId: 'B205',
      roomName: 'Salle TD 205',
      groups: ['L2-CHM-G1'],
      conflicts: []
    },
    {
      id: '5',
      day: 'thursday',
      startTime: '14:00',
      endTime: '17:00',
      courseId: 'BIO302',
      courseName: 'TP Biologie',
      type: 'TP',
      teacherId: 'T001',
      teacherName: 'Dr. Dupont',
      roomId: 'L201',
      roomName: 'Labo 201',
      groups: ['L3-BIO-G2'],
      conflicts: []
    },
    {
      id: '6',
      day: 'friday',
      startTime: '10:00',
      endTime: '12:00',
      courseId: 'PHY101',
      courseName: 'Physique Générale',
      type: 'CM',
      teacherId: 'T004',
      teacherName: 'Prof. Leroy',
      roomId: 'A101',
      roomName: 'Amphi A',
      groups: ['L1-PHY'],
      conflicts: []
    }
  ]);

  // Détection automatique des conflits
  const detectConflicts = (slot: TimetableSlot): typeof slot.conflicts => {
    const conflicts: typeof slot.conflicts = [];
    
    timetable.forEach(other => {
      if (other.id === slot.id) return;
      if (other.day !== slot.day) return;
      
      const overlap = (
        (slot.startTime >= other.startTime && slot.startTime < other.endTime) ||
        (slot.endTime > other.startTime && slot.endTime <= other.endTime) ||
        (slot.startTime <= other.startTime && slot.endTime >= other.endTime)
      );
      
      if (overlap) {
        // Conflit de salle
        if (slot.roomId === other.roomId) {
          conflicts.push({
            type: 'room',
            severity: 'critical',
            description: `Conflit de salle avec ${other.courseName}`
          });
        }
        
        // Conflit d'enseignant
        if (slot.teacherId === other.teacherId) {
          conflicts.push({
            type: 'teacher',
            severity: 'critical',
            description: `${slot.teacherName} a déjà cours (${other.courseName})`
          });
        }
        
        // Conflit de groupe
        const groupOverlap = slot.groups.some(g => other.groups.includes(g));
        if (groupOverlap) {
          conflicts.push({
            type: 'student_group',
            severity: 'critical',
            description: `Groupe en conflit avec ${other.courseName}`
          });
        }
      }
    });
    
    return conflicts;
  };

  const getSlotForTime = (day: string, time: string) => {
    return timetable.find(slot => 
      slot.day === day && 
      slot.startTime <= time && 
      slot.endTime > time
    );
  };

  const calculateSlotHeight = (startTime: string, endTime: string): number => {
    const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const durationInMinutes = end - start;
    // Chaque créneau de 30 min = 80px de hauteur
    return (durationInMinutes / 30) * 80;
  };

  const getTypeColor = (type: string) => {
    const colors = { CM: '#3b82f6', TD: '#10b981', TP: '#f59e0b' };
    return colors[type as keyof typeof colors] || '#6366f1';
  };

  const addSlot = (newSlot: Omit<TimetableSlot, 'id' | 'conflicts'>) => {
    const id = `slot_${Date.now()}`;
    const slotWithId = { ...newSlot, id, conflicts: [] };
    const conflicts = detectConflicts(slotWithId);
    setTimetable(prev => [...prev, { ...slotWithId, conflicts }]);
  };

  const updateSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetable(prev => prev.map(slot => {
      if (slot.id === id) {
        const updated = { ...slot, ...updates };
        return { ...updated, conflicts: detectConflicts(updated) };
      }
      return slot;
    }));
  };

  const deleteSlot = (id: string) => {
    if (confirm('Supprimer ce créneau ?')) {
      setTimetable(prev => prev.filter(s => s.id !== id));
    }
  };

  const duplicateSlot = (slot: TimetableSlot) => {
    const newSlot = {
      ...slot,
      id: `slot_${Date.now()}`,
      day: selectedDay as TimetableSlot['day']
    };
    setTimetable(prev => [...prev, { ...newSlot, conflicts: detectConflicts(newSlot) }]);
  };

  const filteredTimetable = timetable.filter(slot => {
    if (filterType !== 'all' && slot.type !== filterType) return false;
    if (searchTerm && !slot.courseName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !slot.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (showConflictsOnly && slot.conflicts.length === 0) return false;
    return true;
  });

  const stats = {
    totalSlots: timetable.length,
    conflicts: timetable.filter(s => s.conflicts.length > 0).length,
    rooms: new Set(timetable.map(s => s.roomId)).size,
    teachers: new Set(timetable.map(s => s.teacherId)).size,
    groups: new Set(timetable.flatMap(s => s.groups)).size,
    hours: timetable.reduce((sum, s) => {
      const start = parseInt(s.startTime.split(':')[0]) + parseInt(s.startTime.split(':')[1]) / 60;
      const end = parseInt(s.endTime.split(':')[0]) + parseInt(s.endTime.split(':')[1]) / 60;
      return sum + (end - start);
    }, 0)
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem', maxWidth: '1600px' }}>
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h1 className="text-gradient" style={{
                fontSize: '2.5rem',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <Calendar size={40} />
                Emplois du Temps Intelligents
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Génération automatique avec détection de conflits
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-secondary"
                onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {viewMode === 'week' ? <List size={18} /> : <Grid size={18} />}
                {viewMode === 'week' ? 'Vue Jour' : 'Vue Semaine'}
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} />
                Nouveau Créneau
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{stats.totalSlots}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Créneaux</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.conflicts > 0 ? '#ef4444' : '#10b981' }}>
              {stats.conflicts}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Conflits</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.rooms}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Salles</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.teachers}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enseignants</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.groups}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Groupes</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.hours.toFixed(0)}h</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Volume horaire</div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} />
            Optimiser Automatiquement
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} />
            Exporter PDF
          </button>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Rechercher un cours, enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tous les types</option>
            <option value="CM">CM uniquement</option>
            <option value="TD">TD uniquement</option>
            <option value="TP">TP uniquement</option>
          </select>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showConflictsOnly}
              onChange={(e) => setShowConflictsOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Conflits uniquement</span>
          </label>
        </div>

        {/* Day Selector */}
        {viewMode === 'day' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {days.map(day => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: selectedDay === day.id ? 'var(--accent-hugin)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedDay === day.id ? 'var(--accent-hugin)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '0.5rem',
                  color: selectedDay === day.id ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

        {/* Timetable Grid - Week View */}
        {viewMode === 'week' && (
          <div className="card glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <div style={{ minWidth: '1200px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px repeat(6, 1fr)', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Heure</div>
                {days.map(day => (
                  <div key={day.id} style={{ 
                    fontWeight: 700, 
                    textAlign: 'center',
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '0.5rem'
                  }}>
                    {day.short}
                  </div>
                ))}
              </div>
              
              {timeSlots.filter((_, i) => i % 2 === 0).map((time, index) => {
                const rowSlots = days.map(day => getSlotForTime(day.id, time));
                
                return (
                  <div
                    key={time}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px repeat(6, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ 
                      color: 'var(--text-secondary)', 
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      paddingTop: '0.5rem'
                    }}>
                      {time}
                    </div>
                    {days.map((day, dayIndex) => {
                      const slot = rowSlots[dayIndex];
                      const isFiltered = slot && !filteredTimetable.includes(slot);
                      const isStartOfSlot = slot && slot.startTime === time;
                      
                      return (
                        <div
                          key={day.id}
                          style={{
                            background: slot && !isStartOfSlot ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                            borderRadius: slot && !isStartOfSlot ? '0' : '0.5rem',
                            border: slot && !isStartOfSlot ? 'none' : '1px dashed rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            minHeight: '80px'
                          }}
                        >
                          {isStartOfSlot && !isFiltered && (
                            <div
                              style={{
                                padding: '0.75rem',
                                background: `${getTypeColor(slot.type)}20`,
                                border: `2px solid ${getTypeColor(slot.type)}`,
                                borderRadius: '0.5rem',
                                minHeight: `${calculateSlotHeight(slot.startTime, slot.endTime) - 8}px`,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowEditModal(true);
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                  {slot.courseName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                  {slot.teacherName}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  {slot.roomName}
                                </div>
                              </div>
                              <span style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                padding: '0.15rem 0.5rem',
                                background: getTypeColor(slot.type),
                                borderRadius: '0.75rem',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: 'white'
                              }}>
                                {slot.type}
                              </span>
                              {slot.conflicts.length > 0 && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '0.5rem',
                                  right: '0.5rem'
                                }}>
                                  <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                                </div>
                              )}
                            </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Timetable Grid - Day View */}
        {viewMode === 'day' && (
          <div className="card glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <div style={{ minWidth: '800px' }}>
              {timeSlots.map((time, index) => {
                const slot = getSlotForTime(selectedDay, time);
                const isFiltered = slot && !filteredTimetable.includes(slot);
                
                return (
                  <div
                    key={time}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr',
                      gap: '1rem',
                      padding: '1rem 0',
                      borderBottom: index < timeSlots.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                    }}
                  >
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{time}</div>
                    <div>
                      {slot && slot.startTime === time && !isFiltered && (
                        <div
                          style={{
                            padding: '1.5rem',
                            background: `${getTypeColor(slot.type)}20`,
                            border: `2px solid ${getTypeColor(slot.type)}`,
                            borderRadius: '0.5rem',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowEditModal(true);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                {slot.courseName}
                              </div>
                              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Users size={16} />
                                  {slot.teacherName}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <MapPin size={16} />
                                  {slot.roomName}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Clock size={16} />
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{
                                padding: '0.35rem 1rem',
                                background: getTypeColor(slot.type),
                                borderRadius: '1rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'white'
                              }}>
                                {slot.type}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateSlot(slot);
                                }}
                                style={{
                                  padding: '0.5rem',
                                  background: '#6366f1',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                                title="Dupliquer"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSlot(slot.id);
                                }}
                                style={{
                                  padding: '0.5rem',
                                  background: '#ef4444',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            flexWrap: 'wrap',
                            marginBottom: slot.conflicts.length > 0 ? '1rem' : 0
                          }}>
                            {slot.groups.map(group => (
                              <span
                                key={group}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: '1rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}
                              >
                                {group}
                              </span>
                            ))}
                          </div>
                          
                          {slot.conflicts.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                              {slot.conflicts.map((conflict, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '0.75rem',
                                    background: conflict.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                    border: `1px solid ${conflict.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: idx < slot.conflicts.length - 1 ? '0.5rem' : 0
                                  }}
                                >
                                  <AlertTriangle 
                                    size={18} 
                                    style={{ color: conflict.severity === 'critical' ? '#ef4444' : '#f59e0b' }} 
                                  />
                                  <div>
                                    <div style={{ 
                                      fontSize: '0.85rem', 
                                      fontWeight: 600,
                                      color: conflict.severity === 'critical' ? '#ef4444' : '#f59e0b',
                                      marginBottom: '0.25rem'
                                    }}>
                                      {conflict.severity === 'critical' ? 'Conflit Critique' : 'Avertissement'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                      {conflict.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajout Créneau */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="card glass-panel"
            style={{
              maxWidth: '700px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Nouveau Créneau</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addSlot({
                day: formData.get('day') as TimetableSlot['day'],
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                courseId: formData.get('courseId') as string,
                courseName: formData.get('courseName') as string,
                type: formData.get('type') as 'CM' | 'TD' | 'TP',
                teacherId: formData.get('teacherId') as string,
                teacherName: formData.get('teacherName') as string,
                roomId: formData.get('roomId') as string,
                roomName: formData.get('roomName') as string,
                groups: (formData.get('groups') as string).split(',').map(g => g.trim())
              });
              setShowAddModal(false);
            }}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Jour
                    </label>
                    <select
                      name="day"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {days.map(day => (
                        <option key={day.id} value={day.id}>{day.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="CM">CM - Cours Magistral</option>
                      <option value="TD">TD - Travaux Dirigés</option>
                      <option value="TP">TP - Travaux Pratiques</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Heure début
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Heure fin
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Cours
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    placeholder="Ex: Biologie Moléculaire"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input type="hidden" name="courseId" value={`COURSE_${Date.now()}`} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Enseignant
                  </label>
                  <input
                    type="text"
                    name="teacherName"
                    placeholder="Ex: Dr. Dupont"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input type="hidden" name="teacherId" value={`TEACHER_${Date.now()}`} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Salle
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    placeholder="Ex: Amphi A"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input type="hidden" name="roomId" value={`ROOM_${Date.now()}`} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Groupes (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    name="groups"
                    placeholder="Ex: L3-BIO-G1, L3-BIO-G2"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--accent-hugin)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Créer le créneau
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition (placeholder) */}
      {showEditModal && selectedSlot && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => {
            setShowEditModal(false);
            setSelectedSlot(null);
          }}
        >
          <div 
            className="card glass-panel"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Détails du Créneau</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSlot(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cours</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedSlot.courseName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Enseignant</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedSlot.teacherName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Salle</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedSlot.roomName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Horaires</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedSlot.startTime} - {selectedSlot.endTime}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Groupes</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedSlot.groups.map(group => (
                    <span
                      key={group}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSlot(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  deleteSlot(selectedSlot.id);
                  setShowEditModal(false);
                  setSelectedSlot(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTimetabling;
