import { Download, Info } from 'lucide-react';
import type { AlphaFoldPrediction } from '../../../services/alphafoldService';
import { interpretConfidence, getConfidenceColor } from '../../../services/alphafoldService';
import Protein3DViewer from '../../../components/Protein3DViewer';

interface StructurePredictionTabProps {
    prediction: AlphaFoldPrediction;
    sequence: string;
}

const StructurePredictionTab = ({ prediction, sequence }: StructurePredictionTabProps) => {
    const downloadPDB = () => {
        const blob = new Blob([prediction.pdb], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'protein_structure.pdb';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Structure 3D Prédite (ESMFold)
                </h2>
                <button onClick={downloadPDB} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} />
                    Télécharger PDB
                </button>
            </div>

            {/* Scores de confiance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Confiance Moyenne (pLDDT)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                        {prediction.meanPlddt.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {interpretConfidence(prediction.meanPlddt)}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Score PTM
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
                        {prediction.ptm.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Qualité globale
                    </div>
                </div>
            </div>

            {/* Profil de confiance par résidu */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                    Confiance par Résidu (pLDDT)
                </h3>
                <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <div style={{ 
                        display: 'flex', 
                        height: '120px', 
                        gap: '1px', 
                        background: 'var(--bg-primary)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        alignItems: 'flex-end',
                        marginBottom: '1rem',
                        minWidth: `${Math.max(600, prediction.plddt.length * 3)}px`
                    }}>
                        {prediction.plddt.map((score, idx) => (
                            <div
                                key={idx}
                                style={{
                                    flex: 1,
                                    height: `${score}%`,
                                    background: getConfidenceColor(score),
                                    minWidth: '2px',
                                    transition: 'all 0.2s'
                                }}
                                title={`Résidu ${idx + 1}: ${score.toFixed(1)} (${interpretConfidence(score)})`}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#0066cc', borderRadius: '2px' }} />
                        <span>&gt; 90 (Très haute)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#00ccff', borderRadius: '2px' }} />
                        <span>70-90 (Haute)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#ffcc00', borderRadius: '2px' }} />
                        <span>50-70 (Moyenne)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#ff6600', borderRadius: '2px' }} />
                        <span>&lt; 50 (Faible)</span>
                    </div>
                </div>
            </div>

            {/* Visualisation 3D interactive */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                    Visualisation 3D Interactive
                </h3>
                <Protein3DViewer 
                    pdbData={prediction.pdb} 
                    plddtScores={prediction.plddt}
                    height="500px"
                />
            </div>

            {/* Informations */}
            <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '1.5rem'
            }}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent-hugin)', fontWeight: 600 }}>
                    💡 À propos de la prédiction
                </h4>
                {prediction.pdb.includes('DEMO STRUCTURE') || prediction.pdb.includes('ADVANCED DEMO') ? (
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <strong style={{ color: 'var(--accent-hugin)' }}>ℹ️ Structure de démonstration</strong>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {prediction.pdb.includes('ADVANCED DEMO') ? (
                                <>
                                    Cette structure 3D avancée est générée localement avec prédiction de structure secondaire basée sur les propriétés des acides aminés (méthode Chou-Fasman simplifiée).
                                    Les scores de confiance sont calculés selon la composition et la position des résidus.
                                </>
                            ) : (
                                <>
                                    Cette structure 3D est générée localement pour démonstration du viewer interactif.
                                    Elle combine hélices alpha et feuillets beta avec des scores de confiance simulés de manière réaliste.
                                </>
                            )}
                        </p>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                            💡 Pour une vraie prédiction AlphaFold, utilisez des outils comme ColabFold, le serveur AlphaFold officiel, ou ESMFold Atlas.
                        </p>
                    </div>
                ) : null}
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.9rem' }}>
                    <li>Structure prédite par ESMFold (similaire à AlphaFold2)</li>
                    <li>pLDDT &gt; 70 : régions bien structurées et fiables</li>
                    <li>pLDDT &lt; 50 : régions probablement désordonnées ou flexibles</li>
                    <li>PTM &gt; 0.7 : bonne qualité globale de la structure</li>
                    <li>Téléchargez le PDB pour visualisation dans PyMOL, Chimera, etc.</li>
                </ul>
            </div>
        </div>
    );
};

export default StructurePredictionTab;
