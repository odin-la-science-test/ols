# Plan d'Implémentation: Système de Messagerie Interne

## Vue d'ensemble

Ce plan détaille l'implémentation complète d'un système de messagerie interne de type Discord avec communication temps réel via WebSocket, gestion des rôles et permissions, et architecture modulaire isolée. Le système utilise TypeScript/React pour le frontend et Node.js pour le backend, avec une base de données SQLite dédiée (databases/messaging.sqlite).

### Architecture

- **Frontend**: React + TypeScript avec WebSocket client
- **Backend**: Node.js + WebSocket server (ws library)
- **Base de données**: SQLite (better-sqlite3)
- **Communication temps réel**: WebSocket bidirectionnel
- **Isolation**: Module complètement séparé du code existant

### Approche d'implémentation

L'implémentation suit une approche incrémentale en 8 phases principales:
1. Infrastructure de base (base de données, types, configuration)
2. Services backend (gestion des messages, canaux, permissions)
3. Communication temps réel (WebSocket server et client)
4. Interface utilisateur (composants React)
5. Fonctionnalités avancées (recherche, notifications)
6. Sécurité et validation
7. Tests de propriétés (property-based testing)
8. Intégration finale

## Tâches


- [ ] 1. Configurer l'infrastructure de base
  - [x] 1.1 Créer la structure de dossiers du module messaging
    - Créer `src/messaging-core/`, `src/messaging-ui/`, `src/messaging-api/`, `src/messaging-db/`, `src/messaging-types/`
    - Créer le fichier de configuration du module
    - _Requirements: 13.1, 13.2_

  - [x] 1.2 Définir les types TypeScript
    - Créer `src/messaging-types/index.ts` avec tous les types (User, Channel, Message, Role, etc.)
    - Définir les enums (Role, UserStatus, NotificationPreference)
    - Définir les interfaces pour les services et API
    - _Requirements: 13.1_

  - [x] 1.3 Créer le schéma de base de données SQLite
    - Créer `src/messaging-db/schema.ts` avec les définitions de tables SQL
    - Implémenter les tables: messaging_users, messaging_channels, messaging_channel_members, messaging_messages, messaging_notifications
    - Créer les index pour optimiser les requêtes
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

  - [x] 1.4 Initialiser la base de données
    - Créer `src/messaging-db/database.ts` pour la connexion SQLite
    - Implémenter la fonction d'initialisation qui crée les tables
    - Créer le fichier `databases/messaging.sqlite` au démarrage
    - _Requirements: 12.1, 13.2_

  - [ ]* 1.5 Écrire les tests de propriétés pour la persistance
    - **Property 51: Role Persistence Round-Trip**
    - **Property 52: Channel Configuration Persistence**
    - **Property 53: Referential Integrity Enforcement**
    - **Valide: Requirements 12.2, 12.3, 12.5**

- [-] 2. Implémenter les services backend de base
  - [x] 2.1 Créer le Permission Service
    - Créer `src/messaging-core/PermissionService.ts`
    - Implémenter `checkPermission()`, `assignRole()`, `getUserRole()`
    - Implémenter la logique des permissions par rôle (Admin, Moderator, Member)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 5.1, 5.2_

  - [ ]* 2.2 Écrire les tests de propriétés pour les permissions
    - **Property 20: Admin-Only Role Assignment**
    - **Property 21: Role Enumeration Constraint**
    - **Property 22: Default Member Role**
    - **Property 23: Self-Role Modification Prevention**
    - **Property 24: Immediate Permission Update**
    - **Property 25: Last Admin Protection**
    - **Property 26: Admin Universal Permissions**
    - **Property 27: Moderator Specific Permissions**
    - **Property 28: Member Basic Permissions**
    - **Valide: Requirements 5.1-5.7, 6.2-6.4**

  - [x] 2.3 Créer le Channel Service
    - Créer `src/messaging-core/ChannelService.ts`
    - Implémenter `createChannel()`, `updateChannel()`, `deleteChannel()`
    - Implémenter `getChannels()`, `addMember()`, `removeMember()`, `getMembers()`
    - Intégrer les vérifications de permissions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 2.4 Écrire les tests de propriétés pour les canaux
    - **Property 9: Role-Based Channel Creation**
    - **Property 10: Channel Name Validation**
    - **Property 11: Channel Description Validation**
    - **Property 12: Admin-Only Channel Deletion**
    - **Property 13: Channel Deletion Archives Messages**
    - **Property 14: Channel Alphabetical Sorting**
    - **Property 31: Public Channel Open Access**
    - **Property 32: Private Channel Invitation Requirement**
    - **Valide: Requirements 3.1-3.7, 7.2, 7.3**

  - [x] 2.5 Créer le Message Service
    - Créer `src/messaging-core/MessageService.ts`
    - Implémenter `sendDirectMessage()`, `sendChannelMessage()`
    - Implémenter `getDirectMessages()`, `getChannelMessages()` avec pagination
    - Implémenter `deleteMessage()` avec vérification de permissions
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 2.6 Écrire les tests de propriétés pour les messages
    - **Property 4: Direct Message Initiation**
    - **Property 5: Message Chronological Ordering**
    - **Property 6: Message Persistence Round-Trip**
    - **Property 7: Message Deletion Visibility**
    - **Property 15: Channel Member Messaging Permission**
    - **Property 16: Message Includes Sender and Timestamp**
    - **Property 17: Initial Message Load Limit**
    - **Property 18: Pagination Batch Size**
    - **Valide: Requirements 2.1, 2.3, 2.5, 2.6, 4.1, 4.3, 4.4, 4.5, 4.6**

- [ ] 3. Checkpoint - Vérifier les services backend
  - Vérifier que tous les services de base fonctionnent correctement
  - Tester manuellement les opérations CRUD sur les canaux et messages
  - S'assurer que les permissions sont correctement appliquées
  - Demander à l'utilisateur si des questions se posent


- [ ] 4. Implémenter la communication temps réel WebSocket
  - [x] 4.1 Créer le WebSocket Server
    - Créer `src/messaging-api/WebSocketServer.ts`
    - Configurer le serveur WebSocket (ws library) sur un port dédié
    - Implémenter la gestion des connexions (connect, disconnect)
    - Implémenter l'authentification des connexions WebSocket
    - _Requirements: 8.1, 1.1, 1.2, 15.1_

  - [x] 4.2 Implémenter le WebSocket Manager
    - Créer `src/messaging-core/WebSocketManager.ts`
    - Implémenter `connect()`, `disconnect()`, `send()`, `broadcast()`
    - Gérer la liste des utilisateurs en ligne avec `getOnlineUsers()`
    - Implémenter la mise à jour du statut utilisateur (online, away, offline)
    - _Requirements: 1.4, 1.5, 8.1, 8.2_

  - [ ]* 4.3 Écrire les tests de propriétés pour les sessions
    - **Property 1: Session Creation on Authentication**
    - **Property 2: Session Persistence Until Termination**
    - **Property 3: Disconnection Updates Status**
    - **Valide: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [ ] 4.3 Implémenter les événements WebSocket
    - Implémenter les événements client->serveur: `message:send`, `typing:start`, `typing:stop`, `presence:update`
    - Implémenter les événements serveur->client: `message:new`, `message:deleted`, `typing:indicator`, `presence:changed`
    - Intégrer avec MessageService pour la persistance
    - _Requirements: 8.2, 8.3, 4.2_

  - [x] 4.4 Implémenter la reconnexion automatique
    - Créer `src/messaging-ui/hooks/useWebSocket.ts`
    - Implémenter la reconnexion avec backoff exponentiel (1s, 2s, 4s, 8s, 16s, 30s max)
    - Implémenter la synchronisation des messages manqués après reconnexion
    - Afficher une notification après 30 secondes d'échec de reconnexion
    - _Requirements: 8.5, 8.6, 8.7_

  - [ ]* 4.5 Écrire les tests de propriétés pour la communication temps réel
    - **Property 36: Typing Indicator Broadcast**
    - **Property 37: Reconnection Triggers Sync**
    - **Valide: Requirements 8.3, 8.7**

- [-] 5. Créer les composants UI de base
  - [x] 5.1 Créer le composant MessagingContainer
    - Créer `src/messaging-ui/MessagingContainer.tsx`
    - Implémenter la structure principale (sidebar gauche, zone centrale, sidebar droite)
    - Gérer l'état global du messaging avec React Context
    - Initialiser la connexion WebSocket au montage
    - _Requirements: 14.1, 14.2, 14.3, 13.5_

  - [x] 5.2 Créer le composant ChannelList
    - Créer `src/messaging-ui/components/ChannelList.tsx`
    - Afficher la liste des canaux triés alphabétiquement
    - Afficher les conversations directes
    - Afficher les badges de notifications non lues
    - Gérer la sélection de canal/conversation
    - _Requirements: 14.1, 14.6, 3.7, 10.6_

  - [x] 5.3 Créer le composant MessageView
    - Créer `src/messaging-ui/components/MessageView.tsx`
    - Afficher les messages en ordre chronologique
    - Implémenter le scroll infini pour charger les messages plus anciens
    - Afficher le nom de l'expéditeur et le timestamp pour chaque message
    - Gérer la suppression de messages (avec permissions)
    - _Requirements: 14.2, 4.3, 4.4, 4.6, 2.6_

  - [ ] 5.4 Créer le composant MessageInput
    - Créer `src/messaging-ui/components/MessageInput.tsx`
    - Implémenter le champ de saisie avec limite de 2000 caractères
    - Envoyer les événements de typing indicator
    - Envoyer les messages via WebSocket
    - Afficher les indicateurs de statut (envoi, envoyé, échec)
    - _Requirements: 14.4, 11.1, 8.3_

  - [x] 5.5 Créer le composant UserList
    - Créer `src/messaging-ui/components/UserList.tsx`
    - Afficher les membres du canal actif
    - Afficher les indicateurs de statut en ligne (vert=online, jaune=away, gris=offline)
    - Permettre de cliquer sur un utilisateur pour démarrer une conversation directe
    - _Requirements: 14.3, 14.7_

  - [ ]* 5.6 Écrire les tests de propriétés pour l'interface utilisateur
    - **Property 55: Channel Selection Loads Messages**
    - **Property 56: User Status Display**
    - **Valide: Requirements 14.5, 14.7**

- [ ] 6. Checkpoint - Vérifier l'interface de base
  - Tester l'affichage des canaux et messages
  - Vérifier que la connexion WebSocket fonctionne
  - Tester l'envoi et la réception de messages en temps réel
  - Demander à l'utilisateur si des questions se posent


- [ ] 7. Implémenter les fonctionnalités avancées
  - [x] 7.1 Implémenter le formatage Markdown
    - Créer `src/messaging-ui/utils/messageFormatter.ts`
    - Supporter le formatage: gras, italique, blocs de code
    - Convertir automatiquement les URLs en liens cliquables
    - Supporter les emojis
    - _Requirements: 11.2, 11.3, 11.4, 11.7_

  - [ ]* 7.2 Écrire les tests de propriétés pour le formatage
    - **Property 47: Markdown Format Preservation**
    - **Property 48: URL Detection**
    - **Property 49: Emoji Support**
    - **Valide: Requirements 11.2, 11.3, 11.4, 11.7**

  - [x] 7.3 Implémenter le système de notifications
    - Créer `src/messaging-core/NotificationService.ts`
    - Implémenter `notifyDirectMessage()`, `notifyMention()`
    - Implémenter `getUnreadCount()`, `markAsRead()`
    - Implémenter `updatePreferences()` pour configurer les préférences par canal
    - Gérer les mentions @username dans les messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.7, 4.7_

  - [ ]* 7.4 Écrire les tests de propriétés pour les notifications
    - **Property 19: Mention Notification Creation**
    - **Property 41: Notification Preference Storage**
    - **Property 42: Notification Preference Enumeration**
    - **Property 43: Muted Channel Suppresses Notifications**
    - **Property 44: Unread Count Accuracy**
    - **Property 45: Viewing Clears Unread**
    - **Valide: Requirements 4.7, 10.1-10.7**

  - [ ] 7.5 Implémenter la recherche de messages
    - Créer `src/messaging-core/SearchService.ts`
    - Implémenter `searchMessages()` avec filtres (contenu, expéditeur, plage de dates)
    - Limiter les résultats aux canaux/DMs accessibles par l'utilisateur
    - Retourner les résultats avec contexte et timestamps
    - Créer le composant UI `src/messaging-ui/components/SearchBar.tsx`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 7.6 Écrire les tests de propriétés pour la recherche
    - **Property 38: Search Returns Accessible Results**
    - **Property 39: Search Filter Support**
    - **Property 40: Search Results Include Context**
    - **Valide: Requirements 9.1, 9.3, 9.4, 9.5**

  - [ ] 7.7 Implémenter la gestion des membres de canal
    - Étendre ChannelService avec les vérifications de permissions
    - Implémenter l'invitation de membres (Moderator/Admin uniquement)
    - Implémenter le retrait de membres (Moderator/Admin uniquement)
    - Permettre aux utilisateurs de quitter volontairement un canal
    - Préserver l'historique des messages après le départ
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 7.8 Écrire les tests de propriétés pour la gestion des membres
    - **Property 33: Member Removal Revokes Access**
    - **Property 34: Voluntary Channel Departure**
    - **Property 35: Message Preservation After Departure**
    - **Valide: Requirements 7.5, 7.6, 7.7**

- [ ] 8. Implémenter la sécurité et la validation
  - [x] 8.1 Implémenter la sanitization des entrées
    - Créer `src/messaging-core/SecurityService.ts`
    - Implémenter la sanitization XSS pour le contenu des messages
    - Implémenter la protection contre les injections SQL (requêtes paramétrées)
    - Valider tous les inputs utilisateur (longueurs, formats, caractères autorisés)
    - _Requirements: 11.6, 15.5, 15.6_

  - [ ]* 8.2 Écrire les tests de propriétés pour la sécurité
    - **Property 46: Message Length Validation**
    - **Property 50: XSS Prevention**
    - **Property 60: SQL Injection Prevention**
    - **Valide: Requirements 11.1, 11.6, 15.5, 15.6**

  - [ ] 8.3 Implémenter le contrôle d'accès
    - Implémenter les vérifications d'authentification pour tous les endpoints
    - Implémenter `canAccessChannel()` et `canDeleteMessage()` dans PermissionService
    - Vérifier l'accès aux canaux (membres uniquement)
    - Vérifier l'accès aux DMs (participants uniquement)
    - Logger les tentatives d'accès non autorisées
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 8.4 Écrire les tests de propriétés pour le contrôle d'accès
    - **Property 29: Permission Denial Returns Error**
    - **Property 30: Permission Denial Audit Logging**
    - **Property 57: Authentication Required for Access**
    - **Property 58: Access Control Enforcement**
    - **Property 59: Unauthorized Access Logging**
    - **Valide: Requirements 6.5, 6.6, 15.1, 15.2, 15.3, 15.4**

  - [x] 8.5 Implémenter le rate limiting
    - Créer `src/messaging-core/RateLimiter.ts`
    - Limiter à 10 messages par utilisateur par fenêtre de 10 secondes
    - Retourner une erreur RATE_LIMIT_EXCEEDED si dépassé
    - Implémenter un système de fenêtre glissante
    - _Requirements: 15.7_

  - [ ]* 8.6 Écrire les tests de propriétés pour le rate limiting
    - **Property 61: Rate Limiting Enforcement**
    - **Valide: Requirements 15.7**


- [ ] 9. Implémenter la gestion des erreurs et la résilience
  - [x] 9.1 Créer le système de gestion d'erreurs
    - Créer `src/messaging-core/ErrorHandler.ts`
    - Définir les catégories d'erreurs (Validation, Permission, Resource, System)
    - Implémenter le format de réponse d'erreur standardisé (ErrorResponse)
    - Implémenter le logging des erreurs
    - _Requirements: 6.5, 6.6_

  - [ ] 9.2 Implémenter la résilience de la base de données
    - Implémenter la logique de retry pour les écritures (1 retry avec 100ms de délai)
    - Gérer les échecs de connexion avec backoff exponentiel
    - Implémenter la gestion des transactions avec rollback
    - Créer un système de backup quotidien
    - _Requirements: 12.4, 12.6, 12.7_

  - [ ]* 9.3 Écrire les tests de propriétés pour la résilience
    - **Property 54: Database Write Retry on Failure**
    - **Valide: Requirements 12.7**

  - [ ] 9.3 Implémenter la dégradation gracieuse
    - Implémenter le fallback HTTP polling si WebSocket échoue
    - Gérer l'indisponibilité de la recherche (désactiver l'UI)
    - Mettre en file d'attente les notifications si le service est indisponible
    - Afficher des messages d'erreur conviviaux à l'utilisateur
    - _Requirements: 8.5, 8.6_

  - [x] 9.4 Implémenter la gestion des timestamps
    - Créer `src/messaging-ui/utils/timeUtils.ts`
    - Implémenter la conversion UTC vers timezone locale
    - Formater les timestamps de manière lisible (relatif et absolu)
    - _Requirements: 2.7_

  - [ ]* 9.5 Écrire les tests de propriétés pour les timestamps
    - **Property 8: Timestamp Timezone Conversion**
    - **Valide: Requirements 2.7**

- [ ] 10. Créer les endpoints REST API
  - [ ] 10.1 Créer les endpoints de gestion des canaux
    - Créer `src/messaging-api/routes/channels.ts`
    - Implémenter POST /api/messaging/channels (créer canal)
    - Implémenter GET /api/messaging/channels (obtenir canaux de l'utilisateur)
    - Implémenter PUT /api/messaging/channels/:id (mettre à jour canal)
    - Implémenter DELETE /api/messaging/channels/:id (supprimer canal)
    - Implémenter POST /api/messaging/channels/:id/members (ajouter membre)
    - Implémenter DELETE /api/messaging/channels/:id/members/:userId (retirer membre)
    - _Requirements: 3.1, 3.4, 3.5, 7.1, 7.4_

  - [ ] 10.2 Créer les endpoints de gestion des messages
    - Créer `src/messaging-api/routes/messages.ts`
    - Implémenter GET /api/messaging/messages/channel/:id (obtenir messages de canal)
    - Implémenter GET /api/messaging/messages/dm/:userId (obtenir messages DM)
    - Implémenter POST /api/messaging/messages (envoyer message - fallback)
    - Implémenter DELETE /api/messaging/messages/:id (supprimer message)
    - _Requirements: 2.1, 2.2, 2.6, 4.2_

  - [ ] 10.3 Créer les endpoints de recherche et notifications
    - Créer `src/messaging-api/routes/search.ts` et `notifications.ts`
    - Implémenter GET /api/messaging/search (rechercher messages)
    - Implémenter GET /api/messaging/notifications (obtenir compteurs non lus)
    - Implémenter PUT /api/messaging/notifications/:id (mettre à jour préférences)
    - _Requirements: 9.1, 10.3, 10.6_

  - [ ] 10.4 Créer les endpoints de gestion des rôles
    - Créer `src/messaging-api/routes/roles.ts`
    - Implémenter POST /api/messaging/roles (assigner rôle)
    - Implémenter GET /api/messaging/roles/:userId (obtenir rôle utilisateur)
    - _Requirements: 5.1, 5.4_

  - [ ] 10.5 Créer le middleware d'authentification
    - Créer `src/messaging-api/middleware/auth.ts`
    - Vérifier le token d'authentification pour toutes les requêtes
    - Extraire l'ID utilisateur du token
    - Retourner 401 Unauthorized si non authentifié
    - _Requirements: 15.1_

- [ ] 11. Checkpoint - Vérifier l'API complète
  - Tester tous les endpoints REST avec des requêtes manuelles
  - Vérifier que l'authentification fonctionne correctement
  - Tester les cas d'erreur et les validations
  - Demander à l'utilisateur si des questions se posent


- [ ] 12. Créer les composants UI avancés
  - [ ] 12.1 Créer le composant de création de canal
    - Créer `src/messaging-ui/components/CreateChannelModal.tsx`
    - Formulaire avec nom (3-50 caractères), description (0-500 caractères), type (public/privé)
    - Valider les entrées côté client
    - Afficher les erreurs de validation
    - Désactiver pour les utilisateurs sans permission
    - _Requirements: 3.2, 3.3, 6.3_

  - [ ] 12.2 Créer le composant de gestion des membres
    - Créer `src/messaging-ui/components/ChannelMembersModal.tsx`
    - Afficher la liste des membres avec leurs rôles
    - Permettre d'inviter de nouveaux membres (Moderator/Admin)
    - Permettre de retirer des membres (Moderator/Admin)
    - Afficher les permissions de l'utilisateur actuel
    - _Requirements: 7.1, 7.4_

  - [ ] 12.3 Créer le composant de paramètres de notifications
    - Créer `src/messaging-ui/components/NotificationSettings.tsx`
    - Permettre de configurer les préférences par canal (all, mentions, muted)
    - Afficher les compteurs de notifications non lues
    - Permettre de marquer tout comme lu
    - _Requirements: 10.3, 10.4, 10.5_

  - [ ] 12.4 Créer le composant de recherche
    - Créer `src/messaging-ui/components/SearchModal.tsx`
    - Champ de recherche avec filtres (expéditeur, date, canal)
    - Afficher les résultats avec contexte et surlignage
    - Permettre de naviguer vers le message dans son contexte
    - _Requirements: 9.1, 9.3, 9.4, 9.6, 9.7_

  - [ ] 12.5 Créer le composant de gestion des rôles
    - Créer `src/messaging-ui/components/RoleManagementModal.tsx`
    - Afficher la liste des utilisateurs avec leurs rôles
    - Permettre de changer les rôles (Admin uniquement)
    - Empêcher la modification de son propre rôle
    - Empêcher de retirer le dernier Admin
    - _Requirements: 5.1, 5.4, 5.5, 5.7_

  - [ ] 12.6 Améliorer le composant MessageView
    - Ajouter le support du formatage Markdown
    - Afficher les liens cliquables
    - Afficher les emojis
    - Afficher les indicateurs de typing
    - Afficher les aperçus de liens (si disponibles)
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 8.3, 8.4_

  - [ ] 12.7 Créer les indicateurs de statut et feedback
    - Créer `src/messaging-ui/components/StatusIndicators.tsx`
    - Afficher les indicateurs de connexion (connecté, reconnexion, déconnecté)
    - Afficher les indicateurs d'envoi de message (envoi, envoyé, échec)
    - Afficher les notifications toast pour les erreurs
    - Afficher les indicateurs de typing
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [-] 13. Intégrer avec l'application principale
  - [x] 13.1 Créer le point d'entrée du module
    - Créer `src/messaging-ui/index.tsx` qui exporte MessagingContainer
    - Créer l'API publique du module avec les fonctions d'initialisation
    - Documenter l'interface d'intégration
    - _Requirements: 13.3_

  - [ ] 13.2 Ajouter la route de messagerie
    - Ajouter une route `/messaging` dans le routeur principal de l'application
    - Intégrer le composant MessagingContainer
    - Passer l'ID utilisateur et le token d'authentification
    - _Requirements: 13.3, 15.1_

  - [ ] 13.3 Démarrer le serveur WebSocket
    - Créer `src/messaging-api/server.ts` pour démarrer le serveur WebSocket
    - Configurer le port et les options de connexion
    - Intégrer avec le système d'authentification existant
    - Ajouter le script de démarrage dans package.json
    - _Requirements: 8.1, 15.1_

  - [ ] 13.4 Créer la documentation d'utilisation
    - Créer `src/messaging-ui/README.md`
    - Documenter l'architecture du module
    - Documenter les composants et services
    - Fournir des exemples d'utilisation
    - Documenter les endpoints API
    - _Requirements: 13.1, 13.3_

  - [ ] 13.5 Tester l'isolation du module
    - Vérifier que le module fonctionne indépendamment
    - Vérifier que la désactivation du module n'affecte pas l'application
    - Vérifier que la base de données est bien séparée
    - Vérifier qu'il n'y a pas de dépendances circulaires
    - _Requirements: 13.1, 13.2, 13.4, 13.5, 13.6, 13.7_


- [ ] 14. Optimiser les performances
  - [ ] 14.1 Implémenter le cache en mémoire
    - Créer `src/messaging-core/CacheService.ts`
    - Mettre en cache les canaux fréquemment accédés
    - Mettre en cache les informations utilisateur
    - Implémenter l'invalidation du cache lors des mises à jour
    - _Requirements: 8.2_

  - [ ] 14.2 Optimiser les requêtes de base de données
    - Vérifier que tous les index sont utilisés efficacement
    - Optimiser les requêtes de pagination
    - Utiliser des requêtes préparées pour les opérations fréquentes
    - Implémenter le batching pour les insertions multiples
    - _Requirements: 9.2, 12.5_

  - [ ] 14.3 Optimiser la livraison des messages WebSocket
    - Implémenter le batching des messages pour réduire les round-trips
    - Compresser les messages volumineux
    - Optimiser la diffusion aux canaux avec beaucoup de membres
    - _Requirements: 8.2_

  - [ ] 14.4 Implémenter le lazy loading
    - Charger les canaux à la demande
    - Charger les messages par pagination (50 par batch)
    - Charger les membres de canal à la demande
    - Implémenter le scroll virtuel pour les longues listes
    - _Requirements: 4.5, 4.6_

- [ ] 15. Écrire les tests d'intégration
  - [ ]* 15.1 Tester le parcours utilisateur complet
    - Test: login → rejoindre canal → envoyer message → recevoir message → logout
    - Vérifier que toutes les étapes fonctionnent de bout en bout
    - Vérifier la persistance des données
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

  - [ ]* 15.2 Tester le cycle de vie des canaux
    - Test: créer canal → ajouter membres → envoyer messages → supprimer canal
    - Vérifier que les messages sont archivés lors de la suppression
    - Vérifier les permissions à chaque étape
    - _Requirements: 3.1, 3.5, 3.6, 7.1_

  - [ ]* 15.3 Tester l'escalade de permissions
    - Test: member → moderator → admin avec vérification des permissions à chaque étape
    - Vérifier que les permissions sont mises à jour immédiatement
    - Vérifier la protection du dernier admin
    - _Requirements: 5.1, 5.4, 5.6, 5.7_

  - [ ]* 15.4 Tester la reconnexion WebSocket
    - Test: connecter → déconnecter → reconnecter → synchroniser messages manqués
    - Vérifier le backoff exponentiel
    - Vérifier la notification après 30 secondes
    - _Requirements: 8.5, 8.6, 8.7_

  - [ ]* 15.5 Tester la recherche de messages
    - Test: envoyer messages → rechercher par divers filtres → vérifier résultats
    - Vérifier que seuls les messages accessibles sont retournés
    - Vérifier le surlignage des termes de recherche
    - _Requirements: 9.1, 9.3, 9.5, 9.6_

  - [ ]* 15.6 Tester les performances sous charge
    - Test: 100 connexions WebSocket simultanées
    - Test: 1000 messages envoyés en 10 secondes
    - Test: 50 canaux avec 20 membres chacun
    - Test: 10,000 messages en base avec recherche
    - Vérifier que les latences restent < 2s (p95)
    - _Requirements: 8.2, 9.2_

- [ ] 16. Checkpoint final - Tests et validation
  - Exécuter tous les tests unitaires et de propriétés
  - Exécuter tous les tests d'intégration
  - Vérifier la couverture de code (>85% lignes, >80% branches)
  - Tester manuellement tous les parcours utilisateur
  - Vérifier les performances et la latence
  - Demander à l'utilisateur si des questions se posent


- [ ] 17. Finaliser et documenter
  - [ ] 17.1 Créer la documentation technique
    - Documenter l'architecture du système
    - Documenter les schémas de base de données
    - Documenter les endpoints API avec exemples
    - Documenter les événements WebSocket
    - Créer des diagrammes de séquence pour les flux principaux
    - _Requirements: 13.3_

  - [ ] 17.2 Créer la documentation utilisateur
    - Guide de démarrage rapide
    - Guide d'utilisation des canaux et messages directs
    - Guide de gestion des permissions et rôles
    - Guide de configuration des notifications
    - FAQ et résolution de problèmes
    - _Requirements: 13.3_

  - [ ] 17.3 Créer les scripts de maintenance
    - Script de backup de la base de données
    - Script de nettoyage des messages archivés
    - Script de migration de données (si nécessaire)
    - Script de monitoring des performances
    - _Requirements: 12.6_

  - [ ] 17.4 Configurer le monitoring et logging
    - Configurer les logs d'application (Winston ou équivalent)
    - Logger les erreurs critiques
    - Logger les tentatives d'accès non autorisées
    - Configurer les métriques de performance (latence, throughput)
    - _Requirements: 6.6, 15.4_

  - [ ] 17.5 Créer le guide de déploiement
    - Instructions de configuration du serveur WebSocket
    - Instructions de configuration de la base de données
    - Variables d'environnement requises
    - Checklist de sécurité avant déploiement
    - Procédure de rollback en cas de problème
    - _Requirements: 13.3_

  - [ ] 17.6 Effectuer l'audit de sécurité final
    - Vérifier toutes les validations d'entrée
    - Vérifier la sanitization XSS
    - Vérifier la protection contre les injections SQL
    - Vérifier le contrôle d'accès
    - Vérifier le rate limiting
    - Tester avec des payloads malveillants
    - _Requirements: 15.1, 15.2, 15.3, 15.5, 15.6, 15.7_

  - [ ] 17.7 Préparer la release
    - Créer le changelog avec toutes les fonctionnalités
    - Mettre à jour le numéro de version
    - Créer les notes de release
    - Préparer les instructions de migration (si applicable)
    - Créer un tag Git pour la release
    - _Requirements: 13.3_

## Notes

- Les tâches marquées avec `*` sont optionnelles et peuvent être sautées pour un MVP plus rapide
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les checkpoints permettent une validation incrémentale
- Les tests de propriétés valident les propriétés de correction universelles (61 propriétés au total)
- Les tests unitaires valident des exemples spécifiques et cas limites
- L'architecture modulaire permet une maintenance et évolution indépendantes
- La base de données SQLite dédiée (databases/messaging.sqlite) assure l'isolation complète

## Dépendances techniques

### Backend
- `ws`: Serveur WebSocket
- `better-sqlite3`: Base de données SQLite
- `uuid`: Génération d'identifiants uniques
- `express`: Framework REST API (si non déjà présent)

### Frontend
- `react`: Framework UI
- `typescript`: Typage statique
- `marked` ou `react-markdown`: Rendu Markdown
- `date-fns`: Manipulation des dates et timezones

### Tests
- `fast-check`: Property-based testing
- `jest` ou `vitest`: Framework de tests
- `@testing-library/react`: Tests de composants React

## Estimation

- **Phase 1-2** (Infrastructure + Services backend): 3-4 jours
- **Phase 3-4** (WebSocket + UI de base): 3-4 jours
- **Phase 5-7** (Fonctionnalités avancées): 4-5 jours
- **Phase 8-9** (Sécurité + Gestion d'erreurs): 2-3 jours
- **Phase 10-13** (API + Intégration): 3-4 jours
- **Phase 14-17** (Optimisation + Tests + Documentation): 4-5 jours

**Total estimé**: 19-25 jours de développement

## Prochaines étapes

Une fois ce document validé, vous pouvez commencer l'implémentation en:
1. Ouvrant ce fichier `tasks.md`
2. Cliquant sur "Start task" à côté de la première tâche
3. Suivant les tâches dans l'ordre séquentiel

Le système vous guidera à travers chaque étape de l'implémentation avec des instructions détaillées et des validations incrémentales.
