import React, { useState } from 'react';
import { X, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignRight, RotateCw, Trash2 } from 'lucide-react';

interface ImageEditorProps {
  src: string;
  onSave: (imageHtml: string) => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onClose }) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState('auto');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'free'>('center');
  const [caption, setCaption] = useState('');
  const [borderRadius, setBorderRadius] = useState(8);
  const [rotation, setRotation] = useState(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [zIndex, setZIndex] = useState(1);

  const handleSave = () => {
    let imageHtml = '';
    
    if (alignment === 'free') {
      // Mode positionnement libre - Simplifié
      imageHtml = `<div class="image-container-free" style="position: relative; width: 100%; min-height: 400px; margin: 20px 0; border: 2px dashed rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 10px; background: rgba(30, 41, 59, 0.2);">`;
      imageHtml += `<img src="${src}" class="image-free" style="position: absolute; left: ${positionX}%; top: ${positionY}px; width: ${width}%; transform: translateX(-50%) rotate(${rotation}deg); border-radius: ${borderRadius}px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: ${zIndex};" alt="${caption || 'Image'}" />`;
      if (caption) {
        imageHtml += `<div style="position: absolute; left: ${positionX}%; top: ${positionY + 20}px; transform: translateX(-50%); font-size: 14px; color: #94a3b8; font-style: italic; background: rgba(15, 23, 42, 0.8); padding: 4px 8px; border-radius: 4px; z-index: ${zIndex + 1};">${caption}</div>`;
      }
      imageHtml += `</div>`;
    } else {
      // Mode alignement classique - Ultra simplifié
      const textAlign = alignment;
      imageHtml = `<div class="image-container-${alignment}" style="margin: 20px 0; text-align: ${textAlign};">`;
      imageHtml += `<img src="${src}" class="image-${alignment}" style="width: ${width}%; max-width: 100%; height: auto; border-radius: ${borderRadius}px; transform: rotate(${rotation}deg); box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: inline-block;" alt="${caption || 'Image'}" />`;
      if (caption) {
        imageHtml += `<div style="margin-top: 8px; font-size: 14px; color: #94a3b8; font-style: italic;">${caption}</div>`;
      }
      imageHtml += `</div>`;
    }

    onSave(imageHtml);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#f8fafc',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0
          }}>
            Éditer l'Image
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Preview */}
          <div>
            <h3 style={{
              color: '#cbd5e1',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Aperçu
            </h3>
            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              minHeight: '300px',
              display: 'flex',
              alignItems: alignment === 'free' ? 'flex-start' : 'center',
              justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
              position: 'relative'
            }}>
              {alignment === 'free' ? (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '400px',
                  border: '2px dashed rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px'
                }}>
                  <img
                    src={src}
                    alt="Preview"
                    style={{
                      position: 'absolute',
                      left: `${positionX}%`,
                      top: `${positionY}px`,
                      width: `${width}%`,
                      height: 'auto',
                      borderRadius: `${borderRadius}px`,
                      transform: `rotate(${rotation}deg)`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      maxWidth: '100%',
                      zIndex: zIndex
                    }}
                  />
                  {caption && (
                    <div style={{
                      position: 'absolute',
                      left: `${positionX}%`,
                      top: `${positionY + 20}px`,
                      transform: 'translateX(-50%)',
                      fontSize: '0.9rem',
                      color: '#94a3b8',
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap',
                      zIndex: zIndex
                    }}>
                      {caption}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#a78bfa',
                    fontWeight: '600'
                  }}>
                    Mode Libre - Déplaçable
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: alignment }}>
                  <img
                    src={src}
                    alt="Preview"
                    style={{
                      width: `${width}%`,
                      height: height === 'auto' ? 'auto' : `${height}px`,
                      borderRadius: `${borderRadius}px`,
                      transform: `rotate(${rotation}deg)`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      maxWidth: '100%'
                    }}
                  />
                  {caption && (
                    <p style={{
                      marginTop: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#94a3b8',
                      fontStyle: 'italic'
                    }}>
                      {caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div>
            <h3 style={{
              color: '#cbd5e1',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Paramètres
            </h3>

            {/* Width */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Largeur: {width}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#3b82f6'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {[25, 50, 75, 100].map(w => (
                  <button
                    key={w}
                    onClick={() => setWidth(w)}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      backgroundColor: width === w ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                      color: width === w ? 'white' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    {w}%
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Positionnement
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => setAlignment('left')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: alignment === 'left' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    color: alignment === 'left' ? 'white' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <AlignLeft size={16} />
                  Gauche
                </button>
                <button
                  onClick={() => setAlignment('center')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: alignment === 'center' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    color: alignment === 'center' ? 'white' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <AlignCenter size={16} />
                  Centre
                </button>
                <button
                  onClick={() => setAlignment('right')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: alignment === 'right' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    color: alignment === 'right' ? 'white' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <AlignRight size={16} />
                  Droite
                </button>
                <button
                  onClick={() => setAlignment('free')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: alignment === 'free' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
                    color: alignment === 'free' ? 'white' : '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <Maximize2 size={16} />
                  Libre
                </button>
              </div>
            </div>

            {/* Position libre */}
            {alignment === 'free' && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Position X: {positionX}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={positionX}
                    onChange={(e) => setPositionX(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#8b5cf6'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Position Y: {positionY}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={positionY}
                    onChange={(e) => setPositionY(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#8b5cf6'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Z-Index (superposition): {zIndex}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={zIndex}
                    onChange={(e) => setZIndex(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#8b5cf6'
                    }}
                  />
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginTop: '0.25rem'
                  }}>
                    Plus le nombre est élevé, plus l'image sera au-dessus
                  </div>
                </div>
              </>
            )}

            {/* Border Radius */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Arrondi des coins: {borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#3b82f6'
                }}
              />
            </div>

            {/* Rotation */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Rotation: {rotation}°
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#3b82f6'
                  }}
                />
                <button
                  onClick={() => setRotation((rotation + 90) % 360)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Rotation 90°"
                >
                  <RotateCw size={18} />
                </button>
              </div>
            </div>

            {/* Caption */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Légende (optionnel)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ajouter une légende..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: '#94a3b8',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Insérer l'Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
