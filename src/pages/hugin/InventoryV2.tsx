import React, { useState, useEffect } from 'react';
import { 
  Box, Plus, AlertTriangle, Search, Download, Grid, List, 
  Edit3, Trash2, Package, TrendingDown, TrendingUp, Filter, X, Save, 
  Copy, BarChart3, MapPin, RefreshCw, Beaker, Microscope, Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/ToastNotification';
import { useAutoSave } from '../../hooks/useAutoSave';
import { StatCard } from '../../components/inventory/StatCard';
import type { InventoryItem, FilterOptions, SortField, SortDirection } from '../../utils/labInventoryHelpers';
import {
  calculateStats,
  filterItems,
  sortItems,
  exportToCSV,
  getItemStatus,
  formatLocation,
  getStatusColor
} from '../../utils/labInventoryHelpers';

const CATEGORIES = [
  { value: 'Reagent', label: 'Réactifs', icon: <Beaker size={18} />, color: '#3b82f6' },
  { value: 'Equipment', label: 'Équipements', icon: <Microscope size={18} />, color: '#8b5cf6' },
  { value: 'Glassware', label: 'Verrerie', icon: <Box size={18} />, color: '#10b981' },
  { value: 'Consumable', label: 'Consommables', icon: <Package size={18} />, color: '#f59e0b' },
  { value: 'Chemical', label: 'Chimiques', icon: <Beaker size={18} />, color: '#ef4444' },
  { value: 'Other', label: 'Autres', icon: <Archive size={18} />, color: '#6b7280' }
];

const UNITS = ['units', 'g', 'kg', 'mL', 'L', 'mg', 'µL', 'µg', 'box', 'pack', 'set'];

export const InventoryV2: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres avancés
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Tri
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const saved = localStorage.getItem('lab_inventory_v2');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Données initiales
      const initial: InventoryItem[] = [
        {
          id: '1',
          name: 'Agarose Powder',
          category: 'Reagent',
          quantity: 50,
          minQuantity: 100,
          unit: 'g',
          status: 'Critical',
          location: { building: 'Building A', room: 'Lab 1', storage: 'Shelf A1' },
          supplier: 'Sigma-Aldrich',
          catalogNumber: 'A9539',
          price: 45.50,
          history: [],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Petri Dishes (90mm)',
          category: 'Glassware',
          quantity: 450,
          minQuantity: 200,
          unit: 'units',
          status: 'Good',
          location: { building: 'Building A', room: 'Lab 1', storage: 'Drawer C2' },
          supplier: 'VWR',
          price: 0.50,
          history: [],
          createdAt: new Date().toISOString()
        }
      ];
      setItems(initial);
    }
  }, []);

  const saveItems = (newItems: InventoryItem[]) => {
    localStorage.setItem('lab_inventory_v2', JSON.stringify(newItems));
    setItems(newItems);
  };

  useAutoSave({
    data: items,
    onSave: (data) => localStorage.setItem('lab_inventory_v2', JSON.stringify(data)),
    interval: 30000
  });

  const addItem = () => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: '',
      category: 'Other',
      quantity: 0,
      minQuantity: 0,
      unit: 'units',
      status: 'Good',
      location: {},
      history: [{
        date: new Date().toISOString(),
        action: 'Création',
        user: currentUser,
        details: 'Item ajouté à l\'inventaire'
      }],
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };
    setEditingItem(newItem);
  };

  const saveItem = () => {
    if (!editingItem) return;

    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const updatedItem = {
      ...editingItem,
      status: getItemStatus(editingItem),
      lastModified: new Date().toISOString(),
      history: [
        ...editingItem.history,
        {
          date: new Date().toISOString(),
          action: 'Modification',
          user: currentUser,
          details: 'Item modifié'
        }
      ]
    };

    const existingIndex = items.findIndex(i => i.id === updatedItem.id);
    let newItems;

    if (existingIndex >= 0) {
      newItems = [...items];
      newItems[existingIndex] = updatedItem;
    } else {
      newItems = [updatedItem, ...items];
    }

    saveItems(newItems);
    setEditingItem(null);
    showToast('success', '✅ Item sauvegardé');
  };

  const deleteItem = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
      const newItems = items.filter(i => i.id !== id);
      saveItems(newItems);
      showToast('success', '🗑️ Item supprimé');
    }
  };

  const duplicateItem = (item: InventoryItem) => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const duplicate: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      name: item.name + ' (Copie)',
      history: [{
        date: new Date().toISOString(),
        action: 'Duplication',
        user: currentUser,
        details: `Dupliqué depuis ${item.name}`
      }],
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };
    saveItems([duplicate, ...items]);
    showToast('success', '📋 Item dupliqué');
  };

  const adjustStock = (item: InventoryItem, amount: number) => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newQuantity = Math.max(0, item.quantity + amount);
    const updatedItem = {
      ...item,
      quantity: newQuantity,
      status: getItemStatus({ ...item, quantity: newQuantity }),
      lastModified: new Date().toISOString(),
      history: [
        ...item.history,
        {
          date: new Date().toISOString(),
          action: amount > 0 ? 'Ajout stock' : 'Retrait stock',
          user: currentUser,
          details: `${amount > 0 ? '+' : ''}${amount} ${item.unit} (${item.quantity} → ${newQuantity})`
        }
      ]
    };

    const newItems = items.map(i => i.id === item.id ? updatedItem : i);
    saveItems(newItems);
    showToast('success', `✅ Stock ${amount > 0 ? 'ajouté' : 'retiré'}`);
  };

  // Appliquer les filtres et le tri
  const filteredAndSortedItems = React.useMemo(() => {
    const currentFilters: FilterOptions = {
      searchTerm,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined
    };

    const filtered = filterItems(items, currentFilters);
    return sortItems(filtered, sortField, sortDirection);
  }, [items, searchTerm, selectedCategories, selectedStatuses, sortField, sortDirection]);

  const stats = calculateStats(items);

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
    setSelectedStatuses([]);
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || <Box size={18} />;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || '#6b7280';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Box size={36} color="var(--accent-hugin)" />
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              Lab Inventory
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Gestion complète de l'inventaire de laboratoire
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/hugin')}
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
            ← Retour
          </button>
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
            {(selectedCategories.length + selectedStatuses.length) > 0 && (
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
                {selectedCategories.length + selectedStatuses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => exportToCSV(items)}
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
            onClick={addItem}
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
            label="Total Items"
            value={stats.total}
            color="primary"
          />
          <StatCard
            icon={<TrendingDown size={24} />}
            label="Stock Faible"
            value={stats.lowStock}
            color="warning"
            onClick={() => {
              setSelectedStatuses(['Low']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<AlertTriangle size={24} />}
            label="Critique"
            value={stats.critical}
            color="danger"
            onClick={() => {
              setSelectedStatuses(['Critical']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<X size={24} />}
            label="Rupture"
            value={stats.outOfStock}
            color="danger"
            onClick={() => {
              setSelectedStatuses(['Out of Stock']);
              setShowFilters(true);
            }}
          />
          <StatCard
            icon={<Package size={24} />}
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
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {cat.icon}
                      {cat.label}
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
                  { value: 'Good', label: 'Bon', color: '#10b981' },
                  { value: 'Low', label: 'Stock bas', color: '#f59e0b' },
                  { value: 'Critical', label: 'Critique', color: '#ef4444' },
                  { value: 'Out of Stock', label: 'Rupture', color: '#dc2626' }
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
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, fournisseur, référence..."
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
        {filteredAndSortedItems.length} item{filteredAndSortedItems.length > 1 ? 's' : ''} trouvé{filteredAndSortedItems.length > 1 ? 's' : ''}
        {filteredAndSortedItems.length !== items.length && ` sur ${items.length}`}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredAndSortedItems.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Aucun item trouvé</p>
              <p style={{ fontSize: '0.875rem' }}>Essayez de modifier vos filtres ou ajoutez un nouvel item</p>
            </div>
          ) : (
            filteredAndSortedItems.map(item => {
              const status = getItemStatus(item);
              const statusColor = getStatusColor(status);
              const categoryColor = getCategoryColor(item.category);

              return (
                <div
                  key={item.id}
                  onClick={() => setEditingItem(item)}
                  style={{
                    backgroundColor: `${statusColor}10`,
                    border: `1px solid ${statusColor}30`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 16px ${statusColor}30`;
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
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {status}
                  </div>

                  {/* Nom et catégorie */}
                  <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ color: categoryColor }}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {CATEGORIES.find(c => c.value === item.category)?.label}
                      </span>
                    </div>
                    <h3 style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '1.25rem', 
                      fontWeight: '700',
                      marginBottom: '0.25rem'
                    }}>
                      {item.name}
                    </h3>
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
                      color: statusColor,
                      marginBottom: '0.25rem'
                    }}>
                      {item.quantity} {item.unit}
                    </div>
                    {item.minQuantity > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Min: {item.minQuantity} {item.unit}
                      </div>
                    )}
                  </div>

                  {/* Localisation */}
                  {formatLocation(item.location) !== 'Non spécifié' && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem'
                    }}>
                      <MapPin size={14} />
                      <span>{formatLocation(item.location)}</span>
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
                      onClick={() => adjustStock(item, 10)}
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
                      onClick={() => adjustStock(item, -10)}
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
                      onClick={() => duplicateItem(item)}
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
                      onClick={() => deleteItem(item.id)}
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
            })
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
                  <th 
                    onClick={() => toggleSort('category')}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Catégorie {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Fournisseur
                  </th>
                  <th 
                    onClick={() => toggleSort('status')}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Statut {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aucun item trouvé
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedItems.map((item, index) => {
                    const status = getItemStatus(item);
                    const statusColor = getStatusColor(status);
                    const categoryColor = getCategoryColor(item.category);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderTop: index > 0 ? '1px solid var(--border-color)' : 'none',
                          backgroundColor: status === 'Out of Stock' ? 'rgba(239, 68, 68, 0.1)' : 
                                          status === 'Critical' ? 'rgba(239, 68, 68, 0.05)' : 
                                          status === 'Low' ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setEditingItem(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = status === 'Out of Stock' ? 'rgba(239, 68, 68, 0.1)' : 
                                          status === 'Critical' ? 'rgba(239, 68, 68, 0.05)' : 
                                          status === 'Low' ? 'rgba(245, 158, 11, 0.05)' : 'transparent';
                        }}
                      >
                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {item.name || '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: `${categoryColor}20`,
                            color: categoryColor,
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {getCategoryIcon(item.category)}
                            {CATEGORIES.find(c => c.value === item.category)?.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: statusColor, fontWeight: '600' }}>
                            {item.quantity} {item.unit}
                          </div>
                          {item.minQuantity > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Min: {item.minQuantity} {item.unit}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {formatLocation(item.location)}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {item.supplier || '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => adjustStock(item, 10)}
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
                              onClick={() => adjustStock(item, -10)}
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
                              onClick={() => duplicateItem(item)}
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
                              onClick={() => deleteItem(item.id)}
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
      {editingItem && (
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
                {editingItem.name || 'Nouvel Item'}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
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
                  Nom de l'item *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pipettes 10mL"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
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

              {/* Catégorie */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Catégorie *
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
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
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0 })}
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
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
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
                  value={editingItem.minQuantity}
                  onChange={(e) => setEditingItem({ ...editingItem, minQuantity: parseFloat(e.target.value) || 0 })}
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

              {/* Fournisseur et Référence */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: VWR"
                    value={editingItem.supplier || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
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
                    Référence catalogue
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CAT123456"
                    value={editingItem.catalogNumber || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, catalogNumber: e.target.value })}
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

              {/* Prix et Date d'expiration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                    Prix unitaire (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || undefined })}
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
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
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
                    value={editingItem.location.building || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      location: { ...editingItem.location, building: e.target.value }
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
                    value={editingItem.location.room || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      location: { ...editingItem.location, room: e.target.value }
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
                    value={editingItem.location.storage || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      location: { ...editingItem.location, storage: e.target.value }
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
                    value={editingItem.location.position || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      location: { ...editingItem.location, position: e.target.value }
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

              {/* Notes */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Notes et commentaires
                </label>
                <textarea
                  placeholder="Informations supplémentaires..."
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
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
                  onClick={() => setEditingItem(null)}
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
                  onClick={saveItem}
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

export default InventoryV2;
