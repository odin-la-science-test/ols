import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';

const GelSimulator = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<any[]>([{ name: 'Échantillon 1', sizes: '500,1000,2000' }]);
  const [gelPercent, setGelPercent] = useState(1.0);
  const [showGel, setShowGel] = useState(false);

  const addSample = () => {
    setSamples([...samples, { name: `Échantillon ${samples.length + 1}`, sizes: '' }]);
  };

  const updateSample = (index: number, field: string, value: string) => {
    const newSamples = [...samples];
    newSamples[index][field] = value;
    setSamples(newSamples);
  };

  const removeSample = (index: number) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const calculateMigration = (size: number) => {
    // Formule empirique: migration inversement proportionnelle au log(taille)
    const minSize = 100;
    const maxSize = 10000;
    const logSize = Math.log10(size);
    const logMin = Math.log10(minSize);
    const logMax = Math.log10(maxSize);
    const migration = 100 - ((logSize - logMin) / (logMax - logMin)) * 80;
    return Math.max(10, Math.min(90, migration));
  };

  const runGel = () => {
    if (samples.some(s => !s.sizes.trim())) {
      alert('Veuillez entrer des tailles pour tous les échantillons');
      return;
    }
    setShowGel(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gel Simulator</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showGel ? '1fr 2fr' : '1fr', gap: '2rem' }}>
          <div>
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Concentration du gel (%)</label>
              <input type="number" value={gelPercent} onChange={(e) => setGelPercent(Number(e.target.value))} min="0.5" max="3" step="0.1" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1rem' }} />
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                0.5-0.7%: 1-30 kb | 1%: 0.5-10 kb | 1.5%: 0.2-3 kb | 2%: 0.1-2 kb
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Échantillons</h3>
              {samples.map((sample, i) => (
                <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <input type="text" value={sample.name} onChange={(e) => updateSample(i, 'name', e.target.value)} placeholder="Nom" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', marginBottom: '0.5rem' }} />
                  <input type="text" value={sample.sizes} onChange={(e) => updateSample(i, 'sizes', e.target.value)} placeholder="Tailles (pb) séparées par virgules: 500,1000,2000" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', marginBottom: '0.5rem' }} />
                  {samples.length > 1 && (
                    <button onClick={() => removeSample(i)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addSample} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '1rem' }}>
                + Ajouter échantillon
              </button>
              
              <button onClick={runGel} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Zap size={20} /> Simuler migration
              </button>
            </div>
          </div>

          {showGel && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Gel d'agarose {gelPercent}%</h3>
              <div style={{ background: '#1a1a2e', borderRadius: '0.5rem', padding: '2rem', minHeight: '500px', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                  {samples.map((sample, i) => {
                    const sizes = sample.sizes.split(',').map((s: string) => parseInt(s.trim())).filter((s: number) => !isNaN(s));
                    return (
                      <div key={i} style={{ position: 'relative', width: '60px' }}>
                        <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>
                          {sample.name}
                        </div>
                        <div style={{ width: '100%', height: '500px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', position: 'relative' }}>
                          {sizes.map((size: number, j: number) => {
                            const migration = calculateMigration(size);
                            return (
                              <div key={j} style={{ position: 'absolute', top: `${migration}%`, left: '10%', right: '10%', height: '3px', background: '#00ff88', boxShadow: '0 0 10px #00ff88', borderRadius: '1px' }} title={`${size} pb`} />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.75rem', color: '#888' }}>
                  Puits (+)
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.75rem', color: '#888' }}>
                  Direction (-)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GelSimulator;
