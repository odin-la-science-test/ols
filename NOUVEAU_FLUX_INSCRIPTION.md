# Nouveau Flux d'Inscription - Odin la Science

## Vue d'ensemble

Refonte complète du formulaire d'inscription avec un parcours en 4 étapes adapté selon le type de compte.

---

## ÉTAPE 1 : Type de compte

### Choix principal
- **Personnel** ou **Entreprise**

### Si PERSONNEL sélectionné :
1. Checkbox "Je suis étudiant"
2. Si étudiant coché :
   - Upload obligatoire de la carte étudiante (image ou PDF, max 5 Mo)
   - Aperçu de l'image uploadée
   - **Réduction automatique de 50%** sur tous les prix

### Si ENTREPRISE sélectionné :
1. Choix du type :
   - **Privé** (entreprise privée)
   - **Public** (structure publique : université, hôpital, laboratoire public)
   
2. Si Public sélectionné :
   - Upload obligatoire d'un justificatif (SIRET, attestation, etc.)
   - Formats acceptés : PDF, JPG, PNG (max 5 Mo)

3. Champs obligatoires :
   - Nom de l'établissement
   - Nombre d'employés / Nombre de comptes nécessaires
   - Note : "Le directeur peut créer et gérer les comptes des employés"

---

## ÉTAPE 2 : Choix de l'abonnement

### Cycle de facturation
- **Mensuel** (paiement chaque mois)
- **Annuel** (paiement annuel avec 20% de réduction)

### Type d'abonnement
1. **Site complet** (tous les modules)
   - Prix : 2600€/mois
   - Inclut : Munin Atlas + Hugin Core + Hugin Lab + Hugin Analysis
   
2. **Par modules** (sélection personnalisée)
   - Munin Atlas : 250€/mois
   - Hugin Core : 450€/mois
   - Hugin Lab : 850€/mois
   - Hugin Analysis : 1200€/mois
   - Sélection multiple possible avec checkboxes

### Calcul du prix
```
Prix de base = Prix des modules sélectionnés

Si étudiant :
  Prix de base = Prix de base × 0.5 (50% de réduction)

Si entreprise :
  Prix de base = Prix de base × Nombre d'employés

Prix mensuel = Prix de base

Si cycle annuel :
  Prix annuel = Prix mensuel × 12 × 0.8 (20% de réduction)
  Économie = Prix mensuel × 12 × 0.2
```

### Affichage du prix
- Carte récapitulative avec :
  - Prix unitaire par module
  - Réduction étudiant (si applicable)
  - Nombre d'employés (si entreprise)
  - Total mensuel
  - Total annuel (si cycle annuel)
  - Économies réalisées

---

## ÉTAPE 3 : Informations personnelles

### Champs obligatoires
1. **Nom complet**
   - Texte libre
   
2. **Email professionnel**
   - Validation en temps réel
   - Format email requis
   - Indicateur d'erreur si invalide

3. **Mot de passe**
   - Indicateur de force en temps réel
   - Barre de progression (6 niveaux)
   - Critères affichés :
     - 8+ caractères
     - Majuscule
     - Minuscule
     - Chiffre
     - Caractère spécial
   - Bouton œil pour afficher/masquer
   - Score minimum requis : 4/6

4. **Confirmer le mot de passe**
   - Doit correspondre au mot de passe
   - Indicateur visuel de correspondance
   - Bouton œil pour afficher/masquer

5. **Téléphone** (optionnel)
   - Format international accepté

---

## ÉTAPE 4 : Paiement et validation

### Informations de paiement

1. **Titulaire de la carte**
   - Nom en majuscules
   
2. **Numéro de carte**
   - Format : 0000 0000 0000 0000
   - Formatage automatique avec espaces
   - 16 chiffres requis

3. **Date d'expiration**
   - Format : MM/AA
   - Formatage automatique

4. **CVV**
   - 3 chiffres
   - Masqué par défaut

### Récapitulatif de la commande

Affichage dans une carte :
- Type de compte (Personnel/Entreprise)
- Statut étudiant (si applicable)
- Type d'entreprise (si applicable)
- Nombre d'employés (si applicable)
- Modules sélectionnés
- Cycle de facturation
- Prix mensuel
- Prix total (mensuel ou annuel)
- Économies réalisées

### Acceptation des conditions

1. **Checkbox 1 : Conditions d'utilisation**
   ```
   J'accepte les [conditions d'utilisation](/terms-of-service) 
   et je reconnais avoir pris connaissance de la politique de confidentialité
   ```
   - Lien ouvrant dans un nouvel onglet

2. **Checkbox 2 : RGPD**
   ```
   J'accepte que mes données soient traitées conformément au [RGPD](/rgpd) 
   et je consens au traitement de mes données personnelles
   ```
   - Lien ouvrant dans un nouvel onglet

### Bouton de validation

- **Texte** : "Finaliser l'inscription"
- **État désactivé** si :
  - Formulaire incomplet
  - Conditions non acceptées
  - Mot de passe trop faible
- **État de chargement** : "Inscription en cours..."
- **Couleur** : Vert (#10b981)
- **Icône** : Checkmark

### Badge de sécurité
```
🔒 Transaction sécurisée via Odin Gateway
```

---

## Navigation entre les étapes

### Indicateur de progression
- 4 cercles numérotés
- Ligne de progression entre les cercles
- Cercle actif : surligné avec glow effect
- Cercles complétés : icône checkmark
- Cercles à venir : grisés

### Boutons de navigation

**Bouton Retour** (étapes 2, 3, 4)
- Icône : Flèche gauche
- Texte : "Retour"
- Style : Transparent avec bordure

**Bouton Continuer** (étapes 1, 2, 3)
- Icône : Flèche droite
- Texte : "Continuer"
- Style : Gradient bleu/violet
- Position : Aligné à droite

**Bouton Finaliser** (étape 4)
- Icône : Checkmark
- Texte : "Finaliser l'inscription"
- Style : Vert
- Désactivé si conditions non remplies

---

## Validations par étape

### Étape 1
- Type de compte sélectionné
- Si étudiant : carte étudiante uploadée
- Si entreprise :
  - Type d'entreprise sélectionné
  - Si public : justificatif uploadé
  - Nom de l'établissement renseigné
  - Nombre d'employés > 0

### Étape 2
- Cycle de facturation sélectionné
- Type d'abonnement sélectionné
- Si par modules : au moins 1 module sélectionné

### Étape 3
- Email valide
- Mot de passe fort (score ≥ 4)
- Mots de passe correspondants
- Nom complet renseigné

### Étape 4
- Informations de paiement complètes
- Conditions d'utilisation acceptées
- RGPD accepté

---

## Messages d'erreur

### Toasts (notifications)
- "Veuillez sélectionner un type de compte"
- "Veuillez télécharger votre carte étudiante"
- "Veuillez fournir un justificatif pour une structure publique"
- "Veuillez sélectionner au moins un module"
- "Email invalide"
- "Mot de passe trop faible"
- "Les mots de passe ne correspondent pas"
- "Veuillez accepter les conditions"

### Indicateurs visuels
- Bordure rouge sur les champs invalides
- Icône d'alerte à côté des erreurs
- Messages d'erreur sous les champs concernés

---

## Données sauvegardées

### Profil utilisateur créé
```javascript
{
  email: string,
  password: string (hashé),
  username: string,
  fullName: string,
  phone: string,
  accountCategory: 'personal' | 'enterprise',
  isStudent: boolean,
  studentCardImage: File | null,
  enterpriseType: 'private' | 'public' | '',
  publicJustification: File | null,
  companyName: string,
  numberOfEmployees: number,
  subscription: {
    type: 'full' | 'modules',
    cycle: 'monthly' | 'annual',
    modules: string[] | 'all',
    price: number
  },
  role: 'user' | 'admin',
  createdAt: string (ISO)
}
```

---

## Design et UX

### Animations
- Transition fluide entre les étapes (fadeIn)
- Hover effects sur les cartes sélectionnables
- Glow effect sur l'étape active
- Smooth scroll automatique en haut à chaque changement d'étape

### Responsive
- Desktop : 2 colonnes pour les choix
- Mobile : 1 colonne, boutons empilés
- Padding adaptatif
- Tailles de police ajustées

### Couleurs
- Accent primaire : Bleu (#3b82f6)
- Accent secondaire : Violet (#8b5cf6)
- Succès : Vert (#10b981)
- Erreur : Rouge (#ef4444)
- Avertissement : Orange (#f59e0b)

### Icônes (Lucide React)
- User : Compte personnel
- Building2 : Entreprise
- GraduationCap : Étudiant
- Building : Privé
- Landmark : Public
- Upload : Upload de fichiers
- Eye/EyeOff : Afficher/masquer mot de passe
- Check : Validation
- ChevronRight : Suivant
- ArrowLeft : Retour
- ShieldCheck : Sécurité

---

## Prochaines étapes d'implémentation

1. ✅ Créer le fichier RegisterNew.tsx
2. ⏳ Compléter les étapes 2, 3, 4
3. ⏳ Tester le flux complet
4. ⏳ Ajouter la route dans App.tsx
5. ⏳ Remplacer l'ancien Register par le nouveau
6. ⏳ Tester sur mobile
7. ⏳ Valider les uploads de fichiers
8. ⏳ Intégrer avec le backend (Supabase)

---

## Notes importantes

- Les fichiers uploadés doivent être stockés en base64 ou sur un serveur de fichiers
- La validation de la carte étudiante peut être manuelle ou automatique (OCR)
- Les justificatifs pour structures publiques nécessitent une validation manuelle
- Le directeur d'entreprise aura accès à un panneau de gestion des comptes employés
- Les prix affichés sont HT (ajouter TVA si nécessaire)
