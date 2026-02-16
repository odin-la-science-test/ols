import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker, Calculator, Save, Download } from 'lucide-react';
import { useToast } from '../../components/ToastContext';

interface BufferRecipe {
    name: string;
    components: { name: string; concentration: string; amount: string }[];
    pH: string;
    volume: string;
}

const BufferCalc = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [selectedBuffer, setSelectedBuffer] = useState('');
    const [volume, setVolume] = useState(100);
    const [concentration, setConcentration] = useState(1);
    const [recipe, setRecipe] = useState<BufferRecipe | null>(null);

    const bufferTemplates = {
        'PBS': {
            name: 'PBS (Phosphate Buffered Saline)',
            pH: '7.4',
            components: [
                { name: 'NaCl', mw: 58.44, concentration: 137, unit: 'mM' },
                { name: 'KCl', mw: 74.55, concentration: 2.7, unit: 'mM' },
                { name: 'Na2HPO4', mw: 141.96, concentration: 10, unit: 'mM' },
                { name: 'KH2PO4', mw: 136.09, concentration: 1.8, unit: 'mM' }
            ]
        },
        'TBE': {
            name: 'TBE (Tris-Borate-EDTA)',
            pH: '8.3',
            components: [
                { name: 'Tris base', mw: 121.14, concentration: 89, unit: 'mM' },
                { name: 'Boric acid', mw: 61.83, concentration: 89, unit: 'mM' },
                { name: 'EDTA', mw: 372.24, concentration: 2, unit: 'mM' }
            ]
        },
        'TAE': {
            name: 'TAE (Tris-Acetate-EDTA)',
            pH: '8.5',
            components: [
                { name: 'Tris base', mw: 121.14, concentration: 40, unit: 'mM' },
                { name: 'Acetic acid', mw: 60.05, concentration: 20, unit: 'mM' },
                { name: 'EDTA', mw: 372.24, concentration: 1, unit: 'mM' }
            ]
        },
        'Tris-HCl': {
            name: 'Tris-HCl Buffer',
            pH: '7.5',
            components: [
                { name: 'Tris base', mw: 121.14, concentration: 50, unit: 'mM' },
                { name: 'HCl', mw: 36.46, concentration: 0, unit: 'mM (adjust pH)' }
            ]
        }
    };

    const calculateRecipe = () => {
        if (!selectedBuffer) {
            showToast('Sélectionnez un tampon', 'error');
            return;
        }

        const template = bufferTemplates[selectedBuffer as keyof typeof bufferTemplates];
        const volumeL = volume / 1000;
        
        const components = template.components.map(comp => {
            const moles = (comp.concentration / 1000) * volumeL * concentration;
            const mass = moles * comp.mw;
            
            return {
                name: comp.name,
                concentration: `${comp.concentration * concentration} ${comp.unit}`,
                amount: `${mass.toFixed(3)} g`
            };
        });

        setRecipe({
            name: template.name,
            components,
            pH: template.pH,
            volume: `${volume} mL`
        });

        showToast('Recette calculée!', 'success');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <button
                    onClick={() => navigate('/hugin')}
                    className="btn"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} />
                    Retour au Labo
                </button>

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Beaker size={32} color="var(--accent-hugin)" />
                        BufferCalc - Calculateur de Tampons
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Calculez rapidement les quantités nécessaires pour vos solutions tampons
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Input Panel */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        padding: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Paramètres
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Type de Tampon
                            </label>
                            <select
                                value={selectedBuffer}
                                onChange={(e) => setSelectedBuffer(e.target.value)}
                                className="input-field"
                                style={{ marginBottom: 0 }}
                            >
                                <option value="">Sélectionnez un tampon</option>
                                {Object.entries(bufferTemplates).map(([key, template]) => (
                                    <option key={key} value={key}>
                                        {template.name} (pH {template.pH})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Volume Final (mL)
                            </label>
                            <input
                                type="number"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                min="1"
                                className="input-field"
                                style={{ marginBottom: 0 }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Concentration (X)
                            </label>
                            <input
                                type="number"
                                value={concentration}
                                onChange={(e) => setConcentration(Number(e.target.value))}
                                min="0.1"
                                step="0.1"
                                className="input-field"
                                style={{ marginBottom: 0 }}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                1X = concentration standard
                            </p>
                        </div>

                        <button
                            onClick={calculateRecipe}
                            className="btn btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Calculator size={18} />
                            Calculer la Recette
                        </button>
                    </div>

                    {/* Recipe Panel */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        padding: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Recette
                        </h2>

                        {!recipe ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <Beaker size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Sélectionnez un tampon et cliquez sur "Calculer"</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {recipe.name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>pH: {recipe.pH}</span>
                                        <span>Volume: {recipe.volume}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                        Composants:
                                    </h4>
                                    {recipe.components.map((comp, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem',
                                                background: 'var(--bg-primary)',
                                                borderRadius: '0.5rem',
                                                marginBottom: '0.5rem'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{comp.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {comp.concentration}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                color: 'var(--accent-hugin)'
                                            }}>
                                                {comp.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    marginBottom: '1rem'
                                }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        Instructions:
                                    </h4>
                                    <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        <li>Peser chaque composant selon les quantités indiquées</li>
                                        <li>Dissoudre dans ~80% du volume final d'eau distillée</li>
                                        <li>Ajuster le pH si nécessaire</li>
                                        <li>Compléter au volume final avec de l'eau distillée</li>
                                        <li>Stériliser par autoclavage ou filtration (0.22 μm)</li>
                                    </ol>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => showToast('Recette sauvegardée', 'success')}
                                        className="btn"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Save size={18} />
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={() => showToast('Export en cours...', 'info')}
                                        className="btn"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Download size={18} />
                                        Exporter PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BufferCalc;
