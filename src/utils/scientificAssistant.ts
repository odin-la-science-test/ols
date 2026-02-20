/**
 * Assistant Scientifique Intelligent
 * Basé sur des algorithmes et patterns - 100% gratuit, côté client
 */

interface AssistantResponse {
    answer: string;
    confidence: number;
    suggestions?: string[];
    relatedTopics?: string[];
}

export class ScientificAssistant {
    private knowledgeBase: Map<string, any>;
    private conversationHistory: { question: string; answer: string }[] = [];

    constructor() {
        this.knowledgeBase = new Map();
        this.initializeKnowledgeBase();
    }

    /**
     * Base de connaissances scientifiques
     */
    private initializeKnowledgeBase() {
        // Biologie moléculaire
        this.knowledgeBase.set('pcr', {
            keywords: ['pcr', 'amplification', 'polymerase', 'amorce', 'primer'],
            info: 'La PCR (Polymerase Chain Reaction) est une technique d\'amplification d\'ADN. Température typique : dénaturation 95°C, hybridation 50-65°C, élongation 72°C.',
            protocols: ['Dénaturation initiale: 95°C 5min', 'Cycles (30-40x): 95°C 30s, 55°C 30s, 72°C 1min/kb', 'Extension finale: 72°C 10min']
        });

        this.knowledgeBase.set('western_blot', {
            keywords: ['western', 'blot', 'protéine', 'anticorps', 'membrane'],
            info: 'Le Western Blot détecte des protéines spécifiques. Étapes : électrophorèse SDS-PAGE, transfert sur membrane, blocage, incubation anticorps, révélation.',
            protocols: ['Lyse cellulaire + dosage protéines', 'SDS-PAGE (100-150V)', 'Transfert (100V 1h)', 'Blocage lait 5% 1h', 'Anticorps 1° overnight 4°C', 'Anticorps 2° 1h RT', 'Révélation ECL']
        });

        this.knowledgeBase.set('elisa', {
            keywords: ['elisa', 'immunoessai', 'plaque', 'enzyme'],
            info: 'ELISA (Enzyme-Linked Immunosorbent Assay) quantifie des protéines. Types : direct, indirect, sandwich, compétitif.',
            protocols: ['Coating overnight 4°C', 'Blocage BSA 1% 1h', 'Échantillons 2h RT', 'Anticorps détection 1h', 'Substrat TMB 15-30min', 'Lecture 450nm']
        });

        this.knowledgeBase.set('culture_cellulaire', {
            keywords: ['culture', 'cellule', 'milieu', 'incubateur', 'passage'],
            info: 'Culture cellulaire : maintien de cellules vivantes in vitro. Conditions : 37°C, 5% CO2, milieu approprié.',
            protocols: ['Décongélation rapide 37°C', 'Passage 1:3 à 1:10 selon confluence', 'Changement milieu tous les 2-3 jours', 'Trypsinisation 3-5min 37°C']
        });

        this.knowledgeBase.set('clonage', {
            keywords: ['clonage', 'vecteur', 'ligation', 'transformation', 'restriction'],
            info: 'Clonage moléculaire : insertion d\'ADN dans un vecteur. Étapes : digestion, ligation, transformation, sélection.',
            protocols: ['Digestion enzymatique 37°C 1-2h', 'Purification gel/colonne', 'Ligation T4 ligase 16°C overnight', 'Transformation bactéries compétentes', 'Sélection antibiotique']
        });

        // Microbiologie
        this.knowledgeBase.set('culture_bacterienne', {
            keywords: ['bactérie', 'culture', 'milieu', 'agar', 'bouillon'],
            info: 'Culture bactérienne : croissance de bactéries sur milieu nutritif. Milieux courants : LB, TSA, gélose au sang.',
            protocols: ['Ensemencement stérile', 'Incubation 37°C 18-24h', 'Isolement colonies', 'Conservation glycérol -80°C']
        });

        // Biochimie
        this.knowledgeBase.set('dosage_proteine', {
            keywords: ['dosage', 'protéine', 'bradford', 'bca', 'lowry', 'concentration'],
            info: 'Dosage protéines : Bradford (rapide, Coomassie), BCA (sensible, compatible détergents), Lowry (précis).',
            protocols: ['Bradford: 1-20 µg/mL, lecture 595nm', 'BCA: 20-2000 µg/mL, incubation 37°C 30min, lecture 562nm']
        });

        this.knowledgeBase.set('chromatographie', {
            keywords: ['chromatographie', 'hplc', 'purification', 'colonne'],
            info: 'Chromatographie : séparation de molécules. Types : échange d\'ions, exclusion, affinité, phase inverse.',
            protocols: ['Équilibration colonne', 'Chargement échantillon', 'Lavage', 'Élution gradient', 'Régénération colonne']
        });

        // Biologie cellulaire
        this.knowledgeBase.set('transfection', {
            keywords: ['transfection', 'adn', 'plasmide', 'lipofection'],
            info: 'Transfection : introduction d\'ADN dans cellules. Méthodes : lipofection, électroporation, phosphate calcium.',
            protocols: ['Cellules 70-80% confluence', 'Complexes ADN-lipide 20min RT', 'Ajout sur cellules', 'Incubation 4-6h', 'Changement milieu', 'Expression 24-48h']
        });

        // Statistiques
        this.knowledgeBase.set('statistiques', {
            keywords: ['statistique', 'test', 'anova', 'student', 'p-value', 'significatif'],
            info: 'Tests statistiques : Student (2 groupes), ANOVA (>2 groupes), Chi2 (catégorielles). p<0.05 = significatif.',
            protocols: ['Vérifier normalité (Shapiro-Wilk)', 'Homogénéité variances (Levene)', 'Choisir test approprié', 'Calculer p-value', 'Post-hoc si nécessaire']
        });
    }

    /**
     * Analyse la question et génère une réponse
     */
    async ask(question: string): Promise<AssistantResponse> {
        const normalizedQuestion = question.toLowerCase().trim();
        
        // Détection du type de question
        if (this.isSequenceAnalysis(normalizedQuestion)) {
            return this.analyzeSequence(question);
        }
        
        if (this.isProtocolRequest(normalizedQuestion)) {
            return this.suggestProtocol(normalizedQuestion);
        }
        
        if (this.isCalculationRequest(normalizedQuestion)) {
            return this.performCalculation(normalizedQuestion);
        }
        
        if (this.isTroubleshooting(normalizedQuestion)) {
            return this.troubleshoot(normalizedQuestion);
        }
        
        // Recherche dans la base de connaissances
        const match = this.findBestMatch(normalizedQuestion);
        if (match) {
            return match;
        }
        
        // Réponse générique intelligente
        return this.generateGenericResponse(normalizedQuestion);
    }

    /**
     * Détecte si c'est une analyse de séquence
     */
    private isSequenceAnalysis(question: string): boolean {
        const sequencePattern = /[ATGCURYKMSWBDHVN]{10,}/i;
        return sequencePattern.test(question);
    }

    /**
     * Analyse une séquence
     */
    private analyzeSequence(question: string): AssistantResponse {
        const sequenceMatch = question.match(/[ATGCURYKMSWBDHVN]+/i);
        if (!sequenceMatch) {
            return {
                answer: 'Je n\'ai pas détecté de séquence valide. Veuillez fournir une séquence ADN, ARN ou protéique.',
                confidence: 0.3
            };
        }

        const sequence = sequenceMatch[0].toUpperCase();
        const isProtein = /[EFILPQ]/.test(sequence);
        const isDNA = /[ATGC]/.test(sequence) && !/U/.test(sequence);
        const isRNA = /U/.test(sequence);

        let analysis = '';
        if (isProtein) {
            analysis = `Séquence protéique détectée (${sequence.length} acides aminés).\n\n`;
            analysis += `Composition : ${this.analyzeProteinComposition(sequence)}\n`;
            analysis += `Utilisez le module ProteinFold pour une analyse complète.`;
        } else if (isDNA) {
            analysis = `Séquence ADN détectée (${sequence.length} nucléotides).\n\n`;
            analysis += `GC% : ${this.calculateGC(sequence).toFixed(1)}%\n`;
            analysis += `Tm estimé : ${this.calculateTm(sequence).toFixed(1)}°C\n`;
            analysis += `Brin complémentaire : ${this.getComplement(sequence)}`;
        } else if (isRNA) {
            analysis = `Séquence ARN détectée (${sequence.length} nucléotides).\n\n`;
            analysis += `GC% : ${this.calculateGC(sequence).toFixed(1)}%`;
        }

        return {
            answer: analysis,
            confidence: 0.9,
            suggestions: ['Analyser avec ProteinFold', 'Concevoir des amorces PCR', 'Rechercher des sites de restriction']
        };
    }

    /**
     * Calcule le %GC
     */
    private calculateGC(sequence: string): number {
        const gc = (sequence.match(/[GC]/gi) || []).length;
        return (gc / sequence.length) * 100;
    }

    /**
     * Calcule la Tm
     */
    private calculateTm(sequence: string): number {
        if (sequence.length < 14) {
            const a = (sequence.match(/A/gi) || []).length;
            const t = (sequence.match(/T/gi) || []).length;
            const g = (sequence.match(/G/gi) || []).length;
            const c = (sequence.match(/C/gi) || []).length;
            return 2 * (a + t) + 4 * (g + c);
        } else {
            const gc = this.calculateGC(sequence);
            return 64.9 + 41 * (gc - 16.4) / 100;
        }
    }

    /**
     * Brin complémentaire
     */
    private getComplement(sequence: string): string {
        const complement: { [key: string]: string } = {
            'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
            'U': 'A', 'R': 'Y', 'Y': 'R', 'K': 'M',
            'M': 'K', 'S': 'S', 'W': 'W', 'B': 'V',
            'V': 'B', 'D': 'H', 'H': 'D', 'N': 'N'
        };
        return sequence.split('').map(n => complement[n.toUpperCase()] || n).reverse().join('');
    }

    /**
     * Analyse composition protéique
     */
    private analyzeProteinComposition(sequence: string): string {
        const charged = (sequence.match(/[DEKR]/g) || []).length;
        const hydrophobic = (sequence.match(/[AVILMFYW]/g) || []).length;
        const polar = (sequence.match(/[STNQ]/g) || []).length;
        
        return `${charged} chargés, ${hydrophobic} hydrophobes, ${polar} polaires`;
    }

    /**
     * Détecte une demande de protocole
     */
    private isProtocolRequest(question: string): boolean {
        const protocolKeywords = ['protocole', 'comment faire', 'étapes', 'procédure', 'méthode'];
        return protocolKeywords.some(kw => question.includes(kw));
    }

    /**
     * Suggère un protocole
     */
    private suggestProtocol(question: string): AssistantResponse {
        for (const [key, value] of this.knowledgeBase.entries()) {
            if (value.keywords.some((kw: string) => question.includes(kw))) {
                const protocol = value.protocols.map((step: string, i: number) => 
                    `${i + 1}. ${step}`
                ).join('\n');
                
                return {
                    answer: `📋 Protocole ${key.toUpperCase()}\n\n${value.info}\n\n${protocol}`,
                    confidence: 0.85,
                    suggestions: ['Voir les détails', 'Calculer les volumes', 'Télécharger le protocole']
                };
            }
        }
        
        return {
            answer: 'Je n\'ai pas trouvé de protocole spécifique. Pouvez-vous préciser la technique ?',
            confidence: 0.4,
            suggestions: ['PCR', 'Western Blot', 'Culture cellulaire', 'ELISA']
        };
    }

    /**
     * Détecte une demande de calcul
     */
    private isCalculationRequest(question: string): boolean {
        const calcKeywords = ['calculer', 'combien', 'concentration', 'dilution', 'volume', 'masse'];
        return calcKeywords.some(kw => question.includes(kw));
    }

    /**
     * Effectue un calcul
     */
    private performCalculation(question: string): AssistantResponse {
        // Extraction de nombres
        const numbers = question.match(/\d+\.?\d*/g);
        
        if (question.includes('dilution')) {
            return {
                answer: '🧮 Pour les calculs de dilution, utilisez le module BioTools > Dilutions.\n\nFormule : C1×V1 = C2×V2\n\nExemple : Pour diluer 10 mL de solution 1M en 0.1M :\nV2 = (C1×V1)/C2 = (1×10)/0.1 = 100 mL',
                confidence: 0.8,
                suggestions: ['Ouvrir BioTools', 'Calculer une dilution sériée']
            };
        }
        
        if (question.includes('concentration')) {
            return {
                answer: '🧮 Pour les conversions de concentration, utilisez BioTools > Concentrations.\n\nConversions courantes :\n- mg/mL ↔ µM\n- % (w/v) ↔ molarité\n- Absorbance ↔ concentration',
                confidence: 0.8,
                suggestions: ['Ouvrir BioTools']
            };
        }
        
        return {
            answer: 'Pour les calculs scientifiques, utilisez les modules BioTools ou StatisticsLab.',
            confidence: 0.6,
            suggestions: ['BioTools', 'StatisticsLab']
        };
    }

    /**
     * Détecte un problème technique
     */
    private isTroubleshooting(question: string): boolean {
        const troubleKeywords = ['problème', 'erreur', 'ne fonctionne pas', 'échec', 'raté', 'pourquoi'];
        return troubleKeywords.some(kw => question.includes(kw));
    }

    /**
     * Dépannage
     */
    private troubleshoot(question: string): AssistantResponse {
        const troubleshooting: { [key: string]: string } = {
            'pcr': '❌ Problèmes PCR courants :\n• Pas de bande : vérifier amorces, Tm, Mg2+\n• Bandes multiples : optimiser Tm, réduire cycles\n• Smear : réduire temps élongation, ADN dégradé',
            'western': '❌ Problèmes Western Blot :\n• Pas de signal : vérifier anticorps, concentration protéines\n• Fond élevé : améliorer blocage, réduire anticorps\n• Bandes multiples : protéolyse, anticorps non-spécifique',
            'culture': '❌ Problèmes culture cellulaire :\n• Contamination : vérifier stérilité, antibiotiques\n• Mort cellulaire : vérifier milieu, CO2, température\n• Croissance lente : passage trop fréquent, milieu périmé'
        };
        
        for (const [key, solution] of Object.entries(troubleshooting)) {
            if (question.includes(key)) {
                return {
                    answer: solution,
                    confidence: 0.75,
                    suggestions: ['Voir le protocole complet', 'Contacter le support']
                };
            }
        }
        
        return {
            answer: '🔧 Pour un dépannage efficace, précisez :\n• La technique utilisée\n• Le problème observé\n• Les conditions expérimentales',
            confidence: 0.5
        };
    }

    /**
     * Trouve la meilleure correspondance
     */
    private findBestMatch(question: string): AssistantResponse | null {
        let bestMatch: any = null;
        let bestScore = 0;

        for (const [key, value] of this.knowledgeBase.entries()) {
            const score = value.keywords.reduce((acc: number, kw: string) => 
                acc + (question.includes(kw) ? 1 : 0), 0
            );
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { key, value };
            }
        }

        if (bestScore > 0) {
            return {
                answer: `📚 ${bestMatch.value.info}`,
                confidence: Math.min(0.9, bestScore * 0.3),
                suggestions: ['Voir le protocole', 'Plus d\'informations'],
                relatedTopics: bestMatch.value.keywords
            };
        }

        return null;
    }

    /**
     * Génère une réponse générique intelligente
     */
    private generateGenericResponse(question: string): AssistantResponse {
        const responses = [
            {
                keywords: ['bonjour', 'salut', 'hello'],
                answer: '👋 Bonjour ! Je suis votre assistant scientifique. Je peux vous aider avec :\n• Analyses de séquences\n• Protocoles expérimentaux\n• Calculs scientifiques\n• Dépannage technique\n\nQue puis-je faire pour vous ?'
            },
            {
                keywords: ['merci', 'thanks'],
                answer: '😊 De rien ! N\'hésitez pas si vous avez d\'autres questions.'
            },
            {
                keywords: ['aide', 'help'],
                answer: '🆘 Je peux vous aider avec :\n\n🧬 Biologie moléculaire : PCR, clonage, Western Blot\n🦠 Microbiologie : cultures bactériennes\n🧪 Biochimie : dosages, chromatographie\n🔬 Biologie cellulaire : culture, transfection\n📊 Statistiques : tests, analyses\n\nPosez-moi une question spécifique !'
            }
        ];

        for (const resp of responses) {
            if (resp.keywords.some(kw => question.includes(kw))) {
                return {
                    answer: resp.answer,
                    confidence: 0.9
                };
            }
        }

        return {
            answer: '🤔 Je n\'ai pas compris votre question. Essayez de :\n• Mentionner une technique spécifique (PCR, Western Blot, etc.)\n• Coller une séquence à analyser\n• Demander un protocole\n• Poser une question sur un calcul',
            confidence: 0.3,
            suggestions: ['Voir les modules disponibles', 'Exemples de questions']
        };
    }

    /**
     * Sauvegarde l'historique
     */
    saveToHistory(question: string, answer: string) {
        this.conversationHistory.push({ question, answer });
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
    }

    /**
     * Récupère l'historique
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Efface l'historique
     */
    clearHistory() {
        this.conversationHistory = [];
    }
}

export const scientificAssistant = new ScientificAssistant();
