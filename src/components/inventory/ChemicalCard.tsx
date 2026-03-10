import React from 'react';
import { Edit3, Trash2, Copy, TrendingUp, TrendingDown, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import type { Chemical } from '../../utils/inventoryHelpers';
import { getChemicalStatus, formatLocation, getDaysUntilExpiry } from '../../utils/inventoryHelpers';

interface ChemicalCardProps {
  chemical: Chemical;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onDuplicate: (chemical: Chemical) => void;
  onAdjustStock: (chemical: Chemical, amount: number) => void;
  hazards: Array<{ code: string; name: string; img: string; color: string }>;
  categories: Array<{ value: string; color: string }>;
}

export const ChemicalCard: React.FC<ChemicalCardProps> = ({
  chemical,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustStock,
  hazards,
  categories
}) => {
  const status = getChemicalStatus(chemical);
  const categoryColor = categories.find(c => c.value === chemical.category)?.color || '#6b7280';
  const daysUntilExpiry = getDaysUntilExpiry(chemical.expiryDate);

  const statusConfig = {
    'ok': { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', label: 'OK' },
    'low-stock': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', label: 'Stock bas' },
    'expiring-soon': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', label: 'Expire bientôt' },
    'expired': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', label: 'Expiré' }
  };

  const config = statusConfig[status];

  return (
    <div
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '1.5rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => onEdit(chemical)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 16px ${config.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Badge de statut */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: config.text,
        color: 'white',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {config.label}
      </div>

      {/* Nom et CAS */}
      <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          marginBottom: '0.25rem'
        }}>
          {chemical.name}
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          CAS: {chemical.cas}
        </p>
      </div>

      {/* Catégorie */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          padding: '0.375rem 0.75rem',
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          {chemical.category}
        </span>
      </div>

      {/* Quantité */}
      <div style={{ 
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: status === 'low-stock' ? '#f59e0b' : 'var(--text-primary)',
          marginBottom: '0.25rem'
        }}>
          {chemical.quantity} {chemical.unit}
        </div>
        {chemical.minQuantity > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Min: {chemical.minQuantity} {chemical.unit}
          </div>
        )}
      </div>

      {/* Localisation */}
      {formatLocation(chemical.location) !== 'Non spécifié' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          <MapPin size={14} />
          <span>{formatLocation(chemical.location)}</span>
        </div>
      )}

      {/* Expiration */}
      {chemical.expiryDate && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem',
          color: status === 'expired' || status === 'expiring-soon' ? config.text : 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          <Calendar size={14} />
          <span>
            {new Date(chemical.expiryDate).toLocaleDateString('fr-FR')}
            {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
              <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                ({daysUntilExpiry} jours)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Pictogrammes de danger */}
      {chemical.hazards.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          {chemical.hazards.slice(0, 4).map((h, i) => {
            const hazard = hazards.find(hz => hz.code === h);
            return hazard ? (
              <img
                key={i}
                src={hazard.img}
                alt={hazard.name}
                title={hazard.name}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
            ) : null;
          })}
          {chemical.hazards.length > 4 && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              alignSelf: 'center'
            }}>
              +{chemical.hazards.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onAdjustStock(chemical, 10)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: '#10b981',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Ajouter au stock"
        >
          <TrendingUp size={14} />
        </button>
        <button
          onClick={() => onAdjustStock(chemical, -10)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Retirer du stock"
        >
          <TrendingDown size={14} />
        </button>
        <button
          onClick={() => onDuplicate(chemical)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Dupliquer"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(chemical.id)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
