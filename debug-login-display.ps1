# Script de diagnostic pour la page de login
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC PAGE LOGIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier les fichiers
Write-Host "[1] Verification des fichiers..." -ForegroundColor Yellow
$files = @{
    "LoginSimple.tsx" = "src/pages/LoginSimple.tsx"
    "LoginSimple.css" = "src/pages/LoginSimple.css"
}

foreach ($name in $files.Keys) {
    $path = $files[$name]
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "  OK  $name ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR  $name manquant!" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Verifier le contenu du TSX
Write-Host "[2] Verification du contenu TSX..." -ForegroundColor Yellow
$tsxContent = Get-Content "src/pages/LoginSimple.tsx" -Raw

$checks = @{
    "Import CSS" = "import.*LoginSimple\.css"
    "State step" = "useState.*credentials.*security"
    "Condition credentials" = "step === 'credentials'"
    "Condition security" = "step === 'security'"
    "Classe move-right" = "move-right"
    "Classe slide-right" = "slide-right"
    "Input securityCode" = "id=.securityCode"
}

foreach ($name in $checks.Keys) {
    $pattern = $checks[$name]
    if ($tsxContent -match $pattern) {
        Write-Host "  OK  $name" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR  $name manquant!" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Verifier le CSS
Write-Host "[3] Verification du CSS..." -ForegroundColor Yellow
$cssContent = Get-Content "src/pages/LoginSimple.css" -Raw

$cssChecks = @{
    ".login-simple-container" = "\.login-simple-container"
    ".login-side-panel" = "\.login-side-panel"
    ".slide-right" = "\.slide-right"
    ".login-form-side" = "\.login-form-side"
    ".move-right" = "\.move-right"
    ".login-input-code" = "\.login-input-code"
}

foreach ($name in $cssChecks.Keys) {
    $pattern = $cssChecks[$name]
    if ($cssContent -match $pattern) {
        Write-Host "  OK  $name" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR  $name manquant!" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Afficher les instructions
Write-Host "[4] Instructions de test..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour tester sur le site:" -ForegroundColor Cyan
Write-Host "  1. Ouvrez http://localhost:3001/login" -ForegroundColor White
Write-Host "  2. Faites Ctrl+Shift+R pour vider le cache" -ForegroundColor White
Write-Host "  3. Ouvrez la console (F12)" -ForegroundColor White
Write-Host "  4. Entrez:" -ForegroundColor White
Write-Host "     - Email: ethan@ols.com" -ForegroundColor Cyan
Write-Host "     - Password: ethan123" -ForegroundColor Cyan
Write-Host "  5. Cliquez sur 'Continuer'" -ForegroundColor White
Write-Host "  6. Vous devriez voir le champ de code" -ForegroundColor White
Write-Host ""
Write-Host "Si vous ne voyez rien:" -ForegroundColor Yellow
Write-Host "  - Verifiez la console pour des erreurs" -ForegroundColor White
Write-Host "  - Verifiez que le serveur tourne sur le port 3001" -ForegroundColor White
Write-Host "  - Essayez de redemarrer le serveur" -ForegroundColor White
Write-Host ""

# 5. Ouvrir la page
Write-Host "[5] Ouverture de la page..." -ForegroundColor Yellow
Start-Process "http://localhost:3001/login"
Write-Host "  OK  Page ouverte" -ForegroundColor Green
Write-Host ""
Write-Host "N'oubliez pas: Ctrl+Shift+R pour vider le cache!" -ForegroundColor Red
Write-Host ""
