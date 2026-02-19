import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { useToast } from '../../components/ToastContext';
import {
    ChevronLeft, Beaker, Thermometer, Wind, Droplets, Play, Download,
    Dna, AlertCircle, Activity, Clock, Bot, Lightbulb, ShieldAlert,
    AlertTriangle, CheckCircle2, Loader2, Search, FlaskConical, FileText,
    RotateCcw, Check
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ReferenceArea
} from 'recharts';

// Enums
const BacteriaType = {
    E_COLI: "Escherichia coli",
    B_SUBTILIS: "Bacillus subtilis",
    S_CEREVISIAE: "Saccharomyces cerevisiae",
    P_AERUGINOSA: "Pseudomonas aeruginosa",
    CUSTOM: "Autre (Spécifier)"
} as const;

const MediumType = {
    LB: "Lysogeny Broth (LB)",
    MINIMAL: "M9 Minimal Media",
    TB: "Terrific Broth (TB)",
    YPD: "YPD Broth",
    SOC: "SOC Medium",
    SOB: "SOB Medium",
    TSB: "Tryptic Soy Broth (TSB)",
    BHI: "Brain Heart Infusion (BHI)",
    MRS: "De Man, Rogosa and Sharpe (MRS)",
    NUTRIENT: "Nutrient Broth",
    SABOURAUD: "Sabouraud Dextrose Broth",
    MUELLER_HINTON: "Mueller-Hinton Broth",
    CUSTOM: "Autre (Spécifier)"
} as const;

type ViewMode = 'simulation' | 'genomic' | 'gallery';

// Types
interface SimulationParams {
    bacteria: string;
    medium: string;
    temperature: number;
    ph: number;
    agitation: number;
    duration: number;
}

interface TimePointData {
    hour: number;
    od600: number;
    cfu: number;
    phase: string;
    metabolites: string;
}

interface CheckpointAnalysis {
    status: string;
    risks: string;
    actions: string[];
}

interface AgentRecommendation {
    summary: string;
    optimization: string;
    safety: string;
}

interface PhaseBoundaries {
    lagEnd: number | null;
    stationaryStart: number | null;
    deathStart: number | null;
}

interface SimulationResult {
    growthData: TimePointData[];
    checkpoints: {
        h12: CheckpointAnalysis;
        h24: CheckpointAnalysis;
        h36: CheckpointAnalysis;
    };
    agentRecommendation: AgentRecommendation;
    phases: PhaseBoundaries;
}

const BacterialGrowthPredictor = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { showToast } = useToast();
    const c = theme.colors;

    const [currentView, setCurrentView] = useState<ViewMode>('simulation');
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [params, setParams] = useState<SimulationParams>({
        bacteria: BacteriaType.E_COLI,
        medium: MediumType.LB,
        temperature: 37,
        ph: 7.0,
        agitation: 200,
        duration: 48,
    });

    const [customBacteria, setCustomBacteria] = useState("");
    const [customMedium, setCustomMedium] = useState("");

    // Genomic ID state
    const [sequence, setSequence] = useState("");
    const [genomicMatches, setGenomicMatches] = useState<any[] | null>(null);
    const [genomicLoading, setGenomicLoading] = useState(false);

    const handleSimulation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const finalParams = { ...params };
            if (params.bacteria === BacteriaType.CUSTOM) finalParams.bacteria = customBacteria;
            if (params.medium === MediumType.CUSTOM) finalParams.medium = customMedium;

            const data = await simulateCulture(finalParams);
            setResult(data);
            showToast('Simulation terminée avec succès', 'success');
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Une erreur inconnue est survenue";
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!result) return;
        const headers = ["Heure,Phase,OD600,Log_CFU,Metabolites"];
        const rows = result.growthData.map(d =>
            d.hour + "," + d.phase + "," + d.od600 + "," + d.cfu + "," + d.metabolites
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "biopredict_data_" + Date.now() + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Données exportées', 'success');
    };

    const handleGenomicIdentify = () => {
        setGenomicLoading(true);
        setTimeout(() => {
            const results = identifyGenomic(sequence);
            setGenomicMatches(results);
            setGenomicLoading(false);
            showToast('Analyse génomique terminée', 'success');
        }, 600);
    };

    const loadExampleSequence = () => {
        setSequence(">Seq_Unknown_01\nAGAGTTTGATCATGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGA");
        showToast('Séquence exemple chargée', 'info');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: c.bgPrimary,
            color: c.textPrimary,
            paddingTop: '80px'
        }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: c.bgSecondary,
                borderBottom: '1px solid ' + c.borderColor,
                padding: '1.5rem 2rem'
            }}>
                <div style={{
                    maxWidth: '1600px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/hugin')}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: c.textPrimary,
                                padding: '0.6rem',
                                borderRadius: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                            borderRadius: '1rem',
                            color: 'white'
                        }}>
                            <Dna size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                                BioPredict Suite v2.1
                            </h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: c.textSecondary }}>
                                Prédiction et analyse de croissance bactérienne
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        background: c.cardBg,
                        padding: '0.3rem',
                        borderRadius: '0.75rem',
                        border: '1px solid ' + c.borderColor
                    }}>
                        <button
                            onClick={() => setCurrentView('simulation')}
                            style={{
                                background: currentView === 'simulation' ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : 'transparent',
                                color: currentView === 'simulation' ? 'white' : c.textPrimary,
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Activity size={16} /> Simulation
                        </button>
                        <button
                            onClick={() => setCurrentView('genomic')}
                            style={{
                                background: currentView === 'genomic' ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' : 'transparent',
                                color: currentView === 'genomic' ? 'white' : c.textPrimary,
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Search size={16} /> Génomique
                        </button>
                        <button
                            onClick={() => setCurrentView('gallery')}
                            style={{
                                background: currentView === 'gallery' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent',
                                color: currentView === 'gallery' ? 'white' : c.textPrimary,
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FlaskConical size={16} /> Galerie
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
                {/* View: Simulation */}
                {currentView === 'simulation' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
                        {/* Left Sidebar: Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                background: c.bgSecondary,
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid ' + c.borderColor
                            }}>
                                <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Simulation Cinétique</h3>
                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>
                                    Prédiction algorithmique basée sur les modèles de Monod et Luedeking-Piret.
                                </p>
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSimulation} style={{
                                background: c.bgSecondary,
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid ' + c.borderColor
                            }}>
                                <h2 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    margin: '0 0 1.5rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Beaker size={20} />
                                    Paramètres de Culture
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Bacteria Selection */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            marginBottom: '0.5rem',
                                            color: c.textSecondary
                                        }}>
                                            Micro-organisme
                                        </label>
                                        <select
                                            value={params.bacteria}
                                            onChange={(e) => setParams({ ...params, bacteria: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: c.inputBg,
                                                border: '1px solid ' + c.borderColor,
                                                borderRadius: '0.5rem',
                                                color: '#000000',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <option value="">Sélectionner un organisme</option>
                                            {Object.values(BacteriaType).map((b) => (
                                                <option key={b} value={b} style={{ color: '#000000' }}>{b}</option>
                                            ))}
                                        </select>
                                        {params.bacteria === BacteriaType.CUSTOM && (
                                            <input
                                                type="text"
                                                placeholder="Nom de la bactérie..."
                                                value={customBacteria}
                                                onChange={(e) => setCustomBacteria(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    marginTop: '0.5rem',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Medium Selection */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            marginBottom: '0.5rem',
                                            color: c.textSecondary
                                        }}>
                                            Milieu de Culture
                                        </label>
                                        <select
                                            value={params.medium}
                                            onChange={(e) => setParams({ ...params, medium: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: c.inputBg,
                                                border: '1px solid ' + c.borderColor,
                                                borderRadius: '0.5rem',
                                                color: '#000000',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <option value="">Sélectionner un milieu</option>
                                            {Object.values(MediumType).map((m) => (
                                                <option key={m} value={m} style={{ color: '#000000' }}>{m}</option>
                                            ))}
                                        </select>
                                        {params.medium === MediumType.CUSTOM && (
                                            <input
                                                type="text"
                                                placeholder="Composition du milieu..."
                                                value={customMedium}
                                                onChange={(e) => setCustomMedium(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    marginTop: '0.5rem',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Physical Conditions Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                marginBottom: '0.5rem',
                                                color: c.textSecondary
                                            }}>
                                                <Thermometer size={14} /> Temp. (°C)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.temperature}
                                                onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                marginBottom: '0.5rem',
                                                color: c.textSecondary
                                            }}>
                                                <Droplets size={14} /> pH Initial
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={params.ph}
                                                onChange={(e) => setParams({ ...params, ph: parseFloat(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                marginBottom: '0.5rem',
                                                color: c.textSecondary
                                            }}>
                                                <Wind size={14} /> Agitation (RPM)
                                            </label>
                                            <input
                                                type="number"
                                                value={params.agitation}
                                                onChange={(e) => setParams({ ...params, agitation: parseInt(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                marginBottom: '0.5rem',
                                                color: c.textSecondary
                                            }}>
                                                Durée (Heures)
                                            </label>
                                            <input
                                                type="number"
                                                value={params.duration}
                                                onChange={(e) => setParams({ ...params, duration: parseInt(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: c.inputBg,
                                                    border: '1px solid ' + c.borderColor,
                                                    borderRadius: '0.5rem',
                                                    color: c.textPrimary,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            background: loading ? c.cardBg : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            opacity: loading ? 0.6 : 1
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                Simulation en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} />
                                                Lancer la Simulation
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid #ef4444',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'start',
                                    gap: '0.75rem',
                                    color: '#ef4444'
                                }}>
                                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    <div>
                                        <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Erreur de simulation</h4>
                                        <p style={{ fontSize: '0.85rem', margin: 0 }}>{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Area: Results */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {!result && !loading && (
                                <div style={{
                                    height: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: c.textSecondary,
                                    border: '2px dashed ' + c.borderColor,
                                    borderRadius: '1rem',
                                    background: c.bgSecondary
                                }}>
                                    <div style={{
                                        background: c.cardBg,
                                        padding: '1.5rem',
                                        borderRadius: '50%',
                                        marginBottom: '1rem'
                                    }}>
                                        <Activity size={48} style={{ opacity: 0.5 }} />
                                    </div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                        En attente de paramètres...
                                    </p>
                                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                        Configurez votre bioréacteur à gauche.
                                    </p>
                                </div>
                            )}

                            {loading && (
                                <div style={{
                                    height: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: c.bgSecondary,
                                    borderRadius: '1rem',
                                    border: '1px solid ' + c.borderColor
                                }}>
                                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            border: '4px solid ' + c.borderColor,
                                            borderTop: '4px solid #14b8a6',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}>
                                            <Dna size={24} style={{ color: '#14b8a6', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                        Calcul en cours...
                                    </h3>
                                    <p style={{ color: c.textSecondary, margin: 0, textAlign: 'center', maxWidth: '400px' }}>
                                        Résolution des équations différentielles...
                                    </p>
                                </div>
                            )}

                            {result && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {/* Main Chart Section */}
                                    <div style={{
                                        background: c.bgSecondary,
                                        padding: '1.5rem',
                                        borderRadius: '1rem',
                                        border: '1px solid ' + c.borderColor
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                                                    Courbe de Croissance
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>
                                                    Visualisation dynamique des phases
                                                </p>
                                            </div>
                                            <button
                                                onClick={downloadCSV}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    color: '#14b8a6',
                                                    background: 'rgba(20, 184, 166, 0.1)',
                                                    border: '1px solid rgba(20, 184, 166, 0.3)',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Download size={16} />
                                                Export CSV
                                            </button>
                                        </div>
                                        <GrowthChart data={result.growthData} phases={result.phases} theme={theme} />
                                    </div>

                                    {/* Checkpoint Cards Grid */}
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            margin: '0 0 1rem 0',
                                            paddingLeft: '0.25rem'
                                        }}>
                                            Points de Contrôle Stratégiques
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {result.growthData.some(d => d.hour >= 12) && (
                                                <CheckpointCard
                                                    hour={12}
                                                    analysis={result.checkpoints.h12}
                                                    dataPoint={result.growthData.find(d => d.hour === 12)}
                                                    theme={theme}
                                                />
                                            )}
                                            {result.growthData.some(d => d.hour >= 24) && (
                                                <CheckpointCard
                                                    hour={24}
                                                    analysis={result.checkpoints.h24}
                                                    dataPoint={result.growthData.find(d => d.hour === 24)}
                                                    theme={theme}
                                                />
                                            )}
                                            {result.growthData.some(d => d.hour >= 36) && (
                                                <CheckpointCard
                                                    hour={36}
                                                    analysis={result.checkpoints.h36}
                                                    dataPoint={result.growthData.find(d => d.hour === 36)}
                                                    theme={theme}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Agent Advice */}
                                    <AgentAdvice recommendation={result.agentRecommendation} theme={theme} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Genomic */}
                {currentView === 'genomic' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Input Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                background: c.bgSecondary,
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid ' + c.borderColor
                            }}>
                                <h2 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    margin: '0 0 1rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Dna size={20} style={{ color: '#a855f7' }} />
                                    Séquençage 16S rRNA
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '1rem' }}>
                                    Collez votre séquence FASTA brute pour effectuer un alignement local contre notre base de référence (K-mer Jaccard Index).
                                </p>

                                <textarea
                                    value={sequence}
                                    onChange={(e) => setSequence(e.target.value)}
                                    placeholder=">Header&#10;ATGC..."
                                    style={{
                                        width: '100%',
                                        height: '256px',
                                        padding: '1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        background: c.inputBg,
                                        border: '1px solid ' + c.borderColor,
                                        borderRadius: '0.75rem',
                                        color: c.textPrimary,
                                        resize: 'none'
                                    }}
                                />

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={handleGenomicIdentify}
                                        disabled={genomicLoading || sequence.length < 10}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            background: (genomicLoading || sequence.length < 10) ? c.cardBg : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: (genomicLoading || sequence.length < 10) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            opacity: (genomicLoading || sequence.length < 10) ? 0.6 : 1
                                        }}
                                    >
                                        {genomicLoading ? "Alignement en cours..." : (
                                            <>
                                                <Search size={16} /> Identifier
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={loadExampleSequence}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: c.cardBg,
                                            border: '1px solid ' + c.borderColor,
                                            color: c.textPrimary,
                                            borderRadius: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Exemple
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                background: c.bgSecondary,
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid ' + c.borderColor,
                                minHeight: '400px'
                            }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    margin: '0 0 1rem 0',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '1px solid ' + c.borderColor
                                }}>
                                    Résultats d'Alignement
                                </h3>

                                {!genomicMatches && !genomicLoading && (
                                    <div style={{
                                        height: '256px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: c.textSecondary
                                    }}>
                                        <FileText size={48} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                                        <p>Aucune analyse effectuée.</p>
                                    </div>
                                )}

                                {genomicLoading && (
                                    <div style={{
                                        height: '256px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#a855f7'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            border: '3px solid ' + c.borderColor,
                                            borderTop: '3px solid #a855f7',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            marginBottom: '1rem'
                                        }} />
                                        <p>Recherche d'homologie...</p>
                                    </div>
                                )}

                                {genomicMatches && genomicMatches.length === 0 && (
                                    <div style={{
                                        background: 'rgba(251, 191, 36, 0.1)',
                                        border: '1px solid #fbbf24',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'start',
                                        gap: '0.75rem',
                                        color: '#d97706'
                                    }}>
                                        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                        <div>
                                            <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Aucune correspondance trouvée</h4>
                                            <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                                La séquence fournie ne correspond à aucun organisme de notre base de données 16S avec une confiance suffisante.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {genomicMatches && genomicMatches.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {genomicMatches.map((match: any, idx: number) => (
                                            <div key={idx} style={{
                                                border: '1px solid ' + c.borderColor,
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                background: c.cardBg
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                                        {match.organism}
                                                    </h4>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        background: match.similarity > 90 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                                        color: match.similarity > 90 ? '#16a34a' : '#d97706'
                                                    }}>
                                                        {match.similarity}% ID
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: '0 0 0.75rem 0' }}>
                                                    {match.description}
                                                </p>
                                                <div style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: c.borderColor,
                                                    borderRadius: '9999px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: match.similarity + '%',
                                                        height: '100%',
                                                        background: '#a855f7',
                                                        transition: 'width 1s ease'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Gallery */}
                {currentView === 'gallery' && (
                    <GalleryID theme={theme} showToast={showToast} />
                )}
            </main>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ============ COMPONENTS ============

// Growth Chart Component
interface GrowthChartProps {
    data: TimePointData[];
    phases?: PhaseBoundaries;
    theme: any;
}

const GrowthChart = ({ data, phases, theme }: GrowthChartProps) => {
    const c = theme.colors;
    const maxTime = data.length > 0 ? data[data.length - 1].hour : 0;

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={c.borderColor} />

                    {/* Zones de phases colorées */}
                    {phases && (
                        <>
                            {phases.lagEnd && (
                                <ReferenceArea
                                    x1={0}
                                    x2={phases.lagEnd}
                                    fill="#94a3b8"
                                    fillOpacity={0.1}
                                    label={{ value: "Latence", position: 'insideTopLeft', fill: '#64748b', fontSize: 12 }}
                                />
                            )}
                            {phases.lagEnd && phases.stationaryStart && (
                                <ReferenceArea
                                    x1={phases.lagEnd}
                                    x2={phases.stationaryStart}
                                    fill="#2dd4bf"
                                    fillOpacity={0.1}
                                    label={{ value: "Exponentielle", position: 'insideTop', fill: '#0d9488', fontSize: 12 }}
                                />
                            )}
                            {phases.stationaryStart && (
                                <ReferenceArea
                                    x1={phases.stationaryStart}
                                    x2={phases.deathStart || maxTime}
                                    fill="#fbbf24"
                                    fillOpacity={0.1}
                                    label={{ value: "Stationnaire", position: 'insideTop', fill: '#d97706', fontSize: 12 }}
                                />
                            )}
                            {phases.deathStart && (
                                <ReferenceArea
                                    x1={phases.deathStart}
                                    x2={maxTime}
                                    fill="#f87171"
                                    fillOpacity={0.1}
                                    label={{ value: "Déclin", position: 'insideTopRight', fill: '#dc2626', fontSize: 12 }}
                                />
                            )}
                        </>
                    )}

                    <XAxis
                        dataKey="hour"
                        label={{ value: 'Temps (h)', position: 'insideBottomRight', offset: -10 }}
                        stroke={c.textSecondary}
                    />
                    <YAxis
                        yAxisId="left"
                        label={{ value: 'Densité Optique (OD600)', angle: -90, position: 'insideLeft' }}
                        stroke="#0d9488"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Log10 CFU/mL', angle: 90, position: 'insideRight' }}
                        stroke="#f59e0b"
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid ' + c.borderColor,
                            background: c.bgSecondary,
                            color: c.textPrimary
                        }}
                        labelFormatter={(label: any) => 'Temps : ' + label + 'h'}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="od600"
                        stroke="#0d9488"
                        name="Biomasse (OD600)"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cfu"
                        stroke="#f59e0b"
                        name="Viabilité (Log CFU)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Checkpoint Card Component
interface CheckpointCardProps {
    hour: number;
    analysis: CheckpointAnalysis;
    dataPoint?: TimePointData;
    theme: any;
}

const CheckpointCard = ({ hour, analysis, dataPoint, theme }: CheckpointCardProps) => {
    const c = theme.colors;
    if (!analysis) return null;

    return (
        <div style={{
            background: c.bgSecondary,
            borderRadius: '1rem',
            border: '1px solid ' + c.borderColor,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{
                background: c.cardBg,
                padding: '1rem',
                borderBottom: '1px solid ' + c.borderColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    fontWeight: 700,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Clock size={18} style={{ color: '#14b8a6' }} />
                    Point de Contrôle : {hour}h
                </h3>
                {dataPoint && (
                    <span style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        background: 'rgba(20, 184, 166, 0.1)',
                        color: '#14b8a6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px'
                    }}>
                        OD: {dataPoint.od600}
                    </span>
                )}
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div>
                    <h4 style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: c.textSecondary,
                        fontWeight: 600,
                        margin: '0 0 0.25rem 0'
                    }}>
                        État de la culture
                    </h4>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                        {analysis.status}
                    </p>
                </div>

                <div>
                    <h4 style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#f59e0b',
                        fontWeight: 600,
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <AlertTriangle size={12} /> Risques / Points Critiques
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>
                        {analysis.risks}
                    </p>
                </div>

                <div>
                    <h4 style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#14b8a6',
                        fontWeight: 600,
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <CheckCircle2 size={12} /> Actions Requises (Agent)
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {analysis.actions.map((action, idx) => (
                            <li key={idx} style={{
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.5rem',
                                background: c.cardBg,
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid ' + c.borderColor
                            }}>
                                <Activity size={14} style={{ color: '#14b8a6', marginTop: '0.1rem', flexShrink: 0 }} />
                                {action}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Agent Advice Component
interface AgentAdviceProps {
    recommendation: AgentRecommendation;
    theme: any;
}

const AgentAdvice = ({ recommendation, theme }: AgentAdviceProps) => {
    const c = theme.colors;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #312e81 0%, #1e293b 100%)',
            borderRadius: '1rem',
            color: 'white',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative background element */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                opacity: 0.1,
                transform: 'translate(25%, -25%)'
            }}>
                <Bot size={256} />
            </div>

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                position: 'relative',
                zIndex: 10
            }}>
                <Bot size={32} style={{ color: '#22d3ee' }} />
                Analyse de l'Agent Algorithmique
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{ fontWeight: 600, color: '#22d3ee', margin: '0 0 0.5rem 0' }}>
                        Résumé Cinétique
                    </h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#e2e8f0', margin: 0 }}>
                        {recommendation.summary}
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{
                        fontWeight: 600,
                        color: '#fde047',
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Lightbulb size={16} /> Optimisation
                    </h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#e2e8f0', margin: 0 }}>
                        {recommendation.optimization}
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{
                        fontWeight: 600,
                        color: '#fca5a5',
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ShieldAlert size={16} /> Biosécurité
                    </h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#e2e8f0', margin: 0 }}>
                        {recommendation.safety}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Gallery ID Component
interface BiochemicalTest {
    id: string;
    name: string;
    description: string;
    group: number;
    value: number;
    positive: boolean;
}

interface GalleryResult {
    code: string;
    organism: string;
    probability: number;
    confidence: "Élevée" | "Moyenne" | "Faible";
}

interface GalleryIDProps {
    theme: any;
    showToast: any;
}

const GalleryID = ({ theme, showToast }: GalleryIDProps) => {
    const c = theme.colors;
    const [tests, setTests] = useState<BiochemicalTest[]>(INITIAL_GALLERY_TESTS);
    const [result, setResult] = useState<GalleryResult | null>(null);

    const toggleTest = (id: string) => {
        const newTests = tests.map(t => t.id === id ? { ...t, positive: !t.positive } : t);
        setTests(newTests);
        setResult(identifyGallery(newTests));
    };

    const resetGallery = () => {
        const newTests = tests.map(t => ({ ...t, positive: false }));
        setTests(newTests);
        setResult(identifyGallery(newTests));
        showToast('Galerie réinitialisée', 'info');
    };

    const loadPreset = () => {
        const presetIds = ["ONPG", "LDC", "ODC", "IND", "GLU", "MAN", "SOR", "RHA", "ARA", "MEL"];
        const newTests = tests.map(t => ({
            ...t,
            positive: presetIds.includes(t.id)
        }));
        setTests(newTests);
        setResult(identifyGallery(newTests));
        showToast('Profil E. coli chargé', 'success');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                gap: '1rem',
                background: c.bgSecondary,
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid ' + c.borderColor
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FlaskConical size={20} style={{ color: '#f97316' }} />
                        Galerie Biochimique
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>
                        Simulateur de galerie type "API 20E". Cliquez sur les cupules pour marquer positif (+).
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={loadPreset}
                        style={{
                            fontSize: '0.85rem',
                            padding: '0.5rem 1rem',
                            background: c.cardBg,
                            color: c.textPrimary,
                            border: '1px solid ' + c.borderColor,
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Demo E. coli
                    </button>
                    <button
                        onClick={resetGallery}
                        style={{
                            fontSize: '0.85rem',
                            padding: '0.5rem 1rem',
                            background: c.cardBg,
                            color: c.textPrimary,
                            border: '1px solid ' + c.borderColor,
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            {/* The Gallery Strip Visual */}
            <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', minWidth: 'max-content', padding: '0.5rem' }}>
                    {tests.map((test, idx) => (
                        <div key={test.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            position: 'relative'
                        }}>
                            {/* Separator for groups */}
                            {(idx > 0 && idx % 3 === 0) && <div style={{ width: '1rem' }}></div>}

                            {/* Cupule */}
                            <button
                                onClick={() => toggleTest(test.id)}
                                title={test.description + " (Val: " + test.value + ")"}
                                style={{
                                    width: '48px',
                                    height: '64px',
                                    borderRadius: '0 0 50% 50%',
                                    border: '2px solid ' + (test.positive ? '#f97316' : c.borderColor),
                                    background: test.positive
                                        ? 'linear-gradient(to bottom, #fef3c7, #fb923c)'
                                        : 'linear-gradient(to bottom, transparent, ' + c.cardBg + ')',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {test.positive && <Check size={16} style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />}
                            </button>

                            {/* Label */}
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                color: test.positive ? '#f97316' : c.textSecondary
                            }}>
                                {test.id}
                            </span>

                            {/* +/- Indicator */}
                            <span style={{ fontSize: '0.625rem', color: c.textSecondary }}>
                                {test.positive ? '+' : '-'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Result Card */}
            {result && (
                <div style={{
                    background: c.bgSecondary,
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid ' + c.borderColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            border: '4px solid ' + (
                                result.confidence === 'Élevée' ? '#22c55e' :
                                    result.confidence === 'Moyenne' ? '#fbbf24' :
                                        '#ef4444'
                            ),
                            background: result.confidence === 'Élevée' ? 'rgba(34, 197, 94, 0.1)' :
                                result.confidence === 'Moyenne' ? 'rgba(251, 191, 36, 0.1)' :
                                    'rgba(239, 68, 68, 0.1)',
                            color: result.confidence === 'Élevée' ? '#16a34a' :
                                result.confidence === 'Moyenne' ? '#d97706' :
                                    '#dc2626'
                        }}>
                            {result.probability > 0 ? Math.floor(result.probability) + '%' : '?'}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: c.textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 600,
                                marginBottom: '0.25rem'
                            }}>
                                Résultat d'identification
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                                {result.organism}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: c.textSecondary, fontFamily: 'monospace' }}>
                                Code Profil: <span style={{
                                    background: c.cardBg,
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    color: c.textPrimary
                                }}>{result.code}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <span style={{
                            display: 'block',
                            color: c.textSecondary,
                            fontSize: '0.75rem',
                            marginBottom: '0.25rem'
                        }}>
                            Confiance
                        </span>
                        <span style={{
                            fontWeight: 600,
                            color: result.confidence === 'Élevée' ? '#16a34a' :
                                result.confidence === 'Moyenne' ? '#d97706' :
                                    '#dc2626'
                        }}>
                            {result.confidence}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ SIMULATION FUNCTIONS ============

// Base biologique étendue pour l'algorithme
const BACTERIA_DATA: Record<string, { 
    mu: number; 
    tOpt: number; 
    phOpt: number; 
    k_base: number; 
    description: string;
    tMin: number;
    tMax: number;
    phMin: number;
    phMax: number;
    oxygenReq: 'aerobic' | 'anaerobic' | 'facultative';
    gramType: 'positive' | 'negative' | 'none';
}> = {
    [BacteriaType.E_COLI]: { 
        mu: 0.9, tOpt: 37, phOpt: 7.0, k_base: 4.5, 
        tMin: 8, tMax: 48, phMin: 4.4, phMax: 9.0,
        oxygenReq: 'facultative', gramType: 'negative',
        description: "Bactérie modèle à croissance rapide, entérobactérie facultative." 
    },
    [BacteriaType.B_SUBTILIS]: { 
        mu: 0.7, tOpt: 30, phOpt: 7.0, k_base: 3.8,
        tMin: 5, tMax: 55, phMin: 5.5, phMax: 8.5,
        oxygenReq: 'aerobic', gramType: 'positive',
        description: "Gram+, sporulante, croissance modérée, aérobie stricte." 
    },
    [BacteriaType.S_CEREVISIAE]: { 
        mu: 0.45, tOpt: 30, phOpt: 5.5, k_base: 8.0,
        tMin: 0, tMax: 40, phMin: 2.5, phMax: 8.5,
        oxygenReq: 'facultative', gramType: 'none',
        description: "Levure, croissance diauxique possible, fermentation alcoolique." 
    },
    [BacteriaType.P_AERUGINOSA]: { 
        mu: 0.8, tOpt: 37, phOpt: 7.0, k_base: 4.0,
        tMin: 4, tMax: 42, phMin: 5.6, phMax: 8.0,
        oxygenReq: 'aerobic', gramType: 'negative',
        description: "Pathogène opportuniste, aérobie strict, biofilm." 
    },
    [BacteriaType.CUSTOM]: { 
        mu: 0.6, tOpt: 35, phOpt: 7.0, k_base: 4.0,
        tMin: 10, tMax: 45, phMin: 5.0, phMax: 9.0,
        oxygenReq: 'facultative', gramType: 'negative',
        description: "Souche non spécifiée, paramètres moyens." 
    },
};

const MEDIUM_DATA: Record<string, { 
    nutrientFactor: number; 
    bufferCapacity: number; 
    name: string;
    carbonSource: string;
    nitrogenSource: string;
    complexity: 'rich' | 'defined' | 'minimal';
}> = {
    [MediumType.LB]: { 
        nutrientFactor: 1.0, bufferCapacity: 0.4, name: "LB",
        carbonSource: "Tryptone", nitrogenSource: "Extrait de levure",
        complexity: 'rich'
    },
    [MediumType.TB]: { 
        nutrientFactor: 2.2, bufferCapacity: 0.9, name: "Terrific Broth",
        carbonSource: "Tryptone", nitrogenSource: "Extrait de levure (2x)",
        complexity: 'rich'
    },
    [MediumType.MINIMAL]: { 
        nutrientFactor: 0.5, bufferCapacity: 0.2, name: "M9 Minimal",
        carbonSource: "Glucose", nitrogenSource: "NH4Cl",
        complexity: 'minimal'
    },
    [MediumType.YPD]: { 
        nutrientFactor: 1.8, bufferCapacity: 0.5, name: "YPD",
        carbonSource: "Glucose + Peptone", nitrogenSource: "Extrait de levure",
        complexity: 'rich'
    },
    [MediumType.SOC]: { 
        nutrientFactor: 1.5, bufferCapacity: 0.6, name: "SOC",
        carbonSource: "Glucose + Tryptone", nitrogenSource: "Extrait de levure",
        complexity: 'rich'
    },
    [MediumType.SOB]: { 
        nutrientFactor: 1.3, bufferCapacity: 0.5, name: "SOB",
        carbonSource: "Tryptone", nitrogenSource: "Extrait de levure",
        complexity: 'rich'
    },
    [MediumType.TSB]: { 
        nutrientFactor: 1.4, bufferCapacity: 0.7, name: "TSB",
        carbonSource: "Soja + Caséine", nitrogenSource: "Peptone",
        complexity: 'rich'
    },
    [MediumType.BHI]: { 
        nutrientFactor: 1.6, bufferCapacity: 0.6, name: "BHI",
        carbonSource: "Glucose + Infusion", nitrogenSource: "Peptone",
        complexity: 'rich'
    },
    [MediumType.MRS]: { 
        nutrientFactor: 1.7, bufferCapacity: 0.8, name: "MRS",
        carbonSource: "Glucose", nitrogenSource: "Peptone + Extrait viande",
        complexity: 'rich'
    },
    [MediumType.NUTRIENT]: { 
        nutrientFactor: 0.8, bufferCapacity: 0.3, name: "Nutrient Broth",
        carbonSource: "Peptone", nitrogenSource: "Extrait de boeuf",
        complexity: 'defined'
    },
    [MediumType.SABOURAUD]: { 
        nutrientFactor: 1.2, bufferCapacity: 0.4, name: "Sabouraud",
        carbonSource: "Dextrose (4%)", nitrogenSource: "Peptone",
        complexity: 'defined'
    },
    [MediumType.MUELLER_HINTON]: { 
        nutrientFactor: 1.1, bufferCapacity: 0.5, name: "Mueller-Hinton",
        carbonSource: "Amidon", nitrogenSource: "Infusion de boeuf",
        complexity: 'defined'
    },
    [MediumType.CUSTOM]: { 
        nutrientFactor: 1.0, bufferCapacity: 0.5, name: "Custom",
        carbonSource: "Variable", nitrogenSource: "Variable",
        complexity: 'defined'
    },
};

const simulateCulture = async (params: SimulationParams): Promise<SimulationResult> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const bacteria = BACTERIA_DATA[params.bacteria] || BACTERIA_DATA[BacteriaType.CUSTOM];
    const medium = MEDIUM_DATA[params.medium] || MEDIUM_DATA[MediumType.CUSTOM];

    // Calcul des Facteurs Environnementaux
    const tempDiff = Math.abs(params.temperature - bacteria.tOpt);
    let tempFactor = Math.exp(-(Math.pow(tempDiff, 2)) / (2 * Math.pow(8, 2)));
    if (params.temperature > bacteria.tOpt + 10) tempFactor *= 0.1;

    const phDiff = Math.abs(params.ph - bacteria.phOpt);
    let phFactor = 1 - Math.pow(phDiff / 3.5, 2);
    phFactor = Math.max(0, phFactor);

    let agitationFactor = Math.min(1.0, params.agitation / 200);
    if (params.bacteria === BacteriaType.S_CEREVISIAE) agitationFactor = Math.min(1.0, 0.5 + params.agitation / 400);

    const effectiveMu = bacteria.mu * tempFactor * phFactor * medium.nutrientFactor * agitationFactor;
    const carryingCapacity = bacteria.k_base * medium.nutrientFactor * (0.5 + 0.5 * phFactor);

    const growthData: TimePointData[] = [];
    let currentOD = 0.05;
    const lagTime = 2 + (1 - tempFactor) * 5 + (1 - phFactor) * 3;

    const phases: PhaseBoundaries = {
        lagEnd: null,
        stationaryStart: null,
        deathStart: null
    };

    const stationaryThreshold = 0.95 * carryingCapacity;
    const deathTimeThreshold = lagTime + (carryingCapacity / (effectiveMu || 0.1)) + 12;

    for (let t = 0; t <= params.duration; t += 1) {
        let phase = "Latence";
        let metabolites = "Adaptation";
        let growthRate = 0;

        if (t < lagTime) {
            phase = "Latence";
            growthRate = 0;
        } else {
            const logisticTerm = 1 - (currentOD / carryingCapacity);
            if (logisticTerm > 0) {
                growthRate = effectiveMu * logisticTerm;
                const delta = currentOD * growthRate;
                currentOD += delta;
            }

            if (currentOD < 0.2) phase = "Latence";
            else if (currentOD < stationaryThreshold) phase = "Exponentielle";
            else phase = "Stationnaire";

            if (phase === "Stationnaire" && t > deathTimeThreshold) {
                phase = "Déclin";
                currentOD *= 0.97;
            }
        }

        if (phase === "Exponentielle" && phases.lagEnd === null) phases.lagEnd = t;
        if (phase === "Stationnaire" && phases.stationaryStart === null) phases.stationaryStart = t;
        if (phase === "Déclin" && phases.deathStart === null) phases.deathStart = t;

        if (phase === "Latence") metabolites = "Synthèse ARN/Enzymes";
        else if (phase === "Exponentielle") metabolites = "Conso. Glc/N";
        else if (phase === "Stationnaire") metabolites = "Acides Organiques";
        else if (phase === "Déclin") metabolites = "Protéases/Toxines";

        let cfu = 0;
        if (currentOD > 0.01) {
            cfu = Math.log10(currentOD * 8e8);
        }

        growthData.push({
            hour: t,
            od600: parseFloat(currentOD.toFixed(3)),
            cfu: parseFloat(cfu.toFixed(2)),
            phase,
            metabolites
        });
    }

    const generateAnalysis = (hour: number): CheckpointAnalysis => {
        const point = growthData.find(d => d.hour === hour);
        if (!point) return { status: "Non atteint", risks: "-", actions: [] };

        const analysis: CheckpointAnalysis = {
            status: "Phase " + point.phase + " (OD " + point.od600 + ")",
            risks: "",
            actions: []
        };

        if (point.phase === "Latence") {
            analysis.risks = "Risque de contamination externe si latence > 4h.";
            analysis.actions = ["Vérifier calibration sonde pH", "Ne pas ajouter d'antibiotiques maintenant"];
        } else if (point.phase === "Exponentielle") {
            analysis.risks = "Épuisement rapide de l'oxygène dissous (DO).";
            analysis.actions = [
                point.od600 > 0.8 ? "Augmenter agitation (+10%)" : "Maintenir agitation",
                "Surveiller formation de mousse",
                "Induction possible (IPTG/Arabinose)"
            ];
        } else if (point.phase === "Stationnaire") {
            analysis.risks = "Accumulation d'acétate et acidification.";
            analysis.actions = [
                "Débuter la récolte (Centrifugation)",
                "Réduire T°C pour préserver protéines",
                "Stopper alimentation (Batch)"
            ];
        } else if (point.phase === "Déclin") {
            analysis.risks = "Lyse cellulaire et dégradation produit.";
            analysis.actions = ["Arrêt immédiat du bioréacteur", "Traitement des déchets biologiques"];
        }

        return analysis;
    };

    const peakOD = Math.max(...growthData.map(d => d.od600)).toFixed(2);
    const peakTime = growthData.find(d => d.od600 > parseFloat(peakOD) * 0.98)?.hour;

    let summaryText = "Culture simulée de " + params.bacteria + " sur " + params.duration + "h. ";
    summaryText += "Phase exponentielle observée de " + (phases.lagEnd || '?') + "h à " + (phases.stationaryStart || '?') + "h. ";
    summaryText += "Biomasse maximale (OD " + peakOD + ") atteinte vers T=" + peakTime + "h.";

    let optimizationAdvice = "";
    if (effectiveMu < 0.2) {
        optimizationAdvice = "Taux de croissance critique faible. Suggestions : 1) Vérifier que la T°C est proche de l'optimum (" + bacteria.tOpt + "°C). 2) Le pH actuel (" + params.ph + ") pourrait inhiber la souche.";
    } else if (phases.stationaryStart && phases.stationaryStart < 10) {
        optimizationAdvice = "Entrée en phase stationnaire précoce. Suggestion : Utiliser un milieu plus riche (TB ou Fed-batch) pour prolonger la phase exponentielle.";
    } else {
        optimizationAdvice = "Profil cinétique robuste. Pour l'échelle industrielle : Envisager une stratégie d'alimentation (Fed-batch) exponentielle pour maintenir mu constant.";
    }

    const agentRec: AgentRecommendation = {
        summary: summaryText,
        optimization: optimizationAdvice,
        safety: params.bacteria === BacteriaType.P_AERUGINOSA
            ? "Niveau de Biosécurité 2 (BSL-2). Manipulation sous PSM obligatoire. Décontamination stricte des effluents."
            : "Niveau de Biosécurité 1 (BSL-1). Port de la blouse et des gants recommandé. Nettoyage standard à l'éthanol 70%."
    };

    return {
        growthData,
        phases,
        checkpoints: {
            h12: generateAnalysis(12),
            h24: generateAnalysis(24),
            h36: generateAnalysis(36)
        },
        agentRecommendation: agentRec
    };
};

// ============ IDENTIFICATION FUNCTIONS ============

const GENOMIC_DATABASE: Record<string, string> = {
    "Escherichia coli": "AGAGTTTGATCATGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGA",
    "Bacillus subtilis": "AGAGTTTGATCCTGGCTCAGGACGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGAGCGGACAGATGG",
    "Pseudomonas aeruginosa": "AGAGTTTGATCATGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAGCGGATGAAGGG",
    "Saccharomyces cerevisiae": "TACCTGGTTGATCCTGCCAGTAGTCATATGCTTGTCTCAAAGATTAAGCCATGCATGTCTAAGTATAAGC",
    "Staphylococcus aureus": "TACCTGGTTGATCCTGCCAGTAGTCATATGCTTGTCTCAAAGATTAAGCCATGCATGTCTAAGTATAAGC"
};

const identifyGenomic = (sequence: string): any[] => {
    const cleanSeq = sequence.replace(/^>.*\n/, '').replace(/\s/g, '').toUpperCase();
    if (cleanSeq.length < 20) return [];

    const results: any[] = [];
    const k = 6;

    const inputKmers = new Set<string>();
    for (let i = 0; i < cleanSeq.length - k + 1; i++) {
        inputKmers.add(cleanSeq.substring(i, i + k));
    }

    Object.entries(GENOMIC_DATABASE).forEach(([organism, dbSeq]) => {
        const dbKmers = new Set<string>();
        for (let i = 0; i < dbSeq.length - k + 1; i++) {
            dbKmers.add(dbSeq.substring(i, i + k));
        }

        let intersection = 0;
        inputKmers.forEach(kmer => {
            if (dbKmers.has(kmer)) intersection++;
        });

        const union = inputKmers.size + dbKmers.size - intersection;
        const similarity = (intersection / union) * 100;

        let finalScore = similarity;
        if (cleanSeq.includes(dbSeq) || dbSeq.includes(cleanSeq)) {
            finalScore = 100;
        } else if (finalScore > 0) {
            finalScore = Math.min(99.9, finalScore * 2.5);
        }

        if (finalScore > 15) {
            results.push({
                organism,
                similarity: parseFloat(finalScore.toFixed(1)),
                description: finalScore > 90 ? "Identification certaine (16S rRNA)" : "Homologie partielle détectée"
            });
        }
    });

    return results.sort((a, b) => b.similarity - a.similarity);
};

const GALLERY_DB: Record<string, string> = {
    "5144572": "Escherichia coli",
    "5044552": "Escherichia coli (Atypique)",
    "0000000": "Non fermentant / Inerte",
    "2206004": "Pseudomonas aeruginosa",
    "6350100": "Proteus mirabilis",
    "1204000": "Salmonella sp."
};

const calculateProfileCode = (tests: BiochemicalTest[]): string => {
    let code = "";
    for (let i = 1; i <= 7; i++) {
        const groupTests = tests.filter(t => t.group === i);
        let groupScore = 0;
        groupTests.forEach(t => {
            if (t.positive) groupScore += t.value;
        });
        code += groupScore.toString();
    }
    return code;
};

const identifyGallery = (tests: BiochemicalTest[]): GalleryResult => {
    const code = calculateProfileCode(tests);
    const match = GALLERY_DB[code];

    if (match) {
        return {
            code,
            organism: match,
            probability: 99.9,
            confidence: "Élevée"
        };
    }

    let bestDist = 100;
    let bestMatch = "Inconnu";

    Object.keys(GALLERY_DB).forEach(dbCode => {
        let dist = 0;
        for (let i = 0; i < code.length; i++) {
            if (code[i] !== dbCode[i]) dist++;
        }
        if (dist < bestDist) {
            bestDist = dist;
            bestMatch = GALLERY_DB[dbCode];
        }
    });

    if (bestDist <= 2) {
        return {
            code,
            organism: bestMatch + " (Probable)",
            probability: Math.max(0, 100 - (bestDist * 20)),
            confidence: bestDist === 1 ? "Moyenne" : "Faible"
        };
    }

    return {
        code,
        organism: "Profil Inconnu",
        probability: 0,
        confidence: "Faible"
    };
};

const INITIAL_GALLERY_TESTS: BiochemicalTest[] = [
    { id: "ONPG", name: "ONPG", description: "Bêta-galactosidase", group: 1, value: 1, positive: false },
    { id: "ADH", name: "ADH", description: "Arginine Dihydrolase", group: 1, value: 2, positive: false },
    { id: "LDC", name: "LDC", description: "Lysine Décarboxylase", group: 1, value: 4, positive: false },
    { id: "ODC", name: "ODC", description: "Ornithine Décarboxylase", group: 2, value: 1, positive: false },
    { id: "CIT", name: "CIT", description: "Utilisation Citrate", group: 2, value: 2, positive: false },
    { id: "H2S", name: "H2S", description: "Production H2S", group: 2, value: 4, positive: false },
    { id: "URE", name: "URE", description: "Uréase", group: 3, value: 1, positive: false },
    { id: "TDA", name: "TDA", description: "Tryptophane Désaminase", group: 3, value: 2, positive: false },
    { id: "IND", name: "IND", description: "Production Indole", group: 3, value: 4, positive: false },
    { id: "VP", name: "VP", description: "Acétoïne (Voges-Proskauer)", group: 4, value: 1, positive: false },
    { id: "GEL", name: "GEL", description: "Gélatinase", group: 4, value: 2, positive: false },
    { id: "GLU", name: "GLU", description: "Glucose", group: 4, value: 4, positive: false },
    { id: "MAN", name: "MAN", description: "Mannitol", group: 5, value: 1, positive: false },
    { id: "INO", name: "INO", description: "Inositol", group: 5, value: 2, positive: false },
    { id: "SOR", name: "SOR", description: "Sorbitol", group: 5, value: 4, positive: false },
    { id: "RHA", name: "RHA", description: "Rhamnose", group: 6, value: 1, positive: false },
    { id: "SAC", name: "SAC", description: "Saccharose", group: 6, value: 2, positive: false },
    { id: "MEL", name: "MEL", description: "Melibiose", group: 6, value: 4, positive: false },
    { id: "AMY", name: "AMY", description: "Amygdalin", group: 7, value: 1, positive: false },
    { id: "ARA", name: "ARA", description: "Arabinose", group: 7, value: 2, positive: false },
    { id: "OX", name: "OX", description: "Oxydase (Test sup.)", group: 7, value: 4, positive: false },
];

export default BacterialGrowthPredictor;
