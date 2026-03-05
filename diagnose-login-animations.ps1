# Script de diagnostic pour les animations de connexion
Write-Host "🔍 DIAGNOSTIC - Animations Login" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# 1. Vérifier les fichiers
Write-Host "📁 1. VÉRIFICATION DES FICHIERS" -ForegroundColor Yellow
Write-Host ""

$files = @{
    "src/pages/LoginSimple.tsx" = "Composant React"
    "src/pages/LoginSimple.css" = "Fichier CSS avec animations"
    "public/login-premium.html" = "Version HTML de référence"
}

$allGood = $true
foreach ($file in $files.Keys) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  ✓ $file" -ForegroundColor Green
        Write-Host "    Taille: $size octets - $($files[$file])" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $file MANQUANT!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 2. Vérifier l'import CSS dans le TSX
Write-Host "📝 2. VÉRIFICATION DE L'IMPORT CSS" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/pages/LoginSimple.tsx") {
    $content = Get-Content "src/pages/LoginSimple.tsx" -Raw
    if ($content -match "import\s+['\`"]\.\/LoginSimple\.css['\`"]") {
        Write-Host "  ✓ Import CSS trouvé dans LoginSimple.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Import CSS MANQUANT dans LoginSimple.tsx!" -ForegroundColor Red
        Write-Host "    Ajoutez: import './LoginSimple.css';" -ForegroundColor Yellow
        $allGood = $false
    }
}

Write-Host ""

# 3. Vérifier les classes CSS dans le fichier
Write-Host "🎨 3. VÉRIFICATION DES CLASSES CSS" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/pages/LoginSimple.css") {
    $cssContent = Get-Content "src/pages/LoginSimple.css" -Raw
    
    $classes = @(
        "login-bg-canvas",
        "gradient-orb",
        "login-simple-container",
        "login-side-panel",
        "login-logo",
        "login-form-wrapper",
        "login-input",
        "login-btn"
    )
    
    foreach ($class in $classes) {
        if ($cssContent -match "\.$class\s*\{") {
            Write-Host "  ✓ .$class" -ForegroundColor Green
        } else {
            Write-Host "  ✗ .$class MANQUANTE!" -ForegroundColor Red
            $allGood = $false
        }
    }
}

Write-Host ""

# 4. Vérifier les animations CSS
Write-Host "✨ 4. VÉRIFICATION DES ANIMATIONS" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/pages/LoginSimple.css") {
    $cssContent = Get-Content "src/pages/LoginSimple.css" -Raw
    
    $animations = @(
        "float-orb",
        "logo-pulse",
        "card-enter",
        "fade-in-up",
        "shake"
    )
    
    foreach ($anim in $animations) {
        if ($cssContent -match "@keyframes\s+$anim") {
            Write-Host "  ✓ @keyframes $anim" -ForegroundColor Green
        } else {
            Write-Host "  ✗ @keyframes $anim MANQUANTE!" -ForegroundColor Red
            $allGood = $false
        }
    }
}

Write-Host ""

# 5. Vérifier l'utilisation des classes dans le TSX
Write-Host "🔗 5. VÉRIFICATION DE L'UTILISATION DES CLASSES" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/pages/LoginSimple.tsx") {
    $tsxContent = Get-Content "src/pages/LoginSimple.tsx" -Raw
    
    $classUsage = @{
        "login-bg-canvas" = "Background animé"
        "gradient-orb" = "Orbes flottants"
        "login-side-panel" = "Panneau bleu"
        "login-logo" = "Logo animé"
        "login-input" = "Champs de saisie"
        "login-btn" = "Boutons"
    }
    
    foreach ($class in $classUsage.Keys) {
        if ($tsxContent -match "className.*$class") {
            Write-Host "  ✓ $class utilisée - $($classUsage[$class])" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $class NON UTILISÉE!" -ForegroundColor Red
            $allGood = $false
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

if ($allGood) {
    Write-Host "✅ DIAGNOSTIC: TOUT EST OK!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si les animations ne s'affichent toujours pas:" -ForegroundColor Yellow
    Write-Host "  1. Lancez: .\force-reload-login.ps1" -ForegroundColor White
    Write-Host "  2. Ouvrez DevTools (F12) → Network" -ForegroundColor White
    Write-Host "  3. Vérifiez que LoginSimple.css est chargé" -ForegroundColor White
    Write-Host "  4. Faites un hard refresh: Ctrl + Shift + R" -ForegroundColor White
} else {
    Write-Host "❌ DIAGNOSTIC: PROBLÈMES DÉTECTÉS!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Corrigez les erreurs ci-dessus avant de continuer." -ForegroundColor Yellow
}

Write-Host ""
