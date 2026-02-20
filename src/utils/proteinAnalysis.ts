// Utilitaires d'analyse de protéines

// Point isoélectrique (algorithme de Bjellqvist plus précis)
export const calculateIsoelectricPoint = (sequence: string): number => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    
    // pKa des groupes ionisables (Bjellqvist et al.)
    const pKa = {
        nTerm: 8.6,
        cTerm: 3.6,
        K: 10.8,
        R: 12.5,
        H: 6.5,
        D: 3.9,
        E: 4.3,
        C: 8.5,
        Y: 10.1
    };
    
    // Compter les résidus ionisables
    const counts = {
        K: (cleanSeq.match(/K/g) || []).length,
        R: (cleanSeq.match(/R/g) || []).length,
        H: (cleanSeq.match(/H/g) || []).length,
        D: (cleanSeq.match(/D/g) || []).length,
        E: (cleanSeq.match(/E/g) || []).length,
        C: (cleanSeq.match(/C/g) || []).length,
        Y: (cleanSeq.match(/Y/g) || []).length
    };
    
    // Recherche dichotomique du pI
    let pHMin = 0;
    let pHMax = 14;
    let pI = 7;
    
    for (let i = 0; i < 100; i++) {
        const pH = (pHMin + pHMax) / 2;
        
        // Calculer la charge nette à ce pH
        const charge = 
            // Charges positives
            1 / (1 + Math.pow(10, pH - pKa.nTerm)) +
            counts.K / (1 + Math.pow(10, pH - pKa.K)) +
            counts.R / (1 + Math.pow(10, pH - pKa.R)) +
            counts.H / (1 + Math.pow(10, pH - pKa.H)) -
            // Charges négatives
            1 / (1 + Math.pow(10, pKa.cTerm - pH)) -
            counts.D / (1 + Math.pow(10, pKa.D - pH)) -
            counts.E / (1 + Math.pow(10, pKa.E - pH)) -
            counts.C / (1 + Math.pow(10, pKa.C - pH)) -
            counts.Y / (1 + Math.pow(10, pKa.Y - pH));
        
        if (Math.abs(charge) < 0.001) {
            pI = pH;
            break;
        }
        
        if (charge > 0) {
            pHMin = pH;
        } else {
            pHMax = pH;
        }
        
        pI = pH;
    }
    
    return pI;
};

// Propriétés des acides aminés
const aminoAcidProperties: { [key: string]: { 
    name: string; 
    hydrophobicity: number; 
    charge: number;
    mw: number;
    pI: number;
}} = {
    'A': { name: 'Alanine', hydrophobicity: 1.8, charge: 0, mw: 89.1, pI: 6.0 },
    'R': { name: 'Arginine', hydrophobicity: -4.5, charge: 1, mw: 174.2, pI: 10.8 },
    'N': { name: 'Asparagine', hydrophobicity: -3.5, charge: 0, mw: 132.1, pI: 5.4 },
    'D': { name: 'Aspartate', hydrophobicity: -3.5, charge: -1, mw: 133.1, pI: 2.8 },
    'C': { name: 'Cysteine', hydrophobicity: 2.5, charge: 0, mw: 121.2, pI: 5.0 },
    'Q': { name: 'Glutamine', hydrophobicity: -3.5, charge: 0, mw: 146.1, pI: 5.7 },
    'E': { name: 'Glutamate', hydrophobicity: -3.5, charge: -1, mw: 147.1, pI: 3.2 },
    'G': { name: 'Glycine', hydrophobicity: -0.4, charge: 0, mw: 75.1, pI: 6.0 },
    'H': { name: 'Histidine', hydrophobicity: -3.2, charge: 0.1, mw: 155.2, pI: 7.6 },
    'I': { name: 'Isoleucine', hydrophobicity: 4.5, charge: 0, mw: 131.2, pI: 6.0 },
    'L': { name: 'Leucine', hydrophobicity: 3.8, charge: 0, mw: 131.2, pI: 6.0 },
    'K': { name: 'Lysine', hydrophobicity: -3.9, charge: 1, mw: 146.2, pI: 9.7 },
    'M': { name: 'Methionine', hydrophobicity: 1.9, charge: 0, mw: 149.2, pI: 5.7 },
    'F': { name: 'Phenylalanine', hydrophobicity: 2.8, charge: 0, mw: 165.2, pI: 5.5 },
    'P': { name: 'Proline', hydrophobicity: -1.6, charge: 0, mw: 115.1, pI: 6.3 },
    'S': { name: 'Serine', hydrophobicity: -0.8, charge: 0, mw: 105.1, pI: 5.7 },
    'T': { name: 'Threonine', hydrophobicity: -0.7, charge: 0, mw: 119.1, pI: 5.6 },
    'W': { name: 'Tryptophan', hydrophobicity: -0.9, charge: 0, mw: 204.2, pI: 5.9 },
    'Y': { name: 'Tyrosine', hydrophobicity: -1.3, charge: 0, mw: 181.2, pI: 5.7 },
    'V': { name: 'Valine', hydrophobicity: 4.2, charge: 0, mw: 117.1, pI: 6.0 }
};

export interface ProteinAnalysisResult {
    composition: { [key: string]: number };
    molecularWeight: number;
    isoelectricPoint: number;
    hydrophobicity: number;
    charge: number;
    aromaticity: number;
    instabilityIndex: number;
    aliphaticIndex: number;
    gravy: number; // Grand Average of Hydropathy
    secondaryStructure: {
        helix: number;
        sheet: number;
        turn: number;
        coil: number;
    };
    hydrophobicityProfile: number[];
    chargeProfile: number[];
}

// Analyser une séquence protéique
export const analyzeProtein = (sequence: string): ProteinAnalysisResult => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    
    // Composition
    const composition: { [key: string]: number } = {};
    let totalMW = 0;
    let totalCharge = 0;
    let totalHydrophobicity = 0;
    let aromaticCount = 0;
    
    for (const aa of cleanSeq) {
        composition[aa] = (composition[aa] || 0) + 1;
        const props = aminoAcidProperties[aa];
        if (props) {
            totalMW += props.mw;
            totalCharge += props.charge;
            totalHydrophobicity += props.hydrophobicity;
            if (['F', 'W', 'Y'].includes(aa)) aromaticCount++;
        }
    }
    
    const length = cleanSeq.length;
    
    // Point isoélectrique (algorithme de Bjellqvist)
    const isoelectricPoint = calculateIsoelectricPoint(cleanSeq);
    
    // GRAVY (Grand Average of Hydropathy)
    const gravy = totalHydrophobicity / length;
    
    // Aromaticité
    const aromaticity = aromaticCount / length;
    
    // Index aliphatique
    const aliphaticIndex = ((composition['A'] || 0) + 2.9 * (composition['V'] || 0) + 
                           3.9 * ((composition['I'] || 0) + (composition['L'] || 0))) / length * 100;
    
    // Profil d'hydrophobicité (fenêtre glissante)
    const hydrophobicityProfile: number[] = [];
    const windowSize = 9;
    for (let i = 0; i < length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
             j < Math.min(length, i + Math.ceil(windowSize / 2)); j++) {
            const props = aminoAcidProperties[cleanSeq[j]];
            if (props) {
                sum += props.hydrophobicity;
                count++;
            }
        }
        hydrophobicityProfile.push(count > 0 ? sum / count : 0);
    }
    
    // Profil de charge
    const chargeProfile: number[] = [];
    for (let i = 0; i < length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
             j < Math.min(length, i + Math.ceil(windowSize / 2)); j++) {
            const props = aminoAcidProperties[cleanSeq[j]];
            if (props) {
                sum += props.charge;
                count++;
            }
        }
        chargeProfile.push(count > 0 ? sum / count : 0);
    }
    
    // Prédiction de structure secondaire (Chou-Fasman simplifié)
    const helixPropensity: { [key: string]: number } = {
        'E': 1.53, 'A': 1.45, 'L': 1.34, 'M': 1.20, 'Q': 1.17, 'K': 1.07, 'R': 1.03, 'H': 1.00,
        'V': 0.90, 'I': 0.97, 'Y': 0.72, 'C': 0.77, 'W': 0.99, 'F': 1.12, 'T': 0.82, 'G': 0.53,
        'N': 0.73, 'P': 0.59, 'S': 0.79, 'D': 0.98
    };
    
    const sheetPropensity: { [key: string]: number } = {
        'V': 1.87, 'I': 1.60, 'Y': 1.45, 'F': 1.38, 'W': 1.19, 'L': 1.22, 'T': 1.20, 'C': 1.30,
        'Q': 1.23, 'M': 1.00, 'R': 0.90, 'N': 0.65, 'H': 0.80, 'A': 0.97, 'S': 0.72, 'G': 0.81,
        'P': 0.62, 'D': 0.80, 'E': 0.26, 'K': 0.74
    };
    
    let helixScore = 0, sheetScore = 0;
    for (const aa of cleanSeq) {
        helixScore += helixPropensity[aa] || 1.0;
        sheetScore += sheetPropensity[aa] || 1.0;
    }
    
    const totalStructure = helixScore + sheetScore;
    const helix = (helixScore / totalStructure) * 100;
    const sheet = (sheetScore / totalStructure) * 100;
    const turn = 15; // Approximation
    const coil = 100 - helix - sheet - turn;
    
    // Index d'instabilité (approximation)
    const instabilityIndex = Math.abs(gravy) * 10 + Math.abs(totalCharge / length) * 20;
    
    return {
        composition,
        molecularWeight: totalMW - (length - 1) * 18, // Soustraire l'eau des liaisons peptidiques
        isoelectricPoint: Math.max(2, Math.min(12, isoelectricPoint)),
        hydrophobicity: gravy,
        charge: totalCharge,
        aromaticity: aromaticity * 100,
        instabilityIndex,
        aliphaticIndex,
        gravy,
        secondaryStructure: { helix, sheet, turn, coil },
        hydrophobicityProfile,
        chargeProfile
    };
};

// Exporter les résultats en CSV
export const exportAnalysisToCSV = (sequence: string, analysis: ProteinAnalysisResult, name: string): string => {
    let csv = `Protein Analysis Report: ${name}\n\n`;
    csv += `Sequence Length,${sequence.length}\n`;
    csv += `Molecular Weight (Da),${analysis.molecularWeight.toFixed(2)}\n`;
    csv += `Isoelectric Point,${analysis.isoelectricPoint.toFixed(2)}\n`;
    csv += `Net Charge,${analysis.charge.toFixed(2)}\n`;
    csv += `GRAVY,${analysis.gravy.toFixed(3)}\n`;
    csv += `Aromaticity (%),${analysis.aromaticity.toFixed(2)}\n`;
    csv += `Aliphatic Index,${analysis.aliphaticIndex.toFixed(2)}\n`;
    csv += `Instability Index,${analysis.instabilityIndex.toFixed(2)}\n\n`;
    
    csv += `Secondary Structure Prediction\n`;
    csv += `Alpha Helix (%),${analysis.secondaryStructure.helix.toFixed(2)}\n`;
    csv += `Beta Sheet (%),${analysis.secondaryStructure.sheet.toFixed(2)}\n`;
    csv += `Turn (%),${analysis.secondaryStructure.turn.toFixed(2)}\n`;
    csv += `Random Coil (%),${analysis.secondaryStructure.coil.toFixed(2)}\n\n`;
    
    csv += `Amino Acid Composition\n`;
    csv += `Amino Acid,Count,Percentage\n`;
    for (const [aa, count] of Object.entries(analysis.composition).sort((a, b) => b[1] - a[1])) {
        const percentage = (count / sequence.length * 100).toFixed(2);
        csv += `${aa} (${aminoAcidProperties[aa]?.name || 'Unknown'}),${count},${percentage}\n`;
    }
    
    return csv;
};

// Obtenir la couleur pour l'hydrophobicité
export const getHydrophobicityColor = (value: number): string => {
    if (value > 2) return '#ef4444'; // Rouge (très hydrophobe)
    if (value > 0) return '#f97316'; // Orange (hydrophobe)
    if (value > -2) return '#22c55e'; // Vert (neutre)
    return '#3b82f6'; // Bleu (hydrophile)
};

// Obtenir la couleur pour la charge
export const getChargeColor = (value: number): string => {
    if (value > 0.3) return '#3b82f6'; // Bleu (positif)
    if (value < -0.3) return '#ef4444'; // Rouge (négatif)
    return '#6b7280'; // Gris (neutre)
};
