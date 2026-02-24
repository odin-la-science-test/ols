# Script complet pour créer une release prête à distribuer

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Build Release - Odin La Science Desktop     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier Node.js
Write-Host "📦 Étape 1/5: Vérification Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js non installé!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 2: Installer/Vérifier les dépendances
Write-Host "📦 Étape 2/5: Dépendances..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erreur installation" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✅ Dépendances OK" -ForegroundColor Green
Write-Host ""

# Étape 3: Créer l'icône
Write-Host "🎨 Étape 3/5: Icône..." -ForegroundColor Cyan
if (-not (Test-Path "build\icon.ico")) {
    Write-Host "   Création de l'icône..." -ForegroundColor Yellow
    & ".\create-icon-simple.ps1"
}
if (Test-Path "build\icon.ico") {
    Write-Host "   ✅ Icône créée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Icône manquante (continuons quand même)" -ForegroundColor Yellow
}
Write-Host ""

# Étape 4: Build l'application
Write-Host "🔨 Étape 4/5: Build de l'application..." -ForegroundColor Cyan
Write-Host "   Cela peut prendre 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run electron:build:win

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "   ✅ Build réussi!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "   ❌ Build échoué!" -ForegroundColor Red
    Write-Host "   Vérifiez les erreurs ci-dessus" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Étape 5: Vérifier les fichiers créés
Write-Host "📋 Étape 5/5: Vérification des fichiers..." -ForegroundColor Cyan

if (Test-Path "release") {
    $setupFile = Get-ChildItem "release" -Filter "*Setup*.exe" | Select-Object -First 1
    $portableFile = Get-ChildItem "release" -Filter "*.exe" -Exclude "*Setup*" | Select-Object -First 1
    
    if ($setupFile) {
        $size = [math]::Round($setupFile.Length / 1MB, 2)
        Write-Host "   ✅ Installateur: $($setupFile.Name) ($size MB)" -ForegroundColor Green
    }
    
    if ($portableFile) {
        $size = [math]::Round($portableFile.Length / 1MB, 2)
        Write-Host "   ✅ Portable: $($portableFile.Name) ($size MB)" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Dossier release introuvable" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Résumé final
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Build Terminé avec Succès! ✓          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Fichiers prêts à distribuer dans:" -ForegroundColor Cyan
Write-Host "   release/" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1️⃣  Testez l'installateur sur un PC propre" -ForegroundColor White
Write-Host ""
Write-Host "   2️⃣  Uploadez sur GitHub Releases:" -ForegroundColor White
Write-Host "      - Allez sur votre repo GitHub" -ForegroundColor Gray
Write-Host "      - Releases → Create a new release" -ForegroundColor Gray
Write-Host "      - Uploadez le fichier Setup" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣  Partagez le lien de téléchargement!" -ForegroundColor White
Write-Host ""
Write-Host "💡 L'utilisateur final:" -ForegroundColor Yellow
Write-Host "   - Télécharge le fichier" -ForegroundColor Gray
Write-Host "   - Double-clique dessus" -ForegroundColor Gray
Write-Host "   - Installation automatique" -ForegroundColor Gray
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
