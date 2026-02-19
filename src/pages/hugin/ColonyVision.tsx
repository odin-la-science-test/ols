import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, ChevronLeft, Upload, Download, RotateCcw, ZoomIn, ZoomOut,
    Settings, BarChart3, Grid, Eye, EyeOff, Trash2, Save, FileText,
    TrendingUp, Layers, Filter, Info, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { useTheme } from '../../components/ThemeContext';

interface Colony {
    x: number;
    y: number;
    radius: number;
    intensity: number;
}

interface AnalysisResult {
    count: number;
    colonies: Colony[];
    avgSize: number;
    coverage: number;
    density: number;
    sizeDistribution: { range: string; count: number }[];
    timestamp: number;
    imageName: string;
}

interface AnalysisParams {
    threshold: number;
    minSize: number;
    maxSize: number;
    detectClusters: boolean;
    sensitivity: number;
    contrast: number;
    brightness: number;
}

const ColonyVision = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const c = theme.colors;
    
    const [image, setImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [showOverlay, setShowOverlay] = useState(true);
    const [zoom, setZoom] = useState(1);
    
    const [params, setParams] = useState<AnalysisParams>({
        threshold: 75,
        minSize: 20,
        maxSize: 200,
        detectClusters: true,
        sensitivity: 80,
        contrast: 100,
        brightness: 100
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setImageName(file.name);
                setResult(null);
                setZoom(1);
                showToast('Image chargée avec succès', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const detectColonies = (imageData: ImageData, params: AnalysisParams): Colony[] => {
        const { width, height, data } = imageData;
        const colonies: Colony[] = [];
        const visited = new Set<string>();
        
        const threshold = (params.threshold / 100) * 255;
        const minRadius = params.minSize / 2;
        const maxRadius = params.maxSize / 2;

        for (let y = 0; y < height; y += 3) {
            for (let x = 0; x < width; x += 3) {
                const key = `${x},${y}`;
                if (visited.has(key)) continue;

                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const brightness = (r + g + b) / 3;

                if (brightness < threshold) {
                    const colony = growColony(x, y, imageData, threshold, visited, minRadius, maxRadius);
                    if (colony && colony.radius >= minRadius && colony.radius <= maxRadius) {
                        colonies.push(colony);
                    }
                }
            }
        }

        return colonies;
    };

    const growColony = (
        startX: number,
        startY: number,
        imageData: ImageData,
        threshold: number,
        visited: Set<string>,
        minRadius: number,
        maxRadius: number
    ): Colony | null => {
        const { width, height, data } = imageData;
        const queue: [number, number][] = [[startX, startY]];
        const points: [number, number][] = [];
        let totalIntensity = 0;

        while (queue.length > 0 && points.length < 1000) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) continue;
            visited.add(key);

            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            if (brightness < threshold) {
                points.push([x, y]);
                totalIntensity += (255 - brightness);

                for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                    queue.push([x + dx, y + dy]);
                }
            }
        }

        if (points.length < 5) return null;

        const centerX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
        const centerY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
        const radius = Math.sqrt(points.length / Math.PI);
        const avgIntensity = totalIntensity / points.length;

        return { x: centerX, y: centerY, radius, intensity: avgIntensity };
    };

    const processImage = async () => {
        if (!image || !imageRef.current || !canvasRef.current) return;

        setIsProcessing(true);

        setTimeout(() => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            const img = imageRef.current!;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.filter = `contrast(${params.contrast}%) brightness(${params.brightness}%)`;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const colonies = detectColonies(imageData, params);

            const sizeRanges = [
                { range: '< 50 µm', min: 0, max: 25 },
                { range: '50-100 µm', min: 25, max: 50 },
                { range: '100-150 µm', min: 50, max: 75 },
                { range: '> 150 µm', min: 75, max: Infinity }
            ];

            const sizeDistribution = sizeRanges.map(({ range, min, max }) => ({
                range,
                count: colonies.filter(c => c.radius * 2 >= min && c.radius * 2 < max).length
            }));

            const avgSize = colonies.length > 0
                ? colonies.reduce((sum, c) => sum + c.radius * 2, 0) / colonies.length
                : 0;

            const totalArea = canvas.width * canvas.height;
            const coloniesArea = colonies.reduce((sum, c) => sum + Math.PI * c.radius * c.radius, 0);
            const coverage = (coloniesArea / totalArea) * 100;
            const density = (colonies.length / totalArea) * 1000000;

            const analysisResult: AnalysisResult = {
                count: colonies.length,
                colonies,
                avgSize,
                coverage,
                density,
                sizeDistribution,
                timestamp: Date.now(),
                imageName
            };

            setResult(analysisResult);
            setHistory(prev => [analysisResult, ...prev].slice(0, 10));
            setIsProcessing(false);
            showToast(`${colonies.length} colonies détectées`, 'success');
        }, 1500);
    };

    const drawOverlay = () => {
        if (!canvasRef.current || !result || !showOverlay) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        const img = imageRef.current!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `contrast(${params.contrast}%) brightness(${params.brightness}%)`;
        ctx.drawImage(img, 0, 0);

        result.colonies.forEach((colony, idx) => {
            ctx.beginPath();
            ctx.arc(colony.x, colony.y, colony.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.font = '12px Arial';
            ctx.fillText(`${idx + 1}`, colony.x - 5, colony.y + 5);
        });
    };

    useEffect(() => {
        if (result && imageRef.current) {
            drawOverlay();
        }
    }, [result, showOverlay, params.contrast, params.brightness]);

    const resetAnalysis = () => {
        setImage(null);
        setResult(null);
        setZoom(1);
        showToast('Analyse réinitialisée', 'info');
    };

    const exportCSV = () => {
        if (!result) return;

        const headers = ['ID', 'X', 'Y', 'Diamètre (µm)', 'Intensité'];
        const rows = result.colonies.map((c, i) => 
            `${i + 1},${c.x.toFixed(1)},${c.y.toFixed(1)},${(c.radius * 2).toFixed(1)},${c.intensity.toFixed(1)}`
        );

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `colonies_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Données exportées en CSV', 'success');
    };

    const exportReport = () => {
        if (!result) return;

        const report = `
RAPPORT D'ANALYSE - ColonyVision
================================

Date: ${new Date(result.timestamp).toLocaleString()}
Image: ${result.imageName}

RÉSULTATS GLOBAUX
-----------------
Nombre total de colonies: ${result.count}
Diamètre moyen: ${result.avgSize.toFixed(1)} µm
Couverture de surface: ${result.coverage.toFixed(2)}%
Densité: ${result.density.toFixed(2)} colonies/mm²

DISTRIBUTION DES TAILLES
-------------------------
${result.sizeDistribution.map(d => `${d.range}: ${d.count} colonies`).join('\n')}

PARAMÈTRES D'ANALYSE
--------------------
Seuil de détection: ${params.threshold}%
Taille minimale: ${params.minSize} µm
Taille maximale: ${params.maxSize} µm
Sensibilité: ${params.sensitivity}%
Contraste: ${params.contrast}%
Luminosité: ${params.brightness}%

---
Généré par ColonyVision - Antigravity Platform
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_colonies_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Rapport exporté', 'success');
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
                    maxWidth: '1800px',
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
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '1rem',
                            color: 'white'
                        }}>
                            <Camera size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                                ColonyVision Pro
                            </h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: c.textSecondary }}>
                                Comptage automatisé de colonies par analyse d'image
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                background: c.cardBg,
                                border: '1px solid ' + c.borderColor,
                                color: c.textPrimary,
                                padding: '0.6rem 1rem',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            <Upload size={18} /> Charger Image
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            onChange={handleUpload}
                        />

                        {image && (
                            <>
                                <button
                                    onClick={processImage}
                                    disabled={isProcessing}
                                    style={{
                                        background: isProcessing ? c.cardBg : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '0.75rem',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        opacity: isProcessing ? 0.6 : 1
                                    }}
                                >
                                    <BarChart3 size={18} />
                                    {isProcessing ? 'Analyse...' : 'Analyser'}
                                </button>

                                <button
                                    onClick={resetAnalysis}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <RotateCcw size={18} /> Réinitialiser
                                </button>
                            </>
                        )}

                        {result && (
                            <>
                                <button
                                    onClick={exportCSV}
                                    style={{
                                        background: c.cardBg,
                                        border: '1px solid ' + c.borderColor,
                                        color: c.textPrimary,
                                        padding: '0.6rem 1rem',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Download size={18} /> CSV
                                </button>

                                <button
                                    onClick={exportReport}
                                    style={{
                                        background: c.cardBg,
                                        border: '1px solid ' + c.borderColor,
                                        color: c.textPrimary,
                                        padding: '0.6rem 1rem',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <FileText size={18} /> Rapport
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main style={{
                maxWidth: '1800px',
                margin: '0 auto',
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: '350px 1fr 350px',
                gap: '2rem'
            }}>
                {/* Left Sidebar - Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        background: c.bgSecondary,
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        border: '1px solid ' + c.borderColor
                    }}>
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: c.textSecondary,
                            textTransform: 'uppercase'
                        }}>
                            <Settings size={16} /> Paramètres d'Analyse
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <ParamSlider
                                label="Seuil de détection"
                                value={params.threshold}
                                onChange={(v) => setParams({ ...params, threshold: v })}
                                min={0}
                                max={100}
                                unit="%"
                                theme={c}
                            />

                            <ParamSlider
                                label="Taille minimale"
                                value={params.minSize}
                                onChange={(v) => setParams({ ...params, minSize: v })}
                                min={5}
                                max={100}
                                unit="µm"
                                theme={c}
                            />

                            <ParamSlider
                                label="Taille maximale"
                                value={params.maxSize}
                                onChange={(v) => setParams({ ...params, maxSize: v })}
                                min={50}
                                max={500}
                                unit="µm"
                                theme={c}
                            />

                            <ParamSlider
                                label="Sensibilité"
                                value={params.sensitivity}
                                onChange={(v) => setParams({ ...params, sensitivity: v })}
                                min={0}
                                max={100}
                                unit="%"
                                theme={c}
                            />

                            <div style={{
                                height: '1px',
                                background: c.borderColor,
                                margin: '0.5rem 0'
                            }} />

                            <ParamSlider
                                label="Contraste"
                                value={params.contrast}
                                onChange={(v) => setParams({ ...params, contrast: v })}
                                min={50}
                                max={200}
                                unit="%"
                                theme={c}
                            />

                            <ParamSlider
                                label="Luminosité"
                                value={params.brightness}
                                onChange={(v) => setParams({ ...params, brightness: v })}
                                min={50}
                                max={200}
                                unit="%"
                                theme={c}
                            />

                            <ParamToggle
                                label="Détection des amas"
                                active={params.detectClusters}
                                onChange={(v) => setParams({ ...params, detectClusters: v })}
                                theme={c}
                            />

                            {result && (
                                <ParamToggle
                                    label="Afficher marqueurs"
                                    active={showOverlay}
                                    onChange={setShowOverlay}
                                    theme={c}
                                />
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid #3b82f6',
                        padding: '1rem',
                        borderRadius: '0.75rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.75rem',
                            color: '#3b82f6'
                        }}>
                            <Info size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                <strong>Conseils :</strong> Pour de meilleurs résultats, utilisez des images
                                haute résolution avec un bon contraste. Ajustez les paramètres selon
                                la taille et la densité de vos colonies.
                            </div>
                        </div>
                    </div>
                </div>


                {/* Center - Image Display */}
                <div style={{
                    background: c.bgSecondary,
                    borderRadius: '1rem',
                    border: '1px solid ' + c.borderColor,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Zoom Controls */}
                    {image && (
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid ' + c.borderColor,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: c.textSecondary }}>
                                {imageName}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                    style={{
                                        background: c.cardBg,
                                        border: '1px solid ' + c.borderColor,
                                        color: c.textPrimary,
                                        padding: '0.4rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <div style={{
                                    padding: '0.4rem 0.75rem',
                                    background: c.cardBg,
                                    border: '1px solid ' + c.borderColor,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                }}>
                                    {(zoom * 100).toFixed(0)}%
                                </div>
                                <button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                    style={{
                                        background: c.cardBg,
                                        border: '1px solid ' + c.borderColor,
                                        color: c.textPrimary,
                                        padding: '0.4rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ZoomIn size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Container */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'auto',
                        position: 'relative',
                        minHeight: '600px',
                        background: c.cardBg
                    }}>
                        {image ? (
                            <div style={{
                                position: 'relative',
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center',
                                transition: 'transform 0.2s'
                            }}>
                                <img
                                    ref={imageRef}
                                    src={image}
                                    alt="Petri Dish"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '600px',
                                        borderRadius: '0.5rem',
                                        display: result ? 'none' : 'block'
                                    }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '600px',
                                        borderRadius: '0.5rem',
                                        display: result ? 'block' : 'none'
                                    }}
                                />

                                {isProcessing && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '0.5rem'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            border: '4px solid #10b981',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <div style={{
                                            marginTop: '1rem',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: 600
                                        }}>
                                            Analyse en cours...
                                        </div>
                                    </div>
                                )}

                                {result && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '1.5rem',
                                        background: 'rgba(16, 185, 129, 0.95)',
                                        borderRadius: '1rem',
                                        textAlign: 'center',
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                    }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            opacity: 0.9,
                                            color: 'white',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Colonies Détectées
                                        </div>
                                        <div style={{
                                            fontSize: '3.5rem',
                                            fontWeight: 900,
                                            color: 'white',
                                            lineHeight: 1,
                                            margin: '0.5rem 0'
                                        }}>
                                            {result.count}
                                        </div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: 'rgba(255,255,255,0.8)'
                                        }}>
                                            unités / boîte
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                opacity: 0.5,
                                padding: '3rem'
                            }}>
                                <Camera size={80} style={{
                                    marginBottom: '1.5rem',
                                    color: '#10b981',
                                    opacity: 0.5
                                }} />
                                <p style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem'
                                }}>
                                    Aucune image chargée
                                </p>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: c.textSecondary
                                }}>
                                    Cliquez sur "Charger Image" pour commencer
                                </p>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: c.textSecondary,
                                    marginTop: '1rem'
                                }}>
                                    Formats acceptés : JPG, PNG, TIFF
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Statistics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Main Stats */}
                    <div style={{
                        background: c.bgSecondary,
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        border: '1px solid ' + c.borderColor
                    }}>
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: c.textSecondary,
                            textTransform: 'uppercase'
                        }}>
                            <BarChart3 size={16} /> Statistiques Globales
                        </h3>

                        {result ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <StatCard
                                    label="Nombre total"
                                    value={result.count.toString()}
                                    unit="colonies"
                                    icon={<Grid size={18} />}
                                    color="#10b981"
                                    theme={c}
                                />
                                <StatCard
                                    label="Diamètre moyen"
                                    value={result.avgSize.toFixed(1)}
                                    unit="µm"
                                    icon={<TrendingUp size={18} />}
                                    color="#3b82f6"
                                    theme={c}
                                />
                                <StatCard
                                    label="Couverture"
                                    value={result.coverage.toFixed(2)}
                                    unit="%"
                                    icon={<Layers size={18} />}
                                    color="#f59e0b"
                                    theme={c}
                                />
                                <StatCard
                                    label="Densité"
                                    value={result.density.toFixed(1)}
                                    unit="col/mm²"
                                    icon={<Filter size={18} />}
                                    color="#8b5cf6"
                                    theme={c}
                                />
                            </div>
                        ) : (
                            <div style={{
                                opacity: 0.3,
                                textAlign: 'center',
                                padding: '3rem 0',
                                fontSize: '0.85rem'
                            }}>
                                En attente d'analyse...
                            </div>
                        )}
                    </div>

                    {/* Size Distribution */}
                    {result && (
                        <div style={{
                            background: c.bgSecondary,
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: '1px solid ' + c.borderColor
                        }}>
                            <h3 style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: c.textSecondary,
                                textTransform: 'uppercase'
                            }}>
                                <TrendingUp size={16} /> Distribution des Tailles
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {result.sizeDistribution.map((dist, idx) => (
                                    <div key={idx}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.85rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{ color: c.textSecondary }}>{dist.range}</span>
                                            <span style={{ fontWeight: 600 }}>{dist.count}</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: c.cardBg,
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(dist.count / result.count) * 100}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                                borderRadius: '3px'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analysis Status */}
                    <div style={{
                        background: result
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(156, 163, 175, 0.1)',
                        border: '1px solid ' + (result ? '#10b981' : c.borderColor),
                        padding: '1rem',
                        borderRadius: '0.75rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: result ? '#10b981' : c.textSecondary
                        }}>
                            {result ? (
                                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                            ) : (
                                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                {result ? (
                                    <>
                                        <strong>Analyse terminée</strong>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                                            {new Date(result.timestamp).toLocaleString()}
                                        </div>
                                    </>
                                ) : (
                                    <strong>Aucune analyse effectuée</strong>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};


// Components
interface ParamSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit: string;
    theme: any;
}

const ParamSlider = ({ label, value, onChange, min, max, unit, theme }: ParamSliderProps) => (
    <div>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.75rem'
        }}>
            <span style={{ color: theme.textSecondary }}>{label}</span>
            <span style={{ fontWeight: 600 }}>
                {value}{unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, ${theme.cardBg} ${((value - min) / (max - min)) * 100}%, ${theme.cardBg} 100%)`,
                outline: 'none',
                cursor: 'pointer'
            }}
        />
    </div>
);

interface ParamToggleProps {
    label: string;
    active: boolean;
    onChange: (value: boolean) => void;
    theme: any;
}

const ParamToggle = ({ label, active, onChange, theme }: ParamToggleProps) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: theme.cardBg,
        borderRadius: '0.5rem',
        border: '1px solid ' + theme.borderColor
    }}>
        <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>{label}</span>
        <button
            onClick={() => onChange(!active)}
            style={{
                width: '48px',
                height: '24px',
                background: active ? '#10b981' : theme.cardBg,
                border: '1px solid ' + (active ? '#10b981' : theme.borderColor),
                borderRadius: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: active ? '26px' : '2px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </button>
    </div>
);

interface StatCardProps {
    label: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    color: string;
    theme: any;
}

const StatCard = ({ label, value, unit, icon, color, theme }: StatCardProps) => (
    <div style={{
        padding: '1rem',
        background: theme.cardBg,
        borderRadius: '0.75rem',
        border: '1px solid ' + theme.borderColor,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{
            padding: '0.75rem',
            background: color + '20',
            borderRadius: '0.75rem',
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{
                fontSize: '0.75rem',
                color: theme.textSecondary,
                marginBottom: '0.25rem'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                lineHeight: 1
            }}>
                {value}
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    marginLeft: '0.25rem',
                    color: theme.textSecondary
                }}>
                    {unit}
                </span>
            </div>
        </div>
    </div>
);

export default ColonyVision;
