# Script de diagnostic pour le module de messagerie
# Verifie que tous les fichiers necessaires existent et sont correctement configures

Write-Host "Diagnostic du module de messagerie..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Fonction pour verifier l'existence d'un fichier
function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "[OK] $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[MANQUANT] $description" -ForegroundColor Red
        return $false
    }
}

# Verifier les fichiers de types
Write-Host "Fichiers de types:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/messaging-types/index.ts" "Types TypeScript")

# Verifier les composants UI
Write-Host ""
Write-Host "Composants UI:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/MessagingContainer.tsx" "MessagingContainer")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/MessagingContainer.css" "MessagingContainer CSS")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/components/ChannelList.tsx" "ChannelList")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/components/MessageView.tsx" "MessageView")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/components/MessageInput.tsx" "MessageInput")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/components/MessageInput.css" "MessageInput CSS")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/components/UserList.tsx" "UserList")
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/index.tsx" "Index (point d'entree)")

# Verifier les hooks
Write-Host ""
Write-Host "Hooks:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/messaging-ui/hooks/useWebSocket.ts" "useWebSocket")

# Verifier les services backend
Write-Host ""
Write-Host "Services backend:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/messaging-core/MessageService.ts" "MessageService")
$allGood = $allGood -and (Test-FileExists "src/messaging-core/ChannelService.ts" "ChannelService")
$allGood = $allGood -and (Test-FileExists "src/messaging-core/NotificationService.ts" "NotificationService")
$allGood = $allGood -and (Test-FileExists "src/messaging-core/SecurityService.ts" "SecurityService")
$allGood = $allGood -and (Test-FileExists "src/messaging-core/WebSocketManager.ts" "WebSocketManager")

# Verifier la base de donnees
Write-Host ""
Write-Host "Base de donnees:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/messaging-db/schema.ts" "Schema DB")
$allGood = $allGood -and (Test-FileExists "databases/messaging.sqlite" "Base de donnees SQLite")

# Verifier l'integration
Write-Host ""
Write-Host "Integration:" -ForegroundColor Yellow
$allGood = $allGood -and (Test-FileExists "src/pages/hugin/Messaging.tsx" "Page d'integration")

# Verifier les exports dans index.ts
Write-Host ""
Write-Host "Verification des exports..." -ForegroundColor Yellow
$indexContent = Get-Content "src/messaging-types/index.ts" -Raw
if ($indexContent -match "export interface Channel") {
    Write-Host "[OK] Channel est exporte" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Channel n'est PAS exporte" -ForegroundColor Red
    $allGood = $false
}

if ($indexContent -match "export interface DirectMessageConversation") {
    Write-Host "[OK] DirectMessageConversation est exporte" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] DirectMessageConversation n'est PAS exporte" -ForegroundColor Red
    $allGood = $false
}

if ($indexContent -match "export interface Message") {
    Write-Host "[OK] Message est exporte" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Message n'est PAS exporte" -ForegroundColor Red
    $allGood = $false
}

# Resume
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "SUCCES: Tous les fichiers sont presents et correctement configures!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si vous voyez toujours l'erreur 'Channel is not exported':" -ForegroundColor Yellow
    Write-Host "   1. Executez: .\fix-messaging-cache.ps1" -ForegroundColor Gray
    Write-Host "   2. Fermez completement votre navigateur" -ForegroundColor Gray
    Write-Host "   3. Rouvrez-le et appuyez sur Ctrl+F5" -ForegroundColor Gray
} else {
    Write-Host "ERREUR: Certains fichiers sont manquants ou mal configures" -ForegroundColor Red
    Write-Host "   Veuillez verifier les fichiers marques en rouge ci-dessus" -ForegroundColor Yellow
}
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
