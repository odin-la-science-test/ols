# Script d'installation des dépendances Electron
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Installation Electron - Odin La Science     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Installation des dépendances Electron..." -ForegroundColor Yellow
Write-Host ""

# Installer les dépendances Electron
npm install --save-dev electron@^33.2.0
npm install --save-dev electron-builder@^25.1.8
npm install --save-dev concurrently@^9.1.0
npm install --save-dev wait-on@^8.0.1
npm install --save-dev cross-env@^7.0.3

Write-Host ""
Write-Host "✓ Dépendances Electron installées!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Copie de la configuration..." -ForegroundColor Yellow

# Sauvegarder l'ancien package.json
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.backup"
    Write-Host "✓ Backup de package.json créé" -ForegroundColor Green
}

# Copier le nouveau package.json
Copy-Item "package.electron.json" "package.json" -Force
Write-Host "✓ package.json mis à jour" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Installation terminée! ✓              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Commandes disponibles:" -ForegroundColor Yellow
Write-Host "  npm run electron:dev          - Lancer en mode développement" -ForegroundColor White
Write-Host "  npm run electron:build        - Build pour votre plateforme" -ForegroundColor White
Write-Host "  npm run electron:build:win    - Build pour Windows" -ForegroundColor White
Write-Host "  npm run electron:build:mac    - Build pour Mac" -ForegroundColor White
Write-Host "  npm run electron:build:linux  - Build pour Linux" -ForegroundColor White
Write-Host "  npm run electron:build:all    - Build pour toutes les plateformes" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "  - Créez les icônes dans le dossier 'build/'" -ForegroundColor Yellow
Write-Host "  - Windows: build/icon.ico (256x256)" -ForegroundColor Yellow
Write-Host "  - Mac: build/icon.icns" -ForegroundColor Yellow
Write-Host "  - Linux: build/icons/ (plusieurs tailles)" -ForegroundColor Yellow
Write-Host ""
