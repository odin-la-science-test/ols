# 🚀 Guide Rapide - Chemical Inventory V2

## ✅ C'est Prêt !

Toutes les améliorations ont été implémentées. Voici comment utiliser la nouvelle version.

## 🎯 Accès Rapide

1. Lance l'application : `npm run dev`
2. Connecte-toi
3. Va sur **Beta Hub** (`/beta`)
4. Clique sur **Chemical Inventory**

## 🆕 Nouvelles Fonctionnalités

### 📊 Dashboard Interactif
- **5 KPIs cliquables** en haut de la page
- Clique sur un KPI pour filtrer automatiquement
- Exemple : Clique sur "Stock Faible" → affiche uniquement les produits en stock bas

### 🔍 Recherche Puissante
- Tape dans la barre de recherche
- Recherche dans : nom, CAS, formule, fournisseur, lot
- Résultats en temps réel

### 🎛️ Filtres Avancés
- Clique sur **"Filtres"** pour ouvrir le panneau
- **Catégories** : Sélectionne plusieurs catégories
- **Statuts** : OK, Stock bas, Expire bientôt, Expiré
- **Dangers** : Sélectionne les pictogrammes GHS
- Badge avec le nombre de filtres actifs
- Bouton **"Réinitialiser"** pour tout effacer

### 📋 Deux Modes d'Affichage
- **Mode Grille** : Cartes visuelles avec statuts colorés
- **Mode Table** : Vue tableau compacte
- Bouton de basculement en haut à droite

### 🔄 Tri Dynamique
- En mode table, clique sur les en-têtes de colonnes
- Tri par : Nom, Quantité, Date d'expiration
- Clique à nouveau pour inverser l'ordre

### ➕ Gestion des Produits

#### Ajouter un Produit
1. Clique sur **"Ajouter"**
2. Remplis le formulaire (nom et CAS minimum)
3. Clique sur **"Sauvegarder"**

#### Modifier un Produit
- **Mode Grille** : Clique sur la carte
- **Mode Table** : Clique sur la ligne
- Modal d'édition s'ouvre
- Modifie les champs
- Clique sur **"Sauvegarder"**

#### Actions Rapides
- **➕** : Ajouter 10 unités au stock
- **➖** : Retirer 10 unités du stock
- **📋** : Dupliquer le produit
- **🗑️** : Supprimer le produit

### 📥 Export
- Clique sur **"Export CSV"**
- Fichier téléchargé avec toutes les données
- Format : `inventaire-chimique-YYYY-MM-DD.csv`

## 🎨 Codes Couleur

### Statuts
- 🟢 **Vert** : Tout va bien
- 🟡 **Orange** : Stock bas OU expire bientôt
- 🔴 **Rouge** : Expiré

### Catégories
- 🔵 **Bleu** : Solvants
- 🔴 **Rouge** : Acides
- 🟣 **Violet** : Bases
- 🟢 **Vert** : Sels
- 🟠 **Orange** : Réactifs
- 🌸 **Rose** : Indicateurs
- 🔷 **Cyan** : Tampons
- ⚫ **Gris** : Autres

## 📝 Champs Disponibles

### Informations de Base
- Nom du produit *
- Numéro CAS *
- Formule chimique
- Catégorie *

### Quantité
- Quantité actuelle *
- Unité (mL, L, g, kg, mg, µL, µg, unités)
- Stock minimum (seuil d'alerte)

### Dates
- Date d'expiration
- Date de réception

### Fournisseur
- Nom du fournisseur
- Numéro de lot

### Financier
- Prix unitaire (€)
- Masse molaire (g/mol)

### Localisation (4 niveaux)
- Bâtiment
- Salle/Labo
- Armoire/Étagère
- Position exacte

### Sécurité
- 9 pictogrammes GHS disponibles
- Multi-sélection possible

### Notes
- Champ libre pour commentaires

## 💡 Astuces

### Workflow Rapide
1. **Recherche** → Tape quelques lettres
2. **Filtre** → Sélectionne une catégorie
3. **Tri** → Clique sur "Quantité" pour voir les stocks bas
4. **Action** → Ajuste le stock directement

### Gestion des Alertes
1. Clique sur le KPI **"Stock Faible"**
2. Tous les produits en stock bas s'affichent
3. Ajuste les stocks ou commande

### Suivi des Expirations
1. Clique sur le KPI **"Expire Bientôt"**
2. Vois tous les produits qui expirent dans 30 jours
3. Planifie l'utilisation ou le remplacement

### Export pour Inventaire
1. Applique les filtres souhaités
2. Clique sur **"Export CSV"**
3. Ouvre dans Excel
4. Imprime ou partage

## 🔧 Paramètres Personnalisables

### Seuil d'Alerte
- Définis le **Stock minimum** pour chaque produit
- Alerte automatique quand stock < minimum

### Délai d'Expiration
- Produits "Expire bientôt" = moins de 30 jours
- Modifiable dans le code si besoin

### Ajustement de Stock
- Par défaut : +/- 10 unités
- Modifiable dans le code si besoin

## 📊 Statistiques Disponibles

### KPIs Principaux
- **Total Produits** : Nombre total dans l'inventaire
- **Stock Faible** : Produits sous le seuil minimum
- **Expire Bientôt** : Produits expirant dans 30 jours
- **Expirés** : Produits déjà expirés
- **Valeur Totale** : Somme de (prix × quantité)

### Statistiques Détaillées
- Répartition par catégorie
- Répartition par danger
- Répartition par localisation

## 🆘 Dépannage

### Mes données V1 ont disparu ?
Non ! Elles sont toujours là. La V2 utilise un stockage séparé (`chemical_inventory_v2`). Les données V1 sont dans `chemical_inventory`.

### Comment migrer mes données ?
Automatique ! Au premier lancement, la V2 charge les données V1 si aucune donnée V2 n'existe.

### Les filtres ne fonctionnent pas ?
Vérifie que tu as bien cliqué sur **"Filtres"** pour ouvrir le panneau. Les filtres sont dans le panneau dépliable.

### Le tri ne fonctionne pas ?
Le tri fonctionne uniquement en **mode Table**. Bascule vers le mode table avec le bouton en haut à droite.

### L'export est vide ?
L'export exporte TOUS les produits, pas seulement les filtrés. C'est normal.

## 🎯 Prochaines Étapes

### Utilisation Quotidienne
1. Ajoute tes produits existants
2. Définis les stocks minimums
3. Renseigne les dates d'expiration
4. Utilise les filtres pour gérer

### Optimisation
1. Organise par localisation
2. Utilise les catégories
3. Ajoute les pictogrammes de danger
4. Renseigne les prix pour le suivi financier

### Maintenance
1. Vérifie régulièrement les KPIs
2. Ajuste les stocks après utilisation
3. Commande quand stock bas
4. Retire les produits expirés

## 📚 Documentation Complète

Pour plus de détails, consulte :
- **CHEMICAL_INVENTORY_V2_COMPLETE.md** : Documentation technique complète
- **CHEMICAL_INVENTORY_AMELIORATIONS_TERMINEES.md** : Liste des améliorations

## 🎉 Profite !

Tu as maintenant un système d'inventaire chimique professionnel et complet !

**Questions ?** Consulte la documentation ou demande de l'aide.

---

**Version** : 2.0
**Date** : Mars 2026
**Statut** : ✅ Production Ready
