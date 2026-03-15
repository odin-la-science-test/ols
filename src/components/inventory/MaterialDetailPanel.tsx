import React from 'react';
import { Package, MapPin, Building2, TrendingDown, TrendingUp, ExternalLink, Edit3, Trash2, History, X, Clock, Target, CalendarDays, Snowflake } from 'lucide-react';
import type { MaterialItem } from '../../types/labInventoryAdvanced';
import { getStatusColor, formatLocationFull } from '../../services/inventoryService';

interface MaterialDetailPanelProps {
  item: MaterialItem;
  onEdit: () => void;
  onDelete: () => void;
  onAdjustStock: (delta: number) => void;
  onClose: () => void;
  card: (extra?: React.CSSProperties) => React.CSSProperties;
}

export const MaterialDetailPanel: React.FC<MaterialDetailPanelProps> = ({ item, onEdit, onDelete, onAdjustStock, onClose, card }) => {
  const sc = getStatusColor(item.stock.status);
  
  const primarySupplier = item.suppliers.find(s => s.isPrimary) || item.suppliers[0];

  return (
    <div style={card({ position: 'relative', overflowY: 'auto', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' })}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary,#94a3b8)', cursor: 'pointer', padding: '0.25rem' }}>
        <X size={18} />
      </button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ padding: '0.2rem 0.6rem', backgroundColor: `${sc}20`, color: sc, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
            {item.stock.status}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#94a3b8)', fontWeight: 600 }}>{item.category}</span>
          {item.isCryogenic && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#06b6d4', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: '4px' }}>
              <Snowflake size={12} /> CRYO
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary,#f8fafc)', margin: '0 0 0.25rem' }}>{item.name}</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#94a3b8)', fontFamily: 'monospace' }}>RÉF: {item.internalRef}</div>
      </div>

      {item.description && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary,#94a3b8)', lineHeight: 1.5 }}>
          {item.description}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onAdjustStock(10)} title="Ajouter au stock" style={{ flex: 1, padding: '0.6rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
          <TrendingUp size={16} /> Ajouter +10
        </button>
        <button onClick={() => onAdjustStock(-10)} title="Retirer du stock" style={{ flex: 1, padding: '0.6rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
          <TrendingDown size={16} /> Retirer -10
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onEdit} style={{ flex: 1, padding: '0.6rem', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
          <Edit3 size={16} /> Modifier
        </button>
        <button onClick={onDelete} style={{ flex: 1, padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
          <Trash2 size={16} /> Supprimer
        </button>
      </div>

      {/* Stock Info */}
      <div style={{ backgroundColor: 'var(--input-bg,rgba(15,23,42,0.4))', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color,rgba(255,255,255,0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#94a3b8)', fontWeight: 600, textTransform: 'uppercase' }}>Qté en Stock</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: sc }}>
            {item.stock.quantity} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary,#94a3b8)' }}>{item.stock.unit}</span>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary,#94a3b8)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={12} color="#f59e0b"/> Limite : {item.stock.thresholdLimit}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={12} color="#ef4444"/> Critique : {item.stock.thresholdCritical}</span>
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: '#6366f1' }}>
          <MapPin size={20} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-primary,#f8fafc)', fontWeight: 600 }}>Localisation</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary,#94a3b8)', lineHeight: 1.4 }}>
            {formatLocationFull(item.location) || 'Aucune localisation définie'}
          </p>
        </div>
      </div>

      {/* Suppliers */}
      {primarySupplier && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-primary,#f8fafc)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              Fournisseur Principal
              {primarySupplier.unitPrice && <span style={{ color: '#10b981' }}>{primarySupplier.unitPrice} {primarySupplier.currency} / {item.stock.unit}</span>}
            </h4>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary,#94a3b8)', fontFamily: 'monospace' }}>
              {primarySupplier.name} — Réf: {primarySupplier.catalogRef}
            </p>
            {primarySupplier.orderUrl && (
              <a href={primarySupplier.orderUrl} target="_blank" rel="noopener noreferrer"
                 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                Acheter <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary,#f8fafc)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <History size={16} color="#94a3b8" /> Historique récent
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {item.history.slice(0, 5).map(evt => (
            <div key={evt.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', color: 'var(--text-secondary,#94a3b8)', paddingTop: '0.1rem' }}>
                 {evt.delta !== undefined && evt.delta !== 0 ? (
                   <span style={{ fontSize: '0.8rem', fontWeight: 700, color: evt.delta > 0 ? '#10b981' : '#ef4444' }}>
                     {evt.delta > 0 ? '+' : ''}{evt.delta}
                   </span>
                 ) : (
                   <CalendarDays size={14} />
                 )}
               </div>
               <div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-primary,#f8fafc)' }}>
                   {evt.type === 'PROTOCOL_USE' ? `Protocole: ${evt.protocolName}` : evt.details}
                 </div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary,#94a3b8)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                   <Clock size={10}/> {new Date(evt.date).toLocaleString('fr-FR')} par {evt.user}
                 </div>
               </div>
            </div>
          ))}
          {item.history.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#94a3b8)', fontStyle: 'italic' }}>
              Aucun historique disponible.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
