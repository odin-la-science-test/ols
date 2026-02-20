import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Plus, Search, Trash2, Edit2, AlertTriangle, Calendar, MapPin, Tag, ChevronLeft,
    X, Save, Box, TrendingDown, TrendingUp, Download, Upload, BarChart3, PieChart,
    Clock, DollarSign, Users, Archive, RefreshCw, Filter, Eye, ShoppingCart, Truck
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

interface StockItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string;
    expiryDate: string;
    minThreshold: number;
    supplier?: string;
    reference?: string;
    price?: number;
    barcode?: string;
    notes?: string;
}

interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    date: string;
    user: string;
    reason: string;
}

const StockManager = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [items, setItems] = useState<StockItem[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [view, setView] = useState<'list' | 'stats' | 'movements' | 'locations'>('list');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

    const categories = ['Réactifs', 'Consommables', 'Milieux de Culture', 'Verrerie', 'Équipement', 'Antibiotiques', 'Enzymes'];

    useEffect(() => {
        const loadStock = async () => {
            const data = await fetchModuleData('hugin_stock');
            if (data) setItems(data);
            
            const movData = await fetchModuleData('hugin_stock_movements');
            if (movData) setMovements(movData);
        };
        loadStock();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer cet article de l\'inventaire ?')) {
            try {
                await deleteModuleItem('hugin_stock', id);
                setItems(items.filter(i => i.id !== id));
                showToast('Article supprimé', 'success');
            } catch (e) {
                showToast('Erreur de suppression', 'error');
            }
        }
    };

    const handleSave = async (item: StockItem) => {
        try {
            await saveModuleItem('hugin_stock', item);
            if (items.find(i => i.id === item.id)) {
                setItems(items.map(i => i.id === item.id ? item : i));
                showToast('Inventaire mis à jour', 'success');
            } else {
                setItems([item, ...items]);
                showToast('Nouvel article ajouté', 'success');
            }
            setIsAddingNew(false);
            setEditingItem(null);
        } catch (e) {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    const handleMovement = async (itemId: string, type: 'in' | 'out', quantity: number, reason: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = type === 'in' ? item.quantity + quantity : item.quantity - quantity;
        
        if (newQuantity < 0) {
            showToast('Quantité insuffisante', 'error');
            return;
        }

        const movement: StockMovement = {
            id: Date.now().toString(),
            itemId,
            itemName: item.name,
            type,
            quantity,
            date: new Date().toISOString(),
            user: 'Utilisateur',
            reason
        };

        try {
            await saveModuleItem('hugin_stock_movements', movement);
            setMovements([movement, ...movements]);
            
            const updatedItem = { ...item, quantity: newQuantity };
            await handleSave(updatedItem);
            
            showToast(`Mouvement enregistré: ${type === 'in' ? '+' : '-'}${quantity} ${item.unit}`, 'success');
            setShowMovementModal(false);
            setSelectedItem(null);
        } catch (e) {
            showToast('Erreur d\'enregistrement', 'error');
        }
    };

    const exportToCSV = () => {
        const headers = ['Nom', 'Catégorie', 'Quantité', 'Unité', 'Emplacement', 'Expiration', 'Référence', 'Fournisseur'];
        const rows = items.map(i => [
            i.name, i.category, i.quantity, i.unit, i.location,
            new Date(i.expiryDate).toLocaleDateString(), i.reference || '', i.supplier || ''
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('Export CSV réussi', 'success');
    };

    const filteredItems = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.reference?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || i.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const isLowStock = (item: StockItem) => item.quantity <= item.minThreshold;
    const isExpired = (item: StockItem) => new Date(item.expiryDate) < new Date();
    const isExpiringSoon = (item: StockItem) => {
        const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    };

    const totalValue = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const lowStockCount = items.filter(isLowStock).length;
    const expiredCount = items.filter(isExpired).length;
    const expiringSoonCount = items.filter(isExpiringSoon).length;

    const categoryStats = categories.map(cat => ({
        name: cat,
        count: items.filter(i => i.category === cat).length,
        value: items.filter(i => i.category === cat).reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)
    }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '1rem', color: '#10b981' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>StockManager Pro</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestion avancée d'inventaire scientifique</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={exportToCSV} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                        <Download size={18} /> Export CSV
                    </button>
                    <button onClick={() => setIsAddingNew(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
                        <Plus size={18} /> Ajouter
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '2rem' }}>
                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Stats rapides */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vue d'ensemble</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Articles totaux</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{items.length}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Stock bas</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{lowStockCount}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Périmés</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{expiredCount}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Valeur totale</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{totalValue.toFixed(0)}€</div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={16} /> Filtres
                        </h3>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <FilterButton active={filterCategory === 'all'} label="Tout le stock" onClick={() => setFilterCategory('all')} icon={<Box size={16} />} />
                            {categories.map(cat => (
                                <FilterButton
                                    key={cat}
                                    active={filterCategory === cat}
                                    label={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    icon={<Tag size={16} />}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Alertes */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> Alertes
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {expiringSoonCount > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Clock size={14} />
                                        {expiringSoonCount} expire(nt) bientôt
                                    </div>
                                </div>
                            )}
                            {lowStockCount > 0 && (
                                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <TrendingDown size={14} />
                                        {lowStockCount} en rupture
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    {/* View Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        {[
                            { id: 'list', label: 'Liste', icon: <Package size={16} /> },
                            { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={16} /> },
                            { id: 'movements', label: 'Mouvements', icon: <RefreshCw size={16} /> },
                            { id: 'locations', label: 'Emplacements', icon: <MapPin size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id as any)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: view === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: view === tab.id ? '#10b981' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontWeight: view === tab.id ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Liste des articles */}
                    {view === 'list' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Article</th>
                                        <th style={{ padding: '1rem' }}>Catégorie</th>
                                        <th style={{ padding: '1rem' }}>Quantité</th>
                                        <th style={{ padding: '1rem' }}>Emplacement</th>
                                        <th style={{ padding: '1rem' }}>Échéance</th>
                                        <th style={{ padding: '1rem' }}>Prix</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                                Aucun article trouvé. Cliquez sur "Ajouter" pour commencer.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Ref: {item.reference || 'N/A'}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>{item.category}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: isLowStock(item) ? '#f59e0b' : 'inherit', fontWeight: 700 }}>{item.quantity} {item.unit}</span>
                                                        {isLowStock(item) && <AlertTriangle size={14} color="#f59e0b" />}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                                        <MapPin size={14} opacity={0.5} /> {item.location}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: isExpired(item) ? '#ef4444' : isExpiringSoon(item) ? '#f59e0b' : 'inherit' }}>
                                                        <Calendar size={14} opacity={0.5} /> {new Date(item.expiryDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem' }}>{item.price ? `${item.price}€` : '-'}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => { setSelectedItem(item); setShowMovementModal(true); }} className="btn-icon" style={{ opacity: 0.6, color: '#10b981' }} title="Mouvement">
                                                            <RefreshCw size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingItem(item)} className="btn-icon" style={{ opacity: 0.6 }} title="Modifier">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="btn-icon" style={{ opacity: 0.6, color: '#ef4444' }} title="Supprimer">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Statistiques */}
                    {view === 'stats' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            {/* Répartition par catégorie */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <PieChart size={20} color="#10b981" /> Répartition par catégorie
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {categoryStats.map(stat => (
                                        <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.name}</div>
                                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${(stat.count / items.length) * 100}%`,
                                                        height: '100%',
                                                        background: '#10b981',
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>
                                                {stat.count} items
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Valeur par catégorie */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <DollarSign size={20} color="#3b82f6" /> Valeur par catégorie
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {categoryStats.filter(s => s.value > 0).sort((a, b) => b.value - a.value).map(stat => (
                                        <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.name}</div>
                                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${(stat.value / totalValue) * 100}%`,
                                                        height: '100%',
                                                        background: '#3b82f6',
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '80px', textAlign: 'right', color: '#3b82f6' }}>
                                                {stat.value.toFixed(0)}€
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Articles critiques */}
                            <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1/-1' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertTriangle size={20} color="#f59e0b" /> Articles nécessitant attention
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {items.filter(i => isLowStock(i) || isExpired(i) || isExpiringSoon(i)).slice(0, 6).map(item => (
                                        <div key={item.id} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '0.75rem',
                                            border: `1px solid ${isExpired(item) ? '#ef4444' : isLowStock(item) ? '#f59e0b' : '#f59e0b'}40`
                                        }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                {item.quantity} {item.unit} • {item.location}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {isExpired(item) && (
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '0.5rem' }}>
                                                        Périmé
                                                    </span>
                                                )}
                                                {isExpiringSoon(item) && !isExpired(item) && (
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '0.5rem' }}>
                                                        Expire bientôt
                                                    </span>
                                                )}
                                                {isLowStock(item) && (
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '0.5rem' }}>
                                                        Stock bas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mouvements */}
                    {view === 'movements' && (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <RefreshCw size={20} color="#10b981" /> Historique des mouvements
                            </h3>
                            {movements.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                    Aucun mouvement enregistré pour le moment.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {movements.slice(0, 50).map(mov => (
                                        <div key={mov.id} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '0.75rem',
                                                background: mov.type === 'in' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: mov.type === 'in' ? '#10b981' : '#ef4444'
                                            }}>
                                                {mov.type === 'in' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{mov.itemName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {mov.reason} • {mov.user}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    color: mov.type === 'in' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(mov.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Emplacements */}
                    {view === 'locations' && (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MapPin size={20} color="#10b981" /> Vue par emplacement
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {Array.from(new Set(items.map(i => i.location))).map(location => {
                                    const locationItems = items.filter(i => i.location === location);
                                    return (
                                        <div key={location} style={{
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    borderRadius: '0.5rem',
                                                    color: '#10b981'
                                                }}>
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{location}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {locationItems.length} articles
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {locationItems.slice(0, 5).map(item => (
                                                    <div key={item.id} style={{
                                                        padding: '0.5rem',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {item.quantity} {item.unit}
                                                        </div>
                                                    </div>
                                                ))}
                                                {locationItems.length > 5 && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
                                                        +{locationItems.length - 5} autres
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Ajout/Édition */}
            {(isAddingNew || editingItem) && (
                <ItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => { setIsAddingNew(false); setEditingItem(null); }}
                    onSave={handleSave}
                />
            )}

            {/* Modal Mouvement */}
            {showMovementModal && selectedItem && (
                <MovementModal
                    item={selectedItem}
                    onClose={() => { setShowMovementModal(false); setSelectedItem(null); }}
                    onSave={handleMovement}
                />
            )}
        </div>
    );
};

const FilterButton = ({ active, label, onClick, icon }: any) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem',
            background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: active ? '#10b981' : 'var(--text-secondary)',
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);

const ItemModal = ({ item, categories, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<StockItem>(item || {
        id: Date.now().toString(),
        name: '',
        category: categories[0],
        quantity: 0,
        unit: 'ml',
        location: '',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minThreshold: 1,
        reference: '',
        supplier: '',
        price: 0,
        barcode: '',
        notes: ''
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{item ? 'Modifier l\'Article' : 'Ajouter un Article'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Nom de l'article *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Tris-HCl 1M"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Catégorie *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        >
                            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Référence / Lot</label>
                        <input
                            type="text"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            placeholder="Ex: REF-12345"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Quantité *</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Unité *</label>
                        <input
                            type="text"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="ml, g, boîtes..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Emplacement *</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Ex: Armoire A, Tiroir 2"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date d'Expiration *</label>
                        <input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Seuil Alerte (Min) *</label>
                        <input
                            type="number"
                            value={formData.minThreshold}
                            onChange={(e) => setFormData({ ...formData, minThreshold: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Fournisseur</label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            placeholder="Ex: Sigma-Aldrich"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Prix unitaire (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Notes additionnelles..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button onClick={() => onSave(formData)} className="btn" style={{ background: '#10b981', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

const MovementModal = ({ item, onClose, onSave }: any) => {
    const [type, setType] = useState<'in' | 'out'>('in');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Mouvement de Stock</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Stock actuel: {item.quantity} {item.unit}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Type de mouvement</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => setType('in')}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: `2px solid ${type === 'in' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                                background: type === 'in' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                color: type === 'in' ? '#10b981' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: 600
                            }}
                        >
                            <TrendingUp size={20} /> Entrée
                        </button>
                        <button
                            onClick={() => setType('out')}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: `2px solid ${type === 'out' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                                background: type === 'out' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                color: type === 'out' ? '#ef4444' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: 600
                            }}
                        >
                            <TrendingDown size={20} /> Sortie
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Quantité</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Raison</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Réception commande, Expérience X..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Annuler</button>
                    <button
                        onClick={() => onSave(item.id, type, quantity, reason)}
                        disabled={!quantity || !reason}
                        className="btn"
                        style={{
                            background: type === 'in' ? '#10b981' : '#ef4444',
                            padding: '0.75rem 2rem',
                            opacity: (!quantity || !reason) ? 0.5 : 1,
                            cursor: (!quantity || !reason) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockManager;
