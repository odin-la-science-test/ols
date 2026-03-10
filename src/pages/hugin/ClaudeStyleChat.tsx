import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, RotateCcw, Edit2, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';
import { groqService } from '../../services/groqService';
import type { GroqMessage } from '../../services/groqService';
import { sanitizeHTML } from '../../utils/encryption';

interface Message extends GroqMessage {
  id: string;
  timestamp: number;
  isEditing?: boolean;
}

const ClaudeStyleChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

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
      const systemPrompt: GroqMessage = {
        role: 'system',
        content: `Tu es un assistant IA intelligent, clair et pédagogique. Tu réponds de manière structurée avec des titres, listes et exemples. Tu es patient, précis et tu adaptes ton niveau de détail selon le contexte.`
      };

      let fullResponse = '';
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
      groqService.setHistory(conversationHistory);

      for await (const chunk of groqService.sendMessageStream(textToSend, {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 8192
      })) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id ? { ...m, content: fullResponse } : m
        ));
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Une erreur est survenue: ${error.message}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (messageIndex: number) => {
    const userMessage = messages[messageIndex];
    if (userMessage.role === 'user') {
      // Supprimer le message utilisateur et la réponse suivante
      setMessages(prev => prev.slice(0, messageIndex));
      // Renvoyer le message
      handleSendMessage(userMessage.content);
    }
  };

  const handleEdit = (messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isEditing: true } : m
    ));
  };

  const handleSaveEdit = (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      // Supprimer tous les messages après celui-ci
      setMessages(prev => prev.slice(0, messageIndex));
      // Renvoyer avec le nouveau contenu
      handleSendMessage(newContent);
    }
  };

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMessage = (text: string): string => {
    let formatted = text;

    // Code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'text';
      return `<div class="code-block"><div class="code-header">${language.toUpperCase()}</div><pre><code>${code.trim()}</code></pre></div>`;
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="message-h3">$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="message-h2">$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="message-h1">$1</h1>');

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Lists
    formatted = formatted.replace(/^- (.+)$/gm, '<li class="message-li">$1</li>');
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li class="message-li-numbered">$2</li>');

    // Line breaks
    formatted = formatted.replace(/\n\n/g, '<br/><br/>');

    return formatted;
  };

  const suggestedPrompts = [
    "Explique-moi un concept complexe",
    "Aide-moi à écrire un texte",
    "Analyse ce problème",
    "Génère du code"
  ];

  return (
    <div className="claude-chat-container">
      {/* Header */}
      <header className="claude-header">
        <button onClick={() => navigate('/hugin')} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <div className="header-title">
          <Sparkles size={20} className="header-icon" />
          <h1>Assistant IA</h1>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            groqService.clearHistory();
          }}
          className="new-chat-button"
        >
          <MessageSquare size={18} />
          Nouvelle conversation
        </button>
      </header>

      {/* Messages Container */}
      <main className="claude-messages">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <Sparkles size={48} />
            </div>
            <h2 className="welcome-title">Comment puis-je vous aider aujourd'hui ?</h2>
            <p className="welcome-subtitle">
              Posez-moi n'importe quelle question, je suis là pour vous aider.
            </p>
            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="suggested-prompt"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <div className="avatar-user">U</div>
                    ) : (
                      <div className="avatar-assistant">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>
                  <div className="message-body">
                    {msg.isEditing ? (
                      <div className="edit-container">
                        <textarea
                          defaultValue={msg.content}
                          className="edit-textarea"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleSaveEdit(msg.id, e.currentTarget.value);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                            handleSaveEdit(msg.id, textarea.value);
                          }}
                          className="save-edit-button"
                        >
                          Envoyer
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="message-text"
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatMessage(msg.content)) }}
                        />
                        <div className="message-actions">
                          {msg.role === 'assistant' && (
                            <>
                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="action-button"
                                title="Copier"
                              >
                                {copiedId === msg.id ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                              <button
                                onClick={() => handleRetry(index - 1)}
                                className="action-button"
                                title="Régénérer"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </>
                          )}
                          {msg.role === 'user' && (
                            <button
                              onClick={() => handleEdit(msg.id)}
                              className="action-button"
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper assistant-message">
                <div className="message-content">
                  <div className="message-avatar">
                    <div className="avatar-assistant">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  <div className="message-body">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="claude-input-area">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Écrivez votre message... (Shift+Entrée pour nouvelle ligne)"
            className="input-textarea"
            rows={1}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="input-hint">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </footer>

      <style>{`
        .claude-chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #ffffff;
          color: #2c3e50;
        }

        /* Header */
        .claude-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-button {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #f3f4f6;
          color: #2c3e50;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          justify-content: center;
        }

        .header-title h1 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          color: #1f2937;
        }

        .header-icon {
          color: #8b5cf6;
        }

        .new-chat-button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          color: #374151;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .new-chat-button:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        /* Messages */
        .claude-messages {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
        }

        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 3rem 2rem;
          text-align: center;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 2rem;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0 0 3rem 0;
        }

        .suggested-prompts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          max-width: 800px;
          width: 100%;
        }

        .suggested-prompt {
          padding: 1.25rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          color: #374151;
          cursor: pointer;
          font-size: 0.9375rem;
          text-align: left;
          transition: all 0.2s;
        }

        .suggested-prompt:hover {
          background: #f3f4f6;
          border-color: #8b5cf6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
        }

        .messages-list {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .message-wrapper {
          margin-bottom: 2rem;
        }

        .message-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .user-message .message-content {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .avatar-user {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .avatar-assistant {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-body {
          flex: 1;
          max-width: 100%;
        }

        .user-message .message-body {
          text-align: right;
        }

        .message-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #374151;
          word-wrap: break-word;
        }

        .user-message .message-text {
          background: #f3f4f6;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem 1.25rem 0.25rem 1.25rem;
          display: inline-block;
          text-align: left;
          max-width: 85%;
        }

        .assistant-message .message-text {
          padding: 0.5rem 0;
        }

        /* Message Formatting */
        .message-h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: #1f2937;
        }

        .message-h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: #1f2937;
        }

        .message-h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }

        .message-li {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
          list-style-type: disc;
        }

        .message-li-numbered {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
          list-style-type: decimal;
        }

        .inline-code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #8b5cf6;
        }

        .code-block {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .code-header {
          background: #f9fafb;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        .code-block pre {
          background: #1f2937;
          padding: 1.25rem;
          margin: 0;
          overflow-x: auto;
        }

        .code-block code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #e5e7eb;
          line-height: 1.6;
        }

        /* Message Actions */
        .message-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .message-wrapper:hover .message-actions {
          opacity: 1;
        }

        .user-message .message-actions {
          justify-content: flex-end;
        }

        .action-button {
          padding: 0.375rem 0.75rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        /* Edit Container */
        .edit-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .edit-textarea {
          width: 100%;
          min-height: 100px;
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          color: #374151;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
        }

        .save-edit-button {
          align-self: flex-end;
          padding: 0.5rem 1.5rem;
          background: #8b5cf6;
          border: none;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .save-edit-button:hover {
          background: #7c3aed;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 0.375rem;
          padding: 1rem 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }

        /* Input Area */
        .claude-input-area {
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
          padding: 1.5rem 2rem;
          position: sticky;
          bottom: 0;
        }

        .input-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .input-textarea {
          flex: 1;
          min-height: 56px;
          max-height: 200px;
          padding: 1rem 1.25rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          color: #374151;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: none;
          transition: all 0.2s;
        }

        .input-textarea:focus {
          outline: none;
          border-color: #8b5cf6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .send-button {
          width: 48px;
          height: 48px;
          background: #8b5cf6;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #7c3aed;
          transform: scale(1.05);
        }

        .send-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .input-hint {
          max-width: 900px;
          margin: 0.75rem auto 0;
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .claude-header {
            padding: 1rem;
          }

          .header-title h1 {
            font-size: 1rem;
          }

          .new-chat-button {
            padding: 0.5rem;
            font-size: 0;
          }

          .new-chat-button svg {
            margin: 0;
          }

          .messages-list {
            padding: 1rem;
          }

          .welcome-title {
            font-size: 1.5rem;
          }

          .welcome-subtitle {
            font-size: 1rem;
          }

          .suggested-prompts {
            grid-template-columns: 1fr;
          }

          .claude-input-area {
            padding: 1rem;
          }

          .user-message .message-text {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default ClaudeStyleChat;
