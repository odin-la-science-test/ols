# 🤖 Guide Qwen2-VL Local AI

## 🎯 Qu'est-ce que Qwen2-VL ?

Qwen2-VL 14B est un modèle d'IA vision-language développé par Alibaba Cloud. Il peut :
- ✅ Analyser des images scientifiques
- ✅ Répondre à des questions sur les images
- ✅ Comprendre le contexte scientifique
- ✅ Générer des descriptions détaillées
- ✅ Fonctionner 100% en local (pas besoin d'internet)

---

## 📊 Spécifications

| Caractéristique | Valeur |
|----------------|--------|
| Modèle | Qwen2-VL 14B |
| Taille | ~8 GB |
| Type | Vision + Language |
| Langues | Multilingue (FR, EN, etc.) |
| Contexte | 32K tokens |
| Vitesse | Dépend du GPU/CPU |

---

## 🚀 Installation

### Prérequis

1. **Node.js** (v18+)
2. **Ollama** (pour exécuter le modèle)
3. **8 GB RAM minimum** (16 GB recommandé)
4. **10 GB d'espace disque** (pour le modèle)

### Étape 1 : Installer Ollama

1. Allez sur https://ollama.ai/
2. Téléchargez Ollama pour Windows
3. Installez et redémarrez votre ordinateur

### Étape 2 : Installer Qwen2-VL

Exécutez le script d'installation :

```powershell
.\installer-qwen.ps1
```

Ce script va :
- ✅ Vérifier Node.js
- ✅ Installer les dépendances
- ✅ Vérifier Ollama
- ✅ Proposer de télécharger le modèle
- ✅ Configurer les fichiers .env

### Étape 3 : Télécharger le modèle (si pas fait)

```powershell
ollama pull qwen2-vl:14b
```

⚠️ Le téléchargement peut prendre 10-30 minutes selon votre connexion.

---

## 🎮 Utilisation

### Démarrer le serveur IA

```powershell
.\demarrer-qwen.ps1
```

### Démarrer tout (IA + Web)

```powershell
.\demarrer-tout.ps1
```

### Vérifier l'état

Allez sur : http://localhost:3002/api/health

---

## 💻 API

### 1. Health Check

```http
GET http://localhost:3002/api/health
```

Réponse :
```json
{
  "status": "ok",
  "service": "Qwen2-VL Local AI Server",
  "port": 3002,
  "ollama": {
    "installed": true,
    "modelDownloaded": true,
    "modelName": "qwen2-vl:14b"
  }
}
```

### 2. Analyser une image

```http
POST http://localhost:3002/api/analyze-image
Content-Type: multipart/form-data

image: [fichier image]
prompt: "Décris cette image scientifique"
```

Réponse :
```json
{
  "success": true,
  "analysis": "Cette image montre...",
  "model": "qwen2-vl:14b"
}
```

### 3. Chat (texte uniquement)

```http
POST http://localhost:3002/api/chat
Content-Type: application/json

{
  "message": "Qu'est-ce que la photosynthèse ?",
  "context": "Tu es un assistant scientifique"
}
```

Réponse :
```json
{
  "success": true,
  "response": "La photosynthèse est...",
  "model": "qwen2-vl:14b"
}
```

### 4. Télécharger le modèle

```http
POST http://localhost:3002/api/download-model
```

---

## 🔧 Intégration Frontend

### Service TypeScript

```typescript
import QwenService from '@/services/qwenService';

// Analyser une image
const result = await QwenService.analyzeImage(imageFile, 'Décris cette image');

// Analyser une image scientifique
const result = await QwenService.analyzeScientificImage(imageFile, 'microscopy');

// Poser une question
const result = await QwenService.askScientificQuestion('Qu\'est-ce que l\'ADN ?', 'biology');

// Vérifier l'état
const health = await QwenService.checkHealth();
```

### Types d'images supportés

- `microscopy` : Images de microscopie
- `gel` : Gels d'électrophorèse
- `graph` : Graphiques scientifiques
- `spectrum` : Spectres (IR, RMN, etc.)
- `other` : Autres images scientifiques

---

## 📁 Structure des Fichiers

```
project/
├── server/
│   ├── qwenServer.js          # Serveur IA
│   ├── models/                # Dossier des modèles (créé par Ollama)
│   └── uploads/               # Images temporaires
├── src/
│   └── services/
│       └── qwenService.ts     # Service frontend
├── installer-qwen.ps1         # Script d'installation
├── demarrer-qwen.ps1          # Démarrer l'IA
└── demarrer-tout.ps1          # Démarrer tout
```

---

## 🎨 Exemples d'Utilisation

### 1. Analyser une image de microscopie

```typescript
const imageFile = document.querySelector('input[type="file"]').files[0];
const result = await QwenService.analyzeScientificImage(imageFile, 'microscopy');

console.log(result.analysis);
// "Cette image de microscopie montre des cellules eucaryotes.
//  On observe le noyau, le cytoplasme, et la membrane cellulaire..."
```

### 2. Analyser un gel d'électrophorèse

```typescript
const result = await QwenService.analyzeScientificImage(gelImage, 'gel');

console.log(result.analysis);
// "Ce gel d'électrophorèse présente 5 pistes.
//  Les bandes sont bien séparées, avec des tailles estimées entre 100 et 500 bp..."
```

### 3. Poser une question scientifique

```typescript
const result = await QwenService.askScientificQuestion(
  'Explique la différence entre mitose et méiose',
  'biology'
);

console.log(result.response);
// "La mitose et la méiose sont deux types de division cellulaire..."
```

---

## ⚙️ Configuration

### Variables d'environnement

**server/.env** :
```env
QWEN_PORT=3002
```

**.env.local** :
```env
VITE_QWEN_SERVER_URL=http://localhost:3002
```

### Personnalisation

Vous pouvez modifier :
- Le port du serveur (par défaut 3002)
- Les prompts par défaut
- La taille maximale des images (par défaut 10MB)
- Le timeout des requêtes

---

## 🐛 Dépannage

### Problème : "Ollama n'est pas installé"

**Solution** :
1. Installez Ollama depuis https://ollama.ai/
2. Redémarrez votre ordinateur
3. Relancez le script d'installation

### Problème : "Modèle non téléchargé"

**Solution** :
```powershell
ollama pull qwen2-vl:14b
```

### Problème : "Serveur non disponible"

**Solution** :
1. Vérifiez que le serveur est démarré : `.\demarrer-qwen.ps1`
2. Vérifiez le port 3002 : http://localhost:3002/api/health
3. Vérifiez les logs du serveur

### Problème : "Analyse trop lente"

**Solutions** :
- Utilisez un GPU (NVIDIA avec CUDA)
- Réduisez la taille des images
- Utilisez un modèle plus petit (qwen2-vl:7b)

### Problème : "Erreur de mémoire"

**Solutions** :
- Fermez les applications inutiles
- Augmentez la RAM
- Utilisez un modèle plus petit

---

## 📊 Performance

### Temps de réponse (estimation)

| Configuration | Analyse d'image | Chat |
|--------------|----------------|------|
| CPU (i7) | 10-30s | 5-15s |
| GPU (RTX 3060) | 2-5s | 1-3s |
| GPU (RTX 4090) | 1-2s | <1s |

### Utilisation des ressources

| Ressource | Utilisation |
|-----------|-------------|
| RAM | 8-12 GB |
| VRAM (GPU) | 6-8 GB |
| CPU | 50-100% |
| Disque | 8 GB (modèle) |

---

## 🔒 Sécurité et Confidentialité

### Avantages du local

✅ **Confidentialité totale** : Vos données ne quittent jamais votre ordinateur
✅ **Pas de coûts API** : Gratuit après installation
✅ **Pas de limite de requêtes** : Utilisez autant que vous voulez
✅ **Fonctionne hors ligne** : Pas besoin d'internet

### Sécurité

- Les images sont supprimées après analyse
- Pas de logs persistants
- Pas de connexion externe
- Code open source

---

## 🚀 Prochaines Étapes

### Améliorations possibles

- [ ] Support de plusieurs modèles
- [ ] Interface de gestion du modèle
- [ ] Cache des résultats
- [ ] Batch processing
- [ ] Fine-tuning sur données scientifiques
- [ ] Export des analyses en PDF

### Intégrations

Le service Qwen peut être intégré dans :
- 🔬 Modules d'analyse d'images
- 📊 Analyse de graphiques
- 🧬 Analyse de séquences
- 📝 Génération de rapports
- 🎓 Assistant pédagogique

---

## 📚 Ressources

- **Ollama** : https://ollama.ai/
- **Qwen2-VL** : https://github.com/QwenLM/Qwen2-VL
- **Documentation** : https://ollama.ai/library/qwen2-vl
- **Modèles disponibles** : https://ollama.ai/library

---

## 💡 Conseils

### Pour de meilleures performances

1. **Utilisez un GPU** : 10x plus rapide qu'un CPU
2. **Optimisez les images** : Réduisez la taille avant analyse
3. **Soyez spécifique** : Des prompts précis donnent de meilleurs résultats
4. **Utilisez le cache** : Évitez d'analyser la même image plusieurs fois

### Pour de meilleurs résultats

1. **Images de qualité** : Haute résolution, bien éclairées
2. **Prompts détaillés** : Expliquez ce que vous cherchez
3. **Contexte scientifique** : Précisez le domaine (biologie, chimie, etc.)
4. **Itération** : Affinez vos questions selon les réponses

---

## 🎉 Conclusion

Qwen2-VL Local AI vous permet d'avoir une IA puissante directement sur votre ordinateur, sans dépendre de services cloud coûteux. C'est parfait pour :

- 🔬 Analyser des images scientifiques
- 📊 Interpréter des résultats
- 🎓 Apprendre et enseigner
- 🔒 Garder vos données confidentielles

**Commencez maintenant** :
```powershell
.\installer-qwen.ps1
.\demarrer-tout.ps1
```

Bon usage ! 🚀
