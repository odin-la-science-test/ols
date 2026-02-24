# Script automatisé pour build et préparer la release
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Build Application Desktop - Odin La Science ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Node.js
Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
Write-Host ""

# 2. Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dépendances installées" -ForegroundColor Green
Write-Host ""

# 3. Créer l'icône si nécessaire
if (-not (Test-Path "build\icon.ico")) {
    Write-Host "🎨 Création de l'icône..." -ForegroundColor Cyan
    if (Test-Path "public\logo1.png") {
        # Utiliser ImageMagick si disponible
        $magickInstalled = Get-Command magick -ErrorAction SilentlyContinue
        if ($magickInstalled) {
            magick convert "public\logo1.png" -resize 256x256 "build\icon.ico"
            Write-Host "✅ Icône créée" -ForegroundColor Green
        } else {
            Write-Host "⚠️  ImageMagick non installé, icône par défaut utilisée" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# 4. Build de l'application
Write-Host "🏗️  Build de l'application..." -ForegroundColor Cyan
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build terminé" -ForegroundColor Green
Write-Host ""

# 5. Build Electron
Write-Host "📦 Création du package Electron..." -ForegroundColor Cyan
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
Write-Host ""

npm run electron:build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build Electron" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Build Terminé avec Succès! ✓        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Vérifier le fichier
$exeFile = "release\Odin-La-Science-Setup.exe"
if (Test-Path $exeFile) {
    $fileSize = [math]::Round((Get-Item $exeFile).Length / 1MB, 2)
    Write-Host "✅ Fichier créé: $exeFile" -ForegroundColor Green
    Write-Host "   Taille: $fileSize MB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📍 Prochaine étape:" -ForegroundColor Yellow
    Write-Host "   Uploadez ce fichier sur GitHub Releases" -ForegroundColor White
    Write-Host "   https://github.com/odin-la-science-test/ols/releases/new" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "⚠️  Fichier non trouvé dans release/" -ForegroundColor Yellow
    Write-Host "   Vérifiez le dossier dist/ ou release/" -ForegroundColor Gray
}
