// =============================================================================
// CryoKeeper 3D — Tube Info Panel (slide-in from right)
// =============================================================================

import { useState } from 'react';
import type { CryoTube3D, CryoBox3D, SampleType } from './types';
import { SAMPLE_TYPE_COLORS, SAMPLE_TYPE_EMOJI } from './types';
import { X, Edit2, Trash2, FlaskRound, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import TubeForm from './TubeForm';

interface TubeInfoPanelProps {
  tube: CryoTube3D;
  tubeKey: string;
  box: CryoBox3D;
  onClose: () => void;
  onSave: (tubeKey: string, data: Omit<CryoTube3D, 'id' | 'history'>, existing: CryoTube3D) => Promise<void>;
  onDelete: (tubeKey: string) => Promise<void>;
  onLog: (action: 'retrieved' | 'returned' | 'noted', note?: string) => Promise<void>;
}

const ACTION_LABELS: Record<string, string> = {
  created: '🟢 Créé',
  updated: '🔵 Modifié',
  retrieved: '🟡 Prélevé',
  returned: '🟤 Remis',
  noted: '⚪ Note',
};

const TubeInfoPanel: React.FC<TubeInfoPanelProps> = ({
  tube, tubeKey, box, onClose, onSave, onDelete, onLog,
}) => {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const color = tube.color ?? SAMPLE_TYPE_COLORS[tube.sampleType as SampleType];
  const rowLabel = String.fromCharCode(65 + tube.row);
  const position = `${rowLabel}${tube.col + 1}`;
  const maxQty = Math.max(tube.quantity, 1);

  const handleSave = async (data: Omit<CryoTube3D, 'id' | 'history'>) => {
    await onSave(tubeKey, data, tube);
    setEditing(false);
  };

  const handleLog = async (action: 'retrieved' | 'returned' | 'noted') => {
    await onLog(action, action === 'noted' ? noteText : undefined);
    if (action === 'noted') setNoteText('');
  };

  return (
    <div className="cryo3d-info-panel">
      {/* Header */}
      <div className="cryo3d-info-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: '50%',
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: `0 0 16px ${color}88`,
            }}
          >
            {SAMPLE_TYPE_EMOJI[tube.sampleType as SampleType]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tube.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              {box.name} · Position {position}
            </div>
          </div>
        </div>
        <button className="cryo3d-btn cryo3d-btn-ghost" onClick={onClose} style={{ padding: '0.4rem' }}>
          <X size={16} />
        </button>
      </div>

      <div className="cryo3d-info-panel-body">
        {editing ? (
          <>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem' }}>
              Modification du tube
            </p>
            <TubeForm
              tubeKey={tubeKey}
              existing={tube}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          </>
        ) : (
          <>
            {/* Type badge */}
            <div>
              <span
                className="cryo3d-type-badge"
                style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
              >
                {SAMPLE_TYPE_EMOJI[tube.sampleType as SampleType]} {tube.sampleType}
              </span>
            </div>

            {/* Quantity bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Quantité restante</span>
                <span style={{ fontWeight: 600 }}>{tube.quantity} {tube.unit}</span>
              </div>
              <div className="cryo3d-quantity-track">
                <div
                  className="cryo3d-quantity-fill"
                  style={{ width: `${Math.min(100, (tube.quantity / maxQty) * 100)}%`, background: color }}
                />
              </div>
            </div>

            {/* Metadata */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Métadonnées
              </div>
              <div className="cryo3d-meta-table">
                <span className="cryo3d-meta-key">Propriétaire</span>
                <span className="cryo3d-meta-val">{tube.owner || '—'}</span>
                <span className="cryo3d-meta-key">Date</span>
                <span className="cryo3d-meta-val">{tube.date}</span>
                {tube.concentration && <>
                  <span className="cryo3d-meta-key">Concentration</span>
                  <span className="cryo3d-meta-val">{tube.concentration}</span>
                </>}
                {tube.volume && <>
                  <span className="cryo3d-meta-key">Volume</span>
                  <span className="cryo3d-meta-val">{tube.volume}</span>
                </>}
                <span className="cryo3d-meta-key">Position</span>
                <span className="cryo3d-meta-val">{position} · {box.name}</span>
              </div>
            </div>

            {/* Notes */}
            {tube.notes && (
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Notes</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{tube.notes}</p>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Actions rapides
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="cryo3d-btn cryo3d-btn-ghost" style={{ fontSize: '0.75rem' }}
                  onClick={() => handleLog('retrieved')}>
                  🟡 Prélèvement
                </button>
                <button className="cryo3d-btn cryo3d-btn-ghost" style={{ fontSize: '0.75rem' }}
                  onClick={() => handleLog('returned')}>
                  🟤 Remise
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  className="cryo3d-input"
                  placeholder="Ajouter une note..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleLog('noted'); }}
                />
                <button className="cryo3d-btn cryo3d-btn-ghost" onClick={() => handleLog('noted')} disabled={!noteText.trim()}>
                  +
                </button>
              </div>
            </div>

            {/* History collapsible */}
            <div>
              <button
                className="cryo3d-btn cryo3d-btn-ghost"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}
                onClick={() => setShowHistory(v => !v)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} /> Historique ({tube.history.length})
                </span>
                {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showHistory && (
                <div style={{ marginTop: '0.5rem', maxHeight: 180, overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {[...tube.history].reverse().map((entry, i) => (
                    <div key={i} className="cryo3d-history-entry">
                      <div className="cryo3d-history-dot" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>
                          {entry.user} · {new Date(entry.date).toLocaleString('fr-FR')}
                        </div>
                        {entry.note && (
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                            {entry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit / Delete row */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="cryo3d-btn cryo3d-btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Modifier
              </button>
              {confirmDelete ? (
                <>
                  <button className="cryo3d-btn cryo3d-btn-danger" style={{ flex: 1 }} onClick={() => onDelete(tubeKey)}>
                    <Trash2 size={14} /> Confirmer
                  </button>
                  <button className="cryo3d-btn cryo3d-btn-ghost" onClick={() => setConfirmDelete(false)}>✕</button>
                </>
              ) : (
                <button className="cryo3d-btn cryo3d-btn-danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TubeInfoPanel;
