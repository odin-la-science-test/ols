# Script pour reinitialiser et tester la connexion

Write-Host ""
Write-Host "Reinitialisation et test de connexion..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Votre probleme :" -ForegroundColor Yellow
Write-Host "Vous avez cree un compte mais ne pouvez pas vous connecter" -ForegroundColor Gray
Write-Host ""

Write-Host "Cause :" -ForegroundColor Yellow
Write-Host "Deux systemes de connexion differents (incompatibles)" -ForegroundColor Gray
Write-Host ""

Write-Host "Solution :" -ForegroundColor Green
Write-Host "Utiliser le mode mock (codes affiches dans l'app)" -ForegroundColor Gray
Write-Host ""

Write-Host "Etapes :" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Configuration en mode mock..." -ForegroundColor Yellow

# Configurer en mode mock
$envContent = "EMAIL_PROVIDER=mock"
Set-Content -Path ".env.local" -Value $envContent

Write-Host "   Configuration mise a jour !" -ForegroundColor Green
Write-Host ""

Write-Host "2. Instructions pour reinitialiser le navigateur :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   a) Ouvrez votre navigateur" -ForegroundColor Gray
Write-Host "   b) Appuyez sur F12 (ouvrir la console)" -ForegroundColor Gray
Write-Host "   c) Allez dans l'onglet 'Console'" -ForegroundColor Gray
Write-Host "   d) Tapez cette commande :" -ForegroundColor Gray
Write-Host ""
Write-Host "      localStorage.clear(); sessionStorage.clear();" -ForegroundColor Cyan
Write-Host ""
Write-Host "   e) Appuyez sur Entree" -ForegroundColor Gray
Write-Host "   f) Fermez la console (F12)" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Demarrage de l'application..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   L'application va demarrer." -ForegroundColor Gray
Write-Host "   Suivez ces etapes :" -ForegroundColor Gray
Write-Host ""
Write-Host "   1. Allez sur http://localhost:5173" -ForegroundColor Cyan
Write-Host "   2. Cliquez sur 'Creer un compte'" -ForegroundColor Cyan
Write-Host "   3. Entrez vos informations" -ForegroundColor Cyan
Write-Host "   4. Une notification apparaitra avec le code" -ForegroundColor Cyan
Write-Host "   5. Copiez le code" -ForegroundColor Cyan
Write-Host "   6. Collez-le dans les champs" -ForegroundColor Cyan
Write-Host "   7. Vous etes connecte !" -ForegroundColor Cyan
Write-Host ""

Write-Host "Appuyez sur Entree pour demarrer l'application..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Demarrage..." -ForegroundColor Green
Write-Host ""

npm run dev
