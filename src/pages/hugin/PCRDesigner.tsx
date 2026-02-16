import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dna, Copy, Check } from 'lucide-react';

const PCRDesigner = () => {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState('');
  const [primerLength, setPrimerLength] = useState(20);
  const [targetTm, setTargetTm] = useState(60);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState('');

  const calculateTm = (primer: string): number => {
    const gc = (primer.match(/[GC]/gi) || []).length;
    const at = (primer.match(/[AT]/gi) || []).length;
    // Formule simple: Tm = 4(G+C) + 2(A+T)
    return 4 * gc + 2 * at;
  };

  const calculateGC = (seq: string): number => {
    const gc = (seq.match(/[GC]/gi) || []).length;
    return (gc / seq.length) * 100;
  };

  const designPrimers = () => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
    
    if (cleanSeq.length < primerLength * 2) {
      alert('Séquence trop courte');
      return;
    }

    // Primer forward
    let forward = cleanSeq.substring(0, primerLength);
    let fwdTm = calculateTm(forward);
    
    // Ajuster la longueur pour atteindre Tm cible
    while (Math.abs(fwdTm - targetTm) > 5 && forward.length < 30) {
      if (fwdTm < targetTm) {
        forward = cleanSeq.substring(0, forward.length + 1);
      } else {
        forward = forward.substring(0, forward.length - 1);
      }
      fwdTm = calculateTm(forward);
    }

    // Primer reverse (complément inverse)
    const complement: any = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
    let reverse = cleanSeq.substring(cleanSeq.length - primerLength).split('').reverse().map(b => complement[b]).join('');
    let revTm = calculateTm(reverse);

    while (Math.abs(revTm - targetTm) > 5 && reverse.length < 30) {
      if (revTm < targetTm) {
        const extended = cleanSeq.substring(cleanSeq.length - (reverse.length + 1));
        reverse = extended.split('').reverse().map(b => complement[b]).join('');
      } else {
        reverse = reverse.substring(1);
      }
      revTm = calculateTm(reverse);
    }

    // Conditions PCR optimales
    const annealingTemp = Math.min(fwdTm, revTm) - 5;
    const productSize = cleanSeq.length;
    const extensionTime = Math.ceil(productSize / 1000); // 1 min par kb

    setResult({
      forward: {
        sequence: forward,
        tm: fwdTm.toFixed(1),
        gc: calculateGC(forward).toFixed(1),
        length: forward.length
      },
      reverse: {
        sequence: reverse,
        tm: revTm.toFixed(1),
        gc: calculateGC(reverse).toFixed(1),
        length: reverse.length
      },
      pcr: {
        annealing: annealingTemp.toFixed(1),
        extension: extensionTime,
        productSize
      }
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>PCR Designer</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Séquence cible (ADN)</label>
            <textarea value={sequence} onChange={(e) => setSequence(e.target.value)} placeholder="Entrez votre séquence ADN (ATGC)..." rows={6} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Longueur primer (nt)</label>
              <input type="number" value={primerLength} onChange={(e) => setPrimerLength(Number(e.target.value))} min="15" max="30" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tm cible (°C)</label>
              <input type="number" value={targetTm} onChange={(e) => setTargetTm(Number(e.target.value))} min="50" max="70" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>
          </div>

          <button onClick={designPrimers} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Dna size={20} /> Designer les primers
          </button>
        </div>

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>Primer Forward</h3>
                <button onClick={() => copyToClipboard(result.forward.sequence, 'fwd')} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #10b981', background: 'transparent', color: '#10b981', cursor: 'pointer' }}>
                  {copied === 'fwd' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {result.forward.sequence}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div><strong>Tm:</strong> {result.forward.tm}°C</div>
                <div><strong>GC:</strong> {result.forward.gc}%</div>
                <div><strong>Longueur:</strong> {result.forward.length} nt</div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>Primer Reverse</h3>
                <button onClick={() => copyToClipboard(result.reverse.sequence, 'rev')} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer' }}>
                  {copied === 'rev' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {result.reverse.sequence}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div><strong>Tm:</strong> {result.reverse.tm}°C</div>
                <div><strong>GC:</strong> {result.reverse.gc}%</div>
                <div><strong>Longueur:</strong> {result.reverse.length} nt</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Protocole PCR recommandé</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>1. Dénaturation initiale</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>95°C - 3 minutes</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>2. Cycles (×30-35)</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  • Dénaturation: 95°C - 30s<br />
                  • Hybridation: {result.pcr.annealing}°C - 30s<br />
                  • Élongation: 72°C - {result.pcr.extension} min
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>3. Élongation finale</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>72°C - 5 minutes</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Produit attendu</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.pcr.productSize} pb</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PCRDesigner;
