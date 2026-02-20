import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Save, FolderOpen, Download, Dna, Activity, Target, Scissors, MapPin, Shield, Waves } from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import Navbar from '../../components/Navbar';

// Services et utilitaires
import { 
    saveProteinStructure, 
    loadProteinStructures, 
    deleteProteinStructure,
    type ProteinStructure 
} from '../../services/proteinFoldService';
import { analyzeProtein, exportAnalysisToCSV, type ProteinAnalysisResult } from '../../utils/proteinAnalysis';
import { 
    predictDisorder,
    predictPhosphorylation,
    predictLocalization,
    predictTransmembrane,
    predictEpitopes,
    predictCleavageSites,
    alignSequences
} from '../../utils/advancedProteinAnalysis';
import { predictStructure, type AlphaFoldPrediction } from '../../services/alphafoldService';

// Composants
import BasicAnalysisTab from './proteinFold/BasicAnalysisTab';
import AdvancedAnalysisTab from './proteinFold/AdvancedAnalysisTab';
import StructurePredictionTab from './proteinFold/StructurePredictionTab';
import SavedStructuresList from './proteinFold/SavedStructuresList';
import SequenceInput from './proteinFold/SequenceInput';

const ProteinFold = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // États de base
    const [sequence, setSequence] = useState('');
    const [structureName, setStructureName] = useState('');
    const [notes, setNotes] = useState('');
    const [currentStructureId, setCurrentStructureId] = useState<string | undefined>();
    
    // États d'analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [basicAnalysis, setBasicAnalysis] = useState<ProteinAnalysisResult | null>(null);
    const [alphafoldPrediction, setAlphafoldPrediction] = useState<AlphaFoldPrediction | null>(null);
    
    // États des analyses avancées
    const [disorderScores, setDisorderScores] = useState<number[]>([]);
    const [phosphoSites, setPhosphoSites] = useState<any[]>([]);
    const [localizationSignals, setLocalizationSignals] = useState<any[]>([]);
    const [tmDomains, setTmDomains] = useState<any[]>([]);
    const [epitopes, setEpitopes] = useState<any[]>([]);
    const [cleavageSites, setCleavageSites] = useState<any[]>([]);
    
    // États UI
    const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'structure'>('basic');
    const [savedStructures, setSavedStructures] = useState<ProteinStructure[]>([]);
    const [showSavedList, setShowSavedList] = useState(false);
    const [isPredicting3D, setIsPredicting3D] = useState(false);

    // Charger les structures sauvegardées
    useEffect(() => {
        loadSavedStructures();
    }, []);

    const loadSavedStructures = async () => {
        const structures = await loadProteinStructures();
        setSavedStructures(structures);
    };

    // Analyse complète
    const runCompleteAnalysis = async () => {
        if (!sequence || sequence.length < 10) {
            showToast('Veuillez entrer une séquence d\'au moins 10 acides aminés', 'error');
            return;
        }

        setIsAnalyzing(true);
        showToast('Analyse en cours...', 'info');

        try {
            // Analyse de base
            const basic = analyzeProtein(sequence);
            setBasicAnalysis(basic);

            // Analyses avancées
            const disorder = predictDisorder(sequence);
            setDisorderScores(disorder);

            const phospho = predictPhosphorylation(sequence);
            setPhosphoSites(phospho);

            const localization = predictLocalization(sequence);
            setLocalizationSignals(localization);

            const tm = predictTransmembrane(sequence);
            setTmDomains(tm);

            const epi = predictEpitopes(sequence);
            setEpitopes(epi);

            const cleavage = predictCleavageSites(sequence);
            setCleavageSites(cleavage);

            showToast('Analyse terminée !', 'success');
        } catch (error) {
            console.error('Erreur analyse:', error);
            showToast('Erreur lors de l\'analyse', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Prédiction 3D avec AlphaFold/ESMFold
    const predict3DStructure = async () => {
        if (!sequence || sequence.length < 10) {
            showToast('Séquence trop courte pour la prédiction 3D', 'error');
            return;
        }

        if (sequence.length > 5000) {
            showToast('Séquence trop longue (max 5000 résidus)', 'error');
            return;
        }

        setIsPredicting3D(true);
        
        const estimatedTime = sequence.length > 1000 ? '3-5' : sequence.length > 400 ? '5-10' : '10-30';
        showToast(`Prédiction 3D en cours (peut prendre ${estimatedTime} secondes)...`, 'info');

        try {
            const prediction = await predictStructure(sequence);
            
            if (prediction.status === 'success') {
                setAlphafoldPrediction(prediction);
                showToast(`Prédiction réussie ! Confiance moyenne: ${prediction.meanPlddt.toFixed(1)}`, 'success');
                setActiveTab('structure');
            } else {
                showToast(`Erreur: ${prediction.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur prédiction 3D:', error);
            showToast('Erreur lors de la prédiction 3D', 'error');
        } finally {
            setIsPredicting3D(false);
        }
    };

    // Sauvegarder la structure
    const handleSave = async () => {
        if (!structureName.trim()) {
            showToast('Veuillez donner un nom à la structure', 'error');
            return;
        }

        if (!sequence) {
            showToast('Aucune séquence à sauvegarder', 'error');
            return;
        }

        const structure: ProteinStructure = {
            id: currentStructureId,
            name: structureName,
            sequence,
            pdb_data: alphafoldPrediction?.pdb || '',
            view_mode: 'cartoon',
            molecular_weight: basicAnalysis?.molecularWeight,
            residue_count: sequence.length,
            notes,
            user_email: ''
        };

        const result = await saveProteinStructure(structure);
        
        if (result.success) {
            showToast('Structure sauvegardée', 'success');
            setCurrentStructureId(result.id);
            loadSavedStructures();
        } else {
            showToast(`Erreur: ${result.error}`, 'error');
        }
    };

    // Charger une structure
    const handleLoad = (structure: ProteinStructure) => {
        setStructureName(structure.name);
        setSequence(structure.sequence);
        setNotes(structure.notes || '');
        setCurrentStructureId(structure.id);
        setShowSavedList(false);
        
        // Relancer l'analyse
        setTimeout(() => runCompleteAnalysis(), 100);
        
        showToast(`Structure "${structure.name}" chargée`, 'success');
    };

    // Supprimer une structure
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer "${name}" ?`)) return;

        const result = await deleteProteinStructure(id);
        
        if (result.success) {
            showToast('Structure supprimée', 'success');
            loadSavedStructures();
            if (currentStructureId === id) {
                handleNew();
            }
        } else {
            showToast(`Erreur: ${result.error}`, 'error');
        }
    };

    // Nouvelle structure
    const handleNew = () => {
        setStructureName('');
        setSequence('');
        setNotes('');
        setCurrentStructureId(undefined);
        setBasicAnalysis(null);
        setAlphafoldPrediction(null);
        setDisorderScores([]);
        setPhosphoSites([]);
        setLocalizationSignals([]);
        setTmDomains([]);
        setEpitopes([]);
        setCleavageSites([]);
    };

    // Export
    const handleExport = () => {
        if (!basicAnalysis || !sequence) {
            showToast('Aucune analyse à exporter', 'error');
            return;
        }

        const csv = exportAnalysisToCSV(sequence, basicAnalysis, structureName || 'Protein');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${structureName || 'protein'}_analysis.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Analyse exportée', 'success');
    };

    const tabs = [
        { id: 'basic', label: 'Analyse de Base', icon: <Activity size={20} /> },
        { id: 'advanced', label: 'Analyses Avancées', icon: <Target size={20} /> },
        { id: 'structure', label: 'Structure 3D', icon: <Dna size={20} />, disabled: !alphafoldPrediction }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>
            <Navbar />
            
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '1400px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/hugin')} className="btn" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={20} />
                        Retour
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Dna size={40} color="var(--accent-hugin)" />
                                ProteinFold Pro
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Analyse complète et prédiction 3D avec AlphaFold/ESMFold
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button onClick={handleNew} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Dna size={18} />
                                Nouveau
                            </button>
                            <button onClick={() => setShowSavedList(!showSavedList)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FolderOpen size={18} />
                                Structures ({savedStructures.length})
                            </button>
                            <button onClick={handleSave} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-secondary)', color: 'white' }}>
                                <Save size={18} />
                                Sauvegarder
                            </button>
                            {basicAnalysis && (
                                <button onClick={handleExport} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={18} />
                                    Export CSV
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Liste des structures sauvegardées */}
                {showSavedList && (
                    <SavedStructuresList
                        structures={savedStructures}
                        onLoad={handleLoad}
                        onDelete={handleDelete}
                        onClose={() => setShowSavedList(false)}
                    />
                )}

                {/* Input de séquence */}
                <SequenceInput
                    structureName={structureName}
                    setStructureName={setStructureName}
                    sequence={sequence}
                    setSequence={setSequence}
                    notes={notes}
                    setNotes={setNotes}
                    onAnalyze={runCompleteAnalysis}
                    onPredict3D={predict3DStructure}
                    isAnalyzing={isAnalyzing}
                    isPredicting3D={isPredicting3D}
                />

                {/* Onglets d'analyse */}
                {basicAnalysis && (
                    <div style={{ marginTop: '2rem' }}>
                        {/* Navigation des onglets */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', flexWrap: 'wrap' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                                    disabled={tab.disabled}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: activeTab === tab.id ? 'var(--accent-hugin)' : 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab.id ? '3px solid var(--accent-hugin)' : '3px solid transparent',
                                        color: tab.disabled ? 'var(--text-secondary)' : (activeTab === tab.id ? 'white' : 'var(--text-primary)'),
                                        cursor: tab.disabled ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 600,
                                        transition: 'all 0.3s',
                                        borderRadius: '8px 8px 0 0',
                                        opacity: tab.disabled ? 0.5 : 1
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Contenu des onglets */}
                        {activeTab === 'basic' && (
                            <BasicAnalysisTab analysis={basicAnalysis} sequence={sequence} />
                        )}

                        {activeTab === 'advanced' && (
                            <AdvancedAnalysisTab
                                sequence={sequence}
                                disorderScores={disorderScores}
                                phosphoSites={phosphoSites}
                                localizationSignals={localizationSignals}
                                tmDomains={tmDomains}
                                epitopes={epitopes}
                                cleavageSites={cleavageSites}
                            />
                        )}

                        {activeTab === 'structure' && alphafoldPrediction && (
                            <StructurePredictionTab
                                prediction={alphafoldPrediction}
                                sequence={sequence}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProteinFold;
