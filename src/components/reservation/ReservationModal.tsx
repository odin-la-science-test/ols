import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { UserProfile, Room, Equipment, ReservationType } from '../../types/reservationSystem';
import { requestReservation, hasTimeConflict } from '../../services/reservationService';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  type: ReservationType;
  currentUser: UserProfile;
  onSuccess: () => void;
}

export default function ReservationModal({ isOpen, onClose, targetId, targetName, type, currentUser, onSuccess }: ReservationModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState('2');
  const [project, setProject] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setProject('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setDurationHours('2');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReserve = () => {
    setError('');
    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      
      // Calculate end time
      const endDate = new Date(`${date}T${startTime}:00`);
      endDate.setHours(endDate.getHours() + parseInt(durationHours, 10));
      const endDateTime = endDate.toISOString();

      // Quick visual conflict check before hitting service
      if (hasTimeConflict(targetId, startDateTime, endDateTime)) {
        setError('Ce créneau est déjà réservé. Veuillez choisir un autre horaire.');
        setIsSubmitting(false);
        return;
      }

      const result = requestReservation(
        currentUser,
        targetId,
        type,
        startDateTime,
        endDateTime,
        project || undefined
      );

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Erreur lors de la réservation.');
      }
    } catch (err) {
      setError('Erreur de format de date/heure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '16px', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc', fontSize: '1.5rem', paddingRight: '2rem' }}>
          Réserver {targetName}
        </h2>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>Date de réservation</label>
            <div style={{ position: 'relative' }}>
              <CalendarIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevents past dates
                className="input-field"
                style={{ width: '100%', paddingLeft: '2.5rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>Heure de début</label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>Durée</label>
              <select 
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="input-field"
                style={{ width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem' }}
              >
                <option value="1">1 Heure</option>
                <option value="2">2 Heures</option>
                <option value="3">3 Heures</option>
                <option value="4">4 Heures</option>
                <option value="8">Journée entière (8h)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>Projet associé (Optionnel)</label>
            <input 
              type="text" 
              placeholder="Ex: TP Mécanique Avancée"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="input-field"
              style={{ width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={handleReserve}
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-hugin)', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            <CheckCircle size={18} />
            {isSubmitting ? 'Validation...' : 'Confirmer'}
          </button>
        </div>

      </div>
    </div>
  );
}
