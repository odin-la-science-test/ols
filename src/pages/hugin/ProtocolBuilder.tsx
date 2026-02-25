import React, { useState, useEffect } from 'react';
import { FileText, Plus, Save, Download, Copy, Trash2, Clock, Thermometer, AlertTriangle, Beaker, ChevronUp, ChevronDown, Eye, Edit3, Share2, Search, Filter, List as ListIcon, X, Tag, Lock, CheckCircle } from 'lucide-react';
import { showToast } from '../../components/ToastNotification';
import { RichTextEditor } from '../../components/RichTextEditor';
import { useAutoSave } from '../../hooks/useAutoSave';

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  temperature?: string;
  notes?: string;
  warnings?: string[];
  criticalPoint?: boolean;
  images?: string[];
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: ProtocolStep[];
  materials: string[];
  equipment: string[];
  safety: string[];
  estimatedTime?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Difficile';
  author?: string;
  version?: number;
  lastModified?: string;
  tags?: string[];
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  validationSignature?: string;
}

const templates: Protocol[] = [
  {
    id: 'pcr',
    name: 'PCR Standard',
    description: 'Protocole PCR classique pour amplification d\'ADN',
    category: 'Biologie Moléculaire',
    estimatedTime: '3 heures',
    difficulty: 'Moyen',
    steps: [
      { id: '1', title: 'Dénaturation initiale', description: 'Chauffer à 95°C pour dénaturer complètement l\'ADN double brin', duration: '5 min', temperature: '95°C', criticalPoint: true, warnings: ['Ne pas dépasser 5 minutes'] },
      { id: '2', title: 'Dénaturation (35 cycles)', description: 'Séparer les brins d\'ADN', duration: '30 sec', temperature: '95°C' },
      { id: '3', title: 'Hybridation (35 cycles)', description: 'Permettre aux primers de s\'hybrider', duration: '30 sec', temperature: '55-65°C', notes: 'Ajuster selon Tm' },
      { id: '4', title: 'Élongation (35 cycles)', description: 'Extension des primers', duration: '1 min/kb', temperature: '72°C' },
      { id: '5', title: 'Élongation finale', description: 'Compléter les synthèses', duration: '10 min', temperature: '72°C', criticalPoint: true }
    ],
    materials: ['ADN polymérase', 'dNTPs', 'Primers', 'Buffer PCR', 'ADN template', 'Eau stérile'],
    equipment: ['Thermocycleur', 'Tubes PCR', 'Micropipettes', 'Glace'],
    safety: ['Porter des gants', 'Éviter contamination', 'Embouts avec filtre'],
    tags: ['PCR', 'ADN', 'Amplification']
  },
  {
    id: 'western',
    name: 'Western Blot',
    description: 'Détection de protéines par immunoblot',
    category: 'Biochimie',
    estimatedTime: '2 jours',
    difficulty: 'Difficile',
    steps: [
      { id: '1', title: 'Extraction protéique', description: 'Lyser les cellules', duration: '30 min', temperature: '4°C', criticalPoint: true, warnings: ['Travailler sur glace', 'Inhibiteurs de protéases'] },
      { id: '2', title: 'Dosage protéique', description: 'Quantifier (Bradford/BCA)', duration: '30 min' },
      { id: '3', title: 'SDS-PAGE', description: 'Séparer les protéines', duration: '1-2h' },
      { id: '4', title: 'Transfert', description: 'Transférer sur membrane', duration: '1-2h', temperature: '4°C', criticalPoint: true },
      { id: '5', title: 'Saturation', description: 'Bloquer sites non spécifiques', duration: '1h' },
      { id: '6', title: 'Anticorps 1°', description: 'Incubation overnight', duration: 'Overnight', temperature: '4°C', criticalPoint: true },
      { id: '7', title: 'Lavages', description: 'Éliminer excès', duration: '30 min' },
      { id: '8', title: 'Anticorps 2°', description: 'Incubation HRP', duration: '1h' },
      { id: '9', title: 'Révélation', description: 'Chimioluminescence', duration: '5 min', warnings: ['Obscurité'] }
    ],
    materials: ['Tampon lyse', 'Kit dosage', 'Gel SDS', 'Membrane', 'Anticorps', 'Substrat ECL'],
    equipment: ['Sonicateur', 'Spectrophotomètre', 'Cuve électrophorèse', 'Système transfert', 'Imageur'],
    safety: ['Blouse, gants, lunettes', 'Acrylamide neurotoxique', 'Déchets chimiques'],
    tags: ['Western', 'Protéines', 'Immunoblot']
  }
];

export const ProtocolBuilder: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('protocols');
    if (saved) {
      setProtocols(JSON.parse(saved));
    }
  }, []);

  const saveProtocols = (newProtocols: Protocol[]) => {
    localStorage.setItem('protocols', JSON.stringify(newProtocols));
    setProtocols(newProtocols);
  };

  useAutoSave({
    data: protocols,
    onSave: (data) => localStorage.setItem('protocols', JSON.stringify(data)),
    interval: 30000
  });

  const createNewProtocol = () => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newProtocol: Protocol = {
      id: Date.now().toString(),
      name: 'Nouveau Protocole',
      description: '',
      category: 'Général',
      steps: [],
      materials: [],
      equipment: [],
      safety: [],
      estimatedTime: '',
      difficulty: 'Moyen',
      author: currentUser,
      version: 1,
      lastModified: new Date().toISOString(),
      tags: []
    };
    setCurrentProtocol(newProtocol);
  };

  const saveCurrentProtocol = () => {
    if (!currentProtocol) return;

    if (currentProtocol.validated) {
      showToast('error', '❌ Impossible de modifier un protocole validé');
      return;
    }

    const updatedProtocol = {
      ...currentProtocol,
      lastModified: new Date().toISOString(),
      version: (currentProtocol.version || 1) + 1
    };

    const existingIndex = protocols.findIndex(p => p.id === updatedProtocol.id);
    let newProtocols;

    if (existingIndex >= 0) {
      newProtocols = [...protocols];
      newProtocols[existingIndex] = updatedProtocol;
    } else {
      newProtocols = [updatedProtocol, ...protocols];
    }

    saveProtocols(newProtocols);
    setCurrentProtocol(updatedProtocol);
    showToast('success', '✅ Protocole sauvegardé (v' + updatedProtocol.version + ')');
  };

  const validateProtocol = () => {
    if (!currentProtocol) return;

    if (currentProtocol.validated) {
      showToast('warning', '⚠️ Ce protocole est déjà validé');
      return;
    }

    if (!currentProtocol.name.trim() || currentProtocol.steps.length === 0) {
      showToast('error', '❌ Le protocole doit avoir un nom et au moins une étape');
      return;
    }

    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const signature = `${currentUser}_${new Date().toISOString()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const validatedProtocol = {
      ...currentProtocol,
      validated: true,
      validatedBy: currentUser,
      validatedAt: new Date().toISOString(),
      validationSignature: signature
    };

    const existingIndex = protocols.findIndex(p => p.id === validatedProtocol.id);
    let newProtocols;

    if (existingIndex >= 0) {
      newProtocols = [...protocols];
      newProtocols[existingIndex] = validatedProtocol;
    } else {
      newProtocols = [validatedProtocol, ...protocols];
    }

    saveProtocols(newProtocols);
    setCurrentProtocol(validatedProtocol);
    showToast('success', '🔒 Protocole validé et verrouillé par ' + currentUser);
  };

  const addStep = () => {
    if (!currentProtocol) return;
    const newStep: ProtocolStep = {
      id: Date.now().toString(),
      title: 'Nouvelle étape',
      description: '',
      warnings: []
    };
    setCurrentProtocol({ ...currentProtocol, steps: [...currentProtocol.steps, newStep] });
  };

  const deleteStep = (stepId: string) => {
    if (!currentProtocol) return;
    setCurrentProtocol({
      ...currentProtocol,
      steps: currentProtocol.steps.filter(s => s.id !== stepId)
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!currentProtocol) return;
    const newSteps = [...currentProtocol.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setCurrentProtocol({ ...currentProtocol, steps: newSteps });
  };

  const duplicateProtocol = () => {
    if (!currentProtocol) return;
    const duplicate: Protocol = {
      ...currentProtocol,
      id: Date.now().toString(),
      name: currentProtocol.name + ' (Copie)',
      version: 1,
      lastModified: new Date().toISOString()
    };
    const newProtocols = [duplicate, ...protocols];
    saveProtocols(newProtocols);
    setCurrentProtocol(duplicate);
    showToast('success', '📋 Protocole dupliqué');
  };

  const deleteProtocol = () => {
    if (!currentProtocol) return;
    
    if (currentProtocol.validated) {
      showToast('error', '❌ Impossible de supprimer un protocole validé');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce protocole ?')) {
      const newProtocols = protocols.filter(p => p.id !== currentProtocol.id);
      saveProtocols(newProtocols);
      setCurrentProtocol(null);
      showToast('success', '🗑️ Protocole supprimé');
    }
  };

  const loadTemplate = (template: Protocol) => {
    const newProtocol = {
      ...template,
      id: Date.now().toString(),
      author: localStorage.getItem('currentUser') || 'Utilisateur',
      version: 1,
      lastModified: new Date().toISOString()
    };
    setCurrentProtocol(newProtocol);
    setShowTemplates(false);
    showToast('success', '📄 Template chargé');
  };

  const exportProtocol = () => {
    if (!currentProtocol) return;
    const content = `
PROTOCOLE: ${currentProtocol.name}
${'='.repeat(50)}

Description: ${currentProtocol.description}
Catégorie: ${currentProtocol.category}
Difficulté: ${currentProtocol.difficulty}
Temps estimé: ${currentProtocol.estimatedTime}
Auteur: ${currentProtocol.author}
Version: ${currentProtocol.version}

ÉTAPES:
${currentProtocol.steps.map((step, i) => `
${i + 1}. ${step.title}
   ${step.description}
   ${step.duration ? `Durée: ${step.duration}` : ''}
   ${step.temperature ? `Température: ${step.temperature}` : ''}
   ${step.criticalPoint ? '⚠️ POINT CRITIQUE' : ''}
   ${step.warnings?.length ? `Avertissements: ${step.warnings.join(', ')}` : ''}
   ${step.notes ? `Notes: ${step.notes}` : ''}
`).join('\n')}

MATÉRIEL:
${currentProtocol.materials.map(m => `- ${m}`).join('\n')}

ÉQUIPEMENT:
${currentProtocol.equipment.map(e => `- ${e}`).join('\n')}

SÉCURITÉ:
${currentProtocol.safety.map(s => `⚠️ ${s}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocol-${currentProtocol.name.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '📄 Protocole exporté');
  };

  const categories = Array.from(new Set(protocols.map(p => p.category)));
  const filteredProtocols = protocols.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileText size={32} color="#3b82f6" />
          <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
            Protocol Builder
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <ListIcon size={20} />
            Templates
          </button>
          <button
            onClick={createNewProtocol}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Nouveau Protocole
          </button>
        </div>
      </div>

      {showTemplates && (
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: 0 }}>Templates de Protocoles</h2>
              <button
                onClick={() => setShowTemplates(false)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {template.name}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {template.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>📁 {template.category}</span>
                    <span>⏱️ {template.estimatedTime}</span>
                    <span>📊 {template.difficulty}</span>
                    <span>📝 {template.steps.length} étapes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

        {/* Sidebar */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Catégories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedCategory('')}
                  style={{
                    padding: '0.5rem 0.8rem',
                    backgroundColor: !selectedCategory ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    color: !selectedCategory ? 'white' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                >
                  Tous
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.5rem 0.8rem',
                      backgroundColor: selectedCategory === cat ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                      color: selectedCategory === cat ? 'white' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'left'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredProtocols.map(protocol => (
              <div
                key={protocol.id}
                onClick={() => setCurrentProtocol(protocol)}
                style={{
                  padding: '1rem',
                  backgroundColor: currentProtocol?.id === protocol.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${currentProtocol?.id === protocol.id ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {protocol.validated && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem'
                  }}>
                    <Lock size={14} color="#10b981" />
                  </div>
                )}
                <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {protocol.name}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                  {protocol.steps.length} étapes • v{protocol.version}
                  {protocol.validated && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>• Validé</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {currentProtocol ? (
            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                {currentProtocol.validated && (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Lock size={20} color="#10b981" />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.95rem' }}>
                        Protocole Validé et Verrouillé
                      </div>
                      <div style={{ color: '#6ee7b7', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Validé par {currentProtocol.validatedBy} le {new Date(currentProtocol.validatedAt!).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <CheckCircle size={24} color="#10b981" />
                  </div>
                )}
                
                <input
                  type="text"
                  value={currentProtocol.name}
                  onChange={(e) => setCurrentProtocol({ ...currentProtocol, name: e.target.value })}
                  disabled={currentProtocol.validated}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: currentProtocol.validated ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    color: currentProtocol.validated ? '#94a3b8' : '#f8fafc',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    cursor: currentProtocol.validated ? 'not-allowed' : 'text'
                  }}
                  placeholder="Nom du protocole"
                />
                
                <textarea
                  value={currentProtocol.description}
                  onChange={(e) => setCurrentProtocol({ ...currentProtocol, description: e.target.value })}
                  disabled={currentProtocol.validated}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: currentProtocol.validated ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    color: currentProtocol.validated ? '#94a3b8' : '#cbd5e1',
                    fontSize: '0.95rem',
                    minHeight: '80px',
                    resize: 'vertical',
                    cursor: currentProtocol.validated ? 'not-allowed' : 'text'
                  }}
                  placeholder="Description du protocole..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={currentProtocol.category}
                      onChange={(e) => setCurrentProtocol({ ...currentProtocol, category: e.target.value })}
                      disabled={currentProtocol.validated}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: currentProtocol.validated ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '6px',
                        color: currentProtocol.validated ? '#94a3b8' : '#f8fafc',
                        fontSize: '0.9rem',
                        cursor: currentProtocol.validated ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Temps estimé
                    </label>
                    <input
                      type="text"
                      value={currentProtocol.estimatedTime || ''}
                      onChange={(e) => setCurrentProtocol({ ...currentProtocol, estimatedTime: e.target.value })}
                      disabled={currentProtocol.validated}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: currentProtocol.validated ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '6px',
                        color: currentProtocol.validated ? '#94a3b8' : '#f8fafc',
                        fontSize: '0.9rem',
                        cursor: currentProtocol.validated ? 'not-allowed' : 'text'
                      }}
                      placeholder="Ex: 2 heures"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Difficulté
                    </label>
                    <select
                      value={currentProtocol.difficulty || 'Moyen'}
                      onChange={(e) => setCurrentProtocol({ ...currentProtocol, difficulty: e.target.value as any })}
                      disabled={currentProtocol.validated}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: currentProtocol.validated ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '6px',
                        color: currentProtocol.validated ? '#94a3b8' : '#f8fafc',
                        fontSize: '0.9rem',
                        cursor: currentProtocol.validated ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="Facile">Facile</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Difficile">Difficile</option>
                    </select>
                  </div>
                </div>

                {!currentProtocol.validated && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <button
                      onClick={() => setViewMode('edit')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: viewMode === 'edit' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                        color: viewMode === 'edit' ? 'white' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Edit3 size={14} />
                      Éditer
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: viewMode === 'preview' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                        color: viewMode === 'preview' ? 'white' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Eye size={14} />
                      Aperçu
                    </button>
                  </div>
                )}
              </div>

              {/* Steps Section */}
              {!currentProtocol.validated && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                      Étapes du Protocole
                    </h3>
                    <button
                      onClick={addStep}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      <Plus size={16} />
                      Ajouter Étape
                    </button>
                  </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentProtocol.steps.map((step, index) => (
                    <div
                      key={step.id}
                      style={{
                        padding: '1.5rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: step.criticalPoint ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '8px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: step.criticalPoint ? '#ef4444' : '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '1.1rem'
                        }}>
                          {index + 1}
                        </div>
                        
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...currentProtocol.steps];
                            newSteps[index] = { ...step, title: e.target.value };
                            setCurrentProtocol({ ...currentProtocol, steps: newSteps });
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#f8fafc',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                          }}
                          placeholder="Titre de l'étape"
                        />

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '4px',
                              color: '#60a5fa',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              opacity: index === 0 ? 0.5 : 1
                            }}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === currentProtocol.steps.length - 1}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '4px',
                              color: '#60a5fa',
                              cursor: index === currentProtocol.steps.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: index === currentProtocol.steps.length - 1 ? 0.5 : 1
                            }}
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            onClick={() => deleteStep(step.id)}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '4px',
                              color: '#ef4444',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={step.description}
                        onChange={(e) => {
                          const newSteps = [...currentProtocol.steps];
                          newSteps[index] = { ...step, description: e.target.value };
                          setCurrentProtocol({ ...currentProtocol, steps: newSteps });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          color: '#cbd5e1',
                          fontSize: '0.95rem',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                        placeholder="Description détaillée de l'étape..."
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            <Clock size={14} />
                            Durée
                          </label>
                          <input
                            type="text"
                            value={step.duration || ''}
                            onChange={(e) => {
                              const newSteps = [...currentProtocol.steps];
                              newSteps[index] = { ...step, duration: e.target.value };
                              setCurrentProtocol({ ...currentProtocol, steps: newSteps });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'rgba(30, 41, 59, 0.5)',
                              border: '1px solid rgba(59, 130, 246, 0.1)',
                              borderRadius: '6px',
                              color: '#f8fafc',
                              fontSize: '0.9rem'
                            }}
                            placeholder="Ex: 30 min"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            <Thermometer size={14} />
                            Température
                          </label>
                          <input
                            type="text"
                            value={step.temperature || ''}
                            onChange={(e) => {
                              const newSteps = [...currentProtocol.steps];
                              newSteps[index] = { ...step, temperature: e.target.value };
                              setCurrentProtocol({ ...currentProtocol, steps: newSteps });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'rgba(30, 41, 59, 0.5)',
                              border: '1px solid rgba(59, 130, 246, 0.1)',
                              borderRadius: '6px',
                              color: '#f8fafc',
                              fontSize: '0.9rem'
                            }}
                            placeholder="Ex: 37°C"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {!currentProtocol.validated && (
                    <>
                      <button
                        onClick={duplicateProtocol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.25rem',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <Copy size={18} />
                        Dupliquer
                      </button>
                      <button
                        onClick={deleteProtocol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.25rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <Trash2 size={18} />
                        Supprimer
                      </button>
                    </>
                  )}
                  {currentProtocol.validated && (
                    <div style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#10b981',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Lock size={18} />
                      Protocole Validé
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={exportProtocol}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                  {!currentProtocol.validated && (
                    <>
                      <button
                        onClick={saveCurrentProtocol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <Save size={18} />
                        Sauvegarder
                      </button>
                      <button
                        onClick={validateProtocol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Lock size={18} />
                        Valider
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '500px',
              color: '#64748b'
            }}>
              <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem' }}>Sélectionnez un protocole ou créez-en un nouveau</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
