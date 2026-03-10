# 📚 GUIDE COMPLET - BASE DE DONNÉES SCIENTIFIQUE SUPABASE

## 🎯 Vue d'ensemble

Vous disposez maintenant d'une base de données scientifique complète pour Munin Atlas, avec :
- **25 tables SQL** pour stocker publications, auteurs, citations, domaines, etc.
- **Service TypeScript** pour interagir facilement avec la base de données
- **Indexation optimisée** pour des recherches rapides
- **Sécurité RLS** (Row Level Security) activée

---

## 📋 ÉTAPE 1 : Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: munin-atlas-scientific-db
   - **Database Password**: (choisissez un mot de passe fort)
   - **Region**: Choisissez la région la plus proche
5. Cliquez sur "Create new project"

### 1.2 Exécuter le script SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez tout le contenu du fichier `supabase_scientific_database.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)
6. Attendez que toutes les tables soient créées (vous verrez "Base de données scientifique créée avec succès! 🎉")

### 1.3 Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key (clé publique)

---

## 📋 ÉTAPE 2 : Configuration de l'application

### 2.1 Créer le fichier .env

Créez ou modifiez le fichier `.env.local` à la racine de votre projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique_ici
```

### 2.2 Installer les dépendances

```bash
npm install @supabase/supabase-js
```

---

## 📋 ÉTAPE 3 : Utilisation du service

### 3.1 Importer le service

```typescript
import { supabaseScientificDB } from './services/supabaseScientificDB';
```

### 3.2 Exemples d'utilisation

#### Ajouter une publication

```typescript
const publication = {
  id: 'pub-001',
  title: 'CRISPR-Cas9 Gene Editing in Human Cells',
  abstract: 'This study demonstrates...',
  year: 2024,
  field: 'Molecular Biology',
  subfields: ['Gene Editing', 'CRISPR'],
  keywords: ['CRISPR', 'Cas9', 'gene editing'],
  authors: [
    {
      name: 'Dr. Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      affiliations: [
        {
          institution: 'MIT',
          department: 'Biology',
          country: 'USA'
        }
      ]
    }
  ],
  citationCount: 0,
  references: [],
  citedBy: [],
  sources: ['pubmed'],
  qualityScore: 85
};

const result = await supabaseScientificDB.addPublication(publication);
if (result.success) {
  console.log('Publication ajoutée avec ID:', result.id);
}
```

#### Rechercher des publications

```typescript
const searchQuery = {
  query: 'CRISPR',
  filters: {
    domains: ['Molecular Biology'],
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
};

const results = await supabaseScientificDB.searchPublications(searchQuery);
console.log(`Trouvé ${results.totalCount} publications`);
console.log('Publications:', results.publications);
```

#### Obtenir une publication par ID

```typescript
const publication = await supabaseScientificDB.getPublication('pub-001');
if (publication) {
  console.log('Titre:', publication.title);
  console.log('Auteurs:', publication.authors.map(a => a.name).join(', '));
}
```

#### Rechercher des auteurs

```typescript
const authors = await supabaseScientificDB.searchAuthors('Smith');
console.log('Auteurs trouvés:', authors);
```

#### Créer une collection personnelle

```typescript
const result = await supabaseScientificDB.createCollection(
  'user@example.com',
  'Ma collection CRISPR',
  'Articles intéressants sur CRISPR',
  ['pub-001', 'pub-002', 'pub-003']
);
```

#### Obtenir les statistiques

```typescript
const stats = await supabaseScientificDB.getStatistics();
console.log('Publications:', stats.totalPublications);
console.log('Auteurs:', stats.totalAuthors);
console.log('Domaines:', stats.totalDomains);
```

---

## 📊 Structure de la base de données

### Tables principales

1. **scientific_publications** - Publications scientifiques
2. **authors** - Auteurs
3. **affiliations** - Institutions et affiliations
4. **publication_authors** - Lien publications ↔ auteurs
5. **figures** - Figures et images
6. **publication_tables** - Tableaux de données
7. **datasets** - Jeux de données liés
8. **code_repositories** - Dépôts de code
9. **scientific_domains** - Domaines scientifiques
10. **scientific_entities** - Entités scientifiques (concepts, molécules, etc.)
11. **journals** - Revues scientifiques
12. **citation_networks** - Réseaux de citations
13. **user_collections** - Collections personnelles
14. **search_history** - Historique de recherche

### Relations

```
scientific_publications
├── publication_authors → authors
│   └── author_affiliations → affiliations
├── figures
├── publication_tables
├── datasets
├── code_repositories
└── publication_metrics

scientific_domains
├── domain_relations
└── publications (via field)

scientific_entities
├── entity_properties
└── entity_relations
```

---

## 🔍 Fonctionnalités avancées

### Recherche full-text

La base de données utilise PostgreSQL Full-Text Search pour des recherches rapides :

```sql
-- Recherche dans les titres et abstracts
SELECT * FROM scientific_publications
WHERE to_tsvector('english', title || ' ' || abstract) 
      @@ to_tsquery('english', 'CRISPR & gene & editing');
```

### Indexation

Des index sont créés automatiquement pour :
- DOI, PMID, et autres identifiants
- Année de publication
- Domaine scientifique
- Nombre de citations
- Mots-clés (GIN index)
- Recherche full-text (GIN index)

### Vues SQL

Deux vues sont disponibles :

1. **publications_with_authors** - Publications avec leurs auteurs
2. **domain_statistics** - Statistiques par domaine

```typescript
// Utiliser une vue
const { data } = await supabase
  .from('publications_with_authors')
  .select('*')
  .limit(10);
```

---

## 🔐 Sécurité (RLS)

Row Level Security est activé sur toutes les tables :

- **Lecture publique** : Tout le monde peut lire les publications, auteurs, etc.
- **Écriture restreinte** : Seuls les administrateurs peuvent ajouter/modifier
- **Collections personnelles** : Chaque utilisateur gère ses propres collections

### Modifier les politiques RLS

Pour restreindre l'accès en production :

```sql
-- Exemple : Restreindre la lecture aux utilisateurs authentifiés
DROP POLICY "Public read access for publications" ON scientific_publications;
CREATE POLICY "Authenticated read access" 
    ON scientific_publications FOR SELECT 
    USING (auth.role() = 'authenticated');
```

---

## 📈 Optimisation des performances

### Pagination efficace

```typescript
// Bonne pratique : utiliser la pagination
const results = await supabaseScientificDB.searchPublications({
  query: 'biology',
  pagination: { page: 1, pageSize: 20 }
});
```

### Limiter les données retournées

```typescript
// Sélectionner uniquement les champs nécessaires
const { data } = await supabase
  .from('scientific_publications')
  .select('id, title, year, citation_count')
  .limit(100);
```

### Utiliser les index

Les recherches sur ces champs sont optimisées :
- `doi`, `pmid`, `year`, `field`
- `citation_count` (pour le tri)
- `keywords` (recherche dans les tableaux)

---

## 🔄 Migration des données existantes

Si vous avez déjà des données dans `scientificDatabaseManager.ts` :

```typescript
import { scientificDatabaseManager } from './services/scientificDatabaseManager';
import { supabaseScientificDB } from './services/supabaseScientificDB';

async function migrateData() {
  // Exporter depuis localStorage
  const jsonData = await scientificDatabaseManager.exportToJSON();
  const data = JSON.parse(jsonData);
  
  // Importer vers Supabase
  for (const pub of data.publications) {
    await supabaseScientificDB.addPublication(pub);
  }
  
  console.log('Migration terminée!');
}
```

---

## 🧪 Tests

### Tester la connexion

```typescript
async function testConnection() {
  const stats = await supabaseScientificDB.getStatistics();
  console.log('Connexion réussie!', stats);
}

testConnection();
```

### Ajouter des données de test

```typescript
async function addTestData() {
  const testPub = {
    id: 'test-001',
    title: 'Test Publication',
    year: 2024,
    field: 'Computer Science',
    subfields: ['AI', 'Machine Learning'],
    keywords: ['test', 'demo'],
    authors: [{
      name: 'Test Author',
      affiliations: [{ institution: 'Test University' }]
    }],
    citationCount: 0,
    references: [],
    citedBy: [],
    sources: ['manual'],
    qualityScore: 50
  };
  
  const result = await supabaseScientificDB.addPublication(testPub);
  console.log('Test publication ajoutée:', result);
}
```

---

## 📝 Prochaines étapes

1. ✅ Créer le projet Supabase
2. ✅ Exécuter le script SQL
3. ✅ Configurer les variables d'environnement
4. ✅ Installer les dépendances
5. ⬜ Tester la connexion
6. ⬜ Ajouter des données de test
7. ⬜ Intégrer dans votre interface utilisateur
8. ⬜ Configurer les politiques RLS pour la production
9. ⬜ Mettre en place un système d'ingestion de données

---

## 🆘 Dépannage

### Erreur de connexion

```
Error: Invalid Supabase URL
```

**Solution** : Vérifiez que `VITE_SUPABASE_URL` est correctement défini dans `.env.local`

### Erreur d'authentification

```
Error: Invalid API key
```

**Solution** : Vérifiez que `VITE_SUPABASE_ANON_KEY` est la clé `anon public` (pas la clé `service_role`)

### Erreur RLS

```
Error: new row violates row-level security policy
```

**Solution** : Vérifiez les politiques RLS dans Supabase Dashboard > Authentication > Policies

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ Fonctionnalités disponibles

✅ Stockage de publications scientifiques complètes
✅ Gestion des auteurs et affiliations
✅ Réseaux de citations
✅ Domaines et entités scientifiques
✅ Collections personnelles
✅ Recherche full-text optimisée
✅ Historique de recherche
✅ Statistiques et agrégations
✅ Sécurité RLS
✅ Indexation performante
✅ Vues SQL pré-configurées

---

**Votre base de données scientifique est prête ! 🚀**
