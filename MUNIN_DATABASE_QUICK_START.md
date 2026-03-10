# 🚀 MUNIN ATLAS - GUIDE DE DÉMARRAGE RAPIDE

**Guide pour démarrer la collecte massive de données scientifiques**

---

## ⚡ DÉMARRAGE EN 5 MINUTES

### Étape 1: Vérifier les Prérequis

```bash
# Node.js version 18+
node --version

# npm ou yarn
npm --version
```

### Étape 2: Installer les Dépendances

```bash
npm install
```

### Étape 3: Configurer les API Keys (Optionnel mais Recommandé)

Créer un fichier `.env` à la racine du projet:

```env
# PubMed (Recommandé - augmente le rate limit de 3 à 10 req/s)
PUBMED_API_KEY=your_pubmed_api_key_here

# Semantic Scholar (Recommandé - augmente le rate limit)
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key_here
```

**Comment obtenir les API keys:**

1. **PubMed**: https://www.ncbi.nlm.nih.gov/account/
2. **Semantic Scholar**: https://www.semanticscholar.org/product/api

### Étape 4: Lancer la Première Collecte

```bash
# Collecter pour un domaine de test (Bactériologie)
npm run collect-data collect-domains bacteriology
```

### Étape 5: Vérifier les Résultats

```bash
# Afficher les statistiques
npm run collect-data stats
```

---

## 📚 COMMANDES PRINCIPALES

### Collecte de Données

```bash
# Collecter TOUS les domaines (ATTENTION: Très long!)
npm run collect-data collect-all

# Collecter des domaines spécifiques
npm run collect-data collect-domains bacteriology genetics physics

# Collecter avec limite personnalisée
npm run collect-data collect-domains bacteriology --limit 1000
```

### Statistiques et Monitoring

```bash
# Afficher les statistiques globales
npm run collect-data stats

# Afficher les statistiques d'un domaine
npm run collect-data stats --domain bacteriology

# Monitoring en temps réel
watch -n 5 'npm run collect-data stats'
```

### Gestion de la Base de Données

```bash
# Exporter la base de données
npm run export-database

# Importer une base de données
npm run import-database database.json

# Nettoyer la base de données
npm run clean-database

# Sauvegarder un checkpoint
npm run save-checkpoint
```

---

## 🎯 SCÉNARIOS D'UTILISATION

### Scénario 1: Test Rapide (5 minutes)

Collecter un petit échantillon pour tester le système:

```bash
# 1. Collecter 100 publications en bactériologie
npm run collect-data collect-domains bacteriology --limit 100

# 2. Vérifier les résultats
npm run collect-data stats

# 3. Explorer les données
npm run explore-data
```

### Scénario 2: Domaine Spécifique (30 minutes)

Collecter toutes les données pour un domaine:

```bash
# 1. Collecter 10,000 publications en génétique
npm run collect-data collect-domains genetics

# 2. Vérifier la progression
npm run collect-data stats --domain genetics

# 3. Exporter les résultats
npm run export-database --domain genetics
```

### Scénario 3: Collection Massive (Plusieurs jours)

Collecter pour tous les domaines:

```bash
# 1. Lancer la collecte complète
npm run collect-data collect-all

# 2. Monitoring en arrière-plan
nohup npm run collect-data collect-all > collection.log 2>&1 &

# 3. Suivre la progression
tail -f collection.log

# 4. Vérifier périodiquement
watch -n 60 'npm run collect-data stats'
```

### Scénario 4: Reprise après Interruption

Si la collecte est interrompue:

```bash
# 1. Charger le dernier checkpoint
npm run collect-data resume checkpoint-latest.json

# 2. Continuer la collecte
npm run collect-data collect-all --resume
```

---

## 🔧 CONFIGURATION AVANCÉE

### Personnaliser les Paramètres

Éditer `scripts/collect-scientific-data.ts`:

```typescript
// Nombre de publications par domaine
const PUBLICATIONS_PER_DOMAIN = 10000; // Modifier selon vos besoins

// Taille des batchs
const BATCH_SIZE = 100; // Augmenter pour plus de vitesse

// Délai entre les batchs (ms)
const DELAY_BETWEEN_BATCHES = 1000; // Réduire si vous avez des API keys
```

### Ajouter de Nouveaux Domaines

Éditer `scripts/collect-scientific-data.ts`:

```typescript
const DOMAINS = [
  // Ajouter vos domaines ici
  'your-new-domain',
  'another-domain',
  // ...
];
```

### Activer/Désactiver des Sources

Éditer `scripts/collect-scientific-data.ts`:

```typescript
const SOURCES: DataSource[] = [
  'pubmed',      // ✅ Actif
  'arxiv',       // ✅ Actif
  'crossref',    // ✅ Actif
  // 'hal',      // ❌ Désactivé
];
```

---

## 📊 COMPRENDRE LES RÉSULTATS

### Structure des Données

Chaque publication contient:

```json
{
  "id": "unique-id",
  "doi": "10.1234/example",
  "title": "Titre de la publication",
  "abstract": "Résumé...",
  "year": 2024,
  "authors": [
    {
      "name": "John Doe",
      "affiliations": [
        {
          "institution": "University of Example",
          "country": "USA"
        }
      ]
    }
  ],
  "field": "bacteriology",
  "keywords": ["bacteria", "genome"],
  "citationCount": 42,
  "sources": ["pubmed", "crossref"],
  "qualityScore": 85
}
```

### Métriques de Qualité

Le `qualityScore` (0-100) est calculé selon:

- **+10**: Présence d'un abstract
- **+10**: Présence d'auteurs
- **+10**: Présence d'un DOI
- **+10**: Citations > 0
- **+5**: Présence d'un journal
- **+5**: Présence d'un éditeur
- **Base**: 50 points

---

## 🚨 RÉSOLUTION DE PROBLÈMES

### Problème: Rate Limit Atteint

**Symptôme**: Erreurs 429 "Too Many Requests"

**Solution**:
```bash
# 1. Augmenter le délai entre les requêtes
# Éditer DELAY_BETWEEN_BATCHES dans le script

# 2. Obtenir des API keys pour augmenter les limites

# 3. Réduire le BATCH_SIZE
```

### Problème: Mémoire Insuffisante

**Symptôme**: Erreur "Out of Memory"

**Solution**:
```bash
# 1. Augmenter la mémoire Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run collect-data collect-all

# 2. Collecter par petits batchs

# 3. Sauvegarder plus fréquemment
```

### Problème: Données Dupliquées

**Symptôme**: Même publication apparaît plusieurs fois

**Solution**:
```bash
# Le système déduplique automatiquement par DOI
# Si le problème persiste:
npm run deduplicate-database
```

### Problème: Collecte Lente

**Symptôme**: < 10 publications/minute

**Solution**:
```bash
# 1. Vérifier votre connexion internet

# 2. Obtenir des API keys pour augmenter les rate limits

# 3. Paralléliser les sources
# Éditer le script pour activer la parallélisation
```

---

## 📈 OPTIMISATION DES PERFORMANCES

### Conseils pour Accélérer la Collecte

1. **Obtenir des API Keys**
   - PubMed: 3x plus rapide
   - Semantic Scholar: 10x plus rapide

2. **Paralléliser les Sources**
   ```typescript
   // Dans le script, utiliser Promise.all()
   await Promise.all(
     SOURCES.map(source => collectFromSource(source, domain))
   );
   ```

3. **Augmenter les Batch Sizes**
   ```typescript
   const BATCH_SIZE = 200; // Au lieu de 100
   ```

4. **Réduire les Délais** (si vous avez des API keys)
   ```typescript
   const DELAY_BETWEEN_BATCHES = 500; // Au lieu de 1000
   ```

5. **Utiliser un Serveur Dédié**
   - Plus de RAM
   - Meilleure connexion
   - Pas d'interruptions

---

## 🎓 EXEMPLES D'UTILISATION

### Exemple 1: Recherche dans la Base

```typescript
import { scientificDatabaseManager } from './src/services/scientificDatabaseManager';

// Initialiser
await scientificDatabaseManager.initialize();

// Rechercher
const results = await scientificDatabaseManager.search({
  query: 'CRISPR gene editing',
  filters: {
    years: [2020, 2024],
    minCitations: 10
  },
  sort: {
    field: 'citations',
    order: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 20
  }
});

console.log(`Found ${results.totalCount} publications`);
```

### Exemple 2: Analyser un Domaine

```typescript
// Obtenir toutes les publications d'un domaine
const bacteriologyPubs = await scientificDatabaseManager
  .getPublicationsByDomain('bacteriology');

// Calculer des statistiques
const avgCitations = bacteriologyPubs.reduce((sum, pub) => 
  sum + pub.citationCount, 0) / bacteriologyPubs.length;

console.log(`Average citations: ${avgCitations}`);
```

### Exemple 3: Graphe de Citations

```typescript
// Obtenir le réseau de citations pour une publication
const network = await scientificDatabaseManager
  .getCitationNetwork('publication-id', 2);

console.log(`Network has ${network.nodes.length} nodes`);
console.log(`Network has ${network.edges.length} edges`);
```

---

## 📞 SUPPORT

### Besoin d'Aide?

- 📧 **Email**: support@odinlascience.com
- 💬 **Discord**: [Rejoindre le serveur]
- 📖 **Documentation**: [Lire la doc complète]
- 🐛 **Bug Report**: [Créer une issue]

### Contribuer

Le projet est open-source! Contributions bienvenues:

1. Fork le repository
2. Créer une branche feature
3. Commit vos changements
4. Push et créer une Pull Request

---

## 🎉 PRÊT À COMMENCER!

```bash
# Lancez votre première collecte maintenant!
npm run collect-data collect-domains bacteriology

# Puis explorez les résultats
npm run collect-data stats
```

**Bonne collecte! 🚀**
