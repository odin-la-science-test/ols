import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Send, Sparkles, User, Loader2, 
  Zap, Settings, Trash2, Copy, Check 
} from 'lucide-react';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MobileMimir = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Bonjour ! Je suis Mimir, propulsé par Qwen2.5-7B. Je suis votre assistant IA scientifique spécialisé en biologie, chimie et recherche. Posez-moi vos questions sur les protocoles, techniques, analyses ou concepts scientifiques !",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('hf_api_key') || '');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const callQwenAPI = async (userQuery: string): Promise<string> => {
    const HF_API_KEY = apiKey || 'hf_placeholder';
    
    const conversationHistory = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    const systemPrompt = {
      role: 'system',
      content: 'Tu es Mimir, un assistant IA scientifique expert en biologie moléculaire, biochimie, microbiologie et recherche scientifique. Tu fournis des réponses précises, détaillées et pratiques. Tu expliques les protocoles, techniques et concepts avec clarté. Réponds toujours en français.'
    };

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `<|im_start|>system\n${systemPrompt.content}<|im_end|>\n${conversationHistory.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n')}\n<|im_start|>user\n${userQuery}<|im_end|>\n<|im_start|>assistant\n`,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false,
              do_sample: true
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 503) {
          return "Le modèle Qwen2.5-7B est en cours de chargement. Veuillez réessayer dans quelques secondes...";
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
      } else if (data.generated_text) {
        return data.generated_text.trim();
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (error) {
      console.error('Erreur API Qwen:', error);
      return getFallbackResponse(userQuery);
    }
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('pcr')) {
      return "🧬 **PCR (Polymerase Chain Reaction)**\n\nLa PCR amplifie l'ADN en 3 étapes cycliques :\n\n1. **Dénaturation** (95°C, 30s) : séparation des brins\n2. **Hybridation** (50-65°C, 30s) : fixation des amorces\n3. **Élongation** (72°C, 1min/kb) : synthèse par Taq polymérase\n\n**Optimisation** :\n- Amorces 18-25 nt, Tm similaire (±2°C)\n- MgCl₂ : 1.5-2.5 mM\n- 25-35 cycles\n- Contrôles positif/négatif obligatoires";
    }
    
    if (q.includes('crispr')) {
      return "✂️ **CRISPR-Cas9**\n\nSystème d'édition génomique révolutionnaire :\n\n**Composants** :\n- Cas9 : nucléase (ciseaux moléculaires)\n- gRNA : guide ARN (20 nt + scaffold)\n- PAM : séquence NGG requise\n\n**Mécanisme** :\n1. gRNA guide Cas9 vers la cible\n2. Coupure double-brin\n3. Réparation : NHEJ (insertion/délétion) ou HDR (correction précise)\n\n**Applications** : thérapie génique, modèles animaux, amélioration cultures";
    }
    
    if (q.includes('western') || q.includes('blot')) {
      return "🔬 **Western Blot**\n\n**Protocole** :\n1. SDS-PAGE (séparation protéines)\n2. Transfert membrane (PVDF/nitrocellulose)\n3. Blocage (lait 5% ou BSA, 1h)\n4. Anticorps 1° (4°C overnight, dilution 1:1000)\n5. Lavages TBST (3×10min)\n6. Anticorps 2° conjugué (1h RT, 1:5000)\n7. Révélation ECL\n\n**Contrôles** : β-actine, GAPDH, Tubuline\n**Astuce** : saturer la membrane pour éviter le bruit de fond";
    }
    
    if (q.includes('culture') || q.includes('cellule')) {
      return "🧫 **Culture Cellulaire**\n\n**Conditions optimales** :\n- Milieu : DMEM/RPMI + 10% FBS + antibiotiques\n- Incubateur : 37°C, 5% CO₂, humidité 95%\n- Passage : confluence 80-90%, trypsine 0.25%\n- Ratio split : 1:3 à 1:10\n\n**Cryoconservation** :\n- Milieu : 90% FBS + 10% DMSO\n- Congélation : -1°C/min (Mr. Frosty)\n- Stockage : azote liquide (-196°C)\n\n**Contamination** : test mycoplasme mensuel !";
    }
    
    return "Je suis Mimir, propulsé par Qwen2.5-7B. Pour utiliser toutes mes capacités, configurez votre clé API Hugging Face dans les paramètres ⚙️. Je peux vous aider avec : PCR, CRISPR, Western Blot, culture cellulaire, clonage, séquençage NGS, microscopie, statistiques, et bien plus !";
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
        content: "Désolé, une erreur s'est produite. Vérifiez votre clé API dans les paramètres.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearConversation = () => {
    if (confirm('Effacer toute la conversation ?')) {
      setMessages([{
        id: 1,
        role: 'assistant',
        content: "Conversation effacée. Comment puis-je vous aider ?",
        timestamp: new Date()
      }]);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('hf_api_key', apiKey);
    setShowSettings(false);
    alert('✅ Clé API enregistrée');
  };

  const quickQuestions = [
    { icon: '🧬', text: 'PCR : protocole complet', query: 'Explique-moi le protocole PCR complet avec les températures et durées optimales' },
    { icon: '✂️', text: 'CRISPR-Cas9', query: 'Comment fonctionne CRISPR-Cas9 et quelles sont ses applications ?' },
    { icon: '🔬', text: 'Western Blot', query: 'Donne-moi le protocole détaillé du Western Blot' },
    { icon: '🧫', text: 'Culture cellulaire', query: 'Quelles sont les bonnes pratiques pour la culture cellulaire ?' }
  ];

  return (
    <div className="mobile-container" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #1a1f2e 100%)' }}>
      <div className="mobile-header" style={{ 
        background: 'rgba(16, 185, 129, 0.05)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/hugin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mobile-text)',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Brain size={28} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>
                  Mimir AI
                </h1>
                <p style={{ 
                  fontSize: '0.7rem', 
                  color: '#10b981', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Zap size={12} /> Qwen2.5-7B
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                cursor: 'pointer',
                color: '#6366f1'
              }}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={clearConversation}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                cursor: 'pointer',
                color: '#ef4444'
              }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div style={{
          padding: '1rem',
          background: 'rgba(99, 102, 241, 0.05)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--mobile-text-secondary)' }}>
            Clé API Hugging Face (optionnelle)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_..."
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--mobile-card-bg)',
                border: '1px solid var(--mobile-border)',
                borderRadius: '0.75rem',
                color: 'var(--mobile-text)',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={saveApiKey}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sauver
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--mobile-text-secondary)' }}>
            Obtenez votre clé sur huggingface.co/settings/tokens
          </p>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="mobile-content" 
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          paddingBottom: '160px',
          background: 'transparent'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: msg.role === 'user'
                ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                : '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              {msg.role === 'user' ? <User size={20} color="white" /> : <Sparkles size={20} color="white" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  padding: '1rem',
                  background: msg.role === 'user'
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(16, 185, 129, 0.05)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                  borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <p style={{ 
                  fontSize: '0.9rem', 
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  color: 'white'
                }}>
                  {msg.content}
                </p>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--mobile-text-secondary)',
                    margin: 0
                  }}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === msg.id ? '#10b981' : 'var(--mobile-text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem'
                      }}
                    >
                      {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Loader2 size={20} color="white" className="animate-spin" />
            </div>
            <div style={{
              flex: 1,
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '1rem 1rem 1rem 0.25rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="dot-pulse" style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#10b981' 
                }} />
                <p style={{ fontSize: '0.9rem', margin: 0, color: '#10b981' }}>
                  Qwen2.5 analyse votre question...
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--mobile-text-secondary)', 
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              💡 Questions rapides
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q.query)}
                  style={{
                    padding: '1rem',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{q.icon}</div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'white', fontWeight: 600 }}>
                    {q.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 14, 26, 0.95) 20%, rgba(10, 14, 26, 1) 100%)',
        borderTop: '1px solid rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Posez votre question scientifique..."
              rows={1}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '1.25rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                minHeight: '52px',
                maxHeight: '120px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: input.trim() && !isThinking 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'rgba(100, 116, 139, 0.2)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              boxShadow: input.trim() && !isThinking ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Send size={22} />
          </button>
        </div>
      </div>

      <MobileBottomNav />

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .dot-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default MobileMimir;
