import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom } from 'lucide-react';

const ProteinCalculator = () => {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState<any>(null);

  // Poids moléculaires des acides aminés (Da)
  const aaWeights: any = {
    'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.15,
    'E': 147.13, 'Q': 146.15, 'G': 75.07, 'H': 155.16, 'I': 131.17,
    'L': 131.17, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
    'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
  };

  // Coefficients d'extinction (M-1 cm-1)
  const extinctionCoeffs: any = {
    'W': 5500, 'Y': 1490, 'C': 125
  };

  const calculateProperties = () => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCEQGHILKMFPSTWYV]/g, '');
    if (cleanSeq.length === 0) {
      alert('Séquence invalide');
      return;
    }

    // Poids moléculaire
    let mw = 0;
    const composition: any = {};
    for (const aa of cleanSeq) {
      mw += aaWeights[aa] || 0;
      composition[aa] = (composition[aa] || 0) + 1;
    }
    mw -= (cleanSeq.length - 1) * 18.015; // Soustraire H2O pour liaisons peptidiques

    // Coefficient d'extinction
    const w = composition['W'] || 0;
    const y = composition['Y'] || 0;
    const c = composition['C'] || 0;
    const extinction = w * 5500 + y * 1490 + c * 125;

    // Point isoélectrique (approximation simple)
    const acidic = (composition['D'] || 0) + (composition['E'] || 0);
    const basic = (composition['K'] || 0) + (composition['R'] || 0) + (composition['H'] || 0);
    const pI = 7 + (basic - acidic) * 0.5;

    // Hydrophobicité (échelle Kyte-Doolittle simplifiée)
    const hydrophobic = ['A', 'V', 'I', 'L', 'M', 'F', 'W', 'P'];
    const hydrophobicCount = cleanSeq.split('').filter(aa => hydrophobic.includes(aa)).length;
    const hydrophobicity = (hydrophobicCount / cleanSeq.length) * 100;

    setResult({
      length: cleanSeq.length,
      mw: mw.toFixed(2),
      extinction,
      pI: pI.toFixed(2),
      hydrophobicity: hydrophobicity.toFixed(1),
      composition
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Protein Calculator</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Séquence protéique</label>
          <textarea value={sequence} onChange={(e) => setSequence(e.target.value)} placeholder="Entrez votre séquence protéique (code 1 lettre)..." rows={8} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical', marginBottom: '1rem' }} />
          
          <button onClick={calculateProperties} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Atom size={20} /> Calculer les propriétés
          </button>
        </div>

        {result && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Propriétés physico-chimiques</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Longueur</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.length} aa</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Poids moléculaire</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.mw} Da</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Point isoélectrique</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>pH {result.pI}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Coefficient extinction</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.extinction} M⁻¹cm⁻¹</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hydrophobicité</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.hydrophobicity}%</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Composition en acides aminés</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(result.composition).sort().map(([aa, count]: any) => (
                  <div key={aa} style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>{aa}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{count} ({((count / result.length) * 100).toFixed(1)}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinCalculator;
