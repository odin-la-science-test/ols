import React, { useState } from 'react';
import { useMessaging } from '../MessagingContainer';
import { CreateChannelModal } from './CreateChannelModal';
import type { Channel, DirectMessageConversation } from '../../messaging-types-v4/types';
import './ChannelList.css';

// Étendre les types pour inclure les propriétés UI
interface ChannelWithUI extends Channel {
  unreadCount?: number;
  isPublic?: boolean;
}

interface DMWithUI extends DirectMessageConversation {
  lastMessageAt?: number;
}

export const ChannelList: React.FC = () => {
  const {
    channels,
    directMessages,
    selectedChannel,
    selectedDM,
    selectChannel,
    selectDM,
    currentUserId,
    authToken,
    createChannel,
  } = useMessaging();

  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Trier les canaux alphabétiquement
  const sortedChannels = [...channels].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Trier les DMs par dernière activité (si disponible) ou alphabétiquement
  const sortedDMs = [...directMessages].sort((a, b) => {
    const aWithUI = a as DMWithUI;
    const bWithUI = b as DMWithUI;
    if (aWithUI.lastMessageAt && bWithUI.lastMessageAt) {
      return bWithUI.lastMessageAt - aWithUI.lastMessageAt;
    }
    return a.participantName.localeCompare(b.participantName);
  });

  return (
    <>
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateChannel={createChannel}
        currentUserId={currentUserId}
        authToken={authToken}
      />
      
      <div className="channel-list">
      {/* Section Canaux */}
      <div className="channel-section">
        <div 
          className="channel-section-header"
          onClick={() => setShowChannels(!showChannels)}
        >
          <span className={`channel-section-arrow ${showChannels ? 'open' : ''}`}>
            ▶
          </span>
          <span className="channel-section-title">CANAUX</span>
          <button 
            className="channel-add-button"
            title="Créer un canal"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateModalOpen(true);
            }}
          >
            +
          </button>
        </div>

        {showChannels && (
          <div className="channel-list-items">
            {sortedChannels.length === 0 ? (
              <div className="channel-list-empty">
                Aucun canal disponible
              </div>
            ) : (
              sortedChannels.map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => selectChannel(channel)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Section Messages Directs */}
      <div className="channel-section">
        <div 
          className="channel-section-header"
          onClick={() => setShowDMs(!showDMs)}
        >
          <span className={`channel-section-arrow ${showDMs ? 'open' : ''}`}>
            ▶
          </span>
          <span className="channel-section-title">MESSAGES DIRECTS</span>
        </div>

        {showDMs && (
          <div className="channel-list-items">
            {sortedDMs.length === 0 ? (
              <div className="channel-list-empty">
                Aucune conversation
              </div>
            ) : (
              sortedDMs.map(dm => (
                <DMItem
                  key={dm.participantId}
                  dm={dm}
                  isSelected={selectedDM?.participantId === dm.participantId}
                  onClick={() => selectDM(dm)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

// Composant pour un item de canal
interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, isSelected, onClick }) => {
  const channelWithUI = channel as ChannelWithUI;
  return (
    <div 
      className={`channel-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="channel-icon">#</span>
      <span className="channel-name">{channel.name}</span>
      {channelWithUI.unreadCount && channelWithUI.unreadCount > 0 && (
        <span className="channel-badge">{channelWithUI.unreadCount}</span>
      )}
      {channelWithUI.isPublic === false && (
        <span className="channel-private-icon" title="Canal privé">🔒</span>
      )}
    </div>
  );
};

// Composant pour un item de message direct
interface DMItemProps {
  dm: DirectMessageConversation;
  isSelected: boolean;
  onClick: () => void;
}

const DMItem: React.FC<DMItemProps> = ({ dm, isSelected, onClick }) => {
  return (
    <div 
      className={`channel-item dm-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className={`dm-status-indicator ${dm.participantStatus || 'offline'}`} />
      <span className="dm-name">{dm.participantName}</span>
      {dm.unreadCount && dm.unreadCount > 0 && (
        <span className="channel-badge">{dm.unreadCount}</span>
      )}
    </div>
  );
};
