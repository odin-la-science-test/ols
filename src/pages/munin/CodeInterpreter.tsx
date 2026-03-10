/**
 * Code Interpreter - Mimir peut lire et interpréter du code
 * Utilise Qwen2-VL pour l'analyse de code
 * 
 * MODIFICATIONS:
 * - Ajout d'un panneau latéral coulissant (drawer) depuis la gauche
 * - Deux vues dans le panneau: Code et Interprétation
 * - Système d'onglets pour basculer entre les vues
 * - Animation fluide d'ouverture/fermeture
 * - Responsive et adapté mobile
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import {
    Code, Play, Copy, Download, Upload, Sparkles,
    FileCode, Terminal, BookOpen, Lightbulb, AlertCircle,
    CheckCircle, Loader, ArrowLeft, Zap, Menu, X, Eye, FileText
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import QwenService from '../../services/qwenService';

const CodeInterpreter = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { isMobile } = useDeviceDetection();
    
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [qwenAvailable, setQwenAvailable] = useState<boolean | null>(null);
    
    // États pour le panneau latéral (drawer)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerView, setDrawerView] = useState<'code' | 'interpretation'>('code');

    const c = theme.colors;

    // Vérifier la disponibilité de Qwen au chargement
    React.useEffect(() => {
        checkQwenAvailability();
    }, []);

    const checkQwenAvailability = async () => {
        const health = await QwenService.checkHealth();
        setQwenAvailable(health?.ollama?.modelDownloaded || false);
    };

    const languages = [
        { value: 'python', label: 'Python', icon: '🐍' },
        { value: 'javascript', label: 'JavaScript', icon: '📜' },
        { value: 'typescript', label: 'TypeScript', icon: '📘' },
        { value: 'java', label: 'Java', icon: '☕' },
        { value: 'cpp', label: 'C++', icon: '⚙️' },
        { value: 'csharp', label: 'C#', icon: '🔷' },
        { value: 'r', label: 'R', icon: '📊' },
        { value: 'matlab', label: 'MATLAB', icon: '🔢' },
        { value: 'sql', label: 'SQL', icon: '🗄️' },
        { value: 'other', label: 'Autre', icon: '📝' }
    ];

    const exampleCodes = {
        python: `def calculate_mean(data):
    """Calcule la moyenne d'une liste de nombres"""
    if not data:
        return 0
    return sum(data) / len(data)

# Exemple d'utilisation
values = [1, 2, 3, 4, 5]
mean = calculate_mean(values)
print(f"Moyenne: {mean}")`,
        javascript: `function calculateMean(data) {
    // Calcule la moyenne d'un tableau de nombres
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
}

// Exemple d'utilisation
const values = [1, 2, 3, 4, 5];
const mean = calculateMean(values);
console.log(\`Moyenne: \${mean}\`);`,
        r: `calculate_mean <- function(data) {
  # Calcule la moyenne d'un vecteur
  if (length(data) == 0) return(0)
  return(mean(data))
}

# Exemple d'utilisation
values <- c(1, 2, 3, 4, 5)
mean_value <- calculate_mean(values)
print(paste("Moyenne:", mean_value))`
    };

    const handleAnalyze = async () => {
        if (!code.trim()) {
            setError('Veuillez entrer du code à analyser');
            return;
        }

        if (qwenAvailable === false) {
            setError('Qwen2-VL n\'est pas disponible. Installez-le avec: .\\installer-qwen.ps1');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setAnalysis('');

        try {
            const prompt = `Analyse ce code ${language} en détail. Fournis :
1. Une explication de ce que fait le code
2. Les concepts utilisés
3. Les bonnes pratiques respectées
4. Les améliorations possibles
5. Les erreurs potentielles
6. Des suggestions d'optimisation

Code à analyser :
\`\`\`${language}
${code}
\`\`\`

Réponds en français de manière structurée et pédagogique.`;

            const result = await QwenService.chat(prompt, 'Tu es un expert en programmation et en analyse de code.');

            if (result.success && result.response) {
                setAnalysis(result.response);
            } else {
                setError(result.error || 'Erreur lors de l\'analyse');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'analyse');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLoadExample = () => {
        const example = exampleCodes[language as keyof typeof exampleCodes] || exampleCodes.python;
        setCode(example);
        setAnalysis('');
        setError('');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
    };

    const handleCopyAnalysis = () => {
        navigator.clipboard.writeText(analysis);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCode(content);
                setAnalysis('');
                setError('');
            };
            reader.readAsText(file);
        }
    };

    // Fonction pour basculer l'ouverture du drawer
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    // Fonction pour changer de vue dans le drawer
    const switchDrawerView = (view: 'code' | 'interpretation') => {
        setDrawerView(view);
    };

    return (
        <div style={{ minHeight: '100vh', background: c.bgPrimary, position: 'relative' }}>
            <Navbar />
            
            {/* Overlay pour fermer le drawer en cliquant à l'extérieur */}
            {isDrawerOpen && (
                <div
                    onClick={toggleDrawer}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 998,
                        transition: 'opacity 0.3s ease',
                        opacity: isDrawerOpen ? 1 : 0
                    }}
                />
            )}

            {/* Panneau latéral coulissant (Drawer) */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: isMobile ? '85%' : '450px',
                    maxWidth: '100%',
                    background: c.cardBg,
                    borderRight: `1px solid ${c.borderColor}`,
                    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
                    transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header du drawer avec onglets */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${c.borderColor}`,
                    background: c.bgSecondary
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FileCode size={24} color={c.accentMunin} />
                            Vue Détaillée
                        </h3>
                        <button
                            onClick={toggleDrawer}
                            style={{
                                padding: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: c.textSecondary,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = c.bgPrimary;
                                e.currentTarget.style.color = c.textPrimary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = c.textSecondary;
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Onglets pour basculer entre Code et Interprétation */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        background: c.bgPrimary,
                        padding: '0.25rem',
                        borderRadius: '0.75rem'
                    }}>
                        <button
                            onClick={() => switchDrawerView('code')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: drawerView === 'code' ? c.accentMunin : 'transparent',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: drawerView === 'code' ? 'white' : c.textSecondary,
                                fontWeight: drawerView === 'code' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Code size={18} />
                            Code
                        </button>
                        <button
                            onClick={() => switchDrawerView('interpretation')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: drawerView === 'interpretation' ? c.accentMunin : 'transparent',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: drawerView === 'interpretation' ? 'white' : c.textSecondary,
                                fontWeight: drawerView === 'interpretation' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Eye size={18} />
                            Interprétation
                        </button>
                    </div>
                </div>

                {/* Contenu du drawer */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1.5rem'
                }}>
                    {/* Vue Code */}
                    {drawerView === 'code' && (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    margin: 0,
                                    color: c.textSecondary
                                }}>
                                    Code Source
                                </h4>
                                <button
                                    onClick={handleCopyCode}
                                    disabled={!code}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: c.bgSecondary,
                                        border: `1px solid ${c.borderColor}`,
                                        borderRadius: '0.5rem',
                                        color: c.textPrimary,
                                        cursor: code ? 'pointer' : 'not-allowed',
                                        opacity: code ? 1 : 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Copy size={16} />
                                    Copier
                                </button>
                            </div>

                            {code ? (
                                <pre style={{
                                    background: c.bgSecondary,
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${c.borderColor}`,
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.6',
                                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                    color: c.textPrimary,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {code}
                                </pre>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 1rem',
                                    color: c.textSecondary
                                }}>
                                    <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>Aucun code à afficher</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Collez du code dans l'éditeur principal
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vue Interprétation */}
                    {drawerView === 'interpretation' && (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    margin: 0,
                                    color: c.textSecondary
                                }}>
                                    Analyse de Mimir
                                </h4>
                                {analysis && (
                                    <button
                                        onClick={handleCopyAnalysis}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: c.bgSecondary,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.5rem',
                                            color: c.textPrimary,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <Copy size={16} />
                                        Copier
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    fontSize: '0.9rem'
                                }}>
                                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {!analysis && !error && !isAnalyzing && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 1rem',
                                    color: c.textSecondary
                                }}>
                                    <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>Aucune analyse disponible</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Cliquez sur "Analyser le code" pour commencer
                                    </p>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 1rem',
                                    color: c.textSecondary
                                }}>
                                    <Loader size={48} className="spin" style={{ marginBottom: '1rem' }} />
                                    <p>Analyse en cours...</p>
                                </div>
                            )}

                            {analysis && (
                                <div style={{
                                    background: c.bgSecondary,
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${c.borderColor}`,
                                    color: c.textPrimary,
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.9rem'
                                }}>
                                    {analysis}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => navigate('/munin')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: `1px solid ${c.borderColor}`,
                                borderRadius: '0.5rem',
                                color: c.textSecondary,
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={20} />
                            Retour à Munin
                        </button>

                        {/* Bouton pour ouvrir le drawer */}
                        <button
                            onClick={toggleDrawer}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: isDrawerOpen ? c.accentMunin : 'transparent',
                                border: `1px solid ${isDrawerOpen ? c.accentMunin : c.borderColor}`,
                                borderRadius: '0.5rem',
                                color: isDrawerOpen ? 'white' : c.textSecondary,
                                cursor: 'pointer',
                                fontWeight: isDrawerOpen ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Menu size={20} />
                            Vue Détaillée
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: `${c.accentMunin}15`,
                            borderRadius: '1rem',
                            color: c.accentMunin
                        }}>
                            <Code size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                Code Interpreter
                            </h1>
                            <p style={{ color: c.textSecondary, fontSize: '1rem' }}>
                                Mimir peut lire et interpréter votre code
                            </p>
                        </div>
                    </div>

                    {/* Status Qwen */}
                    {qwenAvailable === false && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <AlertCircle size={20} color="#ef4444" />
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        Qwen2-VL non disponible
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: c.textSecondary }}>
                                        Installez Qwen2-VL pour utiliser cette fonctionnalité : <code>.\installer-qwen.ps1</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '2rem'
                }}>
                    {/* Panneau de gauche : Code */}
                    <div>
                        <div style={{
                            background: c.cardBg,
                            borderRadius: '1rem',
                            border: `1px solid ${c.borderColor}`,
                            overflow: 'hidden'
                        }}>
                            {/* Toolbar */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: `1px solid ${c.borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileCode size={20} color={c.accentMunin} />
                                    <span style={{ fontWeight: 600 }}>Votre Code</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: c.bgSecondary,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.5rem',
                                            color: c.textPrimary,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.icon} {lang.label}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleLoadExample}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: c.bgSecondary,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.5rem',
                                            color: c.textPrimary,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Lightbulb size={16} />
                                        Exemple
                                    </button>

                                    <label style={{
                                        padding: '0.5rem 1rem',
                                        background: c.bgSecondary,
                                        border: `1px solid ${c.borderColor}`,
                                        borderRadius: '0.5rem',
                                        color: c.textPrimary,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Upload size={16} />
                                        Importer
                                        <input
                                            type="file"
                                            accept=".py,.js,.ts,.java,.cpp,.cs,.r,.m,.sql,.txt"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>

                                    <button
                                        onClick={handleCopyCode}
                                        disabled={!code}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: c.bgSecondary,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.5rem',
                                            color: c.textPrimary,
                                            cursor: code ? 'pointer' : 'not-allowed',
                                            opacity: code ? 1 : 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Collez votre code ici..."
                                style={{
                                    width: '100%',
                                    minHeight: '400px',
                                    padding: '1.5rem',
                                    background: c.bgSecondary,
                                    border: 'none',
                                    color: c.textPrimary,
                                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                            />

                            {/* Analyze Button */}
                            <div style={{ padding: '1rem', borderTop: `1px solid ${c.borderColor}` }}>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !code || qwenAvailable === false}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: isAnalyzing || !code || qwenAvailable === false
                                            ? c.bgSecondary
                                            : `linear-gradient(135deg, ${c.accentMunin}, ${c.accentHugin})`,
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        cursor: isAnalyzing || !code || qwenAvailable === false ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        opacity: isAnalyzing || !code || qwenAvailable === false ? 0.5 : 1
                                    }}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader size={20} className="spin" />
                                            Analyse en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Analyser le code
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Panneau de droite : Analyse */}
                    <div>
                        <div style={{
                            background: c.cardBg,
                            borderRadius: '1rem',
                            border: `1px solid ${c.borderColor}`,
                            overflow: 'hidden',
                            minHeight: '400px'
                        }}>
                            {/* Toolbar */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: `1px solid ${c.borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Terminal size={20} color={c.accentMunin} />
                                    <span style={{ fontWeight: 600 }}>Analyse de Mimir</span>
                                </div>

                                {analysis && (
                                    <button
                                        onClick={handleCopyAnalysis}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: c.bgSecondary,
                                            border: `1px solid ${c.borderColor}`,
                                            borderRadius: '0.5rem',
                                            color: c.textPrimary,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Copy size={16} />
                                        Copier
                                    </button>
                                )}
                            </div>

                            {/* Analysis Content */}
                            <div style={{ padding: '1.5rem' }}>
                                {error && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.5rem',
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <AlertCircle size={20} />
                                        {error}
                                    </div>
                                )}

                                {!analysis && !error && !isAnalyzing && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem 1rem',
                                        color: c.textSecondary
                                    }}>
                                        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                            Prêt à analyser votre code
                                        </p>
                                        <p style={{ fontSize: '0.9rem' }}>
                                            Collez votre code et cliquez sur "Analyser"
                                        </p>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem 1rem',
                                        color: c.textSecondary
                                    }}>
                                        <Loader size={48} className="spin" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontSize: '1.1rem' }}>
                                            Mimir analyse votre code...
                                        </p>
                                    </div>
                                )}

                                {analysis && (
                                    <div style={{
                                        color: c.textPrimary,
                                        lineHeight: '1.8',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '0.95rem'
                                    }}>
                                        {analysis}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tips */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: `${c.accentMunin}10`,
                            border: `1px solid ${c.accentMunin}30`,
                            borderRadius: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Zap size={18} color={c.accentMunin} />
                                <span style={{ fontWeight: 600, color: c.accentMunin }}>
                                    Conseils
                                </span>
                            </div>
                            <ul style={{ fontSize: '0.9rem', color: c.textSecondary, paddingLeft: '1.5rem' }}>
                                <li>Collez du code complet pour une meilleure analyse</li>
                                <li>Ajoutez des commentaires pour plus de contexte</li>
                                <li>Testez avec différents langages</li>
                                <li>L'analyse est locale et confidentielle</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeInterpreter;
