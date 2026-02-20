/**
 * Service d'intégration Groq AI - 100% GRATUIT
 * Ultra-rapide, pas de carte bancaire requise
 * Limite : 30 requêtes/minute (largement suffisant)
 */

export interface GroqMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GroqConfig {
    model?: 'llama-3.3-70b-versatile' | 'llama-3.1-70b-versatile' | 'mixtral-8x7b-32768' | 'openai/gpt-oss-120b';
    temperature?: number;
    maxTokens?: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface GroqResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

class GroqService {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.groq.com/openai/v1';
    private conversationHistory: GroqMessage[] = [];

    /**
     * Configure l'API key Groq
     */
    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        localStorage.setItem('groq_api_key', apiKey);
    }

    /**
     * Récupère l'API key stockée
     */
    getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('groq_api_key') || '';
        }
        return this.apiKey;
    }

    /**
     * Vérifie si l'API key est configurée
     */
    isConfigured(): boolean {
        return this.getApiKey().length > 0;
    }

    /**
     * Envoie un message à Groq
     */
    async sendMessage(
        message: string,
        config?: GroqConfig
    ): Promise<GroqResponse> {
        const apiKey = this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API Key Groq non configurée. Obtenez-en une gratuitement sur https://console.groq.com');
        }

        // Ajouter le message à l'historique
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: config?.model || 'llama-3.3-70b-versatile',
                    messages: this.conversationHistory,
                    temperature: config?.temperature ?? 0.7,
                    max_tokens: config?.maxTokens ?? 2000,
                    ...(config?.reasoningEffort && { reasoning_effort: config.reasoningEffort })
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Erreur API: ${response.status}`);
            }

            const data = await response.json();
            
            const assistantMessage: GroqMessage = {
                role: 'assistant',
                content: data.choices[0].message.content
            };

            this.conversationHistory.push(assistantMessage);

            return {
                content: data.choices[0].message.content,
                model: data.model,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                }
            };
        } catch (error: any) {
            console.error('Erreur Groq:', error);
            throw error;
        }
    }

    /**
     * Envoie un message avec streaming (réponse en temps réel)
     */
    async *sendMessageStream(
        message: string,
        config?: GroqConfig
    ): AsyncGenerator<string, void, unknown> {
        const apiKey = this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API Key Groq non configurée');
        }

        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: config?.model || 'llama-3.3-70b-versatile',
                    messages: this.conversationHistory,
                    temperature: config?.temperature ?? 0.7,
                    max_tokens: config?.maxTokens ?? 2000,
                    stream: true,
                    ...(config?.reasoningEffort && { reasoning_effort: config.reasoningEffort })
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0]?.delta?.content || '';
                                if (content) {
                                    fullContent += content;
                                    yield content;
                                }
                            } catch (e) {
                                // Ignorer les erreurs de parsing
                            }
                        }
                    }
                }
            }

            this.conversationHistory.push({
                role: 'assistant',
                content: fullContent
            });
        } catch (error) {
            console.error('Erreur streaming:', error);
            throw error;
        }
    }

    /**
     * Analyse scientifique avec contexte spécialisé
     */
    async analyzeScientific(
        data: string,
        context: 'protein' | 'dna' | 'statistics' | 'chemistry' | 'general'
    ): Promise<string> {
        const systemPrompts = {
            protein: 'Tu es un expert en biologie moléculaire et protéomique. Analyse les données de manière scientifique et rigoureuse.',
            dna: 'Tu es un expert en génétique et biologie moléculaire. Fournis une analyse détaillée et précise.',
            statistics: 'Tu es un expert en biostatistiques. Analyse les données avec rigueur statistique.',
            chemistry: 'Tu es un expert en chimie et biochimie. Fournis une analyse chimique détaillée.',
            general: 'Tu es un assistant scientifique expert. Analyse les données de manière complète et précise.'
        };

        // Ajouter le contexte système temporairement
        const tempHistory = [...this.conversationHistory];
        this.conversationHistory = [{
            role: 'system',
            content: systemPrompts[context]
        }];

        const response = await this.sendMessage(data);
        
        // Restaurer l'historique
        this.conversationHistory = tempHistory;
        this.conversationHistory.push(
            { role: 'user', content: data },
            { role: 'assistant', content: response.content }
        );

        return response.content;
    }

    /**
     * Génère du code scientifique
     */
    async generateCode(
        description: string,
        language: 'python' | 'r' | 'javascript' | 'matlab'
    ): Promise<string> {
        const prompt = `Génère du code ${language} pour: ${description}

Fournis uniquement le code, bien commenté et prêt à l'emploi. Pas d'explications supplémentaires.`;

        const tempHistory = [...this.conversationHistory];
        this.conversationHistory = [{
            role: 'system',
            content: 'Tu es un expert en programmation scientifique. Génère du code propre, efficace et bien documenté.'
        }];

        const response = await this.sendMessage(prompt);
        this.conversationHistory = tempHistory;

        return response.content;
    }

    /**
     * Aide à la rédaction scientifique
     */
    async helpWriting(
        text: string,
        task: 'improve' | 'translate' | 'summarize' | 'expand'
    ): Promise<string> {
        const tasks = {
            improve: 'Améliore ce texte scientifique en termes de clarté, précision et style académique',
            translate: 'Traduis ce texte scientifique en anglais académique de haute qualité',
            summarize: 'Résume ce texte scientifique en conservant tous les points clés',
            expand: 'Développe ce texte scientifique avec plus de détails et d\'explications'
        };

        const tempHistory = [...this.conversationHistory];
        this.conversationHistory = [{
            role: 'system',
            content: 'Tu es un expert en rédaction scientifique et communication académique.'
        }];

        const response = await this.sendMessage(`${tasks[task]}:\n\n${text}`);
        this.conversationHistory = tempHistory;

        return response.content;
    }

    /**
     * Explique un concept scientifique
     */
    async explainConcept(
        concept: string,
        level: 'simple' | 'intermediate' | 'advanced'
    ): Promise<string> {
        const levels = {
            simple: 'Explique ce concept scientifique de manière simple et accessible, comme à un étudiant de première année.',
            intermediate: 'Explique ce concept scientifique avec un niveau de détail intermédiaire, pour un étudiant de master.',
            advanced: 'Explique ce concept scientifique de manière approfondie et technique, pour un chercheur.'
        };

        const tempHistory = [...this.conversationHistory];
        this.conversationHistory = [{
            role: 'system',
            content: 'Tu es un enseignant scientifique expert capable d\'adapter ton niveau d\'explication.'
        }];

        const response = await this.sendMessage(`${levels[level]}\n\nConcept: ${concept}`);
        this.conversationHistory = tempHistory;

        return response.content;
    }

    /**
     * Réinitialise la conversation
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Récupère l'historique
     */
    getHistory(): GroqMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * Définit un historique personnalisé
     */
    setHistory(history: GroqMessage[]) {
        this.conversationHistory = [...history];
    }

    /**
     * Sauvegarde l'historique
     */
    saveHistory(name: string) {
        const saved = JSON.parse(localStorage.getItem('groq_histories') || '{}');
        saved[name] = {
            messages: this.conversationHistory,
            timestamp: Date.now()
        };
        localStorage.setItem('groq_histories', JSON.stringify(saved));
    }

    /**
     * Charge un historique sauvegardé
     */
    loadHistory(name: string): boolean {
        const saved = JSON.parse(localStorage.getItem('groq_histories') || '{}');
        if (saved[name]) {
            this.conversationHistory = saved[name].messages;
            return true;
        }
        return false;
    }

    /**
     * Supprime un historique
     */
    deleteHistory(name: string) {
        const saved = JSON.parse(localStorage.getItem('groq_histories') || '{}');
        delete saved[name];
        localStorage.setItem('groq_histories', JSON.stringify(saved));
    }

    /**
     * Liste les historiques sauvegardés
     */
    listHistories(): { id: string; name: string; timestamp: number; messageCount: number }[] {
        const saved = JSON.parse(localStorage.getItem('groq_histories') || '{}');
        return Object.entries(saved).map(([name, data]: [string, any]) => ({
            id: name,
            name,
            timestamp: data.timestamp,
            messageCount: data.messages.length
        }));
    }
}

export const groqService = new GroqService();
