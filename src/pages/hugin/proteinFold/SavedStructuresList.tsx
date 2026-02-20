import { FolderOpen, Trash2, X } from 'lucide-react';
import type { ProteinStructure } from '../../../services/proteinFoldService';

interface SavedStructuresListProps {
    structures: ProteinStructure[];
    onLoad: (structure: ProteinStructure) => void;
    onDelete: (id: string, name: string) => void;
    onClose: () => void;
}

const SavedStructuresList = ({ structures, onLoad, onDelete, onClose }: SavedStructuresListProps) => {
    return (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Structures Sauvegardées
                </h2>
                <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
                    <X size={20} />
                </button>
            </div>

            {structures.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    Aucune structure sauvegardée
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {structures.map(structure => (
                        <div
                            key={structure.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                background: 'var(--bg-primary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    {structure.name}
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {structure.residue_count} résidus • {structure.molecular_weight?.toFixed(0)} Da
                                </div>
                                {structure.notes && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {structure.notes}
                                    </p>
                                )}
                                {structure.updated_at && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Modifié: {new Date(structure.updated_at).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => onLoad(structure)}
                                    className="btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <FolderOpen size={16} />
                                    Charger
                                </button>
                                <button
                                    onClick={() => onDelete(structure.id!, structure.name)}
                                    className="btn"
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedStructuresList;
