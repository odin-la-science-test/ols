# Ouvrir Account en mode navigation privée (sans cache)
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Ouverture en mode INCOGNITO" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cela va ouvrir le navigateur en mode navigation privée" -ForegroundColor Yellow
Write-Host "pour éviter tout problème de cache." -ForegroundColor Yellow
Write-Host ""

$url = "http://localhost:3006/account"

# Essayer Chrome en mode incognito
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Write-Host "Ouverture avec Chrome (mode incognito)..." -ForegroundColor Green
    Start-Process $chromePath -ArgumentList "--incognito", $url
} else {
    # Essayer Edge en mode InPrivate
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path $edgePath) {
        Write-Host "Ouverture avec Edge (mode InPrivate)..." -ForegroundColor Green
        Start-Process $edgePath -ArgumentList "-inprivate", $url
    } else {
        # Fallback: navigateur par défaut
        Write-Host "Ouverture avec le navigateur par défaut..." -ForegroundColor Yellow
        Write-Host "ATTENTION: Vous devrez vider le cache manuellement!" -ForegroundColor Red
        Start-Process $url
    }
}

Write-Host ""
Write-Host "Une fois le navigateur ouvert:" -ForegroundColor White
Write-Host "1. Appuyez sur F12" -ForegroundColor Gray
Write-Host "2. Activez le mode mobile (icône téléphone)" -ForegroundColor Gray
Write-Host "3. Rechargez la page si nécessaire" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
