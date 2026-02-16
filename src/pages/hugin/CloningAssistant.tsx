import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';

const CloningAssistant = () => {
  const navigate = useNavigate();
  const [insert, setInsert] = useState('');
  const [vector, setVector] = useState('');
  const [enzyme5, setEnzyme5] = useState('EcoRI');
  const [enzyme3, setEnzyme3] = useState('BamHI');
  const [result, setResult] = useState<any>(null);

  const enzymeSites: any = {
    'EcoRI': 'GAATTC',
    'BamHI': 'GGATCC',
    'HindIII': 'AAGCTT',
    'PstI': 'CTGCAG',
    'XbaI': 'TCTAGA',
    'SalI': 'GTCGAC'
  };

  const designCloning = () => {
    const cleanInsert = insert.toUpperCase().replace(/[^ATGC]/g, '');
    const cleanVector = vector.toUpperCase().replace(/[^ATGC]/g, '');
    
    if (cleanInsert.length < 10 || cleanVector.length < 10) {
      alert('Séquences trop courtes');
      return;
    }

    const site5 = enzymeSites[enzyme5];
    const site3 = enzymeSites[enzyme3];

    const insertWithSites = site5 + cleanInsert + site3;
    const vectorSize = cleanVector.length;
    const insertSize = cleanInsert.length;
    const finalSize = vectorSize + insertSize;

    setResult({
      insertWithSites,
      vectorSize,
      insertSize,
      finalSize,
      enzyme5,
      enzyme3,
      site5,
      site3
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Cloning Assistant</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Insert (séquence à cloner)</label>
            <textarea value={insert} onChange={(e) => setInsert(e.target.value)} placeholder="Séquence de l'insert..." rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Vecteur</label>
            <textarea value={vector} onChange={(e) => setVector(e.target.value)} placeholder="Séquence du vecteur..." rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Enzyme 5'</label>
              <select value={enzyme5} onChange={(e) => setEnzyme5(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }}>
                {Object.keys(enzymeSites).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Enzyme 3'</label>
              <select value={enzyme3} onChange={(e) => setEnzyme3(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }}>
                {Object.keys(enzymeSites).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <button onClick={designCloning} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <GitBranch size={20} /> Designer le clonage
          </button>
        </div>

        {result && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Insert avec sites de restriction</h3>
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all', marginBottom: '1rem' }}>
                <span style={{ color: '#10b981' }}>{result.site5}</span>
                {result.insertWithSites.substring(result.site5.length, result.insertWithSites.length - result.site3.length)}
                <span style={{ color: '#3b82f6' }}>{result.site3}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vecteur</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.vectorSize} pb</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Insert</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.insertSize} pb</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Plasmide final</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.finalSize} pb</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Protocole de clonage</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>1. Digestion du vecteur</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Digérer avec {result.enzyme5} et {result.enzyme3} à 37°C pendant 2h</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>2. Amplification de l'insert</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PCR avec primers contenant les sites {result.enzyme5} (5') et {result.enzyme3} (3')</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>3. Digestion de l'insert</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Digérer le produit PCR avec {result.enzyme5} et {result.enzyme3}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>4. Ligation</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ratio molaire insert:vecteur = 3:1, T4 DNA ligase, 16°C overnight</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>5. Transformation</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transformer dans E. coli compétentes et sélectionner sur milieu approprié</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloningAssistant;
