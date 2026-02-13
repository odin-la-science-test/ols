import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dna, Calculator } from 'lucide-react';
import { useToast } from '../../../components/ToastContext';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

const MobileBioAnalyzer = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sequence, setSequence] = useState('');
    const [results, setResults] = useState<any>(null);

    const analyzeSequence = () => {
        if (!sequence) {
            showToast('Veuillez entrer une séquence', 'error');
            return;
        }

        const cleanSeq = sequence.replace(/[^ATCGUatcgu]/g, '').toUpperCase();
        
        if (cleanSeq.length === 0) {
            showToast('Séquence invalide', 'error');
            return;
        }

        const composition = {
            A: (cleanSeq.match(/A/g) || []).length,
            T: (cleanSeq.match(/T/g) || []).length,
            G: (cleanSeq.match(/G/g) || []).length,
            C: (cleanSeq.match(/C/g) || []).length,
            U: (cleanSeq.match(/U/g) || []).length
        };

        const total = cleanSeq.length;
        const gcContent = ((composition.G + composition.C) / total * 100).toFixed(2);

        const codonTable: { [key: string]: string } = {
            'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
            'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
            'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
            'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
            'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
            'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
            'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
            'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
            'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
            'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
            'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
            'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
            'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
            'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
            'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
        };

        let protein = '';
        for (let i = 0; i < cleanSeq.length - 2; i += 3) {
            const codon = cleanSeq.substring(i, i + 3);
            protein += codonTable[codon] || 'X';
        }

        setResults({
            sequence: cleanSeq,
            length: total,
            composition,
            gcContent,
            protein
        });

        showToast('Analyse terminée', 'success');
    };

    return (
        <div className="mobile-app">
            {/* Header */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/hugin')} 
                        className="mobile-btn-icon"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="mobile-header-title" style={{ fontSize: '1.5rem' }}>BioAnalyzer</h1>
                        <p className="mobile-header-subtitle">Analyse de séquences ADN/ARN</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mobile-content">
                <div className="mobile-card mobile-card-elevated">
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem' }}>
                        Séquence ADN/ARN
                    </label>
                    <textarea
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value)}
                        placeholder="Entrez votre séquence (ATCG ou AUCG)..."
                        className="mobile-input"
                        style={{
                            height: '150px',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                        }}
                    />
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--mobile-text-secondary)' }}>
                        Longueur: {sequence.replace(/[^ATCGUatcgu]/g, '').length} bp
                    </div>
                </div>

                <button 
                    onClick={analyzeSequence} 
                    className="mobile-btn mobile-btn-primary"
                    style={{ width: '100%', marginBottom: '1.5rem' }}
                >
                    <Calculator size={18} />
                    Analyser
                </button>

                {results ? (
                    <>
                        {/* Summary Card */}
                        <div className="mobile-card mobile-card-elevated" style={{ marginBottom: '1rem' }}>
                            <h3 className="mobile-card-title">Résumé</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--mobile-text-secondary)' }}>Longueur:</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--mobile-primary)' }}>
                                        {results.length} bp
                                    </span>
                                </div>
                                <div className="mobile-divider" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--mobile-text-secondary)' }}>Contenu GC:</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--mobile-success)' }}>
                                        {results.gcContent}%
                                    </span>
                                </div>
                                <div className="mobile-divider" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--mobile-text-secondary)' }}>Protéine:</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--mobile-info)' }}>
                                        {results.protein.length} aa
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Composition Card */}
                        <div className="mobile-card mobile-card-elevated" style={{ marginBottom: '1rem' }}>
                            <h3 className="mobile-card-title">Composition</h3>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '0.75rem',
                                marginTop: '1rem'
                            }}>
                                {Object.entries(results.composition).filter(([_, v]) => (v as number) > 0).map(([base, count]: any) => (
                                    <div key={base} style={{
                                        padding: '1.25rem',
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: 'var(--mobile-radius-md)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--mobile-primary)', marginBottom: '0.25rem' }}>
                                            {count}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--mobile-text-secondary)', fontWeight: 600 }}>
                                            {base}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Protein Card */}
                        <div className="mobile-card mobile-card-elevated">
                            <h3 className="mobile-card-title">Protéine Traduite</h3>
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'var(--mobile-bg)',
                                borderRadius: 'var(--mobile-radius-sm)',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                lineHeight: 1.8,
                                wordBreak: 'break-all',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                color: 'var(--mobile-text)'
                            }}>
                                {results.protein}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mobile-empty">
                        <div className="mobile-empty-icon">
                            <Dna size={64} />
                        </div>
                        <div className="mobile-empty-title">Prêt à analyser</div>
                        <div className="mobile-empty-subtitle">Entrez une séquence pour commencer</div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default MobileBioAnalyzer;
