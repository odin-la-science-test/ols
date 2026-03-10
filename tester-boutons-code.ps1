#!/usr/bin/env pwsh
# Script pour tester le système de boutons code style Claude

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎨 TEST BOUTONS CODE STYLE CLAUDE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Options de test disponibles :" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Ouvrir la démo HTML standalone" -ForegroundColor Green
Write-Host "  2. Lancer l'application et ouvrir AI Assistant" -ForegroundColor Green
Write-Host "  3. Voir la documentation" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Choisissez une option (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Ouverture de la démo HTML..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✨ Fonctionnalités à tester :" -ForegroundColor Yellow
        Write-Host "  - Survolez les blocs de code pour voir les boutons" -ForegroundColor White
        Write-Host "  - Cliquez sur 'Copier' pour copier le code" -ForegroundColor White
        Write-Host "  - Cliquez sur 'Insérer' pour insérer dans le textarea" -ForegroundColor White
        Write-Host ""
        
        $demoPath = Join-Path $PSScriptRoot "public/demo-code-buttons-claude-style.html"
        if (Test-Path $demoPath) {
            Start-Process $demoPath
            Write-Host "✅ Démo ouverte dans le navigateur!" -ForegroundColor Green
        } else {
            Write-Host "❌ Fichier de démo introuvable: $demoPath" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Lancement de l'application..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Instructions :" -ForegroundColor Yellow
        Write-Host "  1. Attendez que l'application démarre" -ForegroundColor White
        Write-Host "  2. Connectez-vous à votre compte" -ForegroundColor White
        Write-Host "  3. Allez dans Hugin > AI Assistant (Mímir)" -ForegroundColor White
        Write-Host "  4. Posez une question qui génère du code, par exemple :" -ForegroundColor White
        Write-Host "     'Génère un script Python pour analyser des données CSV'" -ForegroundColor Cyan
        Write-Host "  5. Survolez le bloc de code généré" -ForegroundColor White
        Write-Host "  6. Testez les boutons 'Copier' et 'Insérer'" -ForegroundColor White
        Write-Host ""
        
        Write-Host "⏳ Démarrage de npm run dev..." -ForegroundColor Yellow
        npm run dev
    }
    
    "3" {
        Write-Host ""
        Write-Host "📖 Ouverture de la documentation..." -ForegroundColor Cyan
        Write-Host ""
        
        $docPath = Join-Path $PSScriptRoot "SYSTEME_BOUTONS_CODE_CLAUDE.md"
        if (Test-Path $docPath) {
            Start-Process $docPath
            Write-Host "✅ Documentation ouverte!" -ForegroundColor Green
        } else {
            Write-Host "❌ Fichier de documentation introuvable: $docPath" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "📋 Résumé rapide :" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "✅ Fonctionnalités implémentées :" -ForegroundColor Green
        Write-Host "  - Boutons 'Copier' et 'Insérer' dans les blocs de code" -ForegroundColor White
        Write-Host "  - Apparition au survol (comme Claude)" -ForegroundColor White
        Write-Host "  - Feedback visuel et animations fluides" -ForegroundColor White
        Write-Host "  - Insertion intelligente dans le textarea" -ForegroundColor White
        Write-Host "  - Design moderne et cohérent" -ForegroundColor White
        Write-Host ""
        Write-Host "📁 Fichiers modifiés :" -ForegroundColor Yellow
        Write-Host "  - src/pages/hugin/AIAssistant.tsx" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎨 Fichiers de test :" -ForegroundColor Yellow
        Write-Host "  - public/demo-code-buttons-claude-style.html" -ForegroundColor Cyan
        Write-Host "  - SYSTEME_BOUTONS_CODE_CLAUDE.md" -ForegroundColor Cyan
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Option invalide. Veuillez choisir 1, 2 ou 3." -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ Système de Boutons Code Prêt!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
