import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    editingItem: any;
    type: 'sds' | 'incidents' | 'trainings' | 'inspections' | 'ppe';
}

export const SafetyModal = ({ show, onClose, onSave, editingItem, type }: ModalProps) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
        } else {
            setFormData(getEmptyForm(type));
        }
    }, [editingItem, type, show]);

    const getEmptyForm = (type: string) => {
        switch (type) {
            case 'sds':
                return { chemical: '', hazardSymbols: [], riskLevel: 'Low', storage: '', lastChecked: new Date().toISOString().split('T')[0] };
            case 'incidents':
                return { date: new Date().toISOString().split('T')[0], type: 'Chimique', severity: 'Mineur', description: '', actions: '', reportedBy: '', status: 'Ouvert' };
            case 'trainings':
                return { title: '', date: '', instructor: '', participants: 0, duration: '', status: 'Planifiée' };
            case 'inspections':
                return { date: new Date().toISOString().split('T')[0], area: '', inspector: '', score: 0, issues: 0, status: 'Conforme' };
            case 'ppe':
                return { name: '', type: 'Protection des mains', stock: 0, minStock: 0, location: '' };
            default:
                return {};
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            id: editingItem?.id || Date.now().toString()
        };
        onSave(dataToSave);
        onClose();
    };

    if (!show) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        {editingItem ? 'Modifier' : 'Ajouter'} {getTitle(type)}
                    </h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: 'white' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {renderFormFields(type, formData, setFormData)}
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.75rem', color: 'white', cursor: 'pointer' }}>
                            Annuler
                        </button>
                        <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#f43f5e', border: 'none', borderRadius: '0.75rem', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const getTitle = (type: string) => {
    switch (type) {
        case 'sds': return 'Fiche SDS';
        case 'incidents': return 'Incident';
        case 'trainings': return 'Formation';
        case 'inspections': return 'Inspection';
        case 'ppe': return 'EPI';
        default: return '';
    }
};

const renderFormFields = (type: string, formData: any, setFormData: any) => {
    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' };
    const labelStyle = { fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    switch (type) {
        case 'sds':
            return (
                <>
                    <div>
                        <label style={labelStyle}>Produit chimique *</label>
                        <input type="text" value={formData.chemical || ''} onChange={(e) => handleChange('chemical', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Symboles de danger (séparés par des virgules)</label>
                        <input type="text" value={formData.hazardSymbols?.join(', ') || ''} onChange={(e) => handleChange('hazardSymbols', e.target.value.split(',').map((s: string) => s.trim()))} style={inputStyle} placeholder="🔥, ⚠️, 💀" />
                    </div>
                    <div>
                        <label style={labelStyle}>Niveau de risque *</label>
                        <select value={formData.riskLevel || 'Low'} onChange={(e) => handleChange('riskLevel', e.target.value)} style={inputStyle} required>
                            <option value="Low">Low</option>
                            <option value="Moderate">Moderate</option>
                            <option value="High">High</option>
                            <option value="Extreme">Extreme</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Stockage *</label>
                        <input type="text" value={formData.storage || ''} onChange={(e) => handleChange('storage', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Dernière vérification</label>
                        <input type="date" value={formData.lastChecked || ''} onChange={(e) => handleChange('lastChecked', e.target.value)} style={inputStyle} />
                    </div>
                </>
            );

        case 'incidents':
            return (
                <>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={formData.date || ''} onChange={(e) => handleChange('date', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Type *</label>
                        <select value={formData.type || 'Chimique'} onChange={(e) => handleChange('type', e.target.value)} style={inputStyle} required>
                            <option value="Chimique">Chimique</option>
                            <option value="Biologique">Biologique</option>
                            <option value="Physique">Physique</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Sévérité *</label>
                        <select value={formData.severity || 'Mineur'} onChange={(e) => handleChange('severity', e.target.value)} style={inputStyle} required>
                            <option value="Mineur">Mineur</option>
                            <option value="Modéré">Modéré</option>
                            <option value="Grave">Grave</option>
                            <option value="Critique">Critique</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Description *</label>
                        <textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} style={{ ...inputStyle, minHeight: '100px' }} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Actions prises *</label>
                        <textarea value={formData.actions || ''} onChange={(e) => handleChange('actions', e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Rapporté par *</label>
                        <input type="text" value={formData.reportedBy || ''} onChange={(e) => handleChange('reportedBy', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Statut *</label>
                        <select value={formData.status || 'Ouvert'} onChange={(e) => handleChange('status', e.target.value)} style={inputStyle} required>
                            <option value="Ouvert">Ouvert</option>
                            <option value="En cours">En cours</option>
                            <option value="Résolu">Résolu</option>
                        </select>
                    </div>
                </>
            );

        case 'trainings':
            return (
                <>
                    <div>
                        <label style={labelStyle}>Titre *</label>
                        <input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={formData.date || ''} onChange={(e) => handleChange('date', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Instructeur *</label>
                        <input type="text" value={formData.instructor || ''} onChange={(e) => handleChange('instructor', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de participants *</label>
                        <input type="number" value={formData.participants || 0} onChange={(e) => handleChange('participants', parseInt(e.target.value))} style={inputStyle} required min="0" />
                    </div>
                    <div>
                        <label style={labelStyle}>Durée *</label>
                        <input type="text" value={formData.duration || ''} onChange={(e) => handleChange('duration', e.target.value)} style={inputStyle} placeholder="Ex: 3h" required />
                    </div>
                    <div>
                        <label style={labelStyle}>Statut *</label>
                        <select value={formData.status || 'Planifiée'} onChange={(e) => handleChange('status', e.target.value)} style={inputStyle} required>
                            <option value="Planifiée">Planifiée</option>
                            <option value="Terminée">Terminée</option>
                            <option value="Annulée">Annulée</option>
                        </select>
                    </div>
                </>
            );

        case 'inspections':
            return (
                <>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={formData.date || ''} onChange={(e) => handleChange('date', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Zone *</label>
                        <input type="text" value={formData.area || ''} onChange={(e) => handleChange('area', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Inspecteur *</label>
                        <input type="text" value={formData.inspector || ''} onChange={(e) => handleChange('inspector', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Score (0-100) *</label>
                        <input type="number" value={formData.score || 0} onChange={(e) => handleChange('score', parseInt(e.target.value))} style={inputStyle} required min="0" max="100" />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de problèmes *</label>
                        <input type="number" value={formData.issues || 0} onChange={(e) => handleChange('issues', parseInt(e.target.value))} style={inputStyle} required min="0" />
                    </div>
                    <div>
                        <label style={labelStyle}>Statut *</label>
                        <select value={formData.status || 'Conforme'} onChange={(e) => handleChange('status', e.target.value)} style={inputStyle} required>
                            <option value="Conforme">Conforme</option>
                            <option value="Non-conforme">Non-conforme</option>
                            <option value="À améliorer">À améliorer</option>
                        </select>
                    </div>
                </>
            );

        case 'ppe':
            return (
                <>
                    <div>
                        <label style={labelStyle}>Nom *</label>
                        <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Type *</label>
                        <select value={formData.type || 'Protection des mains'} onChange={(e) => handleChange('type', e.target.value)} style={inputStyle} required>
                            <option value="Protection respiratoire">Protection respiratoire</option>
                            <option value="Protection des yeux">Protection des yeux</option>
                            <option value="Protection des mains">Protection des mains</option>
                            <option value="Protection du corps">Protection du corps</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Stock actuel *</label>
                        <input type="number" value={formData.stock || 0} onChange={(e) => handleChange('stock', parseInt(e.target.value))} style={inputStyle} required min="0" />
                    </div>
                    <div>
                        <label style={labelStyle}>Stock minimum *</label>
                        <input type="number" value={formData.minStock || 0} onChange={(e) => handleChange('minStock', parseInt(e.target.value))} style={inputStyle} required min="0" />
                    </div>
                    <div>
                        <label style={labelStyle}>Localisation *</label>
                        <input type="text" value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} style={inputStyle} required />
                    </div>
                </>
            );

        default:
            return null;
    }
};
