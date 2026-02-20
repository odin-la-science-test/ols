import { useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Palette, AlertCircle } from 'lucide-react';

// Déclaration du type pour 3Dmol
declare global {
    interface Window {
        $3Dmol: any;
    }
}

interface Protein3DViewerProps {
    pdbData: string;
    plddtScores?: number[];
    width?: string;
    height?: string;
}

const Protein3DViewer = ({ pdbData, plddtScores, width = '100%', height = '500px' }: Protein3DViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const [viewer, setViewer] = useState<any>(null);
    const [style, setStyle] = useState<'cartoon' | 'stick' | 'sphere' | 'surface'>('cartoon');
    const [colorScheme, setColorScheme] = useState<'spectrum' | 'confidence' | 'secondary' | 'chain'>('confidence');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const scriptLoadedRef = useRef(false);

    // Charger 3Dmol.js
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        
        const loadScript = () => {
            if (typeof window !== 'undefined') {
                if (window.$3Dmol) {
                    scriptLoadedRef.current = true;
                    setTimeout(() => initViewer(), 100);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js';
                script.async = true;
                
                script.onload = () => {
                    console.log('3Dmol.js chargé avec succès');
                    scriptLoadedRef.current = true;
                    setTimeout(() => initViewer(), 100);
                };
                
                script.onerror = () => {
                    console.error('Erreur de chargement de 3Dmol.js');
                    setLoadError(true);
                    setIsLoading(false);
                };
                
                document.head.appendChild(script);
            }
        };

        loadScript();
    }, []);

    // Initialiser le viewer
    const initViewer = () => {
        if (!viewerRef.current || !window.$3Dmol) {
            console.error('Impossible d\'initialiser le viewer');
            setLoadError(true);
            setIsLoading(false);
            return;
        }

        try {
            const config = { backgroundColor: '#0a0a0a' };
            const newViewer = window.$3Dmol.createViewer(viewerRef.current, config);
            
            if (!newViewer) {
                throw new Error('Viewer non créé');
            }
            
            console.log('Viewer 3D initialisé');
            setViewer(newViewer);
            setIsLoading(false);
        } catch (error) {
            console.error('Erreur initialisation viewer:', error);
            setLoadError(true);
            setIsLoading(false);
        }
    };

    // Charger la structure PDB
    useEffect(() => {
        if (!viewer || !pdbData) return;

        try {
            console.log('Chargement de la structure PDB...');
            viewer.clear();
            viewer.addModel(pdbData, 'pdb');
            applyStyle();
            viewer.zoomTo();
            viewer.render();
            console.log('Structure chargée avec succès');
        } catch (error) {
            console.error('Erreur chargement PDB:', error);
        }
    }, [viewer, pdbData]);

    // Appliquer le style
    useEffect(() => {
        if (!viewer) return;
        applyStyle();
    }, [style, colorScheme, viewer]);

    const applyStyle = () => {
        if (!viewer) return;

        viewer.setStyle({}, {}); // Clear styles

        const styleConfig: any = {};

        // Style de représentation
        switch (style) {
            case 'cartoon':
                styleConfig.cartoon = { color: 'spectrum' };
                break;
            case 'stick':
                styleConfig.stick = { radius: 0.15 };
                break;
            case 'sphere':
                styleConfig.sphere = { radius: 0.5 };
                break;
            case 'surface':
                viewer.addSurface(window.$3Dmol.SurfaceType.VDW, { opacity: 0.85 });
                break;
        }

        // Schéma de couleur
        if (colorScheme === 'confidence' && plddtScores && plddtScores.length > 0) {
            // Colorer par score pLDDT
            const model = viewer.getModel(0);
            const atoms = model.selectedAtoms({});
            
            atoms.forEach((atom: any, idx: number) => {
                if (atom.resi && plddtScores[atom.resi - 1] !== undefined) {
                    const score = plddtScores[atom.resi - 1];
                    let color;
                    
                    if (score > 90) color = '#0066cc'; // Bleu foncé
                    else if (score > 70) color = '#00ccff'; // Cyan
                    else if (score > 50) color = '#ffcc00'; // Jaune
                    else color = '#ff6600'; // Orange
                    
                    atom.color = color;
                }
            });
            
            if (style === 'cartoon') {
                styleConfig.cartoon = { colorfunc: (atom: any) => atom.color || 'white' };
            } else if (style === 'stick') {
                styleConfig.stick = { 
                    radius: 0.15,
                    colorfunc: (atom: any) => atom.color || 'white'
                };
            } else if (style === 'sphere') {
                styleConfig.sphere = { 
                    radius: 0.5,
                    colorfunc: (atom: any) => atom.color || 'white'
                };
            }
        } else if (colorScheme === 'spectrum') {
            if (style === 'cartoon') styleConfig.cartoon.color = 'spectrum';
            else if (style === 'stick') styleConfig.stick.colorscheme = 'Jmol';
            else if (style === 'sphere') styleConfig.sphere.colorscheme = 'Jmol';
        } else if (colorScheme === 'secondary') {
            if (style === 'cartoon') styleConfig.cartoon.color = 'ss';
        } else if (colorScheme === 'chain') {
            if (style === 'cartoon') styleConfig.cartoon.color = 'chain';
        }

        if (style !== 'surface') {
            viewer.setStyle({}, styleConfig);
        }

        viewer.render();
    };

    const resetView = () => {
        if (!viewer) return;
        viewer.zoomTo();
        viewer.render();
    };

    const zoomIn = () => {
        if (!viewer) return;
        viewer.zoom(1.2);
        viewer.render();
    };

    const zoomOut = () => {
        if (!viewer) return;
        viewer.zoom(0.8);
        viewer.render();
    };

    const toggleFullscreen = () => {
        if (!viewerRef.current) return;
        
        if (!document.fullscreenElement) {
            viewerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Message d'erreur si 3Dmol ne charge pas */}
            {loadError && (
                <div style={{
                    padding: '2rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#ef4444' }}>
                        <AlertCircle size={20} />
                        <strong>Erreur de chargement du viewer 3D</strong>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        La bibliothèque 3Dmol.js n'a pas pu être chargée. Vérifiez votre connexion internet ou téléchargez le fichier PDB pour le visualiser dans un logiciel externe (PyMOL, Chimera, etc.).
                    </p>
                </div>
            )}

            {/* Contrôles */}
            {!loadError && (
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1rem', 
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Style de représentation */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {(['cartoon', 'stick', 'sphere', 'surface'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className="btn"
                                disabled={!viewer}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: style === s ? 'var(--accent-hugin)' : 'transparent',
                                    color: style === s ? 'white' : 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    opacity: !viewer ? 0.5 : 1
                                }}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

                    {/* Schéma de couleur */}
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <Palette size={16} style={{ color: 'var(--text-secondary)' }} />
                        {(['confidence', 'spectrum', 'secondary', 'chain'] as const).map(c => (
                            <button
                                key={c}
                                onClick={() => setColorScheme(c)}
                                className="btn"
                                disabled={!viewer}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: colorScheme === c ? 'var(--accent-secondary)' : 'transparent',
                                    color: colorScheme === c ? 'white' : 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    opacity: !viewer ? 0.5 : 1
                                }}
                            >
                                {c === 'confidence' ? 'Confiance' : 
                                 c === 'spectrum' ? 'Spectre' :
                                 c === 'secondary' ? 'Structure 2D' : 'Chaîne'}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

                    {/* Contrôles de vue */}
                    <button onClick={resetView} className="btn" disabled={!viewer} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', opacity: !viewer ? 0.5 : 1 }} title="Réinitialiser la vue">
                        <RotateCw size={18} />
                    </button>
                    <button onClick={zoomIn} className="btn" disabled={!viewer} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', opacity: !viewer ? 0.5 : 1 }} title="Zoom avant">
                        <ZoomIn size={18} />
                    </button>
                    <button onClick={zoomOut} className="btn" disabled={!viewer} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', opacity: !viewer ? 0.5 : 1 }} title="Zoom arrière">
                        <ZoomOut size={18} />
                    </button>
                    <button onClick={toggleFullscreen} className="btn" disabled={!viewer} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', opacity: !viewer ? 0.5 : 1 }} title="Plein écran">
                        <Maximize2 size={18} />
                    </button>
                </div>
            )}

            {/* Viewer 3D */}
            {!loadError && (
                <div 
                    ref={viewerContainerRef}
                    style={{ 
                        width, 
                        height, 
                        position: 'relative',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        background: '#0a0a0a'
                    }}
                >
                    <div 
                        ref={viewerRef} 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            position: 'relative'
                        }}
                    />
                    
                    {isLoading && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            zIndex: 10
                        }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>⏳</div>
                            <div>Chargement du viewer 3D...</div>
                        </div>
                    )}
                </div>
            )}

            {/* Légende */}
            {!loadError && colorScheme === 'confidence' && plddtScores && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '0.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', background: '#0066cc', borderRadius: '2px' }} />
                        <span>&gt; 90 (Très haute confiance)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', background: '#00ccff', borderRadius: '2px' }} />
                        <span>70-90 (Haute confiance)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', background: '#ffcc00', borderRadius: '2px' }} />
                        <span>50-70 (Confiance moyenne)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', background: '#ff6600', borderRadius: '2px' }} />
                        <span>&lt; 50 (Faible confiance)</span>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!loadError && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                }}>
                    <strong>💡 Contrôles :</strong> Clic gauche + glisser pour tourner • Molette pour zoomer • Clic droit + glisser pour déplacer
                </div>
            )}
        </div>
    );
};

export default Protein3DViewer;
