import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';
import './ketcher-theme.css';
import { Beaker, Save, Download, Copy, ArrowLeft, Bot } from 'lucide-react';
import { showToast } from '../../../components/ToastNotification';

const structServiceProvider = new StandaloneStructServiceProvider();

export default function ChemicalEditor() {
  const navigate = useNavigate();
  const [ketcher, setKetcher] = useState<any>(null);

  const handleInit = (ketcherInstance: any) => {
    setKetcher(ketcherInstance);
    window.ketcher = ketcherInstance; 
  };

  const exportSmiles = async () => {
    if (!ketcher) return;
    try {
      const smiles = await ketcher.getSmiles();
      await navigator.clipboard.writeText(smiles);
      showToast('success', 'SMILES copié dans le presse-papiers');
    } catch (e) {
      showToast('error', "Erreur lors de l'export SMILES");
      console.error(e);
    }
  };

  const exportMol = async () => {
    if (!ketcher) return;
    try {
      const molfile = await ketcher.getMolfile();
      const blob = new Blob([molfile], { type: 'chemical/x-mdl-molfile' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'structure.mol';
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Fichier MOL exporté');
    } catch (e) {
      showToast('error', "Erreur lors de l'export MOL");
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/hugin')}
            style={{ 
              background: 'transparent',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              border: '1px solid transparent'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            title="Retour au dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Beaker style={{ color: 'var(--accent-primary)' }} size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, white, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Éditeur Chimique
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Dessinez et analysez des structures moléculaires</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-mimir'))}
            className="btn"
            style={{ 
              backgroundColor: 'rgba(129, 140, 248, 0.1)', 
              color: '#818cf8', 
              border: '1px solid rgba(129, 140, 248, 0.3)', 
              fontSize: '0.9rem' 
            }}
            title="Demander à Mímir"
          >
            <Bot size={16} />
            <span className="desktop-only">Mímir</span>
          </button>
          <button 
            onClick={exportSmiles}
            className="btn"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
          >
            <Copy size={16} />
            <span className="desktop-only">SMILES</span>
          </button>
          <button 
            onClick={exportMol}
            className="btn"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.9rem' }}
          >
            <Download size={16} />
            <span className="desktop-only">MOL</span>
          </button>
          <button 
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
          >
            <Save size={16} />
            Enregistrer
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div 
        className="ketcher-container" 
        style={{ 
          margin: '1.5rem', 
          borderRadius: '1rem', 
          overflow: 'hidden', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-color)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white'
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Editor
            staticResourcesUrl={import.meta.env?.BASE_URL || ''}
            structServiceProvider={structServiceProvider}
            onInit={handleInit}
          />
        </div>
      </div>
    </div>
  );
}
