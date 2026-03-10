# 🚨 PROBLÈME: Rien de visible en mobile

## Diagnostic

Le problème "je vois rien de nouveau" peut avoir plusieurs causes:

### 1. Cache du navigateur 🔄
Le navigateur utilise l'ancienne version en cache.

**Solution:**
```bash
# Dans Chrome
Ctrl+Shift+Delete → Cocher "Images et fichiers en cache" → Effacer

# OU forcer le rechargement
Ctrl+F5

# OU en mode incognito
Ctrl+Shift+N
```

### 2. Serveur non redémarré 🔴
Les modifications TypeScript nécessitent un redémarrage du serveur.

**Solution:**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev

# OU utiliser le script de test
./test-responsive-mobile.ps1
```

### 3. Erreurs de compilation ⚠️
Des erreurs TypeScript empêchent la compilation.

**Vérification:**
```bash
# Vérifier les erreurs
npm run build

# Ou regarder la console du serveur
# Chercher les lignes rouges avec "Error"
```

### 4. Mode responsive non activé 📱
Le navigateur n'est pas en mode mobile.

**Solution:**
1. F12 pour ouvrir DevTools
2. Ctrl+Shift+M pour activer le mode responsive
3. Sélectionner un device (iPhone, Pixel)
4. Vérifier que la largeur est < 768px

### 5. Composants non chargés 📦
Les composants responsive ne sont pas importés.

**Vérification dans la console:**
```javascript
// Ouvrir la console (F12)
// Chercher des erreurs comme:
// "Cannot find module"
// "Unexpected token"
// "Failed to fetch"
```

## Solution rapide (RECOMMANDÉ)

### Méthode 1: Script automatique
```powershell
# Exécuter le script de test
./test-responsive-mobile.ps1
```

Ce script va:
1. ✅ Arrêter tous les processus Node
2. ✅ Nettoyer le cache Vite
3. ✅ Supprimer le dossier dist
4. ✅ Vérifier que tous les fichiers existent
5. ✅ Redémarrer le serveur proprement

### Méthode 2: Manuel
```bash
# 1. Arrêter le serveur (Ctrl+C dans le terminal)

# 2. Nettoyer
rm -rf node_modules/.vite
rm -rf dist

# 3. Redémarrer
npm run dev

# 4. Vider le cache navigateur (Ctrl+Shift+Delete)

# 5. Recharger la page (Ctrl+F5)
```

## Test visuel rapide

### Page Hugin (/hugin)

**Desktop (>1024px):**
- 3 colonnes de modules
- Padding 2rem
- Logo 400x400px

**Mobile (<768px):**
- 1 colonne de modules
- Padding 1rem
- Logo plus petit
- Barre de recherche pleine largeur

### Page BetaHub (/beta-hub)

**Desktop:**
- Stats en 4 colonnes
- Features en 3 colonnes

**Mobile:**
- Stats en 2 colonnes
- Features en 1 colonne

### Page LabDashboard (/hugin/dashboard)

**Desktop:**
- KPIs en 3 colonnes
- Alertes + Accès rapide côte à côte

**Mobile:**
- KPIs en 1 colonne
- Alertes et Accès rapide empilés

## Vérification technique

### 1. Vérifier que useBreakpoint fonctionne

Ouvrir la console et taper:
```javascript
// Devrait afficher true sur mobile
window.innerWidth < 768
```

### 2. Vérifier que le CSS responsive est chargé

Dans DevTools:
1. Onglet "Elements"
2. Sélectionner un élément
3. Onglet "Computed"
4. Chercher "padding" - devrait être 1rem sur mobile

### 3. Vérifier les media queries

Dans DevTools:
1. Onglet "Sources"
2. Chercher "responsive.css"
3. Vérifier que le fichier contient les media queries

## Si rien ne fonctionne

### Rebuild complet
```bash
# Supprimer tout
rm -rf node_modules
rm -rf dist
rm -rf node_modules/.vite

# Réinstaller
npm install

# Rebuild
npm run build

# Redémarrer
npm run dev
```

### Vérifier les versions
```bash
# Node version (doit être >= 16)
node --version

# NPM version
npm --version

# Vite version
npm list vite
```

### Créer un fichier de test simple

Créer `public/test-responsive.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 20px; font-family: sans-serif; }
        .box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .box { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
            .mobile-only { display: block; }
        }
        @media (min-width: 769px) {
            .mobile-only { display: none; }
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>Test Responsive</h1>
        <p>Largeur: <span id="width"></span>px</p>
        <p class="mobile-only">🎉 MODE MOBILE ACTIF!</p>
    </div>
    <script>
        function updateWidth() {
            document.getElementById('width').textContent = window.innerWidth;
        }
        updateWidth();
        window.addEventListener('resize', updateWidth);
    </script>
</body>
</html>
```

Accéder à: `http://localhost:5173/test-responsive.html`

**Résultat attendu:**
- Desktop: Fond violet/bleu
- Mobile: Fond rose/rouge + texte "MODE MOBILE ACTIF!"

## Contact support

Si après toutes ces étapes le problème persiste:

1. Copier les erreurs de la console
2. Faire une capture d'écran
3. Noter la version de Node/NPM
4. Indiquer le navigateur utilisé

---
Date: 2026-03-09
Status: Guide de dépannage complet
