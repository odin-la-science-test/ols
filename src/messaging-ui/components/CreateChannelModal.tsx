import React, { useState } from 'react';
import type { Channel } from '../../messaging-types-v4/types';
import './CreateChannelModal.css';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  currentUserId: string;
  authToken: string;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
  currentUserId,
  authToken,
}) => {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      setError('Le nom du canal est requis');
      return;
    }

    if (channelName.length < 3) {
      setError('Le nom doit contenir au moins 3 caractères');
      return;
    }

    if (channelName.length > 50) {
      setError('Le nom ne peut pas dépasser 50 caractères');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await onCreateChannel(channelName.trim(), description.trim(), isPrivate);
      
      // Réinitialiser le formulaire
      setChannelName('');
      setDescription('');
      setIsPrivate(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du canal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setChannelName('');
      setDescription('');
      setIsPrivate(false);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un canal</h2>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            disabled={isCreating}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="channelName">
              Nom du canal <span className="required">*</span>
            </label>
            <input
              id="channelName"
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="ex: général, annonces, équipe..."
              maxLength={50}
              disabled={isCreating}
              autoFocus
            />
            <span className="form-hint">
              {channelName.length}/50 caractères
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optionnel)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'objectif de ce canal..."
              rows={3}
              maxLength={200}
              disabled={isCreating}
            />
            <span className="form-hint">
              {description.length}/200 caractères
            </span>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={isCreating}
              />
              <span>Canal privé</span>
            </label>
            <span className="form-hint">
              {isPrivate 
                ? '🔒 Seuls les membres invités pourront voir ce canal'
                : '🌐 Tous les utilisateurs pourront voir et rejoindre ce canal'
              }
            </span>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isCreating || !channelName.trim()}
            >
              {isCreating ? 'Création...' : 'Créer le canal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
