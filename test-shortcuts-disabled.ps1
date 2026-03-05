# Test de désactivation des raccourcis avant connexion
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST RACCOURCIS DESACTIVES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "VERIFICATION:" -ForegroundColor Yellow
Write-Host ""

# Vérifier le code dans App.tsx
$appContent = Get-Content "src/App.tsx" -Raw

if ($appContent -match "localStorage\.getItem\('isLoggedIn'\) === 'true'.*ShortcutManager") {
    Write-Host "  OK  Raccourcis conditionnés à la connexion" -ForegroundColor Green
} else {
    Write-Host "  ERREUR  Raccourcis non conditionnés!" -ForegroundColor Red
}

Write-Host ""
Write-Host "COMPOSANTS DESACTIVES AVANT CONNEXION:" -ForegroundColor Yellow
Write-Host "  - ShortcutManager (Ctrl+K, etc.)" -ForegroundColor White
Write-Host "  - KeyboardShortcuts (Aide raccourcis)" -ForegroundColor White
Write-Host "  - CommandPalette (Palette de commandes)" -ForegroundColor White
Write-Host "  - QuickNotes (Notes rapides)" -ForegroundColor White
Write-Host ""

Write-Host "COMPOSANTS ACTIFS APRES CONNEXION:" -ForegroundColor Green
Write-Host "  - Tous les raccourcis clavier" -ForegroundColor White
Write-Host "  - Palette de commandes (Ctrl+K)" -ForegroundColor White
Write-Host "  - Notes rapides" -ForegroundColor White
Write-Host ""

Write-Host "POUR TESTER:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Avant connexion (http://localhost:3001/login):" -ForegroundColor Yellow
Write-Host "   - Essayez Ctrl+K → Ne devrait rien faire" -ForegroundColor White
Write-Host "   - Essayez Ctrl+H → Ne devrait rien faire" -ForegroundColor White
Write-Host "   - Essayez Ctrl+M → Ne devrait rien faire" -ForegroundColor White
Write-Host ""
Write-Host "2. Après connexion (http://localhost:3001/home):" -ForegroundColor Yellow
Write-Host "   - Essayez Ctrl+K → Palette de commandes s'ouvre" -ForegroundColor White
Write-Host "   - Essayez Ctrl+H → Navigation vers Home" -ForegroundColor White
Write-Host "   - Essayez Ctrl+M → Navigation vers Munin" -ForegroundColor White
Write-Host ""

Write-Host "Ouverture de la page de login..." -ForegroundColor Green
Start-Process "http://localhost:3001/login"

Write-Host ""
Write-Host "N'oubliez pas: Ctrl+Shift+R pour vider le cache!" -ForegroundColor Red
Write-Host ""
