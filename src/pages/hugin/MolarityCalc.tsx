import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker } from 'lucide-react';

const MolarityCalc = () => {
  const navigate = useNavigate();
  const [mass, setMass] = useState('');
  const [mw, setMw] = useState('');
  const [volume, setVolume] = useState('');
  const [result, setResult] = useState('');

  const calculate = () => {
    const m = parseFloat(mass);
    const MW = parseFloat(mw);
    const v = parseFloat(volume);

    if (isNaN(m) || isNaN(MW) || isNaN(v) || v === 0) {
      alert('Valeurs invalides');
      return;
    }

    // M = (masse en g / MW en g/mol) / volume en L
    const molarity = (m / MW) / (v / 1000);
    setResult(molarity.toFixed(4));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Calculateur de Molarité</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
              Formule : M = n / V = (m / MW) / V
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              M = Molarité (mol/L) | m = masse (g) | MW = masse molaire (g/mol) | V = volume (mL)
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Masse du soluté (g)</label>
              <input type="number" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="Ex: 5.85" step="0.01" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Masse molaire (g/mol)</label>
              <input type="number" value={mw} onChange={(e) => setMw(e.target.value)} placeholder="Ex: 58.44 (NaCl)" step="0.01" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Volume de solution (mL)</label>
              <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Ex: 1000" step="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>
          </div>

          <button onClick={calculate} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '1.5rem' }}>
            Calculer
          </button>

          {result && (
            <div style={{ marginTop: '2rem', padding: '2rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', textAlign: 'center' }}>
              <Beaker size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                {result} M
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Molarité de la solution
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                = {(parseFloat(result) * 1000).toFixed(2)} mM = {(parseFloat(result) * 1000000).toFixed(2)} µM
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MolarityCalc;
