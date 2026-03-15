import React, { useRef, useEffect, useState } from 'react';
import { useMessaging } from '../MessagingContainer';
import type { Message } from '../../messaging-types-v4/types';
import { formatMessage } from '../utils/messageFormatter';
import { formatSmartTime } from '../utils/timeUtils';
import './MessageView.css';

// Étendre le type Message pour inclure les propriétés UI
interface MessageWithSender extends Message {
  senderName?: string;
}

export const MessageView: React.FC = () => {
  const {
    messages,
    selectedChannel,
    selectedDM,
    currentUserId,
    deleteMessage,
    loadMoreMessages,
  } = useMessaging();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [messages]);

  // Détecter si l'utilisateur est proche du bas
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    setIsNearBottom(distanceFromBottom < 100);
    setShowScrollButton(distanceFromBottom > 200);

    // Charger plus de messages si on scroll vers le haut
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  // Afficher un message vide si aucun canal/DM sélectionné
  if (!selectedChannel && !selectedDM) {
    return (
      <div className="message-view-empty">
        <div className="message-view-empty-content">
          <div className="message-view-empty-icon">💬</div>
          <h2>Bienvenue dans la messagerie</h2>
          <p>Sélectionnez un canal ou démarrez une conversation directe pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-view">
      {/* En-tête */}
      <div className="message-view-header">
        <div className="message-view-header-left">
          {selectedChannel && (
            <>
              <span className="message-view-header-icon">#</span>
              <h3 className="message-view-header-title">{selectedChannel.name}</h3>
              {selectedChannel.description && (
                <span className="message-view-header-description">
                  {selectedChannel.description}
                </span>
              )}
            </>
          )}
          {selectedDM && (
            <>
              <div className={`dm-status-indicator ${selectedDM.participantStatus || 'offline'}`} />
              <h3 className="message-view-header-title">{selectedDM.participantName}</h3>
            </>
          )}
        </div>
        <div className="message-view-header-right">
          {/* TODO: Ajouter les boutons d'action (recherche, paramètres, etc.) */}
        </div>
      </div>

      {/* Liste des messages */}
      <div 
        className="message-view-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="message-view-no-messages">
            <p>Aucun message pour le moment</p>
            <p className="message-view-no-messages-hint">
              Soyez le premier à envoyer un message !
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showSender = !prevMessage || 
                                prevMessage.senderId !== message.senderId ||
                                (new Date(message.createdAt).getTime() - 
                                 new Date(prevMessage.createdAt).getTime()) > 300000; // 5 minutes

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  showSender={showSender}
                  isOwnMessage={message.senderId === currentUserId}
                  onDelete={() => deleteMessage(message.id)}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Bouton pour scroller vers le bas */}
      {showScrollButton && (
        <button 
          className="message-view-scroll-button"
          onClick={scrollToBottom}
          title="Aller au bas"
        >
          ↓
        </button>
      )}
    </div>
  );
};

// Composant pour un message individuel
interface MessageItemProps {
  message: Message;
  showSender: boolean;
  isOwnMessage: boolean;
  onDelete: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  showSender, 
  isOwnMessage,
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);
  const formattedContent = formatMessage(message.content);
  const formattedTime = formatSmartTime(message.createdAt);
  
  // Utiliser l'ID de l'expéditeur comme nom par défaut (sera remplacé par l'API plus tard)
  const senderName = (message as MessageWithSender).senderName || `User ${message.senderId.substring(0, 8)}`;

  return (
    <div 
      className={`message-item ${showSender ? 'show-sender' : 'compact'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showSender && (
        <div className="message-item-header">
          <span className="message-item-sender">{senderName}</span>
          <span className="message-item-timestamp">{formattedTime}</span>
        </div>
      )}
      
      <div className="message-item-content">
        <div 
          className="message-item-text"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        
        {showActions && (
          <div className="message-item-actions">
            {!showSender && (
              <span className="message-item-hover-timestamp">{formattedTime}</span>
            )}
            {isOwnMessage && (
              <button
                className="message-item-action-button delete"
                onClick={onDelete}
                title="Supprimer le message"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
