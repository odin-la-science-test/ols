import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, Filter, Edit3, Trash2, Check, X, AlertCircle, Users, MapPin } from 'lucide-react';
import { showToast } from '../../components/ToastNotification';

interface Equipment {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  description?: string;
  specifications?: string;
  maintenanceDate?: string;
  image?: string;
}

interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const CATEGORIES = [
  'Microscope',
  'Centrifugeuse',
  'Spectrophotomètre',
  'PCR',
  'Incubateur',
  'Autoclave',
  'Balance',
  'pH-mètre',
  'Agitateur',
  'Autre'
];

export const EquipmentBooking: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'calendar' | 'list' | 'equipment'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedEquipments = localStorage.getItem('lab_equipments');
    const savedBookings = localStorage.getItem('lab_bookings');
    
    if (savedEquipments) setEquipments(JSON.parse(savedEquipments));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  };

  const saveEquipments = (data: Equipment[]) => {
    localStorage.setItem('lab_equipments', JSON.stringify(data));
    setEquipments(data);
  };

  const saveBookings = (data: Booking[]) => {
    localStorage.setItem('lab_bookings', JSON.stringify(data));
    setBookings(data);
  };

  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = {
      ...equipment,
      id: Date.now().toString()
    };
    saveEquipments([...equipments, newEquipment]);
    showToast('success', '✅ Équipement ajouté');
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const updated = equipments.map(e => e.id === id ? { ...e, ...updates } : e);
    saveEquipments(updated);
    showToast('success', '✅ Équipement mis à jour');
  };

  const deleteEquipment = (id: string) => {
    if (confirm('Supprimer cet équipement ?')) {
      saveEquipments(equipments.filter(e => e.id !== id));
      showToast('success', '🗑️ Équipement supprimé');
    }
  };

  const createBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    saveBookings([...bookings, newBooking]);
    showToast('success', '✅ Réservation créée');
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    saveBookings(updated);
    showToast('success', '✅ Statut mis à jour');
  };

  const deleteBooking = (id: string) => {
    if (confirm('Annuler cette réservation ?')) {
      saveBookings(bookings.filter(b => b.id !== id));
      showToast('success', '🗑️ Réservation annulée');
    }
  };

  const getEquipmentBookings = (equipmentId: string, date: string) => {
    return bookings.filter(b => 
      b.equipmentId === equipmentId && 
      b.startDate === date &&
      b.status !== 'cancelled'
    );
  };

  const isEquipmentAvailable = (equipmentId: string, date: string, startTime: string, endTime: string) => {
    const dayBookings = getEquipmentBookings(equipmentId, date);
    return !dayBookings.some(b => {
      const bookingStart = b.startTime;
      const bookingEnd = b.endTime;
      return (startTime >= bookingStart && startTime < bookingEnd) ||
             (endTime > bookingStart && endTime <= bookingEnd) ||
             (startTime <= bookingStart && endTime >= bookingEnd);
    });
  };

  const filteredEquipments = equipments.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || e.category === filterCategory;
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const todayBookings = bookings.filter(b => b.startDate === selectedDate);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Modal Ajout/Édition Équipement */}
      {showEquipmentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>
              {editingEquipment ? 'Modifier l\'Équipement' : 'Nouvel Équipement'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const equipmentData = {
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                location: formData.get('location') as string,
                status: formData.get('status') as Equipment['status'],
                description: formData.get('description') as string,
                specifications: formData.get('specifications') as string,
                maintenanceDate: formData.get('maintenanceDate') as string
              };
              
              if (editingEquipment) {
                updateEquipment(editingEquipment.id, equipmentData);
              } else {
                addEquipment(equipmentData);
              }
              setShowEquipmentModal(false);
              setEditingEquipment(null);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Nom de l'équipement *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingEquipment?.name}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingEquipment?.category}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Localisation *
                  </label>
                  <input
                    name="location"
                    type="text"
                    required
                    defaultValue={editingEquipment?.location}
                    placeholder="Ex: Salle 201, Paillasse 3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Statut *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingEquipment?.status || 'available'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="available">Disponible</option>
                    <option value="in-use">En utilisation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Réservé</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingEquipment?.description}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Spécifications techniques
                  </label>
                  <textarea
                    name="specifications"
                    defaultValue={editingEquipment?.specifications}
                    rows={2}
                    placeholder="Ex: Vitesse max 15000 rpm, Capacité 50ml"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Prochaine maintenance
                  </label>
                  <input
                    name="maintenanceDate"
                    type="date"
                    defaultValue={editingEquipment?.maintenanceDate}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editingEquipment ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEquipmentModal(false);
                    setEditingEquipment(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réservation */}
      {showBookingModal && editingEquipment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>
              Réserver: {editingEquipment.name}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const startDate = formData.get('startDate') as string;
              const startTime = formData.get('startTime') as string;
              const endTime = formData.get('endTime') as string;
              
              if (!isEquipmentAvailable(editingEquipment.id, startDate, startTime, endTime)) {
                showToast('error', '❌ Créneau non disponible');
                return;
              }
              
              const bookingData = {
                equipmentId: editingEquipment.id,
                equipmentName: editingEquipment.name,
                userId: currentUser,
                userName: currentUser,
                startDate,
                endDate: startDate,
                startTime,
                endTime,
                purpose: formData.get('purpose') as string,
                notes: formData.get('notes') as string
              };
              
              createBooking(bookingData);
              setShowBookingModal(false);
              setEditingEquipment(null);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Date *
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    defaultValue={selectedDate}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Heure début *
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                      Heure fin *
                    </label>
                    <input
                      name="endTime"
                      type="time"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Objectif *
                  </label>
                  <input
                    name="purpose"
                    type="text"
                    required
                    placeholder="Ex: Centrifugation échantillons ADN"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Informations complémentaires..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Réserver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setEditingEquipment(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Réservation d'Équipement
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {equipments.length} équipement(s) • {bookings.length} réservation(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowEquipmentModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Ajouter Équipement
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {(['equipment', 'calendar', 'list'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: view === v ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: view === v ? 'white' : '#60a5fa',
              border: `1px solid ${view === v ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {v === 'equipment' ? 'Équipements' : v === 'calendar' ? 'Calendrier' : 'Liste'}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <option value="">Tous statuts</option>
          <option value="available">Disponible</option>
          <option value="in-use">En utilisation</option>
          <option value="maintenance">Maintenance</option>
          <option value="reserved">Réservé</option>
        </select>
      </div>

      {/* Equipment View */}
      {view === 'equipment' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredEquipments.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px'
            }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Aucun équipement trouvé</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Ajoutez votre premier équipement pour commencer
              </p>
            </div>
          ) : (
            filteredEquipments.map(equipment => (
              <div
                key={equipment.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {equipment.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <MapPin size={14} />
                      {equipment.location}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: equipment.status === 'available' ? 'rgba(16, 185, 129, 0.2)' : 
                                   equipment.status === 'in-use' ? 'rgba(239, 68, 68, 0.2)' :
                                   equipment.status === 'maintenance' ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(59, 130, 246, 0.2)',
                    color: equipment.status === 'available' ? '#10b981' : 
                          equipment.status === 'in-use' ? '#ef4444' :
                          equipment.status === 'maintenance' ? '#f59e0b' :
                          '#3b82f6',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {equipment.status === 'available' ? 'Disponible' :
                     equipment.status === 'in-use' ? 'En cours' :
                     equipment.status === 'maintenance' ? 'Maintenance' :
                     'Réservé'}
                  </span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {equipment.category}
                </div>
                {equipment.description && (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {equipment.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingEquipment(equipment);
                      setShowBookingModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    Réserver
                  </button>
                  <button
                    onClick={() => {
                      setEditingEquipment(equipment);
                      setShowEquipmentModal(true);
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteEquipment(equipment.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '1rem'
              }}
            />
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Réservations du {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </h3>
          {todayBookings.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Aucune réservation pour cette date
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayBookings.map(booking => (
                <div
                  key={booking.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {booking.equipmentName}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                        <Users size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        {booking.userName}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        {booking.purpose}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' :
                                     booking.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                                     booking.status === 'completed' ? 'rgba(100, 116, 139, 0.2)' :
                                     'rgba(239, 68, 68, 0.2)',
                      color: booking.status === 'confirmed' ? '#10b981' :
                            booking.status === 'pending' ? '#f59e0b' :
                            booking.status === 'completed' ? '#94a3b8' :
                            '#ef4444',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {booking.status === 'confirmed' ? 'Confirmé' :
                       booking.status === 'pending' ? 'En attente' :
                       booking.status === 'completed' ? 'Terminé' :
                       'Annulé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Toutes les Réservations
          </h3>
          {bookings.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Aucune réservation
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {booking.equipmentName}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {new Date(booking.startDate).toLocaleDateString('fr-FR')} • {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
