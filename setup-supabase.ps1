# ============================================================================
# Script de configuration rapide Supabase
# ============================================================================

Write-Host "🚀 Configuration Supabase - Assistant Rapide" -ForegroundColor Cyan
Write-Host ""

# Vérifier si .env.local existe déjà
if (Test-Path ".env.local") {
    Write-Host "⚠️  Le fichier .env.local existe déjà !" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous le remplacer ? (o/N)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "📝 Entrez vos informations Supabase" -ForegroundColor Green
Write-Host "   (Trouvez-les dans : Dashboard > Settings > API)" -ForegroundColor Gray
Write-Host ""

# Demander l'URL du projet
$supabaseUrl = Read-Host "URL du projet (ex: https://xxxxx.supabase.co)"

# Valider l'URL
if (-not $supabaseUrl -or -not $supabaseUrl.StartsWith("https://")) {
    Write-Host "❌ URL invalide. Elle doit commencer par https://" -ForegroundColor Red
    exit
}

Write-Host ""

# Demander la clé anon
$supabaseKey = Read-Host "Clé anon public (commence par eyJ...)"

# Valider la clé
if (-not $supabaseKey -or -not $supabaseKey.StartsWith("eyJ")) {
    Write-Host "❌ Clé invalide. Elle doit commencer par eyJ" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "💾 Création du fichier .env.local..." -ForegroundColor Cyan

# Créer le contenu du fichier
$envContent = @"
# ============================================================================
# CONFIGURATION SUPABASE
# Généré automatiquement le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================================================

# URL de votre projet Supabase
VITE_SUPABASE_URL=$supabaseUrl

# Clé publique anonyme (anon public key)
VITE_SUPABASE_ANON_KEY=$supabaseKey

# ============================================================================
# NOTES
# ============================================================================
# ⚠️ Ne commitez JAMAIS ce fichier dans Git !
# ⚠️ Pour Vercel, ajoutez ces variables dans Settings > Environment Variables
# ============================================================================
"@

# Écrire le fichier
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Fichier .env.local créé avec succès !" -ForegroundColor Green
Write-Host ""

# Vérifier si le fichier SQL existe
if (Test-Path "supabase_scientific_database.sql") {
    Write-Host "📊 Prochaine étape : Créer les tables dans Supabase" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Allez sur votre Dashboard Supabase" -ForegroundColor White
    Write-Host "2. Cliquez sur 'SQL Editor' dans le menu" -ForegroundColor White
    Write-Host "3. Cliquez sur 'New query'" -ForegroundColor White
    Write-Host "4. Copiez le contenu de 'supabase_scientific_database.sql'" -ForegroundColor White
    Write-Host "5. Collez-le et cliquez sur 'Run'" -ForegroundColor White
    Write-Host ""
    
    $openFile = Read-Host "Voulez-vous ouvrir le fichier SQL maintenant ? (o/N)"
    if ($openFile -eq "o" -or $openFile -eq "O") {
        Start-Process "supabase_scientific_database.sql"
    }
}

Write-Host ""
Write-Host "🎉 Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer votre application :" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Consultez GUIDE_SUPABASE_5MIN.md pour plus de détails" -ForegroundColor Gray
Write-Host ""
