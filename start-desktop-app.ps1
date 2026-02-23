# Script de lancement rapide de l'application desktop
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Odin La Science - Application Desktop       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Green
Write-Host ""
Write-Host "Cela va:" -ForegroundColor Yellow
Write-Host "  1. Démarrer le serveur Vite" -ForegroundColor White
Write-Host "  2. Attendre que le serveur soit prêt" -ForegroundColor White
Write-Host "  3. Lancer Electron" -ForegroundColor White
Write-Host "  4. Ouvrir une fenêtre desktop" -ForegroundColor White
Write-Host ""
Write-Host "Patientez quelques secondes..." -ForegroundColor Cyan
Write-Host ""

# Lancer l'application
npm run electron:dev
