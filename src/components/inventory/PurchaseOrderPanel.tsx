import React, { useState } from 'react';
import { ShoppingCart, Download, ExternalLink, Printer, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderLine } from '../../types/labInventoryAdvanced';
import { getStatusColor } from '../../services/inventoryService';
import { showToast } from '../ToastNotification';

interface PurchaseOrderPanelProps {
  alertItems: any[];
  onGenerateOrder: () => void;
  orders: PurchaseOrder[];
  card: (extra?: React.CSSProperties) => React.CSSProperties;
  btn: (color: string, extra?: React.CSSProperties) => React.CSSProperties;
  ghost: (extra?: React.CSSProperties) => React.CSSProperties;
}

export const PurchaseOrderPanel: React.FC<PurchaseOrderPanelProps> = ({ alertItems, onGenerateOrder, orders, card, btn, ghost }) => {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(orders[0] || null);

  const printOrder = () => {
    window.print();
    showToast('success', 'Impression lancée');
  };

  const exportCSV = (order: PurchaseOrder) => {
    const headers = ['Matériel', 'Fournisseur', 'Réf. Catalogue', 'Quantité Actuelle', 'Quantité à Commander', 'Unité', 'Prix Unitaire Démontré', 'Prix Total Estimé'];
    const rows = order.lines.map(l => [
      l.itemName, l.supplier.name, l.supplier.catalogRef,
      l.currentQuantity, l.recommendedQty, l.unit,
      l.supplier.unitPrice || '', l.estimatedCost || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commande-${order.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Sidebar: Historique */}
      <div style={card({ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' })}>
        <button onClick={onGenerateOrder} disabled={alertItems.length === 0} style={btn('#6366f1', { width: '100%', justifyContent: 'center' })}>
          <Plus size={16} /> Nouvelle Liste
        </button>
        <div style={{ borderBottom: '1px solid var(--border-color,rgba(255,255,255,0.1))', margin: '0.5rem 0' }}></div>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#94a3b8)', textTransform: 'uppercase', margin: 0 }}>Historique des listes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orders.map(o => (
            <div key={o.id} onClick={() => setSelectedOrder(o)}
              style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: selectedOrder?.id === o.id ? 'rgba(99,102,241,0.15)' : 'transparent', border: `1px solid ${selectedOrder?.id === o.id ? 'rgba(99,102,241,0.3)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ color: selectedOrder?.id === o.id ? '#818cf8' : 'var(--text-primary,#f8fafc)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Liste du {new Date(o.generatedAt).toLocaleDateString('fr-FR')}
              </div>
              <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{o.lines.length} items</span>
                <span>{o.totalEstimatedCost ? `${o.totalEstimatedCost.toFixed(2)}€` : ''}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
              Aucune liste générée.
            </div>
          )}
        </div>
      </div>

      {/* Main: Détail de la commande */}
      {selectedOrder ? (
        <div style={card({ minHeight: '60vh' })}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary,#f8fafc)', margin: '0 0 0.5rem' }}>
                Liste de Commande
              </h2>
              <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.85rem' }}>
                Générée le {new Date(selectedOrder.generatedAt).toLocaleString('fr-FR')} par {selectedOrder.generatedBy}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={printOrder} style={ghost()}><Printer size={16} /> Imprimer</button>
              <button onClick={() => exportCSV(selectedOrder)} style={ghost()}><Download size={16} /> CSV</button>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ShoppingCart size={24} color="#ef4444" />
            <div>
              <h4 style={{ color: '#ef4444', margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700 }}>Lecture Seule</h4>
              <p style={{ color: 'var(--text-secondary,#94a3b8)', margin: 0, fontSize: '0.8rem' }}>Cette liste est générée pour faciliter vos achats. Le système LIMS ne passe <strong>aucune commande automatique</strong> auprès des fournisseurs.</p>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color,rgba(255,255,255,0.1))', color: 'var(--text-secondary,#94a3b8)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Matériel</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fournisseur & Réf</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock Actuel</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qté à Commander</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Prix Est.</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Lien</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.lines.map((line: PurchaseOrderLine, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color,rgba(255,255,255,0.05))' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary,#f8fafc)', marginBottom: '0.2rem' }}>{line.itemName}</div>
                      <span style={{ padding: '0.2rem 0.5rem', backgroundColor: `${getStatusColor(line.status)}20`, color: getStatusColor(line.status), borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {line.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: 'var(--text-primary,#f8fafc)' }}>{line.supplier.name}</div>
                      <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{line.supplier.catalogRef}</div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary,#94a3b8)' }}>
                      {line.currentQuantity} <span style={{ fontSize: '0.7rem' }}>{line.unit}</span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', backgroundColor: 'var(--input-bg,rgba(15,23,42,0.6))', border: '1px solid var(--border-color,rgba(255,255,255,0.1))', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 700, color: '#10b981' }}>
                        {line.recommendedQty} <span style={{ fontSize: '0.75rem' }}>{line.unit}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary,#f8fafc)', fontWeight: 600 }}>
                      {line.estimatedCost ? `${line.estimatedCost.toFixed(2)}€` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {line.supplier.orderUrl ? (
                        <a href={line.supplier.orderUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.6rem', backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', textDecoration: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Acheter <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary,#94a3b8)' }}>
                    TOTAL ESTIMÉ :
                  </td>
                  <td style={{ padding: '1.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary,#f8fafc)', fontSize: '1.25rem' }}>
                    {selectedOrder.totalEstimatedCost ? `${selectedOrder.totalEstimatedCost.toFixed(2)}€` : '-'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div style={card({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-secondary,#94a3b8)' })}>
          <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>Sélectionnez une liste dans l'historique ou générez-en une nouvelle.</p>
        </div>
      )}
    </div>
  );
};
