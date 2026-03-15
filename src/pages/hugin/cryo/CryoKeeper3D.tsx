// =============================================================================
// CryoKeeper 3D — Main Entry Page Component
// Monté sur /hugin/cryo3d — ne modifie pas l'existant /hugin/cryo
// =============================================================================

import './cryo3d.css';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Snowflake, Plus, Search,
  Box, Thermometer, RotateCcw,
} from 'lucide-react';
import { useToast } from '../../../components/ToastContext';
import { useCryoStore } from './useCryoStore';
import CryoScene3D from './CryoScene3D';
import BoxGrid from './BoxGrid';
import TubeInfoPanel from './TubeInfoPanel';
import AddFreezerModal from './AddFreezerModal';
import AddBoxModal from './AddBoxModal';
import SearchPanel from './SearchPanel';
import type { CryoTube3D } from './types';
import { FREEZER_COLOR_PRESETS, FREEZER_TYPE_TEMP } from './types';

type ModalType = 'addFreezer' | 'addBox' | null;

const CryoKeeper3D = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const store = useCryoStore();
  const [modal, setModal] = useState<ModalType>(null);

  // ─── Freezer actions ────────────────────────────────────────────────────────
  const handleAddFreezer = async (data: Parameters<typeof store.addFreezer>[0]) => {
    await store.addFreezer(data);
    showToast('Congélateur créé avec succès', 'success');
    setModal(null);
  };

  const handleFreezerClick = useCallback(() => {
    store.setIsFreezerOpen(!store.isFreezerOpen);
  }, [store.isFreezerOpen, store.setIsFreezerOpen]);

  // ─── Box actions ────────────────────────────────────────────────────────────
  const handleAddBox = async (data: Parameters<typeof store.addBox>[0]) => {
    await store.addBox(data);
    showToast('Boîte créée avec succès', 'success');
    setModal(null);
  };

  const handleBoxClick = useCallback((boxId: string) => {
    store.selectBox(boxId);
    showToast('Boîte sélectionnée — vue grille', 'info');
  }, [store.selectBox]);

  // ─── Tube actions ────────────────────────────────────────────────────────────
  const handleSaveTube = async (
    tubeKey: string,
    data: Omit<CryoTube3D, 'id' | 'history'>,
    existing?: CryoTube3D,
  ) => {
    if (!store.selectedBox) return;
    await store.saveTube(store.selectedBox.id, tubeKey, data, existing);
    showToast(existing ? 'Tube mis à jour' : 'Tube créé', 'success');
  };

  const handleDeleteTube = async (tubeKey: string) => {
    if (!store.selectedBox) return;
    await store.deleteTube(store.selectedBox.id, tubeKey);
    showToast('Tube supprimé', 'success');
  };

  const handleLogTube = async (
    action: 'retrieved' | 'returned' | 'noted',
    note?: string,
  ) => {
    if (!store.selectedBox || !store.selectedTubeKey) return;
    await store.logTubeAction(store.selectedBox.id, store.selectedTubeKey, action, note);
    showToast('Action enregistrée dans l\'historique', 'success');
  };

  // ─── Search navigation ───────────────────────────────────────────────────────
  const handleSearchNavigate = (freezerId: string, boxId: string, tubeKey: string) => {
    store.selectFreezer(freezerId);
    // Small delay to let freezer select settle, then open box
    setTimeout(() => {
      store.selectBox(boxId);
      setTimeout(() => store.selectTube(tubeKey), 100);
    }, 100);
  };

  // ─── Back navigation ─────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (store.viewMode === 'tube' || store.viewMode === 'box') {
      store.selectTube(null);
      store.setViewMode('freezer');
    } else {
      store.setViewMode('freezer');
    }
  }, [store.viewMode]);

  const handleBoxBack = () => {
    store.selectTube(null);
    store.setViewMode('freezer');
  };

  // ─── Box positions for 3D scene (distribute across shelf) ────────────────────
  const boxesWithPositions = store.boxes.map((b, i) => ({
    ...b,
    position: { x: i % 5, y: Math.floor(i / 5) },
  }));

  if (store.isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Chargement CryoKeeper 3D...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          borderRadius: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="cryo3d-btn cryo3d-btn-ghost"
            onClick={() => navigate('/hugin')}
            style={{ padding: '0.5rem' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ padding: '0.6rem', background: 'rgba(99,102,241,0.15)', borderRadius: '0.75rem', color: '#818cf8' }}>
            <Snowflake size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              CryoKeeper <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '0.15rem 0.5rem', borderRadius: '0.5rem', fontWeight: 600, verticalAlign: 'middle' }}>3D</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
              Visualisation immersive du stockage cryogénique
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {store.viewMode !== 'freezer' && (
          <div className="cryo3d-breadcrumb" style={{ display: 'none', flex: 1, justifyContent: 'center' }}>
            <span className="cryo3d-breadcrumb-item" onClick={() => store.setViewMode('freezer')}>
              {store.selectedFreezer?.name}
            </span>
            {store.selectedBox && <>
              <span className="cryo3d-breadcrumb-sep">›</span>
              <span className="cryo3d-breadcrumb-item active">{store.selectedBox.name}</span>
            </>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="cryo3d-btn cryo3d-btn-ghost"
            onClick={() => store.setIsSearchOpen(true)}
            title="Rechercher un tube (Ctrl+K)"
          >
            <Search size={16} /> Recherche
          </button>
          <button
            className="cryo3d-btn cryo3d-btn-ghost"
            onClick={() => setModal('addBox')}
            disabled={!store.selectedFreezer}
            title="Nouvelle boîte"
          >
            <Box size={16} /> Boîte
          </button>
          <button
            className="cryo3d-btn cryo3d-btn-primary"
            onClick={() => setModal('addFreezer')}
          >
            <Plus size={16} /> Congélateur
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────────── */}
      <div className="cryo3d-layout">
        {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
        <aside className="cryo3d-sidebar">
          {/* Freezer list */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              Congélateurs ({store.freezers.length})
            </div>
            {store.freezers.map(f => (
              <div
                key={f.id}
                className={`cryo3d-freezer-card ${store.selectedFreezerId === f.id ? 'active' : ''}`}
                onClick={() => store.selectFreezer(f.id)}
              >
                <div
                  className="cryo3d-freezer-dot"
                  style={{ background: f.color, color: f.color }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>
                    {FREEZER_TYPE_TEMP[f.type]} · {f.location || 'Emplacement non défini'}
                  </div>
                </div>
                <Thermometer size={14} style={{ color: f.color, opacity: 0.7, flexShrink: 0 }} />
              </div>
            ))}
            {store.freezers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
                Aucun congélateur
              </div>
            )}
          </div>

          {/* Boxes in selected freezer */}
          {store.selectedFreezer && (
            <div className="glass-panel" style={{ padding: '1.25rem', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                Boîtes — {store.selectedFreezer.name}
              </div>
              {store.boxesForFreezer.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
                  <Box size={24} style={{ opacity: 0.2, display: 'block', margin: '0 auto 0.5rem' }} />
                  Aucune boîte
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {store.boxesForFreezer.map(b => (
                    <div
                      key={b.id}
                      className={`cryo3d-freezer-card ${store.selectedBoxId === b.id ? 'active' : ''}`}
                      onClick={() => store.selectBox(b.id)}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '0.25rem', background: b.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                          {b.rows}×{b.cols} · {Object.keys(b.tubes).length} tubes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats card */}
          {store.selectedFreezer && (
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Statistiques
              </div>
              {(() => {
                const totalSlots = store.boxesForFreezer.reduce((a, b) => a + b.rows * b.cols, 0);
                const usedSlots = store.boxesForFreezer.reduce((a, b) => a + Object.keys(b.tubes).length, 0);
                const pct = totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Occupation</span>
                      <span style={{ fontWeight: 600 }}>{usedSlots} / {totalSlots} ({pct}%)</span>
                    </div>
                    <div className="cryo3d-quantity-track">
                      <div
                        className="cryo3d-quantity-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#6366f1',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Boîtes</span>
                      <span>{store.boxesForFreezer.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Température</span>
                      <span style={{ color: FREEZER_COLOR_PRESETS[store.selectedFreezer.type] }}>
                        {FREEZER_TYPE_TEMP[store.selectedFreezer.type]}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <main className="cryo3d-main">
          {store.viewMode === 'freezer' && (
            <>
              {/* Freezer info bar */}
              {store.selectedFreezer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: store.selectedFreezer.color, boxShadow: `0 0 8px ${store.selectedFreezer.color}` }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{store.selectedFreezer.name}</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                    {store.selectedFreezer.location}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: FREEZER_COLOR_PRESETS[store.selectedFreezer.type], fontWeight: 600 }}>
                    {FREEZER_TYPE_TEMP[store.selectedFreezer.type]}
                  </span>
                  <button
                    className="cryo3d-btn cryo3d-btn-ghost"
                    onClick={handleFreezerClick}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {store.isFreezerOpen ? '🔓 Fermer' : '🔒 Ouvrir'}
                  </button>
                  <button
                    className="cryo3d-btn cryo3d-btn-ghost"
                    onClick={() => store.setIsFreezerOpen(false)}
                    style={{ padding: '0.4rem' }}
                    title="Réinitialiser vue"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}

              {/* 3D Canvas */}
              <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <div className="cryo3d-canvas-wrapper" style={{ width: '100%', height: '100%' }}>
                  {store.selectedFreezer ? (
                    <CryoScene3D
                      freezer={store.selectedFreezer}
                      boxes={boxesWithPositions}
                      isFreezerOpen={store.isFreezerOpen}
                      onFreezerClick={handleFreezerClick}
                      onBoxClick={handleBoxClick}
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                      <Snowflake size={48} style={{ opacity: 0.15 }} />
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                        Sélectionnez un congélateur ou créez-en un
                      </p>
                      <button className="cryo3d-btn cryo3d-btn-primary" onClick={() => setModal('addFreezer')}>
                        <Plus size={16} /> Nouveau congélateur
                      </button>
                    </div>
                  )}
                </div>

                {/* Hint overlay */}
                {store.selectedFreezer && (
                  <div className="cryo3d-hint">
                    <div className="cryo3d-hint-item">🖱️ Glisser pour tourner</div>
                    <div className="cryo3d-hint-item">🔍 Scroll pour zoomer</div>
                    <div className="cryo3d-hint-item">👆 Clic sur boîte pour ouvrir</div>
                  </div>
                )}
              </div>
            </>
          )}

          {(store.viewMode === 'box' || store.viewMode === 'tube') && store.selectedBox && (
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <BoxGrid
                box={store.selectedBox}
                selectedTubeKey={store.selectedTubeKey}
                onSelectTube={key => {
                  store.selectTube(key);
                }}
                onSaveTube={handleSaveTube}
                onBack={handleBoxBack}
              />

              {/* Tube info panel slide-in */}
              {store.selectedTube && store.selectedTubeKey && store.selectedBox && (
                <TubeInfoPanel
                  tube={store.selectedTube}
                  tubeKey={store.selectedTubeKey}
                  box={store.selectedBox}
                  onClose={() => store.selectTube(null)}
                  onSave={async (key, data, existing) => handleSaveTube(key, data, existing)}
                  onDelete={handleDeleteTube}
                  onLog={handleLogTube}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────────── */}
      {modal === 'addFreezer' && (
        <AddFreezerModal
          onAdd={handleAddFreezer}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'addBox' && store.selectedFreezer && (
        <AddBoxModal
          freezer={store.selectedFreezer}
          onAdd={handleAddBox}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Search overlay ──────────────────────────────────────────────────────── */}
      {store.isSearchOpen && (
        <SearchPanel
          onSearch={store.searchTubes}
          onNavigate={handleSearchNavigate}
          onClose={() => store.setIsSearchOpen(false)}
        />
      )}
    </div>
  );
};

export default CryoKeeper3D;
