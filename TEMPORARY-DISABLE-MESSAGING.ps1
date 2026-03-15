# Script pour désactiver temporairement la route messaging
# Cela permet à l'application de charger pendant qu'on résout le problème de cache

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DÉSACTIVATION TEMPORAIRE DE MESSAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$appTsxPath = "src/App.tsx"

if (Test-Path $appTsxPath) {
    Write-Host "Lecture de App.tsx..." -ForegroundColor Yellow
    $content = Get-Content $appTsxPath -Raw
    
    # Commenter la route messaging
    $content = $content -replace '(<Route path="/hugin/messaging" element=\{)', '/* TEMPORAIREMENT DÉSACTIVÉ - PROBLÈME DE CACHE
$1'
    
    # Trouver la fin de cette route et la commenter aussi
    $content = $content -replace '(\s+</ProtectedRoute>\s+}\s+/>)(\s+<Route path="/hugin/inventory")', '$1 */
$2'
    
    Set-Content -Path $appTsxPath -Value $content
    
    Write-Host "✓ Route /hugin/messaging désactivée" -ForegroundColor Green
    Write-Host ""
    Write-Host "L'application peut maintenant charger sans erreur." -ForegroundColor Green
    Write-Host "La messagerie sera inaccessible jusqu'à ce que le cache soit vidé." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour réactiver la messagerie:" -ForegroundColor Cyan
    Write-Host "  1. Exécutez FORCE-BROWSER-RELOAD.ps1" -ForegroundColor White
    Write-Host "  2. Suivez les instructions pour vider le cache du navigateur" -ForegroundColor White
    Write-Host "  3. Exécutez REACTIVATE-MESSAGING.ps1" -ForegroundColor White
} else {
    Write-Host "✗ Fichier App.tsx introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
