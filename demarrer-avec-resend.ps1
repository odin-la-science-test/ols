# Script pour demarrer avec Resend (vrais emails)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📧 Demarrage avec Resend (Vrais Emails)                ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Configuration actuelle :" -ForegroundColor Green
Write-Host "   • Serveur Resend : DEMARRE (port 3001)" -ForegroundColor Gray
Write-Host "   • Cle API : CONFIGUREE" -ForegroundColor Gray
Write-Host "   • Email expediteur : onboarding@resend.dev" -ForegroundColor Gray
Write-Host ""

Write-Host "📧 Vous recevrez de VRAIS emails !" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Instructions :" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Reinitialiser le navigateur :" -ForegroundColor Yellow
Write-Host "   • Ouvrez votre navigateur" -ForegroundColor Gray
Write-Host "   • Appuyez sur F12" -ForegroundColor Gray
Write-Host "   • Dans la console, tapez :" -ForegroundColor Gray
Write-Host ""
Write-Host "     localStorage.clear(); sessionStorage.clear();" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Appuyez sur Entree" -ForegroundColor Gray
Write-Host "   • Fermez la console (F12)" -ForegroundColor Gray
Write-Host ""

Write-Host "2. L'application va demarrer" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Creer un compte :" -ForegroundColor Yellow
Write-Host "   • Allez sur http://localhost:5173" -ForegroundColor Gray
Write-Host "   • Cliquez sur 'Creer un compte'" -ForegroundColor Gray
Write-Host "   • Entrez VOTRE VRAI EMAIL" -ForegroundColor Cyan
Write-Host "   • Entrez un mot de passe" -ForegroundColor Gray
Write-Host "   • Validez" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Verifier votre boite email :" -ForegroundColor Yellow
Write-Host "   • Ouvrez votre boite email" -ForegroundColor Gray
Write-Host "   • Cherchez un email de 'onboarding@resend.dev'" -ForegroundColor Gray
Write-Host "   • Verifiez aussi le dossier SPAM" -ForegroundColor Gray
Write-Host "   • Copiez le code a 6 chiffres" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Entrer le code :" -ForegroundColor Yellow
Write-Host "   • Collez le code dans les 6 champs" -ForegroundColor Gray
Write-Host "   • Validez" -ForegroundColor Gray
Write-Host "   • Vous etes connecte ! 🎉" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Appuyez sur Entree pour demarrer l'application..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🚀 Demarrage de l'application..." -ForegroundColor Green
Write-Host ""

npm run dev
