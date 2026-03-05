# Script pour recharger la page de login avec cache vide
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RECHARGEMENT PAGE LOGIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ouverture de la page de login..." -ForegroundColor Yellow
Write-Host ""

# Ouvrir la page de login
Start-Process "http://localhost:3001/login"

Write-Host "Page ouverte!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "  Faites Ctrl+Shift+R dans le navigateur" -ForegroundColor Yellow
Write-Host "  pour vider le cache et voir les changements!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comptes de test:" -ForegroundColor Cyan
Write-Host "  Email: ethan@ols.com" -ForegroundColor White
Write-Host "  Password: ethan123" -ForegroundColor White
Write-Host "  Code: 1234" -ForegroundColor White
Write-Host ""
Write-Host "Animation attendue:" -ForegroundColor Cyan
Write-Host "  1. Formulaire a GAUCHE + Panneau bleu a DROITE" -ForegroundColor White
Write-Host "  2. Cliquez sur 'Continuer'" -ForegroundColor White
Write-Host "  3. Le panneau bleu glisse vers la GAUCHE" -ForegroundColor White
Write-Host "  4. Le formulaire se deplace vers la DROITE" -ForegroundColor White
Write-Host ""
