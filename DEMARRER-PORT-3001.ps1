# Script PowerShell - Démarrage sur le port 3001 pour contourner le cache
# Solution 2: Nouveau Port

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   🚀 DÉMARRAGE SUR LE PORT 3001" -ForegroundColor Cyan
Write-Host "   Solution pour contourner le cache du navigateur" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les processus Node existants
Write-Host "1️⃣  Arrêt des serveurs en cours..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Serveurs arrêtés" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ℹ️  Aucun serveur en cours" -ForegroundColor Gray
}

# Étape 2: Nettoyer les caches
Write-Host "`n2️⃣  Nettoyage des caches..." -ForegroundColor Yellow

$cleaned = $false

if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache Vite supprimé" -ForegroundColor Green
    $cleaned = $true
}

if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Dossier dist supprimé" -ForegroundColor Green
    $cleaned = $true
}

if (-not $cleaned) {
    Write-Host "   ℹ️  Caches déjà propres" -ForegroundColor Gray
}

# Étape 3: Vérifier si l'ancien module existe
Write-Host "`n3️⃣  Vérification des modules..." -ForegroundColor Yellow
if (Test-Path "src/messaging-types") {
    Write-Host "   ⚠️  Ancien module 'messaging-types' détecté" -ForegroundColor Yellow
    Write-Host "   💡 Le nouveau module 'messaging-types-v2' sera utilisé" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Configuration correcte" -ForegroundColor Green
}

# Étape 4: Instructions pour l'utilisateur
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   📋 INSTRUCTIONS IMPORTANTES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Le serveur va démarrer sur le port 3001" -ForegroundColor White
Write-Host "   2. Fermez TOUS les onglets localhost dans votre navigateur" -ForegroundColor White
Write-Host "   3. Fermez complètement votre navigateur (toutes les fenêtres)" -ForegroundColor White
Write-Host "   4. Rouvrez le navigateur" -ForegroundColor White
Write-Host "   5. Allez sur: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   6. Testez la messagerie: http://localhost:3001/hugin/chat" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Appuyez sur une touche pour démarrer le serveur..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Étape 5: Démarrer le serveur
Write-Host "`n4️⃣  Démarrage du serveur sur le port 3001..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Démarrer npm avec le port 3001 et force
npm run dev -- --port 3001 --force
