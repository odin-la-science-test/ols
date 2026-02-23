# Script pour démarrer le serveur de développement sur le port 3005
Write-Host "Démarrage du serveur sur le port 3005..." -ForegroundColor Green

# Démarrer le serveur Vite sur le port 3005
npm run dev -- --port 3005 --host

Write-Host "`nServeur démarré!" -ForegroundColor Cyan
Write-Host "Accédez à l'application sur:" -ForegroundColor Yellow
Write-Host "  - Local:   http://localhost:3005" -ForegroundColor Green
Write-Host "  - Network: http://[votre-ip]:3005" -ForegroundColor Green
Write-Host "`nPour tester Account mobile, allez sur:" -ForegroundColor Yellow
Write-Host "  http://localhost:3005/account" -ForegroundColor Cyan
Write-Host "`nAppuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Gray
