// Mimir AI - Terminal Style Interface (Desktop)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Settings, Trash2, Download } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const Mimir = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'system',
      content: 'Mimir AI - Qwen2.5-7B Scientific Assistant',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('hf_api_key') || '');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const callQwenAPI = async (userQuery: string): Promise<string> => {
    const HF_API_KEY = apiKey || 'hf_placeholder';
    
    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    const systemPrompt = 'Tu es Mimir, un assistant IA scientifique expert en biologie moléculaire, biochimie, microbiologie et recherche scientifique. Tu fournis des réponses précises, détaillées et pratiques. Réponds toujours en français.';

    try {
      const messages_formatted = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userQuery }
      ];

      const prompt = messages_formatted
        .map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`)
        .join('\n') + '\n<|im_start|>assistant\n';

      const response = await fetch(
        'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.1,
              return_full_text: false,
              do_sample: true
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 503) {
          return "Model is loading, please retry in 20s...";
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

      if (!generatedText) {
        throw new Error('Unexpected response format');
      }

      return generatedText.trim();
    } catch (error) {
      console.error('Qwen API Error:', error);
      return getFallbackResponse(userQuery);
    }
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('pcr')) {
      return `PCR (Polymerase Chain Reaction)

Amplification d'ADN en 3 étapes cycliques:
1. Dénaturation (95°C, 30s) - séparation des brins
2. Hybridation (50-65°C, 30s) - fixation des amorces
3. Élongation (72°C, 1min/kb) - synthèse par Taq polymérase

Optimisation:
- Amorces 18-25 nt, Tm similaire (±2°C)
- MgCl₂: 1.5-2.5 mM
- 25-35 cycles
- Contrôles +/- obligatoires`;
    }
    
    if (q.includes('crispr')) {
      return `CRISPR-Cas9 - Édition génomique

Composants:
- Cas9: nucléase (ciseaux moléculaires)
- gRNA: guide ARN (20 nt + scaffold)
- PAM: séquence NGG requise

Mécanisme:
1. gRNA guide Cas9 vers la cible
2. Coupure double-brin
3. Réparation: NHEJ (insertion/délétion) ou HDR (correction précise)

Applications: thérapie génique, modèles animaux, amélioration cultures`;
    }
    
    return `Mimir AI - Qwen2.5-7B

Configure your Hugging Face API key in settings to unlock full capabilities.

I can help with: PCR, CRISPR, Western Blot, cell culture, cloning, NGS sequencing, microscopy, statistics, and more!`;
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const aiResponse = await callQwenAPI(currentInput);
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Error occurred. Check your API key in settings.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: 1,
      role: 'system',
      content: 'Mimir AI - Qwen2.5-7B Scientific Assistant',
      timestamp: new Date()
    }]);
  };

  const saveApiKey = () => {
    localStorage.setItem('hf_api_key', apiKey);
    setShowSettings(false);
    alert('✓ API key saved');
  };

  const exportChat = () => {
    const chatText = messages
      .map(m => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimir-chat-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1117',
      color: '#c9d1d9',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '14px'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/hugin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{ color: '#58a6ff', fontWeight: 600 }}>mimir</span>
          <span style={{ color: '#8b949e', fontSize: '12px' }}>qwen2.5-7b</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={exportChat}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <Download size={18} />
          </button>
          <button
            onClick={clearConversation}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={{
          padding: '1.5rem',
          background: '#161b22',
          borderBottom: '1px solid #30363d'
        }}>
          <div style={{ marginBottom: '0.75rem', color: '#8b949e', fontSize: '12px' }}>
            HUGGING FACE API KEY
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_..."
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#c9d1d9',
                fontSize: '13px',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={saveApiKey}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#238636',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Save
            </button>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#8b949e', fontSize: '11px' }}>
            Get your key at huggingface.co/settings/tokens
          </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          paddingBottom: '120px'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '1.5rem',
              lineHeight: 1.7
            }}
          >
            <div style={{
              color: msg.role === 'system' ? '#58a6ff' : msg.role === 'user' ? '#7ee787' : '#f0883e',
              marginBottom: '0.5rem',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {msg.role === 'system' ? '# ' : msg.role === 'user' ? '> ' : '< '}
              {msg.role.toUpperCase()}
            </div>
            <div style={{
              color: '#c9d1d9',
              whiteSpace: 'pre-wrap',
              borderLeft: msg.role === 'assistant' ? '2px solid #30363d' : 'none',
              paddingLeft: msg.role === 'system' ? 0 : '1.5rem'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              color: '#f0883e',
              marginBottom: '0.5rem',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {'< ASSISTANT'}
            </div>
            <div style={{
              color: '#8b949e',
              paddingLeft: '1.5rem',
              borderLeft: '2px solid #30363d'
            }}>
              <span className="blink">▊</span> generating...
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1.5rem',
        background: '#0d1117',
        borderTop: '1px solid #30363d'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1,
              padding: '1rem',
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#c9d1d9',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '48px',
              maxHeight: '150px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              padding: '1rem 1.5rem',
              background: input.trim() && !isThinking ? '#238636' : '#21262d',
              border: 'none',
              borderRadius: '6px',
              color: input.trim() && !isThinking ? 'white' : '#8b949e',
              cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Mimir;
