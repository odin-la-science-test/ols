# Script pour ouvrir Resend et guider l'inscription

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 Ouverture de Resend                                  ║" -ForegroundColor Cyan
Write-Host "║      Alternative moderne à SendGrid                        ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ Pourquoi Resend est meilleur que SendGrid :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ✅ Inscription ultra-simple" -ForegroundColor Green
Write-Host "   ✅ Pas de problèmes de connexion" -ForegroundColor Green
Write-Host "   ✅ Interface moderne" -ForegroundColor Green
Write-Host "   ✅ Email de test gratuit" -ForegroundColor Green
Write-Host "   ✅ Configuration en 2 minutes" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Ce que vous allez faire :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Créer un compte Resend (1 minute)" -ForegroundColor Gray
Write-Host "   2. Vérifier votre email (1 clic)" -ForegroundColor Gray
Write-Host "   3. Créer une clé API (30 secondes)" -ForegroundColor Gray
Write-Host "   4. Revenir ici avec la clé" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Ouverture des pages..." -ForegroundColor Yellow
Write-Host ""

# Ouvrir la page d'inscription
Write-Host "   📧 Page d'inscription..." -ForegroundColor Gray
Start-Sleep -Seconds 1
Start-Process "https://resend.com/signup"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Instructions :" -ForegroundColor Yellow
Write-Host ""

Write-Host "ÉTAPE 1 : Créer le compte" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "   • Entrez votre email" -ForegroundColor Gray
Write-Host "   • Choisissez un mot de passe" -ForegroundColor Gray
Write-Host "   • Cliquez sur 'Sign Up'" -ForegroundColor Gray
Write-Host ""

Write-Host "ÉTAPE 2 : Vérifier l'email" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "   • Ouvrez votre boîte email" -ForegroundColor Gray
Write-Host "   • Cliquez sur le lien de vérification" -ForegroundColor Gray
Write-Host "   • Vous serez connecté automatiquement" -ForegroundColor Gray
Write-Host ""

Write-Host "ÉTAPE 3 : Créer une clé API" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "   • Allez dans 'API Keys' (menu de gauche)" -ForegroundColor Gray
Write-Host "   • Cliquez sur 'Create API Key'" -ForegroundColor Gray
Write-Host "   • Nom : Odin La Science" -ForegroundColor Gray
Write-Host "   • Permissions : Full Access" -ForegroundColor Gray
Write-Host "   • Cliquez sur 'Create'" -ForegroundColor Gray
Write-Host "   • COPIEZ LA CLÉ (format: re_xxx...)" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ Prenez votre temps pour créer le compte..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Appuyez sur Entrée quand vous avez votre clé API" -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "🔑 Configuration" -ForegroundColor Yellow
Write-Host ""

$apiKey = Read-Host "Collez votre clé API Resend (format: re_xxx...)"

if ($apiKey -and $apiKey.StartsWith("re_")) {
    Write-Host ""
    Write-Host "✅ Clé API valide !" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📧 Email expéditeur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Resend fournit un email de test gratuit :" -ForegroundColor Gray
    Write-Host "   onboarding@resend.dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Vous pouvez l'utiliser immédiatement !" -ForegroundColor Green
    Write-Host ""
    
    $fromEmail = Read-Host "Email expéditeur (Entrée pour onboarding@resend.dev)"
    
    if (-not $fromEmail) {
        $fromEmail = "onboarding@resend.dev"
    }
    
    Write-Host ""
    Write-Host "💾 Sauvegarde de la configuration..." -ForegroundColor Yellow
    
    # Créer le dossier server si nécessaire
    if (-not (Test-Path "server")) {
        New-Item -ItemType Directory -Path "server" | Out-Null
    }
    
    # Créer le fichier .env
    $envContent = @"
EMAIL_SERVER_PORT=3001
RESEND_API_KEY=$apiKey
FROM_EMAIL=$fromEmail
NODE_ENV=development
"@
    
    Set-Content -Path "server/.env" -Value $envContent
    
    # Créer .env.local à la racine
    $envLocalContent = @"
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
"@
    
    Set-Content -Path ".env.local" -Value $envLocalContent
    
    Write-Host "✅ Configuration sauvegardée !" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Tout est prêt !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Installer les packages (si pas déjà fait) :" -ForegroundColor Cyan
    Write-Host "      .\setup-resend.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Démarrer le serveur email :" -ForegroundColor Cyan
    Write-Host "      cd server" -ForegroundColor Gray
    Write-Host "      node emailServerResend.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Démarrer l'application :" -ForegroundColor Cyan
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Tester :" -ForegroundColor Cyan
    Write-Host "      Allez sur http://localhost:5173" -ForegroundColor Gray
    Write-Host "      Créez un compte et vérifiez votre email !" -ForegroundColor Gray
    Write-Host ""
    
} elseif ($apiKey) {
    Write-Host ""
    Write-Host "⚠️  La clé API ne semble pas valide" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Les clés Resend commencent par 're_'" -ForegroundColor Gray
    Write-Host "   Exemple : re_123abc456def..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Vérifiez que vous avez copié la clé complète" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Relancez ce script pour réessayer :" -ForegroundColor Cyan
    Write-Host "   .\ouvrir-resend.ps1" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Aucune clé API fournie" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Relancez ce script quand vous aurez votre clé :" -ForegroundColor Cyan
    Write-Host "   .\ouvrir-resend.ps1" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📚 Documentation :" -ForegroundColor Magenta
Write-Host "   • SOLUTION_RESEND.md - Guide complet" -ForegroundColor Gray
Write-Host "   • SOLUTION_FINALE_EMAIL.txt - Résumé" -ForegroundColor Gray
Write-Host "   • https://resend.com/docs - Documentation officielle" -ForegroundColor Gray
Write-Host ""
