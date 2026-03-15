import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Clock, Monitor, Box as BoxIcon } from 'lucide-react';
import { getUserReservations, cancelReservation } from '../../services/reservationService';
import { getEquipments, getRooms } from '../../services/equipmentService';
import type { Reservation, UserProfile } from '../../types/reservationSystem';

interface MyReservationsProps {
  currentUser: UserProfile;
}

export default function MyReservations({ currentUser }: MyReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Fetch data
  const loadData = () => {
    setReservations(getUserReservations(currentUser.id).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    ));
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCancel = (reservationId: string) => {
    if (window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      if (cancelReservation(reservationId, currentUser.id)) {
        loadData();
      }
    }
  };

  const equipments = getEquipments();
  const rooms = getRooms();

  const getTargetName = (id: string, type: 'ROOM' | 'EQUIPMENT') => {
    if (type === 'ROOM') {
      const room = rooms.find(r => r.id === id);
      return room ? room.name : 'Salle inconnue';
    } else {
      const eq = equipments.find(e => e.id === id);
      return eq ? eq.name : 'Équipement inconnu';
    }
  };

  if (reservations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        <Calendar size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h3>Aucune réservation</h3>
        <p>Vous n'avez effectué aucune réservation pour le moment.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>Historique de vos réservations</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reservations.map(res => {
          const isCancelled = res.status === 'CANCELLED';
          const isPast = new Date(res.endTime).getTime() < Date.now();
          const isActive = !isCancelled && !isPast && new Date(res.startTime).getTime() <= Date.now();

          let statusColor = '#94a3b8'; // default (past/completed)
          let statusText = 'Terminée';

          if (isCancelled) {
            statusColor = '#ef4444';
            statusText = 'Annulée';
          } else if (isActive) {
            statusColor = '#10b981';
            statusText = 'En cours';
          } else if (!isPast) {
            statusColor = '#3b82f6';
            statusText = 'À venir';
          }

          const start = new Date(res.startTime);
          const end = new Date(res.endTime);

          return (
            <div key={res.id} className="glass-panel" style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.5rem', borderRadius: '12px', 
              borderLeft: `4px solid ${statusColor}`,
              borderRight: '1px solid rgba(255,255,255,0.05)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(15,23,42,0.6)'
            }}>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
                  {res.type === 'ROOM' ? <BoxIcon size={24} /> : <Monitor size={24} />}
                </div>

                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>
                    {getTargetName(res.targetId, res.type)}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#94a3b8" />
                      {start.toLocaleDateString('fr-FR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} color="#94a3b8" />
                      {start.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    {res.projectId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
                        <span style={{ fontWeight: 600 }}>Projet :</span> {res.projectId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: statusColor, padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px' }}>
                  {statusText}
                </span>

                {(!isPast && !isCancelled) && (
                  <button 
                    onClick={() => handleCancel(res.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', opacity: 0.8, marginTop: '0.5rem' }}
                  >
                    <Trash2 size={14} /> Annuler la réservation
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
