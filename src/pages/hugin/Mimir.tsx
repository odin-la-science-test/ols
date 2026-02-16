// Mimir AI - Terminal Style Interface (Desktop)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Download } from 'lucide-react';
import { localAI } from '../../services/localAI';

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
      content: 'Mimir AI - Assistant Intelligent Local',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

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
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const aiResponse = await localAI.chat(currentInput, conversationHistory);
      
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Une erreur est survenue. Réessaye !",
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
      content: 'Mimir AI - Assistant Intelligent Local',
      timestamp: new Date()
    }]);
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
          <span style={{ color: '#8b949e', fontSize: '12px' }}>algorithme local</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
