# Script de build avec nettoyage complet

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BUILD PROPRE DE L'APPLICATION DESKTOP" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Nettoyage
Write-Host "[1/4] Nettoyage des anciens builds..." -ForegroundColor Cyan

if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "  - Dossier dist/ supprime" -ForegroundColor Gray
}

if (Test-Path "release") {
    Remove-Item -Path "release" -Recurse -Force
    Write-Host "  - Dossier release/ supprime" -ForegroundColor Gray
}

Write-Host "[OK] Nettoyage termine" -ForegroundColor Green
Write-Host ""

# Etape 2: Reinstaller electron
Write-Host "[2/4] Reinstallation d'Electron..." -ForegroundColor Cyan
npm install electron electron-builder --save-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Installation echouee" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Electron reinstalle" -ForegroundColor Green
Write-Host ""

# Etape 3: Build React
Write-Host "[3/4] Build React..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Build React echoue" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build React termine" -ForegroundColor Green
Write-Host ""

# Etape 4: Build Electron (version portable d'abord, plus simple)
Write-Host "[4/4] Build Electron (version portable)..." -ForegroundColor Cyan
npm run electron:build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Build Electron echoue" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essai d'une methode alternative..." -ForegroundColor Yellow
    
    # Methode alternative: copier electron.exe manuellement
    if (Test-Path "node_modules\electron\dist\electron.exe") {
        Write-Host "Copie manuelle d'electron.exe..." -ForegroundColor Cyan
        
        # Creer le dossier release si necessaire
        if (-not (Test-Path "release\win-unpacked")) {
            New-Item -Path "release\win-unpacked" -ItemType Directory -Force | Out-Null
        }
        
        # Copier electron.exe
        Copy-Item "node_modules\electron\dist\electron.exe" "release\win-unpacked\OdinLaScience.exe" -Force
        
        # Copier les autres fichiers necessaires
        Copy-Item "node_modules\electron\dist\*" "release\win-unpacked\" -Recurse -Force -Exclude "electron.exe"
        
        # Copier dist
        if (Test-Path "dist") {
            Copy-Item "dist\*" "release\win-unpacked\resources\app\dist\" -Recurse -Force
        }
        
        Write-Host "[OK] Copie manuelle reussie" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] electron.exe introuvable" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  BUILD TERMINE" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Rechercher le fichier final
Write-Host "Recherche du fichier genere..." -ForegroundColor Cyan
$exeFiles = Get-ChildItem -Path "release" -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue

if ($exeFiles) {
    Write-Host ""
    Write-Host "Fichiers trouves:" -ForegroundColor Green
    foreach ($file in $exeFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  - $($file.FullName) ($size MB)" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "[!] Aucun fichier .exe trouve" -ForegroundColor Yellow
    Write-Host "Le build a peut-etre cree un dossier portable dans release/win-unpacked/" -ForegroundColor Gray
}

Write-Host ""
