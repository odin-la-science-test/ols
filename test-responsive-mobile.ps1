#!/usr/bin/env pwsh
# Script de test responsive mobile

Write-Host "🔄 Test Responsive Mobile - Redémarrage complet" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter tous les processus Node
Write-Host "1️⃣ Arrêt des processus Node existants..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Étape 2: Nettoyer le cache
Write-Host "2️⃣ Nettoyage du cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   ✅ Cache Vite supprimé" -ForegroundColor Green
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   ✅ Dossier dist supprimé" -ForegroundColor Green
}

# Étape 3: Vérifier les fichiers critiques
Write-Host "3️⃣ Vérification des fichiers..." -ForegroundColor Yellow
$files = @(
    "src/hooks/useBreakpoint.ts",
    "src/components/layout/ResponsiveContainer.tsx",
    "src/components/layout/ResponsiveGrid.tsx",
    "src/components/layout/index.ts",
    "src/styles/responsive.css"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file MANQUANT!" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "❌ Fichiers manquants détectés!" -ForegroundColor Red
    exit 1
}

# Étape 4: Démarrer le serveur
Write-Host ""
Write-Host "4️⃣ Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 INSTRUCTIONS DE TEST:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Ouvrez Chrome" -ForegroundColor White
Write-Host "2. Appuyez sur F12 pour ouvrir DevTools" -ForegroundColor White
Write-Host "3. Appuyez sur Ctrl+Shift+M pour activer le mode responsive" -ForegroundColor White
Write-Host "4. Sélectionnez 'iPhone 12 Pro' ou 'Pixel 5'" -ForegroundColor White
Write-Host "5. Testez ces pages:" -ForegroundColor White
Write-Host "   - http://localhost:5173/hugin" -ForegroundColor Cyan
Write-Host "   - http://localhost:5173/beta-hub" -ForegroundColor Cyan
Write-Host "   - http://localhost:5173/hugin/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 CE QUE VOUS DEVRIEZ VOIR:" -ForegroundColor Yellow
Write-Host "- Modules en 1 colonne sur mobile" -ForegroundColor White
Write-Host "- Padding réduit (1rem au lieu de 2rem)" -ForegroundColor White
Write-Host "- Textes plus petits mais lisibles" -ForegroundColor White
Write-Host "- Pas de scroll horizontal" -ForegroundColor White
Write-Host "- Grilles qui s'adaptent automatiquement" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Si vous ne voyez rien:" -ForegroundColor Red
Write-Host "- Videz le cache: Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "- Rechargez: Ctrl+F5" -ForegroundColor White
Write-Host "- Vérifiez la console (F12) pour les erreurs" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Lancement du serveur..." -ForegroundColor Green
Write-Host ""

npm run dev
