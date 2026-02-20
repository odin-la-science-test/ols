import { Zap, Dna } from 'lucide-react';

interface SequenceInputProps {
    structureName: string;
    setStructureName: (name: string) => void;
    sequence: string;
    setSequence: (seq: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
    onAnalyze: () => void;
    onPredict3D: () => void;
    isAnalyzing: boolean;
    isPredicting3D: boolean;
}

const SequenceInput = ({
    structureName,
    setStructureName,
    sequence,
    setSequence,
    notes,
    setNotes,
    onAnalyze,
    onPredict3D,
    isAnalyzing,
    isPredicting3D
}: SequenceInputProps) => {
    return (
        <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Séquence Protéique
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Nom de la protéine
                    </label>
                    <input
                        type="text"
                        value={structureName}
                        onChange={(e) => setStructureName(e.target.value)}
                        placeholder="Ex: Protéine kinase A"
                        className="input-field"
                        style={{ width: '100%' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Séquence (FASTA)
                    </label>
                    <textarea
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value)}
                        placeholder="MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL"
                        className="input-field"
                        style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.9rem', width: '100%' }}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {sequence.length} résidus
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Notes (optionnel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes sur cette protéine..."
                        className="input-field"
                        style={{ minHeight: '80px', width: '100%' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !sequence}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <Zap size={20} />
                        {isAnalyzing ? 'Analyse...' : 'Analyser'}
                    </button>

                    <button
                        onClick={onPredict3D}
                        disabled={isPredicting3D || !sequence || sequence.length > 5000}
                        className="btn"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            background: 'var(--accent-secondary)',
                            color: 'white',
                            opacity: (sequence.length > 5000) ? 0.5 : 1
                        }}
                    >
                        <Dna size={20} />
                        {isPredicting3D ? 'Prédiction 3D...' : 'Prédire Structure 3D'}
                    </button>
                </div>

                {sequence.length > 5000 && (
                    <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#ef4444'
                    }}>
                        ⚠️ Séquence trop longue (max 5000 résidus). Réduisez la taille pour la prédiction 3D.
                    </div>
                )}

                {sequence.length > 400 && sequence.length <= 5000 && (
                    <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '0.5rem',
                        color: 'var(--accent-hugin)'
                    }}>
                        ℹ️ Séquence de {sequence.length} résidus : la structure 3D sera générée localement avec prédiction de structure secondaire avancée (Chou-Fasman).
                    </div>
                )}
            </div>
        </div>
    );
};

export default SequenceInput;
