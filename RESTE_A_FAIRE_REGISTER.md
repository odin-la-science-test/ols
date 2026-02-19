# Reste à faire sur Register.tsx

## ✅ Fait
1. Structure formData modifiée
2. calculatePrice() modifié
3. handleFileUpload() ajouté
4. Validation nextStep() modifiée
5. Imports ajoutés (User, Landmark, Upload)
6. ÉTAPE 1 complètement remplacée (Personnel/Entreprise)

## ⏳ À faire

### ÉTAPE 2 : Remplacer par "Choix de l'abonnement"
Actuellement l'étape 2 demande les infos personnelles (email, mot de passe).
Il faut la remplacer par :
- Choix cycle : Mensuel / Annuel
- Choix type : Site complet / Par modules
- Si par modules : checkboxes pour chaque module
- Carte récapitulative du prix

### ÉTAPE 3 : Simplifier "Informations personnelles"
L'étape actuelle 2 doit devenir l'étape 3 mais simplifiée :
- Nom complet (pas de distinction entreprise/perso)
- Email
- Mot de passe
- Confirmer mot de passe
- Téléphone (optionnel)

Supprimer :
- companyName (déjà demandé en étape 1)
- sections
- employees (déjà demandé en étape 1)

### ÉTAPE 4 : Ajouter récapitulatif et CGU
L'étape 4 actuelle (paiement) doit inclure :
- Informations de paiement (déjà présent)
- Récapitulatif complet de la commande
- Checkbox CGU
- Checkbox RGPD
- Bouton "Finaliser l'inscription"

### Corrections dans le code
- Ligne 668, 672, 677, 679, 680, 685, 981 : Remplacer `isEnterprise` par `formData.accountCategory === 'enterprise'`
- Ligne 679, 981 : Remplacer `formData.adminName` par `formData.fullName`
- Ligne 692, 693, 701, 702 : Supprimer les références à `sections` et `employees`
- Ligne 998, 1003, 1014, 1028 : Remplacer `cost.finalPrice` par `cost.annual` et `cost.totalMonthly` par `cost.monthly`

## Ordre final des étapes
1. Type de compte (Personnel/Entreprise) ✅
2. Choix abonnement (Mensuel/Annuel + Modules/Complet) ⏳
3. Informations personnelles (Nom, Email, Mot de passe) ⏳
4. Paiement + Validation (Carte + CGU/RGPD) ⏳
