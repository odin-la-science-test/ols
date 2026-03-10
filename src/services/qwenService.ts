/**
 * Service Qwen2-VL Local AI
 * Communication avec le serveur IA local
 */

export interface QwenHealthStatus {
    status: string;
    service: string;
    port: number;
    ollama: {
        installed: boolean;
        modelDownloaded: boolean;
        modelName: string;
    };
}

export interface QwenAnalysisResult {
    success: boolean;
    analysis?: string;
    model?: string;
    error?: string;
    needsDownload?: boolean;
}

export interface QwenChatResult {
    success: boolean;
    response?: string;
    model?: string;
    error?: string;
    needsDownload?: boolean;
}

export class QwenService {
    private static baseUrl = import.meta.env.VITE_QWEN_SERVER_URL || 'http://localhost:3002';

    /**
     * Vérifier l'état du serveur
     */
    static async checkHealth(): Promise<QwenHealthStatus | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            if (!response.ok) {
                throw new Error('Serveur non disponible');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur health check:', error);
            return null;
        }
    }

    /**
     * Télécharger le modèle
     */
    static async downloadModel(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/download-model`, {
                method: 'POST'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur de téléchargement');
            }

            return await response.json();
        } catch (error: any) {
            console.error('Erreur téléchargement:', error);
            return {
                success: false,
                message: error.message || 'Erreur de téléchargement'
            };
        }
    }

    /**
     * Analyser une image
     */
    static async analyzeImage(
        imageFile: File,
        prompt?: string
    ): Promise<QwenAnalysisResult> {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            if (prompt) {
                formData.append('prompt', prompt);
            }

            const response = await fetch(`${this.baseUrl}/api/analyze-image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur d\'analyse',
                    needsDownload: error.needsDownload
                };
            }

            return await response.json();
        } catch (error: any) {
            console.error('Erreur analyse image:', error);
            return {
                success: false,
                error: error.message || 'Erreur de connexion au serveur'
            };
        }
    }

    /**
     * Chat avec le modèle (texte uniquement)
     */
    static async chat(
        message: string,
        context?: string
    ): Promise<QwenChatResult> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message, context })
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur de chat',
                    needsDownload: error.needsDownload
                };
            }

            return await response.json();
        } catch (error: any) {
            console.error('Erreur chat:', error);
            return {
                success: false,
                error: error.message || 'Erreur de connexion au serveur'
            };
        }
    }

    /**
     * Analyser une image scientifique avec un prompt spécialisé
     */
    static async analyzeScientificImage(
        imageFile: File,
        imageType: 'microscopy' | 'gel' | 'graph' | 'spectrum' | 'other' = 'other'
    ): Promise<QwenAnalysisResult> {
        const prompts = {
            microscopy: 'Analyse cette image de microscopie. Identifie les structures cellulaires, les organites visibles, et fournis une description détaillée des observations.',
            gel: 'Analyse ce gel d\'électrophorèse. Identifie les bandes, estime les tailles moléculaires, et commente la qualité de la séparation.',
            graph: 'Analyse ce graphique scientifique. Décris les axes, les tendances, les points de données importants, et tire des conclusions.',
            spectrum: 'Analyse ce spectre. Identifie les pics principaux, leurs positions, et interprète les résultats.',
            other: 'Analyse cette image scientifique en détail. Décris ce que tu observes et fournis une interprétation scientifique.'
        };

        return this.analyzeImage(imageFile, prompts[imageType]);
    }

    /**
     * Poser une question scientifique
     */
    static async askScientificQuestion(
        question: string,
        domain?: 'biology' | 'chemistry' | 'physics' | 'general'
    ): Promise<QwenChatResult> {
        const contexts = {
            biology: 'Tu es un assistant scientifique spécialisé en biologie.',
            chemistry: 'Tu es un assistant scientifique spécialisé en chimie.',
            physics: 'Tu es un assistant scientifique spécialisé en physique.',
            general: 'Tu es un assistant scientifique généraliste.'
        };

        const context = domain ? contexts[domain] : contexts.general;
        return this.chat(question, context);
    }
}

export default QwenService;
