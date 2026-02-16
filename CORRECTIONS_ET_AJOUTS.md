# Corrections et Ajouts - Odin la Science

## Date: 2026-02-16

## 1. Système d'Archivage Automatique ✅

### Fichier créé: `src/utils/autoArchive.ts`

**Fonctionnalités:**
- Archive automatiquement les messages de plus de 1 mois
- Archive automatiquement les événements de planning de plus de 1 semaine
- Exécute la veille automatique de recherche scientifique
- S'exécute automatiquement toutes les 6 heures

**Fonctions principales:**
- `archiveOldMessages()` - Archive les messages anciens
- `archiveOldPlanningEvents()` - Archive les événements passés
- `runAutoWatchSearch()` - Exécute les recherches de veille
- `runAutoArchive()` - Lance tous les processus
- `initAutoArchive()` - Initialise le système au démarrage

**Utilisation:**
```typescript
import { initAutoArchive } from './utils/autoArchive';

// Dans App.tsx ou index.tsx
initAutoArchive();
```

## 2. Correction: Messages ne repassant pas en "lu" ✅

### Fichier modifié: `src/pages/hugin/Messaging.tsx`

**Problème:**
Les messages marqués comme lus revenaient parfois en non-lus à cause d'un problème de synchronisation.

**Solution:**
- Suppression de la condition `if (!msg || msg.read) return;`
- Force la mise à jour même si déjà lu
- Utilisation de `setMessages(prevMessages => ...)` pour éviter les problèmes de state
- Ajout de gestion d'erreur avec console.error

**Code corrigé:**
```typescript
const markAsRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    const updated = { ...msg, read: true };
    try {
        await saveModuleItem('messaging', updated);
        setMessages(prevMessages => prevMessages.map(m => m.id === id ? updated : m));
    } catch (e) {
        console.error('Error marking message as read:', e);
    }
};
```

## 3. Amélioration: Auto-Watch Recherche Scientifique ✅

### Fichier modifié: `src/pages/hugin/ScientificResearch.tsx`

**Améliorations:**
- Recherche automatique immédiate lors de l'ajout d'une veille
- Auto-archivage des 10 articles les plus récents trouvés
- Support pour 3 types de veille: author, keyword, ORCID
- Notifications détaillées des résultats

**Nouvelle fonction:**
```typescript
const performWatchSearch = async (watchItem: WatchItem) => {
    // Recherche automatique basée sur le type de veille
    // Archive automatiquement les nouveaux résultats
    // Notifie l'utilisateur des résultats
};
```

**Fonctionnalités:**
- Recherche dans PubMed, arXiv, CrossRef
- Dédoublonnage automatique
- Archivage dans dossier "auto-watch"
- Limite de 10 articles par recherche pour éviter la surcharge

## 4. Nouveau: Éditeur de Posters Scientifiques ✅

### Fichier créé: `src/pages/hugin/PosterMaker.tsx`

**Fonctionnalités complètes:**

### Interface
- Canvas de travail avec zoom (10% à 200%)
- Grille d'alignement activable/désactivable
- Toolbar gauche avec outils
- Panneau de propriétés à droite
- Barre d'outils supérieure

### Formats de poster
- A0 Portrait (841×1189mm)
- A0 Landscape (1189×841mm)
- A1 Portrait (594×841mm)
- A1 Landscape (841×594mm)
- Format personnalisé

### Éléments disponibles
1. **Texte**
   - Édition directe
   - Taille de police ajustable
   - Gras, italique
   - Alignement (gauche, centre, droite)
   - Couleur du texte

2. **Images**
   - Upload d'images
   - Redimensionnement
   - Positionnement libre

3. **Formes**
   - Rectangles
   - Cercles
   - Lignes
   - Couleur de fond
   - Bordures personnalisables

### Outils d'édition
- Sélection et déplacement
- Duplication d'éléments
- Suppression
- Propriétés détaillées:
  - Position (X, Y)
  - Dimensions (Largeur, Hauteur)
  - Couleurs (texte, fond, bordure)
  - Styles de texte

### Export
- Export en PNG (haute résolution)
- Export en SVG (vectoriel)
- Sauvegarde du projet

### Utilisation
```typescript
// Dans le routing
import PosterMaker from './pages/hugin/PosterMaker';

<Route path="/hugin/poster-maker" element={<PosterMaker />} />
```

## 5. Intégration LibreOffice (Préparation)

### Composants open-source à intégrer

**Pour Word (Traitement de texte):**
- Utiliser `react-quill` ou `draft-js` pour l'éditeur
- Format de sauvegarde: .docx via `docx` npm package
- Export PDF via `jsPDF`

**Pour Excel (Tableur):**
- Déjà implémenté dans `TableurLab.tsx`
- Utilise `handsontable` (open-source)
- Export Excel via `xlsx` npm package

**Pour PowerPoint (Présentations):**
- Utiliser `reveal.js` pour les présentations
- Export PowerPoint via `pptxgenjs`

### Prochaines étapes
1. Créer `src/pages/hugin/WordProcessor.tsx`
2. Créer `src/pages/hugin/PresentationMaker.tsx`
3. Intégrer les bibliothèques open-source
4. Ajouter les routes dans le menu Hugin

## 6. Configuration requise

### Dépendances à ajouter

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "docx": "^8.5.0",
    "pptxgenjs": "^3.12.0",
    "reveal.js": "^5.0.4"
  }
}
```

### Installation
```bash
npm install html2canvas jspdf docx pptxgenjs reveal.js
```

## 7. Initialisation du système

### Dans `src/App.tsx` ou `src/index.tsx`

```typescript
import { initAutoArchive } from './utils/autoArchive';

// Au démarrage de l'application
useEffect(() => {
    initAutoArchive();
}, []);
```

## 8. Routes à ajouter

### Dans le fichier de routing principal

```typescript
import PosterMaker from './pages/hugin/PosterMaker';

// Ajouter dans les routes Hugin
<Route path="/hugin/poster-maker" element={<PosterMaker />} />
```

### Dans le menu Hugin

```typescript
{
    icon: <FileText size={20} />,
    title: 'Poster Maker',
    description: 'Créer des posters scientifiques',
    path: '/hugin/poster-maker',
    color: '#ec4899'
}
```

## 9. Tests recommandés

### Archivage automatique
1. Créer des messages de test avec dates anciennes
2. Créer des événements de planning passés
3. Attendre l'exécution automatique ou forcer avec `runAutoArchive()`
4. Vérifier dans les archives IT

### Messages "lu"
1. Envoyer un message
2. Le marquer comme lu
3. Rafraîchir la page
4. Vérifier qu'il reste lu

### Auto-Watch
1. Ajouter une veille (auteur ou mot-clé)
2. Vérifier la recherche automatique
3. Vérifier l'archivage des résultats
4. Vérifier les notifications

### Poster Maker
1. Créer un nouveau poster
2. Ajouter texte, images, formes
3. Modifier les propriétés
4. Tester le zoom
5. Tester l'export

## 10. Améliorations futures

### Court terme
- [ ] Drag & drop pour les éléments du poster
- [ ] Templates de posters pré-définis
- [ ] Bibliothèque d'images scientifiques
- [ ] Collaboration en temps réel

### Moyen terme
- [ ] Intégration complète LibreOffice
- [ ] Export multi-formats (PDF, PNG, SVG, PPTX)
- [ ] Historique des versions
- [ ] Commentaires et annotations

### Long terme
- [ ] IA pour suggestions de design
- [ ] Génération automatique de posters depuis données
- [ ] Marketplace de templates
- [ ] Intégration avec bases de données scientifiques

## Notes importantes

1. **Performance**: L'archivage automatique s'exécute toutes les 6 heures pour ne pas surcharger le système
2. **Stockage**: Les archives sont stockées dans `hugin_it_archives` avec flag `autoArchived: true`
3. **Watchlist**: Limite de 10 articles par recherche pour éviter la surcharge
4. **Poster**: Utilise le canvas HTML5 pour le rendu, export via html2canvas

## Support

Pour toute question ou problème:
- Consulter la documentation dans chaque fichier
- Vérifier les logs console pour les erreurs
- Tester en environnement de développement d'abord
