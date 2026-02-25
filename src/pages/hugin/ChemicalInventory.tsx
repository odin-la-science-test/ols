import React, { useState, useEffect } from 'react';
import { Beaker, Plus, AlertTriangle, Search, Calendar, Download, Grid, List, Edit3, Trash2, Package, TrendingDown, TrendingUp, Filter, X, Save, Copy, BarChart3 } from 'lucide-react';
import { showToast } from '../../components/ToastNotification';
import { useAutoSave } from '../../hooks/useAutoSave';
import { GHSPictogram } from '../../components/GHSPictogram';

interface ChemicalLocation {
  building?: string;
  room?: string;
  cabinet?: string;
  position?: string;
}

interface ChemicalHistory {
  date: string;
  action: string;
  user: string;
  details: string;
}

interface Chemical {
  id: string;
  name: string;
  cas: string;
  formula?: string;
  molarMass?: number;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: ChemicalLocation;
  expiryDate: string;
  receivedDate?: string;
  hazards: string[];
  supplier: string;
  lotNumber?: string;
  price?: number;
  notes?: string;
  history: ChemicalHistory[];
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

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

export const ChemicalInventory: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chemical_inventory');
    if (saved) {
      setChemicals(JSON.parse(saved));
    }
  }, []);

  const saveChemicals = (newChemicals: Chemical[]) => {
    localStorage.setItem('chemical_inventory', JSON.stringify(newChemicals));
    setChemicals(newChemicals);
  };

  useAutoSave({
    data: chemicals,
    onSave: (data) => localStorage.setItem('chemical_inventory', JSON.stringify(data)),
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

  const adjustStock = (chem: Chemical, amount: number, action: string) => {
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
          action: action,
          user: currentUser,
          details: `${amount > 0 ? '+' : ''}${amount} ${chem.unit} (${chem.quantity} → ${newQuantity})`
        }
      ]
    };

    const newChemicals = chemicals.map(c => c.id === chem.id ? updatedChem : c);
    saveChemicals(newChemicals);
    showToast('success', `✅ Stock ${amount > 0 ? 'ajouté' : 'retiré'}`);
  };

  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (date: string) => {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    return expiry < today;
  };

  const isLowStock = (chem: Chemical) => {
    return chem.quantity <= chem.minQuantity && chem.minQuantity > 0;
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'CAS', 'Formule', 'Catégorie', 'Quantité', 'Unité', 'Stock Min', 'Localisation', 'Expiration', 'Fournisseur', 'Lot', 'Prix'];
    const rows = chemicals.map(c => [
      c.name,
      c.cas,
      c.formula || '',
      c.category,
      c.quantity,
      c.unit,
      c.minQuantity,
      `${c.location.building || ''} ${c.location.room || ''} ${c.location.cabinet || ''}`.trim(),
      c.expiryDate,
      c.supplier,
      c.lotNumber || '',
      c.price || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventaire-chimique-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '📄 Export CSV réussi');
  };

  const filteredChemicals = chemicals.filter(chem => {
    const matchesSearch = chem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chem.cas.includes(searchTerm) ||
                         (chem.formula && chem.formula.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || chem.category === selectedCategory;
    const matchesExpiry = !showExpiringSoon || isExpiringSoon(chem.expiryDate);
    const matchesLowStock = !showLowStock || isLowStock(chem);
    return matchesSearch && matchesCategory && matchesExpiry && matchesLowStock;
  });

  const stats = {
    total: chemicals.length,
    expiringSoon: chemicals.filter(c => isExpiringSoon(c.expiryDate)).length,
    expired: chemicals.filter(c => isExpired(c.expiryDate)).length,
    lowStock: chemicals.filter(c => isLowStock(c)).length,
    totalValue: chemicals.reduce((sum, c) => sum + (c.price || 0) * c.quantity, 0)
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Beaker size={32} color="#3b82f6" />
          <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
            Inventaire Chimique
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: showStats ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
              color: showStats ? 'white' : '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <BarChart3 size={20} />
            Stats
          </button>
          <button
            onClick={exportToCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={addChemical}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Ajouter Produit
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Produits</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>{stats.total}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Expire Bientôt</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{stats.expiringSoon}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Expirés</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{stats.expired}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Stock Faible</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{stats.lowStock}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Valeur Totale</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.totalValue.toFixed(2)}€</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, CAS ou formule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.95rem'
            }}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.value}</option>
          ))}
        </select>

        <button
          onClick={() => setShowExpiringSoon(!showExpiringSoon)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: showExpiringSoon ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
            color: showExpiringSoon ? 'white' : '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <AlertTriangle size={20} />
          Expire bientôt
        </button>

        <button
          onClick={() => setShowLowStock(!showLowStock)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: showLowStock ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
            color: showLowStock ? 'white' : '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <TrendingDown size={20} />
          Stock faible
        </button>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Nom</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>CAS</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Catégorie</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Stock</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Localisation</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Expiration</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Dangers</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChemicals.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              filteredChemicals.map((chem, index) => {
                const categoryColor = CATEGORIES.find(c => c.value === chem.category)?.color || '#6b7280';
                const isExpiredChem = isExpired(chem.expiryDate);
                const isExpiringSoonChem = isExpiringSoon(chem.expiryDate);
                const isLowStockChem = isLowStock(chem);

                return (
                  <tr
                    key={chem.id}
                    style={{
                      borderTop: index > 0 ? '1px solid rgba(59, 130, 246, 0.1)' : 'none',
                      backgroundColor: isExpiredChem ? 'rgba(239, 68, 68, 0.1)' : 
                                      isExpiringSoonChem ? 'rgba(245, 158, 11, 0.1)' : 
                                      isLowStockChem ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setEditingChemical(chem)}
                  >
                    <td style={{ padding: '1rem', color: '#f8fafc', fontWeight: '600' }}>
                      {chem.name || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
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
                      <div style={{ color: isLowStockChem ? '#f59e0b' : '#94a3b8', fontWeight: '600' }}>
                        {chem.quantity} {chem.unit}
                      </div>
                      {chem.minQuantity > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Min: {chem.minQuantity} {chem.unit}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      {[chem.location.building, chem.location.room, chem.location.cabinet]
                        .filter(Boolean)
                        .join(' • ') || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        color: isExpiredChem ? '#ef4444' : isExpiringSoonChem ? '#f59e0b' : '#94a3b8',
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
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>
                              +{chem.hazards.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustStock(chem, 10, 'Ajout stock');
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustStock(chem, -10, 'Retrait stock');
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateChemical(chem);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChemical(chem.id);
                          }}
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

      {/* Edit Modal - Simplified for now */}
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
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: 0 }}>
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
              <input
                type="text"
                placeholder="Nom du produit"
                value={editingChemical.name}
                onChange={(e) => setEditingChemical({ ...editingChemical, name: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <input
                type="text"
                placeholder="Numéro CAS"
                value={editingChemical.cas}
                onChange={(e) => setEditingChemical({ ...editingChemical, cas: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <select
                value={editingChemical.category}
                onChange={(e) => setEditingChemical({ ...editingChemical, category: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.value}</option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <input
                  type="number"
                  placeholder="Quantité"
                  value={editingChemical.quantity}
                  onChange={(e) => setEditingChemical({ ...editingChemical, quantity: parseFloat(e.target.value) || 0 })}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.95rem'
                  }}
                />
                <select
                  value={editingChemical.unit}
                  onChange={(e) => setEditingChemical({ ...editingChemical, unit: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                placeholder="Stock minimum (seuil d'alerte)"
                value={editingChemical.minQuantity}
                onChange={(e) => setEditingChemical({ ...editingChemical, minQuantity: parseFloat(e.target.value) || 0 })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <input
                type="date"
                placeholder="Date d'expiration"
                value={editingChemical.expiryDate}
                onChange={(e) => setEditingChemical({ ...editingChemical, expiryDate: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <input
                type="text"
                placeholder="Fournisseur"
                value={editingChemical.supplier}
                onChange={(e) => setEditingChemical({ ...editingChemical, supplier: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <input
                type="text"
                placeholder="Formule chimique (ex: H2SO4)"
                value={editingChemical.formula || ''}
                onChange={(e) => setEditingChemical({ ...editingChemical, formula: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="number"
                  placeholder="Masse molaire (g/mol)"
                  value={editingChemical.molarMass || ''}
                  onChange={(e) => setEditingChemical({ ...editingChemical, molarMass: parseFloat(e.target.value) || undefined })}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.95rem'
                  }}
                />
                <input
                  type="number"
                  placeholder="Prix (€)"
                  value={editingChemical.price || ''}
                  onChange={(e) => setEditingChemical({ ...editingChemical, price: parseFloat(e.target.value) || undefined })}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <input
                type="text"
                placeholder="Numéro de lot"
                value={editingChemical.lotNumber || ''}
                onChange={(e) => setEditingChemical({ ...editingChemical, lotNumber: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />

              {/* Pictogrammes de danger */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Pictogrammes de danger
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.5rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
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
                          ? 'rgba(59, 130, 246, 0.2)' 
                          : 'rgba(30, 41, 59, 0.5)',
                        border: `1px solid ${editingChemical.hazards.includes(hazard.code) 
                          ? 'rgba(59, 130, 246, 0.5)' 
                          : 'rgba(59, 130, 246, 0.2)'}`,
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
                        onError={(e) => {
                          // Fallback to GHSPictogram component if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span style={{ color: '#f8fafc', fontSize: '0.75rem', flex: 1 }}>{hazard.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
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
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
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
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
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
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
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
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <textarea
                placeholder="Notes et commentaires"
                value={editingChemical.notes || ''}
                onChange={(e) => setEditingChemical({ ...editingChemical, notes: e.target.value })}
                rows={3}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setEditingChemical(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(100, 116, 139, 0.1)',
                    color: '#94a3b8',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
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
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <Save size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
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
