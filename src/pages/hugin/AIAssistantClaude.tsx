import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, RotateCcw, Copy, Check, MessageSquare, Settings, Code, X } from 'lucide-react';
import { groqService } from '../../services/groqService';
import type { GroqMessage } from '../../services/groqService';
import { sanitizeHTML } from '../../utils/encryption';
import { mimirEngine, settingsManager, generateGreeting } from '../../utils/mimir';
import type { CommunicationMode } from '../../utils/mimir';

interface Message extends GroqMessage {
  id: string;
  timestamp: number;
}

const AIAssistantClaude = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('friendly');
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState<Array<{id: string, language: string, code: string}>>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [previewContent, setPreviewContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const init = async () => {
      const key = await groqService.getApiKey();
      setApiKey(key);
      setTempApiKey(key);
      
      // Charger les paramètres Mímir
      const settings = settingsManager.getSettings();
      setCommunicationMode(settings.communicationMode);
      
      if (!key) setShowSettings(true);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Écouter les événements d'ouverture du panneau de code
  useEffect(() => {
    const handleOpenCodePanel = (e: CustomEvent) => {
      const codeId = e.detail;
      setShowCodePanel(true);
      // Scroll vers le bloc de code dans le panneau
      setTimeout(() => {
        const element = document.querySelector(`[data-code-id="${codeId}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    window.addEventListener('openCodePanel', handleOpenCodePanel as EventListener);
    return () => {
      window.removeEventListener('openCodePanel', handleOpenCodePanel as EventListener);
    };
  }, []);

  // Mettre à jour l'iframe quand le contenu change
  useEffect(() => {
    if (previewRef.current && previewContent) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
      }
    }
  }, [previewContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    // Traiter le message avec le moteur Mímir
    const processed = mimirEngine.processUserMessage(textToSend);
    
    // Si c'est une commande spéciale (changement de mode, question d'identité, etc.)
    if (!processed.shouldSendToAI && processed.response) {
      const responseMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: processed.response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Si le mode a changé, mettre à jour l'état
      if (processed.modeChanged) {
        const newSettings = settingsManager.getSettings();
        setCommunicationMode(newSettings.communicationMode);
      }
      
      return;
    }

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
      const mimirSystemPrompt = mimirEngine.getSystemPrompt();

      let fullResponse = '';
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of groqService.sendMessageStream(textToSend, {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 8192,
        systemPrompt: mimirSystemPrompt
      })) {
        fullResponse += chunk;
        
        // Formater la réponse selon les paramètres Mímir
        const formattedResponse = mimirEngine.formatResponse(fullResponse);
        
        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id ? { ...m, content: formattedResponse } : m
        ));
      }
    } catch (error: any) {
      console.error('Erreur:', error);
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

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = (messageIndex: number) => {
    const userMessage = messages[messageIndex];
    if (userMessage.role === 'user') {
      setMessages(prev => prev.slice(0, messageIndex));
      handleSendMessage(userMessage.content);
    }
  };

  const clearCodeBlocks = () => {
    setCodeBlocks([]);
    setShowCodePanel(false);
  };

  const copyAllCode = () => {
    const allCode = codeBlocks.map((block, index) => 
      `// ${block.language.toUpperCase()} - Bloc ${index + 1}\n${block.code}`
    ).join('\n\n');
    navigator.clipboard.writeText(allCode);
    showToast('Tous les blocs de code copiés !');
  };

  const runCode = () => {
    // Combiner tous les blocs HTML, CSS et JS
    const htmlBlocks = codeBlocks.filter(b => ['html', 'xml'].includes(b.language.toLowerCase()));
    const cssBlocks = codeBlocks.filter(b => b.language.toLowerCase() === 'css');
    const jsBlocks = codeBlocks.filter(b => ['javascript', 'js'].includes(b.language.toLowerCase()));

    let html = htmlBlocks.map(b => b.code).join('\n');
    const css = cssBlocks.map(b => b.code).join('\n');
    const js = jsBlocks.map(b => b.code).join('\n');

    // Si pas de HTML complet, créer une structure de base
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aperçu</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
    } else {
      // Injecter CSS et JS dans le HTML existant
      if (css) {
        html = html.replace('</head>', `<style>${css}</style></head>`);
      }
      if (js) {
        html = html.replace('</body>', `<script>${js}</script></body>`);
      }
    }

    setPreviewContent(html);
    setActiveTab('preview');
  };

  // Extraire les blocs de code d'un message
  const extractCodeBlocks = useCallback((text: string, messageId: string) => {
    const blocks: Array<{id: string, language: string, code: string}> = [];
    let counter = 0;
    
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      const codeId = `code-${messageId}-${counter++}`;
      
      blocks.push({
        id: codeId,
        language: language,
        code: code
      });
    }
    
    return blocks;
  }, []);

  // Mettre à jour les blocs de code quand les messages changent
  useEffect(() => {
    const allBlocks: Array<{id: string, language: string, code: string}> = [];
    
    messages.forEach(msg => {
      if (msg.role === 'assistant') {
        const blocks = extractCodeBlocks(msg.content, msg.id);
        allBlocks.push(...blocks);
      }
    });
    
    setCodeBlocks(allBlocks);
    
    // Ouvrir le panneau si des blocs existent
    if (allBlocks.length > 0 && !showCodePanel) {
      setShowCodePanel(true);
    }
  }, [messages, extractCodeBlocks, showCodePanel]);

  const formatMessage = useCallback((text: string, messageId: string): string => {
    let formatted = text;
    let codeBlockCounter = 0;

    // Code blocks avec boutons
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'text';
      const displayLang = language.toUpperCase();
      const codeId = `code-${messageId}-${codeBlockCounter++}`;
      
      return `<div class="code-block-container" data-code-id="${codeId}">
        <div class="code-header">
          <span class="code-lang">${displayLang}</span>
          <div class="code-actions">
            <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code.trim())}'))" class="code-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copier
            </button>
            <button onclick="window.dispatchEvent(new CustomEvent('openCodePanel', {detail: '${codeId}'}))" class="code-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              Voir
            </button>
          </div>
        </div>
        <pre><code>${code.trim()}</code></pre>
      </div>`;
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="msg-h1">$1</h1>');

    // Bold & Italic
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Lists
    formatted = formatted.replace(/^- (.+)$/gm, '<li class="msg-li">$1</li>');
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li class="msg-li-num">$2</li>');

    return formatted;
  }, []);

  const suggestedPrompts = [
    "Qui es-tu ?",
    "Explique-moi l'ADN",
    "Comment faire une PCR ?",
    "Aide-moi avec mon protocole"
  ];
  
  const handleModeChange = (newMode: CommunicationMode) => {
    settingsManager.setCommunicationMode(newMode);
    setCommunicationMode(newMode);
    mimirEngine.updateSettings();
    
    // Afficher un message de confirmation
    const confirmationMsg: Message = {
      id: `system-${Date.now()}`,
      role: 'assistant',
      content: mimirEngine.processUserMessage(`/mode ${newMode}`).response || '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, confirmationMsg]);
  };
  
  const showToast = (message: string) => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--accent-hugin);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  return (
    <div className={`claude-assistant ${showCodePanel ? 'code-panel-open' : ''}`} style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      {/* Zone principale du chat à GAUCHE */}
      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Header minimaliste */}
      <header className="claude-header">
        <button onClick={() => navigate('/hugin')} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div className="header-title">
          <Sparkles size={20} />
          <h1>Mímir</h1>
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            marginLeft: '0.5rem',
            padding: '0.25rem 0.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-color)'
          }}>
            {communicationMode === 'friendly' && '😊'}
            {communicationMode === 'professional' && '📊'}
            {communicationMode === 'robotic' && '🤖'}
          </span>
        </div>
        <div className="header-actions">
          <button onClick={() => setMessages([])} className="icon-btn" title="Nouvelle conversation">
            <MessageSquare size={18} />
          </button>
          <button onClick={() => setShowSettings(true)} className="icon-btn" title="Paramètres">
            <Settings size={18} />
          </button>
          {codeBlocks.length > 0 && (
            <>
              <button 
                onClick={() => setShowCodePanel(!showCodePanel)} 
                className="icon-btn" 
                title={showCodePanel ? "Masquer le code" : "Afficher le code"}
                style={{ 
                  background: showCodePanel ? 'var(--accent-hugin)' : 'transparent',
                  color: showCodePanel ? 'white' : 'var(--text-secondary)'
                }}
              >
                <Code size={18} />
                <span style={{ 
                  fontSize: '0.75rem', 
                  marginLeft: '0.25rem',
                  fontWeight: '600'
                }}>
                  {codeBlocks.length}
                </span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Messages centrés */}
      <main className="claude-messages">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <Sparkles size={48} />
            </div>
            <h2>Comment puis-je t'aider aujourd'hui ?</h2>
            <p>{generateGreeting(communicationMode)}</p>
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
              <div key={msg.id} className={`message ${msg.role}`}>
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
                  <div
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatMessage(msg.content, msg.id)) }}
                  />
                  <div className="message-actions">
                    {msg.role === 'assistant' && (
                      <>
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="action-btn"
                          title="Copier"
                        >
                          {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleRetry(index - 1)}
                          className="action-btn"
                          title="Régénérer"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
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
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input fixe en bas */}
      <footer className="claude-input">
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
            placeholder="Écrivez votre message..."
            className="input-textarea"
            rows={1}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="input-hint">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </footer>
      </div>

      {/* Panneau latéral de code à DROITE */}
      {showCodePanel && codeBlocks.length > 0 && (
        <div className="code-panel" style={{
          width: '40%',
          minWidth: '400px',
          maxWidth: '600px',
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.3s ease'
        }}>
          {/* Header du panneau avec onglets */}
          <div style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)'
          }}>
            {/* Onglets */}
            <div style={{ display: 'flex', padding: '0 1rem' }}>
              <button
                onClick={() => setActiveTab('code')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === 'code' ? 'var(--bg-secondary)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'code' ? '2px solid var(--accent-hugin)' : '2px solid transparent',
                  color: activeTab === 'code' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                <Code size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Code ({codeBlocks.length})
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === 'preview' ? 'var(--bg-secondary)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'preview' ? '2px solid var(--accent-hugin)' : '2px solid transparent',
                  color: activeTab === 'preview' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Aperçu
              </button>
            </div>
            
            {/* Actions */}
            <div style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeTab === 'code' && (
                  <button 
                    onClick={copyAllCode}
                    style={{
                      background: 'var(--accent-hugin)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                    title="Copier tous les blocs de code"
                  >
                    <Copy size={14} />
                    Tout copier
                  </button>
                )}
                <button 
                  onClick={runCode}
                  style={{
                    background: 'var(--accent-hugin)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                  title="Exécuter le code"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Exécuter
                </button>
                <button 
                  onClick={clearCodeBlocks}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  title="Effacer tous les blocs de code"
                >
                  Effacer
                </button>
              </div>
              <button 
                onClick={() => setShowCodePanel(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Onglet Code */}
            {activeTab === 'code' && (
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                {codeBlocks.map((block, index) => (
                  <div key={block.id} data-code-id={block.id} style={{
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    background: 'var(--card-bg)'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {block.language.toUpperCase()} #{index + 1}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(block.code);
                            showToast('Code copié !');
                          }}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.375rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent-hugin)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                        >
                          <Copy size={14} />
                          Copier
                        </button>
                      </div>
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '1rem',
                      background: 'rgba(10, 14, 39, 0.9)',
                      overflow: 'auto',
                      maxHeight: '300px'
                    }}>
                      <code style={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        color: '#e5e7eb',
                        lineHeight: '1.6'
                      }}>
                        {block.code}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Onglet Aperçu */}
            {activeTab === 'preview' && (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <iframe
                  ref={previewRef}
                  title="Aperçu du code"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'white'
                  }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Paramètres */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              <Settings size={24} />
              Configuration
            </h2>
            <div className="form-group">
              <label>Clé API Groq</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="gsk_..."
              />
              <p className="form-hint">
                Obtiens une clé gratuite sur{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
                  console.groq.com
                </a>
              </p>
            </div>
            
            <div className="form-group">
              <label>Mode de communication de Mímir</label>
              <select 
                value={communicationMode}
                onChange={(e) => handleModeChange(e.target.value as CommunicationMode)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  cursor: 'pointer'
                }}
              >
                <option value="friendly">😊 Amical - Chaleureux et accessible</option>
                <option value="professional">📊 Professionnel - Formel et structuré</option>
                <option value="robotic">🤖 Robot - Direct et concis</option>
              </select>
              <p className="form-hint">
                Tu peux aussi changer de mode en tapant "/mode friendly", "/mode professional" ou "/mode robotic"
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={async () => {
                  await groqService.setApiKey(tempApiKey);
                  setApiKey(tempApiKey);
                  setShowSettings(false);
                }}
                className="btn-primary"
              >
                Sauvegarder
              </button>
              <button onClick={() => setShowSettings(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .claude-assistant {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* Header */
        .claude-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--card-bg);
        }

        .back-btn, .icon-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover, .icon-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
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
          color: var(--text-primary);
        }

        .header-title svg {
          color: var(--accent-hugin);
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Messages */
        .claude-messages {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-primary);
        }

        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 3rem 2rem;
          text-align: center;
          background: var(--bg-primary);
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          background: var(--accent-hugin);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 2rem;
        }

        .welcome-screen h2 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.75rem 0;
        }

        .welcome-screen p {
          font-size: 1.125rem;
          color: var(--text-secondary);
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
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.9375rem;
          text-align: left;
          transition: all 0.2s;
        }

        .suggested-prompt:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-hugin);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--glow-color);
        }

        .messages-list {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background: var(--bg-primary);
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .avatar-user {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-hugin);
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
          background: var(--bg-secondary);
          color: var(--accent-hugin);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-body {
          flex: 1;
          max-width: 100%;
        }

        .message.user .message-body {
          text-align: right;
        }

        .message-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--text-primary);
          word-wrap: break-word;
        }

        .message.user .message-text {
          background: var(--bg-secondary);
          padding: 1rem 1.25rem;
          border-radius: 1.25rem 1.25rem 0.25rem 1.25rem;
          display: inline-block;
          text-align: left;
          max-width: 85%;
          border: 1px solid var(--border-color);
        }

        /* Formatage */
        .msg-h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: var(--text-primary);
        }

        .msg-h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: var(--text-primary);
        }

        .msg-h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: var(--text-primary);
        }

        .msg-li, .msg-li-num {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .msg-li {
          list-style-type: disc;
        }

        .msg-li-num {
          list-style-type: decimal;
        }

        .inline-code {
          background: var(--bg-secondary);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--accent-hugin);
          border: 1px solid var(--border-color);
        }

        .code-block-container {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
        }

        .code-header {
          background: var(--bg-secondary);
          padding: 0.5rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .code-lang {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .code-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .code-block-container:hover .code-actions {
          opacity: 1;
        }

        .code-btn {
          padding: 0.375rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.2s;
          font-weight: 500;
        }

        .code-btn:hover {
          background: var(--accent-hugin);
          border-color: var(--accent-hugin);
          color: white;
        }

        .code-block-container pre {
          background: rgba(10, 14, 39, 0.9);
          padding: 1.25rem;
          margin: 0;
          overflow-x: auto;
        }

        .code-block-container code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #e5e7eb;
          line-height: 1.6;
        }

        /* Actions */
        .message-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .message:hover .message-actions {
          opacity: 1;
        }

        .message.user .message-actions {
          justify-content: flex-end;
        }

        .action-btn {
          padding: 0.375rem 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        /* Typing */
        .typing-indicator {
          display: flex;
          gap: 0.375rem;
          padding: 1rem 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-hugin);
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

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(20px);
            opacity: 0;
          }
        }

        /* Input */
        .claude-input {
          border-top: 1px solid var(--border-color);
          background: var(--card-bg);
          padding: 1.5rem 2rem;
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
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: 1.5rem;
          color: var(--text-primary);
          font-size: 0.9375rem;
          font-family: inherit;
          resize: none;
          transition: all 0.2s;
        }

        .input-textarea:focus {
          outline: none;
          border-color: var(--accent-hugin);
          background: var(--bg-primary);
          box-shadow: 0 0 0 3px var(--glow-color);
        }

        .send-btn {
          width: 48px;
          height: 48px;
          background: var(--accent-hugin);
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

        .send-btn:hover:not(:disabled) {
          background: var(--accent-primary);
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .send-btn:disabled {
          background: var(--bg-tertiary);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .input-hint {
          max-width: 900px;
          margin: 0.75rem auto 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          border: 1px solid var(--border-color);
        }

        .modal-content h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-primary);
        }

        .modal-content h2 svg {
          color: var(--accent-hugin);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .form-hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .form-hint a {
          color: var(--accent-hugin);
          text-decoration: none;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--accent-hugin);
          color: white;
        }

        .btn-primary:hover {
          background: var(--accent-primary);
          filter: brightness(1.1);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .claude-header {
            padding: 1rem;
          }

          .header-title h1 {
            font-size: 1rem;
          }

          .messages-list {
            padding: 1rem;
          }

          .welcome-screen h2 {
            font-size: 1.5rem;
          }

          .welcome-screen p {
            font-size: 1rem;
          }

          .suggested-prompts {
            grid-template-columns: 1fr;
          }

          .claude-input {
            padding: 1rem;
          }

          .message.user .message-text {
            max-width: 90%;
          }

          /* Panneau de code en plein écran sur mobile */
          .claude-assistant.code-panel-open .chat-container {
            display: none;
          }

          .claude-assistant.code-panel-open .code-panel {
            flex: 1 !important;
          }
        }

        /* Amélioration du scroll dans le panneau de code */
        .code-panel > div:last-child::-webkit-scrollbar {
          width: 8px;
        }

        .code-panel > div:last-child::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
        }

        .code-panel > div:last-child::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .code-panel > div:last-child::-webkit-scrollbar-thumb:hover {
          background: var(--accent-hugin);
        }
      `}</style>
    </div>
  );
};

export default AIAssistantClaude;
