# Test des raccourcis sur différentes pages
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST RACCOURCIS PAR PAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PAGES SANS RACCOURCIS:" -ForegroundColor Red
Write-Host "  / (Landing Page)" -ForegroundColor White
Write-Host "  /login (Page de connexion)" -ForegroundColor White
Write-Host ""

Write-Host "PAGES AVEC RACCOURCIS:" -ForegroundColor Green
Write-Host "  /home (Après connexion)" -ForegroundColor White
Write-Host "  /munin (Après connexion)" -ForegroundColor White
Write-Host "  /hugin (Après connexion)" -ForegroundColor White
Write-Host "  /account (Après connexion)" -ForegroundColor White
Write-Host "  Toutes les autres pages protégées" -ForegroundColor White
Write-Host ""

Write-Host "TESTS A EFFECTUER:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Landing Page (/):" -ForegroundColor Cyan
Write-Host "   - Ouvrir http://localhost:3001/" -ForegroundColor White
Write-Host "   - Essayer Ctrl+K → Ne devrait rien faire" -ForegroundColor White
Write-Host "   - Essayer Ctrl+H → Ne devrait rien faire" -ForegroundColor White
Write-Host ""

Write-Host "2. Page Login (/login):" -ForegroundColor Cyan
Write-Host "   - Ouvrir http://localhost:3001/login" -ForegroundColor White
Write-Host "   - Essayer Ctrl+K → Ne devrait rien faire" -ForegroundColor White
Write-Host "   - Essayer Ctrl+H → Ne devrait rien faire" -ForegroundColor White
Write-Host ""

Write-Host "3. Page Home (/home) - Après connexion:" -ForegroundColor Cyan
Write-Host "   - Se connecter avec ethan@ols.com / ethan123 / 1234" -ForegroundColor White
Write-Host "   - Essayer Ctrl+K → Palette s'ouvre" -ForegroundColor White
Write-Host "   - Essayer Ctrl+H → Reste sur Home" -ForegroundColor White
Write-Host "   - Essayer Ctrl+M → Va vers Munin" -ForegroundColor White
Write-Host ""

Write-Host "CONDITION COMPLETE:" -ForegroundColor Yellow
Write-Host "  isLoggedIn && pathname !== '/' && pathname !== '/login'" -ForegroundColor White
Write-Host ""

Write-Host "Ouverture de la landing page..." -ForegroundColor Green
Start-Process "http://localhost:3001/"

Write-Host ""
Write-Host "Faites Ctrl+Shift+R pour vider le cache!" -ForegroundColor Red
Write-Host ""
