import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Lock, TrendingUp, Zap, AlertCircle, CheckCircle, Clock, Lightbulb, Edit3, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { checkBetaAccess, getBetaFeatures, getBetaStats } from '../utils/betaAccess';
import { getSortMode, getSortedModules, saveModulesOrder, getModulesOrder } from '../utils/betaModulesOrder';
import { showToast } from '../components/ToastNotification';

export const BetaHub: React.FC = () => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editMode, setEditMode] = useState(false);
  const [modules, setModules] = useState(getBetaFeatures());
  const [hiddenModules, setHiddenModules] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const sortMode = getSortMode();

  useEffect(() => {
    const access = checkBetaAccess();
    setHasAccess(access);
    
    if (!access) {
      setTimeout(() => navigate('/home'), 2000);
    }

    // Charger les modules cachés
    const hidden = localStorage.getItem('beta_hidden_modules');
    if (hidden) {
      try {
        setHiddenModules(JSON.parse(hidden));
      } catch (e) {
        console.error('Error loading hidden modules:', e);
      }
    }

    // Charger l'ordre personnalisé si en mode manuel
    if (sortMode === 'manual') {
      const customOrder = getModulesOrder();
      if (customOrder.length > 0) {
        const orderMap = new Map(customOrder.map(o => [o.id, o.order]));
        const sorted = [...getBetaFeatures()].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999;
          const orderB = orderMap.get(b.id) ?? 999;
          return orderA - orderB;
        });
        setModules(sorted);
      }
    }
  }, [navigate, sortMode]);

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#f8fafc'
      }}>
        <Lock size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Accès Refusé</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Cette section est réservée aux super administrateurs
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Redirection en cours...
        </p>
      </div>
    );
  }

  const features = getBetaFeatures();
  const stats = getBetaStats();
  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  // Utiliser la fonction de tri centralisée
  const sortedFeatures = getSortedModules(editMode ? modules : features);

  // Filtrer les modules cachés et par catégorie
  const filteredFeatures = sortedFeatures
    .filter(f => !hiddenModules.includes(f.id))
    .filter(f => selectedCategory === 'all' || f.category === selectedCategory);

  const handleToggleEditMode = () => {
    if (editMode) {
      // Sauvegarder l'ordre
      const order = modules.map((module, index) => ({
        id: module.id,
        order: index
      }));
      saveModulesOrder(order);
      showToast('success', '✅ Modifications sauvegardées');
    }
    setEditMode(!editMode);
  };

  const handleToggleVisibility = (moduleId: string) => {
    const newHidden = hiddenModules.includes(moduleId)
      ? hiddenModules.filter(id => id !== moduleId)
      : [...hiddenModules, moduleId];
    
    setHiddenModules(newHidden);
    localStorage.setItem('beta_hidden_modules', JSON.stringify(newHidden));
    showToast('success', hiddenModules.includes(moduleId) ? '👁️ Module affiché' : '🙈 Module masqué');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newModules = [...modules];
    const draggedModule = newModules[draggedIndex];
    newModules.splice(draggedIndex, 1);
    newModules.splice(index, 0, draggedModule);

    setModules(newModules);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return '#10b981';
      case 'development': return '#f59e0b';
      case 'planning': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return <CheckCircle size={18} />;
      case 'development': return <Zap size={18} />;
      case 'planning': return <Clock size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'stable': return 'Stable';
      case 'development': return 'En Développement';
      case 'planning': return 'Planifié';
      default: return 'Inconnu';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'
              }}>
                <Beaker size={36} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  margin: 0,
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Beta Test Hub
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>
                  Fonctionnalités expérimentales - Accès Super Admin
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={24} color="#10b981" />
                  <span style={{ color: '#10b981', fontSize: '2rem', fontWeight: '700' }}>
                    {stats.stable}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Fonctionnalités Stables</p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Zap size={24} color="#f59e0b" />
                  <span style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: '700' }}>
                    {stats.development}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>En Développement</p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(100, 116, 139, 0.1)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Clock size={24} color="#64748b" />
                  <span style={{ color: '#64748b', fontSize: '2rem', fontWeight: '700' }}>
                    {stats.planning}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Planifiées</p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <TrendingUp size={24} color="#3b82f6" />
                  <span style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: '700' }}>
                    {stats.total}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Category Filters */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: selectedCategory === cat ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                  color: selectedCategory === cat ? 'white' : '#60a5fa',
                  border: `1px solid ${selectedCategory === cat ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                {cat === 'all' ? 'Toutes' : cat}
              </button>
            ))}
          </div>

          {/* Edit Mode Toggle */}
          <button
            onClick={handleToggleEditMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: editMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(245, 158, 11, 0.1)',
              color: editMode ? 'white' : '#f59e0b',
              border: `2px solid ${editMode ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              boxShadow: editMode ? '0 4px 20px rgba(245, 158, 11, 0.4)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!editMode) {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!editMode) {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
              }
            }}
          >
            {editMode ? <Save size={20} /> : <Edit3 size={20} />}
            {editMode ? 'Sauvegarder' : 'Organiser'}
          </button>
        </div>

        {/* Edit Mode Info Banner */}
        {editMode && (
          <div style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 146, 60, 0.2))',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertCircle size={24} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '0.25rem' }}>
                Mode Édition Activé
              </div>
              <div style={{ color: '#fcd34d', fontSize: '0.9rem' }}>
                Glissez-déposez les cartes pour les réorganiser • Cliquez sur l'œil pour masquer/afficher un module
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              draggable={editMode}
              onDragStart={() => editMode && handleDragStart(index)}
              onDragOver={(e) => editMode && handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => !editMode && navigate(feature.path)}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: editMode ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: editMode ? 'grab' : 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                opacity: draggedIndex === index ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!editMode) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!editMode) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {/* Edit Mode Controls */}
              {editMode && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 10
                }}>
                  <div style={{
                    padding: '0.5rem',
                    background: 'rgba(245, 158, 11, 0.9)',
                    borderRadius: '6px',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <GripVertical size={20} color="white" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(feature.id);
                    }}
                    style={{
                      padding: '0.5rem',
                      background: hiddenModules.includes(feature.id) ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {hiddenModules.includes(feature.id) ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
                  </button>
                </div>
              )}

              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                background: `${getStatusColor(feature.status)}20`,
                border: `1px solid ${getStatusColor(feature.status)}`,
                borderRadius: '6px',
                color: getStatusColor(feature.status),
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {getStatusIcon(feature.status)}
                {getStatusLabel(feature.status)}
              </div>

              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                marginTop: editMode ? '2rem' : '0'
              }}>
                {/* Icône supprimée */}
              </div>

              <h3 style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.75rem'
              }}>
                {feature.name}
              </h3>

              <p style={{
                color: '#94a3b8',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {feature.description}
              </p>

              {/* Liste des fonctionnalités */}
              {(feature as any).features && (feature as any).features.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {(feature as any).features.slice(0, 3).map((feat: string, i: number) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.6rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '4px',
                          color: '#60a5fa',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        ✓ {feat}
                      </span>
                    ))}
                    {(feature as any).features.length > 3 && (
                      <span
                        style={{
                          padding: '0.25rem 0.6rem',
                          backgroundColor: 'rgba(100, 116, 139, 0.15)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '4px',
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        +{(feature as any).features.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                color: '#60a5fa',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {feature.category}
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'start'
        }}>
          <Lightbulb size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              À propos du Beta Test
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
              Ces fonctionnalités sont en cours de développement et réservées aux super administrateurs (Bastien, Issam, Ethan). 
              Vos retours sont essentiels pour améliorer ces outils avant leur déploiement général. 
              N'hésitez pas à signaler tout bug ou suggestion d'amélioration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaHub;
