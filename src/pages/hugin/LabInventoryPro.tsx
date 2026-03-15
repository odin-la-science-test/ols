// =============================================================================
// LabInventoryPro.tsx — Système LIMS avancé
// Inventaire complet : tableau de bord, fiches, commandes, visualisation 3D
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, AlertTriangle, Search, Download, Grid, List, Plus, Filter, X,
  RefreshCw, ShoppingCart, BarChart3, MapPin, Snowflake, ChevronRight,
  TrendingDown, TrendingUp, ExternalLink, Save, Trash2, Copy, History,
  Building2, Layers, Box, QrCode, ArrowLeft, Eye, Zap, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/ToastNotification';
import type {
  MaterialItem, MaterialCategory, StockStatus,
  InventoryFilters, SortFieldPro, SortDirection,
  SupplierInfo, HierarchicalLocation
} from '../../types/labInventoryAdvanced';
import {
  getAllItems, upsertItem, deleteItem as svcDeleteItem, computeStats,
  filterItems, sortItems, generateInternalRef, exportInventoryCSV,
  generatePurchaseOrder, getPurchaseOrders, getStatusColor, getStatusLabel,
  formatLocationFull, formatLocationShort, adjustStock, logEvent, loadDemoData,
  computeStockStatus, getUniqueBuildings, getUniqueRooms
} from '../../services/inventoryService';
import { syncCryoToInventory, getCryoStats, publishCryoAvailability } from '../../services/cryoIntegrationService';
import { LabStorageMap3D } from '../../components/inventory/LabStorageMap3D';
import { PurchaseOrderPanel } from '../../components/inventory/PurchaseOrderPanel';
import { MaterialDetailPanel } from '../../components/inventory/MaterialDetailPanel';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { value: MaterialCategory; label: string; color: string }[] = [
  { value: 'Equipment',   label: 'Équipements',         color: '#8b5cf6' },
  { value: 'Consumable',  label: 'Consommables',        color: '#f59e0b' },
  { value: 'Reagent',     label: 'Réactifs',            color: '#3b82f6' },
  { value: 'Glassware',   label: 'Verrerie',            color: '#10b981' },
  { value: 'SparePart',   label: 'Pièces détachées',    color: '#6b7280' },
  { value: 'Cryogenic',   label: 'Cryogéniques',        color: '#06b6d4' },
  { value: 'Chemical',    label: 'Chimiques',           color: '#ef4444' },
  { value: 'Other',       label: 'Autres',              color: '#94a3b8' },
];

const UNITS = ['unités', 'g', 'kg', 'mL', 'L', 'mg', 'µL', 'µg', 'boîtes', 'packs', 'bonbonnes', 'bidons', 'tubes', 'flacons', 'lots'];

const BLANK_LOCATION: HierarchicalLocation = { building: '', room: '', zone: '', furniture: '', cabinet: '', shelf: '', bin: '' };

const BLANK_SUPPLIER: Omit<SupplierInfo, 'id'> = { name: '', catalogRef: '', orderUrl: '', unitPrice: undefined, currency: 'EUR', leadTimeDays: undefined, isPrimary: true, notes: '' };

function newBlankItem(user: string): MaterialItem {
  return {
    id: `item_${Date.now()}`,
    name: '',
    category: 'Consumable',
    internalRef: generateInternalRef(),
    description: '',
    barcode: '',
    location: { ...BLANK_LOCATION },
    stock: { quantity: 0, unit: 'unités', thresholdLimit: 10, thresholdCritical: 5, status: 'BON' },
    suppliers: [{ id: `sup_${Date.now()}`, ...BLANK_SUPPLIER }],
    usage: { associatedProtocols: [] },
    history: [],
    isCryogenic: false,
    createdAt: new Date().toISOString(),
    createdBy: user,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'inventory' | 'orders' | '3d';

export const LabInventoryPro: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';

  const [items, setItems]               = useState<MaterialItem[]>([]);
  const [tab, setTab]                   = useState<Tab>('dashboard');
  const [viewMode, setViewMode]         = useState<'grid' | 'table'>('table');
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);
  const [editingItem, setEditingItem]   = useState<MaterialItem | null>(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [cryoStats, setCryoStats]       = useState({ totalFreezers: 0, totalBoxes: 0, totalSamples: 0, inventoryItems: 0 });
  const [searchTerm, setSearchTerm]     = useState('');
  const [selCats, setSelCats]           = useState<MaterialCategory[]>([]);
  const [selStatuses, setSelStatuses]   = useState<StockStatus[]>([]);
  const [sortField, setSortField]       = useState<SortFieldPro>('status');
  const [sortDir, setSortDir]           = useState<SortDirection>('asc');

  // Load data
  useEffect(() => {
    let stored = getAllItems();
    if (stored.length === 0) stored = loadDemoData();
    setItems(stored);
    setCryoStats(getCryoStats());
  }, []);

  const reload = useCallback(() => {
    setItems(getAllItems());
    setCryoStats(getCryoStats());
  }, []);

  const stats = useMemo(() => computeStats(items), [items]);

  const filteredItems = useMemo(() => {
    const filters: InventoryFilters = {
      searchTerm,
      categories: selCats.length > 0 ? selCats : undefined,
      statuses: selStatuses.length > 0 ? selStatuses : undefined,
    };
    return sortItems(filterItems(items, filters), sortField, sortDir);
  }, [items, searchTerm, selCats, selStatuses, sortField, sortDir]);

  const alertItems = useMemo(() => items.filter(i => i.stock.status !== 'BON'), [items]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!editingItem || !editingItem.name.trim()) {
      showToast('error', '❌ Nom requis'); return;
    }
    const updated = upsertItem({
      ...editingItem,
      stock: {
        ...editingItem.stock,
        status: computeStockStatus(editingItem.stock.quantity, editingItem.stock.thresholdLimit, editingItem.stock.thresholdCritical),
      },
    });
    setItems(updated);
    logEvent({ itemId: editingItem.id, type: 'MODIFICATION', date: new Date().toISOString(), user: currentUser, details: 'Fiche modifiée' });
    setEditingItem(null);
    setSelectedItem(null);
    showToast('success', '✅ Matériel sauvegardé');
  }, [editingItem, currentUser]);

  const handleDelete = useCallback((id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    setItems(svcDeleteItem(id));
    logEvent({ itemId: id, type: 'DELETION', date: new Date().toISOString(), user: currentUser, details: `Suppression de "${name}"` });
    setSelectedItem(null);
    setEditingItem(null);
    showToast('success', '🗑️ Supprimé');
  }, [currentUser]);

  const handleAdjustStock = useCallback((item: MaterialItem, delta: number) => {
    const updated = adjustStock(item.id, delta, currentUser);
    setItems(updated);
    showToast('success', `✅ Stock ${delta > 0 ? 'ajouté' : 'retiré'}`);
  }, [currentUser]);

  const handleCryoSync = useCallback(() => {
    const result = syncCryoToInventory(currentUser);
    publishCryoAvailability();
    reload();
    showToast('success', `🧊 Sync Cryo : ${result.updated} item(s) mis à jour`);
  }, [currentUser, reload]);

  const handleGenerateOrder = useCallback(() => {
    if (alertItems.length === 0) { showToast('warning', '⚠️ Aucun item à commander'); return; }
    generatePurchaseOrder(currentUser);
    setTab('orders');
    showToast('success', '📋 Liste de commande générée');
  }, [alertItems.length, currentUser]);

  const toggleSort = (field: SortFieldPro) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    backgroundColor: 'var(--bg-secondary, #1e293b)',
    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
    borderRadius: '12px',
    padding: '1.25rem',
    ...extra,
  });

  const btn = (color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1.1rem',
    backgroundColor: color, color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    ...extra,
  });

  const ghost = (extra?: React.CSSProperties): React.CSSProperties => ({
    ...btn('transparent', extra),
    color: 'var(--text-secondary, #94a3b8)',
    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/hugin')} style={ghost()}>
            <ArrowLeft size={16} /> Retour
          </button>
          <Database size={32} color="#6366f1" />
          <div>
            <h1 style={{ color: 'var(--text-primary, #f8fafc)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Lab Inventory Pro</h1>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem', margin: 0 }}>Système de gestion LIMS avancé</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {alertItems.length > 0 && (
            <button onClick={handleGenerateOrder} style={btn('#ef4444')}>
              <ShoppingCart size={16} />
              Commander ({alertItems.length})
            </button>
          )}
          <button onClick={handleCryoSync} style={btn('#06b6d4')}>
            <Snowflake size={16} /> Sync Cryo
          </button>
          <button onClick={() => exportInventoryCSV(items)} style={ghost()}>
            <Download size={16} /> CSV
          </button>
          <button onClick={() => { setEditingItem(newBlankItem(currentUser)); setTab('inventory'); }} style={btn('#6366f1')}>
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingBottom: '0' }}>
        {([
          { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart3 size={16} /> },
          { id: 'inventory', label: `Inventaire (${items.length})`, icon: <Package size={16} /> },
          { id: 'orders',    label: `Commandes${alertItems.length > 0 ? ` ⚠️${alertItems.length}` : ''}`, icon: <ShoppingCart size={16} /> },
          { id: '3d',        label: 'Visualisation 3D', icon: <Layers size={16} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              backgroundColor: tab === t.id ? 'var(--accent-hugin, #6366f1)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--text-secondary, #94a3b8)',
              border: 'none', borderRadius: '8px 8px 0 0',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              borderBottom: tab === t.id ? '2px solid var(--accent-hugin, #6366f1)' : '2px solid transparent',
            }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {/* ══════════════ DASHBOARD ══════════════ */}
      {tab === 'dashboard' && (
        <DashboardView
          stats={stats} alertItems={alertItems} cryoStats={cryoStats}
          onViewItem={item => { setSelectedItem(item); setTab('inventory'); }}
          onGenerateOrder={handleGenerateOrder}
          card={card} btn={btn} ghost={ghost}
        />
      )}

      {/* ══════════════ INVENTORY ══════════════ */}
      {tab === 'inventory' && (
        <InventoryView
          items={filteredItems} allItems={items}
          viewMode={viewMode} setViewMode={setViewMode}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          showFilters={showFilters} setShowFilters={setShowFilters}
          selCats={selCats} setSelCats={setSelCats}
          selStatuses={selStatuses} setSelStatuses={setSelStatuses}
          sortField={sortField} sortDir={sortDir} toggleSort={toggleSort}
          selectedItem={selectedItem} setSelectedItem={setSelectedItem}
          editingItem={editingItem} setEditingItem={setEditingItem}
          currentUser={currentUser}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdjustStock={handleAdjustStock}
          card={card} btn={btn} ghost={ghost}
        />
      )}

      {/* ══════════════ ORDERS ══════════════ */}
      {tab === 'orders' && (
        <PurchaseOrderPanel
          alertItems={alertItems}
          onGenerateOrder={handleGenerateOrder}
          orders={getPurchaseOrders()}
          card={card} btn={btn} ghost={ghost}
        />
      )}

      {/* ══════════════ 3D ══════════════ */}
      {tab === '3d' && (
        <LabStorageMap3D
          items={items}
          onLocateItem={item => { setSelectedItem(item); setTab('inventory'); }}
          card={card} btn={btn}
        />
      )}
    </div>
  );
};

// ─── Dashboard View ────────────────────────────────────────────────────────

function DashboardView({ stats, alertItems, cryoStats, onViewItem, onGenerateOrder, card, btn, ghost }: any) {
  const statCards = [
    { label: 'Total Items', value: stats.total, color: '#6366f1', icon: <Package size={22} /> },
    { label: 'BON',         value: stats.bon,   color: '#10b981', icon: <TrendingUp size={22} /> },
    { label: 'LIMITE',      value: stats.limite, color: '#f59e0b', icon: <AlertTriangle size={22} /> },
    { label: 'CRITIQUE',    value: stats.critique, color: '#ef4444', icon: <TrendingDown size={22} /> },
    { label: 'RUPTURE',     value: stats.rupture, color: '#7f1d1d', icon: <X size={22} /> },
    { label: 'Cryogéniques', value: stats.cryogenic, color: '#06b6d4', icon: <Snowflake size={22} /> },
    { label: 'Valeur totale', value: `${stats.totalValue.toFixed(0)}€`, color: '#8b5cf6', icon: <Database size={22} /> },
    { label: 'Alertes',     value: stats.alerts, color: '#f43f5e', icon: <Zap size={22} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem' }}>
        {statCards.map(sc => (
          <div key={sc.label} style={card({ borderLeft: `3px solid ${sc.color}` })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.8rem', fontWeight: 600 }}>{sc.label}</span>
              <span style={{ color: sc.color }}>{sc.icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: sc.color }}>{sc.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Alerts */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary,#f8fafc)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              <AlertTriangle size={16} style={{ display:'inline', marginRight:'0.4rem', color:'#ef4444' }} />
              Alertes de stock ({alertItems.length})
            </h3>
            {alertItems.length > 0 && (
              <button onClick={onGenerateOrder} style={btn('#ef4444', { fontSize: '0.78rem', padding: '0.4rem 0.8rem' })}>
                <ShoppingCart size={13} /> Générer commande
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
            {alertItems.length === 0 && <p style={{ color: 'var(--text-secondary,#94a3b8)', textAlign: 'center', padding: '2rem 0' }}>✅ Tous les stocks sont bons</p>}
            {alertItems.map(item => (
              <div key={item.id}
                onClick={() => onViewItem(item)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: `${getStatusColor(item.stock.status)}15`, border: `1px solid ${getStatusColor(item.stock.status)}40`, borderRadius: '8px', cursor: 'pointer' }}>
                <div>
                  <div style={{ color: 'var(--text-primary,#f8fafc)', fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem' }}>
                    {item.stock.quantity} {item.stock.unit} · {formatLocationShort(item.location)}
                  </div>
                </div>
                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: getStatusColor(item.stock.status), color: '#fff', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {item.stock.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cryo stats */}
        <div style={card()}>
          <h3 style={{ color: 'var(--text-primary,#f8fafc)', fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>
            <Snowflake size={16} style={{ display:'inline', marginRight:'0.4rem', color:'#06b6d4' }} />
            Intégration CryoKeeper
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Congélateurs', value: cryoStats.totalFreezers, color: '#06b6d4' },
              { label: 'Boîtes',       value: cryoStats.totalBoxes,    color: '#06b6d4' },
              { label: 'Échantillons', value: cryoStats.totalSamples,  color: '#06b6d4' },
              { label: 'Items Inventaire', value: cryoStats.inventoryItems, color: '#8b5cf6' },
            ].map(cs => (
              <div key={cs.label} style={{ padding: '0.75rem', backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)' }}>
                <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem' }}>{cs.label}</div>
                <div style={{ color: cs.color, fontSize: '1.5rem', fontWeight: 700 }}>{cs.value}</div>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.78rem', marginTop: '1rem', lineHeight: '1.4' }}>
            Le module Cryo3D est connecté en lecture/écriture. Utilisez le bouton "Sync Cryo" pour synchroniser.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory View ────────────────────────────────────────────────────────

function InventoryView({
  items, allItems, viewMode, setViewMode,
  searchTerm, setSearchTerm, showFilters, setShowFilters,
  selCats, setSelCats, selStatuses, setSelStatuses,
  sortField, sortDir, toggleSort,
  selectedItem, setSelectedItem, editingItem, setEditingItem,
  currentUser, onSave, onDelete, onAdjustStock,
  card, btn, ghost
}: any) {
  const buildings = useMemo(() => getUniqueBuildings(allItems), [allItems]);
  const rooms = useMemo(() => getUniqueRooms(allItems), [allItems]);

  const statusOptions: { value: StockStatus; color: string }[] = [
    { value: 'BON', color: '#10b981' }, { value: 'LIMITE', color: '#f59e0b' },
    { value: 'CRITIQUE', color: '#ef4444' }, { value: 'RUPTURE', color: '#7f1d1d' },
  ];

  function SortBtn({ field, label }: { field: SortFieldPro; label: string }) {
    const active = sortField === field;
    return (
      <span onClick={() => toggleSort(field)}
        style={{ cursor: 'pointer', color: active ? 'var(--accent-hugin,#6366f1)' : 'var(--text-secondary,#94a3b8)', fontWeight: active ? 700 : 400, userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
        {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
      </span>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editingItem || selectedItem ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary,#94a3b8)' }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher nom, référence, fournisseur, emplacement…"
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', backgroundColor: 'var(--input-bg,rgba(30,41,59,0.8))', border: '1px solid var(--border-color,rgba(255,255,255,0.1))', borderRadius: '8px', color: 'var(--text-primary,#f8fafc)', fontSize: '0.85rem' }} />
          </div>
          <button onClick={() => setShowFilters((v: boolean) => !v)} style={showFilters ? btn('#6366f1') : ghost()}>
            <Filter size={15} /> Filtres {(selCats.length + selStatuses.length) > 0 && `(${selCats.length + selStatuses.length})`}
          </button>
          <button onClick={() => setViewMode((v: string) => v === 'table' ? 'grid' : 'table')} style={ghost()}>
            {viewMode === 'table' ? <Grid size={15} /> : <List size={15} />}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={card({ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' })}>
            <div>
              <label style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>CATÉGORIES</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setSelCats((prev: MaterialCategory[]) => prev.includes(c.value) ? prev.filter((x: string) => x !== c.value) : [...prev, c.value])}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, backgroundColor: selCats.includes(c.value) ? c.color : `${c.color}20`, color: selCats.includes(c.value) ? '#fff' : c.color }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>STATUTS</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {statusOptions.map(s => (
                  <button key={s.value} onClick={() => setSelStatuses((prev: StockStatus[]) => prev.includes(s.value) ? prev.filter((x: string) => x !== s.value) : [...prev, s.value])}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, backgroundColor: selStatuses.includes(s.value) ? s.color : `${s.color}20`, color: selStatuses.includes(s.value) ? '#fff' : s.color }}>
                    {s.value}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setSelCats([]); setSelStatuses([]); setSearchTerm(''); }} style={ghost({ gridColumn: '1/-1', justifySelf: 'start', fontSize: '0.78rem' })}>
              <RefreshCw size={13} /> Réinitialiser
            </button>
          </div>
        )}

        <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.78rem', marginBottom: '0.6rem' }}>
          {items.length} item{items.length !== 1 ? 's' : ''} affiché{items.length !== 1 ? 's' : ''}
        </div>

        {/* Table view */}
        {viewMode === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color,rgba(255,255,255,0.1))' }}>
                  {[
                    ['name','Matériel'], ['category','Catégorie'], ['location','Localisation'],
                    ['quantity','Quantité'], ['status','Statut']
                  ].map(([f, l]) => (
                    <th key={f} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary,#94a3b8)', fontWeight: 600 }}>
                      <SortBtn field={f as SortFieldPro} label={l} />
                    </th>
                  ))}
                  <th style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary,#94a3b8)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const sc = getStatusColor(item.stock.status);
                  const cat = CATEGORIES.find(c => c.value === item.category);
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <tr key={item.id}
                      onClick={() => { setSelectedItem(item); setEditingItem(null); }}
                      style={{ borderBottom: '1px solid var(--border-color,rgba(255,255,255,0.06))', backgroundColor: isSelected ? `${sc}10` : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary,#f8fafc)' }}>{item.name}</div>
                        <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.72rem' }}>{item.internalRef}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', backgroundColor: `${cat?.color ?? '#6b7280'}20`, color: cat?.color ?? '#6b7280', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{cat?.label}</span>
                        {item.isCryogenic && <Snowflake size={12} style={{ marginLeft: '0.3rem', color: '#06b6d4', verticalAlign: 'middle' }} />}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary,#94a3b8)', maxWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={11} />
                          <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatLocationShort(item.location)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ color: sc, fontWeight: 700, fontSize: '0.95rem' }}>{item.stock.quantity}</span>
                        <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem' }}> {item.stock.unit}</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', backgroundColor: sc, color: '#fff', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700 }}>{item.stock.status}</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button title="+10" onClick={() => onAdjustStock(item, 10)} style={{ padding: '0.3rem 0.5rem', backgroundColor: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: '5px', color: '#10b981', cursor: 'pointer' }}><TrendingUp size={13} /></button>
                          <button title="-10" onClick={() => onAdjustStock(item, -10)} style={{ padding: '0.3rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '5px', color: '#ef4444', cursor: 'pointer' }}><TrendingDown size={13} /></button>
                          <button title="Éditer" onClick={() => { setEditingItem({ ...item }); setSelectedItem(null); }} style={{ padding: '0.3rem 0.5rem', backgroundColor: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: '5px', color: '#818cf8', cursor: 'pointer' }}><Eye size={13} /></button>
                          <button title="Supprimer" onClick={() => onDelete(item.id, item.name)} style={{ padding: '0.3rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '5px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary,#94a3b8)' }}>
                <Package size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                <p>Aucun item trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {items.map(item => {
              const sc = getStatusColor(item.stock.status);
              const cat = CATEGORIES.find(c => c.value === item.category);
              return (
                <div key={item.id} onClick={() => { setSelectedItem(item); setEditingItem(null); }}
                  style={{ ...card({ borderLeft: `3px solid ${sc}`, cursor: 'pointer', transition: 'transform 0.15s' }), position: 'relative' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.6rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', backgroundColor: `${cat?.color ?? '#6b7280'}20`, color: cat?.color, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>{cat?.label}</span>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: sc, color: '#fff', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700 }}>{item.stock.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary,#f8fafc)', marginBottom: '0.3rem' }}>{item.name}</div>
                  <div style={{ color: sc, fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.stock.quantity} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#94a3b8)' }}>{item.stock.unit}</span></div>
                  <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={11} />{formatLocationShort(item.location)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detail / Edit Panel ─── */}
      {(selectedItem && !editingItem) && (
        <MaterialDetailPanel
          item={selectedItem}
          onEdit={() => { setEditingItem({ ...selectedItem }); setSelectedItem(null); }}
          onDelete={() => onDelete(selectedItem.id, selectedItem.name)}
          onAdjustStock={(delta: number) => { onAdjustStock(selectedItem, delta); setSelectedItem(prev => prev ? { ...prev, stock: { ...prev.stock, quantity: Math.max(0, prev.stock.quantity + delta) } } : prev); }}
          onClose={() => setSelectedItem(null)}
          card={card}
        />
      )}
      {editingItem && (
        <ItemEditPanel
          item={editingItem} setItem={setEditingItem}
          onSave={onSave} onCancel={() => setEditingItem(null)}
          card={card} btn={btn} ghost={ghost}
        />
      )}
    </div>
  );
}

// ─── Item Edit Panel ───────────────────────────────────────────────────────

function ItemEditPanel({ item, setItem, onSave, onCancel, card, btn, ghost }: any) {
  const upd = (path: string, val: any) => {
    const parts = path.split('.');
    setItem((prev: MaterialItem) => {
      const copy: any = { ...prev };
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = val;
      return copy;
    });
  };

  const addSupplier = () => setItem((prev: MaterialItem) => ({
    ...prev,
    suppliers: [...prev.suppliers, { id: `sup_${Date.now()}`, ...BLANK_SUPPLIER, isPrimary: prev.suppliers.length === 0 }]
  }));

  const rmSupplier = (idx: number) => setItem((prev: MaterialItem) => ({
    ...prev,
    suppliers: prev.suppliers.filter((_: any, i: number) => i !== idx)
  }));

  const updSupplier = (idx: number, key: string, val: any) => setItem((prev: MaterialItem) => {
    const sups = [...prev.suppliers];
    sups[idx] = { ...sups[idx], [key]: val };
    return { ...prev, suppliers: sups };
  });

  const ipt = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', padding: '0.5rem 0.65rem',
    backgroundColor: 'var(--input-bg,rgba(15,23,42,0.6))',
    border: '1px solid var(--border-color,rgba(255,255,255,0.1))',
    borderRadius: '6px', color: 'var(--text-primary,#f8fafc)', fontSize: '0.82rem',
    boxSizing: 'border-box' as const, ...extra
  });

  const lbl = (text: string) => (
    <label style={{ display: 'block', color: 'var(--text-secondary,#94a3b8)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{text}</label>
  );

  return (
    <div style={card({ overflowY: 'auto', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1rem' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-primary,#f8fafc)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          {item.name || 'Nouveau matériel'}
        </h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary,#94a3b8)', cursor: 'pointer' }}><X size={18} /></button>
      </div>

      {/* Identité */}
      <section>
        <h4 style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Identité</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {lbl('Nom *')}
          <input style={ipt()} value={item.name} onChange={e => upd('name', e.target.value)} placeholder="Nom du matériel" />
          {lbl('Catégorie')}
          <select style={ipt()} value={item.category} onChange={e => upd('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {lbl('Référence interne')}
          <input style={ipt()} value={item.internalRef} onChange={e => upd('internalRef', e.target.value)} />
          {lbl('Description')}
          <textarea style={ipt({ height: '60px', resize: 'none' })} value={item.description ?? ''} onChange={e => upd('description', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', cursor: 'pointer', fontSize: '0.82rem' }}>
            <input type="checkbox" checked={item.isCryogenic} onChange={e => upd('isCryogenic', e.target.checked)} />
            <Snowflake size={14} /> Matériel cryogénique
          </label>
        </div>
      </section>

      {/* Localisation */}
      <section>
        <h4 style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Localisation</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {([['building','Bâtiment *'],['room','Salle *'],['zone','Zone'],['furniture','Meuble'],['cabinet','Placard'],['shelf','Étagère'],['bin','Bac']] as [string,string][]).map(([f, l]) => (
            <div key={f}>
              {lbl(l)}
              <input style={ipt()} value={(item.location as any)[f] ?? ''} onChange={e => upd(`location.${f}`, e.target.value)} placeholder={l} />
            </div>
          ))}
        </div>
      </section>

      {/* Stock */}
      <section>
        <h4 style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Stock</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>{lbl('Quantité')} <input type="number" style={ipt()} value={item.stock.quantity} onChange={e => upd('stock.quantity', Number(e.target.value))} /></div>
          <div>{lbl('Unité')} <select style={ipt()} value={item.stock.unit} onChange={e => upd('stock.unit', e.target.value)}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
          <div>{lbl('Seuil LIMITE')} <input type="number" style={ipt()} value={item.stock.thresholdLimit} onChange={e => upd('stock.thresholdLimit', Number(e.target.value))} /></div>
          <div>{lbl('Seuil CRITIQUE')} <input type="number" style={ipt()} value={item.stock.thresholdCritical} onChange={e => upd('stock.thresholdCritical', Number(e.target.value))} /></div>
        </div>
      </section>

      {/* Fournisseurs */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Fournisseurs</h4>
          <button onClick={addSupplier} style={ghost({ fontSize: '0.72rem', padding: '0.25rem 0.6rem' })}><Plus size={12} /> Ajouter</button>
        </div>
        {item.suppliers.map((sup: SupplierInfo, i: number) => (
          <div key={sup.id} style={{ border: '1px solid var(--border-color,rgba(255,255,255,0.1))', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#f59e0b', cursor: 'pointer' }}>
                <input type="radio" checked={sup.isPrimary} onChange={() => setItem((prev: MaterialItem) => ({ ...prev, suppliers: prev.suppliers.map((s, j) => ({ ...s, isPrimary: j === i })) }))} />
                Principal
              </label>
              {item.suppliers.length > 1 && <button onClick={() => rmSupplier(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={13} /></button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {[['name','Fournisseur'],['catalogRef','Réf. catalogue'],['orderUrl','URL commande'],['unitPrice','Prix unitaire'],['currency','Devise'],['leadTimeDays','Délai (jours)']] .map(([f, l]) => (
                <div key={f}>
                  {lbl(l)}
                  <input style={ipt()} value={(sup as any)[f] ?? ''} type={['unitPrice','leadTimeDays'].includes(f) ? 'number' : 'text'}
                    onChange={e => updSupplier(i, f, ['unitPrice','leadTimeDays'].includes(f) ? Number(e.target.value) : e.target.value)} placeholder={l} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
        <button onClick={onSave} style={btn('#6366f1', { flex: 1 })}><Save size={15} /> Sauvegarder</button>
        <button onClick={onCancel} style={ghost({ flex: 1 })}><X size={15} /> Annuler</button>
      </div>
    </div>
  );
}

export default LabInventoryPro;
