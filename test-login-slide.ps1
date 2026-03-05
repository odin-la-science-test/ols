# Script de test pour l'animation de login
Write-Host "=== TEST ANIMATION LOGIN ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que les fichiers existent
Write-Host "1. Verification des fichiers..." -ForegroundColor Yellow
$files = @(
    "src/pages/LoginSimple.tsx",
    "src/pages/LoginSimple.css",
    "public/login-slide-animation.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] $file manquant!" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Verifier que le CSS est importe
Write-Host "2. Verification de l'import CSS..." -ForegroundColor Yellow
$importCheck = Get-Content "src/pages/LoginSimple.tsx" | Select-String -Pattern "import.*LoginSimple.css"
if ($importCheck) {
    Write-Host "   [OK] CSS importe correctement" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] Import CSS manquant!" -ForegroundColor Red
}

Write-Host ""

# 3. Verifier les classes CSS
Write-Host "3. Verification des classes CSS..." -ForegroundColor Yellow
$cssContent = Get-Content "src/pages/LoginSimple.css" -Raw
$classes = @(
    ".login-simple-container",
    ".login-side-panel",
    ".slide-right",
    ".login-form-side",
    ".gradient-orb"
)

foreach ($class in $classes) {
    if ($cssContent -match [regex]::Escape($class)) {
        Write-Host "   [OK] $class" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] $class manquante!" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Ouvrir le fichier de test dans le navigateur
Write-Host "4. Ouverture du fichier de test..." -ForegroundColor Yellow
$testFile = Resolve-Path "public/login-slide-animation.html"
Write-Host "   Fichier: $testFile" -ForegroundColor Cyan
Start-Process $testFile

Write-Host ""
Write-Host "=== INSTRUCTIONS ===" -ForegroundColor Cyan
Write-Host "1. Le fichier de test s'est ouvert dans votre navigateur" -ForegroundColor White
Write-Host "2. Testez l'animation en cliquant sur 'Continuer'" -ForegroundColor White
Write-Host "3. Le panneau bleu doit glisser de droite vers gauche" -ForegroundColor White
Write-Host "4. Le formulaire doit se deplacer de gauche vers droite" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester sur le vrai site:" -ForegroundColor Yellow
Write-Host "   1. Allez sur http://localhost:3001/login" -ForegroundColor White
Write-Host "   2. Faites Ctrl+Shift+R pour vider le cache" -ForegroundColor White
Write-Host "   3. Testez la connexion avec:" -ForegroundColor White
Write-Host "      - Email: ethan@ols.com" -ForegroundColor Cyan
Write-Host "      - Password: ethan123" -ForegroundColor Cyan
Write-Host "      - Code: 1234" -ForegroundColor Cyan
Write-Host ""
