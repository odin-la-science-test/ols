# 🌍 MUNIN ATLAS - BASE DE DONNÉES SCIENTIFIQUE MASSIVE

> **La plus grande base de données scientifique agrégée au monde**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Publications](https://img.shields.io/badge/publications-0M-orange.svg)]()
[![Domains](https://img.shields.io/badge/domains-280+-green.svg)]()

---

## 📖 À PROPOS

Munin Atlas Database est un projet ambitieux visant à créer la plus grande base de données scientifique agrégée au monde en collectant et structurant des millions de publications depuis les principales plateformes académiques.

### 🎯 Objectifs

- **10+ millions** de publications scientifiques
- **280+ domaines** scientifiques couverts
- **8 sources** majeures agrégées
- **Qualité maximale** des métadonnées
- **Mise à jour continue** des données

### 🌟 Caractéristiques

- ✅ **Agrégation Multi-Sources**: PubMed, arXiv, Crossref, Semantic Scholar, OpenAlex, Europe PMC, HAL, Google Scholar
- ✅ **Déduplication Intelligente**: Fusion automatique des doublons
- ✅ **Indexation Avancée**: Recherche rapide par auteur, domaine, année, mots-clés
- ✅ **Graphe de Citations**: Analyse des réseaux de citations
- ✅ **Statistiques Complètes**: Métriques d'agrégation et visualisations
- ✅ **API REST**: Accès programmatique aux données
- ✅ **Export/Import**: Formats JSON, CSV, SQL

---

## 🚀 DÉMARRAGE RAPIDE

### Installation

```bash
# Cloner le repository
git clone https://github.com/odin-la-science/munin-atlas.git
cd munin-atlas

# Installer les dépendances
npm install

# Configurer les API keys (optionnel)
cp .env.example .env
# Éditer .env avec vos clés API
```

### Première Collecte

```bash
# Collecter pour un domaine de test
npm run collect-data collect-domains bacteriology

# Vérifier les résultats
npm run collect-data stats
```

### Documentation Complète

- 📘 [Guide de Démarrage Rapide](./MUNIN_DATABASE_QUICK_START.md)
- 📊 [Suivi de Progression](./MUNIN_DATABASE_PROGRESS.md)
- 🎯 [Plan d'Expansion](./MUNIN_ATLAS_DATABASE_EXPANSION_PLAN.md)

---

## 📊 STATISTIQUES ACTUELLES

```
📚 Publications:        0 / 10,000,000 (0.00%)
👥 Auteurs:             0
🏛️  Institutions:        0
📖 Citations:           0
🔬 Domaines:            0 / 280 (0.00%)
🌐 Sources:             5 / 8 actives
```

*Dernière mise à jour: 10 Mars 2026*

---

## 🏗️ ARCHITECTURE

### Structure du Projet

```
munin-atlas/
├── src/
│   ├── types/
│   │   └── scientific-database.ts      # Types TypeScript
│   ├── services/
│   │   ├── scientificDataAggregator.ts # Agrégation multi-sources
│   │   └── scientificDatabaseManager.ts # Gestion de la BDD
│   └── utils/
├── scripts/
│   └── collect-scientific-data.ts      # Script de collecte
├── data/
│   ├── domains/                        # Données par domaine
│   ├── aggregated/                     # Données consolidées
│   └── indices/                        # Index de recherche
└── docs/
    └── api/                            # Documentation API
```

### Technologies

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Storage**: localStorage / IndexedDB / PostgreSQL
- **Search**: Index inversé / Elasticsearch
- **API**: REST / GraphQL
- **Queue**: Bull / Redis (pour production)

---

## 🔌 SOURCES DE DONNÉES

### Sources Actives

| Source | Publications | API | Rate Limit | Statut |
|--------|-------------|-----|------------|--------|
| **PubMed** | 35M+ | ✅ | 3-10 req/s | ✅ Actif |
| **arXiv** | 2.3M+ | ✅ | 1 req/s | ✅ Actif |
| **Crossref** | 140M+ | ✅ | 50 req/s | ✅ Actif |
| **Semantic Scholar** | 200M+ | ✅ | 100 req/s | ✅ Actif |
| **OpenAlex** | 250M+ | ✅ | 10 req/s | ✅ Actif |
| **Europe PMC** | 40M+ | ✅ | 10 req/s | ⏳ Planifié |
| **HAL** | 1M+ | ✅ | 5 req/s | ⏳ Planifié |
| **Google Scholar** | Billions | ❌ | N/A | ⏳ Planifié |

### Obtenir des API Keys

Pour augmenter les rate limits:

1. **PubMed**: https://www.ncbi.nlm.nih.gov/account/
2. **Semantic Scholar**: https://www.semanticscholar.org/product/api
3. **Europe PMC**: https://europepmc.org/RestfulWebService
4. **HAL**: https://api.archives-ouvertes.fr/docs

---

## 📚 DOMAINES COUVERTS

### Catégories Principales

- **Sciences de la Vie** (80+ domaines)
  - Biologie, Médecine, Biotechnologies, Génétique, etc.

- **Sciences Exactes** (60+ domaines)
  - Mathématiques, Physique, Chimie, Astronomie, etc.

- **Sciences de l'Ingénieur** (40+ domaines)
  - Informatique, Génie, Robotique, IA, etc.

- **Sciences de la Terre** (30+ domaines)
  - Géologie, Climatologie, Océanographie, etc.

- **Sciences Humaines** (30+ domaines)
  - Psychologie, Sociologie, Anthropologie, etc.

- **Sciences Interdisciplinaires** (40+ domaines)
  - Bioinformatique, Nanotechnologies, Sciences cognitives, etc.

[Voir la liste complète des domaines →](./DOMAINS_LIST.md)

---

## 🔍 UTILISATION

### Recherche Simple

```typescript
import { scientificDatabaseManager } from './src/services/scientificDatabaseManager';

// Rechercher des publications
const results = await scientificDatabaseManager.search({
  query: 'CRISPR gene editing',
  filters: {
    years: [2020, 2024],
    minCitations: 10
  }
});

console.log(`Found ${results.totalCount} publications`);
```

### Recherche Avancée

```typescript
// Recherche avec filtres multiples
const results = await scientificDatabaseManager.search({
  query: 'machine learning',
  filters: {
    domains: ['computer-science', 'artificial-intelligence'],
    years: [2022, 2024],
    authors: ['Yoshua Bengio'],
    minCitations: 50,
    hasFullText: true,
    hasCode: true
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
```

### Analyse de Citations

```typescript
// Obtenir le réseau de citations
const network = await scientificDatabaseManager.getCitationNetwork(
  'publication-id',
  2 // depth
);

console.log(`Network: ${network.nodes.length} nodes, ${network.edges.length} edges`);
```

### Statistiques

```typescript
// Obtenir les statistiques globales
const stats = await scientificDatabaseManager.getAggregationStats();

console.log(`Total publications: ${stats.totalPublications}`);
console.log(`Total authors: ${stats.totalAuthors}`);
console.log(`Top domain: ${stats.byDomain[0].domainName}`);
```

---

## 🛠️ DÉVELOPPEMENT

### Prérequis

- Node.js 18+
- npm ou yarn
- 4GB+ RAM recommandé
- Connexion internet stable

### Installation pour Développement

```bash
# Cloner le repo
git clone https://github.com/odin-la-science/munin-atlas.git
cd munin-atlas

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Lancer les tests
npm test

# Build pour production
npm run build
```

### Scripts Disponibles

```bash
# Collecte de données
npm run collect-data collect-all          # Collecter tous les domaines
npm run collect-data collect-domains <d>  # Collecter des domaines spécifiques
npm run collect-data stats                # Afficher les statistiques
npm run collect-data resume <file>        # Reprendre depuis un checkpoint

# Base de données
npm run export-database                   # Exporter la BDD
npm run import-database <file>            # Importer une BDD
npm run clean-database                    # Nettoyer la BDD
npm run deduplicate-database              # Dédupliquer

# Développement
npm run dev                               # Mode développement
npm run build                             # Build production
npm run test                              # Lancer les tests
npm run lint                              # Linter le code
```

---

## 📈 ROADMAP

### Phase 1: Infrastructure ✅ (Complétée)

- [x] Types TypeScript
- [x] Services d'agrégation
- [x] Gestionnaire de base de données
- [x] Script de collecte
- [x] Documentation

### Phase 2: Collecte Massive 🔄 (En cours)

- [ ] Collecter 1M publications
- [ ] Collecter 5M publications
- [ ] Collecter 10M publications
- [ ] Optimiser les performances
- [ ] Implémenter le caching

### Phase 3: Enrichissement ⏳ (Planifié)

- [ ] Extraction d'entités (NER)
- [ ] Classification automatique
- [ ] Génération de résumés
- [ ] Traduction multilingue
- [ ] Détection de relations

### Phase 4: Intégration ⏳ (Planifié)

- [ ] API REST complète
- [ ] Interface web
- [ ] Visualisations interactives
- [ ] Recommandations IA
- [ ] Export vers Munin Atlas

### Phase 5: Production ⏳ (Future)

- [ ] Backend scalable
- [ ] Base de données distribuée
- [ ] CDN pour les assets
- [ ] Monitoring avancé
- [ ] Documentation API complète

---

## 🤝 CONTRIBUTION

Les contributions sont les bienvenues! Voici comment contribuer:

### Comment Contribuer

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Guidelines

- Suivre le style de code existant
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Respecter les conventions de commit

### Domaines de Contribution

- 🐛 **Bug Fixes**: Corriger des bugs
- ✨ **Features**: Ajouter de nouvelles fonctionnalités
- 📝 **Documentation**: Améliorer la documentation
- 🎨 **UI/UX**: Améliorer l'interface
- ⚡ **Performance**: Optimiser les performances
- 🧪 **Tests**: Ajouter des tests

---

## 📄 LICENSE

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 👥 ÉQUIPE

### Mainteneurs

- **Odin La Science Team** - *Développement initial* - [GitHub](https://github.com/odin-la-science)

### Contributeurs

Merci à tous les contributeurs qui ont participé à ce projet!

[Voir la liste complète des contributeurs →](https://github.com/odin-la-science/munin-atlas/contributors)

---

## 📞 CONTACT & SUPPORT

### Support

- 📧 **Email**: support@odinlascience.com
- 💬 **Discord**: [Rejoindre le serveur](https://discord.gg/odinlascience)
- 📖 **Documentation**: [docs.odinlascience.com](https://docs.odinlascience.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/odin-la-science/munin-atlas/issues)

### Réseaux Sociaux

- 🐦 **Twitter**: [@OdinLaScience](https://twitter.com/OdinLaScience)
- 💼 **LinkedIn**: [Odin La Science](https://linkedin.com/company/odinlascience)
- 📺 **YouTube**: [Odin La Science](https://youtube.com/@OdinLaScience)

---

## 🙏 REMERCIEMENTS

Merci aux plateformes qui rendent leurs données accessibles:

- **PubMed / NCBI** - Pour l'accès aux publications biomédicales
- **arXiv** - Pour les preprints en sciences
- **Crossref** - Pour les métadonnées de publications
- **Semantic Scholar** - Pour l'API d'intelligence artificielle
- **OpenAlex** - Pour la base de données ouverte
- **Europe PMC** - Pour les publications européennes
- **HAL** - Pour les publications françaises

---

## 📊 STATISTIQUES DU PROJET

![GitHub stars](https://img.shields.io/github/stars/odin-la-science/munin-atlas?style=social)
![GitHub forks](https://img.shields.io/github/forks/odin-la-science/munin-atlas?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/odin-la-science/munin-atlas?style=social)

![GitHub issues](https://img.shields.io/github/issues/odin-la-science/munin-atlas)
![GitHub pull requests](https://img.shields.io/github/issues-pr/odin-la-science/munin-atlas)
![GitHub last commit](https://img.shields.io/github/last-commit/odin-la-science/munin-atlas)

---

<div align="center">

**[Documentation](./docs) • [Quick Start](./MUNIN_DATABASE_QUICK_START.md) • [Progress](./MUNIN_DATABASE_PROGRESS.md) • [API](./docs/api)**

Made with ❤️ by [Odin La Science](https://odinlascience.com)

</div>
