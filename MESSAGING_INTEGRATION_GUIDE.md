# Guide d'Intégration - Système de Messagerie Interne

## 📊 État Actuel: 55% Complété

Le système de messagerie interne de type Discord est maintenant fonctionnel avec tous les composants de base implémentés.

## ✅ Ce qui est Terminé

### Infrastructure Backend (100%)
- ✅ Base de données SQLite avec schéma complet
- ✅ 8 services backend (Permissions, Channels, Messages, Notifications, Security, RateLimiter, ErrorHandler, Cache)
- ✅ Serveur WebSocket avec gestion des connexions
- ✅ Reconnexion automatique avec backoff exponentiel
- ✅ Sanitization XSS et validation des entrées
- ✅ Rate limiting (10 messages/10 secondes)

### Interface Utilisateur (60%)
- ✅ MessagingContainer - Conteneur principal avec Context API
- ✅ ChannelList - Liste des canaux et DMs
- ✅ MessageView - Affichage des messages avec scroll infini
- ✅ MessageInput - Saisie avec typing indicators
- ✅ UserList - Liste des membres avec statuts de présence

### Utilitaires (100%)
- ✅ Formatage Markdown (gras, italique, code)
- ✅ Détection automatique des URLs
- ✅ Support des mentions @username
- ✅ Formatage des timestamps (relatif et absolu)
- ✅ Hook WebSocket React

## 🚀 Démarrage Rapide

### 1. Installer les Dépendances

```bash
npm install better-sqlite3 ws uuid
npm install --save-dev @types/better-sqlite3 @types/ws @types/uuid
```

### 2. Démarrer le Serveur WebSocket

```bash
node src/messaging-api/server.ts
```

Le serveur démarre sur le port 8080 par défaut.

### 3. Intégrer dans votre Application React

```tsx
import { MessagingContainer } from './messaging-ui';

function App() {
  const currentUserId = 'user-123'; // ID de l'utilisateur connecté
  const authToken = 'your-auth-token'; // Token d'authentification

  return (
    <MessagingContainer
      currentUserId={currentUserId}
      authToken={authToken}
    />
  );
}
```

### 4. Ajouter une Route (Optionnel)

```tsx
import { MessagingContainer } from './messaging-ui';

// Dans votre routeur (React Router)
<Route 
  path="/messaging" 
  element={
    <MessagingContainer
      currentUserId={user.id}
      authToken={user.token}
    />
  } 
/>
```

## 📁 Structure des Fichiers Créés

```
src/
├── messaging-core/           # Services backend
│   ├── config.ts            # Configuration centralisée
│   ├── PermissionService.ts # Gestion des rôles et permissions
│   ├── ChannelService.ts    # CRUD canaux
│   ├── MessageService.ts    # Gestion des messages
│   ├── NotificationService.ts # Notifications
│   ├── SecurityService.ts   # Validation et sanitization
│   ├── RateLimiter.ts       # Rate limiting
│   ├── ErrorHandler.ts      # Gestion d'erreurs
│   ├── CacheService.ts      # Cache LRU
│   ├── WebSocketManager.ts  # Gestionnaire WebSocket
│   └── README.md            # Documentation du module
│
├── messaging-api/            # Serveur et routes
│   ├── WebSocketServer.ts   # Serveur WebSocket
│   └── server.ts            # Point d'entrée
│
├── messaging-db/             # Base de données
│   ├── schema.ts            # Schéma SQLite
│   └── database.ts          # Gestionnaire DB
│
├── messaging-types/          # Types TypeScript
│   └── index.ts             # Toutes les définitions
│
└── messaging-ui/             # Interface React
    ├── MessagingContainer.tsx
    ├── MessagingContainer.css
    ├── index.tsx            # Point d'entrée du module
    ├── components/
    │   ├── ChannelList.tsx
    │   ├── ChannelList.css
    │   ├── MessageView.tsx
    │   ├── MessageView.css
    │   ├── MessageInput.tsx
    │   ├── MessageInput.css
    │   ├── UserList.tsx
    │   └── UserList.css
    ├── hooks/
    │   └── useWebSocket.ts
    └── utils/
        ├── messageFormatter.ts
        └── timeUtils.ts

databases/
└── messaging.sqlite         # Base de données (créée automatiquement)
```

## 🎨 Fonctionnalités Disponibles

### Communication
- ✅ Messages directs (DM) entre utilisateurs
- ✅ Canaux de discussion (publics et privés)
- ✅ Communication temps réel via WebSocket
- ✅ Reconnexion automatique en cas de déconnexion

### Messages
- ✅ Formatage Markdown (gras, italique, code)
- ✅ Mentions @username avec surlignage
- ✅ Détection automatique des URLs
- ✅ Support des emojis
- ✅ Limite de 2000 caractères par message
- ✅ Pagination (50 messages par batch)
- ✅ Scroll infini pour charger l'historique

### Présence et Statuts
- ✅ Indicateurs de présence (online, away, offline)
- ✅ Indicateurs de typing en temps réel
- ✅ Statuts d'envoi (envoi, envoyé, échec)

### Sécurité
- ✅ Sanitization XSS automatique
- ✅ Rate limiting (10 messages/10s par utilisateur)
- ✅ Validation des entrées
- ✅ Authentification requise
- ✅ Contrôle d'accès basé sur les rôles

### Permissions
- ✅ 3 rôles: Admin, Moderator, Member
- ✅ 10 permissions granulaires
- ✅ Protection du dernier admin
- ✅ Vérifications d'accès automatiques

## ⏳ Ce qui Reste à Faire

### Composants UI Avancés (6 fichiers)
- ⏳ CreateChannelModal - Modal de création de canal
- ⏳ ChannelMembersModal - Gestion des membres
- ⏳ NotificationSettings - Paramètres de notifications
- ⏳ SearchModal - Recherche de messages
- ⏳ RoleManagementModal - Gestion des rôles (Admin)
- ⏳ StatusIndicators - Indicateurs de connexion

### Endpoints REST API (5 fichiers)
- ⏳ routes/channels.ts - CRUD canaux
- ⏳ routes/messages.ts - Récupération messages
- ⏳ routes/notifications.ts - Gestion notifications
- ⏳ routes/roles.ts - Gestion rôles
- ⏳ middleware/auth.ts - Authentification

### Documentation
- ⏳ Documentation technique complète
- ⏳ Guide utilisateur
- ⏳ Documentation API

## 🔧 Configuration

### Configuration du Serveur WebSocket

Le serveur peut être configuré via `src/messaging-core/config.ts`:

```typescript
export const MESSAGING_CONFIG = {
  WS_PORT: 8080,                    // Port WebSocket
  RATE_LIMIT_MESSAGES: 10,          // Messages max
  RATE_LIMIT_WINDOW: 10000,         // Fenêtre (ms)
  MAX_MESSAGE_LENGTH: 2000,         // Longueur max message
  MESSAGES_PER_PAGE: 50,            // Messages par page
  RECONNECT_DELAYS: [1000, 2000, 4000, 8000, 16000, 30000], // Backoff
  DB_PATH: './databases/messaging.sqlite',
  BACKUP_INTERVAL: 86400000,        // 24 heures
};
```

### Variables d'Environnement

Créez un fichier `.env` si nécessaire:

```env
MESSAGING_WS_PORT=8080
MESSAGING_DB_PATH=./databases/messaging.sqlite
```

## 📝 Utilisation

### Envoyer un Message

Les messages sont envoyés automatiquement via WebSocket quand l'utilisateur tape dans MessageInput et appuie sur Entrée.

### Créer un Canal

Pour l'instant, les canaux doivent être créés via l'API backend. Le modal de création sera ajouté prochainement.

### Gérer les Permissions

Les permissions sont gérées automatiquement par le PermissionService selon le rôle de l'utilisateur.

## 🐛 Dépannage

### Le serveur WebSocket ne démarre pas

Vérifiez que le port 8080 n'est pas déjà utilisé:

```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

### La base de données n'est pas créée

Vérifiez que le dossier `databases/` existe et que vous avez les permissions d'écriture.

### Les messages ne s'affichent pas

1. Vérifiez que le serveur WebSocket est démarré
2. Ouvrez la console du navigateur pour voir les erreurs
3. Vérifiez que l'authToken est valide

### Erreur de reconnexion

La reconnexion automatique utilise un backoff exponentiel. Attendez jusqu'à 30 secondes maximum.

## 📚 Documentation Complète

Pour plus de détails, consultez:

- **Architecture**: `src/messaging-core/README.md`
- **Spécifications**: `.kiro/specs/internal-messaging/design.md`
- **Requirements**: `.kiro/specs/internal-messaging/requirements.md`
- **Tâches**: `.kiro/specs/internal-messaging/tasks.md`
- **Progression**: `MESSAGING_PROGRESS.md`

## 🎯 Prochaines Étapes Recommandées

1. **Tester l'interface de base** - Démarrez le serveur et testez l'envoi de messages
2. **Créer les modals** - Ajoutez les composants UI avancés pour une expérience complète
3. **Implémenter les endpoints REST** - Pour les opérations non temps-réel
4. **Ajouter la recherche** - Implémentez le SearchModal et le SearchService
5. **Tests** - Ajoutez des tests unitaires et d'intégration

## 💡 Conseils

- Le système est complètement isolé et n'interfère pas avec le code existant
- La base de données SQLite est dédiée (`databases/messaging.sqlite`)
- Tous les services backend sont prêts à être utilisés
- Les composants React sont modulaires et réutilisables
- Le WebSocket se reconnecte automatiquement en cas de déconnexion

## 🤝 Support

Pour toute question ou problème:
1. Consultez la documentation dans `src/messaging-core/README.md`
2. Vérifiez les logs du serveur WebSocket
3. Inspectez la console du navigateur pour les erreurs frontend

---

**Système créé avec ❤️ - Prêt pour l'intégration et les tests!**
