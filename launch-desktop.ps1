# Script pour lancer Odin La Science en tant que logiciel desktop
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Lancement Odin La Science - Desktop App     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Electron est installé
if (-not (Test-Path "node_modules/electron")) {
    Write-Host "⚠️  Electron n'est pas installé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation d'Electron..." -ForegroundColor Cyan
    Write-Host ""
    
    # Exécuter le script d'installation
    & .\install-electron.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Lancement de l'application desktop..." -ForegroundColor Green
Write-Host ""
Write-Host "Patientez quelques secondes..." -ForegroundColor Yellow
Write-Host ""

# Lancer l'application
npm run electron:dev

Write-Host ""
