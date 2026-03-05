# Script pour forcer le rechargement complet de la page de connexion
Write-Host "🔄 FORCE RELOAD - Page de connexion" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le serveur tourne
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
} catch {
    $serverRunning = $false
}

if (-not $serverRunning) {
    Write-Host "⚠️  Le serveur n'est pas en cours d'exécution" -ForegroundColor Yellow
    Write-Host "   Lancez d'abord: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Voulez-vous démarrer le serveur maintenant? (o/n)"
    if ($response -eq 'o' -or $response -eq 'O') {
        Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
        Write-Host "⏳ Attente de 10 secondes pour le démarrage du serveur..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        exit 1
    }
}

Write-Host "✅ Serveur détecté" -ForegroundColor Green
Write-Host ""

# Nettoyer le cache du navigateur
Write-Host "🧹 Nettoyage du cache..." -ForegroundColor Yellow

# Supprimer les fichiers temporaires du navigateur (Chrome/Edge)
$cachePaths = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        try {
            Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Cache nettoyé: $path" -ForegroundColor Gray
        } catch {
            Write-Host "  ⚠ Impossible de nettoyer: $path (navigateur ouvert?)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "📋 VÉRIFICATION DES FICHIERS" -ForegroundColor Cyan

# Vérifier que les fichiers existent
$files = @(
    "src/pages/LoginSimple.tsx",
    "src/pages/LoginSimple.css"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MANQUANT!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎨 ANIMATIONS À VÉRIFIER:" -ForegroundColor Cyan
Write-Host "  1. Background avec 3 orbes flottants (blur 80px)" -ForegroundColor White
Write-Host "  2. Panneau bleu qui glisse à droite (pas de disparition)" -ForegroundColor White
Write-Host "  3. Logo avec pulse et brillance" -ForegroundColor White
Write-Host "  4. Inputs avec glow au focus" -ForegroundColor White
Write-Host "  5. Boutons avec hover effect (lift + shadow)" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Ouverture de la page..." -ForegroundColor Green
Write-Host "   URL: http://localhost:3001/login?nocache=" -NoNewline
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Write-Host $timestamp -ForegroundColor Gray
Write-Host ""

# Ouvrir avec un paramètre nocache pour forcer le rechargement
Start-Process "http://localhost:3001/login?nocache=$timestamp"

Write-Host "💡 INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "   1. Une fois la page ouverte, appuyez sur F12 (DevTools)" -ForegroundColor White
Write-Host "   2. Allez dans l'onglet 'Network'" -ForegroundColor White
Write-Host "   3. Cochez 'Disable cache'" -ForegroundColor White
Write-Host "   4. Appuyez sur Ctrl + Shift + R pour hard refresh" -ForegroundColor White
Write-Host "   5. Vérifiez que LoginSimple.css est bien chargé" -ForegroundColor White
Write-Host ""

Write-Host "🔍 SI LES ANIMATIONS NE S'AFFICHENT TOUJOURS PAS:" -ForegroundColor Yellow
Write-Host "   • Vérifiez la console (F12) pour les erreurs" -ForegroundColor White
Write-Host "   • Vérifiez que LoginSimple.css est chargé (onglet Network)" -ForegroundColor White
Write-Host "   • Inspectez un élément et vérifiez les classes CSS appliquées" -ForegroundColor White
Write-Host "   • Redémarrez le serveur de développement" -ForegroundColor White
Write-Host ""

Write-Host "✨ Bonne chance !" -ForegroundColor Green
