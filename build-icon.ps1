# Script pour créer l'icône .ico depuis le logo PNG
# Nécessite ImageMagick: https://imagemagick.org/script/download.php

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Création de l'icône .ico" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$sourcePng = "public\logo1.png"
$targetIco = "build\icon.ico"

# Créer le dossier build s'il n'existe pas
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
    Write-Host "✅ Dossier build créé" -ForegroundColor Green
}

# Vérifier si ImageMagick est installé
$magickInstalled = Get-Command magick -ErrorAction SilentlyContinue

if ($magickInstalled) {
    Write-Host "✅ ImageMagick détecté" -ForegroundColor Green
    Write-Host "🔄 Conversion en cours..." -ForegroundColor Yellow
    
    # Convertir PNG en ICO avec plusieurs tailles
    magick convert $sourcePng -define icon:auto-resize=256,128,64,48,32,16 $targetIco
    
    if (Test-Path $targetIco) {
        Write-Host "✅ Icône créée: $targetIco" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la création" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  ImageMagick non installé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Options pour créer l'icône:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1 - En ligne (RAPIDE):" -ForegroundColor White
    Write-Host "  1. Allez sur https://convertio.co/fr/png-ico/" -ForegroundColor Gray
    Write-Host "  2. Uploadez public\logo1.png" -ForegroundColor Gray
    Write-Host "  3. Téléchargez le .ico" -ForegroundColor Gray
    Write-Host "  4. Placez-le dans build\icon.ico" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 - Installer ImageMagick:" -ForegroundColor White
    Write-Host "  1. Téléchargez: https://imagemagick.org/script/download.php" -ForegroundColor Gray
    Write-Host "  2. Installez (cochez Add to PATH)" -ForegroundColor Gray
    Write-Host "  3. Relancez ce script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3 - Utiliser un éditeur:" -ForegroundColor White
    Write-Host "  - GIMP (gratuit)" -ForegroundColor Gray
    Write-Host "  - Paint.NET (gratuit)" -ForegroundColor Gray
    Write-Host "  - IcoFX (payant)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "💡 Icône utilisée pour:" -ForegroundColor Cyan
Write-Host "  - Exécutable .exe" -ForegroundColor White
Write-Host "  - Raccourci bureau" -ForegroundColor White
Write-Host "  - Barre des tâches" -ForegroundColor White
Write-Host "  - Installateur" -ForegroundColor White
Write-Host ""

pause
