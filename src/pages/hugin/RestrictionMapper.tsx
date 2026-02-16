import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Download } from 'lucide-react';

const RestrictionMapper = () => {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Base de données d'enzymes de restriction communes
  const enzymes = [
    { name: 'EcoRI', site: 'GAATTC', cut: [1, 5] },
    { name: 'BamHI', site: 'GGATCC', cut: [1, 5] },
    { name: 'HindIII', site: 'AAGCTT', cut: [1, 5] },
    { name: 'PstI', site: 'CTGCAG', cut: [5, 1] },
    { name: 'SmaI', site: 'CCCGGG', cut: [3, 3] },
    { name: 'XbaI', site: 'TCTAGA', cut: [1, 5] },
    { name: 'SalI', site: 'GTCGAC', cut: [1, 5] },
    { name: 'NotI', site: 'GCGGCCGC', cut: [2, 6] },
    { name: 'XhoI', site: 'CTCGAG', cut: [1, 5] },
    { name: 'KpnI', site: 'GGTACC', cut: [5, 1] }
  ];

  const findRestrictionSites = () => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
    if (cleanSeq.length < 4) {
      alert('Séquence trop courte');
      return;
    }

    const found: any[] = [];
    enzymes.forEach(enzyme => {
      let pos = 0;
      while ((pos = cleanSeq.indexOf(enzyme.site, pos)) !== -1) {
        found.push({
          enzyme: enzyme.name,
          site: enzyme.site,
          position: pos + 1,
          cutPosition: pos + enzyme.cut[0]
        });
        pos++;
      }
    });

    found.sort((a, b) => a.position - b.position);
    setResults(found);
  };

  const exportResults = () => {
    const text = results.map(r => 
      `${r.enzyme}\t${r.site}\t${r.position}\t${r.cutPosition}`
    ).join('\n');
    const blob = new Blob([`Enzyme\tSite\tPosition\tCut Position\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restriction_sites.txt';
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Restriction Mapper</h1>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Séquence ADN</label>
          <textarea value={sequence} onChange={(e) => setSequence(e.target.value)} placeholder="Entrez votre séquence ADN..." rows={8} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical', marginBottom: '1rem' }} />
          
          <button onClick={findRestrictionSites} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Scissors size={20} /> Analyser les sites de restriction
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sites trouvés: {results.length}</h3>
              <button onClick={exportResults} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} /> Exporter
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Enzyme</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Site</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Position</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Coupure</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>{r.enzyme}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{r.site}</td>
                      <td style={{ padding: '0.75rem' }}>{r.position}</td>
                      <td style={{ padding: '0.75rem' }}>{r.cutPosition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestrictionMapper;
