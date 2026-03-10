import { useState } from 'react';
import { Building, MapPin, Clock } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const CampusServices = () => {
  const [services] = useState([
    { id: '1', name: 'Restaurant Universitaire', type: 'restaurant', location: 'Bâtiment A', openingHours: [{ day: 'Lundi-Vendredi', open: '11:30', close: '14:00' }], capacity: 200, currentOccupancy: 145, bookingRequired: false },
    { id: '2', name: 'Bibliothèque Centrale', type: 'library', location: 'Bâtiment B', openingHours: [{ day: 'Lundi-Samedi', open: '08:00', close: '20:00' }], capacity: 150, currentOccupancy: 87, bookingRequired: true }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Building size={40} />
            Services Campus
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Réservations et accès aux services</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {services.map(s => (
            <div key={s.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <MapPin size={16} />
                <span>{s.location}</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {s.openingHours.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    <span>{h.day}: {h.open} - {h.close}</span>
                  </div>
                ))}
              </div>
              {s.capacity && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Occupation</span>
                    <span style={{ fontWeight: 600 }}>{s.currentOccupancy}/{s.capacity}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.currentOccupancy! / s.capacity) * 100}%`, background: 'var(--accent-hugin)' }} />
                  </div>
                </div>
              )}
              {s.bookingRequired && (
                <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Réserver
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusServices;
