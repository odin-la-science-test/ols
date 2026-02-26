import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, GripVertical, RotateCcw, AlertCircle } from 'lucide-react';
import { isSuperAdmin, getBetaFeatures } from '../utils/betaAccess';
import { 
  getCurrentUserEmail, 
  getHuginModulesOrder, 
  getBetaModulesOrder,
  saveHuginModulesOrder,
  saveBetaModulesOrder,
  resetCustomization
} from '../utils/huginCustomization';
import type { ModuleOrder } from '../utils/huginCustomization';
import { showToast } from './ToastNotification';

interface Module {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  path: string;
}

interface HuginEditModeProps {
  modules: Module[];
  onClose: () => void;
  onSave: () => void;
}

const HuginEditMode: React.FC<HuginEditModeProps> = ({ modules, onClose, onSave }) => {
  const [huginModules, setHuginModules] = useState<Module[]>([]);
  const [betaModules, setBetaModules] = useState<any[]>([]);
  const [huginVisibility, setHuginVisibility] = useState<Map<string, boolean>>(new Map());
  const [betaVisibility, setBetaVisibility] = useState<Map<string, boolean>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<'hugin' | 'beta' | null>(null);
  const isAdmin = isSuperAdmin(getCurrentUserEmail());

  useEffect(() => {
    // Charger l'ordre personnalisé
    const huginOrder = getHuginModulesOrder();
    const betaOrder = getBetaModulesOrder();
    
    // Initialiser les modules Hugin
    let sortedHugin = [...modules];
    if (huginOrder.length > 0) {
      const orderMap = new Map(huginOrder.map(o => [o.id, o]));
      sortedHugin.sort((a, b) => {
        const orderA = orderMap.get(a.id)?.order ?? 999;
        const orderB = orderMap.get(b.id)?.order ?? 999;
        return orderA - orderB;
      });
      
      // Charger la visibilité
      const visMap = new Map<string, boolean>();
      huginOrder.forEach(o => visMap.set(o.id, o.visible !== false));
      setHuginVisibility(visMap);
    } else {
      // Par défaut, tous visibles
      const visMap = new Map<string, boolean>();
      modules.forEach(m => visMap.set(m.id, true));
      setHuginVisibility(visMap);
    }
    setHuginModules(sortedHugin);
    
    // Initialiser les modules Beta (pour super admins)
    if (isAdmin) {
      const betaFeatures = getBetaFeatures();
      let sortedBeta = [...betaFeatures];
      if (betaOrder.length > 0) {
        const orderMap = new Map(betaOrder.map(o => [o.id, o]));
        sortedBeta.sort((a, b) => {
          const orderA = orderMap.get(a.id)?.order ?? 999;
          const orderB = orderMap.get(b.id)?.order ?? 999;
          return orderA - orderB;
        });
        
        // Charger la visibilité
        const visMap = new Map<string, boolean>();
        betaOrder.forEach(o => visMap.set(o.id, o.visible !== false));
        setBetaVisibility(visMap);
      } else {
        // Par défaut, tous visibles
        const visMap = new Map<string, boolean>();
        betaFeatures.forEach(m => visMap.set(m.id, true));
        setBetaVisibility(visMap);
      }
      setBetaModules(sortedBeta);
    }
  }, [modules, isAdmin]);

  const handleDragStart = (index: number, from: 'hugin' | 'beta') => {
    setDraggedIndex(index);
    setDraggedFrom(from);
  };

  const handleDragOver = (e: React.DragEvent, index: number, to: 'hugin' | 'beta') => {
    e.preventDefault();
    if (draggedIndex === null || draggedFrom === null) return;

    // Drag & drop dans la même zone
    if (draggedFrom === to) {
      if (draggedIndex === index) return;
      
      // Réorganiser dans la même zone
      if (to === 'hugin') {
        const newModules = [...huginModules];
        const draggedModule = newModules[draggedIndex];
        newModules.splice(draggedIndex, 1);
        newModules.splice(index, 0, draggedModule);
        setHuginModules(newModules);
        setDraggedIndex(index);
      } else {
        const newModules = [...betaModules];
        const draggedModule = newModules[draggedIndex];
        newModules.splice(draggedIndex, 1);
        newModules.splice(index, 0, draggedModule);
        setBetaModules(newModules);
        setDraggedIndex(index);
      }
    }
  };

  const handleDropOnZone = (e: React.DragEvent, targetZone: 'hugin' | 'beta') => {
    e.preventDefault();
    if (draggedIndex === null || draggedFrom === null) return;
    if (draggedFrom === targetZone) return; // Déjà dans la bonne zone
    if (!isAdmin) return; // Seulement pour super admins

    if (draggedFrom === 'beta' && targetZone === 'hugin') {
      // Beta → Hugin
      const draggedModule = betaModules[draggedIndex];
      const newBeta = betaModules.filter((_, i) => i !== draggedIndex);
      const newHugin = [...huginModules];
      
      // Convertir le module beta en module hugin
      const huginModule: Module = {
        id: `beta_${draggedModule.id}`,
        name: draggedModule.name,
        desc: draggedModule.description,
        icon: draggedModule.icon,
        category: draggedModule.category,
        path: draggedModule.path
      };
      
      newHugin.push(huginModule);
      setBetaModules(newBeta);
      setHuginModules(newHugin);
      setHuginVisibility(new Map(huginVisibility).set(huginModule.id, true));
      showToast('success', `✅ ${draggedModule.name} ajouté à Hugin`);
    } else if (draggedFrom === 'hugin' && targetZone === 'beta') {
      // Hugin → Beta (seulement si c'est un module beta)
      const draggedModule = huginModules[draggedIndex];
      if (!draggedModule.id.startsWith('beta_')) {
        showToast('error', '❌ Seuls les modules beta peuvent être déplacés vers Beta Hub');
        return;
      }
      
      const newHugin = huginModules.filter((_, i) => i !== draggedIndex);
      const newBeta = [...betaModules];
      
      // Retrouver le module beta original
      const originalId = draggedModule.id.replace('beta_', '');
      const betaFeatures = getBetaFeatures();
      const originalBeta = betaFeatures.find(f => f.id === originalId);
      
      if (originalBeta) {
        newBeta.push(originalBeta);
        setHuginModules(newHugin);
        setBetaModules(newBeta);
        setBetaVisibility(new Map(betaVisibility).set(originalBeta.id, true));
        showToast('success', `✅ ${draggedModule.name} retiré de Hugin`);
      }
    }
    
    setDraggedIndex(null);
    setDraggedFrom(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedFrom(null);
  };

  const toggleVisibility = (id: string, zone: 'hugin' | 'beta') => {
    if (zone === 'hugin') {
      const newMap = new Map(huginVisibility);
      newMap.set(id, !newMap.get(id));
      setHuginVisibility(newMap);
    } else {
      const newMap = new Map(betaVisibility);
      newMap.set(id, !newMap.get(id));
      setBetaVisibility(newMap);
    }
  };

  const handleSave = () => {
    // Créer les ordres
    const huginOrder: ModuleOrder[] = huginModules.map((m, index) => ({
      id: m.id,
      order: index,
      visible: huginVisibility.get(m.id) !== false
    }));
    
    const betaOrder: ModuleOrder[] = betaModules.map((m, index) => ({
      id: m.id,
      order: index,
      visible: betaVisibility.get(m.id) !== false
    }));
    
    console.log('💾 Sauvegarde Hugin:', huginOrder);
    console.log('💾 Sauvegarde Beta:', betaOrder);
    
    saveHuginModulesOrder(huginOrder);
    if (isAdmin) {
      saveBetaModulesOrder(betaOrder);
    }
    
    showToast('success', '✅ Personnalisation sauvegardée - Rechargement...');
    
    // Fermer et recharger après un court délai
    setTimeout(() => {
      onSave();
      onClose();
      window.location.reload();
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser votre personnalisation ?')) {
      resetCustomization();
      showToast('success', '🔄 Personnalisation réinitialisée');
      window.location.reload();
    }
  };

  const moveToHugin = (betaIndex: number) => {
    const draggedModule = betaModules[betaIndex];
    
    // Créer le nouveau module Hugin
    const huginModule: Module = {
      id: `beta_${draggedModule.id}`,
      name: draggedModule.name,
      desc: draggedModule.description,
      icon: <span style={{ fontSize: '1.5rem' }}>🧪</span>,
      category: draggedModule.category,
      path: draggedModule.path
    };
    
    console.log('✅ Ajout à Hugin:', huginModule);
    
    // Mettre à jour les états
    const newBeta = betaModules.filter((_, i) => i !== betaIndex);
    const newHugin = [...huginModules, huginModule];
    
    setBetaModules(newBeta);
    setHuginModules(newHugin);
    
    // Mettre à jour la visibilité
    const newVisibility = new Map(huginVisibility);
    newVisibility.set(huginModule.id, true);
    setHuginVisibility(newVisibility);
    
    showToast('success', `✅ ${draggedModule.name} ajouté à Hugin`);
  };

  const moveToBeta = (huginIndex: number) => {
    const draggedModule = huginModules[huginIndex];
    
    console.log('🔄 Tentative de retrait:', draggedModule.id);
    
    if (!draggedModule.id.startsWith('beta_')) {
      showToast('error', '❌ Seuls les modules beta peuvent être retirés');
      return;
    }
    
    // Retrouver le module beta original
    const originalId = draggedModule.id.replace('beta_', '');
    const betaFeatures = getBetaFeatures();
    const originalBeta = betaFeatures.find(f => f.id === originalId);
    
    if (!originalBeta) {
      showToast('error', '❌ Module beta introuvable');
      return;
    }
    
    console.log('✅ Module beta trouvé:', originalBeta);
    
    // Mettre à jour les états
    const newHugin = huginModules.filter((_, i) => i !== huginIndex);
    const newBeta = [...betaModules, originalBeta];
    
    setHuginModules(newHugin);
    setBetaModules(newBeta);
    
    // Mettre à jour la visibilité
    const newVisibility = new Map(betaVisibility);
    newVisibility.set(originalBeta.id, true);
    setBetaVisibility(newVisibility);
    
    showToast('success', `✅ ${draggedModule.name} retiré de Hugin`);
  };

  const renderModuleCard = (module: any, index: number, zone: 'hugin' | 'beta') => {
    const isVisible = zone === 'hugin' 
      ? huginVisibility.get(module.id) !== false 
      : betaVisibility.get(module.id) !== false;
    
    const isDragging = draggedIndex === index && draggedFrom === zone;
    const isBetaModule = zone === 'hugin' && module.id.startsWith('beta_');
    
    // Debug log
    if (zone === 'hugin') {
      console.log('Module Hugin:', module.id, 'isBetaModule:', isBetaModule);
    }

    return (
      <div
        key={`${zone}_${module.id}`}
        draggable
        onDragStart={() => handleDragStart(index, zone)}
        onDragOver={(e) => handleDragOver(e, index, zone)}
        onDragEnd={handleDragEnd}
        style={{
          background: isDragging ? 'rgba(99, 102, 241, 0.2)' : (isBetaModule ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
          border: `2px solid ${isDragging ? 'var(--accent-hugin)' : (isBetaModule ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)')}`,
          borderRadius: '12px',
          padding: '1rem',
          cursor: 'grab',
          opacity: isDragging ? 0.5 : (isVisible ? 1 : 0.4),
          transition: 'all 0.2s',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{
            padding: '0.5rem',
            background: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '6px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <GripVertical size={20} color="#f59e0b" />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                {module.name}
              </h4>
              {isBetaModule && (
                <span style={{
                  padding: '0.25rem 0.6rem',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}>
                  🧪 BETA
                </span>
              )}
            </div>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.85rem', 
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {module.desc || module.description}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
            {isAdmin && zone === 'beta' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Clic sur → pour module:', module.id);
                  moveToHugin(index);
                }}
                title="Ajouter à Hugin"
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.3))',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-hugin)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-hugin)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.3))';
                  e.currentTarget.style.color = 'var(--accent-hugin)';
                }}
              >
                →
              </button>
            )}
            
            {isAdmin && zone === 'hugin' && isBetaModule && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Clic sur ← pour module:', module.id);
                  moveToBeta(index);
                }}
                title="Retirer de Hugin"
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.3))',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.3))';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                ←
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(module.id, zone);
              }}
              style={{
                padding: '0.5rem',
                background: isVisible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isVisible ? <Eye size={20} color="#10b981" /> : <EyeOff size={20} color="#ef4444" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Personnaliser Hugin Lab
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Organisez vos modules selon vos préférences
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} color="#ef4444" />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          margin: '1.5rem',
          padding: '1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Glissez-déposez</strong> les cartes pour les réorganiser • 
            Cliquez sur <Eye size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 0.25rem' }} /> pour masquer/afficher
            {isAdmin && <> • <strong style={{ color: 'var(--accent-hugin)' }}>Super Admin:</strong> Utilisez les boutons → et ← pour déplacer entre Hugin et Beta</>}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
          display: isAdmin ? 'grid' : 'block',
          gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr',
          gap: isAdmin ? '1.5rem' : '0'
        }}>
          {/* Colonne Hugin */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--accent-hugin)' }}>
                Modules Hugin ({huginModules.length})
              </h3>
            </div>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnZone(e, 'hugin')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '200px',
                padding: '1rem',
                border: draggedFrom === 'beta' ? '2px dashed var(--accent-hugin)' : '2px dashed transparent',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}
            >
              {huginModules.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Aucun module
                </div>
              )}
              {huginModules.map((module, index) => renderModuleCard(module, index, 'hugin'))}
            </div>
          </div>

          {/* Colonne Beta (super admins uniquement) */}
          {isAdmin && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#f59e0b' }}>
                  Modules Beta ({betaModules.length})
                </h3>
              </div>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnZone(e, 'beta')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minHeight: '200px',
                  padding: '1rem',
                  border: draggedFrom === 'hugin' ? '2px dashed #f59e0b' : '2px dashed transparent',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
              >
                {betaModules.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    Aucun module beta
                  </div>
                )}
                {betaModules.map((module, index) => renderModuleCard(module, index, 'beta'))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RotateCcw size={18} />
            Réinitialiser
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--accent-hugin), #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Save size={18} />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HuginEditMode;
