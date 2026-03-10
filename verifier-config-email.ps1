# Script de vérification de la configuration email

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🔍 Vérification de la Configuration Email               ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Vérifier Node.js
Write-Host "1️⃣  Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installé : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "      Téléchargez-le sur : https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Vérifier le dossier server
Write-Host "2️⃣  Vérification du dossier server..." -ForegroundColor Yellow
if (Test-Path "server") {
    Write-Host "   ✅ Dossier server trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dossier server manquant !" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Vérifier les dépendances server
Write-Host "3️⃣  Vérification des dépendances server..." -ForegroundColor Yellow
if (Test-Path "server/node_modules") {
    Write-Host "   ✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Dépendances non installées" -ForegroundColor Yellow
    Write-Host "      Exécutez : cd server && npm install" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Vérifier le fichier .env du server
Write-Host "4️⃣  Vérification de server/.env..." -ForegroundColor Yellow
if (Test-Path "server/.env") {
    Write-Host "   ✅ Fichier .env trouvé" -ForegroundColor Green
    
    # Lire et vérifier le contenu
    $envContent = Get-Content "server/.env" -Raw
    
    if ($envContent -match "GMAIL_USER=(.+)") {
        $gmailUser = $matches[1].Trim()
        if ($gmailUser -and $gmailUser -ne "votre.email@gmail.com") {
            Write-Host "      ✅ GMAIL_USER configuré : $gmailUser" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  GMAIL_USER non configuré" -ForegroundColor Yellow
            $allGood = $false
        }
    }
    
    if ($envContent -match "GMAIL_APP_PASSWORD=(.+)") {
        $gmailPassword = $matches[1].Trim()
        if ($gmailPassword -and $gmailPassword -ne "votre_mot_de_passe_application") {
            Write-Host "      ✅ GMAIL_APP_PASSWORD configuré" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  GMAIL_APP_PASSWORD non configuré" -ForegroundColor Yellow
            $allGood = $false
        }
    }
} else {
    Write-Host "   ❌ Fichier .env manquant !" -ForegroundColor Red
    Write-Host "      Exécutez : .\setup-email-server.ps1" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Vérifier le fichier .env.local
Write-Host "5️⃣  Vérification de .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ Fichier .env.local trouvé" -ForegroundColor Green
    
    $envLocalContent = Get-Content ".env.local" -Raw
    
    if ($envLocalContent -match "VITE_EMAIL_SERVER_URL") {
        Write-Host "      ✅ VITE_EMAIL_SERVER_URL configuré" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️  VITE_EMAIL_SERVER_URL manquant" -ForegroundColor Yellow
    }
    
    if ($envLocalContent -match "EMAIL_PROVIDER=custom") {
        Write-Host "      ✅ EMAIL_PROVIDER=custom configuré" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️  EMAIL_PROVIDER non configuré" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Fichier .env.local manquant !" -ForegroundColor Red
    Write-Host "      Exécutez : .\setup-email-server.ps1" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Vérifier les fichiers principaux
Write-Host "6️⃣  Vérification des fichiers principaux..." -ForegroundColor Yellow
$files = @(
    "server/emailServer.js",
    "server/package.json",
    "server/test-email.js",
    "src/components/EmailVerification.tsx",
    "src/services/emailService.ts",
    "src/config/emailConfig.ts"
)

$missingFiles = @()
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file manquant" -ForegroundColor Red
        $missingFiles += $file
        $allGood = $false
    }
}
Write-Host ""

# Résumé
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RÉSUMÉ                                                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ Tout est configuré correctement !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Démarrer les serveurs :" -ForegroundColor White
    Write-Host "   .\start-with-email.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Tester l'envoi d'email :" -ForegroundColor White
    Write-Host "   cd server" -ForegroundColor Yellow
    Write-Host "   npm test votre.email@gmail.com" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "⚠️  Configuration incomplète" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Actions requises :" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path "server/.env") -or -not (Test-Path ".env.local")) {
        Write-Host "1. Exécuter le script d'installation :" -ForegroundColor White
        Write-Host "   .\setup-email-server.ps1" -ForegroundColor Yellow
        Write-Host ""
    }
    
    if (-not (Test-Path "server/node_modules")) {
        Write-Host "2. Installer les dépendances :" -ForegroundColor White
        Write-Host "   cd server" -ForegroundColor Yellow
        Write-Host "   npm install" -ForegroundColor Yellow
        Write-Host ""
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Host "3. Fichiers manquants détectés" -ForegroundColor White
        Write-Host "   Vérifiez que tous les fichiers ont été créés" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host "📚 Documentation :" -ForegroundColor Cyan
Write-Host "   • LIRE_MOI_EMAIL.txt" -ForegroundColor White
Write-Host "   • DEMARRAGE_RAPIDE_EMAIL.md" -ForegroundColor White
Write-Host "   • README_EMAIL_GMAIL.md" -ForegroundColor White
Write-Host ""
