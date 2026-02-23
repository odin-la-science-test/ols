# Script de test complet pour l'application desktop
# Vérifie que tout est en place

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Test Application Desktop - Odin La Science" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test 1: Node.js installé
Write-Host "🔍 Test 1: Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js non installé!" -ForegroundColor Red
    $allGood = $false
}

# Test 2: Dépendances npm
Write-Host "🔍 Test 2: Dépendances npm..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules présent" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules manquant - Exécutez: npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Test 3: Fichier de lancement
Write-Host "🔍 Test 3: Fichier de lancement..." -ForegroundColor Yellow
if (Test-Path "Lancer-OLS.vbs") {
    Write-Host "   ✅ Lancer-OLS.vbs présent" -ForegroundColor Green
} else {
    Write-Host "   ❌ Lancer-OLS.vbs manquant!" -ForegroundColor Red
    $allGood = $false
}

# Test 4: Configuration Electron
Write-Host "🔍 Test 4: Configuration Electron..." -ForegroundColor Yellow
if (Test-Path "electron/main.js") {
    $mainJs = Get-Content "electron/main.js" -Raw
    if ($mainJs -match "ols-scientist.vercel.app") {
        Write-Host "   ✅ URL Vercel configurée" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  URL Vercel non trouvée" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ electron/main.js manquant!" -ForegroundColor Red
    $allGood = $false
}

# Test 5: Composants desktop
Write-Host "🔍 Test 5: Composants desktop..." -ForegroundColor Yellow
$components = @(
    "src/hooks/useElectron.ts",
    "src/components/DesktopLayout.tsx",
    "src/components/ElectronWrapper.tsx",
    "src/pages/DesktopLogin.tsx"
)
$missingComponents = @()
foreach ($comp in $components) {
    if (-not (Test-Path $comp)) {
        $missingComponents += $comp
    }
}
if ($missingComponents.Count -eq 0) {
    Write-Host "   ✅ Tous les composants présents" -ForegroundColor Green
} else {
    Write-Host "   ❌ Composants manquants:" -ForegroundColor Red
    foreach ($comp in $missingComponents) {
        Write-Host "      - $comp" -ForegroundColor Red
    }
    $allGood = $false
}

# Test 6: Intégration dans App.tsx
Write-Host "🔍 Test 6: Intégration App.tsx..." -ForegroundColor Yellow
if (Test-Path "src/App.tsx") {
    $appTsx = Get-Content "src/App.tsx" -Raw
    if ($appTsx -match "ElectronWrapper" -and $appTsx -match "DesktopLogin") {
        Write-Host "   ✅ ElectronWrapper et DesktopLogin intégrés" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Intégration incomplète" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ src/App.tsx manquant!" -ForegroundColor Red
    $allGood = $false
}

# Test 7: Dossier build
Write-Host "🔍 Test 7: Dossier build..." -ForegroundColor Yellow
if (Test-Path "build") {
    Write-Host "   ✅ Dossier build présent" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Dossier build manquant (normal)" -ForegroundColor Yellow
}

# Test 8: Icône
Write-Host "🔍 Test 8: Icône..." -ForegroundColor Yellow
if (Test-Path "build/icon.ico") {
    Write-Host "   ✅ Icône .ico présente" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Icône .ico manquante - Créez-la avec: .\build-icon.ps1" -ForegroundColor Yellow
}

# Test 9: Scripts PowerShell
Write-Host "🔍 Test 9: Scripts PowerShell..." -ForegroundColor Yellow
$scripts = @(
    "create-shortcut.ps1",
    "build-icon.ps1",
    "build-desktop-app.ps1"
)
$missingScripts = @()
foreach ($script in $scripts) {
    if (-not (Test-Path $script)) {
        $missingScripts += $script
    }
}
if ($missingScripts.Count -eq 0) {
    Write-Host "   ✅ Tous les scripts présents" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Scripts manquants:" -ForegroundColor Yellow
    foreach ($script in $missingScripts) {
        Write-Host "      - $script" -ForegroundColor Yellow
    }
}

# Test 10: Connexion internet
Write-Host "🔍 Test 10: Connexion Vercel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://ols-scientist.vercel.app" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Serveur Vercel accessible" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Serveur Vercel non accessible (vérifiez votre connexion)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ TOUS LES TESTS RÉUSSIS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Vous pouvez lancer l'application:" -ForegroundColor Cyan
    Write-Host "   1. Double-clic sur Lancer-OLS.vbs" -ForegroundColor White
    Write-Host "   2. Ou exécutez: npm run electron:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Prochaines étapes recommandées:" -ForegroundColor Cyan
    Write-Host "   1. Créer l'icône: .\build-icon.ps1" -ForegroundColor White
    Write-Host "   2. Créer le raccourci: .\create-shortcut.ps1" -ForegroundColor White
    Write-Host "   3. Build l'exécutable: .\build-desktop-app.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️  CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Actions requises:" -ForegroundColor Cyan
    Write-Host "   1. Installez Node.js si nécessaire" -ForegroundColor White
    Write-Host "   2. Exécutez: npm install" -ForegroundColor White
    Write-Host "   3. Vérifiez les fichiers manquants ci-dessus" -ForegroundColor White
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

pause
