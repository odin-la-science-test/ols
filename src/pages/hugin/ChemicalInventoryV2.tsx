import React, { useState, useEffect } from 'react';
import { 
  Beaker, Plus, AlertTriangle, Search, Calendar, Download, Grid, List, 
  Edit3, Trash2, Package, TrendingDown, TrendingUp, Filter, X, Save, 
  Copy, BarChart3, MapPin, FileText, Settings, RefreshCw
} from 'lucide-react';
import { showToast } from '../../components/ToastNotification';
import { useAutoSave } from '../../hooks/useAutoSave';
import { StatCard } from '../../components/inventory/StatCard';
import { ChemicalCard } from '../../components/inventory/ChemicalCard';
import type { Chemical, FilterOptions, SortField, SortDirection } from '../../utils/inventoryHelpers';
import {
  calculateStats,
  filterChemicals,
  sortChemicals,
  exportToCSV,
  isExpiringSoon,
  isExpired,
  isLowStock,
  formatLocation
} from '../../utils/inventoryHelpers';

const CATEGORIES = [
  { value: 'Solvants', color: '#3b82f6' },
  { value: 'Acides', color: '#ef4444' },
  { value: 'Bases', color: '#8b5cf6' },
  { value: 'Sels', color: '#10b981' },
  { value: 'Réactifs', color: '#f59e0b' },
  { value: 'Indicateurs', color: '#ec4899' },
  { value: 'Tampons', color: '#06b6d4' },
  { value: 'Autres', color: '#6b7280' }
];

const HAZARDS = [
  { code: 'GHS01', name: 'Explosif', img: '/ghs/ghs01.gif', color: '#ef4444' },
  { code: 'GHS02', name: 'Inflammable', img: '/ghs/ghs02.gif', color: '#f59e0b' },
  { code: 'GHS03', name: 'Comburant', img: '/ghs/ghs03.gif', color: '#f59e0b' },
  { code: 'GHS04', name: 'Gaz sous pression', img: '/ghs/ghs04.gif', color: '#64748b' },
  { code: 'GHS05', name: 'Corrosif', img: '/ghs/ghs05.gif', color: '#ef4444' },
  { code: 'GHS06', name: 'Toxique', img: '/ghs/ghs06.gif', color: '#ef4444' },
  { code: 'GHS07', name: 'Nocif', img: '/ghs/ghs07.gif', color: '#f59e0b' },
  { code: 'GHS08', name: 'Danger santé', img: '/ghs/ghs08.gif', color: '#ef4444' },
  { code: 'GHS09', name: 'Environnement', img: '/ghs/ghs09.gif', color: '#10b981' }
];

const UNITS = ['mL', 'L', 'g', 'kg', 'mg', 'µL', 'µg', 'unités'];

export const ChemicalInventoryV2: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres avancés
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Tri
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const saved = localStorage.getItem('chemical_inventory_v2');
    if (saved) {
      setChemicals(JSON.parse(saved));
    } else {
      // Migration depuis l'ancienne version
      const oldData = localStorage.getItem('chemical_inventory');
      if (oldData) {
        setChemicals(JSON.parse(oldData));
      }
    }
  }, []);

  const saveChemicals = (newChemicals: Chemical[]) => {
    localStorage.setItem('chemical_inventory_v2', JSON.stringify(newChemicals));
    setChemicals(newChemicals);
  };

  useAutoSave({
    data: chemicals,
    onSave: (data) => localStorage.setItem('chemical_inventory_v2', JSON.stringify(data)),
    interval: 30000
  });

  const addChemical = () => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newChem: Chemical = {
      id: Date.now().toString(),
      name: '',
      cas: '',
      category: 'Autres',
      quantity: 0,
      minQuantity: 0,
      unit: 'mL',
      location: {},
      expiryDate: '',
      hazards: [],
      supplier: '',
      history: [{
        date: new Date().toISOString(),
        action: 'Création',
        user: currentUser,
        details: 'Produit ajouté à l\'inventaire'
      }],
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };
    setEditingChemical(newChem);
  };

  const saveChemical = () => {
    if (!editingChemical) return;

    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const updatedChem = {
      ...editingChemical,
      lastModified: new Date().toISOString(),
      history: [
        ...editingChemical.history,
        {
          date: new Date().toISOString(),
          action: 'Modification',
          user: currentUser,
          details: 'Produit modifié'
        }
      ]
    };

    const existingIndex = chemicals.findIndex(c => c.id === updatedChem.id);
    let newChemicals;

    if (existingIndex >= 0) {
      newChemicals = [...chemicals];
      newChemicals[existingIndex] = updatedChem;
    } else {
      newChemicals = [updatedChem, ...chemicals];
    }

    saveChemicals(newChemicals);
    setEditingChemical(null);
    showToast('success', '✅ Produit sauvegardé');
  };

  const deleteChemical = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const newChemicals = chemicals.filter(c => c.id !== id);
      saveChemicals(newChemicals);
      showToast('success', '🗑️ Produit supprimé');
    }
  };

  const duplicateChemical = (chem: Chemical) => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const duplicate: Chemical = {
      ...chem,
      id: Date.now().toString(),
      name: chem.name + ' (Copie)',
      history: [{
        date: new Date().toISOString(),
        action: 'Duplication',
        user: currentUser,
        details: `Dupliqué depuis ${chem.name}`
      }],
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };
    saveChemicals([duplicate, ...chemicals]);
    showToast('success', '📋 Produit dupliqué');
  };

  const adjustStock = (chem: Chemical, amount: number) => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newQuantity = Math.max(0, chem.quantity + amount);
    const updatedChem = {
      ...chem,
      quantity: newQuantity,
      lastModified: new Date().toISOString(),
      history: [
        ...chem.history,
        {
          date: new Date().toISOString(),
          action: amount > 0 ? 'Ajout stock' : 'Retrait stock',
          user: currentUser,
          details: `${amount > 0 ? '+' : ''}${amount} ${chem.unit} (${chem.quantity} → ${newQuantity})`
        }
      ]
    };

    const newChemicals = chemicals.map(c => c.id === chem.id ? updatedChem : c);
    saveChemicals(newChemicals);
    showToast('success', `✅ Stock ${amount > 0 ? 'ajouté' : 'retiré'}`);
  };

  // Appliquer les filtres et le tri
  const filteredAndSortedChemicals = React.useMemo(() => {
    const currentFilters: FilterOptions = {
      searchTerm,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      hazards: selectedHazards.length > 0 ? selectedHazards : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses as any : undefined
    };

    const filtered = filterChemicals(chemicals, currentFilters);
    return sortChemicals(filtered, sortField, sortDirection);
  }, [chemicals, searchTerm, selectedCategories, selectedHazards, selectedStatuses, sortField, sortDirection]);

  const stats = calculateStats(chemicals);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedHazards([]);
    setSelectedStatuses([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Beaker size={36} color="var(--accent-hugin)" />
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              Inventaire Chimique
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Version améliorée avec statistiques et filtres avancés
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: showStats ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
              color: showStats ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${showStats ? 'var(--accent-hugin)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <BarChart3 size={18} />
            Stats
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: showFilters ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
              color: showFilters ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${showFilters ? 'var(--accent-hugin)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <Filter size={18} />
            Filtres
            {(selectedCategories.length + selectedHazards.length + selectedStatuses.length) > 0 && (
              <span style={{
                backgroundColor: 'white',
                color: 'var(--accent-hugin)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {selectedCategories.length + selectedHazards.length + selectedStatuses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => exportToCSV(chemicals)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>
          <button
            onClick={addChemical}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent-hugin)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            icon={<Package size={24} />}
            label="Total Produits"
            value={stats.total}
            color="primary"
          />
          <StatCard
            icon={<TrendingDown size={24} />}
            label="Stock Faible"
            value={stats.lowStock}
            color="warning"
            onClick={() => {
              setSelectedStatuses(['low-stock']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<AlertTriangle size={24} />}
            label="Expire Bientôt"
            value={stats.expiringSoon}
            color="warning"
            onClick={() => {
              setSelectedStatuses(['expiring-soon']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<Calendar size={24} />}
            label="Expirés"
            value={stats.expired}
            color="danger"
            onClick={() => {
              setSelectedStatuses(['expired']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<FileText size={24} />}
            label="Valeur Totale"
            value={`${stats.totalValue.toFixed(2)}€`}
            color="success"
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
              Filtres Avancés
            </h3>
            <button
              onClick={clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <RefreshCw size={14} />
              Réinitialiser
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Catégories */}
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                Catégories
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {CATEGORIES.map(cat => (
                  <label key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat.value]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.value));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {cat.value}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Statuts */}
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                Statuts
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { value: 'ok', label: 'OK', color: '#10b981' },
                  { value: 'low-stock', label: 'Stock bas', color: '#f59e0b' },
                  { value: 'expiring-soon', label: 'Expire bientôt', color: '#f59e0b' },
                  { value: 'expired', label: 'Expiré', color: '#ef4444' }
                ].map(status => (
                  <label key={status.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatuses([...selectedStatuses, status.value]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: `${status.color}20`,
                      color: status.color,
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dangers */}
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                Pictogrammes de danger
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {HAZARDS.map(hazard => (
                  <label key={hazard.code} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedHazards.includes(hazard.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHazards([...selectedHazards, hazard.code]);
                        } else {
                          setSelectedHazards(selectedHazards.filter(h => h !== hazard.code));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <img src={hazard.img} alt={hazard.name} style={{ width: '24px', height: '24px' }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {hazard.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, CAS, formule, fournisseur, lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.95rem'
            }}
          />
        </div>
      </div>
      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {filteredAndSortedChemicals.length} produit{filteredAndSortedChemicals.length > 1 ? 's' : ''} trouvé{filteredAndSortedChemicals.length > 1 ? 's' : ''}
        {filteredAndSortedChemicals.length !== chemicals.length && ` sur ${chemicals.length}`}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredAndSortedChemicals.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Aucun produit trouvé</p>
              <p style={{ fontSize: '0.875rem' }}>Essayez de modifier vos filtres ou ajoutez un nouveau produit</p>
            </div>
          ) : (
            filteredAndSortedChemicals.map(chem => (
              <ChemicalCard
                key={chem.id}
                chemical={chem}
                onEdit={setEditingChemical}
                onDelete={deleteChemical}
                onDuplicate={duplicateChemical}
                onAdjustStock={adjustStock}
                hazards={HAZARDS}
                categories={CATEGORIES}
              />
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th 
                    onClick={() => toggleSort('name')}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    CAS
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Catégorie
                  </th>
                  <th 
                    onClick={() => toggleSort('quantity')}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Stock {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Localisation
                  </th>
                  <th 
                    onClick={() => toggleSort('expiryDate')}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Expiration {sortField === 'expiryDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Dangers
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedChemicals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedChemicals.map((chem, index) => {
                    const categoryColor = CATEGORIES.find(c => c.value === chem.category)?.color || '#6b7280';
                    const isExpiredChem = isExpired(chem.expiryDate);
                    const isExpiringSoonChem = isExpiringSoon(chem.expiryDate);
                    const isLowStockChem = isLowStock(chem);

                    return (
                      <tr
                        key={chem.id}
                        style={{
                          borderTop: index > 0 ? '1px solid var(--border-color)' : 'none',
                          backgroundColor: isExpiredChem ? 'rgba(239, 68, 68, 0.1)' : 
                                          isExpiringSoonChem ? 'rgba(245, 158, 11, 0.1)' : 
                                          isLowStockChem ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setEditingChemical(chem)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isExpiredChem ? 'rgba(239, 68, 68, 0.1)' : 
                                          isExpiringSoonChem ? 'rgba(245, 158, 11, 0.1)' : 
                                          isLowStockChem ? 'rgba(245, 158, 11, 0.05)' : 'transparent';
                        }}
                      >
                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {chem.name || '-'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {chem.cas || '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: `${categoryColor}20`,
                            color: categoryColor,
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {chem.category}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: isLowStockChem ? '#f59e0b' : 'var(--text-secondary)', fontWeight: '600' }}>
                            {chem.quantity} {chem.unit}
                          </div>
                          {chem.minQuantity > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Min: {chem.minQuantity} {chem.unit}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {formatLocation(chem.location)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{
                            color: isExpiredChem ? '#ef4444' : isExpiringSoonChem ? '#f59e0b' : 'var(--text-secondary)',
                            fontWeight: isExpiredChem || isExpiringSoonChem ? '600' : 'normal'
                          }}>
                            {chem.expiryDate ? new Date(chem.expiryDate).toLocaleDateString('fr-FR') : '-'}
                          </div>
                          {isExpiredChem && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Expiré</div>
                          )}
                          {isExpiringSoonChem && !isExpiredChem && (
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Bientôt</div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {chem.hazards.length > 0 ? (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {chem.hazards.slice(0, 3).map((h, i) => {
                                const hazard = HAZARDS.find(hz => hz.code === h);
                                return hazard ? (
                                  <img
                                    key={i}
                                    src={hazard.img}
                                    alt={hazard.name}
                                    title={hazard.name}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                ) : null;
                              })}
                              {chem.hazards.length > 3 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                                  +{chem.hazards.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => adjustStock(chem, 10)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '4px',
                                color: '#10b981',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Ajouter au stock"
                            >
                              <TrendingUp size={14} />
                            </button>
                            <button
                              onClick={() => adjustStock(chem, -10)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Retirer du stock"
                            >
                              <TrendingDown size={14} />
                            </button>
                            <button
                              onClick={() => duplicateChemical(chem)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '4px',
                                color: '#a78bfa',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Dupliquer"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => deleteChemical(chem.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingChemical && (
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
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', margin: 0 }}>
                {editingChemical.name || 'Nouveau Produit'}
              </h2>
              <button
                onClick={() => setEditingChemical(null)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Nom */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Nom du produit *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Éthanol absolu"
                  value={editingChemical.name}
                  onChange={(e) => setEditingChemical({ ...editingChemical, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* CAS et Formule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Numéro CAS *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 64-17-5"
                    value={editingChemical.cas}
                    onChange={(e) => setEditingChemical({ ...editingChemical, cas: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Formule chimique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: C2H5OH"
                    value={editingChemical.formula || ''}
                    onChange={(e) => setEditingChemical({ ...editingChemical, formula: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Catégorie *
                </label>
                <select
                  value={editingChemical.category}
                  onChange={(e) => setEditingChemical({ ...editingChemical, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.value}</option>
                  ))}
                </select>
              </div>

              {/* Quantité et Unité */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Quantité *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingChemical.quantity}
                    onChange={(e) => setEditingChemical({ ...editingChemical, quantity: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Unité
                  </label>
                  <select
                    value={editingChemical.unit}
                    onChange={(e) => setEditingChemical({ ...editingChemical, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock minimum */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Stock minimum (seuil d'alerte)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={editingChemical.minQuantity}
                  onChange={(e) => setEditingChemical({ ...editingChemical, minQuantity: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={editingChemical.expiryDate}
                    onChange={(e) => setEditingChemical({ ...editingChemical, expiryDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Date de réception
                  </label>
                  <input
                    type="date"
                    value={editingChemical.receivedDate || ''}
                    onChange={(e) => setEditingChemical({ ...editingChemical, receivedDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Fournisseur et Lot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sigma-Aldrich"
                    value={editingChemical.supplier}
                    onChange={(e) => setEditingChemical({ ...editingChemical, supplier: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Numéro de lot
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: LOT123456"
                    value={editingChemical.lotNumber || ''}
                    onChange={(e) => setEditingChemical({ ...editingChemical, lotNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Prix et Masse molaire */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editingChemical.price || ''}
                    onChange={(e) => setEditingChemical({ ...editingChemical, price: parseFloat(e.target.value) || undefined })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Masse molaire (g/mol)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editingChemical.molarMass || ''}
                    onChange={(e) => setEditingChemical({ ...editingChemical, molarMass: parseFloat(e.target.value) || undefined })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Localisation */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Localisation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Bâtiment"
                    value={editingChemical.location.building || ''}
                    onChange={(e) => setEditingChemical({ 
                      ...editingChemical, 
                      location: { ...editingChemical.location, building: e.target.value }
                    })}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Salle/Labo"
                    value={editingChemical.location.room || ''}
                    onChange={(e) => setEditingChemical({ 
                      ...editingChemical, 
                      location: { ...editingChemical.location, room: e.target.value }
                    })}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Armoire/Étagère"
                    value={editingChemical.location.cabinet || ''}
                    onChange={(e) => setEditingChemical({ 
                      ...editingChemical, 
                      location: { ...editingChemical.location, cabinet: e.target.value }
                    })}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Position exacte"
                    value={editingChemical.location.position || ''}
                    onChange={(e) => setEditingChemical({ 
                      ...editingChemical, 
                      location: { ...editingChemical.location, position: e.target.value }
                    })}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Pictogrammes de danger */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Pictogrammes de danger
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.5rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  {HAZARDS.map(hazard => (
                    <label
                      key={hazard.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: editingChemical.hazards.includes(hazard.code) 
                          ? 'var(--bg-tertiary)' 
                          : 'transparent',
                        border: `1px solid ${editingChemical.hazards.includes(hazard.code) 
                          ? 'var(--border-color)' 
                          : 'transparent'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editingChemical.hazards.includes(hazard.code)}
                        onChange={(e) => {
                          const newHazards = e.target.checked
                            ? [...editingChemical.hazards, hazard.code]
                            : editingChemical.hazards.filter(h => h !== hazard.code);
                          setEditingChemical({ ...editingChemical, hazards: newHazards });
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <img 
                        src={hazard.img}
                        alt={hazard.name}
                        title={hazard.name}
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          objectFit: 'contain'
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem', flex: 1 }}>{hazard.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Notes et commentaires
                </label>
                <textarea
                  placeholder="Informations supplémentaires..."
                  value={editingChemical.notes || ''}
                  onChange={(e) => setEditingChemical({ ...editingChemical, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setEditingChemical(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveChemical}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--accent-hugin)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={18} />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
