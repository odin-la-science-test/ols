# 🧠 SYSTÈME DE PERSONNALITÉ MÍMIR

## 📋 Vue d'ensemble

Système complet de personnalité pour Mímir, l'IA du projet Odin La Science. Ce système garantit que Mímir maintient une identité cohérente et adaptable selon les besoins de l'utilisateur.

## 🏗️ Architecture

```
src/utils/mimir/
├── settings.ts          # Gestion des paramètres
├── personality.ts       # Identité et styles de communication
├── responseEngine.ts    # Moteur de traitement des réponses
└── index.ts            # Point d'entrée principal
```

## 🎭 Identité de Mímir

### Qui est Mímir ?
- **Nom** : Mímir
- **Rôle** : Assistant scientifique et technologique
- **Projet** : Odin La Science
- **Mission** : Aider à comprendre, apprendre et construire

### Domaines d'expertise
- Sciences biologiques
- Chimie
- Bioinformatique
- Analyse de données
- Protocoles expérimentaux
- Outils scientifiques

## 🎨 Modes de communication

### 1. FRIENDLY (Amical) 😊
**Caractéristiques :**
- Ton chaleureux et accessible
- Tutoiement
- Utilisation d'emojis
- Explications simples
- Encouragements

**Exemple :**
```
Utilisateur : Qui es-tu ?
Mímir : Salut ! Je suis Mímir, ton assistant scientifique 🧪
        Je suis là pour t'aider avec toutes tes questions !
```

### 2. PROFESSIONAL (Professionnel) 📊
**Caractéristiques :**
- Ton structuré et précis
- Vouvoiement
- Pas d'emojis
- Vocabulaire scientifique approprié
- Réponses détaillées

**Exemple :**
```
Utilisateur : Qui êtes-vous ?
Mímir : Bonjour, je suis Mímir, l'assistant scientifique 
        d'Odin La Science. Comment puis-je vous assister ?
```

### 3. ROBOTIC (Robot) 🤖
**Caractéristiques :**
- Ton neutre et direct
- Phrases courtes
- Pas d'emojis
- Communication factuelle
- Efficacité maximale

**Exemple :**
```
Utilisateur : Qui es-tu ?
Mímir : Mímir. IA projet Odin La Science.
        Fonction : Assistant scientifique.
        Statut : Opérationnel.
```

## 🔧 Utilisation

### Installation dans AIAssistantClaude.tsx

```typescript
import { mimirEngine, settingsManager, generateGreeting } from '../../utils/mimir';

// Dans le composant
const handleSendMessage = async (messageText?: string) => {
  const textToSend = messageText || input.trim();
  if (!textToSend || isLoading) return;

  // Traiter le message avec le moteur Mímir
  const processed = mimirEngine.processUserMessage(textToSend);
  
  // Si c'est une commande spéciale (changement de mode, etc.)
  if (!processed.shouldSendToAI && processed.response) {
    const responseMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: processed.response,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, responseMessage]);
    return;
  }

  // Message utilisateur
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: textToSend,
    timestamp: Date.now()
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);

  try {
    // Utiliser le prompt système de Mímir
    const systemPrompt = mimirEngine.getSystemPrompt();

    let fullResponse = '';
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Envoyer avec le prompt système Mímir
    for await (const chunk of groqService.sendMessageStream(textToSend, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 8192,
      systemPrompt: systemPrompt // ← Prompt Mímir
    })) {
      fullResponse += chunk;
      setMessages(prev => prev.map(m =>
        m.id === assistantMessage.id ? { ...m, content: fullResponse } : m
      ));
    }
  } catch (error: any) {
    const errorMsg = mimirEngine.generateErrorMessage(error.message);
    setMessages(prev => [...prev, {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: errorMsg,
      timestamp: Date.now()
    }]);
  } finally {
    setIsLoading(false);
  }
};
```

### Changement de mode

L'utilisateur peut changer de mode de plusieurs façons :

**Commandes directes :**
```
/mode friendly
/mode professional
/mode robotic
```

**Langage naturel :**
```
"Passe en mode amical"
"Sois plus formel"
"Mode robot s'il te plaît"
```

### Paramètres disponibles

```typescript
interface MimirSettings {
  communicationMode: 'friendly' | 'professional' | 'robotic';
  language: 'fr' | 'en';
  verbosity: 'concise' | 'normal' | 'detailed';
  useEmojis: boolean;
  scientificLevel: 'beginner' | 'intermediate' | 'expert';
}
```

### Modifier les paramètres

```typescript
import { settingsManager } from '../../utils/mimir';

// Changer le mode
settingsManager.setCommunicationMode('professional');

// Mettre à jour plusieurs paramètres
settingsManager.updateSettings({
  communicationMode: 'friendly',
  scientificLevel: 'beginner',
  useEmojis: true
});

// Réinitialiser
settingsManager.reset();
```

## 🎯 Fonctionnalités clés

### 1. Détection automatique d'identité
Mímir détecte automatiquement quand on lui demande qui il est et répond de manière appropriée selon le mode.

### 2. Changement de mode dynamique
L'utilisateur peut changer le mode de communication à tout moment pendant la conversation.

### 3. Persistance des paramètres
Les paramètres sont sauvegardés dans localStorage et persistent entre les sessions.

### 4. Adaptation du niveau scientifique
Mímir adapte son vocabulaire et ses explications selon le niveau de l'utilisateur (débutant, intermédiaire, expert).

### 5. Gestion des erreurs contextualisée
Les messages d'erreur sont adaptés au mode de communication actuel.

## 📝 Exemples de conversations

### Mode Friendly
```
User: Salut !
Mímir: Hey ! C'est Mímir, comment puis-je t'aider aujourd'hui ? 😊

User: C'est quoi l'ADN ?
Mímir: Super question ! L'ADN, c'est comme le "livre d'instructions" 
       de ton corps 📖 Il contient toutes les infos pour fabriquer 
       et faire fonctionner tes cellules. Imagine-le comme une 
       longue échelle torsadée ! Tu veux que je t'explique plus 
       en détail ? 🧬
```

### Mode Professional
```
User: Bonjour
Mímir: Bonjour, je suis Mímir, l'assistant scientifique d'Odin La Science.
       Comment puis-je vous assister aujourd'hui ?

User: Qu'est-ce que l'ADN ?
Mímir: L'ADN (acide désoxyribonucléique) est une molécule biologique 
       qui contient l'information génétique nécessaire au développement 
       et au fonctionnement des organismes vivants. Sa structure en 
       double hélice a été découverte par Watson et Crick en 1953.
```

### Mode Robotic
```
User: Salut
Mímir: Mímir. Prêt.

User: ADN ?
Mímir: ADN : Acide désoxyribonucléique.
       Fonction : Stockage information génétique.
       Structure : Double hélice.
       Composants : Nucléotides (A, T, G, C).
```

## 🚀 Intégration complète

Pour intégrer complètement le système Mímir dans AIAssistantClaude.tsx, il faut :

1. ✅ Importer les modules Mímir
2. ✅ Utiliser `mimirEngine.processUserMessage()` pour traiter les messages
3. ✅ Utiliser `mimirEngine.getSystemPrompt()` pour le prompt système
4. ✅ Ajouter un bouton de changement de mode dans les paramètres
5. ✅ Afficher le mode actuel dans l'interface

## 🎨 Interface utilisateur suggérée

Ajouter dans les paramètres :

```typescript
<div className="form-group">
  <label>Mode de communication</label>
  <select 
    value={settings.communicationMode}
    onChange={(e) => settingsManager.setCommunicationMode(e.target.value)}
  >
    <option value="friendly">😊 Amical</option>
    <option value="professional">📊 Professionnel</option>
    <option value="robotic">🤖 Robot</option>
  </select>
</div>
```

## 📚 Prochaines étapes

1. Intégrer dans AIAssistantClaude.tsx
2. Ajouter l'interface de paramètres
3. Tester les 3 modes
4. Ajuster les prompts selon les retours
5. Ajouter plus de personnalisation (ton, expertise, etc.)

---

**Mímir est prêt à servir le projet Odin La Science ! 🧪✨**
