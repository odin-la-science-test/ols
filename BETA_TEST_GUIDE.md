# 🧪 Guide Beta Test - Odin La Science

## 🔐 Accès Restreint

### Super Administrateurs Autorisés
- **bastien@ols.com**
- **issam@ols.com**
- **ethan@ols.com**

Seuls ces trois comptes email peuvent accéder aux fonctionnalités en beta test.

---

## 📍 Accès au Beta Hub

### URL d'accès
```
/beta-hub
```

### Depuis l'application
1. Connectez-vous avec un compte super admin
2. Naviguez vers `/beta-hub`
3. Vous verrez toutes les fonctionnalités beta disponibles

---

## 🎯 Fonctionnalités Beta Disponibles

### ✅ Stables (Prêtes pour tests)

#### 1. Cahier de Laboratoire Digital
- **Route:** `/beta/lab-notebook`
- **Statut:** Stable
- **Fonctionnalités:**
  - Création d'entrées datées
  - Système de tags
  - Recherche full-text
  - Signatures numériques
  - Sauvegarde automatique
  - Export PDF

#### 2. Protocol Builder
- **Route:** `/beta/protocol-builder`
- **Statut:** Stable
- **Fonctionnalités:**
  - Création de protocoles étape par étape
  - Templates prédéfinis
  - Durées et températures
  - Liste de matériel
  - Consignes de sécurité

#### 3. Inventaire Chimique
- **Route:** `/beta/chemical-inventory`
- **Statut:** Stable
- **Fonctionnalités:**
  - Gestion des produits chimiques
  - Numéros CAS
  - Dates d'expiration
  - Alertes automatiques
  - Classification des dangers
  - Recherche avancée

#### 4. Gestionnaire de Sauvegardes
- **Route:** `/beta/backup-manager`
- **Statut:** Stable
- **Fonctionnalités:**
  - Backup automatique (toutes les heures)
  - Export/Import de backups
  - Restauration en un clic
  - Conservation des 10 derniers backups
  - Affichage de la taille

---

### 🔨 En Développement

#### 5. Réservation d'Équipements
- **Route:** `/beta/equipment-booking`
- **Statut:** En développement
- **À venir:**
  - Calendrier interactif
  - Réservations récurrentes
  - Notifications de rappel
  - File d'attente

#### 6. Planificateur d'Expériences
- **Route:** `/beta/experiment-planner`
- **Statut:** En développement
- **À venir:**
  - Timeline visuelle (Gantt)
  - Dépendances entre étapes
  - Calcul automatique des dates
  - Export calendrier

#### 7. Gestionnaire de Citations
- **Route:** `/beta/citation-manager`
- **Statut:** En développement
- **À venir:**
  - Import PubMed/DOI
  - Génération de citations
  - Organisation par projets
  - Export BibTeX

#### 8. Studio de Visualisation
- **Route:** `/beta/data-viz-studio`
- **Statut:** En développement
- **À venir:**
  - Graphiques interactifs
  - Templates scientifiques
  - Export haute résolution
  - Statistiques intégrées

---

### 📋 Planifiées

#### 9. Suivi d'Échantillons
- **Route:** `/beta/sample-tracker`
- **Statut:** Planifié
- **Prévu:**
  - QR codes uniques
  - Scan webcam/mobile
  - Historique complet
  - Localisation temps réel

#### 10. Sécurité du Laboratoire
- **Route:** `/beta/lab-safety`
- **Statut:** Planifié
- **Prévu:**
  - Checklists quotidiennes
  - Fiches de sécurité (MSDS)
  - Procédures d'urgence
  - Reporting d'incidents

---

## 🧪 Comment Tester

### 1. Accéder au Beta Hub
```typescript
// Naviguez vers
/beta-hub
```

### 2. Sélectionner une Fonctionnalité
- Cliquez sur une carte de fonctionnalité
- Vous serez redirigé vers la page correspondante
- Un badge "BETA TEST" apparaît en haut à droite

### 3. Tester Toutes les Fonctions
- Essayez toutes les actions possibles
- Testez les cas limites
- Vérifiez la sauvegarde des données
- Testez sur différents navigateurs

### 4. Signaler les Bugs
Notez:
- Quelle fonctionnalité
- Quelle action effectuée
- Résultat attendu vs obtenu
- Navigateur et version
- Captures d'écran si possible

---

## 🔒 Sécurité

### Vérification d'Accès
Le système vérifie automatiquement:
1. L'utilisateur est connecté
2. L'email est dans la liste des super admins
3. Redirection automatique si accès refusé

### Code de Vérification
```typescript
// src/utils/betaAccess.ts
const SUPER_ADMIN_EMAILS = [
  'bastien@ols.com',
  'issam@ols.com',
  'ethan@ols.com'
];

export const checkBetaAccess = (): boolean => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return false;
  
  try {
    if (currentUser.includes('@')) {
      return SUPER_ADMIN_EMAILS.includes(currentUser.toLowerCase());
    }
    const user = JSON.parse(currentUser);
    const email = user.email || user.username || currentUser;
    return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
  } catch {
    return SUPER_ADMIN_EMAILS.includes(currentUser.toLowerCase());
  }
};
```

---

## 📊 Statistiques Beta

Le Beta Hub affiche:
- **Nombre total** de fonctionnalités
- **Fonctionnalités stables** (prêtes)
- **En développement** (en cours)
- **Planifiées** (à venir)

---

## 🐛 Reporting de Bugs

### Format de Rapport
```markdown
**Fonctionnalité:** [Nom]
**Action:** [Ce que vous faisiez]
**Attendu:** [Ce qui devrait se passer]
**Obtenu:** [Ce qui s'est passé]
**Navigateur:** [Chrome/Firefox/Safari + version]
**Reproductible:** [Oui/Non]
**Captures:** [Lien vers images]
```

### Où Signaler
- GitHub Issues (privé)
- Email: beta@odinlascience.com
- Slack: #beta-testing

---

## 💡 Suggestions d'Amélioration

Vos retours sont précieux! N'hésitez pas à suggérer:
- Nouvelles fonctionnalités
- Améliorations UX/UI
- Optimisations de performance
- Intégrations avec d'autres outils

---

## 🚀 Roadmap

### Phase 1 (Actuelle)
- ✅ Cahier de labo
- ✅ Protocol Builder
- ✅ Inventaire chimique
- ✅ Backup Manager

### Phase 2 (Q2 2026)
- 🔨 Réservation équipements
- 🔨 Planificateur expériences
- 🔨 Gestionnaire citations
- 🔨 Studio visualisation

### Phase 3 (Q3 2026)
- 📋 Suivi échantillons
- 📋 Sécurité labo
- 📋 Lab Wiki
- 📋 Freezer Map 3D

---

## 📞 Contact

### Équipe Beta Test
- **Bastien** - Lead Developer
- **Issam** - UX/UI Designer
- **Ethan** - QA Engineer

### Support
- Email: beta@odinlascience.com
- Slack: #beta-testing
- GitHub: odin-la-science-test/ols

---

## 📝 Notes Importantes

1. **Données de Test:** Utilisez des données de test, pas de vraies données sensibles
2. **Sauvegarde:** Les données beta peuvent être effacées lors des mises à jour
3. **Confidentialité:** Ne partagez pas les fonctionnalités beta publiquement
4. **Feedback:** Plus vous testez, mieux c'est!

---

**Version:** Beta 1.0  
**Date:** 2026-02-25  
**Dernière mise à jour:** 2026-02-25
