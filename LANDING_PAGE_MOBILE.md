# Landing Page Mobile - Documentation

## Résumé des modifications

### 1. Remplacement de "C9" par "UGSF"
- Fichier: `src/pages/LandingPage.tsx`
- Ligne 120: Témoignage de Dr. Sophie Laurent - "Chercheuse, UGSF"
- Ligne 129: Liste des entreprises - "UGSF" avec logo 🧪

### 2. Création de la Landing Page Mobile
- Fichier: `src/pages/mobile/LandingPage.tsx`
- Design complètement différent de la version desktop
- Approche mobile-first avec scroll vertical fluide
- Style natif moderne

### 3. Intégration dans App.tsx
- Import du composant `MobileLandingPage`
- Utilisation de `ResponsiveRoute` pour router automatiquement vers la bonne version
- Route "/" affiche desktop ou mobile selon le device

## Caractéristiques de la Landing Page Mobile

### Design
- Fond dégradé sombre (0b1120 → 1e293b)
- Navbar sticky compacte avec logo et boutons
- Sections empilées verticalement
- Animations et transitions fluides
- Effets de blur pour profondeur

### Sections

1. **Hero Section**
   - Badge "Nouvelle génération"
   - Titre principal (2.5rem)
   - Description courte
   - Bouton CTA principal
   - Statistiques (3 colonnes)

2. **Modules Principaux**
   - 3 cartes interactives (Munin, Hugin, Analyse)
   - Sélection active avec gradient
   - Icônes Lucide React
   - Chevron pour navigation

3. **Pourquoi Odin**
   - 4 bénéfices en grille 2x2
   - Icônes colorées
   - Texte concis

4. **Témoignages**
   - 3 témoignages empilés
   - Étoiles de notation
   - Noms et rôles
   - Mention des entreprises (BioEcoAgro, INRAE, UGSF)

5. **Tarification**
   - Carte unique avec tarif académique
   - Prix: 2600€/mois
   - Badge -30% académique
   - Bouton essai gratuit

6. **CTA Final**
   - Section avec gradient
   - 2 boutons (Inscription + Connexion)
   - Message motivant

7. **Footer**
   - Logo et nom
   - Liens (Confidentialité, Conditions, Support)
   - Copyright

### Différences avec Desktop

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Layout | Multi-colonnes | Vertical stack |
| Navigation | Menu complet | Boutons compacts |
| Hero | 2 colonnes | 1 colonne |
| Features | Grille 2x2 | Liste verticale |
| Testimonials | 3 colonnes | Liste verticale |
| Pricing | 3 plans | 1 plan principal |
| Animations | Hover effects | Touch interactions |

### Technologies
- React + TypeScript
- Lucide React (icônes)
- Inline styles (pas de CSS externe)
- Responsive avec useDeviceDetection
- Navigation avec React Router

### Couleurs principales
- Primary: #3b82f6 (bleu)
- Secondary: #8b5cf6 (violet)
- Success: #10b981 (vert)
- Warning: #f59e0b (orange)
- Background: #0b1120 (dark)
- Text: #f8fafc (light)

## Routing

```typescript
<Route path="/" element={
  <ResponsiveRoute 
    desktop={<LandingPage />}
    mobile={<MobileLandingPage />}
  />
} />
```

Le composant `ResponsiveRoute` détecte automatiquement le device via `useDeviceDetection()` et affiche la version appropriée.

## Prochaines étapes possibles

1. Ajouter des animations d'entrée (fade-in, slide-up)
2. Implémenter un carrousel pour les témoignages
3. Ajouter des vidéos de démonstration
4. Créer des pages mobiles pour Privacy, Terms, Support
5. Optimiser les images pour mobile
6. Ajouter des Progressive Web App features
7. Implémenter le lazy loading des images

## Notes importantes

- Aucun commentaire dans le code (comme demandé)
- Toutes les occurrences de "C9" remplacées par "UGSF"
- Design mobile natif, pas une simple adaptation responsive
- Utilise les mêmes composants de navigation (React Router)
- Compatible avec le système de thème existant
