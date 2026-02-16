import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

interface WebLLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WebLLMResponse {
  success: boolean;
  content: string;
  error?: string;
}

class WebLLMService {
  private generator: any = null;
  private isLoading: boolean = false;
  private isReady: boolean = false;
  private loadingProgress: number = 0;

  async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isReady) return;
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      this.generator = await pipeline(
        'text-generation',
        'Xenova/Qwen2-0.5B-Instruct',
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
              this.loadingProgress = Math.round((progress.loaded / progress.total) * 100);
              if (onProgress) onProgress(this.loadingProgress);
            }
          }
        }
      );
      
      this.isReady = true;
      this.isLoading = false;
    } catch (error) {
      console.error('Failed to load model:', error);
      this.isLoading = false;
      throw error;
    }
  }

  async chat(
    userMessage: string,
    conversationHistory: WebLLMMessage[] = [],
    onProgress?: (progress: number) => void
  ): Promise<WebLLMResponse> {
    if (!this.isReady) {
      await this.initialize(onProgress);
    }

    try {
      const systemPrompt = `Tu es Mimir, un assistant IA scientifique expert en biologie moléculaire, biochimie, microbiologie et recherche scientifique. Tu fournis des réponses précises, détaillées et pratiques en français.`;

      const messages: WebLLMMessage[] = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-4),
        { role: 'user' as const, content: userMessage }
      ];

      const prompt = this.formatPrompt(messages);

      const output = await this.generator(prompt, {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      });

      const generatedText = output[0]?.generated_text || '';

      return {
        success: true,
        content: generatedText.trim()
      };
    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        content: 'Erreur lors de la génération de la réponse.',
        error: String(error)
      };
    }
  }

  private formatPrompt(messages: WebLLMMessage[]): string {
    return messages
      .map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`)
      .join('\n') + '\n<|im_start|>assistant\n';
  }

  getStatus(): { isReady: boolean; isLoading: boolean; progress: number } {
    return {
      isReady: this.isReady,
      isLoading: this.isLoading,
      progress: this.loadingProgress
    };
  }
}

export const webLLM = new WebLLMService();
export type { WebLLMMessage, WebLLMResponse };
