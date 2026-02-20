import { Waves, Target, MapPin, Scissors, Shield, Activity } from 'lucide-react';
import { useState } from 'react';

interface AdvancedAnalysisTabProps {
    sequence: string;
    disorderScores: number[];
    phosphoSites: any[];
    localizationSignals: any[];
    tmDomains: any[];
    epitopes: any[];
    cleavageSites: any[];
}

const AdvancedAnalysisTab = ({
    sequence,
    disorderScores,
    phosphoSites,
    localizationSignals,
    tmDomains,
    epitopes,
    cleavageSites
}: AdvancedAnalysisTabProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'disorder' | 'phospho' | 'localization' | 'tm' | 'epitopes' | 'cleavage'>('disorder');

    const subTabs = [
        { id: 'disorder', label: 'Désordre', icon: <Waves size={18} />, count: disorderScores.filter(s => s > 0.5).length },
        { id: 'phospho', label: 'Phosphorylation', icon: <Target size={18} />, count: phosphoSites.length },
        { id: 'localization', label: 'Localisation', icon: <MapPin size={18} />, count: localizationSignals.length },
        { id: 'tm', label: 'Transmembranaire', icon: <Activity size={18} />, count: tmDomains.length },
        { id: 'epitopes', label: 'Épitopes', icon: <Shield size={18} />, count: epitopes.length },
        { id: 'cleavage', label: 'Clivage', icon: <Scissors size={18} />, count: cleavageSites.length }
    ];

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Analyses Avancées
            </h2>

            {/* Sous-onglets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as any)}
                        style={{
                            padding: '0.75rem 1rem',
                            background: activeSubTab === tab.id ? 'var(--accent-hugin)' : 'transparent',
                            border: 'none',
                            borderBottom: activeSubTab === tab.id ? '2px solid var(--accent-hugin)' : '2px solid transparent',
                            color: activeSubTab === tab.id ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            transition: 'all 0.3s',
                            borderRadius: '4px 4px 0 0'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{ 
                                background: activeSubTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--accent-hugin)', 
                                padding: '0.125rem 0.5rem', 
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Désordre */}
            {activeSubTab === 'disorder' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Prédiction de Désordre Intrinsèque
                    </h3>
                    
                    {/* Analyse automatique */}
                    {(() => {
                        const disorderedCount = disorderScores.filter(s => s > 0.5).length;
                        const disorderedPercent = (disorderedCount / disorderScores.length * 100).toFixed(1);
                        const highlyDisorderedCount = disorderScores.filter(s => s > 0.7).length;
                        
                        // Trouver les régions désordonnées
                        const disorderedRegions: {start: number, end: number, avgScore: number}[] = [];
                        let inRegion = false;
                        let regionStart = 0;
                        let regionScores: number[] = [];
                        
                        disorderScores.forEach((score, idx) => {
                            if (score > 0.5 && !inRegion) {
                                inRegion = true;
                                regionStart = idx;
                                regionScores = [score];
                            } else if (score > 0.5 && inRegion) {
                                regionScores.push(score);
                            } else if (score <= 0.5 && inRegion) {
                                const avgScore = regionScores.reduce((a, b) => a + b, 0) / regionScores.length;
                                if (regionScores.length >= 10) { // Minimum 10 résidus
                                    disorderedRegions.push({
                                        start: regionStart + 1,
                                        end: idx,
                                        avgScore
                                    });
                                }
                                inRegion = false;
                                regionScores = [];
                            }
                        });
                        
                        return (
                            <div style={{ 
                                marginBottom: '1.5rem', 
                                padding: '1.5rem', 
                                background: 'rgba(59, 130, 246, 0.1)', 
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-hugin)', fontWeight: 600 }}>
                                    📊 Analyse Automatique
                                </h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Résidus désordonnés</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                                            {disorderedCount} ({disorderedPercent}%)
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fortement désordonnés</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                                            {highlyDisorderedCount}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Régions désordonnées</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                            {disorderedRegions.length}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    <strong>🔬 Interprétation :</strong>
                                    <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', lineHeight: '1.8' }}>
                                        {disorderedPercent < '10' && (
                                            <li>Protéine très structurée ({disorderedPercent}% de désordre) - probablement une protéine globulaire stable</li>
                                        )}
                                        {disorderedPercent >= '10' && disorderedPercent < '30' && (
                                            <li>Protéine majoritairement structurée avec quelques régions flexibles ({disorderedPercent}% de désordre)</li>
                                        )}
                                        {disorderedPercent >= '30' && disorderedPercent < '50' && (
                                            <li>Protéine avec des régions désordonnées significatives ({disorderedPercent}% de désordre) - possibles domaines de liaison flexibles</li>
                                        )}
                                        {disorderedPercent >= '50' && (
                                            <li>Protéine intrinsèquement désordonnée (IDP) avec {disorderedPercent}% de désordre - probablement impliquée dans la signalisation ou la régulation</li>
                                        )}
                                        
                                        {disorderedRegions.length > 0 && (
                                            <li>
                                                {disorderedRegions.length} région(s) désordonnée(s) détectée(s) :
                                                <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                                                    {disorderedRegions.slice(0, 3).map((region, idx) => (
                                                        <li key={idx}>
                                                            Résidus {region.start}-{region.end} ({region.end - region.start + 1} aa, score moyen: {region.avgScore.toFixed(2)})
                                                        </li>
                                                    ))}
                                                    {disorderedRegions.length > 3 && (
                                                        <li>... et {disorderedRegions.length - 3} autre(s) région(s)</li>
                                                    )}
                                                </ul>
                                            </li>
                                        )}
                                        
                                        <li>
                                            <strong>Implications fonctionnelles :</strong> Les régions désordonnées sont souvent impliquées dans les interactions protéine-protéine, 
                                            la régulation post-traductionnelle, et peuvent subir des transitions ordre-désordre lors de la liaison à des partenaires.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        );
                    })()}
                    
                    {/* Graphique avec scroll */}
                    <div style={{ overflowX: 'auto', overflowY: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            height: '120px', 
                            gap: '1px', 
                            background: 'var(--bg-primary)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            alignItems: 'flex-end',
                            minWidth: `${Math.max(600, disorderScores.length * 3)}px`
                        }}>
                            {disorderScores.map((score, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        height: `${score * 100}%`,
                                        background: score > 0.5 ? '#ef4444' : '#10b981',
                                        minWidth: '2px',
                                        transition: 'all 0.2s'
                                    }}
                                    title={`Position ${idx + 1}: ${score.toFixed(2)}`}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            🟢 Vert : Région ordonnée (score &lt; 0.5)
                        </div>
                        <div>
                            🔴 Rouge : Région désordonnée (score &gt; 0.5)
                        </div>
                    </div>
                </div>
            )}

            {/* Phosphorylation */}
            {activeSubTab === 'phospho' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Sites de Phosphorylation Prédits
                    </h3>
                    {phosphoSites.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Aucun site de phosphorylation détecté
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {phosphoSites.map((site, idx) => (
                                <div key={idx} className="card" style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-hugin)' }}>
                                                {site.residue}{site.position}
                                            </span>
                                            <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
                                                {site.type}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Kinase: {site.kinase}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Score: {(site.score * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Localisation */}
            {activeSubTab === 'localization' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Signaux de Localisation
                    </h3>
                    {localizationSignals.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Aucun signal de localisation détecté
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {localizationSignals.map((signal, idx) => (
                                <div key={idx} className="card" style={{ padding: '1.5rem', background: 'var(--bg-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-hugin)', marginBottom: '0.25rem' }}>
                                                {signal.type}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                Position: {signal.start}-{signal.end}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            background: 'var(--accent-secondary)', 
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {signal.location}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.9rem', 
                                        background: 'var(--bg-secondary)',
                                        padding: '0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {signal.sequence}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Score: {(signal.score * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Transmembranaire */}
            {activeSubTab === 'tm' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Domaines Transmembranaires
                    </h3>
                    {tmDomains.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Aucun domaine transmembranaire détecté
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {tmDomains.map((domain, idx) => (
                                <div key={idx} className="card" style={{ padding: '1.5rem', background: 'var(--bg-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-hugin)' }}>
                                                Hélice TM #{idx + 1}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                Position: {domain.start}-{domain.end} ({domain.end - domain.start + 1} AA)
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Hydrophobicité: {domain.score.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.9rem', 
                                        background: 'var(--bg-secondary)',
                                        padding: '0.5rem',
                                        borderRadius: '0.25rem',
                                        wordBreak: 'break-all'
                                    }}>
                                        {domain.sequence}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Épitopes */}
            {activeSubTab === 'epitopes' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Épitopes Linéaires Prédits
                    </h3>
                    {epitopes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Aucun épitope détecté
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {epitopes.slice(0, 20).map((epitope, idx) => (
                                <div key={idx} className="card" style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                {epitope.sequence}
                                            </span>
                                            <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Position: {epitope.start}-{epitope.end}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Score: {(epitope.score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {epitopes.length > 20 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    ... et {epitopes.length - 20} autres épitopes
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Clivage */}
            {activeSubTab === 'cleavage' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Sites de Clivage Protéolytique
                    </h3>
                    {cleavageSites.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Aucun site de clivage détecté
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {cleavageSites.map((site, idx) => (
                                <div key={idx} className="card" style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                                Position {site.position}
                                            </span>
                                            <span style={{ marginLeft: '1rem', fontFamily: 'monospace' }}>
                                                {site.sequence}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                {site.type}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Score: {(site.score * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedAnalysisTab;
