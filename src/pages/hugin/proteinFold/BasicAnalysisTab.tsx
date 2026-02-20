import { Activity, Atom, BarChart3, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { ProteinAnalysisResult } from '../../../utils/proteinAnalysis';
import { getHydrophobicityColor, getChargeColor } from '../../../utils/proteinAnalysis';

interface BasicAnalysisTabProps {
    analysis: ProteinAnalysisResult;
    sequence: string;
}

const BasicAnalysisTab = ({ analysis, sequence }: BasicAnalysisTabProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'overview' | 'composition' | 'structure' | 'profiles'>('overview');

    const subTabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
        { id: 'composition', label: 'Composition', icon: <Atom size={18} /> },
        { id: 'structure', label: 'Structure 2D', icon: <BarChart3 size={18} /> },
        { id: 'profiles', label: 'Profils', icon: <TrendingUp size={18} /> }
    ];

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Analyse de Base
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
                    </button>
                ))}
            </div>

            {/* Vue d'ensemble */}
            {activeSubTab === 'overview' && (
                <div>
                    {/* Analyse automatique */}
                    <div style={{ 
                        marginBottom: '2rem', 
                        padding: '1.5rem', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--accent-hugin)', fontWeight: 600 }}>
                            📊 Interprétation Automatique
                        </h4>
                        
                        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                            {/* Poids moléculaire */}
                            <li>
                                <strong>Taille :</strong> {analysis.molecularWeight < 10000 && 'Petit peptide'}
                                {analysis.molecularWeight >= 10000 && analysis.molecularWeight < 50000 && 'Protéine de taille moyenne'}
                                {analysis.molecularWeight >= 50000 && analysis.molecularWeight < 100000 && 'Grande protéine'}
                                {analysis.molecularWeight >= 100000 && 'Très grande protéine ou complexe'}
                                {' '}({(analysis.molecularWeight / 1000).toFixed(1)} kDa, {sequence.length} résidus)
                            </li>
                            
                            {/* Point isoélectrique */}
                            <li>
                                <strong>Charge :</strong> {analysis.isoelectricPoint < 5 && 'Protéine acide (pI < 5) - charge nette négative à pH physiologique'}
                                {analysis.isoelectricPoint >= 5 && analysis.isoelectricPoint < 7 && 'Protéine légèrement acide (pI 5-7)'}
                                {analysis.isoelectricPoint >= 7 && analysis.isoelectricPoint < 9 && 'Protéine légèrement basique (pI 7-9)'}
                                {analysis.isoelectricPoint >= 9 && 'Protéine très basique (pI > 9) - charge nette positive à pH physiologique'}
                            </li>
                            
                            {/* GRAVY */}
                            <li>
                                <strong>Hydrophobicité :</strong> {analysis.gravy < -0.5 && 'Très hydrophile - probablement soluble, protéine cytoplasmique ou extracellulaire'}
                                {analysis.gravy >= -0.5 && analysis.gravy < 0 && 'Hydrophile - bonne solubilité en milieu aqueux'}
                                {analysis.gravy >= 0 && analysis.gravy < 0.5 && 'Légèrement hydrophobe - peut contenir des domaines transmembranaires'}
                                {analysis.gravy >= 0.5 && 'Très hydrophobe - probablement protéine membranaire ou avec domaines hydrophobes importants'}
                                {' '}(GRAVY: {analysis.gravy.toFixed(3)})
                            </li>
                            
                            {/* Aromaticité */}
                            <li>
                                <strong>Aromaticité :</strong> {analysis.aromaticity < 5 && 'Faible teneur en résidus aromatiques'}
                                {analysis.aromaticity >= 5 && analysis.aromaticity < 10 && 'Teneur normale en résidus aromatiques'}
                                {analysis.aromaticity >= 10 && 'Riche en résidus aromatiques (F, W, Y) - possibles interactions π-π et absorption UV forte'}
                                {' '}({analysis.aromaticity.toFixed(1)}%)
                            </li>
                            
                            {/* Index aliphatique */}
                            <li>
                                <strong>Stabilité thermique :</strong> {analysis.aliphaticIndex < 70 && 'Index aliphatique faible - stabilité thermique limitée'}
                                {analysis.aliphaticIndex >= 70 && analysis.aliphaticIndex < 90 && 'Index aliphatique moyen - stabilité thermique normale'}
                                {analysis.aliphaticIndex >= 90 && 'Index aliphatique élevé - bonne stabilité thermique, protéine thermostable'}
                                {' '}(AI: {analysis.aliphaticIndex.toFixed(0)})
                            </li>
                            
                            {/* Charge nette */}
                            <li>
                                <strong>Charge nette à pH 7 :</strong> {Math.abs(analysis.charge) < 5 && 'Charge faible - protéine relativement neutre'}
                                {Math.abs(analysis.charge) >= 5 && Math.abs(analysis.charge) < 20 && 'Charge modérée'}
                                {Math.abs(analysis.charge) >= 20 && 'Charge élevée - forte interaction électrostatique'}
                                {' '}({analysis.charge > 0 ? '+' : ''}{analysis.charge.toFixed(0)})
                            </li>
                        </ul>
                        
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                            <strong>🔬 Conclusion :</strong>
                            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                                Cette protéine de {(analysis.molecularWeight / 1000).toFixed(1)} kDa présente 
                                {analysis.gravy < 0 ? ' un caractère hydrophile' : ' un caractère hydrophobe'}
                                {' '}avec un pI de {analysis.isoelectricPoint.toFixed(1)}.
                                {analysis.aliphaticIndex > 90 && ' Sa stabilité thermique élevée suggère une structure compacte.'}
                                {analysis.aromaticity > 10 && ' Sa richesse en résidus aromatiques peut faciliter les interactions protéine-protéine.'}
                                {Math.abs(analysis.charge) > 20 && ' Sa charge nette importante influence fortement ses interactions électrostatiques.'}
                            </p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Poids Moléculaire
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                {analysis.molecularWeight.toFixed(2)} Da
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Point Isoélectrique
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
                                {analysis.isoelectricPoint.toFixed(2)}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Charge Nette
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
                                {analysis.charge > 0 ? '+' : ''}{analysis.charge.toFixed(2)}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                GRAVY
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6' }}>
                                {analysis.gravy.toFixed(3)}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Aromaticité
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ec4899' }}>
                                {analysis.aromaticity.toFixed(2)}%
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(13, 148, 136, 0.1))' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Index Aliphatique
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14b8a6' }}>
                                {analysis.aliphaticIndex.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Composition */}
            {activeSubTab === 'composition' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(analysis.composition)
                        .sort((a, b) => b[1] - a[1])
                        .map(([aa, count]) => {
                            const percentage = (count / sequence.length * 100).toFixed(1);
                            return (
                                <div
                                    key={aa}
                                    className="card"
                                    style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        background: 'var(--bg-primary)',
                                        border: '2px solid var(--border-color)'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)', marginBottom: '0.25rem' }}>
                                        {aa}
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {count}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {percentage}%
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Structure 2D */}
            {activeSubTab === 'structure' && (
                <div>
                    {/* Analyse automatique */}
                    <div style={{ 
                        marginBottom: '2rem', 
                        padding: '1.5rem', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--accent-hugin)', fontWeight: 600 }}>
                            📊 Interprétation de la Structure Secondaire
                        </h4>
                        
                        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>
                                <strong>Hélices α ({analysis.secondaryStructure.helix.toFixed(1)}%) :</strong>
                                {analysis.secondaryStructure.helix < 20 && ' Faible contenu en hélices - structure probablement dominée par des feuillets ou désordonnée'}
                                {analysis.secondaryStructure.helix >= 20 && analysis.secondaryStructure.helix < 40 && ' Contenu normal en hélices'}
                                {analysis.secondaryStructure.helix >= 40 && ' Riche en hélices - protéine probablement globulaire avec structure compacte'}
                            </li>
                            
                            <li>
                                <strong>Feuillets β ({analysis.secondaryStructure.sheet.toFixed(1)}%) :</strong>
                                {analysis.secondaryStructure.sheet < 15 && ' Peu de feuillets β'}
                                {analysis.secondaryStructure.sheet >= 15 && analysis.secondaryStructure.sheet < 30 && ' Contenu modéré en feuillets'}
                                {analysis.secondaryStructure.sheet >= 30 && ' Riche en feuillets β - structure en tonneau β ou sandwich β possible'}
                            </li>
                            
                            <li>
                                <strong>Tours ({analysis.secondaryStructure.turn.toFixed(1)}%) :</strong>
                                {' '}Régions de transition entre structures secondaires
                            </li>
                            
                            <li>
                                <strong>Pelotes ({analysis.secondaryStructure.coil.toFixed(1)}%) :</strong>
                                {analysis.secondaryStructure.coil < 30 && ' Protéine très structurée'}
                                {analysis.secondaryStructure.coil >= 30 && analysis.secondaryStructure.coil < 50 && ' Flexibilité normale'}
                                {analysis.secondaryStructure.coil >= 50 && ' Haute flexibilité - nombreuses régions non structurées'}
                            </li>
                        </ul>
                        
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                            <strong>🔬 Classification :</strong>
                            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                                {analysis.secondaryStructure.helix > analysis.secondaryStructure.sheet * 2 && 
                                    'Protéine à dominance α (all-α) - structure principalement hélicoïdale, typique des protéines membranaires ou de liaison à l\'ADN.'}
                                {analysis.secondaryStructure.sheet > analysis.secondaryStructure.helix * 2 && 
                                    'Protéine à dominance β (all-β) - structure en feuillets, typique des immunoglobulines ou protéines de transport.'}
                                {Math.abs(analysis.secondaryStructure.helix - analysis.secondaryStructure.sheet) < 10 && 
                                    'Protéine α/β mixte - combinaison équilibrée d\'hélices et de feuillets, structure versatile commune aux enzymes.'}
                                {analysis.secondaryStructure.coil > 50 && 
                                    ' Attention : forte proportion de régions non structurées, possiblement une protéine intrinsèquement désordonnée (IDP).'}
                            </p>
                        </div>
                    </div>
                    
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                        Prédiction de Structure Secondaire
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {[
                            { label: 'Hélice α', value: analysis.secondaryStructure.helix, color: '#3b82f6' },
                            { label: 'Feuillet β', value: analysis.secondaryStructure.sheet, color: '#10b981' },
                            { label: 'Tour', value: analysis.secondaryStructure.turn, color: '#f59e0b' },
                            { label: 'Pelote', value: analysis.secondaryStructure.coil, color: '#6b7280' }
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.value.toFixed(1)}%</span>
                                </div>
                                <div style={{ 
                                    width: '100%', 
                                    height: '24px', 
                                    background: 'var(--bg-primary)', 
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${item.value}%`,
                                        height: '100%',
                                        background: item.color,
                                        transition: 'width 0.5s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {item.value > 10 && `${item.value.toFixed(0)}%`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profils */}
            {activeSubTab === 'profiles' && (
                <div>
                    {/* Analyse automatique des profils */}
                    {(() => {
                        // Analyse hydrophobicité
                        const avgHydro = analysis.hydrophobicityProfile.reduce((a, b) => a + b, 0) / analysis.hydrophobicityProfile.length;
                        const hydrophobicRegions = analysis.hydrophobicityProfile.filter(v => v > 1.5).length;
                        const hydrophilicRegions = analysis.hydrophobicityProfile.filter(v => v < -1.5).length;
                        const maxHydro = Math.max(...analysis.hydrophobicityProfile);
                        const minHydro = Math.min(...analysis.hydrophobicityProfile);
                        
                        // Analyse charge
                        const positiveRegions = analysis.chargeProfile.filter(v => v > 0.5).length;
                        const negativeRegions = analysis.chargeProfile.filter(v => v < -0.5).length;
                        const neutralRegions = analysis.chargeProfile.filter(v => Math.abs(v) <= 0.5).length;
                        
                        // Détection de clusters hydrophobes (possibles domaines TM)
                        let tmCandidates = 0;
                        let consecutiveHydrophobic = 0;
                        analysis.hydrophobicityProfile.forEach(v => {
                            if (v > 1.5) {
                                consecutiveHydrophobic++;
                                if (consecutiveHydrophobic >= 20) tmCandidates++;
                            } else {
                                consecutiveHydrophobic = 0;
                            }
                        });
                        
                        return (
                            <div style={{ 
                                marginBottom: '2rem', 
                                padding: '1.5rem', 
                                background: 'rgba(59, 130, 246, 0.1)', 
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-hugin)', fontWeight: 600 }}>
                                    📊 Analyse Automatique des Profils
                                </h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hydrophobicité moyenne</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: avgHydro > 0 ? '#f59e0b' : '#10b981' }}>
                                            {avgHydro.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Régions hydrophobes</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                                            {hydrophobicRegions} ({(hydrophobicRegions / sequence.length * 100).toFixed(1)}%)
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Régions chargées</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                            {positiveRegions + negativeRegions} ({((positiveRegions + negativeRegions) / sequence.length * 100).toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    <strong>🔬 Interprétation :</strong>
                                    <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', lineHeight: '1.8' }}>
                                        <li>
                                            <strong>Hydrophobicité :</strong>
                                            {avgHydro < -0.5 && ' Protéine globalement hydrophile - probablement soluble en milieu aqueux, localisée dans le cytoplasme ou sécrétée'}
                                            {avgHydro >= -0.5 && avgHydro < 0.5 && ' Profil hydrophobique équilibré - structure mixte avec domaines hydrophiles et hydrophobes'}
                                            {avgHydro >= 0.5 && ' Protéine globalement hydrophobe - possiblement associée aux membranes ou avec cœur hydrophobe important'}
                                        </li>
                                        
                                        {tmCandidates > 0 && (
                                            <li>
                                                <strong>⚠️ Domaines transmembranaires potentiels :</strong> {tmCandidates} région(s) hydrophobe(s) de plus de 20 résidus détectée(s) - 
                                                possibles hélices transmembranaires. Cette protéine pourrait être une protéine membranaire intégrale.
                                            </li>
                                        )}
                                        
                                        <li>
                                            <strong>Distribution de charge :</strong>
                                            {positiveRegions > negativeRegions * 1.5 && ' Dominance de charges positives - possibles sites de liaison à l\'ADN/ARN ou membranes négatives'}
                                            {negativeRegions > positiveRegions * 1.5 && ' Dominance de charges négatives - possibles sites de liaison aux cations métalliques'}
                                            {Math.abs(positiveRegions - negativeRegions) < positiveRegions * 0.3 && ' Distribution équilibrée des charges - interactions électrostatiques variées'}
                                        </li>
                                        
                                        <li>
                                            <strong>Régions neutres :</strong> {neutralRegions} résidus ({(neutralRegions / sequence.length * 100).toFixed(1)}%)
                                            {neutralRegions / sequence.length > 0.5 && ' - majorité de la protéine est électriquement neutre'}
                                        </li>
                                        
                                        <li>
                                            <strong>Amplitude :</strong> Hydrophobicité de {minHydro.toFixed(2)} à {maxHydro.toFixed(2)}
                                            {maxHydro - minHydro > 4 && ' - forte variabilité suggérant des domaines structuraux distincts'}
                                        </li>
                                        
                                        <li>
                                            <strong>Implications fonctionnelles :</strong>
                                            {tmCandidates > 0 && ' Protéine membranaire probable (récepteur, canal, transporteur).'}
                                            {avgHydro < -0.5 && tmCandidates === 0 && ' Protéine soluble, possiblement enzymatique ou de signalisation.'}
                                            {positiveRegions > sequence.length * 0.3 && ' Possibles domaines de liaison à l\'ADN/ARN.'}
                                            {hydrophobicRegions > sequence.length * 0.4 && tmCandidates === 0 && ' Cœur hydrophobe important, structure globulaire compacte.'}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        );
                    })()}
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            Profil d'Hydrophobicité
                        </h3>
                        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                            <div style={{ 
                                display: 'flex', 
                                height: '100px', 
                                gap: '1px', 
                                background: 'var(--bg-primary)',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                alignItems: 'flex-end',
                                minWidth: `${Math.max(600, sequence.length * 3)}px`
                            }}>
                                {analysis.hydrophobicityProfile.map((value, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flex: 1,
                                            height: `${50 + value * 10}%`,
                                            background: getHydrophobicityColor(value),
                                            minWidth: '2px',
                                            transition: 'all 0.2s'
                                        }}
                                        title={`Position ${idx + 1}: ${value.toFixed(2)}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Hydrophile</span>
                            <span>Hydrophobe</span>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            Profil de Charge
                        </h3>
                        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                            <div style={{ 
                                display: 'flex', 
                                height: '100px', 
                                gap: '1px', 
                                background: 'var(--bg-primary)',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                alignItems: 'center',
                                minWidth: `${Math.max(600, sequence.length * 3)}px`
                            }}>
                                {analysis.chargeProfile.map((value, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flex: 1,
                                            height: `${Math.abs(value) * 50}%`,
                                            background: getChargeColor(value),
                                            minWidth: '2px',
                                            transition: 'all 0.2s',
                                            transform: value < 0 ? 'translateY(50%)' : 'translateY(-50%)'
                                        }}
                                        title={`Position ${idx + 1}: ${value.toFixed(2)}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Négatif</span>
                            <span>Positif</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicAnalysisTab;
