import React, { useState, useEffect } from 'react';
import { Search, Lock, Box, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { getRooms } from '../../services/equipmentService';
import { canReserveItem } from '../../services/accessControlService';
import type { Room, UserProfile } from '../../types/reservationSystem';
import ReservationModal from './ReservationModal';

interface RoomCatalogProps {
  currentUser: UserProfile;
}

export default function RoomCatalog({ currentUser }: RoomCatalogProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Room | null>(null);

  useEffect(() => {
    setRooms(getRooms());
  }, []);

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Rechercher une salle..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
        />
      </div>

      {/* Room Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredRooms.map(room => {
          const access = canReserveItem(currentUser, room);
          const isMaintenance = room.condition === 'MAINTENANCE';

          return (
            <div key={room.id} className="glass-panel" style={{ 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: `1px solid ${isMaintenance ? 'rgba(245,158,11,0.3)' : access.granted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
              opacity: (access.granted && !isMaintenance) ? 1 : 0.6,
              display: 'flex', flexDirection: 'column', gap: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {!access.granted && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '1rem' }}>
                  <Lock size={32} color="#f8fafc" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Accès Restreint</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{access.reason}</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>{room.name}</h3>
                  </div>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                {room.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <Users size={14} color="#94a3b8" /> Capacité : {room.capacity} personnes
                </div>
                
                {room.condition === 'AVAILABLE' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10b981' }}>
                    <CheckCircle size={14} /> Disponible
                  </div>
                )}
                
                {room.condition === 'MAINTENANCE' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                    <AlertTriangle size={14} style={{ marginTop: '0.1rem' }} /> 
                    <span>En cours de maintenance globale</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button 
                  onClick={() => {
                    setSelectedItem(room);
                    setIsModalOpen(true);
                  }}
                  disabled={!access.granted || isMaintenance}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: (access.granted && !isMaintenance) ? 'var(--accent-hugin)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, cursor: (access.granted && !isMaintenance) ? 'pointer' : 'not-allowed' }}
                >
                  Réserver un créneau
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Aucune salle ne correspond à votre recherche.
        </div>
      )}

      {selectedItem && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetId={selectedItem.id}
          targetName={selectedItem.name}
          type="ROOM"
          currentUser={currentUser}
          onSuccess={() => {
            alert("Réservation confirmée avec succès !");
            setIsModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
