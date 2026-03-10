# Script pour démarrer l'application avec le serveur email
# Lance les deux serveurs en parallèle

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 Démarrage de Odin La Science                         ║" -ForegroundColor Cyan
Write-Host "║      avec Serveur Email                                    ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les fichiers de configuration existent
$configOk = $true

if (-not (Test-Path "server/.env")) {
    Write-Host "❌ Fichier server/.env manquant !" -ForegroundColor Red
    Write-Host "   Exécutez d'abord : .\setup-email-server.ps1" -ForegroundColor Yellow
    $configOk = $false
}

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Fichier .env.local manquant !" -ForegroundColor Red
    Write-Host "   Exécutez d'abord : .\setup-email-server.ps1" -ForegroundColor Yellow
    $configOk = $false
}

if (-not $configOk) {
    Write-Host ""
    Write-Host "💡 Conseil : Exécutez le script d'installation :" -ForegroundColor Cyan
    Write-Host "   .\setup-email-server.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Configuration trouvée" -ForegroundColor Green
Write-Host ""

# Fonction pour démarrer un processus en arrière-plan
function Start-BackgroundProcess {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDirectory = "."
    )
    
    Write-Host "🔄 Démarrage de $Name..." -ForegroundColor Yellow
    
    $process = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; $Command" -PassThru
    
    Start-Sleep -Seconds 2
    
    if ($process -and !$process.HasExited) {
        Write-Host "✅ $Name démarré (PID: $($process.Id))" -ForegroundColor Green
        return $process
    } else {
        Write-Host "❌ Erreur lors du démarrage de $Name" -ForegroundColor Red
        return $null
    }
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Démarrage des serveurs...                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Démarrer le serveur email
$emailServer = Start-BackgroundProcess -Name "Serveur Email" -Command "npm start" -WorkingDirectory "server"

if (-not $emailServer) {
    Write-Host ""
    Write-Host "❌ Impossible de démarrer le serveur email" -ForegroundColor Red
    Write-Host "   Vérifiez que les dépendances sont installées :" -ForegroundColor Yellow
    Write-Host "   cd server && npm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 3

# Démarrer l'application principale
$mainApp = Start-BackgroundProcess -Name "Application Principale" -Command "npm run dev" -WorkingDirectory "."

if (-not $mainApp) {
    Write-Host ""
    Write-Host "❌ Impossible de démarrer l'application" -ForegroundColor Red
    Write-Host "   Vérifiez que les dépendances sont installées :" -ForegroundColor Yellow
    Write-Host "   npm install" -ForegroundColor Yellow
    
    # Arrêter le serveur email
    if ($emailServer) {
        Stop-Process -Id $emailServer.Id -Force
    }
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Tous les serveurs sont démarrés !                    ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Informations :" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📧 Serveur Email    : http://localhost:3001" -ForegroundColor White
Write-Host "  🌐 Application      : http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  PID Serveur Email   : $($emailServer.Id)" -ForegroundColor Gray
Write-Host "  PID Application     : $($mainApp.Id)" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 Pour tester l'envoi d'email :" -ForegroundColor Cyan
Write-Host "   cd server" -ForegroundColor Yellow
Write-Host "   npm test votre.email@gmail.com" -ForegroundColor Yellow
Write-Host ""

Write-Host "🛑 Pour arrêter les serveurs :" -ForegroundColor Cyan
Write-Host "   Fermez les fenêtres PowerShell ouvertes" -ForegroundColor Yellow
Write-Host "   ou appuyez sur Ctrl+C dans chaque fenêtre" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 Documentation :" -ForegroundColor Cyan
Write-Host "   README_EMAIL_GMAIL.md" -ForegroundColor Yellow
Write-Host "   GUIDE_GMAIL_SMTP.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "✨ Bon développement !" -ForegroundColor Green
Write-Host ""

# Attendre que l'utilisateur appuie sur une touche
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
