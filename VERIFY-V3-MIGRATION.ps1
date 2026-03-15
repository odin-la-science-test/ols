# Script de vérification de la migration v3
Write-Host "🔍 VÉRIFICATION DE LA MIGRATION V3" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Vérifier que le dossier v3 existe
Write-Host "1️⃣  Vérification du dossier messaging-types-v3..." -ForegroundColor Yellow
if (Test-Path "src/messaging-types-v3") {
    Write-Host "   ✅ Dossier messaging-types-v3 existe" -ForegroundColor Green
    
    # Vérifier les fichiers essentiels
    $files = @("index.ts", "types.ts", "constants.ts")
    foreach ($file in $files) {
        if (Test-Path "src/messaging-types-v3/$file") {
            Write-Host "   ✅ $file présent" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $file MANQUANT" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "   ❌ Dossier messaging-types-v3 MANQUANT" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 2. Vérifier qu'il n'y a plus de références à v2
Write-Host "2️⃣  Recherche de références à messaging-types-v2..." -ForegroundColor Yellow
$v2References = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | 
    Select-String -Pattern "messaging-types-v2" -SimpleMatch

if ($v2References) {
    Write-Host "   ⚠️  Références à v2 trouvées:" -ForegroundColor Yellow
    $v2References | ForEach-Object {
        Write-Host "      $($_.Path):$($_.LineNumber)" -ForegroundColor Yellow
    }
    $allGood = $false
} else {
    Write-Host "   ✅ Aucune référence à v2 dans le code source" -ForegroundColor Green
}

Write-Host ""

# 3. Vérifier les imports v3
Write-Host "3️⃣  Verification des imports messaging-types-v3..." -ForegroundColor Yellow
$v3References = Get-ChildItem -Path "src/messaging-ui","src/messaging-core","src/messaging-api" -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "messaging-types-v3" -SimpleMatch

if ($v3References) {
    $count = ($v3References | Measure-Object).Count
    Write-Host "   ✅ $count fichiers utilisent messaging-types-v3" -ForegroundColor Green
} else {
    Write-Host "   Aucun fichier n utilise messaging-types-v3" -ForegroundColor Yellow
    Write-Host "      Cela peut etre normal si les imports sont directs" -ForegroundColor Gray
}

Write-Host ""

# 4. Vérifier la route /hugin/chat
Write-Host "4️⃣  Vérification de la route /hugin/chat..." -ForegroundColor Yellow
if (Test-Path "src/pages/hugin/InternalChat.tsx") {
    Write-Host "   ✅ InternalChat.tsx existe" -ForegroundColor Green
    
    # Vérifier que App.tsx contient la route
    $appContent = Get-Content "src/App.tsx" -Raw
    if ($appContent -match "/hugin/chat") {
        Write-Host "   ✅ Route /hugin/chat configurée dans App.tsx" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Route /hugin/chat MANQUANTE dans App.tsx" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ InternalChat.tsx MANQUANT" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ MIGRATION V3 COMPLÈTE ET VALIDE" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
    Write-Host "   1. Exécutez: .\CLEAR-CACHE-AND-RESTART.ps1" -ForegroundColor White
    Write-Host "   2. Ouvrez le navigateur en mode incognito" -ForegroundColor White
    Write-Host "   3. Allez sur http://localhost:3000/hugin/chat" -ForegroundColor White
} else {
    Write-Host "❌ PROBLÈMES DÉTECTÉS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs ci-dessus avant de continuer." -ForegroundColor Yellow
}

Write-Host ""
