import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, Download, Search, Calendar, Tag, Lock, Image, FileText, Trash2, Edit3, Copy, Share2, Filter, List, Eye, Code, X } from 'lucide-react';
import { showToast } from '../../components/ToastNotification';
import { useAutoSave } from '../../hooks/useAutoSave';
import { RichTextEditor } from '../../components/RichTextEditor';
import { sanitizeHTML } from '../../utils/encryption';
import { TableOfContents } from '../../components/TableOfContents';
import '../../styles/rich-text-editor.css';
import type { ExecutedProtocol } from './protocols/types';
import { ProtocolSelectorModal } from './protocols/ProtocolSelectorModal';
import { ExecutedProtocolBlock } from './protocols/ExecutedProtocolBlock';
import { useProtocolStore } from './protocols/useProtocolStore';

interface NotebookEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  signed: boolean;
  signature?: string;
  attachments?: string[];
  author?: string;
  collaborators?: string[];
  version?: number;
  lastModified?: string;
  executedProtocols?: ExecutedProtocol[];
}

export const LabNotebook: React.FC = () => {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<NotebookEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterSigned, setFilterSigned] = useState<'all' | 'signed' | 'unsigned'>('all');
  const [showTOC, setShowTOC] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showProtocolSelector, setShowProtocolSelector] = useState(false);
  
  const { protocols } = useProtocolStore();
  const activeProtocols = protocols.filter(p => p.validated);

  useEffect(() => {
    const saved = localStorage.getItem('lab_notebook_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const saveEntries = (newEntries: NotebookEntry[]) => {
    localStorage.setItem('lab_notebook_entries', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  useAutoSave({
    data: entries,
    onSave: (data) => {
      localStorage.setItem('lab_notebook_entries', JSON.stringify(data));
    },
    interval: 30000
  });

  const createNewEntry = () => {
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const newEntry: NotebookEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: 'Nouvelle entrée',
      content: '',
      tags: [],
      signed: false,
      attachments: [],
      author: currentUser,
      collaborators: [],
      version: 1,
      lastModified: new Date().toISOString(),
      executedProtocols: []
    };
    setCurrentEntry(newEntry);
  };

  const saveCurrentEntry = () => {
    if (!currentEntry) return;

    const updatedEntry = {
      ...currentEntry,
      lastModified: new Date().toISOString(),
      version: (currentEntry.version || 1) + 1
    };

    const existingIndex = entries.findIndex(e => e.id === updatedEntry.id);
    let newEntries;

    if (existingIndex >= 0) {
      newEntries = [...entries];
      newEntries[existingIndex] = updatedEntry;
    } else {
      newEntries = [updatedEntry, ...entries];
    }

    saveEntries(newEntries);
    setCurrentEntry(updatedEntry);
    showToast('success', '✅ Entrée sauvegardée (v' + updatedEntry.version + ')');
  };

  const duplicateEntry = () => {
    if (!currentEntry) return;

    const duplicate: NotebookEntry = {
      ...currentEntry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: currentEntry.title + ' (Copie)',
      signed: false,
      signature: undefined,
      version: 1,
      lastModified: new Date().toISOString(),
      executedProtocols: currentEntry.executedProtocols ? JSON.parse(JSON.stringify(currentEntry.executedProtocols)) : []
    };

    const newEntries = [duplicate, ...entries];
    saveEntries(newEntries);
    setCurrentEntry(duplicate);
    showToast('success', '📋 Entrée dupliquée');
  };

  const deleteEntry = () => {
    if (!currentEntry) return;

    if (currentEntry.signed) {
      showToast('error', '❌ Impossible de supprimer une entrée signée');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      const newEntries = entries.filter(e => e.id !== currentEntry.id);
      saveEntries(newEntries);
      setCurrentEntry(null);
      showToast('success', '🗑️ Entrée supprimée');
    }
  };

  const addTag = () => {
    if (!currentEntry || !newTag.trim()) return;

    if (currentEntry.tags.includes(newTag.trim())) {
      showToast('warning', '⚠️ Ce tag existe déjà');
      return;
    }

    setCurrentEntry({
      ...currentEntry,
      tags: [...currentEntry.tags, newTag.trim()]
    });
    setNewTag('');
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    if (!currentEntry || currentEntry.signed) return;

    setCurrentEntry({
      ...currentEntry,
      tags: currentEntry.tags.filter(t => t !== tag)
    });
  };

  const handleInsertProtocol = (protocol: any) => {
    if (!currentEntry) return;
    const executedProtocol: ExecutedProtocol = {
      id: Date.now().toString(),
      baseProtocolId: protocol.id,
      baseProtocolName: protocol.name,
      baseProtocolVersion: protocol.version || 1,
      executedAt: new Date().toISOString(),
      executedBy: localStorage.getItem('currentUser') || 'Utilisateur',
      steps: protocol.steps.map((s: any) => ({ ...s, completed: false, deviationNote: '' })),
      materials: protocol.materials.map((m: string) => ({ name: m, used: false, deviationNote: '' }))
    };
    
    setCurrentEntry({
      ...currentEntry,
      executedProtocols: [...(currentEntry.executedProtocols || []), executedProtocol]
    });
    setShowProtocolSelector(false);
    showToast('success', "Protocole inséré dans l'expérience");
  };

  const handleUpdateExecutedProtocol = (updatedProtocol: ExecutedProtocol) => {
    if (!currentEntry) return;
    const updatedProtocols = (currentEntry.executedProtocols || []).map(p => 
      p.id === updatedProtocol.id ? updatedProtocol : p
    );
    setCurrentEntry({ ...currentEntry, executedProtocols: updatedProtocols });
  };

  const handleRemoveExecutedProtocol = (protocolId: string) => {
    if (!currentEntry) return;
    if (confirm("Retirer ce protocole de l'expérience ?")) {
      const updatedProtocols = (currentEntry.executedProtocols || []).filter(p => p.id !== protocolId);
      setCurrentEntry({ ...currentEntry, executedProtocols: updatedProtocols });
      showToast('success', 'Protocole retiré');
    }
  };

  const signEntry = () => {
    if (!currentEntry) return;

    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      showToast('error', '❌ Le titre et le contenu sont requis pour signer');
      return;
    }

    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';
    const signature = `${currentUser}_${new Date().toISOString()}_${Math.random().toString(36).substr(2, 9)}`;
    const signedEntry = { ...currentEntry, signed: true, signature };

    const newEntries = entries.map(e => e.id === signedEntry.id ? signedEntry : e);
    if (!entries.find(e => e.id === signedEntry.id)) {
      newEntries.unshift(signedEntry);
    }

    saveEntries(newEntries);
    setCurrentEntry(signedEntry);

    showToast('success', '🔒 Entrée signée et verrouillée par ' + currentUser);
  };

  const exportToPDF = () => {
    if (!currentEntry) {
      showToast('warning', '⚠️ Sélectionnez une entrée à exporter');
      return;
    }

    const content = `
CAHIER DE LABORATOIRE
=====================

Titre: ${currentEntry.title}
Date: ${new Date(currentEntry.date).toLocaleString('fr-FR')}
Auteur: ${currentEntry.author || 'Non spécifié'}
Version: ${currentEntry.version || 1}
${currentEntry.signed ? `\nSignature: ${currentEntry.signature}` : ''}
${currentEntry.tags.length > 0 ? `\nTags: ${currentEntry.tags.join(', ')}` : ''}

---

${currentEntry.content}

${currentEntry.signed ? '\n\n[DOCUMENT SIGNÉ - NE PAS MODIFIER]' : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-notebook-${currentEntry.title.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('success', '📄 Entrée exportée');
  };

  const exportAllEntries = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-notebook-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '💾 Toutes les entrées exportées');
  };

  const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

  let filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
    const matchesSigned = filterSigned === 'all' ||
      (filterSigned === 'signed' && entry.signed) ||
      (filterSigned === 'unsigned' && !entry.signed);
    return matchesSearch && matchesTag && matchesSigned;
  });

  // Tri
  filteredEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const stats = {
    total: entries.length,
    signed: entries.filter(e => e.signed).length,
    unsigned: entries.filter(e => !e.signed).length,
    thisWeek: entries.filter(e => {
      const entryDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={32} color="#3b82f6" />
          <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
            Cahier de Laboratoire
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={createNewEntry}
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
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={20} />
            Nouvelle Entrée
          </button>
          <button
            onClick={exportToPDF}
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
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
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

          {allTags.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedTag('')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    backgroundColor: !selectedTag ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                    color: !selectedTag ? 'white' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Tous
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: selectedTag === tag ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                      color: selectedTag === tag ? 'white' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => setCurrentEntry(entry)}
                style={{
                  padding: '1rem',
                  backgroundColor: currentEntry?.id === entry.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${currentEntry?.id === entry.id ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                    {entry.title}
                  </h4>
                  {entry.signed && <Lock size={16} color="#10b981" />}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                  {new Date(entry.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div>
          {currentEntry ? (
            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                  disabled={currentEntry.signed}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}
                  placeholder="Titre de l'entrée"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {/* Rich Text Editor */}
                {viewMode === 'edit' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <button
                        onClick={() => setShowTOC(!showTOC)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: showTOC ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                          color: showTOC ? 'white' : '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        <List size={16} />
                        Table des matières
                      </button>
                      <button
                        onClick={() => setShowProtocolSelector(true)}
                        disabled={currentEntry.signed}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: currentEntry.signed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)',
                          color: currentEntry.signed ? '#64748b' : '#10b981',
                          border: `1px solid ${currentEntry.signed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.3)'}`,
                          borderRadius: '6px',
                          cursor: currentEntry.signed ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        <FileText size={16} />
                        Insérer un Protocole
                      </button>
                    </div>

                    {showTOC && <TableOfContents content={currentEntry.content} />}

                    <RichTextEditor
                      value={currentEntry.content}
                      onChange={(value) => setCurrentEntry({ ...currentEntry, content: value })}
                      disabled={currentEntry.signed}
                      placeholder="Utilisez l'éditeur riche pour formater votre texte, ajouter des images, tableaux..."
                    />
                  </div>
                )}

                {/* Preview Mode */}
                {viewMode === 'preview' && (
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    minHeight: '400px'
                  }}>
                    {showTOC && <TableOfContents content={currentEntry.content} />}
                    <div
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentEntry.content) }}
                      style={{
                        color: '#f8fafc',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}
                      className="preview-content"
                    />
                  </div>
                )}

                {/* Executed Protocols */}
                {currentEntry.executedProtocols && currentEntry.executedProtocols.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} color="#3b82f6" />
                      Protocoles Exécutés ({currentEntry.executedProtocols.length})
                    </h3>
                    {currentEntry.executedProtocols.map(ep => (
                      <ExecutedProtocolBlock
                        key={ep.id}
                        protocol={ep}
                        readOnly={!!currentEntry.signed || viewMode === 'preview'}
                        onChange={handleUpdateExecutedProtocol}
                        onRemove={() => handleRemoveExecutedProtocol(ep.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Section */}
              {currentEntry.tags.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {currentEntry.tags.map((tag, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.4rem 0.8rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          color: '#60a5fa',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        <Tag size={14} />
                        {tag}
                        {!currentEntry.signed && (
                          <button
                            onClick={() => removeTag(tag)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Calendar size={18} color="#64748b" />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {new Date(currentEntry.date).toLocaleString('fr-FR')}
                  </span>

                  {/* Mode Toggle */}
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    marginLeft: '1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    padding: '0.25rem',
                    borderRadius: '6px'
                  }}>
                    <button
                      onClick={() => setViewMode('edit')}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: viewMode === 'edit' ? '#3b82f6' : 'transparent',
                        color: viewMode === 'edit' ? 'white' : '#94a3b8',
                        border: 'none',
                        borderRadius: '4px',
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
                        padding: '0.4rem 0.8rem',
                        backgroundColor: viewMode === 'preview' ? '#3b82f6' : 'transparent',
                        color: viewMode === 'preview' ? 'white' : '#94a3b8',
                        border: 'none',
                        borderRadius: '4px',
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
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {!currentEntry.signed && (
                    <>
                      <button
                        onClick={duplicateEntry}
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
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Copy size={18} />
                        Dupliquer
                      </button>
                      <button
                        onClick={deleteEntry}
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
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Trash2 size={18} />
                        Supprimer
                      </button>
                      <button
                        onClick={saveCurrentEntry}
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
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Save size={18} />
                        Sauvegarder
                      </button>
                      <button
                        onClick={signEntry}
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
                          fontSize: '0.9rem'
                        }}
                      >
                        <Lock size={18} />
                        Signer
                      </button>
                    </>
                  )}
                  {currentEntry.signed && (
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
                      Entrée Signée
                    </div>
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
              <BookOpen size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem' }}>Sélectionnez une entrée ou créez-en une nouvelle</p>
            </div>
          )}
        </div>
      </div>

      {showProtocolSelector && (
        <ProtocolSelectorModal
          protocols={activeProtocols}
          onSelect={handleInsertProtocol}
          onClose={() => setShowProtocolSelector(false)}
        />
      )}

      <style>{`
        .preview-content img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }
        
        .preview-content .image-container-left,
        .preview-content .image-container-center,
        .preview-content .image-container-right {
          display: block;
          margin: 20px 0;
          clear: both;
        }
        
        .preview-content .image-container-free {
          display: block;
          position: relative;
          margin: 20px 0;
          clear: both;
        }
        
        .preview-content .image-free {
          position: absolute;
        }
      `}</style>
    </div>
  );
};
