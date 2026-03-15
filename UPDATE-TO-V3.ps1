# Script pour mettre à jour tous les imports vers messaging-types-v3
Write-Host "🔄 Mise à jour des imports vers messaging-types-v3..." -ForegroundColor Cyan

$files = @(
    "src/messaging-ui/MessagingContainer.tsx",
    "src/messaging-ui/index.tsx",
    "src/messaging-ui/components/UserList.tsx",
    "src/messaging-ui/components/MessageView.tsx",
    "src/messaging-ui/components/ChannelList.tsx",
    "src/messaging-ui/hooks/useWebSocket.ts",
    "src/messaging-api/WebSocketServer.ts",
    "src/messaging-core/WebSocketManager.ts",
    "src/messaging-core/RateLimiter.ts",
    "src/messaging-core/PermissionService.ts",
    "src/messaging-core/NotificationService.ts",
    "src/messaging-core/MessageService.ts",
    "src/messaging-core/ErrorHandler.ts",
    "src/messaging-core/ChannelService.ts",
    "src/messaging-core/CacheService.ts"
)

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $newContent = $content -replace 'messaging-types-v2', 'messaging-types-v3'
        Set-Content -Path $file -Value $newContent -NoNewline
        $count++
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file (non trouvé)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ $count fichiers mis à jour!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Redémarrage du serveur..." -ForegroundColor Cyan

# Arrêter Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Nettoyer le cache
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "📋 IMPORTANT:" -ForegroundColor Yellow
Write-Host "   1. Le serveur va démarrer sur le port 3001" -ForegroundColor White
Write-Host "   2. Dans le navigateur: DevTools (F12) > Clic droit Actualiser > Vider le cache" -ForegroundColor White
Write-Host "   3. Ou utilise la navigation privée" -ForegroundColor White
Write-Host ""

# Démarrer
npm run dev -- --port 3001 --force
