#!/usr/bin/env pwsh
# Script d'installation de Qwen2-VL Local AI

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🤖 Installation Qwen2-VL Local AI                       ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Vérifier Node.js
Write-Host "1️⃣  Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installé : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "   Installez Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Étape 2 : Installer les dépendances du serveur
Write-Host ""
Write-Host "2️⃣  Installation des dépendances du serveur..." -ForegroundColor Yellow

if (-not (Test-Path "server/node_modules")) {
    Write-Host "   📦 Installation des packages npm..." -ForegroundColor Cyan
    Push-Location server
    npm install express cors multer dotenv
    Pop-Location
    Write-Host "   ✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dépendances déjà installées" -ForegroundColor Green
}

# Étape 3 : Vérifier Ollama
Write-Host ""
Write-Host "3️⃣  Vérification d'Ollama..." -ForegroundColor Yellow

try {
    $ollamaVersion = ollama --version 2>$null
    Write-Host "   ✅ Ollama installé : $ollamaVersion" -ForegroundColor Green
    
    # Vérifier si le modèle est téléchargé
    Write-Host ""
    Write-Host "4️⃣  Vérification du modèle Qwen2-VL..." -ForegroundColor Yellow
    
    $modelList = ollama list 2>$null
    if ($modelList -match "qwen2-vl") {
        Write-Host "   ✅ Modèle Qwen2-VL déjà téléchargé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Modèle Qwen2-VL non téléchargé" -ForegroundColor Yellow
        Write-Host ""
        $download = Read-Host "   Voulez-vous télécharger le modèle maintenant ? (o/n)"
        
        if ($download -eq "o" -or $download -eq "O") {
            Write-Host ""
            Write-Host "   📥 Téléchargement du modèle Qwen2-VL 14B..." -ForegroundColor Cyan
            Write-Host "   ⚠️  Cela peut prendre du temps (modèle ~8GB)" -ForegroundColor Yellow
            Write-Host ""
            
            ollama pull qwen2-vl:14b
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "   ✅ Modèle téléchargé avec succès !" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "   ❌ Erreur lors du téléchargement" -ForegroundColor Red
            }
        } else {
            Write-Host "   ℹ️  Vous pourrez télécharger le modèle plus tard avec :" -ForegroundColor Cyan
            Write-Host "      ollama pull qwen2-vl:14b" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "   ❌ Ollama n'est pas installé !" -ForegroundColor Red
    Write-Host ""
    Write-Host "   📝 Pour installer Ollama :" -ForegroundColor Yellow
    Write-Host "   1. Allez sur https://ollama.ai/" -ForegroundColor White
    Write-Host "   2. Téléchargez Ollama pour Windows" -ForegroundColor White
    Write-Host "   3. Installez et redémarrez votre ordinateur" -ForegroundColor White
    Write-Host "   4. Relancez ce script" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "   Voulez-vous ouvrir le site d'Ollama ? (o/n)"
    if ($openBrowser -eq "o" -or $openBrowser -eq "O") {
        Start-Process "https://ollama.ai/"
    }
    
    exit 1
}

# Étape 5 : Créer le fichier .env
Write-Host ""
Write-Host "5️⃣  Configuration du serveur..." -ForegroundColor Yellow

if (-not (Test-Path "server/.env")) {
    @"
# Configuration Qwen2-VL Local AI
QWEN_PORT=3002
"@ | Out-File -FilePath "server/.env" -Encoding UTF8 -Append
    Write-Host "   ✅ Fichier .env créé" -ForegroundColor Green
} else {
    Write-Host "   ✅ Fichier .env existe déjà" -ForegroundColor Green
}

# Étape 6 : Créer le fichier .env.local
Write-Host ""
Write-Host "6️⃣  Configuration du frontend..." -ForegroundColor Yellow

$envLocalContent = Get-Content ".env.local" -Raw -ErrorAction SilentlyContinue

if ($envLocalContent -notmatch "VITE_QWEN_SERVER_URL") {
    @"

# Configuration Qwen2-VL Local AI
VITE_QWEN_SERVER_URL=http://localhost:3002
"@ | Out-File -FilePath ".env.local" -Encoding UTF8 -Append
    Write-Host "   ✅ Configuration ajoutée à .env.local" -ForegroundColor Green
} else {
    Write-Host "   ✅ Configuration déjà présente" -ForegroundColor Green
}

# Résumé
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Installation terminée !                              ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Démarrer le serveur IA :" -ForegroundColor White
Write-Host "   .\demarrer-qwen.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ou démarrer tout (IA + Web) :" -ForegroundColor White
Write-Host "   .\demarrer-tout.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Tester l'IA :" -ForegroundColor White
Write-Host "   Allez sur http://localhost:3000" -ForegroundColor Gray
Write-Host "   Utilisez les modules avec analyse d'image" -ForegroundColor Gray
Write-Host ""
