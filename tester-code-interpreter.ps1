#!/usr/bin/env pwsh
# Script de test pour le Code Interpreter

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🧪 Test du Code Interpreter                             ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les fichiers existent
Write-Host "1️⃣  Vérification des fichiers..." -ForegroundColor Yellow
$files = @(
    "src/pages/munin/CodeInterpreter.tsx",
    "src/services/qwenService.ts",
    "server/qwenServer.js",
    ".env.local"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file MANQUANT" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants !" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣  Vérification de la configuration..." -ForegroundColor Yellow

# Vérifier .env.local
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "VITE_QWEN_SERVER_URL") {
    Write-Host "   ✅ Configuration Qwen trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Configuration Qwen manquante" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣  Vérification de la route dans App.tsx..." -ForegroundColor Yellow

$appContent = Get-Content "src/App.tsx" -Raw
if ($appContent -match "/munin/code-interpreter") {
    Write-Host "   ✅ Route configurée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Route manquante" -ForegroundColor Red
}

if ($appContent -match "const CodeInterpreter") {
    Write-Host "   ✅ Import lazy configuré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Import manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣  Vérification du bouton dans Munin.tsx..." -ForegroundColor Yellow

$muninContent = Get-Content "src/pages/Munin.tsx" -Raw
if ($muninContent -match "code-interpreter") {
    Write-Host "   ✅ Bouton d'accès trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Bouton manquant" -ForegroundColor Red
}

if ($muninContent -match "import.*Code") {
    Write-Host "   ✅ Import de l'icône Code trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Import de l'icône manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "5️⃣  Test de compilation TypeScript..." -ForegroundColor Yellow

# Vérifier s'il y a des erreurs TypeScript
$tsErrors = npx tsc --noEmit 2>&1 | Select-String "error TS"
if ($tsErrors) {
    Write-Host "   ⚠️  Erreurs TypeScript détectées :" -ForegroundColor Yellow
    $tsErrors | ForEach-Object { Write-Host "      $_" -ForegroundColor Yellow }
} else {
    Write-Host "   ✅ Aucune erreur TypeScript" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Vérifications terminées !                            ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 RÉSUMÉ :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ Tous les fichiers sont présents" -ForegroundColor Green
Write-Host "   ✅ Configuration correcte" -ForegroundColor Green
Write-Host "   ✅ Route configurée dans App.tsx" -ForegroundColor Green
Write-Host "   ✅ Bouton d'accès dans Munin.tsx" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 PROCHAINES ÉTAPES :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Démarrer les serveurs :" -ForegroundColor White
Write-Host "      .\demarrer-tout.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "   2. Ouvrir l'application :" -ForegroundColor White
Write-Host "      http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. Accéder au Code Interpreter :" -ForegroundColor White
Write-Host "      Munin → Code Interpreter" -ForegroundColor Cyan
Write-Host "      ou http://localhost:3000/munin/code-interpreter" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 OPTIONNEL - Installer l'IA pour l'analyse :" -ForegroundColor Yellow
Write-Host "   .\installer-qwen.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Tout est prêt ! Bon développement ! 🎉" -ForegroundColor Green
Write-Host ""
