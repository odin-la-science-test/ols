import React, { useState, useEffect } from 'react';
import { Layers, Calendar, Monitor, Box, AlertTriangle, ShieldAlert, FileText, CheckCircle, BarChart2, MapPin } from 'lucide-react';
import { useDeviceDetection } from '../../../hooks/useDeviceDetection';
import { getMockStudentProfile, getMockTechnicianProfile } from '../../../services/accessControlService';
import type { UserProfile } from '../../../types/reservationSystem';

// Lazy loading the subcomponents (we'll implement them next)
import EquipmentCatalog from '../../../components/reservation/EquipmentCatalog';
import RoomCatalog from '../../../components/reservation/RoomCatalog';
import MyReservations from '../../../components/reservation/MyReservations';
import MaintenancePanel from '../../../components/reservation/MaintenancePanel';
import RoomMap3D from '../../../components/reservation/RoomMap3D';
import ReservationModal from '../../../components/reservation/ReservationModal';
import type { Equipment, Room } from '../../../types/reservationSystem';
// import StatisticsDashboard from '../../../components/reservation/StatisticsDashboard';

type Tab = 'equipments' | 'rooms' | 'my_reservations' | 'map3d' | 'stats' | 'maintenance';

export default function ReservationSystem() {
  const { isMobile } = useDeviceDetection();
  const [activeTab, setActiveTab] = useState<Tab>('equipments');
  
  // Mock User State (for testing access control)
  const [currentUser, setCurrentUser] = useState<UserProfile>(getMockStudentProfile());

  // Toggle user role for demonstration
  const toggleUserRole = () => {
    setCurrentUser(prev => 
      prev.role === 'student' ? getMockTechnicianProfile() : getMockStudentProfile()
    );
  };

  const tabs: { id: Tab, label: string, icon: React.ReactNode, adminOnly?: boolean }[] = [
    { id: 'equipments', label: 'Équipements', icon: <Monitor size={18} /> },
    { id: 'rooms', label: 'Salles', icon: <Box size={18} /> },
    { id: 'my_reservations', label: 'Mes Réservations', icon: <Calendar size={18} /> },
    { id: 'map3d', label: 'Vue 3D', icon: <MapPin size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <AlertTriangle size={18} />, adminOnly: true },
    { id: 'stats', label: 'Statistiques', icon: <BarChart2 size={18} />, adminOnly: true },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: isMobile ? '1rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
            <Layers color="var(--accent-hugin, #6366f1)" /> 
            Réservation & Équipements
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Plateforme de réservation de matériel et de salles avec contrôle d'accès
          </p>
        </div>

        {/* User Role Switcher (Mock Tool) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{currentUser.name}</span>
            <span style={{ fontSize: '0.75rem', color: currentUser.role === 'student' ? '#60a5fa' : '#f59e0b', fontWeight: 600 }}>
              {currentUser.role.toUpperCase()}
            </span>
          </div>
          <button 
            onClick={toggleUserRole}
            style={{ 
              padding: '0.4rem 0.8rem', 
              background: 'var(--accent-hugin, #6366f1)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            Changer le rôle
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.filter(t => !t.adminOnly || currentUser.role === 'technician' || currentUser.role === 'admin').map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'var(--accent-hugin, #6366f1)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1 }}>
        {activeTab === 'equipments' && <EquipmentCatalog currentUser={currentUser} />}
        {activeTab === 'rooms' && <RoomCatalog currentUser={currentUser} />}
        {activeTab === 'my_reservations' && <MyReservations currentUser={currentUser} />}
        {activeTab === 'map3d' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>Carte Interactive des Salles</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Survolez ou cliquez sur un équipement pour interagir.</p>
            </div>
            {/* The wrapper component for 3D Map interacts with the Reservation Modal */}
            <Map3DWrapper currentUser={currentUser} />
          </div>
        )}
        {activeTab === 'maintenance' && <MaintenancePanel currentUser={currentUser} />}
        {activeTab === 'stats' && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            <BarChart2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>Statistiques (À venir)</h3>
          </div>
        )}
      </main>

    </div>
  );
}

// Wrapper for the 3D map to handle the reservation modal popup
function Map3DWrapper({ currentUser }: { currentUser: UserProfile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);

  const handleEqClick = (eq: Equipment) => {
    if (eq.condition === 'OUT_OF_ORDER' || eq.condition === 'MAINTENANCE') {
      alert("Cet équipement est actuellement en maintenance ou hors-service. Vous ne pouvez pas le réserver.");
      return;
    }
    // We could add accessControlService check here, but let's keep it simple and just show the modal, which has checks inside
    setSelectedEq(eq);
    setIsModalOpen(true);
  };

  return (
    <>
      <RoomMap3D onEquipmentClick={handleEqClick} />
      
      {selectedEq && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetId={selectedEq.id}
          targetName={selectedEq.name}
          type="EQUIPMENT"
          currentUser={currentUser}
          onSuccess={() => {
            alert("Réservation via la carte 3D confirmée !");
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
