import React, { useState } from 'react';
import { Search, X, Lock, FileText, CheckCircle } from 'lucide-react';
import type { Protocol } from './types';

interface ProtocolSelectorModalProps {
  protocols: Protocol[];
  onSelect: (protocol: Protocol) => void;
  onClose: () => void;
}

export const ProtocolSelectorModal: React.FC<ProtocolSelectorModalProps> = ({ protocols, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProtocols = protocols.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="#3b82f6" />
            Sélectionner un protocole
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, description ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredProtocols.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Aucun protocole validé trouvé.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Allez dans "Protocol Builder" pour valider un protocole.</p>
            </div>
          ) : (
            filteredProtocols.map(protocol => (
              <div
                key={protocol.id}
                onClick={() => onSelect(protocol)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>
                    <Lock size={12} /> Validé v{protocol.version}
                  </div>
                </div>
                
                <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', width: '80%' }}>
                  {protocol.name}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {protocol.description}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {protocol.category}
                  </span>
                  <span>⏱️ {protocol.estimatedTime || 'N/A'}</span>
                  <span>📊 {protocol.difficulty || 'Moyen'}</span>
                  <span>📝 {protocol.steps.length} étapes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
