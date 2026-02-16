import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplet } from 'lucide-react';

const PHCalculator = () => {
  const navigate = useNavigate();
  const [concentration, setConcentration] = useState('');
  const [type, setType] = useState<'acid' | 'base'>('acid');
  const [result, setResult] = useState('');

  const calculate = () => {
    const conc = parseFloat(concentration);
    if (isNaN(conc) || conc <= 0) {
      alert('Concentration invalide');
      return;
    }

    let ph: number;
    if (type === 'acid') {
      ph = -Math.log10(conc);
    } else {
      const pOH = -Math.log10(conc);
      ph = 14 - pOH;
    }

    setResult(ph.toFixed(2));
  };

  const getColor = (ph: number) => {
    if (ph < 7) return '#ef4444'; // Rouge (acide)
    if (ph > 7) return '#3b82f6'; // Bleu (basique)
    return '#10b981'; // Vert (neutre)
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Calculateur de pH</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type de solution</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setType('acid')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: type === 'acid' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: type === 'acid' ? 'rgba(99, 102, 241, 0.1)' : 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Acide fort
              </button>
              <button onClick={() => setType('base')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: type === 'base' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: type === 'base' ? 'rgba(99, 102, 241, 0.1)' : 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Base forte
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Concentration (M)</label>
            <input type="number" value={concentration} onChange={(e) => setConcentration(e.target.value)} placeholder="Ex: 0.01" step="0.001" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
          </div>

          <button onClick={calculate} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}>
            Calculer le pH
          </button>

          {result && (
            <div style={{ padding: '2rem', borderRadius: '0.5rem', background: `${getColor(parseFloat(result))}15`, border: `2px solid ${getColor(parseFloat(result))}`, textAlign: 'center' }}>
              <Droplet size={48} color={getColor(parseFloat(result))} style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '3rem', fontWeight: 700, color: getColor(parseFloat(result)), marginBottom: '0.5rem' }}>
                pH = {result}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                {parseFloat(result) < 7 ? 'Solution acide' : parseFloat(result) > 7 ? 'Solution basique' : 'Solution neutre'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PHCalculator;
