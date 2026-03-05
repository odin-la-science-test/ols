Write-Host "REINITIALISATION ET TEST ADMIN" -ForegroundColor Cyan
Write-Host ""

# Nettoyer le cache
Write-Host "1. Nettoyage du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   Cache Vite supprime" -ForegroundColor Green
}

Write-Host ""
Write-Host "VERIFICATION DES ROLES:" -ForegroundColor Cyan
Write-Host ""

# Vérifier les rôles dans LoginSimple.tsx
$loginContent = Get-Content "src/pages/LoginSimple.tsx" | Select-String "email.*role"
Write-Host "Roles dans LoginSimple.tsx:" -ForegroundColor White
$loginContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "ETAPES SUIVANTES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrir http://localhost:3001/login dans le navigateur" -ForegroundColor White
Write-Host "2. Ouvrir la console (F12)" -ForegroundColor White
Write-Host "3. Executer dans la console:" -ForegroundColor White
Write-Host "   localStorage.clear()" -ForegroundColor Yellow
Write-Host "4. Recharger la page (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "5. Se connecter avec:" -ForegroundColor White
Write-Host "   Email: admin" -ForegroundColor Cyan
Write-Host "   Password: admin123" -ForegroundColor Cyan
Write-Host "   Code: 0000" -ForegroundColor Cyan
Write-Host "6. Verifier dans la console:" -ForegroundColor White
Write-Host "   localStorage.getItem('currentUserRole')" -ForegroundColor Yellow
Write-Host "   (Doit afficher: super_admin)" -ForegroundColor Gray
Write-Host "7. Aller sur http://localhost:3001/admin" -ForegroundColor White
Write-Host ""
Write-Host "Si l'acces est toujours refuse:" -ForegroundColor Magenta
Write-Host "- Verifier la console pour les messages de log" -ForegroundColor White
Write-Host "- Chercher: 'Acces refuse a /admin' ou 'Acces autorise a /admin'" -ForegroundColor White
Write-Host ""
