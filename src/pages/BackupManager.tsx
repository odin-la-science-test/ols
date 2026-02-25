import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw, Clock, Settings, Search, FileText, BarChart3, Edit3, Check, X, Eye, GitCompare } from 'lucide-react';
import { BackupSystem } from '../utils/backupSystem';
import type { BackupData } from '../utils/backupSystem';
import { showToast } from '../components/ToastNotification';

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<BackupData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [config, setConfig] = useState(BackupSystem.getConfig());

  useEffect(() => {
    loadBackups();
  }, []);

  useEffect(() => {
    filterBackups();
  }, [searchTerm, backups]);

  const loadBackups = () => {
    const allBackups = BackupSystem.getAllBackups();
    setBackups(allBackups);
    setFilteredBackups(allBackups);
  };

  const filterBackups = () => {
    if (!searchTerm) {
      setFilteredBackups(backups);
      return;
    }

    const filtered = backups.filter(backup => {
      const date = new Date(backup.timestamp).toLocaleDateString('fr-FR');
      const note = backup.note || '';
      return date.includes(searchTerm) || note.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredBackups(filtered);
  };

  const handleCreateBackup = (note?: string) => {
    try {
      BackupSystem.createBackup(note);
      loadBackups();
      setShowCreateModal(false);
      showToast('success', '✅ Backup créé avec succès');
    } catch (error) {
      showToast('error', '❌ Erreur lors de la création du backup');
    }
  };

  const handleRestore = (timestamp: string) => {
    if (confirm('Êtes-vous sûr de vouloir restaurer ce backup ? Les données actuelles seront remplacées.')) {
      BackupSystem.restoreBackup(timestamp);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExport = (timestamp: string) => {
    BackupSystem.exportBackup(timestamp);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await BackupSystem.importBackup(file);
        loadBackups();
      }
    };
    input.click();
  };

  const handleDelete = (timestamp: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce backup ?')) {
      BackupSystem.deleteBackup(timestamp);
      loadBackups();
    }
  };

  const handleUpdateNote = (timestamp: string) => {
    BackupSystem.updateBackupNote(timestamp, noteText);
    setEditingNote(null);
    setNoteText('');
    loadBackups();
  };

  const handleUpdateConfig = () => {
    BackupSystem.updateConfig(config);
    setShowConfig(false);
  };

  const stats = BackupSystem.getBackupStats();

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Database size={32} color="#3b82f6" />
          <div>
            <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              Gestion des Sauvegardes
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              {stats.totalBackups} backup(s) • {stats.totalSize}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowStats(!showStats)}
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
            <BarChart3 size={20} />
            Statistiques
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(100, 116, 139, 0.1)',
              color: '#94a3b8',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Settings size={20} />
            Configuration
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
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
            <RefreshCw size={20} />
            Créer Backup
          </button>
          <button
            onClick={handleImport}
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
            <Upload size={20} />
            Importer
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Statistiques
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Backups</div>
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalBackups}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Taille Totale</div>
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalSize}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Taille Moyenne</div>
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700' }}>{stats.averageSize}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Plus Ancien</div>
              <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '700' }}>{stats.oldestBackup}</div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} />
            Configuration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={config.autoBackup}
                onChange={(e) => setConfig({ ...config, autoBackup: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              Backup automatique activé
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={config.backupOnClose}
                onChange={(e) => setConfig({ ...config, backupOnClose: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              Backup avant fermeture
            </label>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                Nombre maximum de backups
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={config.maxBackups}
                onChange={(e) => setConfig({ ...config, maxBackups: parseInt(e.target.value) })}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  width: '100px'
                }}
              />
            </div>
            <button
              onClick={handleUpdateConfig}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                width: 'fit-content'
              }}
            >
              Sauvegarder Configuration
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher par date ou note..."
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

      {/* Backups List */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        {filteredBackups.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Database size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>{searchTerm ? 'Aucun backup trouvé' : 'Aucun backup disponible'}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {searchTerm ? 'Essayez une autre recherche' : 'Créez votre premier backup pour sécuriser vos données'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredBackups.map((backup, index) => (
              <div
                key={backup.timestamp}
                style={{
                  padding: '1.5rem',
                  backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                  border: `1px solid ${index === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'}`,
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <Clock size={20} color="#64748b" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1.05rem' }}>
                          {new Date(backup.timestamp).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                          {new Date(backup.timestamp).toLocaleTimeString('fr-FR')}
                        </div>
                        {index === 0 && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            RÉCENT
                          </span>
                        )}
                      </div>
                      {editingNote === backup.timestamp ? (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Ajouter une note..."
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: 'rgba(30, 41, 59, 0.5)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '6px',
                              color: '#f8fafc',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            onClick={() => handleUpdateNote(backup.timestamp)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setNoteText('');
                            }}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {backup.note ? (
                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', fontStyle: 'italic' }}>
                              📝 {backup.note}
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                              Aucune note
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEditingNote(backup.timestamp);
                              setNoteText(backup.note || '');
                            }}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: 'transparent',
                              color: '#64748b',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Modifier la note"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {backup.itemCount} élément(s)
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {BackupSystem.formatSize(backup.size || 0)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(backup.timestamp)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                      title="Restaurer ce backup"
                    >
                      Restaurer
                    </button>
                    <button
                      onClick={() => handleExport(backup.timestamp)}
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
                      title="Exporter ce backup"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(backup.timestamp)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Supprimer ce backup"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px'
      }}>
        <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1rem' }}>
          ℹ️ Informations
        </h3>
        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.8', margin: 0, paddingLeft: '1.5rem' }}>
          <li>Les backups sont créés automatiquement selon votre configuration</li>
          <li>Vous pouvez ajouter des notes à vos backups pour les identifier facilement</li>
          <li>Les backups incluent: cahier de labo, inventaire chimique, protocoles, expériences, préférences</li>
          <li>Exportez vos backups pour les archiver ou les partager</li>
          <li>La restauration remplace toutes les données actuelles</li>
        </ul>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
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
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Créer un Backup
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                Note (optionnelle)
              </label>
              <input
                type="text"
                placeholder="Ex: Avant mise à jour majeure"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNoteText('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: '#94a3b8',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleCreateBackup(noteText || undefined)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Créer Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
