# Script pour tester les nouveaux thèmes
Write-Host "=== Test des Nouveaux Themes ===" -ForegroundColor Cyan
Write-Host ""

# Nettoyer le cache du navigateur
Write-Host "Nettoyage du cache..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
}

# Rebuild
Write-Host "Rebuild de l'application..." -ForegroundColor Yellow
npm run build

# Lancer l'application
Write-Host ""
Write-Host "Lancement de l'application..." -ForegroundColor Green
Write-Host ""
Write-Host "Pour tester les nouveaux themes:" -ForegroundColor Cyan
Write-Host "1. Allez dans Account ou Settings" -ForegroundColor White
Write-Host "2. Section 'Apparence'" -ForegroundColor White
Write-Host "3. Selectionnez:" -ForegroundColor White
Write-Host "   - Medical Professional (blanc/bleu medical)" -ForegroundColor White
Write-Host "   - Dark Laboratory (noir/vert phosphorescent)" -ForegroundColor White
Write-Host ""

npm run dev
