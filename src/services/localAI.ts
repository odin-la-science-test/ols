// Mimir AI - Algorithme Local Intelligent
interface AIMessage { role: 'system' | 'user' | 'assistant'; content: string; }
interface AIResponse { success: boolean; content: string; error?: string; }
interface KnowledgeEntry { keywords: string[]; category: string; response: string; priority: number; }

class LocalAIService {
  private knowledgeBase: KnowledgeEntry[] = [
    { keywords: ['pcr'], category: 'bio', priority: 10, response: ' PCR amplifie l ADN en 3 étapes : Dénaturation 95°C, Hybridation 50-65°C, Élongation 72°C' },
    { keywords: ['bonjour', 'salut'], category: 'greeting', priority: 5, response: ' Bonjour ! Je suis Mimir. Pose-moi une question !' }
  ];

  async chat(userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    const matches = this.findMatches(userMessage);
    if (matches.length > 0) {
      return { success: true, content: matches[0].response };
    }
    return { success: true, content: 'Je peux t aider avec la science, la programmation, et plus encore !' };
  }

  private findMatches(query: string): KnowledgeEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.knowledgeBase.filter(entry => 
      entry.keywords.some(kw => lowerQuery.includes(kw.toLowerCase()))
    ).sort((a, b) => b.priority - a.priority);
  }

  async initialize(): Promise<void> { return Promise.resolve(); }
  getStatus() { return { isReady: true, isLoading: false, progress: 100 }; }
  setApiKey(): void {}
  getApiKey(): string { return 'LOCAL'; }
}

export const localAI = new LocalAIService();
export type { AIMessage, AIResponse };
