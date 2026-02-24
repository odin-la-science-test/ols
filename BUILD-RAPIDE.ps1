# Script de build rapide - Sans pause
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BUILD ODIN LA SCIENCE - DESKTOP APP  " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Build Web
Write-Host "[1/2] Build de l'application web..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build web" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build web terminé" -ForegroundColor Green
Write-Host ""

# Étape 2: Build Electron
Write-Host "[2/2] Création du package Windows..." -ForegroundColor Yellow
npm run electron:build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build Electron" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "         BUILD TERMINÉ AVEC SUCCÈS      " -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Vérifier le fichier
$exeFile = "release\Odin-La-Science-Setup.exe"
if (Test-Path $exeFile) {
    $fileSize = [math]::Round((Get-Item $exeFile).Length / 1MB, 2)
    Write-Host "📦 Fichier créé:" -ForegroundColor Cyan
    Write-Host "   $exeFile" -ForegroundColor White
    Write-Host "   Taille: $fileSize MB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📤 PROCHAINE ÉTAPE:" -ForegroundColor Yellow
    Write-Host "   1. Va sur: https://github.com/odin-la-science-test/ols/releases/new" -ForegroundColor White
    Write-Host "   2. Tag: v1.0.0" -ForegroundColor White
    Write-Host "   3. Upload: $exeFile" -ForegroundColor White
    Write-Host "   4. Publie la release" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Le téléchargement automatique fonctionnera ensuite!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Fichier non trouvé: $exeFile" -ForegroundColor Yellow
    Write-Host "   Vérifie le dossier release/" -ForegroundColor Gray
    Write-Host ""
}
