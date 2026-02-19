import { useState } from 'react';
import { X, Save, Beaker, Calendar, Clock, Thermometer, Snowflake, FileText, History as HistoryIcon, Activity } from 'lucide-react';
import type { Culture, Milieu } from '../pages/hugin/CultureCells';

interface CultureModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (culture: any) => void;
    editing: Culture | null;
    milieux: Milieu[];
    theme: any;
}

export const CultureModal = ({ show, onClose, onSave, editing, milieux, theme }: CultureModalProps) => {
    const [formData, setFormData] = useState({
        nom: editing?.nom || '',
        milieuId: editing?.milieuId || '',
        intervalle: editing?.intervalle || 3,
        passage: editing?.passage || 1,
        statut: editing?.statut || 'active',
        notes: editing?.notes || '',
        conditions: editing?.conditions || []
    });

    const [newCondition, setNewCondition] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nom || !formData.milieuId) {
            alert('Nom et milieu requis');
            return;
        }

        onSave({
            ...formData,
            date: editing?.date || new Date().toISOString(),
            lastRepiquage: editing?.lastRepiquage || new Date().toISOString()
        });
        onClose();
    };

    const addCondition = () => {
        if (newCondition.trim()) {
            setFormData(prev => ({
                ...prev,
                conditions: [...prev.conditions, newCondition.trim()]
            }));
            setNewCondition('');
        }
    };

    const removeCondition = (index: number) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }));
    };

    if (!show) return null;

    const c = theme.colors;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: c.bgSecondary,
                borderRadius: '1rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: `1px solid ${c.borderColor}`
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${c.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: c.bgSecondary,
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Beaker size={24} />
                        {editing ? 'Modifier la culture' : 'Nouvelle culture'}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Nom */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Nom de la culture *
                            </label>
                            <input
                                type="text"
                                value={formData.nom}
                                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                placeholder="Ex: HeLa, CHO-K1..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Milieu */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Milieu de culture *
                            </label>
                            <select
                                value={formData.milieuId}
                                onChange={(e) => setFormData(prev => ({ ...prev, milieuId: e.target.value }))}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Sélectionner un milieu</option>
                                {milieux.map(m => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
                            </select>
                        </div>

                        {/* Intervalle de repiquage */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Intervalle de repiquage (jours)
                            </label>
                            <input
                                type="number"
                                value={formData.intervalle}
                                onChange={(e) => setFormData(prev => ({ ...prev, intervalle: parseInt(e.target.value) }))}
                                min="1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Passage */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Numéro de passage
                            </label>
                            <input
                                type="number"
                                value={formData.passage}
                                onChange={(e) => setFormData(prev => ({ ...prev, passage: parseInt(e.target.value) }))}
                                min="1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Conditions */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Activity size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Conditions de culture
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value)}
                                    placeholder="Ex: 37°C, 5% CO2..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${c.borderColor}`,
                                        background: c.cardBg,
                                        color: c.textPrimary,
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addCondition}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: c.accentPrimary,
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Ajouter
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {formData.conditions.map((cond, idx) => (
                                    <span key={idx} style={{
                                        background: c.cardBg,
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${c.borderColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem'
                                    }}>
                                        {cond}
                                        <button
                                            type="button"
                                            onClick={() => removeCondition(idx)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: c.textSecondary,
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Notes additionnelles..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: `1px solid ${c.borderColor}`
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${c.borderColor}`,
                                background: c.cardBg,
                                color: c.textPrimary,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            {editing ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface MilieuModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (milieu: any) => void;
    theme: any;
}

export const MilieuModal = ({ show, onClose, onSave, theme }: MilieuModalProps) => {
    const [formData, setFormData] = useState({
        nom: '',
        type: '',
        fournisseur: '',
        composition: '',
        proprietes: '',
        stockage: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nom || !formData.type) {
            alert('Nom et type requis');
            return;
        }

        onSave({
            ...formData,
            dateAjout: new Date().toISOString()
        });
        onClose();
        setFormData({
            nom: '',
            type: '',
            fournisseur: '',
            composition: '',
            proprietes: '',
            stockage: '',
            notes: ''
        });
    };

    if (!show) return null;

    const c = theme.colors;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: c.bgSecondary,
                borderRadius: '1rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: `1px solid ${c.borderColor}`
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${c.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: c.bgSecondary,
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        🧪 Nouveau milieu
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Nom du milieu *
                            </label>
                            <input
                                type="text"
                                value={formData.nom}
                                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                placeholder="Ex: DMEM, RPMI 1640..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Type *
                            </label>
                            <input
                                type="text"
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                placeholder="Ex: Milieu complet, Milieu basal..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Fournisseur
                            </label>
                            <input
                                type="text"
                                value={formData.fournisseur}
                                onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                                placeholder="Ex: Gibco, Sigma..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Composition
                            </label>
                            <textarea
                                value={formData.composition}
                                onChange={(e) => setFormData(prev => ({ ...prev, composition: e.target.value }))}
                                placeholder="Ex: + 10% FBS, + 1% Pen/Strep..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Stockage
                            </label>
                            <input
                                type="text"
                                value={formData.stockage}
                                onChange={(e) => setFormData(prev => ({ ...prev, stockage: e.target.value }))}
                                placeholder="Ex: 4°C, -20°C..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Notes additionnelles..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: `1px solid ${c.borderColor}`
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${c.borderColor}`,
                                background: c.cardBg,
                                color: c.textPrimary,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CryoModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (cultureId: string, cryoData: any) => void;
    cultures: Culture[];
    theme: any;
}

export const CryoModal = ({ show, onClose, onSave, cultures, theme }: CryoModalProps) => {
    const [formData, setFormData] = useState({
        cultureId: '',
        cryoLocation: '',
        cryoAgent: 'DMSO 10%',
        cryoDuration: 0,
        cryoNotes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cultureId) {
            alert('Sélectionner une culture');
            return;
        }

        onSave(formData.cultureId, {
            cryoLocation: formData.cryoLocation,
            cryoAgent: formData.cryoAgent,
            cryoDuration: formData.cryoDuration,
            cryoNotes: formData.cryoNotes
        });
        onClose();
        setFormData({
            cultureId: '',
            cryoLocation: '',
            cryoAgent: 'DMSO 10%',
            cryoDuration: 0,
            cryoNotes: ''
        });
    };

    if (!show) return null;

    const c = theme.colors;
    const activeCultures = cultures.filter(c => c.statut === 'active');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: c.bgSecondary,
                borderRadius: '1rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: `1px solid ${c.borderColor}`
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${c.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: c.bgSecondary,
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Snowflake size={24} />
                        Cryoconservation
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Culture à cryoconserver *
                            </label>
                            <select
                                value={formData.cultureId}
                                onChange={(e) => setFormData(prev => ({ ...prev, cultureId: e.target.value }))}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Sélectionner une culture</option>
                                {activeCultures.map(culture => (
                                    <option key={culture.id} value={culture.id}>
                                        {culture.nom} (P{culture.passage})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Emplacement
                            </label>
                            <input
                                type="text"
                                value={formData.cryoLocation}
                                onChange={(e) => setFormData(prev => ({ ...prev, cryoLocation: e.target.value }))}
                                placeholder="Ex: Congélateur A, Boîte 3, Position B2"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Agent cryoprotecteur
                            </label>
                            <select
                                value={formData.cryoAgent}
                                onChange={(e) => setFormData(prev => ({ ...prev, cryoAgent: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="DMSO 10%">DMSO 10%</option>
                                <option value="DMSO 5%">DMSO 5%</option>
                                <option value="Glycérol 10%">Glycérol 10%</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Thermometer size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Durée de conservation prévue (mois)
                            </label>
                            <input
                                type="number"
                                value={formData.cryoDuration}
                                onChange={(e) => setFormData(prev => ({ ...prev, cryoDuration: parseInt(e.target.value) }))}
                                min="0"
                                placeholder="0 = indéfini"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Notes
                            </label>
                            <textarea
                                value={formData.cryoNotes}
                                onChange={(e) => setFormData(prev => ({ ...prev, cryoNotes: e.target.value }))}
                                placeholder="Notes sur la cryoconservation..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${c.borderColor}`,
                                    background: c.cardBg,
                                    color: c.textPrimary,
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: `1px solid ${c.borderColor}`
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${c.borderColor}`,
                                background: c.cardBg,
                                color: c.textPrimary,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Snowflake size={18} />
                            Cryoconserver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    culture: Culture | null;
    theme: any;
}

export const HistoryModal = ({ show, onClose, culture, theme }: HistoryModalProps) => {
    if (!show || !culture) return null;

    const c = theme.colors;

    const getHistoryIcon = (type: string) => {
        switch (type) {
            case 'creation': return '🆕';
            case 'repiquage': return '🔄';
            case 'cryo': return '❄️';
            case 'reprise': return '🔥';
            case 'modification': return '✏️';
            default: return '📝';
        }
    };

    const getHistoryLabel = (type: string) => {
        switch (type) {
            case 'creation': return 'Création';
            case 'repiquage': return 'Repiquage';
            case 'cryo': return 'Cryoconservation';
            case 'reprise': return 'Reprise';
            case 'modification': return 'Modification';
            default: return 'Événement';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: c.bgSecondary,
                borderRadius: '1rem',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: `1px solid ${c.borderColor}`
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${c.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: c.bgSecondary,
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HistoryIcon size={24} />
                            Historique
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 0', color: c.textSecondary, fontSize: '0.9rem' }}>
                            {culture.nom} - Passage {culture.passage}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {culture.history.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: c.textSecondary
                        }}>
                            Aucun événement enregistré
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            {/* Timeline line */}
                            <div style={{
                                position: 'absolute',
                                left: '1.5rem',
                                top: '1rem',
                                bottom: '1rem',
                                width: '2px',
                                background: c.borderColor
                            }} />

                            {/* Events */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[...culture.history].reverse().map((event, idx) => (
                                    <div key={event.id} style={{
                                        position: 'relative',
                                        paddingLeft: '4rem',
                                        paddingBottom: idx === culture.history.length - 1 ? 0 : '1rem'
                                    }}>
                                        {/* Icon */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '0.5rem',
                                            top: 0,
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '50%',
                                            background: c.cardBg,
                                            border: `2px solid ${c.accentPrimary}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1rem'
                                        }}>
                                            {getHistoryIcon(event.type)}
                                        </div>

                                        {/* Content */}
                                        <div style={{
                                            background: c.cardBg,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.75rem',
                                            padding: '1rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'start',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {getHistoryLabel(event.type)}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: c.textSecondary
                                                }}>
                                                    {new Date(event.date).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            {event.details && (
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: c.textSecondary,
                                                    marginTop: '0.5rem'
                                                }}>
                                                    {event.type === 'repiquage' && event.details.passage && (
                                                        <div>Passage {event.details.passage}</div>
                                                    )}
                                                    {event.type === 'cryo' && (
                                                        <div>
                                                            {event.details.cryoLocation && <div>📍 {event.details.cryoLocation}</div>}
                                                            {event.details.cryoAgent && <div>🧪 {event.details.cryoAgent}</div>}
                                                        </div>
                                                    )}
                                                    {event.type === 'creation' && event.details.nom && (
                                                        <div>Culture créée: {event.details.nom}</div>
                                                    )}
                                                    {event.type === 'modification' && (
                                                        <div>
                                                            {Object.keys(event.details).map(key => (
                                                                <div key={key}>
                                                                    {key}: {JSON.stringify(event.details[key])}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
