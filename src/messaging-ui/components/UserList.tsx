import React from 'react';
import { useMessaging } from '../MessagingContainer';
import type { UserStatus, DirectMessageConversation } from '../../messaging-types-v4/types';
import { UserStatusValues } from '../../messaging-types-v4/constants';
import './UserList.css';

// Étendre le type Channel pour inclure les propriétés UI
interface ChannelWithMembers {
  memberIds?: string[];
}

export const UserList: React.FC = () => {
  const {
    selectedChannel,
    onlineUsers,
    selectDM,
    currentUserId,
  } = useMessaging();

  // Si aucun canal sélectionné, ne rien afficher
  if (!selectedChannel) {
    return (
      <div className="user-list-empty">
        <p>Sélectionnez un canal pour voir les membres</p>
      </div>
    );
  }

  // Récupérer les membres du canal (simulé pour l'instant)
  // TODO: Implémenter la récupération réelle des membres depuis l'API
  const channelWithMembers = selectedChannel as ChannelWithMembers;
  const members = channelWithMembers.memberIds?.map((memberId: string) => ({
    id: memberId,
    name: `User ${memberId.substring(0, 8)}`,
    status: onlineUsers.get(memberId) || UserStatusValues.OFFLINE,
  })) || [];

  // Trier les membres par statut (online > away > offline) puis par nom
  const sortedMembers = [...members].sort((a, b) => {
    const statusOrder = {
      [UserStatusValues.ONLINE]: 0,
      [UserStatusValues.AWAY]: 1,
      [UserStatusValues.OFFLINE]: 2,
    };
    
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    return a.name.localeCompare(b.name);
  });

  // Compter les membres par statut
  const onlineCount = members.filter((m: any) => m.status === UserStatusValues.ONLINE).length;
  const awayCount = members.filter((m: any) => m.status === UserStatusValues.AWAY).length;
  const offlineCount = members.filter((m: any) => m.status === UserStatusValues.OFFLINE).length;

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3 className="user-list-title">Membres — {members.length}</h3>
        <div className="user-list-stats">
          {onlineCount > 0 && (
            <span className="user-list-stat online">
              <span className="user-list-stat-dot" />
              {onlineCount}
            </span>
          )}
          {awayCount > 0 && (
            <span className="user-list-stat away">
              <span className="user-list-stat-dot" />
              {awayCount}
            </span>
          )}
          {offlineCount > 0 && (
            <span className="user-list-stat offline">
              <span className="user-list-stat-dot" />
              {offlineCount}
            </span>
          )}
        </div>
      </div>

      <div className="user-list-content">
        {sortedMembers.length === 0 ? (
          <div className="user-list-no-members">
            <p>Aucun membre dans ce canal</p>
          </div>
        ) : (
          <>
            {/* Membres en ligne */}
            {onlineCount > 0 && (
              <div className="user-list-section">
                <div className="user-list-section-header">
                  En ligne — {onlineCount}
                </div>
                {sortedMembers
                  .filter((m: any) => m.status === UserStatusValues.ONLINE)
                  .map(member => (
                    <UserItem
                      key={member.id}
                      userId={member.id}
                      userName={member.name}
                      status={member.status}
                      isCurrentUser={member.id === currentUserId}
                      onStartDM={() => {
                        if (member.id !== currentUserId) {
                          const dmConversation: DirectMessageConversation = {
                            id: `dm-${currentUserId}-${member.id}`,
                            participantId: member.id,
                            participantName: member.name,
                            participantStatus: member.status,
                            unreadCount: 0,
                          };
                          selectDM(dmConversation);
                        }
                      }}
                    />
                  ))}
              </div>
            )}

            {/* Membres absents */}
            {awayCount > 0 && (
              <div className="user-list-section">
                <div className="user-list-section-header">
                  Absent — {awayCount}
                </div>
                {sortedMembers
                  .filter((m: any) => m.status === UserStatusValues.AWAY)
                  .map(member => (
                    <UserItem
                      key={member.id}
                      userId={member.id}
                      userName={member.name}
                      status={member.status}
                      isCurrentUser={member.id === currentUserId}
                      onStartDM={() => {
                        if (member.id !== currentUserId) {
                          const dmConversation: DirectMessageConversation = {
                            id: `dm-${currentUserId}-${member.id}`,
                            participantId: member.id,
                            participantName: member.name,
                            participantStatus: member.status,
                            unreadCount: 0,
                          };
                          selectDM(dmConversation);
                        }
                      }}
                    />
                  ))}
              </div>
            )}

            {/* Membres hors ligne */}
            {offlineCount > 0 && (
              <div className="user-list-section">
                <div className="user-list-section-header">
                  Hors ligne — {offlineCount}
                </div>
                {sortedMembers
                  .filter((m: any) => m.status === UserStatusValues.OFFLINE)
                  .map(member => (
                    <UserItem
                      key={member.id}
                      userId={member.id}
                      userName={member.name}
                      status={member.status}
                      isCurrentUser={member.id === currentUserId}
                      onStartDM={() => {
                        if (member.id !== currentUserId) {
                          const dmConversation: DirectMessageConversation = {
                            id: `dm-${currentUserId}-${member.id}`,
                            participantId: member.id,
                            participantName: member.name,
                            participantStatus: member.status,
                            unreadCount: 0,
                          };
                          selectDM(dmConversation);
                        }
                      }}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Composant pour un utilisateur individuel
interface UserItemProps {
  userId: string;
  userName: string;
  status: UserStatus;
  isCurrentUser: boolean;
  onStartDM: () => void;
}

const UserItem: React.FC<UserItemProps> = ({
  userName,
  status,
  isCurrentUser,
  onStartDM,
}) => {
  return (
    <div 
      className={`user-item ${isCurrentUser ? 'current-user' : ''}`}
      onClick={onStartDM}
      title={isCurrentUser ? 'Vous' : `Envoyer un message à ${userName}`}
    >
      <div className="user-item-avatar">
        <div className={`user-item-status ${status}`} />
        <span className="user-item-avatar-text">
          {userName.charAt(0).toUpperCase()}
        </span>
      </div>
      <span className="user-item-name">
        {userName}
        {isCurrentUser && <span className="user-item-you"> (vous)</span>}
      </span>
    </div>
  );
};
