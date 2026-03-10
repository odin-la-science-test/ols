# Script pour ouvrir automatiquement les pages SendGrid nécessaires

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📧 Ouverture des Pages SendGrid                         ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 Ouverture des pages dans votre navigateur..." -ForegroundColor Yellow
Write-Host ""

# Ouvrir la page d'inscription SendGrid
Write-Host "1️⃣  Page d'inscription SendGrid..." -ForegroundColor Green
Start-Process "https://signup.sendgrid.com/"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "📝 Instructions :" -ForegroundColor Cyan
Write-Host ""
Write-Host "ÉTAPE 1 : Créer un compte (1 minute)" -ForegroundColor White
Write-Host "  • Remplissez le formulaire" -ForegroundColor Gray
Write-Host "  • Email : votre.email@gmail.com" -ForegroundColor Gray
Write-Host "  • Mot de passe : [choisissez un mot de passe]" -ForegroundColor Gray
Write-Host "  • Nom/Prénom : [vos informations]" -ForegroundColor Gray
Write-Host "  • Cliquez sur 'Create Account'" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Appuyez sur Entrée quand vous avez créé votre compte et vérifié votre email"

Write-Host ""
Write-Host "2️⃣  Page API Keys..." -ForegroundColor Green
Start-Process "https://app.sendgrid.com/settings/api_keys"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "ÉTAPE 2 : Créer une clé API (1 minute)" -ForegroundColor White
Write-Host "  • Connectez-vous si nécessaire" -ForegroundColor Gray
Write-Host "  • Cliquez sur 'Create API Key' (bouton bleu)" -ForegroundColor Gray
Write-Host "  • Nom : 'Odin La Science'" -ForegroundColor Gray
Write-Host "  • Permissions : 'Full Access'" -ForegroundColor Gray
Write-Host "  • Cliquez sur 'Create & View'" -ForegroundColor Gray
Write-Host "  • COPIEZ LA CLÉ (format: SG.xxx...)" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Appuyez sur Entrée quand vous avez copié votre clé API"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Prêt pour la configuration !                         ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Maintenant, exécutez le script de configuration :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   .\setup-sendgrid.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Le script vous demandera :" -ForegroundColor White
Write-Host "  • Votre clé API SendGrid (collez-la)" -ForegroundColor Gray
Write-Host "  • Un email expéditeur (ex: noreply@votredomaine.com)" -ForegroundColor Gray
Write-Host ""

$runSetup = Read-Host "Voulez-vous exécuter le script de configuration maintenant ? (o/n)"

if ($runSetup -eq "o" -or $runSetup -eq "O") {
    Write-Host ""
    Write-Host "🚀 Lancement du script de configuration..." -ForegroundColor Green
    Write-Host ""
    .\setup-sendgrid.ps1
} else {
    Write-Host ""
    Write-Host "💡 N'oubliez pas d'exécuter :" -ForegroundColor Cyan
    Write-Host "   .\setup-sendgrid.ps1" -ForegroundColor Yellow
    Write-Host ""
}
