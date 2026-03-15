# Module de Messagerie Interne

## Vue d'ensemble

Ce module implémente un système de messagerie interne de type Discord avec communication temps réel via WebSocket, gestion des rôles et permissions, et architecture modulaire isolée.

## Structure du module

```
src/
├── messaging-core/       # Logique métier et services
│   ├── config.ts        # Configuration centralisée
│   ├── PermissionService.ts
│   ├── ChannelService.ts
│   ├── MessageService.ts
│   ├── NotificationService.ts
│   ├── WebSocketManager.ts
│   ├── SearchService.ts
│   ├── SecurityService.ts
│   ├── RateLimiter.ts
│   ├── ErrorHandler.ts
│   └── CacheService.ts
│
├── messaging-ui/         # Composants React
│   ├── MessagingContainer.tsx
│   ├── components/
│   │   ├── ChannelList.tsx
│   │   ├── MessageView.tsx
│   │   ├── MessageInput.tsx
│   │   ├── UserList.tsx
│   │   ├── CreateChannelModal.tsx
│   │   ├── ChannelMembersModal.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── SearchModal.tsx
│   │   ├── RoleManagementModal.tsx
│   │   └── StatusIndicators.tsx
│   ├── hooks/
│   │   └── useWebSocket.ts
│   ├── utils/
│   │   ├── messageFormatter.ts
│   │   └── timeUtils.ts
│   └── index.tsx
│
├── messaging-api/        # API REST et WebSocket
│   ├── WebSocketServer.ts
│   ├── server.ts
│   ├── routes/
│   │   ├── channels.ts
│   │   ├── messages.ts
│   │   ├── search.ts
│   │   ├── notifications.ts
│   │   └── roles.ts
│   └── middleware/
│       └── auth.ts
│
├── messaging-db/         # Couche de données
│   ├── schema.ts
│   ├── database.ts
│   └── migrations/
│
└── messaging-types/      # Définitions TypeScript
    └── index.ts
```

## Caractéristiques principales

- **Communication temps réel** : WebSocket bidirectionnel pour la livraison instantanée des messages
- **Messages directs** : Conversations privées entre deux utilisateurs
- **Canaux** : Espaces de discussion organisés par sujet (publics ou privés)
- **Système de rôles** : Admin, Moderator, Member avec permissions granulaires
- **Recherche** : Recherche de messages avec filtres (contenu, expéditeur, date)
- **Notifications** : Système de notifications avec préférences configurables
- **Formatage Markdown** : Support du formatage de texte (gras, italique, code)
- **Isolation complète** : Module indépendant avec sa propre base de données SQLite

## Configuration

La configuration du module se trouve dans `src/messaging-core/config.ts`. Les paramètres incluent :

- Port WebSocket et options de reconnexion
- Limites de messages et de canaux
- Rate limiting
- Chemins de base de données
- Délais de performance

## Base de données

Le module utilise une base de données SQLite dédiée : `databases/messaging.sqlite`

Tables principales :
- `messaging_users` : Utilisateurs et leurs rôles
- `messaging_channels` : Canaux de discussion
- `messaging_channel_members` : Membres des canaux
- `messaging_messages` : Messages (canaux et DMs)
- `messaging_notifications` : Notifications et compteurs non lus

## Intégration

Pour intégrer le module dans l'application principale :

```typescript
import { MessagingContainer } from './messaging-ui';

// Dans votre composant
<MessagingContainer 
  currentUserId={user.id}
  authToken={authToken}
/>
```

## Démarrage du serveur WebSocket

```bash
npm run messaging:server
```

## Tests

Le module inclut :
- Tests unitaires pour chaque service
- Tests de propriétés (property-based testing) pour valider les invariants
- Tests d'intégration pour les parcours utilisateur complets

## Sécurité

- Authentification requise pour tous les endpoints
- Contrôle d'accès basé sur les rôles
- Sanitization XSS de tous les contenus
- Protection contre les injections SQL (requêtes paramétrées)
- Rate limiting (10 messages / 10 secondes par utilisateur)
- Audit logging des tentatives d'accès non autorisées

## Performances

- Livraison des messages < 2 secondes (p95)
- Recherche < 3 secondes
- Cache en mémoire pour les données fréquemment accédées
- Pagination des messages (50 par batch)
- Index de base de données optimisés

## Dépendances

- `ws` : Serveur WebSocket
- `better-sqlite3` : Base de données SQLite
- `uuid` : Génération d'identifiants uniques
- React et TypeScript pour l'interface utilisateur

## Licence

Ce module fait partie de l'application principale et suit la même licence.
