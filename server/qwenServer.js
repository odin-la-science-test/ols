/**
 * Serveur IA Local - Qwen2-VL 14B
 * Modèle vision-language pour analyse scientifique
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.QWEN_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configuration du stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Chemin vers le modèle
const MODEL_PATH = path.join(__dirname, 'models', 'qwen2-vl-14b');
const OLLAMA_MODEL = 'qwen2-vl:14b';

/**
 * Vérifier si Ollama est installé
 */
function checkOllamaInstalled() {
    return new Promise((resolve) => {
        const process = spawn('ollama', ['--version']);
        process.on('error', () => resolve(false));
        process.on('close', (code) => resolve(code === 0));
    });
}

/**
 * Vérifier si le modèle est téléchargé
 */
async function checkModelDownloaded() {
    return new Promise((resolve) => {
        const process = spawn('ollama', ['list']);
        let output = '';
        
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.on('close', () => {
            resolve(output.includes('qwen2-vl'));
        });
        
        process.on('error', () => resolve(false));
    });
}

/**
 * Télécharger le modèle Qwen2-VL
 */
function downloadModel() {
    return new Promise((resolve, reject) => {
        console.log('📥 Téléchargement du modèle Qwen2-VL 14B...');
        console.log('⚠️  Cela peut prendre du temps (modèle ~8GB)');
        
        const process = spawn('ollama', ['pull', OLLAMA_MODEL]);
        
        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        
        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Modèle téléchargé avec succès !');
                resolve(true);
            } else {
                reject(new Error('Échec du téléchargement'));
            }
        });
    });
}

/**
 * Analyser une image avec Qwen2-VL
 */
async function analyzeImage(imagePath, prompt) {
    return new Promise((resolve, reject) => {
        const fullPrompt = JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            images: [imagePath],
            stream: false
        });

        const process = spawn('ollama', ['run', OLLAMA_MODEL, '--format', 'json']);
        
        let output = '';
        let errorOutput = '';

        process.stdin.write(fullPrompt);
        process.stdin.end();

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result.response || result);
                } catch (e) {
                    resolve(output);
                }
            } else {
                reject(new Error(errorOutput || 'Erreur d\'analyse'));
            }
        });
    });
}

/**
 * Route : Health check
 */
app.get('/api/health', async (req, res) => {
    const ollamaInstalled = await checkOllamaInstalled();
    const modelDownloaded = ollamaInstalled ? await checkModelDownloaded() : false;

    res.json({
        status: 'ok',
        service: 'Qwen2-VL Local AI Server',
        port: PORT,
        ollama: {
            installed: ollamaInstalled,
            modelDownloaded: modelDownloaded,
            modelName: OLLAMA_MODEL
        }
    });
});

/**
 * Route : Télécharger le modèle
 */
app.post('/api/download-model', async (req, res) => {
    try {
        const ollamaInstalled = await checkOllamaInstalled();
        
        if (!ollamaInstalled) {
            return res.status(400).json({
                success: false,
                error: 'Ollama n\'est pas installé',
                instructions: 'Installez Ollama depuis https://ollama.ai/'
            });
        }

        const modelDownloaded = await checkModelDownloaded();
        
        if (modelDownloaded) {
            return res.json({
                success: true,
                message: 'Modèle déjà téléchargé',
                alreadyDownloaded: true
            });
        }

        // Télécharger en arrière-plan
        downloadModel()
            .then(() => {
                console.log('✅ Téléchargement terminé');
            })
            .catch((error) => {
                console.error('❌ Erreur téléchargement:', error);
            });

        res.json({
            success: true,
            message: 'Téléchargement démarré en arrière-plan',
            downloading: true
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Route : Analyser une image
 */
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Aucune image fournie'
            });
        }

        const { prompt } = req.body;
        const imagePath = req.file.path;

        console.log('🔍 Analyse de l\'image:', req.file.originalname);
        console.log('📝 Prompt:', prompt);

        // Vérifier que le modèle est disponible
        const modelDownloaded = await checkModelDownloaded();
        if (!modelDownloaded) {
            return res.status(400).json({
                success: false,
                error: 'Modèle non téléchargé',
                needsDownload: true
            });
        }

        // Analyser l'image
        const analysis = await analyzeImage(imagePath, prompt || 'Décris cette image scientifique en détail.');

        // Supprimer l'image temporaire
        fs.unlinkSync(imagePath);

        res.json({
            success: true,
            analysis: analysis,
            model: OLLAMA_MODEL
        });

    } catch (error) {
        console.error('❌ Erreur analyse:', error);
        
        // Nettoyer l'image en cas d'erreur
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Route : Chat avec le modèle (texte uniquement)
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message requis'
            });
        }

        const modelDownloaded = await checkModelDownloaded();
        if (!modelDownloaded) {
            return res.status(400).json({
                success: false,
                error: 'Modèle non téléchargé',
                needsDownload: true
            });
        }

        const fullPrompt = context 
            ? `Contexte: ${context}\n\nQuestion: ${message}`
            : message;

        const response = await new Promise((resolve, reject) => {
            const process = spawn('ollama', ['run', OLLAMA_MODEL, fullPrompt]);
            
            let output = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error('Erreur de génération'));
                }
            });
        });

        res.json({
            success: true,
            response: response,
            model: OLLAMA_MODEL
        });

    } catch (error) {
        console.error('❌ Erreur chat:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, async () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 Serveur IA Local Qwen2-VL démarré !                  ║
║                                                            ║
║   🌐 Port: ${PORT}                                           ║
║   🧠 Modèle: Qwen2-VL 14B                                 ║
║   📊 Capacités: Vision + Language                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Vérifier l'installation
    const ollamaInstalled = await checkOllamaInstalled();
    
    if (!ollamaInstalled) {
        console.log('');
        console.log('⚠️  ATTENTION : Ollama n\'est pas installé !');
        console.log('');
        console.log('Pour installer Ollama :');
        console.log('1. Allez sur https://ollama.ai/');
        console.log('2. Téléchargez et installez Ollama');
        console.log('3. Redémarrez ce serveur');
        console.log('');
    } else {
        console.log('✅ Ollama installé');
        
        const modelDownloaded = await checkModelDownloaded();
        
        if (!modelDownloaded) {
            console.log('');
            console.log('📥 Modèle Qwen2-VL non téléchargé');
            console.log('');
            console.log('Pour télécharger le modèle :');
            console.log(`   POST http://localhost:${PORT}/api/download-model`);
            console.log('');
            console.log('Ou manuellement :');
            console.log(`   ollama pull ${OLLAMA_MODEL}`);
            console.log('');
        } else {
            console.log('✅ Modèle Qwen2-VL prêt');
            console.log('');
            console.log('🎉 Tout est prêt ! Vous pouvez utiliser l\'IA.');
            console.log('');
        }
    }
});

module.exports = app;
