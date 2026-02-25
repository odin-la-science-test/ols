# 🎯 Guide Rapide - Equipment Booking

## ✅ Le module est maintenant FONCTIONNEL!

Tous les modals et fonctionnalités ont été ajoutés. Vous pouvez maintenant utiliser le module complet.

## 🚀 Comment y accéder?

### Option 1: Via le Beta Hub (Recommandé)
1. Connectez-vous avec votre compte super admin
2. Allez sur: `http://localhost:5173/beta-hub`
3. Cliquez sur la carte "Réservation d'Équipements" 📅

### Option 2: Accès Direct
- URL directe: `http://localhost:5173/beta/equipment-booking`

## 📋 Fonctionnalités Disponibles

### ➕ Ajouter un Équipement
1. Cliquez sur le bouton bleu "Ajouter Équipement" en haut à droite
2. Remplissez le formulaire:
   - Nom (requis)
   - Catégorie (requis)
   - Localisation (requis)
   - Statut (requis)
   - Description (optionnel)
   - Spécifications (optionnel)
   - Date de maintenance (optionnel)
3. Cliquez sur "Ajouter"

### 📅 Réserver un Équipement
1. Dans la vue "Équipements", trouvez l'équipement souhaité
2. Cliquez sur le bouton bleu "Réserver"
3. Remplissez le formulaire:
   - Date (requis)
   - Heure début (requis)
   - Heure fin (requis)
   - Objectif (requis)
   - Notes (optionnel)
4. Cliquez sur "Réserver"

⚠️ Le système détecte automatiquement les conflits horaires!

### ✏️ Modifier un Équipement
1. Cliquez sur l'icône crayon (✏️) sur la carte de l'équipement
2. Modifiez les informations
3. Cliquez sur "Mettre à jour"

### 🗑️ Supprimer
- Équipement: Cliquez sur l'icône poubelle rouge
- Réservation: Cliquez sur l'icône poubelle dans la liste

## 🎨 Les 3 Vues

### 1. Vue Équipements (par défaut)
- Affiche tous les équipements en grille
- Badges colorés pour les statuts
- Boutons d'action rapide

### 2. Vue Calendrier
- Sélectionnez une date
- Voir toutes les réservations du jour
- Informations détaillées (heure, utilisateur, objectif)

### 3. Vue Liste
- Toutes les réservations
- Tri chronologique
- Actions rapides

## 🔍 Recherche et Filtres

### Recherche
- Tapez dans la barre de recherche
- Recherche par nom ou localisation

### Filtres
- **Catégorie**: Microscope, Centrifugeuse, PCR, etc.
- **Statut**: Disponible, En utilisation, Maintenance, Réservé

## 🎨 Codes Couleur

### Statuts Équipements
- 🟢 **Vert** = Disponible
- 🔴 **Rouge** = En utilisation
- 🟠 **Orange** = Maintenance
- 🔵 **Bleu** = Réservé

### Statuts Réservations
- 🟢 **Vert** = Confirmé
- 🟠 **Orange** = En attente
- ⚪ **Gris** = Terminé
- 🔴 **Rouge** = Annulé

## 💡 Conseils

1. **Ajoutez d'abord des équipements** avant de faire des réservations
2. **Utilisez des localisations précises** (ex: "Salle 201, Paillasse 3")
3. **Remplissez les spécifications** pour faciliter l'utilisation
4. **Planifiez les maintenances** pour éviter les conflits
5. **Vérifiez le calendrier** avant de réserver

## 🐛 Problèmes Courants

### "No routes matched location"
- Videz le cache du navigateur (Ctrl + Shift + R)
- Vérifiez que vous êtes connecté avec un compte super admin
- Redémarrez le serveur de développement

### Les données disparaissent
- Les données sont dans localStorage
- Ne videz pas le cache si vous voulez garder les données
- Utilisez le Backup Manager pour sauvegarder

### Le modal ne s'ouvre pas
- Vérifiez la console pour les erreurs
- Rechargez la page
- Vérifiez que JavaScript est activé

## 📊 Exemple d'Utilisation

### Scénario: Réserver un microscope

1. **Ajouter l'équipement**
   - Nom: "Microscope Confocal Zeiss LSM 900"
   - Catégorie: "Microscope"
   - Localisation: "Salle 305, Paillasse 2"
   - Statut: "Disponible"
   - Spécifications: "Résolution 120nm, Lasers 405/488/561/640nm"

2. **Créer une réservation**
   - Date: Aujourd'hui
   - Heure: 14:00 - 16:00
   - Objectif: "Imagerie cellules HeLa marquées GFP"
   - Notes: "Besoin de l'objectif 63x"

3. **Vérifier dans le calendrier**
   - Aller dans la vue "Calendrier"
   - Voir la réservation confirmée

## 🎉 C'est Tout!

Le module est prêt à l'emploi. Profitez de toutes les fonctionnalités!

---

**Questions?** Contactez les super admins:
- bastien@ols.com
- issam@ols.com
- ethan@ols.com
