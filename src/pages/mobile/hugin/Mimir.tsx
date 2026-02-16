import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Send, Sparkles, User, Loader2 } from 'lucide-react';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MobileMimir = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Bonjour ! Je suis Mimir, votre assistant IA scientifique. Je peux vous aider avec vos questions de recherche, expliquer des concepts biologiques, analyser des protocoles, et bien plus encore. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const generateAIResponse = async (userQuery: string): Promise<string> => {
    const query = userQuery.toLowerCase();

    if (query.includes('pcr') || query.includes('polymerase')) {
      return "La PCR (Polymerase Chain Reaction) est une technique d'amplification d'ADN qui permet de créer des millions de copies d'une séquence spécifique. Elle se déroule en 3 étapes cycliques : dénaturation (95°C), hybridation des amorces (50-65°C), et élongation (72°C). Pour optimiser votre PCR, assurez-vous d'utiliser des amorces de 18-25 nucléotides avec un Tm similaire et évitez les structures secondaires.";
    }

    if (query.includes('crispr') || query.includes('édition génomique')) {
      return "CRISPR-Cas9 est un système d'édition génomique révolutionnaire qui permet de modifier précisément l'ADN. Il utilise un ARN guide (gRNA) pour diriger la nucléase Cas9 vers une séquence cible spécifique. Le système crée une coupure double-brin qui peut être réparée par NHEJ (jonction non-homologue) ou HDR (réparation dirigée par homologie). Les applications incluent la thérapie génique, la création de modèles animaux, et l'amélioration des cultures.";
    }

    if (query.includes('western blot') || query.includes('immunoblot')) {
      return "Le Western Blot est une technique d'immunodétection des protéines. Protocole : 1) Électrophorèse SDS-PAGE pour séparer les protéines, 2) Transfert sur membrane PVDF ou nitrocellulose, 3) Blocage avec du lait ou BSA 5%, 4) Incubation avec anticorps primaire (4°C overnight), 5) Lavages TBST, 6) Anticorps secondaire conjugué (1h RT), 7) Révélation par chimioluminescence. Conseil : utilisez toujours des contrôles de charge (β-actine, GAPDH).";
    }

    if (query.includes('culture cellulaire') || query.includes('cellules')) {
      return "Pour une culture cellulaire optimale : 1) Travaillez en conditions stériles sous PSM, 2) Utilisez un milieu adapté (DMEM, RPMI) avec 10% FBS et antibiotiques, 3) Maintenez à 37°C avec 5% CO2, 4) Passez les cellules à 80-90% confluence (trypsine 0.25%), 5) Vérifiez régulièrement la contamination mycoplasme. Pour la cryoconservation, utilisez 10% DMSO dans du FBS et congelez progressivement (-1°C/min).";
    }

    if (query.includes('elisa') || query.includes('immunoessai')) {
      return "L'ELISA (Enzyme-Linked Immunosorbent Assay) permet de quantifier des protéines. Types : 1) Direct (antigène fixé, anticorps marqué), 2) Indirect (anticorps primaire + secondaire marqué), 3) Sandwich (capture + détection). Protocole : coating overnight 4°C, blocage 1h, incubations anticorps, substrat TMB, lecture à 450nm. Optimisez les dilutions d'anticorps et incluez une gamme standard pour la quantification.";
    }

    if (query.includes('clonage') || query.includes('plasmide')) {
      return "Le clonage moléculaire permet d'insérer un gène dans un vecteur. Étapes : 1) Digestion enzymatique de l'insert et du vecteur avec les mêmes enzymes de restriction, 2) Purification sur gel, 3) Ligation (ratio insert:vecteur 3:1), 4) Transformation dans E. coli compétentes, 5) Sélection sur milieu avec antibiotique, 6) Vérification par PCR de colonie et séquençage. Alternative moderne : clonage par Gibson Assembly ou Golden Gate.";
    }

    if (query.includes('qpcr') || query.includes('rt-pcr') || query.includes('quantitative')) {
      return "La qPCR (PCR quantitative en temps réel) mesure l'amplification d'ADN en temps réel. Utilisez SYBR Green (économique) ou sondes TaqMan (spécifique). Calcul : méthode ΔΔCt pour quantification relative. Points clés : 1) Efficacité PCR 90-110%, 2) Courbe de fusion unique, 3) Gènes de référence stables (GAPDH, β-actine), 4) Triplicats techniques, 5) Contrôles négatifs. Pour l'ARN, faites une RT-qPCR avec transcription inverse préalable.";
    }

    if (query.includes('séquençage') || query.includes('ngs') || query.includes('illumina')) {
      return "Le séquençage NGS (Next-Generation Sequencing) permet d'analyser des millions de séquences en parallèle. Technologies : Illumina (short reads, haute précision), PacBio/Nanopore (long reads). Workflow : 1) Préparation librairie (fragmentation, adaptateurs), 2) Amplification clonale, 3) Séquençage par synthèse, 4) Analyse bioinformatique (alignement, variant calling). Applications : RNA-seq, ChIP-seq, métagénomique, génomes complets. Profondeur recommandée : 30X pour génome humain.";
    }

    if (query.includes('microscop') || query.includes('imagerie')) {
      return "Techniques de microscopie : 1) Optique (résolution ~200nm), 2) Fluorescence (marqueurs spécifiques), 3) Confocale (sections optiques, reconstruction 3D), 4) Super-résolution (STED, PALM, STORM <50nm), 5) Électronique (TEM/SEM, résolution atomique). Pour l'immunofluorescence : fixation (PFA 4%), perméabilisation (Triton 0.1%), blocage, anticorps primaire/secondaire fluorescent, montage avec DAPI. Évitez le photoblanchiment avec des antifades.";
    }

    if (query.includes('protéine') || query.includes('purification')) {
      return "Purification de protéines recombinantes : 1) Expression dans E. coli (IPTG induction), 2) Lyse cellulaire (sonication ou lysozyme), 3) Clarification (centrifugation 15000g), 4) Chromatographie d'affinité (His-tag sur colonne Ni-NTA), 5) Dialyse pour éliminer l'imidazole, 6) Concentration (Amicon). Vérifiez la pureté par SDS-PAGE et l'activité par test fonctionnel. Stockez à -80°C avec glycérol 10% ou lyophilisez.";
    }

    if (query.includes('statistique') || query.includes('analyse') || query.includes('significatif')) {
      return "Analyses statistiques en biologie : 1) Test t de Student (comparaison 2 groupes), 2) ANOVA (>2 groupes), 3) Test de Mann-Whitney (non-paramétrique), 4) Chi-carré (données catégorielles). Significativité : p<0.05 (*), p<0.01 (**), p<0.001 (***). Calculez la taille d'effet et la puissance statistique. Utilisez R, GraphPad Prism ou Python (scipy, statsmodels). N'oubliez pas : corrélation ≠ causalité. Vérifiez toujours la normalité des données (test de Shapiro-Wilk).";
    }

    if (query.includes('tampon') || query.includes('buffer') || query.includes('solution')) {
      return "Tampons courants en biologie : 1) PBS (phosphate buffered saline, pH 7.4), 2) Tris-HCl (pH 7-9, attention à la température), 3) HEPES (pH 7.2-7.6, stable), 4) TAE/TBE (électrophorèse ADN). Pour préparer un tampon : calculez avec Henderson-Hasselbalch, ajustez le pH avec HCl/NaOH, autoclavez si nécessaire. Ajoutez EDTA pour chélater les métaux, DTT/β-mercaptoéthanol pour réduire les ponts disulfures, protéase inhibitors pour protéger les protéines.";
    }

    if (query.includes('bonjour') || query.includes('salut') || query.includes('hello')) {
      return "Bonjour ! Je suis ravi de vous aider avec vos questions scientifiques. Que souhaitez-vous savoir aujourd'hui ? Je peux vous expliquer des techniques de biologie moléculaire, des protocoles expérimentaux, des concepts théoriques, ou vous aider à résoudre des problèmes de laboratoire.";
    }

    if (query.includes('merci') || query.includes('thank')) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider dans vos recherches scientifiques. 🧬";
    }

    return "Je comprends votre question. Pouvez-vous me donner plus de détails ? Je peux vous aider avec des techniques comme la PCR, le clonage, la culture cellulaire, le Western Blot, CRISPR, le séquençage NGS, la microscopie, la purification de protéines, les analyses statistiques, et bien d'autres sujets en biologie moléculaire et cellulaire.";
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(input);
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 1000);
  };

  const quickQuestions = [
    "Comment faire une PCR ?",
    "Explique CRISPR-Cas9",
    "Protocole Western Blot",
    "Culture cellulaire optimale"
  ];

  return (
    <div className="mobile-container">
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/hugin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mobile-text)',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="mobile-icon" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981'
              }}>
                <Brain size={24} />
              </div>
              <div>
                <h1 className="mobile-title" style={{ marginBottom: 0 }}>Mimir</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--mobile-text-secondary)', margin: 0 }}>
                  Assistant IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="mobile-content" 
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          paddingBottom: '140px'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div className="mobile-icon" style={{
              background: msg.role === 'user' 
                ? 'rgba(99, 102, 241, 0.1)' 
                : 'rgba(16, 185, 129, 0.1)',
              color: msg.role === 'user' ? 'var(--mobile-primary)' : '#10b981',
              flexShrink: 0,
              alignSelf: 'flex-start'
            }}>
              {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
            </div>
            <div
              className="mobile-card"
              style={{
                flex: 1,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
                  : 'var(--mobile-card-bg)',
                borderLeft: msg.role === 'assistant' ? '3px solid #10b981' : 'none'
              }}
            >
              <p style={{ 
                fontSize: '0.9rem', 
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                {msg.content}
              </p>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'var(--mobile-text-secondary)', 
                marginTop: '0.5rem',
                marginBottom: 0,
                textAlign: msg.role === 'user' ? 'right' : 'left'
              }}>
                {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="mobile-icon" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981'
            }}>
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div className="mobile-card">
              <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--mobile-text-secondary)' }}>
                Mimir réfléchit...
              </p>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--mobile-text-secondary)', 
              marginBottom: '0.75rem' 
            }}>
              Questions rapides :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="mobile-card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '0.75rem'
                  }}
                >
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>💡 {q}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'var(--mobile-bg)',
        borderTop: '1px solid var(--mobile-border)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'var(--mobile-card-bg)',
              border: '1px solid var(--mobile-border)',
              borderRadius: '1.5rem',
              color: 'var(--mobile-text)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: input.trim() && !isThinking 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'rgba(100, 116, 139, 0.2)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
              flexShrink: 0
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <MobileBottomNav />

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileMimir;
