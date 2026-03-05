# Script de test final pour l'animation de login
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST ANIMATION LOGIN - FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verification des fichiers
Write-Host "[1/3] Verification des fichiers..." -ForegroundColor Yellow
$allGood = $true

if (Test-Path "src/pages/LoginSimple.tsx") {
    Write-Host "  OK  LoginSimple.tsx" -ForegroundColor Green
} else {
    Write-Host "  ERREUR  LoginSimple.tsx manquant!" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "src/pages/LoginSimple.css") {
    Write-Host "  OK  LoginSimple.css" -ForegroundColor Green
} else {
    Write-Host "  ERREUR  LoginSimple.css manquant!" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "public/login-slide-animation.html") {
    Write-Host "  OK  login-slide-animation.html" -ForegroundColor Green
} else {
    Write-Host "  ERREUR  login-slide-animation.html manquant!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Verification du CSS
Write-Host "[2/3] Verification des classes CSS..." -ForegroundColor Yellow
$cssContent = Get-Content "src/pages/LoginSimple.css" -Raw

$classes = @(
    ".login-side-panel",
    ".slide-right",
    ".login-form-side",
    ".move-right"
)

foreach ($class in $classes) {
    if ($cssContent -match [regex]::Escape($class)) {
        Write-Host "  OK  $class" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR  $class manquante!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Ouverture du fichier de test
Write-Host "[3/3] Ouverture du fichier de test..." -ForegroundColor Yellow
$testFile = Resolve-Path "public/login-slide-animation.html"
Start-Process $testFile
Write-Host "  OK  Fichier ouvert dans le navigateur" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS DE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "FICHIER DE TEST (vient de s'ouvrir):" -ForegroundColor Yellow
Write-Host "  1. Remplissez email et mot de passe" -ForegroundColor White
Write-Host "  2. Cliquez sur 'Continuer'" -ForegroundColor White
Write-Host "  3. Observez l'animation:" -ForegroundColor White
Write-Host "     - Le panneau bleu glisse de DROITE vers GAUCHE" -ForegroundColor Cyan
Write-Host "     - Le formulaire se deplace de GAUCHE vers DROITE" -ForegroundColor Cyan
Write-Host ""
Write-Host "SITE REEL (http://localhost:3001/login):" -ForegroundColor Yellow
Write-Host "  1. Ouvrez http://localhost:3001/login" -ForegroundColor White
Write-Host "  2. Faites Ctrl+Shift+R pour vider le cache" -ForegroundColor White
Write-Host "  3. Testez avec:" -ForegroundColor White
Write-Host "     Email: ethan@ols.com" -ForegroundColor Cyan
Write-Host "     Password: ethan123" -ForegroundColor Cyan
Write-Host "     Code: 1234" -ForegroundColor Cyan
Write-Host ""
Write-Host "ANIMATION ATTENDUE:" -ForegroundColor Yellow
Write-Host "  Etape 1: Formulaire a GAUCHE + Panneau bleu a DROITE" -ForegroundColor White
Write-Host "  Etape 2: Panneau bleu glisse a GAUCHE + Formulaire a DROITE" -ForegroundColor White
Write-Host "  Duree: 0.8s avec easing cubic-bezier" -ForegroundColor White
Write-Host ""

if ($allGood) {
    Write-Host "STATUT: Tous les fichiers sont prets!" -ForegroundColor Green
} else {
    Write-Host "STATUT: Certains fichiers sont manquants ou incomplets" -ForegroundColor Red
}

Write-Host ""
