import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Zap, Globe, X, RefreshCw, Briefcase, GraduationCap, DollarSign, BrainCircuit, AlertCircle, Volume2, Lock, WifiOff, PenTool, Code, Target, Plus, ArrowRight, StopCircle } from 'lucide-react';
import { ai } from '../services/gemini';
import { FeatureGuard, User as UserType } from '../types';
import { LiveServerMessage, Modality } from '@google/genai';

interface VoiceInterviewDojoProps {
    checkCredits?: FeatureGuard;
    onUpgrade?: () => void;
    user?: UserType | null;
}

interface LandingVoiceDojoProps {
    onExpand?: () => void;
}

// --- SOUND & AUDIO UTILS ---

const playConnectSound = (ctx: AudioContext) => {
    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {}
};

const WORKLET_CODE = `
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.index = 0;
  }
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.index++] = channelData[i];
        if (this.index >= this.bufferSize) {
          this.port.postMessage(this.buffer);
          this.index = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('recorder-processor', RecorderProcessor);
`;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
};

const resampleTo16k = (input: Float32Array, sampleRate: number) => {
    if (sampleRate === 16000) {
        const res = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) res[i] = Math.max(-1, Math.min(1, input[i])) * 0x7FFF;
        return res;
    }
    const ratio = sampleRate / 16000;
    const newLength = Math.floor(input.length / ratio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const originalIndex = Math.floor(i * ratio);
        result[i] = Math.max(-1, Math.min(1, input[originalIndex])) * 0x7FFF;
    }
    return result;
};

// --- VISUAL COMPONENTS ---

export const BreathingOrb = ({ isListening, isSpeaking, volume, size = "large" }: { isListening: boolean, isSpeaking: boolean, volume: number, size?: "small" | "large" }) => {
    const isActive = isListening && volume > 0.1;
    const baseScale = size === "small" ? 0.8 : 1;
    // Smoother scaling equation to prevent jitter
    const scale = isActive ? baseScale + (Math.min(volume, 100) / 100) : (isSpeaking ? baseScale * 1.15 : baseScale);
    
    // Compact sizes
    const containerClass = size === "small" ? "w-32 h-32" : "w-64 h-64"; 
    const innerClass = size === "small" ? "w-20 h-20" : "w-40 h-40";

    return (
        <div className={`relative flex items-center justify-center ${containerClass}`}>
            {/* Ambient Glow - Fixed Background Layer - DEEP IMMERSIVE BLUE AURA */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-800/60 to-indigo-900/60 blur-[60px] transition-all duration-700 will-change-transform animate-pulse
                ${isActive || isSpeaking ? 'opacity-100 scale-125' : 'opacity-40 scale-100'}`} 
            />
            
            {/* Speaking Ripple - BLUE */}
            {isSpeaking && (
                 <div className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping opacity-40" />
            )}

            {/* The Orb - Use simple shadows instead of backdrop-blur on scaling element to prevent square artifacts */}
            <div 
                className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-100 ease-out will-change-transform
                ${innerClass}
                ${isSpeaking 
                    ? 'bg-white border-4 border-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.6)]' 
                    : isActive 
                        ? 'bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-xl'
                        : 'bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800'
                }`}
                style={{ transform: `scale(${scale})` }}
            >
                {/* Inner Gradient - BLUE/INDIGO TINT */}
                <div className={`w-full h-full rounded-full bg-gradient-to-br transition-all duration-300
                    ${isSpeaking ? 'from-blue-100 via-white to-indigo-100 opacity-90' : 'from-transparent via-transparent to-black/10 dark:to-white/5 opacity-100'}`} 
                />
            </div>
        </div>
    );
};

// --- CORE HOOK: GEMINI LIVE SESSION ---

const useDojoSession = () => {
    const [connected, setConnected] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [error, setError] = useState<string|null>(null);
    const [isMuted, setIsMuted] = useState(false);
    
    const isAiTurnFinishedRef = useRef(false);
    const nextStartTimeRef = useRef<number>(0);
    const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    
    const sessionRef = useRef<Promise<any> | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    const stopSession = (reason?: string) => {
        scheduledSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
        scheduledSourcesRef.current = [];
        if (workletNodeRef.current) { try { workletNodeRef.current.disconnect(); } catch(e){} }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) { try { audioContextRef.current.close(); } catch(e){} }
        setConnected(false);
        setInitializing(false);
        setAiSpeaking(false);
        setIsMuted(false);
        setIsSearching(false);
        sessionRef.current = null;
        if (reason) setError(reason);
    };

    const toggleMute = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getAudioTracks();
            tracks.forEach(t => t.enabled = !t.enabled);
            setIsMuted(!isMuted);
        }
    };

    const sendMessage = (text: string) => {
        if (sessionRef.current) {
            sessionRef.current.then(s => s.sendRealtimeInput([{ mimeType: "text/plain", data: text }]));
        }
    };

    const playAudioChunk = async (base64Audio: string) => {
        if (!audioContextRef.current) return;
        try {
            if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
            setAiSpeaking(true);
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            const pcmData = new Int16Array(bytes.buffer);
            
            const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < pcmData.length; i++) channelData[i] = pcmData[i] / 32768.0;
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
                if (scheduledSourcesRef.current.length === 0) setAiSpeaking(false);
            };
            
            let startTime = nextStartTimeRef.current;
            if (startTime < audioContextRef.current.currentTime) startTime = audioContextRef.current.currentTime + 0.05;
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            scheduledSourcesRef.current.push(source);
        } catch (e) { console.error(e); }
    };

    const startSession = async (systemPrompt: string, introMessage?: string) => {
        setInitializing(true);
        setError(null);
        setCurrentText("");
        setIsSearching(false);
        
        if (!navigator.onLine) {
            setError("No Internet Connection");
            setInitializing(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
            streamRef.current = stream;
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass(); 
            audioContextRef.current = ctx;
            await ctx.resume();

            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            await ctx.audioWorklet.addModule(URL.createObjectURL(blob));
            
            const source = ctx.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(ctx, 'recorder-processor');
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            
            source.connect(analyser);
            source.connect(workletNode);
            workletNode.connect(ctx.destination);
            workletNodeRef.current = workletNode;

            const updateVolume = () => {
                if(ctx.state === 'closed') return;
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);
                const vol = data.reduce((a,b)=>a+b)/data.length;
                setCurrentVolume(vol);
                requestAnimationFrame(updateVolume);
            };
            updateVolume();
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-3.8-live',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    tools: [{ googleSearch: {} }],
                    outputAudioTranscription: {}, 
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setConnected(true);
                        setInitializing(false);
                        playConnectSound(ctx);
                        if(introMessage) {
                             sessionPromise.then(s => s.sendClientContent({ turns: [{ role: "user", parts: [{ text: introMessage }] }] }));
                        }
                    },
                    onmessage: (msg: LiveServerMessage) => {
                         const { serverContent } = msg;
                         if (serverContent?.interrupted) {
                             setCurrentText(""); 
                             isAiTurnFinishedRef.current = true;
                             setIsSearching(false);
                             scheduledSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                             scheduledSourcesRef.current = [];
                             if (ctx) nextStartTimeRef.current = ctx.currentTime;
                         }
                         if (serverContent?.turnComplete) {
                            isAiTurnFinishedRef.current = true;
                            setIsSearching(true); 
                         }
                         if (serverContent?.outputTranscription?.text) {
                            setIsSearching(false);
                            if (isAiTurnFinishedRef.current) {
                                setCurrentText(serverContent.outputTranscription.text);
                                isAiTurnFinishedRef.current = false;
                            } else {
                                setCurrentText(prev => prev + serverContent.outputTranscription.text);
                            }
                         }
                         if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                            setIsSearching(false);
                            playAudioChunk(serverContent.modelTurn.parts[0].inlineData.data);
                        }
                    },
                    onerror: () => { 
                        stopSession("Network Drop Detected"); 
                    },
                    onclose: () => stopSession(),
                }
            });

            sessionRef.current = sessionPromise;

            workletNode.port.onmessage = (e) => {
                const pcm16 = resampleTo16k(e.data, ctx.sampleRate);
                sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: arrayBufferToBase64(pcm16.buffer) } }));
            };

        } catch (e) { setError("Mic Error"); stopSession(); }
    };

    return {
        connected,
        initializing,
        aiSpeaking,
        currentVolume,
        currentText,
        error,
        isMuted,
        isSearching,
        startSession,
        stopSession,
        toggleMute,
        sendMessage
    };
};

// --- FEATURE 1: LANDING PAGE WIDGET ---

export const LandingVoiceDojo: React.FC<LandingVoiceDojoProps> = ({ onExpand }) => {
    const { connected, initializing, aiSpeaking, currentVolume, currentText, error, isMuted, isSearching, startSession, stopSession, toggleMute, sendMessage } = useDojoSession();
    const [timeLeft, setTimeLeft] = useState(240);

    useEffect(() => {
        let timer: any;
        if (connected && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            if (timeLeft === 15) {
                sendMessage("SYSTEM_ALERT: Time limit reached. Wrap up.");
            }
        } else if (timeLeft === 0) stopSession();
        return () => clearInterval(timer);
    }, [connected, timeLeft]);

    const handleStart = () => {
        setTimeLeft(240);
        const prompt = `IDENTITY: You are 'Dojo', a high-status AI Career Coach. Be charismatic and unpredictable.`;
        const intro = "SYSTEM: User connected. Introduce yourself briefly as Dojo and ask a lateral thinking question.";
        startSession(prompt, intro);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-8 relative overflow-hidden bg-white dark:bg-black">
            <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-red-500 animate-pulse' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        {connected ? formatTime(timeLeft) : 'READY'}
                    </span>
                </div>
                {onExpand && (
                    <button onClick={onExpand} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowRight size={14} />
                    </button>
                )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-2 z-10 w-full">
                
                {/* Transcript moved ABOVE Orb */}
                <div className="h-12 flex items-end justify-center w-full px-4 text-center mb-2">
                    {error ? (
                        <p className="text-red-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                             <WifiOff size={12} /> {error}
                        </p>
                    ) : (
                        <p className={`text-sm font-medium text-black dark:text-white leading-tight transition-opacity duration-300 ${connected ? 'opacity-100' : 'opacity-50'} line-clamp-2`}>
                            {connected ? (currentText || "Listening...") : "Test your interview skills."}
                        </p>
                    )}
                </div>

                {/* Orb below text - DARK BLUE THEME */}
                <div className="relative">
                    <BreathingOrb isListening={connected && !isMuted} isSpeaking={aiSpeaking} volume={connected ? currentVolume : 0} size="small" />
                </div>
                
            </div>
            
            <div className="w-full flex justify-center z-20">
                {!connected ? (
                    <button onClick={handleStart} disabled={initializing} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg">
                        {initializing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                        {initializing ? 'Connecting...' : 'Start Demo'}
                    </button>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <button onClick={toggleMute} className={`flex-1 py-4 rounded-xl flex items-center justify-center border transition-all ${isMuted ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-neutral-100 dark:bg-neutral-900 border-transparent text-black dark:text-white'}`}>
                            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button onClick={() => stopSession("User Ended")} className="flex-[3] py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                            End Session
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- FEATURE 2: FULL APP EXPERIENCE ---

export const VoiceInterviewDojo: React.FC<VoiceInterviewDojoProps> = ({ checkCredits, onUpgrade, user }) => {
    const { connected, initializing, aiSpeaking, currentVolume, currentText, error, isMuted, isSearching, startSession, stopSession, toggleMute } = useDojoSession();
    const [customRole, setCustomRole] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const PRESETS = [
        { id: 'pm', title: 'Product Manager', icon: Briefcase, color: 'bg-blue-500', prompt: 'You are an interviewer for a Product Manager role. Ask about product sense, prioritization, and metrics.' },
        { id: 'fe', title: 'Frontend Dev', icon: Code, color: 'bg-purple-500', prompt: 'You are an interviewer for a Frontend Engineer role. Ask about React, CSS, performance, and accessibility.' },
        { id: 'marketing', title: 'Marketing Lead', icon: Target, color: 'bg-pink-500', prompt: 'You are an interviewer for a Marketing Lead role. Ask about growth strategies, brand positioning, and campaign analytics.' },
        { id: 'ux', title: 'UX Designer', icon: PenTool, color: 'bg-orange-500', prompt: 'You are an interviewer for a UX Designer role. Ask about user research, wireframing tools, and design systems.' },
    ];

    const handleStart = (roleTitle: string, promptContext: string) => {
        if (checkCredits && !checkCredits()) return;
        
        setSelectedRole(roleTitle);
        const systemPrompt = `
        IDENTITY: You are Dojo, an expert interviewer for a ${roleTitle} position.
        CONTEXT: User is a candidate.
        STYLE: Professional, challenging, yet encouraging.
        INSTRUCTION: ${promptContext}
        PROTOCOL: 
        1. Welcome the candidate to the ${roleTitle} interview.
        2. Ask one question at a time.
        3. Listen to the answer, then provide brief feedback or a follow-up.
        `;
        const intro = `SYSTEM: Start the interview for ${roleTitle} immediately. Welcome the candidate.`;
        
        startSession(systemPrompt, intro);
    };

    if (connected) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-[#050505] flex flex-col animate-fadeIn overflow-hidden">
                {/* Background Grid - Adaptive */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {/* Top Header - No Close Button Here */}
                <div className="relative z-20 w-full p-6 flex justify-between items-center">
                    <div className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase">Live Session</span>
                        <span className="text-neutral-400">|</span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">{selectedRole}</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6 relative z-10 gap-10">
                     
                     {/* Transcript Text - Positioned ABOVE the Orb */}
                     <div className="w-full flex items-end justify-center h-24">
                         {isSearching ? (
                             <div className="flex items-center gap-2 text-neutral-400 animate-pulse">
                                 <BrainCircuit size={16} />
                                 <span className="text-xs font-mono uppercase tracking-widest">Thinking...</span>
                             </div>
                         ) : (
                             <p className="text-lg md:text-xl font-medium text-center text-black dark:text-white leading-relaxed line-clamp-3 animate-fade-up">
                                 {currentText || "I'm listening..."}
                             </p>
                         )}
                     </div>

                     {/* The Breathing Orb - DARK BLUE THEME */}
                     <div className="relative flex-shrink-0">
                         <BreathingOrb isListening={!isMuted} isSpeaking={aiSpeaking} volume={currentVolume} size="large" />
                     </div>
                </div>

                {/* Bottom Controls - Mic and Close Button Side-by-Side */}
                <div className="pb-12 pt-8 flex justify-center items-center gap-6 z-20 relative">
                    <button 
                        onClick={toggleMute} 
                        className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg ${isMuted ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-neutral-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-900 hover:scale-105'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button 
                        onClick={() => stopSession("User Closed")} 
                        className="w-16 h-16 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 shadow-lg hover:scale-105"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col justify-center px-4 max-w-5xl mx-auto animate-fade-up">
            <div className="mb-8 text-center">
                <h1 className="text-6xl font-pixel font-bold text-black dark:text-white mb-2 tracking-tighter">
                    Dojo<span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-indigo-600">.</span>
                </h1>
                <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Select a role to begin</p>
            </div>

            {error && (
                <div className="mb-8 mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 max-w-md">
                    <WifiOff size={18} />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* PRESET ROLES - Compact Cards */}
                {PRESETS.map((role) => (
                    <button 
                        key={role.id}
                        onClick={() => handleStart(role.title, role.prompt)}
                        disabled={initializing}
                        className="group relative aspect-square bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl text-left hover:border-black dark:hover:border-white transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${role.color}`}>
                            <role.icon size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-pixel text-black dark:text-white leading-none mb-1">{role.title}</h3>
                            <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                <span className="text-[10px] font-mono uppercase tracking-widest">Start</span>
                                <ArrowRight size={10} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* CUSTOM ROLE INPUT - Compact */}
            <div className="max-w-md mx-auto w-full">
                <div className="bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-full flex gap-2">
                     <input 
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Or type a custom role..."
                        className="flex-1 bg-transparent px-4 text-sm font-medium text-black dark:text-white outline-none placeholder:text-neutral-400"
                        onKeyDown={(e) => e.key === 'Enter' && customRole && handleStart(customRole, `You are an interviewer for a ${customRole} role.`)}
                     />
                     <button 
                        onClick={() => customRole && handleStart(customRole, `You are an interviewer for a ${customRole} role.`)}
                        disabled={!customRole || initializing}
                        className="bg-black dark:bg-white text-white dark:text-black w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50 transition-opacity shadow-sm"
                     >
                         <ArrowRight size={16} />
                     </button>
                </div>
            </div>
        </div>
    );
};