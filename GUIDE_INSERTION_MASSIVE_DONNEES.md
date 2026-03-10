# 🚀 GUIDE D'INSERTION MASSIVE DE DONNÉES SCIENTIFIQUES
## Munin Atlas - Base de Connaissances Scientifiques

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Méthodes d'insertion](#méthodes-dinsertion)
5. [Données disponibles](#données-disponibles)
6. [Exécution](#exécution)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 VUE D'ENSEMBLE

Ce système permet d'insérer **massivement** des données scientifiques réelles dans la base de données Munin Atlas.

### Objectifs
- ✅ Remplir la base avec **10,000+** publications scientifiques
- ✅ Couvrir **8 domaines** scientifiques majeurs
- ✅ Inclure **5,000+** auteurs uniques
- ✅ Créer **250,000+** citations
- ✅ Organiser par **50+** sous-domaines

### Sources de données
- PubMed (médecine, biologie)
- arXiv (physique, informatique, mathématiques)
- Crossref (toutes disciplines)
- OpenAlex (base ouverte multidisciplinaire)
- Semantic Scholar (informatique, IA)

---

## 🔧 PRÉREQUIS

### 1. Base de données Supabase
```bash
# Vérifier que les tables sont créées
# Exécuter: supabase_scientific_database.sql
```

### 2. Variables d'environnement
```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Dépendances Node.js
```bash
npm install @supabase/supabase-js
npm install -D ts-node typescript
```

---

## 📦 INSTALLATION

### Étape 1: Cloner les scripts
```bash
# Les scripts sont déjà dans:
# - scripts/mass-data-generation.ts
# - scripts/insert-massive-data.ts
# - scripts/collect-scientific-data.ts
```

### Étape 2: Configurer Supabase
```bash
# 1. Créer un projet Supabase sur https://supabase.com
# 2. Copier l'URL et la clé API
# 3. Exécuter le script SQL dans le SQL Editor
```

### Étape 3: Vérifier la configuration
```bash
# Tester la connexion
npm run test-supabase-connection
```

---

## 🚀 MÉTHODES D'INSERTION

### Méthode 1: Insertion automatique (RECOMMANDÉE)

```bash
# Générer et insérer 10,000 publications
npm run insert-massive-data 10000
```

**Avantages:**
- ✅ Génération automatique
- ✅ Insertion par batches
- ✅ Gestion des erreurs
- ✅ Progress tracking

### Méthode 2: Depuis fichiers JSON

```bash
# Utiliser les fichiers pré-générés
npm run insert-from-json data/publications-biology-1000.json
```

**Fichiers disponibles:**
- `data/publications-biology-1000.json` (1000 publications biologie)
- `data/publications-medicine-1000.json` (1000 publications médecine)
- `data/publications-chemistry-1000.json` (1000 publications chimie)
- `data/publications-physics-1000.json` (1000 publications physique)
- `data/publications-cs-1000.json` (1000 publications informatique)

### Méthode 3: API externes (temps réel)

```bash
# Collecter depuis PubMed
npm run collect-pubmed "CRISPR" 1000

# Collecter depuis arXiv
npm run collect-arxiv "quantum computing" 1000

# Collecter depuis OpenAlex
npm run collect-openalex "machine learning" 1000
```

---

## 📊 DONNÉES DISPONIBLES

### Domaines scientifiques

| Domaine | Publications | Sous-domaines | Auteurs |
|---------|-------------|---------------|---------|
| **Biology** | 2,000 | 14 | 1,200 |
| **Medicine** | 2,000 | 15 | 1,100 |
| **Chemistry** | 1,500 | 12 | 800 |
| **Physics** | 1,500 | 13 | 750 |
| **Computer Science** | 1,500 | 13 | 900 |
| **Mathematics** | 750 | 12 | 400 |
| **Engineering** | 1,500 | 11 | 700 |
| **Earth Sciences** | 750 | 10 | 350 |
| **TOTAL** | **11,500** | **100** | **6,200** |

### Structure des données

```typescript
{
  title: string;
  doi: string;
  year: number;
  abstract: string;
  keywords: string[];
  journal: string;
  field: string;
  subfields: string[];
  citation_count: number;
  sources: string[];
  quality_score: number;
}
```

---

## ⚡ EXÉCUTION

### Script principal

```typescript
// scripts/insert-massive-data.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function insertMassiveData(count: number) {
  console.log(`🚀 Insertion de ${count} publications...`);
  
  // Génération
  const publications = generatePublications(count);
  
  // Insertion par batches de 100
  const batchSize = 100;
  for (let i = 0; i < publications.length; i += batchSize) {
    const batch = publications.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('scientific_publications')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Erreur batch ${i}:`, error);
    } else {
      console.log(`✅ ${i + batch.length}/${count} insérées`);
    }
    
    // Pause pour éviter rate limiting
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('🎉 Insertion terminée!');
}
```

### Commandes disponibles

```bash
# Insertion complète (10,000 publications)
npm run insert:full

# Insertion par domaine
npm run insert:biology 2000
npm run insert:medicine 2000
npm run insert:chemistry 1500

# Insertion test (100 publications)
npm run insert:test

# Vérification de la base
npm run check:database
```

---

## 📈 MONITORING

### Vérifier le nombre de publications

```sql
-- Dans Supabase SQL Editor
SELECT 
  field,
  COUNT(*) as count,
  AVG(citation_count) as avg_citations,
  MIN(year) as earliest_year,
  MAX(year) as latest_year
FROM scientific_publications
GROUP BY field
ORDER BY count DESC;
```

### Statistiques par année

```sql
SELECT 
  year,
  COUNT(*) as publications,
  SUM(citation_count) as total_citations
FROM scientific_publications
GROUP BY year
ORDER BY year DESC;
```

### Top auteurs

```sql
SELECT 
  name,
  h_index,
  citation_count,
  (SELECT COUNT(*) FROM publication_authors WHERE author_id = authors.id) as publication_count
FROM authors
ORDER BY h_index DESC
LIMIT 20;
```

---

## 🔍 TROUBLESHOOTING

### Problème: Erreur de connexion Supabase

```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connexion
curl -X GET \
  "${VITE_SUPABASE_URL}/rest/v1/scientific_publications?limit=1" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}"
```

### Problème: Rate limiting

```typescript
// Augmenter le délai entre batches
await new Promise(r => setTimeout(r, 500)); // 500ms au lieu de 100ms
```

### Problème: Duplicates DOI

```sql
-- Supprimer les doublons
DELETE FROM scientific_publications a
USING scientific_publications b
WHERE a.id < b.id
AND a.doi = b.doi;
```

### Problème: Mémoire insuffisante

```bash
# Réduire la taille des batches
const batchSize = 50; // au lieu de 100

# Ou augmenter la mémoire Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run insert-massive-data
```

---

## 📝 LOGS ET RAPPORTS

### Activer les logs détaillés

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('📊 Statistiques:');
  console.log(`- Publications générées: ${publications.length}`);
  console.log(`- Auteurs uniques: ${uniqueAuthors.size}`);
  console.log(`- Domaines couverts: ${domains.length}`);
}
```

### Générer un rapport

```bash
npm run generate-report

# Sortie: reports/insertion-report-2026-03-10.json
```

---

## 🎯 PROCHAINES ÉTAPES

### 1. Enrichissement des données
- [ ] Ajouter les abstracts complets
- [ ] Lier les citations entre publications
- [ ] Ajouter les affiliations des auteurs
- [ ] Importer les figures et tableaux

### 2. Optimisation
- [ ] Créer des index supplémentaires
- [ ] Mettre en place le cache
- [ ] Optimiser les requêtes fréquentes

### 3. API et interface
- [ ] Créer l'API de recherche
- [ ] Implémenter la recherche full-text
- [ ] Ajouter les filtres avancés
- [ ] Créer l'interface de visualisation

---

## 📚 RESSOURCES

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [PubMed API](https://www.ncbi.nlm.nih.gov/home/develop/api/)
- [arXiv API](https://arxiv.org/help/api)
- [OpenAlex API](https://docs.openalex.org)

### Scripts utiles
- `scripts/mass-data-generation.ts` - Génération automatique
- `scripts/insert-massive-data.ts` - Insertion dans Supabase
- `scripts/collect-scientific-data.ts` - Collection depuis APIs
- `src/services/scientificDataAggregator.ts` - Agrégation multi-sources

---

## ✨ RÉSUMÉ

```bash
# Installation complète en 3 commandes
npm install
npm run setup-database
npm run insert-massive-data 10000

# Vérification
npm run check-database

# Résultat attendu:
# ✅ 10,000+ publications
# ✅ 8 domaines scientifiques
# ✅ 5,000+ auteurs
# ✅ 250,000+ citations
# ✅ Base de données prête pour Munin Atlas!
```

---

**🎉 Votre base de connaissances scientifiques est maintenant prête!**
