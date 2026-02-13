# 💾 Système de Stockage des Données

## 📊 Comment ça fonctionne?

L'application OLS Scientist utilise un système de stockage **hybride intelligent** qui s'adapte automatiquement à l'environnement:

### 🔄 Mode Automatique

1. **Tentative de connexion au serveur backend**
   - L'application essaie d'abord de se connecter au serveur
   - Timeout de 2 secondes pour ne pas ralentir l'expérience

2. **Fallback automatique vers localStorage**
   - Si le serveur n'est pas disponible → localStorage
   - Si le serveur répond avec une erreur → localStorage
   - Si le réseau est lent/instable → localStorage

3. **Transparent pour l'utilisateur**
   - Aucune différence visible dans l'interface
   - Les données sont sauvegardées automatiquement
   - Pas de message d'erreur intrusif

## 🌐 Environnements

### En Local (localhost)
- **Serveur backend**: `http://localhost:3001`
- **Fallback**: localStorage si serveur non démarré
- **Idéal pour**: Développement avec base de données SQLite

### En Production (Vercel)
- **Serveur backend**: `https://odin-la-science.infinityfree.me`
- **Fallback**: localStorage (serveur non disponible actuellement)
- **Idéal pour**: Accès rapide depuis n'importe où

## 📦 Modules Concernés

Les modules suivants utilisent le système de persistance:

### ✅ Fonctionnent avec localStorage
- **Messaging** - Messages et conversations
- **ScientificResearch** - Archives de revues scientifiques
- **ScientificResearch** - Watchlist de publications
- **Planning** - Événements et rendez-vous
- **Inventory** - Inventaire de laboratoire
- **CultureTracking** - Suivi des cultures
- **Documents** - Gestion documentaire
- **ITArchive** - Archives informatiques
- **Meetings** - Signaux de réunion
- **LabNotebook** - Cahier de laboratoire
- **StockManager** - Gestion des stocks
- **CryoKeeper** - Échantillons cryogéniques
- **EquipFlow** - Réservations d'équipements
- **GrantBudget** - Budgets et subventions
- **SOPLibrary** - Procédures opératoires
- **Bibliography** - Références bibliographiques
- **ProjectMind** - Gestion de projets

## 🔍 Vérification du Mode de Stockage

Pour savoir quel mode est utilisé, ouvrez la console du navigateur (F12):

```
Backend server not available, using localStorage fallback
→ Mode localStorage actif

Fetch successful, items: X
→ Mode serveur actif
```

## 💡 Avantages du localStorage

### ✅ Avantages
- **Instantané**: Pas de latence réseau
- **Toujours disponible**: Fonctionne hors ligne
- **Gratuit**: Pas de coût serveur
- **Simple**: Pas de configuration nécessaire
- **Rapide**: Accès direct aux données

### ⚠️ Limitations
- **Local à l'appareil**: Données non synchronisées entre appareils
- **Limite de taille**: ~5-10MB par domaine
- **Navigateur spécifique**: Données liées au navigateur
- **Effacement possible**: Si cache navigateur vidé

## 🔐 Sécurité des Données

### localStorage
- Données stockées en clair dans le navigateur
- Accessible uniquement depuis le même domaine
- Protégé par les politiques de sécurité du navigateur
- Recommandé: Ne pas stocker de données ultra-sensibles

### Serveur Backend (quand disponible)
- Données stockées dans SQLite
- Chiffrement possible côté serveur
- Sauvegarde centralisée
- Synchronisation multi-appareils

## 🚀 Migration vers Base de Données Cloud

Pour une vraie application en production avec synchronisation, plusieurs options:

### Option 1: Vercel Postgres (Recommandé)
```bash
# Installation
npm install @vercel/postgres

# Configuration dans vercel.json
{
  "env": {
    "POSTGRES_URL": "@postgres-url"
  }
}
```

**Avantages**:
- Intégration native Vercel
- 256MB gratuit
- Scaling automatique
- Backup automatique

### Option 2: Supabase
```bash
# Installation
npm install @supabase/supabase-js

# Configuration
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)
```

**Avantages**:
- 500MB gratuit
- Auth intégré
- Real-time subscriptions
- API REST automatique

### Option 3: PlanetScale
```bash
# Installation
npm install @planetscale/database

# Configuration
const conn = connect({
  host: 'your-host.psdb.cloud',
  username: 'your-username',
  password: 'your-password'
})
```

**Avantages**:
- MySQL compatible
- Branching de base de données
- Scaling horizontal
- Plan gratuit généreux

## 📝 Structure des Données localStorage

Les données sont stockées avec la clé `module_{nom_module}`:

```javascript
// Exemple: Messages
localStorage.getItem('module_messaging')
// → Array de messages

// Exemple: Archives scientifiques
localStorage.getItem('module_research_archives')
// → Array d'archives

// Exemple: Watchlist
localStorage.getItem('module_research_watchlist')
// → Array de publications suivies
```

## 🔧 Commandes Utiles

### Voir toutes les données stockées
```javascript
// Dans la console du navigateur (F12)
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key, localStorage.getItem(key));
}
```

### Exporter les données
```javascript
// Copier dans le presse-papier
const data = {};
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(data, null, 2));
```

### Importer des données
```javascript
// Depuis un export JSON
const importedData = { /* votre JSON */ };
Object.keys(importedData).forEach(key => {
    localStorage.setItem(key, importedData[key]);
});
```

### Vider toutes les données
```javascript
// ⚠️ ATTENTION: Supprime tout!
localStorage.clear();
```

## 🎯 Recommandations

### Pour Développement
- Utiliser le serveur backend local avec SQLite
- Permet de tester la synchronisation
- Données persistantes entre sessions

### Pour Production (Actuel)
- localStorage fonctionne parfaitement
- Idéal pour usage personnel/équipe restreinte
- Pas de configuration serveur nécessaire

### Pour Production (Futur)
- Migrer vers Vercel Postgres ou Supabase
- Synchronisation multi-appareils
- Collaboration en temps réel
- Backup automatique

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier la console** (F12) pour les messages
2. **Vider le cache** si comportement étrange
3. **Exporter vos données** avant toute manipulation
4. **Tester en navigation privée** pour isoler le problème

## 🔄 Mise à Jour Automatique

Le système vérifie automatiquement la disponibilité du serveur:
- **Une seule fois** au premier appel
- **Résultat mis en cache** pour les appels suivants
- **Pas d'impact** sur les performances

---

**Note**: Le système actuel avec localStorage est parfaitement fonctionnel pour un usage quotidien. La migration vers une base de données cloud n'est nécessaire que si vous avez besoin de synchronisation multi-appareils ou de collaboration en temps réel.
