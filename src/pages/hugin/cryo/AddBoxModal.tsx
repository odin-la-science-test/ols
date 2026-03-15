// =============================================================================
// CryoKeeper 3D — Add Box Modal
// =============================================================================

import { useState } from 'react';
import type { CryoBox3D, Freezer3D } from './types';
import { BOX_COLOR_OPTIONS } from './types';
import { Box, Plus } from 'lucide-react';

interface AddBoxModalProps {
  freezer: Freezer3D;
  onAdd: (data: Omit<CryoBox3D, 'id' | 'tubes'>) => Promise<void>;
  onClose: () => void;
}

const AddBoxModal: React.FC<AddBoxModalProps> = ({ freezer, onAdd, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    rows: 9,
    cols: 9,
    shelfIndex: 0,
    color: BOX_COLOR_OPTIONS[0],
    position: { x: 0, y: 0 },
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onAdd({
      ...form,
      freezerId: freezer.id,
    });
    setSaving(false);
    onClose();
  };

  const GRID_PRESETS = [
    { label: '9 × 9', rows: 9, cols: 9 },
    { label: '10 × 10', rows: 10, cols: 10 },
    { label: '8 × 8', rows: 8, cols: 8 },
    { label: '5 × 5', rows: 5, cols: 5 },
  ];

  return (
    <div className="cryo3d-modal-overlay" onClick={onClose}>
      <div className="cryo3d-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(99,102,241,0.15)', borderRadius: '0.75rem', color: '#6366f1' }}>
            <Box size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Nouvelle Boîte</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
              Dans {freezer.name}
            </p>
          </div>
          <button className="cryo3d-btn cryo3d-btn-ghost" onClick={onClose} style={{ marginLeft: 'auto', padding: '0.4rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Nom de la boîte *</label>
            <input
              className="cryo3d-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="ex. Plasmides 2024 — Lot A"
              required
              autoFocus
            />
          </div>

          {/* Grid presets */}
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Format de grille</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {GRID_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="cryo3d-btn"
                  onClick={() => setForm(prev => ({ ...prev, rows: p.rows, cols: p.cols }))}
                  style={{
                    fontSize: '0.75rem', padding: '0.45rem',
                    background: form.rows === p.rows && form.cols === p.cols
                      ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.rows === p.rows && form.cols === p.cols
                      ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: form.rows === p.rows && form.cols === p.cols
                      ? '#818cf8' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="cryo3d-form-group">
              <label className="cryo3d-label">Lignes</label>
              <input className="cryo3d-input" type="number" min={1} max={26} value={form.rows}
                onChange={e => set('rows', parseInt(e.target.value) || 9)} />
            </div>
            <div className="cryo3d-form-group">
              <label className="cryo3d-label">Colonnes</label>
              <input className="cryo3d-input" type="number" min={1} max={20} value={form.cols}
                onChange={e => set('cols', parseInt(e.target.value) || 9)} />
            </div>
            <div className="cryo3d-form-group">
              <label className="cryo3d-label">Étagère</label>
              <select className="cryo3d-input" value={form.shelfIndex}
                onChange={e => set('shelfIndex', parseInt(e.target.value))}>
                {freezer.shelves.map(s => (
                  <option key={s.id} value={s.index}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color */}
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Couleur de la boîte</label>
            <div className="cryo3d-color-row">
              {BOX_COLOR_OPTIONS.map(c => (
                <div
                  key={c}
                  className={`cryo3d-color-swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>

          {/* Capacity preview */}
          <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
            Capacité : <strong style={{ color: 'white' }}>{form.rows * form.cols}</strong> tubes
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="cryo3d-btn cryo3d-btn-primary" disabled={saving} style={{ flex: 1 }}>
              <Plus size={15} /> {saving ? 'Création...' : 'Créer la boîte'}
            </button>
            <button type="button" className="cryo3d-btn cryo3d-btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoxModal;
