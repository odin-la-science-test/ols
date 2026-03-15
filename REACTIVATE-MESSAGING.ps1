# Script pour réactiver la route messaging après avoir vidé le cache

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RÉACTIVATION DE LA ROUTE MESSAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$appTsxPath = "src/App.tsx"

if (Test-Path $appTsxPath) {
    Write-Host "Lecture de App.tsx..." -ForegroundColor Yellow
    $content = Get-Content $appTsxPath -Raw
    
    # Décommenter la route messaging
    $content = $content -replace '/\* TEMPORAIREMENT DÉSACTIVÉ - PROBLÈME DE CACHE\s+', ''
    $content = $content -replace '\s+\*/\s+(<Route path="/hugin/inventory")', '
$1'
    
    Set-Content -Path $appTsxPath -Value $content
    
    Write-Host "✓ Route /hugin/messaging réactivée" -ForegroundColor Green
    Write-Host ""
    Write-Host "La messagerie est maintenant accessible à /hugin/messaging" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier App.tsx introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
