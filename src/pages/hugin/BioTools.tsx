import { useState } from 'react';
import { Calculator, Droplet, Scale, Atom, Beaker, TestTube, Activity } from 'lucide-react';
import Navbar from '../../components/Navbar';

const BioTools = () => {
    const [activeTab, setActiveTab] = useState('dilution');
    
    // Dilution state
    const [c1, setC1] = useState('');
    const [v1, setV1] = useState('');
    const [c2, setC2] = useState('');
    const [v2, setV2] = useState('');
    const [solveFor, setSolveFor] = useState<'v1' | 'c2' | 'v2'>('v1');

    // Concentration Converter state
    const [concValue, setConcValue] = useState('');
    const [fromUnit, setFromUnit] = useState('M');
    const [toUnit, setToUnit] = useState('mM');
    const [concResult, setConcResult] = useState('');

    // Molecular Weight state
    const [formula, setFormula] = useState('');
    const [mwResult, setMwResult] = useState<{ mw: number; composition: any } | null>(null);

    // Serial Dilution state
    const [startConc, setStartConc] = useState('');
    const [dilutionFactor, setDilutionFactor] = useState('');
    const [numSteps, setNumSteps] = useState('');
    const [serialResults, setSerialResults] = useState<Array<{step: number, concentration: number, dilution: string}>>([]);

    // pH Calculator state
    const [pKa, setPKa] = useState('');
    const [acidConc, setAcidConc] = useState('');
    const [baseConc, setBaseConc] = useState('');
    const [phResult, setPhResult] = useState<number | null>(null);

    // OD Calculator state
    const [odValue, setOdValue] = useState('');
    const [conversionFactor, setConversionFactor] = useState('1e8'); // cellules/mL par unité OD
    const [volume, setVolume] = useState('');
    const [odResult, setOdResult] = useState<{ concentration: number; totalCells: number } | null>(null);

    const units = [
        { value: 'M', label: 'Molaire (M)', factor: 1 },
        { value: 'mM', label: 'Millimolaire (mM)', factor: 0.001 },
        { value: 'µM', label: 'Micromolaire (µM)', factor: 0.000001 },
        { value: 'nM', label: 'Nanomolaire (nM)', factor: 0.000000001 },
        { value: 'pM', label: 'Picomolaire (pM)', factor: 0.000000000001 }
    ];

    const atomicWeights: { [key: string]: number } = {
        H: 1.008, C: 12.011, N: 14.007, O: 15.999, P: 30.974, S: 32.06,
        Na: 22.990, Cl: 35.45, K: 39.098, Ca: 40.078, Mg: 24.305, Fe: 55.845,
        Zn: 65.38, Cu: 63.546, Br: 79.904, I: 126.90, F: 18.998, Si: 28.085
    };

    const commonFormulas = [
        { name: 'Eau', formula: 'H2O' },
        { name: 'Glucose', formula: 'C6H12O6' },
        { name: 'NaCl', formula: 'NaCl' },
        { name: 'Éthanol', formula: 'C2H6O' },
        { name: 'ATP', formula: 'C10H16N5O13P3' }
    ];

    const calculateDilution = () => {
        const C1 = parseFloat(c1);
        const V1 = parseFloat(v1);
        const C2 = parseFloat(c2);
        const V2 = parseFloat(v2);

        switch (solveFor) {
            case 'v1':
                if (C1 && C2 && V2) setV1(((C2 * V2) / C1).toFixed(3));
                break;
            case 'c2':
                if (C1 && V1 && V2) setC2(((C1 * V1) / V2).toFixed(3));
                break;
            case 'v2':
                if (C1 && V1 && C2) setV2(((C1 * V1) / C2).toFixed(3));
                break;
        }
    };

    const convertConcentration = () => {
        const value = parseFloat(concValue);
        if (!value) return;
        
        const fromFactor = units.find(u => u.value === fromUnit)?.factor || 1;
        const toFactor = units.find(u => u.value === toUnit)?.factor || 1;
        
        const result = (value * fromFactor) / toFactor;
        setConcResult(result.toExponential(3));
    };

    const calculateMolWeight = () => {
        if (!formula) return;
        
        let totalWeight = 0;
        const composition: { [key: string]: number } = {};
        
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;
        
        while ((match = regex.exec(formula)) !== null) {
            const element = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;
            
            if (atomicWeights[element]) {
                totalWeight += atomicWeights[element] * count;
                composition[element] = (composition[element] || 0) + count;
            }
        }
        
        setMwResult({ mw: totalWeight, composition });
    };

    const calculateSerialDilution = () => {
        const start = parseFloat(startConc);
        const factor = parseFloat(dilutionFactor);
        const steps = parseInt(numSteps);
        
        if (!start || !factor || !steps) return;
        
        const results = [];
        for (let i = 0; i <= steps; i++) {
            const concentration = start / Math.pow(factor, i);
            results.push({
                step: i,
                concentration: concentration,
                dilution: i === 0 ? 'Stock' : `1:${Math.pow(factor, i)}`
            });
        }
        
        setSerialResults(results);
    };

    const calculatePH = () => {
        const pka = parseFloat(pKa);
        const acid = parseFloat(acidConc);
        const base = parseFloat(baseConc);
        
        if (!pka || !acid || !base) return;
        
        // Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
        const ph = pka + Math.log10(base / acid);
        setPhResult(ph);
    };

    const calculateOD = () => {
        const od = parseFloat(odValue);
        const factor = parseFloat(conversionFactor);
        const vol = parseFloat(volume);
        
        if (!od || !factor) return;
        
        // Concentration en cellules/mL
        const concentration = od * factor;
        
        // Nombre total de cellules si volume fourni
        const totalCells = vol ? concentration * vol : 0;
        
        setOdResult({ concentration, totalCells });
    };

    const tabs = [
        { id: 'dilution', label: 'Dilutions', icon: <Droplet size={20} /> },
        { id: 'concentration', label: 'Concentrations', icon: <Scale size={20} /> },
        { id: 'molweight', label: 'Masse Moléculaire', icon: <Atom size={20} /> },
        { id: 'serial', label: 'Dilutions Sérielles', icon: <TestTube size={20} /> },
        { id: 'ph', label: 'pH & Tampons', icon: <Beaker size={20} /> },
        { id: 'od', label: 'Densité Optique', icon: <Activity size={20} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '1200px' }}>
                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Calculator size={64} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        Outils Bio
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Calculateurs et convertisseurs pour le laboratoire
                    </p>
                </header>

                {/* Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '2rem', 
                    borderBottom: '2px solid var(--border-color)',
                    overflowX: 'auto',
                    flexWrap: 'wrap'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1rem 1.5rem',
                                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 600,
                                transition: 'all 0.3s',
                                borderRadius: '8px 8px 0 0'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card" style={{ padding: '2rem' }}>
                    {activeTab === 'dilution' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Droplet size={28} style={{ color: 'var(--accent-primary)' }} />
                                Calculateur de Dilutions
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Formule : C₁ × V₁ = C₂ × V₂
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Calculer :
                                </label>
                                <select 
                                    value={solveFor} 
                                    onChange={(e) => setSolveFor(e.target.value as any)} 
                                    className="input-field" 
                                    style={{ width: '100%' }}
                                >
                                    <option value="v1">V₁ - Volume initial à prélever</option>
                                    <option value="c2">C₂ - Concentration finale</option>
                                    <option value="v2">V₂ - Volume final</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Solution Initiale</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>C₁ (Concentration)</label>
                                        <input 
                                            type="number" 
                                            value={c1} 
                                            onChange={(e) => setC1(e.target.value)} 
                                            placeholder="Ex: 1000" 
                                            className="input-field" 
                                            style={{ width: '100%' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                            V₁ (Volume) {solveFor === 'v1' && '(résultat)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            value={v1} 
                                            onChange={(e) => setV1(e.target.value)} 
                                            placeholder={solveFor === 'v1' ? 'Résultat' : 'Ex: 10'} 
                                            disabled={solveFor === 'v1'} 
                                            className="input-field" 
                                            style={{ width: '100%' }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>→</div>

                                <div>
                                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>Solution Finale</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                            C₂ (Concentration) {solveFor === 'c2' && '(résultat)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            value={c2} 
                                            onChange={(e) => setC2(e.target.value)} 
                                            placeholder={solveFor === 'c2' ? 'Résultat' : 'Ex: 100'} 
                                            disabled={solveFor === 'c2'} 
                                            className="input-field" 
                                            style={{ width: '100%' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                            V₂ (Volume) {solveFor === 'v2' && '(résultat)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            value={v2} 
                                            onChange={(e) => setV2(e.target.value)} 
                                            placeholder={solveFor === 'v2' ? 'Résultat' : 'Ex: 100'} 
                                            disabled={solveFor === 'v2'} 
                                            className="input-field" 
                                            style={{ width: '100%' }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={calculateDilution} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Calculator size={20} />
                                Calculer
                            </button>
                        </div>
                    )}

                    {activeTab === 'concentration' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Scale size={28} style={{ color: 'var(--accent-primary)' }} />
                                Convertisseur de Concentrations
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Convertir entre différentes unités de concentration molaire
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Valeur à convertir
                                </label>
                                <input 
                                    type="number" 
                                    value={concValue} 
                                    onChange={(e) => setConcValue(e.target.value)} 
                                    placeholder="Ex: 100" 
                                    className="input-field" 
                                    style={{ width: '100%' }} 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>De</label>
                                    <select 
                                        value={fromUnit} 
                                        onChange={(e) => setFromUnit(e.target.value)} 
                                        className="input-field" 
                                        style={{ width: '100%' }}
                                    >
                                        {units.map(unit => (
                                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>→</div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Vers</label>
                                    <select 
                                        value={toUnit} 
                                        onChange={(e) => setToUnit(e.target.value)} 
                                        className="input-field" 
                                        style={{ width: '100%' }}
                                    >
                                        {units.map(unit => (
                                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={convertConcentration} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                            >
                                <Calculator size={20} />
                                Convertir
                            </button>

                            {concResult && (
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--accent-primary)', color: 'white' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Résultat</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{concResult} {toUnit}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'molweight' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Atom size={28} style={{ color: 'var(--accent-primary)' }} />
                                Calculateur de Masse Moléculaire
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Calculer la masse moléculaire à partir d'une formule chimique
                            </p>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Formules courantes
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {commonFormulas.map(item => (
                                        <button
                                            key={item.formula}
                                            onClick={() => setFormula(item.formula)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {item.name} ({item.formula})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Formule chimique
                                </label>
                                <input 
                                    type="text" 
                                    value={formula} 
                                    onChange={(e) => setFormula(e.target.value)} 
                                    placeholder="Ex: C6H12O6" 
                                    className="input-field" 
                                    style={{ width: '100%' }} 
                                />
                            </div>

                            <button 
                                onClick={calculateMolWeight} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                            >
                                <Calculator size={20} />
                                Calculer
                            </button>

                            {mwResult && (
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--accent-primary)', color: 'white' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Résultat</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                                        {mwResult.mw.toFixed(3)} g/mol
                                    </p>
                                    <div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>Composition :</h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {Object.entries(mwResult.composition).map(([element, count]) => (
                                                <span key={element} style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
                                                    {element}: {count as number}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'serial' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TestTube size={28} style={{ color: 'var(--accent-primary)' }} />
                                Dilutions Sérielles
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Calculer une série de dilutions successives
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Concentration initiale
                                    </label>
                                    <input 
                                        type="number" 
                                        value={startConc} 
                                        onChange={(e) => setStartConc(e.target.value)} 
                                        placeholder="Ex: 1000" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Facteur de dilution
                                    </label>
                                    <input 
                                        type="number" 
                                        value={dilutionFactor} 
                                        onChange={(e) => setDilutionFactor(e.target.value)} 
                                        placeholder="Ex: 10" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Nombre d'étapes
                                    </label>
                                    <input 
                                        type="number" 
                                        value={numSteps} 
                                        onChange={(e) => setNumSteps(e.target.value)} 
                                        placeholder="Ex: 5" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={calculateSerialDilution} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                            >
                                <Calculator size={20} />
                                Calculer
                            </button>

                            {serialResults.length > 0 && (
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Résultats</h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Étape</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dilution</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Concentration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {serialResults.map((result, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '0.75rem' }}>{result.step}</td>
                                                        <td style={{ padding: '0.75rem' }}>{result.dilution}</td>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                                                            {result.concentration.toExponential(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ph' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Beaker size={28} style={{ color: 'var(--accent-primary)' }} />
                                Calculateur de pH
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Équation de Henderson-Hasselbalch : pH = pKa + log([A⁻]/[HA])
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        pKa
                                    </label>
                                    <input 
                                        type="number" 
                                        value={pKa} 
                                        onChange={(e) => setPKa(e.target.value)} 
                                        placeholder="Ex: 4.76" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        [HA] Acide (M)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={acidConc} 
                                        onChange={(e) => setAcidConc(e.target.value)} 
                                        placeholder="Ex: 0.1" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        [A⁻] Base (M)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={baseConc} 
                                        onChange={(e) => setBaseConc(e.target.value)} 
                                        placeholder="Ex: 0.1" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={calculatePH} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                            >
                                <Calculator size={20} />
                                Calculer pH
                            </button>

                            {phResult !== null && (
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--accent-primary)', color: 'white' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Résultat</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>pH = {phResult.toFixed(2)}</p>
                                    <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
                                        {phResult < 7 ? 'Solution acide' : phResult > 7 ? 'Solution basique' : 'Solution neutre'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'od' && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
                                Calculateur de Densité Optique
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Convertir la densité optique (OD) en concentration cellulaire
                            </p>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Facteurs de conversion courants
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <button
                                        onClick={() => setConversionFactor('1e8')}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: conversionFactor === '1e8' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: conversionFactor === '1e8' ? 'white' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        E. coli (1×10⁸)
                                    </button>
                                    <button
                                        onClick={() => setConversionFactor('1e7')}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: conversionFactor === '1e7' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: conversionFactor === '1e7' ? 'white' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        Levures (1×10⁷)
                                    </button>
                                    <button
                                        onClick={() => setConversionFactor('1e6')}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: conversionFactor === '1e6' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: conversionFactor === '1e6' ? 'white' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        Cellules mammifères (1×10⁶)
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Valeur OD₆₀₀
                                    </label>
                                    <input 
                                        type="number" 
                                        value={odValue} 
                                        onChange={(e) => setOdValue(e.target.value)} 
                                        placeholder="Ex: 0.5" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Facteur (cellules/mL/OD)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={conversionFactor} 
                                        onChange={(e) => setConversionFactor(e.target.value)} 
                                        placeholder="Ex: 1e8" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Volume (mL) - optionnel
                                    </label>
                                    <input 
                                        type="number" 
                                        value={volume} 
                                        onChange={(e) => setVolume(e.target.value)} 
                                        placeholder="Ex: 100" 
                                        className="input-field" 
                                        style={{ width: '100%' }} 
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={calculateOD} 
                                className="btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                            >
                                <Calculator size={20} />
                                Calculer
                            </button>

                            {odResult && (
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--accent-primary)', color: 'white' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Résultats</h3>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <p style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Concentration cellulaire</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                                {odResult.concentration.toExponential(2)} cellules/mL
                                            </p>
                                        </div>
                                        {odResult.totalCells > 0 && (
                                            <div>
                                                <p style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Nombre total de cellules</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                                    {odResult.totalCells.toExponential(2)} cellules
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="card" style={{ padding: '1.5rem', marginTop: '2rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-secondary)' }}>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>💡 Informations</h4>
                                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                    <li>OD₆₀₀ = 1.0 correspond généralement à ~10⁸ cellules/mL pour E. coli</li>
                                    <li>Le facteur de conversion varie selon l'organisme et les conditions</li>
                                    <li>Calibrez votre spectrophotomètre avec une courbe standard pour plus de précision</li>
                                    <li>La relation OD/concentration est linéaire jusqu'à OD ~0.8</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BioTools;
