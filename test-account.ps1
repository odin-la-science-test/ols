# Script de test pour Account mobile
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Account Mobile" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le serveur tourne sur: http://localhost:3006" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour tester:" -ForegroundColor White
Write-Host "1. Ouvrez votre navigateur" -ForegroundColor Gray
Write-Host "2. Allez sur: http://localhost:3006/account" -ForegroundColor Cyan
Write-Host "3. Ouvrez les DevTools (F12)" -ForegroundColor Gray
Write-Host "4. Activez le mode mobile (Toggle device toolbar)" -ForegroundColor Gray
Write-Host "5. Rechargez la page (Ctrl+R)" -ForegroundColor Gray
Write-Host ""
Write-Host "Si vous voyez l'ancien design:" -ForegroundColor Yellow
Write-Host "- F12 > Clic droit sur Actualiser > 'Vider le cache et actualiser'" -ForegroundColor Gray
Write-Host "- Ou utilisez Ctrl+Shift+R" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Ouvrir le navigateur
Start-Process "http://localhost:3006/account"
