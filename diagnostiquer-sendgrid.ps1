# Script de diagnostic pour les problèmes de connexion SendGrid

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🔧 Diagnostic SendGrid                                  ║" -ForegroundColor Cyan
Write-Host "║      Résolution des problèmes de connexion                ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Questions de diagnostic" -ForegroundColor Yellow
Write-Host ""

# Question 1
Write-Host "1️⃣  Avez-vous reçu un email de vérification de SendGrid ?" -ForegroundColor Cyan
Write-Host "   (Vérifiez aussi le dossier SPAM)" -ForegroundColor Gray
Write-Host ""
Write-Host "   [O] Oui, je l'ai reçu et cliqué dessus" -ForegroundColor Green
Write-Host "   [N] Non, je ne l'ai pas reçu" -ForegroundColor Red
Write-Host "   [S] Je ne sais pas / Je n'ai pas vérifié" -ForegroundColor Yellow
Write-Host ""
$reponse1 = Read-Host "   Votre réponse (O/N/S)"

Write-Host ""

# Question 2
Write-Host "2️⃣  Quel message d'erreur voyez-vous ?" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [1] Email ou mot de passe incorrect" -ForegroundColor Gray
Write-Host "   [2] Account not verified" -ForegroundColor Gray
Write-Host "   [3] Account suspended / locked" -ForegroundColor Gray
Write-Host "   [4] La page ne charge pas" -ForegroundColor Gray
Write-Host "   [5] Autre / Je ne sais pas" -ForegroundColor Gray
Write-Host ""
$reponse2 = Read-Host "   Votre réponse (1/2/3/4/5)"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Analyse et solutions
Write-Host "🎯 Diagnostic et Solutions :" -ForegroundColor Green
Write-Host ""

if ($reponse1 -eq "N" -or $reponse1 -eq "n") {
    Write-Host "❌ Problème : Email de vérification non reçu" -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ Solutions :" -ForegroundColor Green
    Write-Host "   1. Vérifiez votre dossier SPAM" -ForegroundColor Yellow
    Write-Host "   2. Attendez 5 minutes (l'email peut être retardé)" -ForegroundColor Yellow
    Write-Host "   3. Demandez un nouvel email de vérification :" -ForegroundColor Yellow
    Write-Host "      → Allez sur https://app.sendgrid.com/login" -ForegroundColor Gray
    Write-Host "      → Essayez de vous connecter" -ForegroundColor Gray
    Write-Host "      → Cliquez sur 'Resend verification email'" -ForegroundColor Gray
    Write-Host ""
}

if ($reponse2 -eq "1") {
    Write-Host "❌ Problème : Email ou mot de passe incorrect" -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ Solutions :" -ForegroundColor Green
    Write-Host "   1. Réinitialisez votre mot de passe :" -ForegroundColor Yellow
    Write-Host "      → https://app.sendgrid.com/login" -ForegroundColor Gray
    Write-Host "      → Cliquez sur 'Forgot Password?'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Vérifiez que vous utilisez le bon email" -ForegroundColor Yellow
    Write-Host "      → Pas d'espace avant/après" -ForegroundColor Gray
    Write-Host "      → Vérifiez les majuscules/minuscules" -ForegroundColor Gray
    Write-Host ""
}

if ($reponse2 -eq "2") {
    Write-Host "❌ Problème : Compte non vérifié" -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ Solution :" -ForegroundColor Green
    Write-Host "   Vous DEVEZ vérifier votre email avant de vous connecter" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Ouvrez votre boîte email" -ForegroundColor Gray
    Write-Host "   2. Cherchez un email de SendGrid" -ForegroundColor Gray
    Write-Host "   3. Vérifiez le dossier SPAM" -ForegroundColor Gray
    Write-Host "   4. Cliquez sur le lien de vérification" -ForegroundColor Gray
    Write-Host ""
}

if ($reponse2 -eq "3") {
    Write-Host "❌ Problème : Compte suspendu ou bloqué" -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ Solutions :" -ForegroundColor Green
    Write-Host "   1. Attendez 30 minutes" -ForegroundColor Yellow
    Write-Host "   2. Réessayez de vous connecter" -ForegroundColor Yellow
    Write-Host "   3. Si ça ne fonctionne pas, contactez le support :" -ForegroundColor Yellow
    Write-Host "      → https://support.sendgrid.com/" -ForegroundColor Gray
    Write-Host ""
}

if ($reponse2 -eq "4") {
    Write-Host "❌ Problème : Page ne charge pas" -ForegroundColor Red
    Write-Host ""
    Write-Host "✅ Solutions :" -ForegroundColor Green
    Write-Host "   1. Videz le cache de votre navigateur (Ctrl+Shift+Delete)" -ForegroundColor Yellow
    Write-Host "   2. Essayez un autre navigateur (Chrome, Firefox, Edge)" -ForegroundColor Yellow
    Write-Host "   3. Essayez en navigation privée" -ForegroundColor Yellow
    Write-Host "   4. Désactivez vos extensions de navigateur" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Actions Rapides :" -ForegroundColor Magenta
Write-Host ""
Write-Host "   [1] Ouvrir la page de connexion SendGrid" -ForegroundColor Gray
Write-Host "   [2] Ouvrir la page de réinitialisation du mot de passe" -ForegroundColor Gray
Write-Host "   [3] Ouvrir le support SendGrid" -ForegroundColor Gray
Write-Host "   [4] Lire le guide de résolution complet" -ForegroundColor Gray
Write-Host "   [5] Utiliser le mode mock (sans SendGrid)" -ForegroundColor Gray
Write-Host "   [Q] Quitter" -ForegroundColor Gray
Write-Host ""
$action = Read-Host "   Choisissez une action (1/2/3/4/5/Q)"

Write-Host ""

switch ($action) {
    "1" {
        Write-Host "🌐 Ouverture de la page de connexion SendGrid..." -ForegroundColor Green
        Start-Process "https://app.sendgrid.com/login"
    }
    "2" {
        Write-Host "🌐 Ouverture de la page de réinitialisation..." -ForegroundColor Green
        Start-Process "https://app.sendgrid.com/login"
        Write-Host ""
        Write-Host "   👉 Cliquez sur 'Forgot Password?' sur la page" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "🌐 Ouverture du support SendGrid..." -ForegroundColor Green
        Start-Process "https://support.sendgrid.com/"
    }
    "4" {
        Write-Host "📖 Ouverture du guide de résolution..." -ForegroundColor Green
        if (Test-Path "RESOUDRE_CONNEXION_SENDGRID.md") {
            Start-Process "RESOUDRE_CONNEXION_SENDGRID.md"
        } else {
            Write-Host "   ❌ Fichier non trouvé : RESOUDRE_CONNEXION_SENDGRID.md" -ForegroundColor Red
        }
    }
    "5" {
        Write-Host "🚀 Démarrage en mode mock..." -ForegroundColor Green
        Write-Host ""
        Write-Host "   Le système va démarrer sans SendGrid." -ForegroundColor Gray
        Write-Host "   Les codes s'afficheront dans l'application." -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Appuyez sur Entrée pour continuer..." -ForegroundColor Yellow
        Read-Host
        npm run dev
    }
    default {
        Write-Host "👋 Au revoir !" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Conseil :" -ForegroundColor Yellow
Write-Host "   En attendant de résoudre le problème SendGrid," -ForegroundColor Gray
Write-Host "   utilisez le mode mock pour développer :" -ForegroundColor Gray
Write-Host ""
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Le système fonctionne parfaitement !" -ForegroundColor Green
Write-Host ""
