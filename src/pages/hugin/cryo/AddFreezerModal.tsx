// =============================================================================
// CryoKeeper 3D — Add Freezer Modal
// =============================================================================

import { useState } from 'react';
import type { Freezer3D, FreezerType } from './types';
import { FREEZER_COLOR_PRESETS, FREEZER_TYPE_TEMP, BOX_COLOR_OPTIONS } from './types';
import { Snowflake, Plus } from 'lucide-react';

const FREEZER_TYPES: FreezerType[] = ['+4°C', '-20°C', '-80°C', '-196°C (N₂)'];

interface AddFreezerModalProps {
  onAdd: (data: Omit<Freezer3D, 'id' | 'shelves'>) => Promise<void>;
  onClose: () => void;
}

const AddFreezerModal: React.FC<AddFreezerModalProps> = ({ onAdd, onClose }) => {
  const [form, setForm] = useState<Omit<Freezer3D, 'id' | 'shelves'>>({
    name: '',
    type: '-80°C',
    location: '',
    description: '',
    color: FREEZER_COLOR_PRESETS['-80°C'],
    capacity: 5,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleTypeChange = (t: FreezerType) => {
    setForm(prev => ({ ...prev, type: t, color: FREEZER_COLOR_PRESETS[t] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="cryo3d-modal-overlay" onClick={onClose}>
      <div className="cryo3d-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(99,102,241,0.15)', borderRadius: '0.75rem', color: '#6366f1' }}>
            <Snowflake size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Nouveau Congélateur</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
              Ajouter une unité de stockage cryogénique
            </p>
          </div>
          <button className="cryo3d-btn cryo3d-btn-ghost" onClick={onClose} style={{ marginLeft: 'auto', padding: '0.4rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Nom *</label>
            <input
              className="cryo3d-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="ex. Congélateur Proteines A"
              required
              autoFocus
            />
          </div>

          {/* Type selector */}
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Type de stockage</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {FREEZER_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className="cryo3d-btn"
                  style={{
                    background: form.type === t ? `${FREEZER_COLOR_PRESETS[t]}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.type === t ? FREEZER_COLOR_PRESETS[t] : 'rgba(255,255,255,0.08)'}`,
                    color: form.type === t ? FREEZER_COLOR_PRESETS[t] : 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem',
                    padding: '0.55rem 0.75rem',
                  }}
                >
                  {FREEZER_TYPE_TEMP[t]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="cryo3d-form-group">
              <label className="cryo3d-label">Emplacement</label>
              <input
                className="cryo3d-input"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="ex. Salle B — Zone Nord"
              />
            </div>
            <div className="cryo3d-form-group">
              <label className="cryo3d-label">Capacité (étagères)</label>
              <input
                className="cryo3d-input"
                type="number"
                min={1}
                max={10}
                value={form.capacity}
                onChange={e => set('capacity', parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Description</label>
            <input
              className="cryo3d-input"
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Usage principal, responsable..."
            />
          </div>

          {/* Color preview */}
          <div className="cryo3d-form-group">
            <label className="cryo3d-label">Couleur 3D</label>
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

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="cryo3d-btn cryo3d-btn-primary" disabled={saving} style={{ flex: 1 }}>
              <Plus size={15} /> {saving ? 'Création...' : 'Créer le congélateur'}
            </button>
            <button type="button" className="cryo3d-btn cryo3d-btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFreezerModal;
