# Test final de la page de connexion avec animations
Write-Host ""
Write-Host "TEST FINAL - Page de connexion avec animations premium" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 1: Verification des fichiers..." -ForegroundColor Yellow
if (Test-Path "src/pages/LoginSimple.tsx") { Write-Host "  OK LoginSimple.tsx" -ForegroundColor Green } else { Write-Host "  ERREUR LoginSimple.tsx" -ForegroundColor Red; exit 1 }
if (Test-Path "src/pages/LoginSimple.css") { Write-Host "  OK LoginSimple.css" -ForegroundColor Green } else { Write-Host "  ERREUR LoginSimple.css" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "ETAPE 2: Verification du serveur..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -Method Head -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  OK Serveur en cours d'execution" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR Serveur non demarre" -ForegroundColor Red
    Write-Host "  Lancez: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "ETAPE 3: Ouverture de la page..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Start-Process "http://localhost:3001/login?t=$timestamp"
Write-Host "  OK Page ouverte" -ForegroundColor Green

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "  1. Faites un HARD REFRESH: Ctrl + Shift + R" -ForegroundColor White
Write-Host "  2. Vous devriez voir:" -ForegroundColor White
Write-Host "     - 3 orbes de couleur qui flottent en arriere-plan" -ForegroundColor Gray
Write-Host "     - Un panneau bleu a gauche avec le logo" -ForegroundColor Gray
Write-Host "     - Des champs de saisie avec effet glow au focus" -ForegroundColor Gray
Write-Host "  3. Testez la connexion:" -ForegroundColor White
Write-Host "     Email: ethan@ols.com" -ForegroundColor Gray
Write-Host "     Mot de passe: ethan123" -ForegroundColor Gray
Write-Host "     Code: 1234" -ForegroundColor Gray
Write-Host "  4. Le panneau bleu devrait glisser vers la droite" -ForegroundColor White
Write-Host ""
Write-Host "SI VOUS NE VOYEZ PAS LES ANIMATIONS:" -ForegroundColor Yellow
Write-Host "  - Ouvrez DevTools (F12)" -ForegroundColor White
Write-Host "  - Onglet Network, cochez 'Disable cache'" -ForegroundColor White
Write-Host "  - Rechargez avec Ctrl + Shift + R" -ForegroundColor White
Write-Host "  - Verifiez que LoginSimple.css est charge (200 OK)" -ForegroundColor White
Write-Host ""
