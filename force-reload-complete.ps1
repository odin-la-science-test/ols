Write-Host "RECHARGEMENT COMPLET DU SYSTEME DE CONNEXION" -ForegroundColor Cyan
Write-Host ""

# 1. Nettoyer le cache Vite
Write-Host "1. Nettoyage du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   Cache Vite supprime" -ForegroundColor Green
} else {
    Write-Host "   Pas de cache Vite a supprimer" -ForegroundColor Gray
}

# 2. Nettoyer le cache des navigateurs
Write-Host ""
Write-Host "2. Nettoyage du cache des navigateurs..." -ForegroundColor Yellow
& ./clear-browser-cache.ps1

# 3. Vérifier le fichier LoginSimple.tsx
Write-Host ""
Write-Host "3. Verification de LoginSimple.tsx..." -ForegroundColor Yellow
$lines = (Get-Content "src/pages/LoginSimple.tsx" | Measure-Object -Line).Lines
$lastLine = Get-Content "src/pages/LoginSimple.tsx" | Select-Object -Last 1

Write-Host "   Fichier LoginSimple.tsx: $lines lignes" -ForegroundColor Green
Write-Host "   Derniere ligne: $lastLine" -ForegroundColor Green

# 4. Instructions finales
Write-Host ""
Write-Host "NETTOYAGE TERMINE !" -ForegroundColor Green
Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host "   1. Ouvrir votre navigateur" -ForegroundColor White
Write-Host "   2. Aller sur http://localhost:3001/login" -ForegroundColor White
Write-Host "   3. Appuyer sur Ctrl+Shift+R (hard refresh)" -ForegroundColor Yellow
Write-Host "   4. Tester la connexion avec :" -ForegroundColor White
Write-Host "      Email: ethan@ols.com" -ForegroundColor Cyan
Write-Host "      Password: ethan123" -ForegroundColor Cyan
Write-Host "      Code: 1234" -ForegroundColor Cyan
Write-Host ""
Write-Host "ANIMATIONS A VERIFIER :" -ForegroundColor Magenta
Write-Host "   - Orbes flottants en arriere-plan" -ForegroundColor White
Write-Host "   - Panneau bleu qui glisse vers la droite a l'etape 2" -ForegroundColor White
Write-Host "   - Transitions fluides entre les etapes" -ForegroundColor White
Write-Host "   - Effets glassmorphism sur les inputs" -ForegroundColor White
Write-Host ""
