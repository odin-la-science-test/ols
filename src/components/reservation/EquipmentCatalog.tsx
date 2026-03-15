import React, { useState, useEffect } from 'react';
import { Search, Lock, ShieldAlert, Monitor, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import { getEquipments } from '../../services/equipmentService';
import { canReserveItem } from '../../services/accessControlService';
import type { Equipment, UserProfile } from '../../types/reservationSystem';
import ReservationModal from './ReservationModal';

interface EquipmentCatalogProps {
  currentUser: UserProfile;
}

export default function EquipmentCatalog({ currentUser }: EquipmentCatalogProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  useEffect(() => {
    setEquipments(getEquipments());
  }, []);

  const filteredEquipments = equipments.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Rechercher un équipement..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
        />
      </div>

      {/* Equipment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredEquipments.map(eq => {
          const access = canReserveItem(currentUser, eq);
          const isOut = eq.condition === 'OUT_OF_ORDER';

          return (
            <div key={eq.id} className="glass-panel" style={{ 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: `1px solid ${isOut ? 'rgba(239,68,68,0.3)' : access.granted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
              opacity: (access.granted && !isOut) ? 1 : 0.6,
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
                  <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: '#818cf8' }}>
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>{eq.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{eq.category} • Réf: {eq.inventoryNumber}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Navigation size={14} color="#94a3b8" />
                  <span style={{ color: '#cbd5e1' }}>Salle : {eq.roomId}</span>
                </div>
                
                {eq.condition === 'AVAILABLE' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10b981' }}>
                    <CheckCircle size={14} /> Disponible
                  </div>
                )}
                
                {eq.condition === 'OUT_OF_ORDER' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                    <AlertTriangle size={14} style={{ marginTop: '0.1rem' }} /> 
                    <span>En panne : {eq.maintenanceNotes}</span>
                  </div>
                )}

                {eq.requiresTrainingId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                    <ShieldAlert size={14} /> Requis: Formation {eq.requiresTrainingId}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button 
                  onClick={() => {
                    setSelectedItem(eq);
                    setIsModalOpen(true);
                  }}
                  disabled={!access.granted || isOut}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: (access.granted && !isOut) ? 'var(--accent-hugin)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, cursor: (access.granted && !isOut) ? 'pointer' : 'not-allowed' }}
                >
                  Réserver un créneau
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredEquipments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Aucun équipement ne correspond à votre recherche.
        </div>
      )}

      {selectedItem && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetId={selectedItem.id}
          targetName={selectedItem.name}
          type="EQUIPMENT"
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
