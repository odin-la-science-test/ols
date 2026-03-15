import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, ScreenShare,
    PhoneOff, ChevronLeft, Shield, Radio,
    Phone, Plus, LogIn, Copy, Check,
    MessageSquare, Users, Settings, Sparkles,
    Calendar, Download, FileText, Activity, Beaker
} from 'lucide-react';
import { useTheme } from '../../components/ThemeContext';
import { useToast } from '../../components/ToastContext';
import { saveModuleItem } from '../../utils/persistence';

const API_BASE = `http://${window.location.hostname}:3001/api/module`;
const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
];
const POLL_MS = 1200;

type Phase = 'lobby' | 'connecting' | 'incall';

const CLIENT_ID = Math.random().toString(36).slice(2, 10);

const log = (...args: any[]) => console.log(`[Visio ${CLIENT_ID}]`, ...args);

const Meetings = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { showToast } = useToast();
    const c = theme.colors;

    const [phase, setPhase] = useState<Phase>('lobby');
    const [roomId, setRoomId] = useState('');
    const [joinInput, setJoinInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [peerConnected, setPeerConnected] = useState(false);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'ai' | 'chat' | 'users'>('ai');
    
    // AI / Artemis State
    const [transcription, setTranscription] = useState<{sender: string, text: string, time: string}[]>([]);
    const [aiSummary, setAiSummary] = useState<{title: string, content: string}[]>([]);

    const localVidRef = useRef<HTMLVideoElement>(null);
    const remoteVidRef = useRef<HTMLVideoElement>(null);
    const localStream = useRef<MediaStream | null>(null);
    const screenStream = useRef<MediaStream | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const poller = useRef<ReturnType<typeof setInterval> | null>(null);
    const seen = useRef<Set<string>>(new Set());
    const iceBuf = useRef<RTCIceCandidateInit[]>([]);
    const remoteDescSet = useRef(false);

    const raw = localStorage.getItem('currentUser') || '';
    let displayName = 'Scientifique';
    try { 
        const p = JSON.parse(raw); 
        displayName = p.username || p.email || (p.firstName ? `${p.firstName} ${p.lastName}` : 'Expert'); 
    } catch { 
        if (raw) displayName = raw; 
    }

    const cleanup = useCallback(() => {
        log('cleanup');
        if (poller.current) { clearInterval(poller.current); poller.current = null; }
        if (pc.current) { pc.current.close(); pc.current = null; }
        if (localStream.current) { localStream.current.getTracks().forEach(t => t.stop()); localStream.current = null; }
        if (screenStream.current) { screenStream.current.getTracks().forEach(t => t.stop()); screenStream.current = null; }
        seen.current.clear();
        iceBuf.current = [];
        remoteDescSet.current = false;
        setPeerConnected(false);
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    // Simulated Transcription
    useEffect(() => {
        if (phase === 'incall' && peerConnected) {
            const interval = setInterval(() => {
                const phrases = [
                    "Analyse des résultats de la culture C12 terminée.",
                    "On observe une croissance exponentielle sur les dernières 24h.",
                    "Il faudrait prévoir un repiquage demain matin.",
                    "Je vais mettre à jour le registre de sécurité du labo.",
                    "Artemis, peux-tu résumer les points clés ?"
                ];
                const randomName = ["Dr. Smith", "Expert Bio", "Système"].sort(() => 0.5 - Math.random())[0];
                const text = phrases[Math.floor(Math.random() * phrases.length)];
                
                setTranscription(prev => [...prev.slice(-10), {
                    sender: randomName,
                    text: text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (Math.random() > 0.7) {
                    setAiSummary(prev => [
                        { title: "Point Clé", content: "Validation de la cinétique de croissance." },
                        { title: "Action", content: "Planifier repiquage pour demain." }
                    ]);
                }
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [phase, peerConnected]);

    const post = async (room: string, type: string, data: any) => {
        const sig = { id: `${room}_${type}_${CLIENT_ID}_${Date.now()}`, room, type, sender: CLIENT_ID, data: JSON.stringify(data), timestamp: Date.now() };
        try {
            await fetch(`${API_BASE}/meeting_signals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sig) });
        } catch (e) { log('POST error', e); }
    };

    const fetchSigs = async (room: string) => {
        try {
            const r = await fetch(`${API_BASE}/meeting_signals`);
            if (!r.ok) return [];
            const items = await r.json();
            if (!Array.isArray(items)) return [];
            return items.filter((s: any) => s.room === room && s.sender !== CLIENT_ID);
        } catch { return []; }
    };

    const getMedia = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            log('MediaDevices API not supported');
            showToast('API Media non supportée par ce navigateur', 'error');
            return null;
        }

        try {
            log('Requesting media access...');
            const ms = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }, 
                audio: true 
            });
            localStream.current = ms;
            if (localVidRef.current) localVidRef.current.srcObject = ms;
            log('Media access granted');
            return ms;
        } catch (e: any) {
            log('Media Error:', e.name, e.message);
            
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                showToast('Accès refusé. Veuillez vérifier les permissions dans votre navigateur (icônes cadenas).', 'error');
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                showToast('Caméra ou micro introuvable.', 'error');
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                showToast('Caméra déjà utilisée par une autre application.', 'error');
            } else {
                showToast(`Erreur média: ${e.name}`, 'error');
            }
            return null;
        }
    };

    const flushIce = async () => {
        if (!pc.current || !remoteDescSet.current) return;
        while (iceBuf.current.length > 0) {
            const c = iceBuf.current.shift()!;
            try {
                await pc.current.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) { log('ICE add err', e); }
        }
    };

    const makePc = (room: string) => {
        const conn = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pc.current = conn;
        remoteDescSet.current = false;
        iceBuf.current = [];

        conn.ontrack = (ev) => {
            if (remoteVidRef.current && ev.streams[0]) {
                remoteVidRef.current.srcObject = ev.streams[0];
                setPeerConnected(true);
                setPhase('incall');
                setStatus('Protocole établi');
            }
        };

        conn.onicecandidate = (ev) => {
            if (ev.candidate) {
                post(room, 'ice', ev.candidate.toJSON());
            }
        };

        conn.onconnectionstatechange = () => {
            if (conn.connectionState === 'connected') {
                setPeerConnected(true); setPhase('incall'); setStatus('Lien sécurisé');
            }
            if (conn.connectionState === 'disconnected' || conn.connectionState === 'failed') {
                showToast('Lien rompu', 'error'); setPeerConnected(false);
            }
        };

        return conn;
    };

    const processing = useRef(false);

    const processSignals = async (room: string, conn: RTCPeerConnection, role: 'creator' | 'joiner') => {
        if (processing.current) return;
        processing.current = true;
        try {
            const sigs = await fetchSigs(room);
            const sorted = sigs.sort((a, b) => {
                const priority = (t: string) => t === 'offer' || t === 'answer' ? 0 : 1;
                return priority(a.type) - priority(b.type);
            });

            for (const sig of sorted) {
                if (seen.current.has(sig.id)) continue;
                const data = JSON.parse(sig.data);

                if (sig.type === 'answer' && role === 'creator') {
                    if (conn.signalingState === 'have-local-offer') {
                        await conn.setRemoteDescription(new RTCSessionDescription(data));
                        seen.current.add(sig.id);
                        remoteDescSet.current = true;
                        await flushIce();
                    }
                } else if (sig.type === 'ice') {
                    if (conn.remoteDescription) {
                        try {
                            await conn.addIceCandidate(new RTCIceCandidate(data));
                            seen.current.add(sig.id);
                        } catch (e) { log('ICE err', e); }
                    } else {
                        iceBuf.current.push(data);
                        seen.current.add(sig.id);
                    }
                } else {
                    seen.current.add(sig.id);
                }
            }
        } finally {
            processing.current = false;
        }
    };

    const createRoom = async () => {
        const room = `hugin-session-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setRoomId(room);
        setPhase('connecting');
        setStatus("Génération du canal sécurisé...");

        const ms = await getMedia();
        if (!ms) { setPhase('lobby'); return; }

        const conn = makePc(room);
        ms.getTracks().forEach(t => conn.addTrack(t, ms));

        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);
        await post(room, 'offer', { sdp: offer.sdp, type: offer.type });

        poller.current = setInterval(() => processSignals(room, conn, 'creator'), POLL_MS);
    };

    const joinRoom = async () => {
        const room = joinInput.trim().toUpperCase();
        if (!room) { showToast('ID de session requis', 'error'); return; }
        setRoomId(room);
        setPhase('connecting');
        setStatus('Synchronisation...');

        const ms = await getMedia();
        if (!ms) { setPhase('lobby'); return; }

        const conn = makePc(room);
        ms.getTracks().forEach(t => conn.addTrack(t, ms));

        let offerSig: any = null;
        for (let i = 0; i < 30; i++) {
            setStatus(`Handshake en cours... (${i + 1}/30)`);
            const sigs = await fetchSigs(room);
            offerSig = sigs.find((s: any) => s.type === 'offer');
            if (offerSig) break;
            await new Promise(r => setTimeout(r, 1500));
        }

        if (!offerSig) {
            showToast('Session introuvable', 'error');
            cleanup(); setPhase('lobby'); return;
        }

        seen.current.add(offerSig.id);
        const offerData = JSON.parse(offerSig.data);
        await conn.setRemoteDescription(new RTCSessionDescription(offerData));
        remoteDescSet.current = true;

        if (conn.remoteDescription) {
            const existingSigs = await fetchSigs(room);
            for (const sig of existingSigs) {
                if (seen.current.has(sig.id)) continue;
                if (sig.type === 'ice') {
                    const d = JSON.parse(sig.data);
                    try {
                        await conn.addIceCandidate(new RTCIceCandidate(d));
                        seen.current.add(sig.id);
                    } catch (e) { log('ICE err', e); }
                }
            }
        }

        const answer = await conn.createAnswer();
        await conn.setLocalDescription(answer);
        await post(room, 'answer', { sdp: answer.sdp, type: answer.type });
        setStatus('Analyse de porteuse...');

        poller.current = setInterval(() => processSignals(room, conn, 'joiner'), POLL_MS);
    };

    const toggleMic = () => {
        const t = localStream.current?.getAudioTracks()[0];
        if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
    };
    const toggleVideo = () => {
        const t = localStream.current?.getVideoTracks()[0];
        if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); }
    };
    const toggleScreen = async () => {
        if (!pc.current) return;
        const p = pc.current;
        if (isSharing) {
            screenStream.current?.getTracks().forEach(t => t.stop()); screenStream.current = null;
            const cam = localStream.current?.getVideoTracks()[0];
            const sender = p.getSenders().find(s => s.track?.kind === 'video');
            if (cam && sender) await sender.replaceTrack(cam);
            setIsSharing(false);
        } else {
            try {
                const sm = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStream.current = sm;
                const st = sm.getVideoTracks()[0];
                const sender = p.getSenders().find(s => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(st);
                setIsSharing(true);
                st.onended = () => {
                    setIsSharing(false);
                    const cam = localStream.current?.getVideoTracks()[0];
                    if (cam && sender) sender.replaceTrack(cam);
                    screenStream.current = null;
                };
            } catch { showToast("Annulé", 'info'); }
        }
    };

    const scheduleFollowUp = async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventData = {
            title: `Suivi Meeting : ${roomId}`,
            date: tomorrow.toISOString().split('T')[0],
            time: '10:00',
            module: 'Visio Follow-up',
            priority: 'importante',
            objective: `Débriefing de la session Hugin Vision ${roomId}. Transcription archivée par Artemis.`,
            archived: false
        };
        await saveModuleItem('planning', eventData);
        showToast('Suivi programmé dans le Planning', 'success');
    };

    const hangUp = () => { cleanup(); setPhase('lobby'); setRoomId(''); setJoinInput(''); setIsMuted(false); setIsVideoOff(false); setIsSharing(false); setStatus(''); };
    const copyId = () => { navigator.clipboard.writeText(roomId); setCopied(true); showToast('Copié', 'success'); setTimeout(() => setCopied(false), 2000); };

    if (phase === 'lobby') {
        return (
            <div style={{ 
                height: '100vh', 
                background: c.bgPrimary, 
                color: c.textPrimary, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '2rem',
                padding: '2rem'
            }}>
                <button 
                    onClick={() => navigate('/hugin')} 
                    style={{ 
                        position: 'absolute', 
                        top: '2rem', 
                        left: '2rem', 
                        background: c.bgSecondary, 
                        border: `1px solid ${c.borderColor}`, 
                        color: c.textPrimary, 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '0.75rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ChevronLeft size={20} /> Retour
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Shield size={20} color={c.accentMunin} />
                        <span style={{ fontSize: '0.8rem', color: c.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Protocole de communication sécurisé
                        </span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        Hugin Vision
                    </h1>
                    <p style={{ color: c.textSecondary, fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: 500 }}>
                        Centre de téléconférence scientifique avancée
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px', width: '100%' }}>
                    {/* Create Card */}
                    <div style={{ 
                        flex: '1 1 300px', 
                        background: c.bgSecondary, 
                        border: `1px solid ${c.borderColor}`, 
                        borderRadius: '1.5rem', 
                        padding: '2.5rem', 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.5rem',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '2rem', 
                            background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto',
                            boxShadow: `0 8px 24px ${c.accentPrimary}44`
                        }}>
                            <Video size={32} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Nouvelle Session</h3>
                            <p style={{ color: c.textSecondary, fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                                Initialiser un canal de recherche en direct
                            </p>
                        </div>
                        <button 
                            onClick={createRoom} 
                            style={{ 
                                padding: '1rem', 
                                borderRadius: '1rem', 
                                border: 'none', 
                                background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`, 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.75rem',
                                boxShadow: `0 4px 12px ${c.accentPrimary}44`
                            }}
                        >
                            <Plus size={20} /> Créer le salon
                        </button>
                    </div>

                    {/* Join Card */}
                    <div style={{ 
                        flex: '1 1 300px', 
                        background: c.bgSecondary, 
                        border: `1px solid ${c.borderColor}`, 
                        borderRadius: '1.5rem', 
                        padding: '2.5rem', 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '2rem', 
                            background: `linear-gradient(135deg, ${c.accentMunin}, #059669)`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto',
                            boxShadow: `0 8px 24px ${c.accentMunin}44`
                        }}>
                            <LogIn size={32} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Rejoindre</h3>
                            <p style={{ color: c.textSecondary, fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                                Se connecter à un flux existant
                            </p>
                        </div>
                        <input 
                            type="text" 
                            value={joinInput} 
                            onChange={e => setJoinInput(e.target.value.toUpperCase())} 
                            placeholder="ID DE LA SESSION" 
                            style={{ 
                                padding: '1rem', 
                                borderRadius: '1rem', 
                                border: `1px solid ${c.borderColor}`, 
                                background: c.inputBg, 
                                color: c.textPrimary, 
                                fontSize: '1rem', 
                                textAlign: 'center',
                                fontWeight: 700,
                                letterSpacing: '0.1em'
                            }} 
                        />
                        <button 
                            onClick={joinRoom} 
                            style={{ 
                                padding: '1rem', 
                                borderRadius: '1rem', 
                                border: 'none', 
                                background: `linear-gradient(135deg, ${c.accentMunin}, #059669)`, 
                                color: 'white', 
                                fontWeight: 700, 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.75rem',
                                boxShadow: `0 4px 12px ${c.accentMunin}44`
                            }}
                        >
                            <LogIn size={20} /> Authentification
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            height: '100vh', 
            background: c.bgPrimary, 
            color: c.textPrimary, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
        }}>
            {/* Header In-Call */}
            <header style={{ 
                padding: '1rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: `1px solid ${c.borderColor}`, 
                background: c.bgSecondary, 
                backdropFilter: 'blur(10px)', 
                zIndex: 10 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '0.5rem', 
                            background: c.accentPrimary, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Beaker size={18} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>HUGIN VISION</h2>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        fontSize: '0.8rem', 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '2rem',
                        fontWeight: 600
                    }}>
                        <Shield size={14} color={c.accentMunin} />
                        <span style={{ color: c.accentMunin }}>SESSION SÉCURISÉE</span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: c.textSecondary }} />
                        <Radio size={14} color={peerConnected ? c.accentMunin : '#f59e0b'} className={peerConnected ? 'animate-pulse' : ''} />
                        <span style={{ color: c.textSecondary }}>{status}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={copyId} 
                        style={{ 
                            background: c.bgTertiary, 
                            border: `1px solid ${c.borderColor}`, 
                            color: c.textPrimary, 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.75rem', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                        }}
                    >
                        {copied ? <Check size={16} color={c.accentMunin} /> : <Copy size={16} />} 
                        {roomId}
                    </button>
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        style={{ 
                            background: showSidebar ? c.accentPrimary : c.bgTertiary, 
                            border: `1px solid ${c.borderColor}`, 
                            color: showSidebar ? 'white' : c.textPrimary, 
                            padding: '0.5rem', 
                            borderRadius: '0.75rem', 
                            cursor: 'pointer' 
                        }}
                    >
                        <Sparkles size={20} />
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '1rem', gap: '1rem' }}>
                {/* Video Area */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    position: 'relative'
                }}>
                    <div style={{ 
                        flex: 1, 
                        background: '#000', 
                        borderRadius: '1.5rem', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: `1px solid ${c.borderColor}`,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        {peerConnected ? (
                            <video ref={remoteVidRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.8 }}>
                                <div style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '4rem', 
                                    background: 'rgba(99,102,241,0.1)', 
                                    margin: '0 auto 1.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: `2px dashed ${c.accentPrimary}55`
                                }}>
                                    <Users size={48} color={c.accentPrimary} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>En attente du correspondant...</h3>
                                <p style={{ color: c.textSecondary, marginTop: '0.5rem' }}>Le canal est ouvert et prêt pour la réception.</p>
                            </div>
                        )}

                        {/* Local Video Overlay */}
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '1.5rem', 
                            right: '1.5rem', 
                            width: '280px', 
                            aspectRatio: '16/9', 
                            borderRadius: '1rem', 
                            overflow: 'hidden', 
                            border: `2px solid ${c.accentPrimary}88`, 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.6)', 
                            background: '#111',
                            zIndex: 20
                        }}>
                            <video 
                                ref={localVidRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    transform: 'scaleX(-1)', 
                                    display: isVideoOff ? 'none' : 'block' 
                                }} 
                            />
                            {isVideoOff && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%', 
                                        background: c.accentPrimary, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1.5rem', 
                                        fontWeight: 900,
                                        color: 'white'
                                    }}>
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            )}
                            <div style={{ 
                                position: 'absolute', 
                                bottom: '0.5rem', 
                                left: '0.5rem', 
                                background: 'rgba(0,0,0,0.6)', 
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '0.5rem', 
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backdropFilter: 'blur(4px)',
                                color: 'white'
                            }}>
                                {displayName} (Moi)
                            </div>
                        </div>
                    </div>

                    {/* Controls Footer */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        padding: '1rem 0'
                    }}>
                        <div style={{ 
                            background: 'rgba(15,23,42,0.8)', 
                            padding: '0.75rem', 
                            borderRadius: '5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
                            border: `1px solid ${c.borderColor}`, 
                            backdropFilter: 'blur(20px)' 
                        }}>
                            <button 
                                onClick={toggleMic} 
                                title={isMuted ? "Réactiver micro" : "Couper micro"}
                                style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    borderRadius: '50%', 
                                    border: 'none', 
                                    background: isMuted ? '#ef4444' : c.bgTertiary, 
                                    color: 'white', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button 
                                onClick={toggleVideo} 
                                title={isVideoOff ? "Démarrer vidéo" : "Arrêter vidéo"}
                                style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    borderRadius: '50%', 
                                    border: 'none', 
                                    background: isVideoOff ? '#ef4444' : c.bgTertiary, 
                                    color: 'white', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                            </button>
                            <button 
                                onClick={toggleScreen} 
                                title="Partager l'écran"
                                style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    borderRadius: '50%', 
                                    border: 'none', 
                                    background: isSharing ? c.accentPrimary : c.bgTertiary, 
                                    color: 'white', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}
                            >
                                <ScreenShare size={24} />
                            </button>
                            <div style={{ width: '1px', height: '32px', background: c.borderColor, margin: '0 0.5rem' }} />
                            <button 
                                onClick={hangUp} 
                                style={{ 
                                    padding: '0 2rem', 
                                    height: '56px', 
                                    borderRadius: '5rem', 
                                    border: 'none', 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <PhoneOff size={22} /> Raccrocher
                            </button>
                        </div>
                    </div>
                </div>

                {/* Artemis AI Sidebar */}
                {showSidebar && (
                    <div style={{ 
                        width: '400px', 
                        background: c.bgSecondary, 
                        borderRadius: '1.5rem', 
                        border: `1px solid ${c.borderColor}`, 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ 
                            padding: '1.5rem', 
                            borderBottom: `1px solid ${c.borderColor}`,
                            display: 'flex',
                            gap: '0.5rem',
                            background: 'rgba(0,0,0,0.1)'
                        }}>
                            <button 
                                onClick={() => setSidebarTab('ai')}
                                style={{ 
                                    flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', 
                                    background: sidebarTab === 'ai' ? c.accentPrimary : 'transparent',
                                    color: sidebarTab === 'ai' ? 'white' : c.textSecondary,
                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Sparkles size={16} /> Artemis
                            </button>
                            <button 
                                onClick={() => setSidebarTab('chat')}
                                style={{ 
                                    flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', 
                                    background: sidebarTab === 'chat' ? c.accentPrimary : 'transparent',
                                    color: sidebarTab === 'chat' ? 'white' : c.textSecondary,
                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <MessageSquare size={16} /> Flux
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {sidebarTab === 'ai' ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: c.accentPrimary }}>
                                        <Activity size={20} />
                                        <h4 style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>Analyse en temps réel</h4>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {aiSummary.map((item, idx) => (
                                            <div key={idx} style={{ 
                                                padding: '1rem', 
                                                background: c.bgTertiary, 
                                                borderRadius: '1rem', 
                                                borderLeft: `3px solid ${item.title === 'Action' ? c.accentMunin : c.accentPrimary}`
                                            }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: c.textSecondary, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.content}</div>
                                            </div>
                                        ))}
                                        {aiSummary.length === 0 && (
                                            <p style={{ color: c.textSecondary, fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>
                                                En attente de données vocales...
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${c.borderColor}`, paddingTop: '1.5rem' }}>
                                        <button 
                                            onClick={scheduleFollowUp}
                                            style={{ 
                                                width: '100%', padding: '0.85rem', borderRadius: '1rem', 
                                                background: 'transparent', border: `1px solid ${c.accentPrimary}`, 
                                                color: c.accentPrimary, fontWeight: 800, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Calendar size={18} /> Programmer suite
                                        </button>
                                        <button 
                                            style={{ 
                                                width: '100%', padding: '0.85rem', borderRadius: '1rem', 
                                                background: c.accentPrimary, border: 'none', 
                                                color: 'white', fontWeight: 800, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                                fontSize: '0.85rem', marginTop: '0.75rem'
                                            }}
                                        >
                                            <Download size={18} /> Export Compte-rendu
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {transcription.map((msg, idx) => (
                                        <div key={idx} style={{ 
                                            padding: '0.75rem', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            borderRadius: '0.75rem',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                <span style={{ fontWeight: 800, color: c.accentPrimary }}>{msg.sender}</span>
                                                <span style={{ color: c.textSecondary, fontSize: '0.75rem' }}>{msg.time}</span>
                                            </div>
                                            <p style={{ margin: 0, fontWeight: 500 }}>{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Meetings;
