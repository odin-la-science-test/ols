import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { ChannelList } from './components/ChannelList';
import { MessageView } from './components/MessageView';
import { MessageInput } from './components/MessageInput';
import { UserList } from './components/UserList';
import './MessagingContainer.css';

// Import types directly from types file to avoid re-export issues
import type { Channel } from '../messaging-types-v4/types';
import type { DirectMessageConversation } from '../messaging-types-v4/types';
import type { Message } from '../messaging-types-v4/types';
import type { UserStatus } from '../messaging-types-v4/types';

// Context pour partager l'état global du messaging
interface MessagingContextType {
  currentUserId: string;
  authToken: string;
  selectedChannel: Channel | null;
  selectedDM: DirectMessageConversation | null;
  channels: Channel[];
  directMessages: DirectMessageConversation[];
  messages: Message[];
  onlineUsers: Map<string, UserStatus>;
  isConnected: boolean;
  isReconnecting: boolean;
  selectChannel: (channel: Channel) => void;
  selectDM: (dm: DirectMessageConversation) => void;
  sendMessage: (content: string) => void;
  deleteMessage: (messageId: string) => void;
  loadMoreMessages: () => void;
  startTyping: () => void;
  stopTyping: () => void;
  createChannel: (name: string, description: string, isPrivate: boolean) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingContainer');
  }
  return context;
};

interface MessagingContainerProps {
  currentUserId: string;
  authToken: string;
}

export const MessagingContainer: React.FC<MessagingContainerProps> = ({
  currentUserId,
  authToken,
}) => {
  // État local
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedDM, setSelectedDM] = useState<DirectMessageConversation | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessageConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserStatus>>(new Map());
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // WebSocket hook - on passe directement la fonction inline
  const { isConnected, isReconnecting, send } = useWebSocket({
    userId: currentUserId,
    token: authToken,
    onMessage: (message: any) => {
      try {
        switch (message.type) {
          case 'message:new':
            // Ajouter le message si c'est pour le canal/DM actuel
            if (selectedChannel && message.payload.channelId === selectedChannel.id) {
              setMessages(prev => [...prev, message.payload]);
            } else if (selectedDM && 
                       ((message.payload.senderId === selectedDM.participantId && message.payload.recipientId === currentUserId) ||
                        (message.payload.senderId === currentUserId && message.payload.recipientId === selectedDM.participantId))) {
              setMessages(prev => [...prev, message.payload]);
            }
            break;
          case 'message:deleted':
            setMessages(prev => prev.filter(m => m.id !== message.payload.messageId));
            break;
          case 'typing:indicator':
            console.log('Typing indicator:', message.payload);
            break;
          case 'presence:changed':
            setOnlineUsers(prev => {
              const updated = new Map(prev);
              updated.set(message.payload.userId, message.payload.status);
              return updated;
            });
            break;
          case 'channel:updated':
            setChannels(prev => prev.map(c => c.id === message.payload.id ? message.payload : c));
            if (selectedChannel?.id === message.payload.id) {
              setSelectedChannel(message.payload);
            }
            break;
          case 'channel:deleted':
            setChannels(prev => prev.filter(c => c.id !== message.payload.channelId));
            if (selectedChannel?.id === message.payload.channelId) {
              setSelectedChannel(null);
              setMessages([]);
            }
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Failed to handle WebSocket message:', error);
      }
    },
  });

  // Charger les canaux et DMs au montage
  useEffect(() => {
    loadChannels();
    loadDirectMessages();
  }, [currentUserId, authToken]);

  // Charger les messages quand un canal/DM est sélectionné
  useEffect(() => {
    if (selectedChannel) {
      loadChannelMessages(selectedChannel.id);
    } else if (selectedDM) {
      loadDMMessages(selectedDM.participantId);
    }
  }, [selectedChannel, selectedDM]);

  // Charger les canaux depuis l'API
  const loadChannels = async () => {
    try {
      const response = await fetch('/api/messaging/channels', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  // Charger les conversations directes depuis l'API
  const loadDirectMessages = async () => {
    try {
      const response = await fetch('/api/messaging/conversations', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDirectMessages(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load direct messages:', error);
    }
  };

  // Charger les messages d'un canal
  const loadChannelMessages = async (channelId: string, before?: string) => {
    setIsLoadingMessages(true);
    try {
      const url = before
        ? `/api/messaging/messages/channel/${channelId}?before=${before}&limit=50`
        : `/api/messaging/messages/channel/${channelId}?limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        if (before) {
          // Ajouter les messages plus anciens
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          // Remplacer tous les messages
          setMessages(newMessages);
        }
        
        setHasMoreMessages(newMessages.length === 50);
      }
    } catch (error) {
      console.error('Failed to load channel messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Charger les messages d'une conversation directe
  const loadDMMessages = async (participantId: string, before?: string) => {
    setIsLoadingMessages(true);
    try {
      const url = before
        ? `/api/messaging/messages/dm/${participantId}?before=${before}&limit=50`
        : `/api/messaging/messages/dm/${participantId}?limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        if (before) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        
        setHasMoreMessages(newMessages.length === 50);
      }
    } catch (error) {
      console.error('Failed to load DM messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Sélectionner un canal
  const selectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setSelectedDM(null);
    setMessages([]);
    setHasMoreMessages(true);
  }, []);

  // Sélectionner une conversation directe
  const selectDM = useCallback((dm: DirectMessageConversation) => {
    setSelectedDM(dm);
    setSelectedChannel(null);
    setMessages([]);
    setHasMoreMessages(true);
  }, []);

  // Envoyer un message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    if (selectedChannel) {
      send({
        type: 'message:send',
        payload: {
          channelId: selectedChannel.id,
          content: content.trim(),
        },
        timestamp: Date.now(),
      });
    } else if (selectedDM) {
      send({
        type: 'message:send',
        payload: {
          recipientId: selectedDM.participantId,
          content: content.trim(),
        },
        timestamp: Date.now(),
      });
    }
  }, [selectedChannel, selectedDM, send]);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        // Le message sera supprimé via l'événement WebSocket
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [authToken]);

  // Charger plus de messages (scroll infini)
  const loadMoreMessages = useCallback(() => {
    if (!hasMoreMessages || isLoadingMessages) return;
    
    const oldestMessage = messages[0];
    if (!oldestMessage) return;
    
    if (selectedChannel) {
      loadChannelMessages(selectedChannel.id, oldestMessage.id);
    } else if (selectedDM) {
      loadDMMessages(selectedDM.participantId, oldestMessage.id);
    }
  }, [selectedChannel, selectedDM, messages, hasMoreMessages, isLoadingMessages]);

  // Envoyer l'indicateur de typing
  const startTyping = useCallback(() => {
    if (selectedChannel) {
      send({
        type: 'typing:start',
        payload: {
          channelId: selectedChannel.id,
        },
        timestamp: Date.now(),
      });
    } else if (selectedDM) {
      send({
        type: 'typing:start',
        payload: {
          recipientId: selectedDM.participantId,
        },
        timestamp: Date.now(),
      });
    }
  }, [selectedChannel, selectedDM, send]);

  // Arrêter l'indicateur de typing
  const stopTyping = useCallback(() => {
    if (selectedChannel) {
      send({
        type: 'typing:stop',
        payload: {
          channelId: selectedChannel.id,
        },
        timestamp: Date.now(),
      });
    } else if (selectedDM) {
      send({
        type: 'typing:stop',
        payload: {
          recipientId: selectedDM.participantId,
        },
        timestamp: Date.now(),
      });
    }
  }, [selectedChannel, selectedDM, send]);

  // Créer un nouveau canal
  const createChannel = useCallback(async (name: string, description: string, isPrivate: boolean) => {
    try {
      const response = await fetch('/api/messaging/channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          isPrivate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du canal');
      }

      const data = await response.json();
      const newChannel = data.channel;

      // Ajouter le canal à la liste
      setChannels(prev => [...prev, newChannel]);

      // Sélectionner automatiquement le nouveau canal
      selectChannel(newChannel);
    } catch (error: any) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }, [authToken, selectChannel]);

  // Valeur du contexte
  const contextValue: MessagingContextType = {
    currentUserId,
    authToken,
    selectedChannel,
    selectedDM,
    channels,
    directMessages,
    messages,
    onlineUsers,
    isConnected,
    isReconnecting,
    selectChannel,
    selectDM,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    createChannel,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      <div className="messaging-container">
        <div className="messaging-layout">
          <div className="messaging-sidebar-left">
            <ChannelList />
          </div>
          <div className="messaging-main">
            <MessageView />
            <MessageInput />
          </div>
          <div className="messaging-sidebar-right">
            <UserList />
          </div>
        </div>
      </div>
    </MessagingContext.Provider>
  );
};
