#!/usr/bin/env pwsh
# Script pour tester l'interface IA style Claude

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎨 INTERFACE IA CONVERSATIONNELLE - STYLE CLAUDE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Options disponibles :" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. 🌐 Ouvrir la démo HTML standalone" -ForegroundColor Green
Write-Host "  2. 🚀 Lancer l'application Yggdrasil" -ForegroundColor Green
Write-Host "  3. 📖 Voir la documentation complète" -ForegroundColor Green
Write-Host "  4. 📊 Voir les caractéristiques" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Choisissez une option (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Ouverture de la démo HTML..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✨ Fonctionnalités à tester :" -ForegroundColor Yellow
        Write-Host "  ✓ Écran de bienvenue avec prompts suggérés" -ForegroundColor White
        Write-Host "  ✓ Envoi de messages" -ForegroundColor White
        Write-Host "  ✓ Réponses simulées de l'IA" -ForegroundColor White
        Write-Host "  ✓ Formatage Markdown (titres, listes, code)" -ForegroundColor White
        Write-Host "  ✓ Actions sur messages (copier, modifier, régénérer)" -ForegroundColor White
        Write-Host "  ✓ Design responsive" -ForegroundColor White
        Write-Host ""
        
        $demoPath = Join-Path $PSScriptRoot "public/demo-claude-style-interface.html"
        if (Test-Path $demoPath) {
            Start-Process $demoPath
            Write-Host "✅ Démo ouverte dans le navigateur!" -ForegroundColor Green
        } else {
            Write-Host "❌ Fichier de démo introuvable: $demoPath" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Lancement de l'application Yggdrasil..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Instructions d'intégration :" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Ajouter la route dans src/App.tsx :" -ForegroundColor White
        Write-Host "   import ClaudeStyleChat from './pages/hugin/ClaudeStyleChat';" -ForegroundColor Cyan
        Write-Host "   <Route path='/hugin/claude-chat' element={<ClaudeStyleChat />} />" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Ajouter un lien dans le menu Hugin" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Accéder à : http://localhost:5173/hugin/claude-chat" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "Voulez-vous lancer l'application maintenant ? (o/n)"
        if ($confirm -eq "o" -or $confirm -eq "O") {
            Write-Host ""
            Write-Host "⏳ Démarrage de npm run dev..." -ForegroundColor Yellow
            npm run dev
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📖 Ouverture de la documentation..." -ForegroundColor Cyan
        Write-Host ""
        
        $docPath = Join-Path $PSScriptRoot "INTERFACE_IA_STYLE_CLAUDE.md"
        if (Test-Path $docPath) {
            Start-Process $docPath
            Write-Host "✅ Documentation ouverte!" -ForegroundColor Green
        } else {
            Write-Host "❌ Fichier de documentation introuvable: $docPath" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📊 CARACTÉRISTIQUES DE L'INTERFACE" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🎨 DESIGN" -ForegroundColor Yellow
        Write-Host "  ✓ Interface minimaliste et épurée" -ForegroundColor Green
        Write-Host "  ✓ Beaucoup d'espace blanc" -ForegroundColor Green
        Write-Host "  ✓ Couleurs neutres (blanc, gris, violet)" -ForegroundColor Green
        Write-Host "  ✓ Animations fluides" -ForegroundColor Green
        Write-Host "  ✓ Responsive mobile/desktop" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "💬 CONVERSATION" -ForegroundColor Yellow
        Write-Host "  ✓ Messages utilisateur à droite" -ForegroundColor Green
        Write-Host "  ✓ Messages IA à gauche" -ForegroundColor Green
        Write-Host "  ✓ Avatars distinctifs" -ForegroundColor Green
        Write-Host "  ✓ Streaming des réponses" -ForegroundColor Green
        Write-Host "  ✓ Historique conservé" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "✨ FONCTIONNALITÉS" -ForegroundColor Yellow
        Write-Host "  ✓ Formatage Markdown complet" -ForegroundColor Green
        Write-Host "  ✓ Blocs de code avec syntaxe" -ForegroundColor Green
        Write-Host "  ✓ Éditer les messages" -ForegroundColor Green
        Write-Host "  ✓ Régénérer les réponses" -ForegroundColor Green
        Write-Host "  ✓ Copier le contenu" -ForegroundColor Green
        Write-Host "  ✓ Prompts suggérés" -ForegroundColor Green
        Write-Host "  ✓ Nouvelle conversation" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "🎯 UX" -ForegroundColor Yellow
        Write-Host "  ✓ Feedback visuel immédiat" -ForegroundColor Green
        Write-Host "  ✓ Actions au survol" -ForegroundColor Green
        Write-Host "  ✓ Raccourcis clavier (Entrée, Shift+Entrée)" -ForegroundColor Green
        Write-Host "  ✓ Auto-resize textarea" -ForegroundColor Green
        Write-Host "  ✓ Scroll automatique" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📱 RESPONSIVE" -ForegroundColor Yellow
        Write-Host "  ✓ Desktop (> 768px)" -ForegroundColor Green
        Write-Host "  ✓ Tablette (768px - 1024px)" -ForegroundColor Green
        Write-Host "  ✓ Mobile (< 768px)" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "🔧 TECHNIQUE" -ForegroundColor Yellow
        Write-Host "  ✓ React + TypeScript" -ForegroundColor Green
        Write-Host "  ✓ Groq API (streaming)" -ForegroundColor Green
        Write-Host "  ✓ Lucide Icons" -ForegroundColor Green
        Write-Host "  ✓ Sanitization HTML (XSS protection)" -ForegroundColor Green
        Write-Host "  ✓ Performance optimisée" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📁 FICHIERS CRÉÉS" -ForegroundColor Yellow
        Write-Host "  • src/pages/hugin/ClaudeStyleChat.tsx" -ForegroundColor Cyan
        Write-Host "  • public/demo-claude-style-interface.html" -ForegroundColor Cyan
        Write-Host "  • INTERFACE_IA_STYLE_CLAUDE.md" -ForegroundColor Cyan
        Write-Host "  • tester-interface-claude.ps1" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🎨 PALETTE DE COULEURS" -ForegroundColor Yellow
        Write-Host "  • Background: #ffffff (blanc)" -ForegroundColor White
        Write-Host "  • Secondaire: #f9fafb (gris clair)" -ForegroundColor White
        Write-Host "  • Texte: #374151 (gris foncé)" -ForegroundColor White
        Write-Host "  • Accent: #8b5cf6 (violet)" -ForegroundColor Magenta
        Write-Host "  • Bordures: #e5e7eb (gris)" -ForegroundColor White
        Write-Host ""
        
        Write-Host "📊 COMPARAISON AVEC CLAUDE" -ForegroundColor Yellow
        Write-Host "  ┌────────────────────────┬────────┬──────────┐" -ForegroundColor White
        Write-Host "  │ Fonctionnalité         │ Claude │ Yggdrasil│" -ForegroundColor White
        Write-Host "  ├────────────────────────┼────────┼──────────┤" -ForegroundColor White
        Write-Host "  │ Design minimaliste     │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Messages alternés      │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Formatage Markdown     │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Blocs de code          │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Éditer message         │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Régénérer réponse      │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Copier réponse         │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Streaming              │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  │ Responsive             │   ✅   │    ✅    │" -ForegroundColor White
        Write-Host "  └────────────────────────┴────────┴──────────┘" -ForegroundColor White
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Option invalide. Veuillez choisir 1, 2, 3 ou 4." -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✨ Interface IA Style Claude - Prête à l'Emploi!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
