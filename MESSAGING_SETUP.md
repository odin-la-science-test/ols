# Guide d'installation du système de messagerie interne

## 📦 Dépendances requises

Le système de messagerie nécessite les dépendances suivantes :

```bash
npm install better-sqlite3 ws uuid
npm install --save-dev @types/better-sqlite3 @types/ws @types/uuid
```

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. La base de données sera créée automatiquement

Le fichier `databases/messaging.sqlite` sera créé automatiquement au premier démarrage.

### 3. Démarrer le serveur WebSocket (une fois implémenté)

```bash
npm run messaging:server
```

### 4. Intégrer dans votre application React

```typescript
import { MessagingContainer } from './src/messaging-ui';

function App() {
  return (
    <MessagingContainer 
      currentUserId={user.id}
      authToken={authToken}
    />
  );
}
```

## 📁 Structure du projet

```
src/
├── messaging-core/       ✅ Services métier
│   ├── config.ts        ✅ Configuration
│   ├── PermissionService.ts  ✅ Gestion des permissions
│   ├── ChannelService.ts     ✅ Gestion des canaux
│   ├── MessageService.ts     ✅ Gestion des messages
│   ├── NotificationService.ts ✅ Notifications
│   ├── SecurityService.ts    ✅ Sécurité et validation
│   ├── RateLimiter.ts        ✅ Rate limiting
│   ├── WebSocketManager.ts   ✅ Gestionnaire WebSocket
│   ├── ErrorHandler.ts       ✅ Gestion d'erreurs
│   └── CacheService.ts       ✅ Cache en mémoire
│
├── messaging-ui/         🔄 Composants React
│   ├── hooks/
│   │   └── useWebSocket.ts   ✅ Hook WebSocket
│   └── utils/
│       ├── messageFormatter.ts ✅ Formatage Markdown
│       └── timeUtils.ts        ✅ Gestion du temps
│
├── messaging-api/        ✅ API WebSocket
│   ├── WebSocketServer.ts    ✅ Serveur WebSocket
│   └── server.ts             ✅ Point d'entrée
│
├── messaging-db/         ✅ Base de données
│   ├── schema.ts        ✅ Schéma SQL
│   └── database.ts      ✅ Gestionnaire DB
│
└── messaging-types/      ✅ Types TypeScript
    └── index.ts         ✅ Tous les types
```

## ✅ Fonctionnalités implémentées

- [x] Structure de dossiers modulaire
- [x] Types TypeScript complets
- [x] Schéma de base de données SQLite
- [x] Gestionnaire de base de données avec retry
- [x] Service de permissions et rôles
- [x] Service de gestion des canaux
- [x] Service de gestion des messages
- [x] Service de notifications
- [x] Service de sécurité (XSS, validation)
- [x] Service de rate limiting
- [x] Gestionnaire WebSocket
- [x] Serveur WebSocket
- [x] Hook React WebSocket avec reconnexion
- [x] Utilitaires de formatage (Markdown, URLs, mentions)
- [x] Utilitaires de gestion du temps
- [x] Système de cache en mémoire
- [x] Gestionnaire d'erreurs et audit logging
- [ ] Interface utilisateur React (composants)
- [ ] Endpoints REST API
- [ ] Tests et optimisations

## 🔧 Configuration

La configuration se trouve dans `src/messaging-core/config.ts`. Vous pouvez ajuster :

- Port WebSocket (défaut: 8080)
- Limites de messages (défaut: 2000 caractères)
- Rate limiting (défaut: 10 messages / 10 secondes)
- Chemins de base de données

## 📝 Prochaines étapes

L'implémentation continue avec :
1. Services backend (ChannelService, MessageService)
2. Communication WebSocket temps réel
3. Interface utilisateur React
4. Fonctionnalités avancées (recherche, notifications)
5. Tests et optimisations

## 🐛 Dépannage

### La base de données ne se crée pas

Vérifiez que le dossier `databases/` existe et que vous avez les permissions d'écriture.

### Erreurs TypeScript

Assurez-vous que toutes les dépendances sont installées :
```bash
npm install
```

### Le serveur WebSocket ne démarre pas

Vérifiez que le port 8080 n'est pas déjà utilisé.

## 📚 Documentation

- [Requirements](.kiro/specs/internal-messaging/requirements.md)
- [Design](.kiro/specs/internal-messaging/design.md)
- [Tasks](.kiro/specs/internal-messaging/tasks.md)
- [README du module](src/messaging-core/README.md)
