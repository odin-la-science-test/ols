# Script de build de l'application desktop
param(
    [string]$Platform = "current"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Build Application Desktop - OLS           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Plateforme: $Platform" -ForegroundColor Yellow
Write-Host ""

# Vérifier que les dépendances sont installées
if (-not (Test-Path "node_modules/electron")) {
    Write-Host "❌ Electron n'est pas installé!" -ForegroundColor Red
    Write-Host "Exécutez d'abord: .\install-electron.ps1" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le dossier build existe
if (-not (Test-Path "build")) {
    Write-Host "⚠️  Le dossier 'build/' n'existe pas" -ForegroundColor Yellow
    Write-Host "Création du dossier..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "build" | Out-Null
}

# Vérifier les icônes
$iconsOk = $true
if ($Platform -eq "win" -or $Platform -eq "current" -or $Platform -eq "all") {
    if (-not (Test-Path "build/icon.ico")) {
        Write-Host "⚠️  Icône Windows manquante: build/icon.ico" -ForegroundColor Yellow
        $iconsOk = $false
    }
}

if (-not $iconsOk) {
    Write-Host ""
    Write-Host "Voulez-vous continuer sans les icônes? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Build annulé" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔨 Build en cours..." -ForegroundColor Cyan
Write-Host ""

# Build selon la plateforme
switch ($Platform) {
    "win" {
        Write-Host "Building for Windows..." -ForegroundColor Green
        npm run electron:build:win
    }
    "mac" {
        Write-Host "Building for Mac..." -ForegroundColor Green
        npm run electron:build:mac
    }
    "linux" {
        Write-Host "Building for Linux..." -ForegroundColor Green
        npm run electron:build:linux
    }
    "all" {
        Write-Host "Building for all platforms..." -ForegroundColor Green
        npm run electron:build:all
    }
    default {
        Write-Host "Building for current platform..." -ForegroundColor Green
        npm run electron:build
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║            Build réussi! ✓                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Les fichiers sont dans le dossier 'release/'" -ForegroundColor Yellow
    Write-Host ""
    
    # Lister les fichiers créés
    if (Test-Path "release") {
        Write-Host "Fichiers créés:" -ForegroundColor Cyan
        Get-ChildItem "release" -File | ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  - $($_.Name) ($size MB)" -ForegroundColor White
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ Build échoué!" -ForegroundColor Red
    Write-Host "Vérifiez les erreurs ci-dessus" -ForegroundColor Yellow
}

Write-Host ""
