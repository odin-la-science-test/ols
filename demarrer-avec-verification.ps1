# Script de démarrage avec système de vérification par email
# Mode : Mock (développement) - Aucune configuration nécessaire

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 Odin La Science - Système de Vérification           ║" -ForegroundColor Cyan
Write-Host "║      Mode : Développement (Mock)                          ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Mode Mock activé" -ForegroundColor Green
Write-Host "   Les codes de vérification s'afficheront dans l'application" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Comment utiliser :" -ForegroundColor Yellow
Write-Host "   1. L'application va s'ouvrir dans votre navigateur" -ForegroundColor Gray
Write-Host "   2. Créez un compte ou connectez-vous" -ForegroundColor Gray
Write-Host "   3. Une notification apparaîtra avec votre code" -ForegroundColor Gray
Write-Host "   4. Copiez le code et collez-le dans l'interface" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Astuce : Appuyez sur F12 pour voir les codes dans la console" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Configuration actuelle :" -ForegroundColor Magenta
Write-Host "   • Provider : Mock (développement)" -ForegroundColor Gray
Write-Host "   • Vrais emails : Non" -ForegroundColor Gray
Write-Host "   • Notifications visuelles : Oui" -ForegroundColor Gray
Write-Host "   • Configuration requise : Aucune" -ForegroundColor Gray
Write-Host ""

Write-Host "⏳ Démarrage de l'application..." -ForegroundColor Yellow
Write-Host ""

# Démarrer l'application
npm run dev

Write-Host ""
Write-Host "✅ Application démarrée !" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation :" -ForegroundColor Cyan
Write-Host "   • UTILISER_MAINTENANT.md - Guide d'utilisation" -ForegroundColor Gray
Write-Host "   • SOLUTION_SIMPLE_SANS_EMAIL.md - Détails du mode mock" -ForegroundColor Gray
Write-Host "   • SOLUTION_SANS_2FA_GMAIL.md - Alternatives pour production" -ForegroundColor Gray
Write-Host ""
