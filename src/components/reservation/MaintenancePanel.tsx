import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, CheckCircle, Search, Box } from 'lucide-react';
import { getEquipments, updateEquipmentCondition, getMaintenanceTickets, reportIncident } from '../../services/equipmentService';
import type { Equipment, MaintenanceTicket, UserProfile } from '../../types/reservationSystem';

interface MaintenancePanelProps {
  currentUser: UserProfile;
}

export default function MaintenancePanel({ currentUser }: MaintenancePanelProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Incident Report Form State
  const [selectedEqId, setSelectedEqId] = useState('');
  const [issueDesc, setIssueDesc] = useState('');

  const loadData = () => {
    setEquipments(getEquipments());
    setTickets(getMaintenanceTickets());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId || !issueDesc) return;
    
    reportIncident(selectedEqId, currentUser.id, issueDesc);
    setIssueDesc('');
    setSelectedEqId('');
    loadData();
    alert("Incident signalé avec succès. L'équipement a été placé hors-service.");
  };

  const handleResolveTicket = (ticketId: string, eqId: string) => {
    const allTickets = getMaintenanceTickets();
    const idx = allTickets.findIndex(t => t.id === ticketId);
    if (idx > -1) {
      allTickets[idx].status = 'RESOLVED';
      allTickets[idx].resolvedAt = new Date().toISOString();
      localStorage.setItem('psm_maintenance_tickets', JSON.stringify(allTickets));
      
      // Remettre l'équipement en service
      updateEquipmentCondition(eqId, 'AVAILABLE', '');
      loadData();
    }
  };

  // Only admins and technicians can resolve tickets. Students can only report.
  const isTech = currentUser.role === 'admin' || currentUser.role === 'technician';

  const filteredEquipments = equipments.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* LEFT COLUMN: Report form + Active tickets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle color="#ef4444" /> Signaler un incident
          </h2>
          <form onSubmit={handleReportIncident} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Équipement concerné</label>
              <select 
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                required
              >
                <option value="">-- Sélectionner un équipement --</option>
                {equipments.filter(e => e.condition !== 'OUT_OF_ORDER').map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.inventoryNumber})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description de la panne</label>
              <textarea 
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                className="input-field"
                placeholder="Décrivez le problème rencontré (ex: Buse bouchée, erreur E05)..."
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}
                required
              />
            </div>

            <button type="submit" style={{ padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Déclarer Hors-Service
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#cbd5e1' }}>Tickets ouverts ({tickets.filter(t => t.status !== 'RESOLVED').length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.filter(t => t.status !== 'RESOLVED').map(ticket => {
              const eq = equipments.find(e => e.id === ticket.equipmentId);
              return (
                <div key={ticket.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>{eq?.name || 'Inconnu'}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    "{ticket.issueDescription}"
                  </p>
                  
                  {isTech && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleResolveTicket(ticket.id, ticket.equipmentId)}
                        style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <CheckCircle size={14} /> Marquer comme résolu
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {tickets.filter(t => t.status !== 'RESOLVED').length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                Aucun ticket ouvert. Tout est fonctionnel !
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Equipment Status Directory (Tech only) */}
      {isTech && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wrench color="#3b82f6" /> État du parc matériel
          </h2>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '2.5rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {filteredEquipments.map(eq => {
              const isOut = eq.condition === 'OUT_OF_ORDER';
              const isMaintenance = eq.condition === 'MAINTENANCE';
              
              let statusColor = '#10b981';
              let statusIcon = <CheckCircle size={16} />;
              let statusText = 'Opérationnel';
              
              if (isOut) {
                statusColor = '#ef4444';
                statusIcon = <AlertTriangle size={16} />;
                statusText = 'Hors-Service';
              } else if (isMaintenance) {
                statusColor = '#f59e0b';
                statusIcon = <Wrench size={16} />;
                statusText = 'Maintenance';
              }

              return (
                <div key={eq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${statusColor}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{eq.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Box size={12} /> {eq.roomId} • Réf: {eq.inventoryNumber}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: statusColor, fontSize: '0.85rem', fontWeight: 600, background: `${statusColor}22`, padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                    {statusIcon} {statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
