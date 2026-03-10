# ============================================================================
# SCRIPT D'INSTALLATION - BASE DE DONNÉES SCIENTIFIQUE SUPABASE
# ============================================================================
# Ce script vous guide dans la configuration de votre base de données
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INSTALLATION BASE DE DONNÉES SCIENTIFIQUE SUPABASE       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# ÉTAPE 1: Vérifier les prérequis
# ============================================================================

Write-Host "📋 Étape 1: Vérification des prérequis..." -ForegroundColor Yellow
Write-Host ""

# Vérifier Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host "   Installez Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Vérifier npm
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm installé: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# ÉTAPE 2: Installer les dépendances
# ============================================================================

Write-Host "📦 Étape 2: Installation des dépendances..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Installation de @supabase/supabase-js..." -ForegroundColor Cyan
npm install @supabase/supabase-js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# ÉTAPE 3: Configuration
# ============================================================================

Write-Host "⚙️  Étape 3: Configuration..." -ForegroundColor Yellow
Write-Host ""

# Vérifier si .env.local existe
if (Test-Path ".env.local") {
    Write-Host "⚠️  Le fichier .env.local existe déjà" -ForegroundColor Yellow
    $overwrite = Read-Host "Voulez-vous le remplacer? (o/N)"
    
    if ($overwrite -ne "o" -and $overwrite -ne "O") {
        Write-Host "Configuration conservée" -ForegroundColor Cyan
    } else {
        Copy-Item ".env.supabase.example" ".env.local" -Force
        Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.supabase.example" ".env.local"
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# ÉTAPE 4: Instructions Supabase
# ============================================================================

Write-Host "🔧 Étape 4: Configuration Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "Suivez ces étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur https://supabase.com" -ForegroundColor White
Write-Host "2. Créez un compte (gratuit)" -ForegroundColor White
Write-Host "3. Cliquez sur 'New Project'" -ForegroundColor White
Write-Host "4. Nommez-le 'munin-atlas-scientific-db'" -ForegroundColor White
Write-Host "5. Attendez que le projet soit créé" -ForegroundColor White
Write-Host ""
Write-Host "6. Dans Supabase, allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "7. Cliquez sur 'New query'" -ForegroundColor White
Write-Host "8. Copiez tout le contenu de 'supabase_scientific_database.sql'" -ForegroundColor White
Write-Host "9. Collez et cliquez sur 'Run'" -ForegroundColor White
Write-Host "10. Attendez le message de succès ✅" -ForegroundColor White
Write-Host ""
Write-Host "11. Allez dans Settings > API" -ForegroundColor White
Write-Host "12. Copiez 'Project URL' et 'anon public key'" -ForegroundColor White
Write-Host "13. Collez-les dans .env.local" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Avez-vous terminé ces étapes? (o/N)"

if ($continue -ne "o" -and $continue -ne "O") {
    Write-Host ""
    Write-Host "⏸️  Installation en pause" -ForegroundColor Yellow
    Write-Host "Relancez ce script quand vous aurez terminé" -ForegroundColor Cyan
    exit 0
}

Write-Host ""

# ============================================================================
# ÉTAPE 5: Ouvrir le fichier .env.local
# ============================================================================

Write-Host "📝 Étape 5: Configuration des variables d'environnement..." -ForegroundColor Yellow
Write-Host ""

$openEnv = Read-Host "Voulez-vous ouvrir .env.local pour configurer vos clés? (O/n)"

if ($openEnv -ne "n" -and $openEnv -ne "N") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code .env.local
        Write-Host "✅ Fichier ouvert dans VS Code" -ForegroundColor Green
    } elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
        notepad .env.local
        Write-Host "✅ Fichier ouvert dans Notepad" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Ouvrez manuellement le fichier .env.local" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Remplacez:" -ForegroundColor Cyan
    Write-Host "  VITE_SUPABASE_URL=https://your-project-id.supabase.co" -ForegroundColor White
    Write-Host "  VITE_SUPABASE_ANON_KEY=your_anon_public_key_here" -ForegroundColor White
    Write-Host ""
    Write-Host "Par vos vraies valeurs depuis Supabase Settings API" -ForegroundColor Cyan
    Write-Host ""
    
    $configured = Read-Host "Avez-vous configuré les clés? (o/N)"
    
    if ($configured -ne "o" -and $configured -ne "O") {
        Write-Host ""
        Write-Host "⏸️  Configuration en pause" -ForegroundColor Yellow
        Write-Host "Configurez .env.local puis relancez ce script" -ForegroundColor Cyan
        exit 0
    }
}

Write-Host ""

# ============================================================================
# ÉTAPE 6: Test de connexion
# ============================================================================

Write-Host "🧪 Étape 6: Test de connexion..." -ForegroundColor Yellow
Write-Host ""

$runTest = Read-Host "Voulez-vous tester la connexion maintenant? (O/n)"

if ($runTest -ne "n" -and $runTest -ne "N") {
    Write-Host ""
    Write-Host "Exécution du script de test..." -ForegroundColor Cyan
    Write-Host ""
    
    npx tsx test-supabase-db.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Tests réussis!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Certains tests ont échoué" -ForegroundColor Yellow
        Write-Host "Vérifiez votre configuration dans .env.local" -ForegroundColor Cyan
    }
}

Write-Host ""

# ============================================================================
# ÉTAPE 7: Résumé
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  INSTALLATION TERMINÉE                                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "✨ Votre base de données scientifique est prête!" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Fichiers créés:" -ForegroundColor Cyan
Write-Host "  ✅ supabase_scientific_database.sql (Script SQL)" -ForegroundColor White
Write-Host "  ✅ src/services/supabaseScientificDB.ts (Service TypeScript)" -ForegroundColor White
Write-Host "  ✅ .env.local (Configuration)" -ForegroundColor White
Write-Host "  ✅ test-supabase-db.ts (Tests)" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  📄 GUIDE_BASE_DONNEES_SCIENTIFIQUE.md (Guide complet)" -ForegroundColor White
Write-Host "  📄 🎉_BASE_DONNEES_PRETE.md (Démarrage rapide)" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Consultez GUIDE_BASE_DONNEES_SCIENTIFIQUE.md" -ForegroundColor White
Write-Host "  2. Intégrez le service dans votre application" -ForegroundColor White
Write-Host "  3. Ajoutez des données scientifiques" -ForegroundColor White
Write-Host "  4. Créez votre interface de recherche" -ForegroundColor White
Write-Host ""

Write-Host "💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "  npx tsx test-supabase-db.ts  # Tester la connexion" -ForegroundColor White
Write-Host "  npm run dev                   # Lancer l'application" -ForegroundColor White
Write-Host ""

Write-Host "🆘 Besoin d'aide?" -ForegroundColor Cyan
Write-Host "  Consultez GUIDE_BASE_DONNEES_SCIENTIFIQUE.md section 'Dépannage'" -ForegroundColor White
Write-Host ""

# Ouvrir le guide
$openGuide = Read-Host "Voulez-vous ouvrir le guide complet? (O/n)"

if ($openGuide -ne "n" -and $openGuide -ne "N") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code GUIDE_BASE_DONNEES_SCIENTIFIQUE.md
        Write-Host "✅ Guide ouvert dans VS Code" -ForegroundColor Green
    } elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
        notepad GUIDE_BASE_DONNEES_SCIENTIFIQUE.md
        Write-Host "✅ Guide ouvert dans Notepad" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Bonne chance avec votre base de données scientifique! 🎉" -ForegroundColor Green
Write-Host ""
