// Algorithmes avancés d'analyse de protéines

// ============= PRÉDICTION DE DÉSORDRE (IUPred-like) =============
export const predictDisorder = (sequence: string): number[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const scores: number[] = [];
    
    // Propension au désordre par acide aminé
    const disorderPropensity: { [key: string]: number } = {
        'A': 0.06, 'R': 0.18, 'N': 0.17, 'D': 0.15, 'C': 0.02,
        'Q': 0.17, 'E': 0.15, 'G': 0.07, 'H': 0.08, 'I': 0.01,
        'L': 0.01, 'K': 0.20, 'M': 0.01, 'F': 0.01, 'P': 0.22,
        'S': 0.10, 'T': 0.08, 'W': 0.01, 'Y': 0.02, 'V': 0.01
    };
    
    const windowSize = 21;
    
    for (let i = 0; i < cleanSeq.length; i++) {
        let sum = 0;
        let count = 0;
        
        for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
             j < Math.min(cleanSeq.length, i + Math.ceil(windowSize / 2)); j++) {
            sum += disorderPropensity[cleanSeq[j]] || 0.1;
            count++;
        }
        
        scores.push(count > 0 ? sum / count : 0);
    }
    
    return scores;
};

// ============= SITES DE PHOSPHORYLATION =============
export interface PhosphorylationSite {
    position: number;
    residue: string;
    type: 'Ser' | 'Thr' | 'Tyr';
    score: number;
    kinase?: string;
}

export const predictPhosphorylation = (sequence: string): PhosphorylationSite[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const sites: PhosphorylationSite[] = [];
    
    // Motifs de phosphorylation
    const motifs = [
        // PKA: R-R-X-S/T
        { pattern: /RR.([ST])/g, kinase: 'PKA', type: 'Ser/Thr' as const },
        // PKC: S/T-X-R/K
        { pattern: /([ST]).[RK]/g, kinase: 'PKC', type: 'Ser/Thr' as const },
        // CK2: S/T-X-X-E/D
        { pattern: /([ST])..[ED]/g, kinase: 'CK2', type: 'Ser/Thr' as const },
        // CDK: S/T-P
        { pattern: /([ST])P/g, kinase: 'CDK', type: 'Ser/Thr' as const },
        // Tyrosine kinase: Y-X-X-P
        { pattern: /(Y)..P/g, kinase: 'TyrK', type: 'Tyr' as const }
    ];
    
    for (const motif of motifs) {
        let match;
        const regex = new RegExp(motif.pattern);
        
        while ((match = regex.exec(cleanSeq)) !== null) {
            const position = match.index + match[0].indexOf(match[1]);
            const residue = match[1];
            
            sites.push({
                position: position + 1,
                residue,
                type: residue === 'Y' ? 'Tyr' : (residue === 'S' ? 'Ser' : 'Thr'),
                score: 0.7 + Math.random() * 0.3,
                kinase: motif.kinase
            });
        }
    }
    
    return sites.sort((a, b) => a.position - b.position);
};

// ============= SIGNAUX DE LOCALISATION =============
export interface LocalizationSignal {
    type: 'NLS' | 'NES' | 'MTS' | 'SignalPeptide';
    start: number;
    end: number;
    sequence: string;
    score: number;
    location: string;
}

export const predictLocalization = (sequence: string): LocalizationSignal[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const signals: LocalizationSignal[] = [];
    
    // NLS (Nuclear Localization Signal): K-K/R-X-K/R
    const nlsPattern = /[KR]{2,4}[^DEKR]{0,2}[KR]{2,4}/g;
    let match;
    
    while ((match = nlsPattern.exec(cleanSeq)) !== null) {
        signals.push({
            type: 'NLS',
            start: match.index + 1,
            end: match.index + match[0].length,
            sequence: match[0],
            score: 0.8,
            location: 'Noyau'
        });
    }
    
    // NES (Nuclear Export Signal): L-X(2-3)-L-X(2-3)-L-X-L
    const nesPattern = /L.{2,3}L.{2,3}L.L/g;
    
    while ((match = nesPattern.exec(cleanSeq)) !== null) {
        signals.push({
            type: 'NES',
            start: match.index + 1,
            end: match.index + match[0].length,
            sequence: match[0],
            score: 0.7,
            location: 'Export nucléaire'
        });
    }
    
    // Signal peptide (N-terminal): hydrophobic region
    if (cleanSeq.length > 30) {
        let hydrophobicCount = 0;
        for (let i = 0; i < Math.min(30, cleanSeq.length); i++) {
            if ('AILMFWV'.includes(cleanSeq[i])) {
                hydrophobicCount++;
            }
        }
        
        if (hydrophobicCount > 15) {
            signals.push({
                type: 'SignalPeptide',
                start: 1,
                end: 25,
                sequence: cleanSeq.substring(0, 25),
                score: hydrophobicCount / 30,
                location: 'Sécrétion'
            });
        }
    }
    
    // MTS (Mitochondrial Targeting Signal): N-terminal, riche en R, K, L
    if (cleanSeq.length > 20) {
        let mtsScore = 0;
        for (let i = 0; i < Math.min(20, cleanSeq.length); i++) {
            if ('RKL'.includes(cleanSeq[i])) mtsScore += 0.05;
            if ('S'.includes(cleanSeq[i])) mtsScore += 0.02;
        }
        
        if (mtsScore > 0.5) {
            signals.push({
                type: 'MTS',
                start: 1,
                end: 20,
                sequence: cleanSeq.substring(0, 20),
                score: mtsScore,
                location: 'Mitochondrie'
            });
        }
    }
    
    return signals;
};

// ============= DOMAINES TRANSMEMBRANAIRES =============
export interface TransmembraneDomain {
    start: number;
    end: number;
    sequence: string;
    score: number;
    type: 'TM-helix';
}

export const predictTransmembrane = (sequence: string): TransmembraneDomain[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const domains: TransmembraneDomain[] = [];
    
    const windowSize = 20;
    const threshold = 1.5; // Hydrophobicité moyenne
    
    const hydrophobicity: { [key: string]: number } = {
        'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5,
        'Q': -3.5, 'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5,
        'L': 3.8, 'K': -3.9, 'M': 1.9, 'F': 2.8, 'P': -1.6,
        'S': -0.8, 'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
    };
    
    for (let i = 0; i <= cleanSeq.length - windowSize; i++) {
        let sum = 0;
        for (let j = i; j < i + windowSize; j++) {
            sum += hydrophobicity[cleanSeq[j]] || 0;
        }
        
        const avgHydro = sum / windowSize;
        
        if (avgHydro > threshold) {
            // Vérifier si ce n'est pas une extension d'un domaine existant
            const lastDomain = domains[domains.length - 1];
            if (lastDomain && i <= lastDomain.end + 5) {
                lastDomain.end = i + windowSize - 1;
                lastDomain.sequence = cleanSeq.substring(lastDomain.start - 1, lastDomain.end);
                lastDomain.score = Math.max(lastDomain.score, avgHydro);
            } else {
                domains.push({
                    start: i + 1,
                    end: i + windowSize,
                    sequence: cleanSeq.substring(i, i + windowSize),
                    score: avgHydro,
                    type: 'TM-helix'
                });
            }
        }
    }
    
    return domains;
};

// ============= PRÉDICTION D'ÉPITOPES (B-cell) =============
export interface Epitope {
    start: number;
    end: number;
    sequence: string;
    score: number;
    type: 'Linear' | 'Conformational';
}

export const predictEpitopes = (sequence: string): Epitope[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const epitopes: Epitope[] = [];
    
    // Propension à former des épitopes (basé sur hydrophilicité, accessibilité)
    const epitopePropensity: { [key: string]: number } = {
        'A': 0.5, 'R': 1.0, 'N': 0.8, 'D': 1.0, 'C': 0.3,
        'Q': 0.8, 'E': 1.0, 'G': 0.5, 'H': 0.7, 'I': 0.2,
        'L': 0.2, 'K': 1.0, 'M': 0.3, 'F': 0.3, 'P': 0.6,
        'S': 0.8, 'T': 0.7, 'W': 0.3, 'Y': 0.6, 'V': 0.2
    };
    
    const windowSize = 7;
    const threshold = 0.65;
    
    for (let i = 0; i <= cleanSeq.length - windowSize; i++) {
        let sum = 0;
        for (let j = i; j < i + windowSize; j++) {
            sum += epitopePropensity[cleanSeq[j]] || 0.5;
        }
        
        const avgScore = sum / windowSize;
        
        if (avgScore > threshold) {
            epitopes.push({
                start: i + 1,
                end: i + windowSize,
                sequence: cleanSeq.substring(i, i + windowSize),
                score: avgScore,
                type: 'Linear'
            });
        }
    }
    
    return epitopes;
};

// ============= SITES DE CLIVAGE =============
export interface CleavageSite {
    position: number;
    type: 'Trypsin' | 'Chymotrypsin' | 'Pepsin' | 'Caspase' | 'Thrombin';
    sequence: string;
    score: number;
}

export const predictCleavageSites = (sequence: string): CleavageSite[] => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const sites: CleavageSite[] = [];
    
    // Trypsin: coupe après K ou R (sauf si suivi de P)
    for (let i = 0; i < cleanSeq.length - 1; i++) {
        if ((cleanSeq[i] === 'K' || cleanSeq[i] === 'R') && cleanSeq[i + 1] !== 'P') {
            sites.push({
                position: i + 1,
                type: 'Trypsin',
                sequence: cleanSeq.substring(Math.max(0, i - 2), Math.min(cleanSeq.length, i + 3)),
                score: 0.9
            });
        }
    }
    
    // Chymotrypsin: coupe après F, W, Y (sauf si suivi de P)
    for (let i = 0; i < cleanSeq.length - 1; i++) {
        if ('FWY'.includes(cleanSeq[i]) && cleanSeq[i + 1] !== 'P') {
            sites.push({
                position: i + 1,
                type: 'Chymotrypsin',
                sequence: cleanSeq.substring(Math.max(0, i - 2), Math.min(cleanSeq.length, i + 3)),
                score: 0.85
            });
        }
    }
    
    // Caspase: motif DXXD
    const caspasePattern = /D..D/g;
    let match;
    
    while ((match = caspasePattern.exec(cleanSeq)) !== null) {
        sites.push({
            position: match.index + 4,
            type: 'Caspase',
            sequence: match[0],
            score: 0.8
        });
    }
    
    return sites.sort((a, b) => a.position - b.position);
};

// ============= ALIGNEMENT DE SÉQUENCES (Needleman-Wunsch) =============
export interface AlignmentResult {
    seq1Aligned: string;
    seq2Aligned: string;
    score: number;
    identity: number;
    similarity: number;
    gaps: number;
}

export const alignSequences = (seq1: string, seq2: string): AlignmentResult => {
    const s1 = seq1.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    const s2 = seq2.toUpperCase().replace(/[^ARNDCQEGHILKMFPSTWYV]/g, '');
    
    const match = 2;
    const mismatch = -1;
    const gap = -2;
    
    const n = s1.length + 1;
    const m = s2.length + 1;
    
    // Matrice de scores
    const matrix: number[][] = Array(n).fill(0).map(() => Array(m).fill(0));
    
    // Initialisation
    for (let i = 0; i < n; i++) matrix[i][0] = i * gap;
    for (let j = 0; j < m; j++) matrix[0][j] = j * gap;
    
    // Remplissage
    for (let i = 1; i < n; i++) {
        for (let j = 1; j < m; j++) {
            const matchScore = s1[i - 1] === s2[j - 1] ? match : mismatch;
            matrix[i][j] = Math.max(
                matrix[i - 1][j - 1] + matchScore,
                matrix[i - 1][j] + gap,
                matrix[i][j - 1] + gap
            );
        }
    }
    
    // Traceback
    let i = n - 1;
    let j = m - 1;
    let aligned1 = '';
    let aligned2 = '';
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? match : mismatch)) {
            aligned1 = s1[i - 1] + aligned1;
            aligned2 = s2[j - 1] + aligned2;
            i--;
            j--;
        } else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + gap) {
            aligned1 = s1[i - 1] + aligned1;
            aligned2 = '-' + aligned2;
            i--;
        } else {
            aligned1 = '-' + aligned1;
            aligned2 = s2[j - 1] + aligned2;
            j--;
        }
    }
    
    // Calcul des statistiques
    let identicalCount = 0;
    let similarCount = 0;
    let gapCount = 0;
    
    for (let k = 0; k < aligned1.length; k++) {
        if (aligned1[k] === '-' || aligned2[k] === '-') {
            gapCount++;
        } else if (aligned1[k] === aligned2[k]) {
            identicalCount++;
            similarCount++;
        } else if (areSimilar(aligned1[k], aligned2[k])) {
            similarCount++;
        }
    }
    
    return {
        seq1Aligned: aligned1,
        seq2Aligned: aligned2,
        score: matrix[n - 1][m - 1],
        identity: (identicalCount / aligned1.length) * 100,
        similarity: (similarCount / aligned1.length) * 100,
        gaps: gapCount
    };
};

// Vérifier si deux acides aminés sont similaires
const areSimilar = (aa1: string, aa2: string): boolean => {
    const groups = [
        'GAVLI',  // Aliphatiques
        'FYW',    // Aromatiques
        'CM',     // Soufrés
        'ST',     // Hydroxylés
        'KRH',    // Basiques
        'DE',     // Acides
        'NQ',     // Amides
        'P'       // Proline
    ];
    
    for (const group of groups) {
        if (group.includes(aa1) && group.includes(aa2)) {
            return true;
        }
    }
    
    return false;
};
