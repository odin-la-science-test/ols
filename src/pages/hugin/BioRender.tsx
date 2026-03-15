import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Save, Download, Keyboard, HelpCircle } from 'lucide-react';
import InfiniteCanvas from '../../components/canvas/InfiniteCanvas';
import AssetSidebar from '../../components/canvas/AssetSidebar';
import PropertyPanel from '../../components/canvas/PropertyPanel';
import Navbar from '../../components/Navbar';
import { useElectron } from '../../hooks/useElectron';

const BioRender = () => {
  const navigate = useNavigate();
  const { isElectron } = useElectron();
  const canvasRef = useRef<any>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
      {!isElectron && <Navbar />}
      
      {/* Tool Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 24px', 
        height: '64px',
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: 'white', 
        zIndex: 20 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/hugin')}
            style={{ 
              padding: '8px', 
              borderRadius: '9999px', 
              border: 'none', 
              backgroundColor: 'transparent', 
              cursor: 'pointer', 
              color: '#4b5563',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Retour au dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#e5e7eb' }}></div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1.2 }}>Illustration Scientifique</h1>
            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, margin: 0 }}>BioRender Clone - Mode Édition</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: '#f9fafb', borderRadius: 'full', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>• LIVE</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Collaboration active</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#374151', 
              backgroundColor: 'white', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}>
              <Share2 size={16} />
              Partager
            </button>
            <button 
              onClick={() => canvasRef.current?.exportToImage()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: 'white', 
                backgroundColor: '#4f46e5', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
              }}
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar | Canvas | Properties */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AssetSidebar />
        
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#f8f9fa' }}>
          <InfiniteCanvas ref={canvasRef} />
        </div>

        <PropertyPanel />
      </div>

      {/* Status Bar */}
      <div style={{ height: '32px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 30 }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>Prêt</span>
          <div style={{ height: '12px', width: '1px', backgroundColor: '#e5e7eb' }}></div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', color: '#6b7280', fontSize: '11px', cursor: 'pointer' }}>
            <Keyboard size={14} />
            Raccourcis
          </button>
        </div>
        <button style={{ border: 'none', background: 'none', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
          <HelpCircle size={14} />
          Aide
        </button>
      </div>
    </div>
  );
};

export default BioRender;
