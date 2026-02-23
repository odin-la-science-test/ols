# Script FINAL pour tester Account Mobile
# Ce script ouvre une page qui vide le cache puis redirige

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TEST ACCOUNT MOBILE - SANS CACHE    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Serveur: http://localhost:3006" -ForegroundColor Green
Write-Host "✓ Page de test: /clear-cache-redirect.html" -ForegroundColor Green
Write-Host ""

Write-Host "Cette page va:" -ForegroundColor Yellow
Write-Host "  1. Vider le cache du navigateur" -ForegroundColor White
Write-Host "  2. Rediriger vers /account" -ForegroundColor White
Write-Host "  3. Forcer le rechargement" -ForegroundColor White
Write-Host ""

Write-Host "Ouverture du navigateur..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# Ouvrir la page de redirection
Start-Process "http://localhost:3006/clear-cache-redirect.html"

Write-Host ""
Write-Host "✓ Navigateur ouvert!" -ForegroundColor Green
Write-Host ""
Write-Host "Une fois sur la page Account:" -ForegroundColor Yellow
Write-Host "  • Appuyez sur F12" -ForegroundColor Gray
Write-Host "  • Cliquez sur l'icône téléphone (Toggle device toolbar)" -ForegroundColor Gray
Write-Host "  • Vous devriez voir le design mobile!" -ForegroundColor Gray
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            BON TEST! 🚀                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
