import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker } from 'lucide-react';

const DilutionCalc = () => {
  const navigate = useNavigate();
  const [c1, setC1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');
  const [result, setResult] = useState<{ v1: string; solvent: string } | null>(null);

  const calculate = () => {
    const conc1 = parseFloat(c1);
    const conc2 = parseFloat(c2);
    const vol2 = parseFloat(v2);

    if (isNaN(conc1) || isNaN(conc2) || isNaN(vol2)) {
      alert('Veuillez entrer des valeurs valides');
      return;
    }

    if (conc2 > conc1) {
      alert('C2 doit être inférieur à C1');
      return;
    }

    // C1V1 = C2V2
    const v1 = (conc2 * vol2) / conc1;
    const solvent = vol2 - v1;

    setResult({
      v1: v1.toFixed(2),
      solvent: solvent.toFixed(2)
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/hugin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Calculateur de Dilution
          </h1>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(99, 102, 241, 0.1)',
            marginBottom: '2rem',
            border: '1px solid var(--primary-color)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
              Formule : C₁V₁ = C₂V₂
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              C₁ = Concentration initiale | V₁ = Volume à prélever<br />
              C₂ = Concentration finale | V₂ = Volume final
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                C₁ - Concentration initiale (M, mM, µM...)
              </label>
              <input
                type="number"
                value={c1}
                onChange={(e) => setC1(e.target.value)}
                placeholder="Ex: 10"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                C₂ - Concentration finale (même unité que C₁)
              </label>
              <input
                type="number"
                value={c2}
                onChange={(e) => setC2(e.target.value)}
                placeholder="Ex: 1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                V₂ - Volume final (mL, µL...)
              </label>
              <input
                type="number"
                value={v2}
                onChange={(e) => setV2(e.target.value)}
                placeholder="Ex: 100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <button
            onClick={calculate}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '1.5rem'
            }}
          >
            Calculer
          </button>

          {result && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{
                padding: '1.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10b981',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Beaker size={24} color="#10b981" />
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    Protocole de dilution
                  </div>
                </div>
                <div style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  1. Prélever <strong>{result.v1} unités</strong> de la solution stock (C₁)<br />
                  2. Ajouter <strong>{result.solvent} unités</strong> de solvant<br />
                  3. Volume final : <strong>{v2} unités</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DilutionCalc;
