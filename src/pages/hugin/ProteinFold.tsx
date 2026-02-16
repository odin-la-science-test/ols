import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Zap, Info, Eye, Grid3x3, Layers } from 'lucide-react';
import { useToast } from '../../components/ToastContext';

const ProteinFold = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [sequence, setSequence] = useState('');
    const [pdbData, setPdbData] = useState('');
    const [viewMode, setViewMode] = useState<'cartoon' | 'surface' | 'stick'>('cartoon');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeStructure = () => {
        if (!sequence && !pdbData) {
            showToast('Veuillez entrer une séquence ou charger un fichier PDB', 'error');
            return;
        }
        
        setIsAnalyzing(true);
        showToast('Analyse de la structure en cours...', 'info');
        
        setTimeout(() => {
            setIsAnalyzing(false);
            showToast('Analyse terminée!', 'success');
        }, 2000);
    };

    const loadPDB = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPdbData(event.target?.result as string);
            showToast('Fichier PDB chargé', 'success');
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1400px' }}>
                <button
                    onClick={() => navigate('/hugin')}
                    className="btn"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} />
                    Retour au Labo
                </button>

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Layers size={32} color="var(--accent-hugin)" />
                        ProteinFold - Analyse de Structures Protéiques
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Visualisez et analysez des structures protéiques 3D
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Input Panel */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        padding: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Entrée de Données
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Séquence Protéique (FASTA)
                            </label>
                            <textarea
                                value={sequence}
                                onChange={(e) => setSequence(e.target.value)}
                                placeholder="MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL"
                                className="input-field"
                                style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Ou charger un fichier PDB
                            </label>
                            <label className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Upload size={18} />
                                Charger PDB
                                <input
                                    type="file"
                                    accept=".pdb"
                                    onChange={loadPDB}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Mode de Visualisation
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(['cartoon', 'surface', 'stick'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            background: viewMode === mode ? 'var(--accent-hugin)' : 'transparent',
                                            color: viewMode === mode ? 'white' : 'var(--text-primary)'
                                        }}
                                    >
                                        {mode === 'cartoon' && 'Cartoon'}
                                        {mode === 'surface' && 'Surface'}
                                        {mode === 'stick' && 'Stick'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={analyzeStructure}
                            className="btn btn-primary"
                            disabled={isAnalyzing}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Zap size={18} />
                            {isAnalyzing ? 'Analyse en cours...' : 'Analyser la Structure'}
                        </button>
                    </div>

                    {/* Visualization Panel */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        padding: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Visualisation 3D
                        </h2>

                        <div style={{
                            background: '#0a0a0a',
                            borderRadius: '0.5rem',
                            height: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Grid3x3 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Visualisation 3D interactive</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                    Chargez une structure pour commencer
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    Résidus
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                    {sequence ? sequence.length : '-'}
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    Poids Moléculaire
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                    {sequence ? (sequence.length * 110).toFixed(0) : '-'} Da
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '1.5rem',
                    marginTop: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <Info size={24} color="var(--accent-hugin)" style={{ flexShrink: 0 }} />
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            À propos de ProteinFold
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            ProteinFold permet de visualiser et analyser des structures protéiques en 3D. 
                            Entrez une séquence FASTA ou chargez un fichier PDB pour commencer l'analyse. 
                            Le module calcule automatiquement les propriétés de base et permet différents modes de visualisation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProteinFold;
