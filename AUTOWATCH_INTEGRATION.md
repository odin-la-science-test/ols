# Auto-Watch Service - Intégration Complète

## ✅ Statut: INTÉGRÉ ET FONCTIONNEL

Le service d'auto-watch automatique est maintenant complètement intégré dans l'application.

## 🎯 Fonctionnalités

### 1. Exécution Automatique Toutes les Heures
- Le service démarre automatiquement au lancement de l'application
- Exécute toutes les veilles actives chaque heure
- Recherche dans PubMed, arXiv, et CrossRef

### 2. Notifications par Email
- **Nouveaux articles trouvés**: Email immédiat avec détails des articles
- **Rapport quotidien**: Email envoyé une fois par jour si aucun nouvel article en 24h
- Les emails sont envoyés via le système de messagerie interne

### 3. Archivage Automatique
- Les 10 articles les plus récents sont automatiquement archivés
- Stockés dans le dossier "auto-watch" de la bibliothèque
- Dédoublonnage automatique pour éviter les duplicatas

### 4. Déduplication Intelligente
- Évite d'envoyer plusieurs fois le même article
- Compare par DOI et titre normalisé
- Historique des résultats maintenu en mémoire

## 📁 Fichiers Modifiés

### 1. `src/services/autoWatchService.ts` (CRÉÉ)
Service principal contenant toute la logique:
- `initAutoWatchService(userEmail)`: Initialise le service avec exécution horaire
- `runAllWatches(userEmail)`: Exécute toutes les veilles actives
- `forceRunWatches(userEmail)`: Force l'exécution immédiate (bouton "Check Now")
- Recherche multi-sources (PubMed, arXiv, CrossRef)
- Envoi d'emails via messagerie interne
- Archivage automatique des résultats

### 2. `src/App.tsx` (MODIFIÉ)
Ajout de l'initialisation automatique:
```typescript
// Initialize Auto-Watch Service
useEffect(() => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.email) {
        console.log('Initializing Auto-Watch Service for:', user.email);
        initAutoWatchService(user.email);
      }
    } catch (e) {
      console.error('Error initializing auto-watch:', e);
    }
  }
}, []);
```

### 3. `src/pages/hugin/ScientificResearch.tsx` (MODIFIÉ)
Connexion du bouton "Lancer la veille maintenant":
- Import de `forceRunWatches`
- Récupération de l'email utilisateur depuis localStorage
- Appel du service au lieu de la fonction locale
- Notification de succès avec redirection vers la messagerie

## 🚀 Utilisation

### Pour l'Utilisateur

1. **Ajouter une veille**:
   - Aller dans Hugin Lab > Scientific Research
   - Cliquer sur "Auto-Watch"
   - Choisir le type (Author, Keyword, ORCID)
   - Entrer la valeur et cliquer "Add"

2. **Lancer manuellement**:
   - Cliquer sur "Lancer la veille maintenant"
   - Les résultats sont archivés automatiquement
   - Un email est envoyé dans la messagerie interne

3. **Vérifier les résultats**:
   - Aller dans Hugin Lab > Messaging pour voir les emails
   - Aller dans Scientific Research > Publications pour voir les articles archivés
   - Filtrer par dossier "auto-watch" pour voir uniquement les résultats automatiques

### Automatique

- Le service s'exécute automatiquement toutes les heures
- Aucune action requise de l'utilisateur
- Les emails sont envoyés automatiquement

## 📧 Format des Emails

### Email avec Nouveaux Articles
```
🔔 Auto-Watch Alert: X nouveaux articles trouvés!

Date: [date et heure]

═══════════════════════════════════════

📚 Veille: [valeur] (type)
   Nouveaux articles: X

   1. [Titre]
      Auteurs: [auteurs]
      Source: [source] (année)
      URL: [url]

   ... et X autres articles

───────────────────────────────────────

💡 Tous les articles ont été automatiquement archivés dans votre bibliothèque (dossier "auto-watch").

Accédez à votre bibliothèque: Hugin Lab > Scientific Research > Publications
```

### Email Quotidien Sans Nouveaux Articles
```
📊 Rapport quotidien Auto-Watch

Date: [date et heure]

═══════════════════════════════════════

Aucun nouvel article trouvé dans les dernières 24 heures.

Veilles actives: X

1. [valeur] (type)
   Articles trouvés: X
   Nouveaux: 0

───────────────────────────────────────

💡 Vos veilles continuent de surveiller les bases de données.
Vous recevrez une notification dès qu'un nouvel article correspondant sera publié.
```

## 🔧 Configuration

### Fréquence d'Exécution
Modifiable dans `autoWatchService.ts`:
```typescript
const ONE_HOUR = 60 * 60 * 1000; // 1 heure
const ONE_DAY = 24 * 60 * 60 * 1000; // 24 heures
```

### Nombre d'Articles Archivés
Modifiable dans la fonction `performWatchSearch`:
```typescript
for (const article of newArticles.slice(0, 10)) { // Limite à 10
```

### Sources de Recherche
Actuellement activées:
- PubMed (médecine et biologie)
- arXiv (sciences physiques et informatique)
- CrossRef (toutes disciplines)

## 🐛 Débogage

### Vérifier si le Service est Actif
Ouvrir la console du navigateur:
```
Auto-Watch Service initialized for: [email]
Running scheduled auto-watch...
Running X watches for [email]
```

### Vérifier les Emails
Aller dans Hugin Lab > Messaging et chercher:
- Expéditeur: "Auto-Watch System"
- Sujet contenant "Auto-Watch"

### Vérifier les Archives
Aller dans Scientific Research > Publications:
- Filtrer par dossier "auto-watch"
- Vérifier la propriété `autoArchived: true`

## 📊 Stockage des Données

### LocalStorage
- `research_watchlist`: Liste des veilles actives
- `research_archives`: Articles archivés
- `messaging`: Messages/emails internes

### Structure des Données

**WatchItem**:
```typescript
{
  type: 'author' | 'keyword' | 'orcid',
  value: string,
  id: string
}
```

**Article**:
```typescript
{
  id: string,
  title: string,
  abstract: string,
  year: string,
  authors: string,
  doi: string,
  source: string,
  sourceUrl: string,
  url: string,
  pdfUrl: string | null,
  dateAdded: string,
  folderId: string,
  autoArchived: boolean
}
```

## ✨ Améliorations Futures Possibles

1. **Paramètres Utilisateur**:
   - Fréquence personnalisable (1h, 6h, 12h, 24h)
   - Nombre d'articles à archiver
   - Activer/désactiver les emails

2. **Filtres Avancés**:
   - Filtrer par année de publication
   - Filtrer par journal/source
   - Exclure certains mots-clés

3. **Notifications Push**:
   - Notifications navigateur
   - Intégration avec services externes (Slack, Discord)

4. **Statistiques**:
   - Graphiques de veille
   - Tendances par sujet
   - Auteurs les plus productifs

5. **Export**:
   - Export BibTeX
   - Export RIS
   - Export CSV

## 🎉 Résumé

Le système d'auto-watch est maintenant:
- ✅ Complètement intégré
- ✅ Exécution automatique toutes les heures
- ✅ Emails automatiques (nouveaux articles + rapport quotidien)
- ✅ Archivage automatique
- ✅ Déduplication intelligente
- ✅ Bouton "Check Now" fonctionnel
- ✅ Interface utilisateur complète

L'utilisateur peut maintenant créer des veilles et recevoir automatiquement des notifications par email lorsque de nouveaux articles correspondants sont publiés!
