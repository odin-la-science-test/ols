import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Award, Plus, Edit2, Trash2, Save, X, Users, BookOpen, Settings } from 'lucide-react';
import Navbar from '../../../components/Navbar';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Resource {
  id: string;
  code: string;
  title: string;
  note: number | null;
  coef: number;
}

interface UE {
  id: string;
  code: string;
  title: string;
  moyenne: number | null;
  rang: number | null;
  totalStudents: number;
  bonus: number;
  malus: number;
  ects: number;
  resources: Resource[];
}

interface Formation {
  id: string;
  name: string;
  students: Student[];
  ues: UE[];
}

const ContinuousAssessment = () => {
  const [expandedUE, setExpandedUE] = useState<string[]>([]);
  const [isManager, setIsManager] = useState(true); // Simuler le rôle de gestionnaire
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUEModal, setShowAddUEModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedUE, setSelectedUE] = useState<UE | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [editingNote, setEditingNote] = useState<{ resourceId: string; value: string } | null>(null);

  const [formation, setFormation] = useState<Formation>({
    id: '1',
    name: 'BUT Génie Biologique - Parcours Biologie Médicale et Biotechnologie',
    students: [
      { id: 'S001', name: 'Alice Martin', email: 'alice.martin@example.com' },
      { id: 'S002', name: 'Bob Dupont', email: 'bob.dupont@example.com' },
      { id: 'S003', name: 'Claire Dubois', email: 'claire.dubois@example.com' },
      { id: 'S004', name: 'David Leroy', email: 'david.leroy@example.com' }
    ],
    ues: [
      {
        id: '1',
        code: 'U.E.4.1',
        title: 'Réaliser des analyses avancées',
        moyenne: null,
        rang: 4,
        totalStudents: 0,
        bonus: 0,
        malus: 0,
        ects: 0,
        resources: [
          { id: 'R1', code: 'R.4.01', title: "Méthodes d'analyse en Biologie", note: null, coef: 1.5 },
          { id: 'R2', code: 'R.4.03', title: 'Communication', note: null, coef: 0.4 },
          { id: 'R3', code: 'R.4.04', title: 'Anglais', note: 11.00, coef: 0.4 },
          { id: 'R4', code: 'R.4.05', title: 'PPP', note: null, coef: 0.1 },
          { id: 'R5', code: 'S.AE.4.1', title: "Mise en oeuvre d'une expérimentation et suivi analytique", note: null, coef: 1.6 }
        ]
      },
      {
        id: '2',
        code: 'U.E.4.2',
        title: 'Expérimenter pour comprendre une problématique scientifique',
        moyenne: null,
        rang: 4,
        totalStudents: 0,
        bonus: 0,
        malus: 0,
        ects: 0,
        resources: [
          { id: 'R6', code: 'R.4.03', title: 'Communication', note: null, coef: 0.4 },
          { id: 'R7', code: 'R.4.04', title: 'Anglais', note: 11.00, coef: 0.4 },
          { id: 'R8', code: 'R.4.05', title: 'PPP', note: null, coef: 0.1 },
          { id: 'R9', code: 'R.4.02', title: 'Traitements des données expérimentales', note: null, coef: 1.5 },
          { id: 'R10', code: 'S.AE.4.1', title: "Mise en oeuvre d'une expérimentation et suivi analytique", note: null, coef: 1.6 }
        ]
      }
    ]
  });

  // Calculer les moyennes et ECTS
  useEffect(() => {
    const updatedUEs = formation.ues.map(ue => {
      const notesWithCoef = ue.resources.filter(r => r.note !== null);
      if (notesWithCoef.length > 0) {
        const totalCoef = notesWithCoef.reduce((sum, r) => sum + r.coef, 0);
        const moyenne = notesWithCoef.reduce((sum, r) => sum + (r.note! * r.coef), 0) / totalCoef;
        const ects = moyenne >= 10 ? 4 : 0;
        return { ...ue, moyenne, ects };
      }
      return ue;
    });
    setFormation(prev => ({ ...prev, ues: updatedUEs }));
  }, []);

  const toggleUE = (ueId: string) => {
    setExpandedUE(prev => 
      prev.includes(ueId) 
        ? prev.filter(id => id !== ueId)
        : [...prev, ueId]
    );
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return '–';
    return num.toFixed(2);
  };

  const updateNote = (ueId: string, resourceId: string, newNote: number | null) => {
    setFormation(prev => ({
      ...prev,
      ues: prev.ues.map(ue => {
        if (ue.id === ueId) {
          const updatedResources = ue.resources.map(r => 
            r.id === resourceId ? { ...r, note: newNote } : r
          );
          
          // Recalculer la moyenne
          const notesWithCoef = updatedResources.filter(r => r.note !== null);
          let moyenne = null;
          let ects = 0;
          if (notesWithCoef.length > 0) {
            const totalCoef = notesWithCoef.reduce((sum, r) => sum + r.coef, 0);
            moyenne = notesWithCoef.reduce((sum, r) => sum + (r.note! * r.coef), 0) / totalCoef;
            ects = moyenne >= 10 ? 4 : 0;
          }
          
          return { ...ue, resources: updatedResources, moyenne, ects };
        }
        return ue;
      })
    }));
  };

  const addUE = (newUE: Omit<UE, 'id'>) => {
    const id = `UE${formation.ues.length + 1}`;
    setFormation(prev => ({
      ...prev,
      ues: [...prev.ues, { ...newUE, id }]
    }));
  };

  const deleteUE = (ueId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette UE ?')) {
      setFormation(prev => ({
        ...prev,
        ues: prev.ues.filter(ue => ue.id !== ueId)
      }));
    }
  };

  const addResource = (ueId: string, newResource: Omit<Resource, 'id'>) => {
    setFormation(prev => ({
      ...prev,
      ues: prev.ues.map(ue => {
        if (ue.id === ueId) {
          const id = `R${Date.now()}`;
          return {
            ...ue,
            resources: [...ue.resources, { ...newResource, id }]
          };
        }
        return ue;
      })
    }));
  };

  const deleteResource = (ueId: string, resourceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      setFormation(prev => ({
        ...prev,
        ues: prev.ues.map(ue => {
          if (ue.id === ueId) {
            return {
              ...ue,
              resources: ue.resources.filter(r => r.id !== resourceId)
            };
          }
          return ue;
        })
      }));
    }
  };

  const totalECTS = formation.ues.reduce((sum, ue) => sum + ue.ects, 0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', maxWidth: '1400px' }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FileText size={40} />
                Synthèse des Évaluations
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {formation.name}
              </p>
            </div>
            
            {isManager && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowStudentsModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Users size={18} />
                  Étudiants ({formation.students.length})
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddUEModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={18} />
                  Nouvelle UE
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ECTS Counter */}
        <div className="card glass-panel" style={{ 
          padding: '1rem 1.5rem', 
          marginBottom: '1.5rem',
          background: '#1a1a1a',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#999' }}>ECTS : </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: totalECTS >= 30 ? '#10b981' : '#fff' }}>
                {totalECTS} / 30
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
              Les moyennes servent à situer l'étudiant dans la promotion et ne correspondent pas à des validations de compétences ou d'UE.
            </div>
          </div>
        </div>

        {/* UE List */}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {formation.ues.map(ue => {
            const isExpanded = expandedUE.includes(ue.id);
            
            return (
              <div key={ue.id} style={{ background: '#000', border: '1px solid #333', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* UE Header */}
                <div 
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5a8f 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div 
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => toggleUE(ue.id)}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                      {ue.code} - {ue.title}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.85rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>
                        Moyenne : {formatNumber(ue.moyenne)}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                        Rang : {ue.rang} / {ue.totalStudents}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontSize: '0.8rem' }}>
                        Bonus : {formatNumber(ue.bonus)} - Malus : {formatNumber(ue.malus)}
                      </div>
                      <div style={{ 
                        color: ue.ects > 0 ? '#10b981' : '#aaa', 
                        fontSize: '0.8rem',
                        fontWeight: ue.ects > 0 ? 700 : 400
                      }}>
                        ECTS : {ue.ects} / 4
                      </div>
                    </div>
                    
                    {isManager && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUE(ue);
                            setShowAddResourceModal(true);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#10b981',
                            border: 'none',
                            borderRadius: '0.25rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Ajouter une ressource"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteUE(ue.id);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '0.25rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Supprimer l'UE"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    
                    <div 
                      style={{ color: '#fff', cursor: 'pointer' }}
                      onClick={() => toggleUE(ue.id)}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Resources (Collapsible) */}
                {isExpanded && (
                  <div style={{ background: '#0a0a0a' }}>
                    {ue.resources.map((resource, idx) => (
                      <div 
                        key={resource.id}
                        style={{
                          padding: '0.75rem 2rem',
                          borderTop: '1px solid #222',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: idx % 2 === 0 ? '#0a0a0a' : '#000'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#fff', fontSize: '0.95rem' }}>
                            {resource.code} - {resource.title}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                          <div style={{ textAlign: 'right', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isManager && editingNote?.resourceId === resource.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.01"
                                  value={editingNote.value}
                                  onChange={(e) => setEditingNote({ resourceId: resource.id, value: e.target.value })}
                                  style={{
                                    width: '70px',
                                    padding: '0.25rem 0.5rem',
                                    background: '#1a1a1a',
                                    border: '1px solid #444',
                                    borderRadius: '0.25rem',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => {
                                    const note = editingNote.value === '' ? null : parseFloat(editingNote.value);
                                    updateNote(ue.id, resource.id, note);
                                    setEditingNote(null);
                                  }}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    background: '#10b981',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingNote(null)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span style={{ 
                                  color: resource.note !== null ? '#fff' : '#666',
                                  fontSize: '0.95rem',
                                  fontWeight: resource.note !== null ? 600 : 400
                                }}>
                                  {resource.note !== null ? resource.note.toFixed(2) : '–'}
                                </span>
                                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                  Coef. {resource.coef}
                                </span>
                                {isManager && (
                                  <button
                                    onClick={() => setEditingNote({ 
                                      resourceId: resource.id, 
                                      value: resource.note?.toString() || '' 
                                    })}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: '#6366f1',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      marginLeft: '0.5rem'
                                    }}
                                    title="Modifier la note"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {isManager && (
                                  <button
                                    onClick={() => deleteResource(ue.id, resource.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: '#ef4444',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      color: '#fff',
                                      cursor: 'pointer'
                                    }}
                                    title="Supprimer la ressource"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} />
            Informations
          </h3>
          <ul style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>Les moyennes sont calculées automatiquement selon les coefficients</li>
            <li>Le rang est mis à jour en temps réel</li>
            <li>Les ECTS sont attribués après validation (moyenne ≥ 10/20)</li>
            <li>Cliquez sur une UE pour voir le détail des ressources</li>
            {isManager && <li style={{ color: '#10b981', fontWeight: 600 }}>Mode gestionnaire : vous pouvez modifier les notes et la structure</li>}
          </ul>
        </div>
      </div>

      {/* Modal Ajout UE */}
      {showAddUEModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowAddUEModal(false)}
        >
          <div 
            className="card glass-panel"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              background: '#1a1a1a',
              border: '1px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Nouvelle Unité d'Enseignement</h2>
              <button 
                onClick={() => setShowAddUEModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addUE({
                code: formData.get('code') as string,
                title: formData.get('title') as string,
                moyenne: null,
                rang: 0,
                totalStudents: formation.students.length,
                bonus: 0,
                malus: 0,
                ects: 0,
                resources: []
              });
              setShowAddUEModal(false);
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Code de l'UE
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Ex: U.E.4.3"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Titre de l'UE
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ex: Explorer les dysfonctionnements cellulaires"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUEModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#333',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Créer l'UE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout Ressource */}
      {showAddResourceModal && selectedUE && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => {
            setShowAddResourceModal(false);
            setSelectedUE(null);
          }}
        >
          <div 
            className="card glass-panel"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              background: '#1a1a1a',
              border: '1px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Nouvelle Ressource</h2>
              <button 
                onClick={() => {
                  setShowAddResourceModal(false);
                  setSelectedUE(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#0a0a0a', borderRadius: '0.5rem' }}>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>UE sélectionnée :</div>
              <div style={{ color: '#fff', fontWeight: 600, marginTop: '0.25rem' }}>
                {selectedUE.code} - {selectedUE.title}
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addResource(selectedUE.id, {
                code: formData.get('code') as string,
                title: formData.get('title') as string,
                note: null,
                coef: parseFloat(formData.get('coef') as string)
              });
              setShowAddResourceModal(false);
              setSelectedUE(null);
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Code de la ressource
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Ex: R.4.06"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Titre de la ressource
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ex: Biochimie structurale"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Coefficient
                </label>
                <input
                  type="number"
                  name="coef"
                  placeholder="Ex: 1.5"
                  step="0.1"
                  min="0.1"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid #444',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddResourceModal(false);
                    setSelectedUE(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#333',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Ajouter la ressource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liste Étudiants */}
      {showStudentsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowStudentsModal(false)}
        >
          <div 
            className="card glass-panel"
            style={{
              maxWidth: '700px',
              width: '100%',
              padding: '2rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={24} />
                Étudiants inscrits ({formation.students.length})
              </h2>
              <button 
                onClick={() => setShowStudentsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {formation.students.map((student, idx) => (
                <div 
                  key={student.id}
                  style={{
                    padding: '1rem',
                    background: idx % 2 === 0 ? '#0a0a0a' : '#000',
                    borderRadius: '0.5rem',
                    border: '1px solid #333'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {student.name}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                        {student.email}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem',
                      background: '#6366f1',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#fff'
                    }}>
                      ID: {student.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: '#0a0a0a', 
              borderRadius: '0.5rem',
              border: '1px solid #333'
            }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <strong style={{ color: '#fff' }}>Note :</strong> Les notes saisies s'appliquent à tous les étudiants de la formation. 
                Pour une gestion individuelle, utilisez le module de suivi personnalisé.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousAssessment;
