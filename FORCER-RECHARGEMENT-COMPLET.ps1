# Script PowerShell pour forcer le rechargement complet du navigateur
# Ce script nettoie TOUS les caches possibles

Write-Host "🧹 Nettoyage complet des caches..." -ForegroundColor Cyan

# 1. Arrêter le serveur Vite si il tourne
Write-Host "`n1️⃣ Arrêt du serveur de développement..." -ForegroundColor Yellow
$viteProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($viteProcess) {
    Stop-Process -Id $viteProcess.Id -Force
    Write-Host "   ✅ Serveur arrêté" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Aucun serveur en cours d'exécution" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Supprimer le cache Vite
Write-Host "`n2️⃣ Suppression du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   ✅ Cache Vite supprimé" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Pas de cache Vite trouvé" -ForegroundColor Gray
}

# 3. Supprimer le dossier dist
Write-Host "`n3️⃣ Suppression du dossier dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✅ Dossier dist supprimé" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Pas de dossier dist trouvé" -ForegroundColor Gray
}

# 4. Supprimer l'ancien module messaging-types si il existe
Write-Host "`n4️⃣ Vérification de l'ancien module messaging-types..." -ForegroundColor Yellow
if (Test-Path "src/messaging-types") {
    Remove-Item -Path "src/messaging-types" -Recurse -Force
    Write-Host "   ✅ Ancien module supprimé" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Ancien module déjà supprimé" -ForegroundColor Gray
}

# 5. Redémarrer le serveur avec un port différent pour forcer le rechargement
Write-Host "`n5️⃣ Redémarrage du serveur sur un nouveau port..." -ForegroundColor Yellow
Write-Host "   📝 Le serveur va démarrer sur le port 3001" -ForegroundColor Cyan
Write-Host "   📝 Nouvelle URL: http://localhost:3001" -ForegroundColor Cyan

Start-Sleep -Seconds 1

# Démarrer le serveur sur le port 3001
Write-Host "`n🚀 Démarrage du serveur..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Créer un fichier temporaire pour la configuration Vite
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true
  }
})
"@

# Sauvegarder la config actuelle si elle existe
if (Test-Path "vite.config.ts") {
    Copy-Item "vite.config.ts" "vite.config.ts.backup" -Force
}

# Instructions pour l'utilisateur
Write-Host "`n📋 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Fermez TOUS les onglets du navigateur qui pointent vers localhost" -ForegroundColor Yellow
Write-Host "2. Fermez complètement votre navigateur (toutes les fenêtres)" -ForegroundColor Yellow
Write-Host "3. Ouvrez le navigateur et allez sur: http://localhost:3001" -ForegroundColor Yellow
Write-Host "4. Appuyez sur Ctrl+Shift+R pour forcer le rechargement" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour démarrer le serveur..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Démarrer npm run dev
npm run dev -- --port 3001 --force
