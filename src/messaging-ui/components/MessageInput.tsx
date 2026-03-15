import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../MessagingContainer';
import './MessageInput.css';

const MAX_MESSAGE_LENGTH = 2000;
const TYPING_TIMEOUT = 3000; // 3 secondes

export const MessageInput: React.FC = () => {
  const {
    selectedChannel,
    selectedDM,
    sendMessage,
    startTyping,
    stopTyping,
  } = useMessaging();

  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Auto-focus sur le textarea quand un canal/DM est sélectionné
  useEffect(() => {
    if (selectedChannel || selectedDM) {
      textareaRef.current?.focus();
    }
  }, [selectedChannel, selectedDM]);

  // Nettoyer le timeout de typing au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        stopTyping();
      }
    };
  }, []);

  // Gérer le changement de contenu
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    // Limiter la longueur
    if (newContent.length <= MAX_MESSAGE_LENGTH) {
      setContent(newContent);
      
      // Ajuster la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
      
      // Gérer l'indicateur de typing
      handleTypingIndicator(newContent);
    }
  };

  // Gérer l'indicateur de typing
  const handleTypingIndicator = (newContent: string) => {
    if (newContent.trim().length > 0) {
      // Commencer à taper
      if (!isTypingRef.current) {
        startTyping();
        isTypingRef.current = true;
      }
      
      // Réinitialiser le timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
        isTypingRef.current = false;
      }, TYPING_TIMEOUT);
    } else {
      // Arrêter de taper si le contenu est vide
      if (isTypingRef.current) {
        stopTyping();
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Gérer l'envoi du message
  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent || isSending) return;
    if (!selectedChannel && !selectedDM) return;

    setIsSending(true);
    setSendStatus('sending');

    try {
      // Arrêter l'indicateur de typing
      if (isTypingRef.current) {
        stopTyping();
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Envoyer le message
      await sendMessage(trimmedContent);
      
      // Réinitialiser le formulaire
      setContent('');
      setSendStatus('sent');
      
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Réinitialiser le statut après 2 secondes
      setTimeout(() => {
        setSendStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendStatus('failed');
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => {
        setSendStatus('idle');
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  // Gérer la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Désactiver si aucun canal/DM sélectionné
  const isDisabled = !selectedChannel && !selectedDM;

  // Placeholder dynamique
  const placeholder = selectedChannel
    ? `Message #${selectedChannel.name}`
    : selectedDM
    ? `Message @${selectedDM.participantName}`
    : 'Sélectionnez un canal ou une conversation';

  return (
    <div className="message-input-container">
      <div className={`message-input-wrapper ${isDisabled ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="message-input-textarea"
          placeholder={placeholder}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isSending}
          rows={1}
        />
        
        <div className="message-input-footer">
          <div className="message-input-footer-left">
            <span className={`message-input-char-count ${content.length > MAX_MESSAGE_LENGTH * 0.9 ? 'warning' : ''}`}>
              {content.length} / {MAX_MESSAGE_LENGTH}
            </span>
            
            {sendStatus !== 'idle' && (
              <span className={`message-input-status ${sendStatus}`}>
                {sendStatus === 'sending' && '⏳ Envoi...'}
                {sendStatus === 'sent' && '✓ Envoyé'}
                {sendStatus === 'failed' && '✗ Échec'}
              </span>
            )}
          </div>
          
          <div className="message-input-footer-right">
            <button
              className="message-input-send-button"
              onClick={handleSend}
              disabled={isDisabled || isSending || !content.trim()}
              title="Envoyer (Entrée)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="message-input-hint">
        <span className="message-input-hint-text">
          <kbd>Entrée</kbd> pour envoyer • <kbd>Maj + Entrée</kbd> pour nouvelle ligne
        </span>
      </div>
    </div>
  );
};
