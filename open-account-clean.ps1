# Script pour ouvrir Account avec cache vidé
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Ouverture Account Mobile" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: http://localhost:3006/account" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Après ouverture du navigateur:" -ForegroundColor Red
Write-Host "1. Appuyez sur F12 pour ouvrir DevTools" -ForegroundColor White
Write-Host "2. Clic DROIT sur le bouton Actualiser" -ForegroundColor White
Write-Host "3. Sélectionnez 'Vider le cache et actualiser'" -ForegroundColor White
Write-Host "4. Activez le mode mobile (Toggle device toolbar)" -ForegroundColor White
Write-Host ""
Write-Host "Ou utilisez: Ctrl+Shift+R pour forcer le rechargement" -ForegroundColor Yellow
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Attendre 2 secondes
Start-Sleep -Seconds 2

# Ouvrir le navigateur
Start-Process "http://localhost:3006/account"

Write-Host ""
Write-Host "Navigateur ouvert!" -ForegroundColor Green
