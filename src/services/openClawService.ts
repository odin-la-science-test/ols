/**
 * Service d'intégration OpenClaw AI
 * Aucune restriction - accès complet à toutes les fonctionnalités
 */

export interface OpenClawMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}

export interface OpenClawConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}

export interface OpenClawResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

class OpenClawService {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.openclaw.ai/v1'; // URL à ajuster selon l'API réelle
    private defaultModel: string = 'openclaw-1';
    private conversationHistory: OpenClawMessage[] = [];

    /**
     * Configure l'API key
     */
    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        localStorage.setItem('openclaw_api_key', apiKey);
    }

    /**
     * Récupère l'API key stockée
     */
    getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('openclaw_api_key') || '';
        }
        return this.apiKey;
    }

    /**
     * Envoie un message à OpenClaw
     */
    async sendMessage(
        message: string,
        config?: OpenClawConfig
    ): Promise<OpenClawResponse> {
        const apiKey = config?.apiKey || this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API Key OpenClaw non configurée');
        }

        // Ajouter le message à l'historique
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: config?.model || this.defaultModel,
                    messages: [
                        ...(config?.systemPrompt ? [{
                            role: 'system',
                            content: config.systemPrompt
                        }] : []),
                        ...this.conversationHistory
                    ],
                    temperature: config?.temperature ?? 0.7,
                    max_tokens: config?.maxTokens ?? 2000,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            const assistantMessage: OpenClawMessage = {
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: Date.now()
            };

            this.conversationHistory.push(assistantMessage);

            return {
                content: data.choices[0].message.content,
                model: data.model,
                usage: data.usage
            };
        } catch (error) {
            console.error('Erreur OpenClaw:', error);
            throw error;
        }
    }

    /**
     * Envoie un message en streaming
     */
    async *sendMessageStream(
        message: string,
        config?: OpenClawConfig
    ): AsyncGenerator<string, void, unknown> {
        const apiKey = config?.apiKey || this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API Key OpenClaw non configurée');
        }

        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: config?.model || this.defaultModel,
                    messages: [
                        ...(config?.systemPrompt ? [{
                            role: 'system',
                            content: config.systemPrompt
                        }] : []),
                        ...this.conversationHistory
                    ],
                    temperature: config?.temperature ?? 0.7,
                    max_tokens: config?.maxTokens ?? 2000,
                    stream: true
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
                                console.error('Erreur parsing:', e);
                            }
                        }
                    }
                }
            }

            this.conversationHistory.push({
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Erreur streaming:', error);
            throw error;
        }
    }

    /**
     * Analyse scientifique avec OpenClaw
     */
    async analyzeScientificData(
        data: string,
        analysisType: 'protein' | 'dna' | 'statistics' | 'general'
    ): Promise<string> {
        const prompts = {
            protein: 'Tu es un expert en biologie moléculaire et protéomique. Analyse les données suivantes et fournis une interprétation scientifique détaillée.',
            dna: 'Tu es un expert en génétique et biologie moléculaire. Analyse la séquence ADN suivante et fournis des insights scientifiques.',
            statistics: 'Tu es un expert en biostatistiques. Analyse les données suivantes et fournis une interprétation statistique rigoureuse.',
            general: 'Tu es un assistant scientifique expert. Analyse les données suivantes et fournis une analyse complète.'
        };

        const response = await this.sendMessage(data, {
            systemPrompt: prompts[analysisType]
        });

        return response.content;
    }

    /**
     * Génère du code scientifique
     */
    async generateCode(
        description: string,
        language: 'python' | 'r' | 'javascript' | 'matlab'
    ): Promise<string> {
        const response = await this.sendMessage(
            `Génère du code ${language} pour: ${description}. Fournis uniquement le code, bien commenté et prêt à l'emploi.`,
            {
                systemPrompt: 'Tu es un expert en programmation scientifique. Génère du code propre, efficace et bien documenté.'
            }
        );

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
            translate: 'Traduis ce texte scientifique en anglais académique',
            summarize: 'Résume ce texte scientifique en conservant les points clés',
            expand: 'Développe ce texte scientifique avec plus de détails et d\'explications'
        };

        const response = await this.sendMessage(
            `${tasks[task]}: ${text}`,
            {
                systemPrompt: 'Tu es un expert en rédaction scientifique et communication académique.'
            }
        );

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
    getHistory(): OpenClawMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * Sauvegarde l'historique
     */
    saveHistory(name: string) {
        const saved = JSON.parse(localStorage.getItem('openclaw_histories') || '{}');
        saved[name] = {
            messages: this.conversationHistory,
            timestamp: Date.now()
        };
        localStorage.setItem('openclaw_histories', JSON.stringify(saved));
    }

    /**
     * Charge un historique sauvegardé
     */
    loadHistory(name: string) {
        const saved = JSON.parse(localStorage.getItem('openclaw_histories') || '{}');
        if (saved[name]) {
            this.conversationHistory = saved[name].messages;
        }
    }

    /**
     * Liste les historiques sauvegardés
     */
    listHistories(): { name: string; timestamp: number; messageCount: number }[] {
        const saved = JSON.parse(localStorage.getItem('openclaw_histories') || '{}');
        return Object.entries(saved).map(([name, data]: [string, any]) => ({
            name,
            timestamp: data.timestamp,
            messageCount: data.messages.length
        }));
    }
}

export const openClawService = new OpenClawService();
