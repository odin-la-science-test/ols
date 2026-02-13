import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Package, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../../utils/persistence';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

type InventoryItem = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string;
    minStock: number;
};

const MobileInventory = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Réactifs',
        quantity: 0,
        unit: 'mL',
        location: '',
        minStock: 0
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const data = await fetchModuleData('inventory');
        if (data) setItems(data);
    };

    const handleAdd = async () => {
        if (!newItem.name) {
            showToast('Nom requis', 'error');
            return;
        }

        const item: InventoryItem = {
            id: Date.now().toString(),
            ...newItem
        };

        await saveModuleItem('inventory', item);
        setItems([...items, item]);
        setIsAdding(false);
        setNewItem({ name: '', category: 'Réactifs', quantity: 0, unit: 'mL', location: '', minStock: 0 });
        showToast('Article ajouté', 'success');
    };

    const handleDelete = async (id: string) => {
        await deleteModuleItem('inventory', id);
        setItems(items.filter(i => i.id !== id));
        showToast('Article supprimé', 'info');
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockItems = items.filter(i => i.quantity <= i.minStock);

    return (
        <div className="mobile-app">
            {/* Header */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/hugin')} 
                            className="mobile-btn-icon"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="mobile-header-title" style={{ fontSize: '1.5rem' }}>Inventaire</h1>
                            <p className="mobile-header-subtitle">{items.length} articles</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className="mobile-btn-icon"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mobile-content">
                {/* Search */}
                <div className="mobile-search">
                    <Search size={18} className="mobile-search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-input"
                    />
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                    <div className="mobile-card" style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: 'var(--mobile-error)',
                        marginBottom: '1rem'
                    }}>
                        ⚠️ {lowStockItems.length} article(s) en stock faible
                    </div>
                )}

                {/* Items List */}
                {filteredItems.length === 0 ? (
                    <div className="mobile-empty">
                        <div className="mobile-empty-icon">
                            <Package size={64} />
                        </div>
                        <div className="mobile-empty-title">Aucun article</div>
                        <div className="mobile-empty-subtitle">Commencez par ajouter un article</div>
                    </div>
                ) : (
                    <div className="mobile-list">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="mobile-card mobile-card-elevated"
                                style={{
                                    border: item.quantity <= item.minStock ? '2px solid var(--mobile-error)' : '1px solid var(--mobile-border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="mobile-card-title">
                                            {item.name}
                                        </div>
                                        <div className="mobile-card-subtitle">
                                            {item.category} • {item.location}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--mobile-error)',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            minWidth: '44px',
                                            minHeight: '44px'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: item.quantity <= item.minStock ? 'var(--mobile-error)' : 'var(--mobile-primary)'
                                }}>
                                    <Package size={20} />
                                    {item.quantity} {item.unit}
                                    {item.quantity <= item.minStock && (
                                        <span className="mobile-badge mobile-badge-error" style={{ fontSize: '0.75rem' }}>
                                            Stock faible
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Form Modal */}
            {isAdding && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'flex-end',
                    animation: 'mobile-fade-in 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'var(--mobile-card)',
                        borderRadius: 'var(--mobile-radius-lg) var(--mobile-radius-lg) 0 0',
                        padding: '1.5rem',
                        width: '100%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        animation: 'mobile-slide-up 0.3s ease-out'
                    }}>
                        <h2 className="mobile-card-title" style={{ marginBottom: '1.5rem' }}>Nouvel Article</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Nom"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="mobile-input"
                            />
                            <select
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="mobile-input"
                            >
                                <option>Réactifs</option>
                                <option>Consommables</option>
                                <option>Équipement</option>
                                <option>Milieux</option>
                            </select>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    placeholder="Quantité"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                    className="mobile-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Unité"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    className="mobile-input"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Emplacement"
                                value={newItem.location}
                                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                className="mobile-input"
                            />
                            <input
                                type="number"
                                placeholder="Stock minimum"
                                value={newItem.minStock}
                                onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                                className="mobile-input"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="mobile-btn mobile-btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAdd}
                                className="mobile-btn mobile-btn-primary"
                                style={{ flex: 1 }}
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* FAB for quick add */}
            <button 
                onClick={() => setIsAdding(true)}
                className="mobile-fab"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};

export default MobileInventory;
