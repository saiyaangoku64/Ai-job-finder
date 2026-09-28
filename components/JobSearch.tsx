import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Play, Terminal, Zap, Ghost, Database, Globe, CheckCircle2, Target, Plus, Minus, Code2, Cpu, FileText, Shield, Layers, User, FileJson, Layout, Gift, Sparkles, MapPin, Calculator, ScanLine, Briefcase, Filter, Mic, MessageSquare, Facebook, Twitter, Instagram, Linkedin, HelpCircle, Loader2 } from 'lucide-react';
import { searchJobsWithAI } from '../services/gemini';
import { JobListing, SearchPreferences, FeatureGuard } from '../types';
import { JobCard } from './JobCard';
import { JobCardSkeleton } from './Skeleton';
import { LegalModal } from './LegalModal';
import { LandingVoiceDojo, BreathingOrb } from './VoiceInterviewDojo';

// --- VISUAL ASSETS ---
const GoogleGeminiIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.873 3.805C13.8045 3.53123 13.5901 3.31681 13.3163 3.24835C10.7497 2.60677 8.76182 0.618903 8.12023 0.0523277C8.05177 -0.0161494 7.94823 -0.0161494 7.87977 0.0523277C7.23818 0.618903 5.25034 2.60677 2.68373 3.24835C2.40994 3.31681 2.19551 3.53123 2.12705 3.805C1.48547 6.37161 -0.502396 8.35946 -1.14397 9.00104C-1.21245 9.06951 -1.21245 9.17305 -1.14397 9.24151C-0.502396 9.8831 1.48547 11.8709 2.12705 14.4376C2.19551 14.7113 2.40994 14.9257 2.68373 14.9942C5.25034 15.6358 7.23818 17.6236 7.87977 18.1902C7.94823 18.2587 8.05177 18.2587 8.12023 18.1902C8.76182 17.6236 10.7497 15.6358 13.3163 14.9942C13.5901 14.9257 13.8045 14.7113 13.873 14.4376C14.5146 11.8709 16.5024 9.8831 17.144 9.24151C17.2125 9.17305 17.2125 9.06951 17.144 9.00104C16.5024 8.35946 14.5146 6.37161 13.873 3.805Z" transform="translate(3 3)"/>
  </svg>
);

const FirecrawlIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C12 2 9 4.5 9 8C9 10 10.5 11 11 12.5C10.5 10 8 9.5 7 10.5C7 14 9 16 11 19C7 18.5 5.5 15.5 5 14C5 18.5 8.5 22 13 22C17.5 22 21 18.5 21 14C20.5 15.5 19 18.5 15 19C17 16 19 14 19 10.5C18 9.5 15.5 10 15 12.5C15.5 11 17 10 17 8C17 4.5 14 2 12 2Z" />
   </svg>
);

const ScrapingVisualizer = () => {
    return (
        <div className="w-full max-w-lg mx-auto relative z-20">
            {/* The Central Beam Line for the Visualizer - FIXED: HEIGHT INCREASED TO 85% TO CONNECT NODES */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[85%] w-0.5 bg-neutral-200 dark:bg-neutral-800 z-0 overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-orange-500 via-blue-500 to-emerald-500 animate-beam opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
            </div>

            <div className="relative z-10 flex flex-col gap-24 items-center py-10">
                {/* NODE 1: FIRECRAWL */}
                <div className="flex flex-col items-center gap-6 group relative">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-[#050505] border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center relative shadow-sm z-10 transition-transform group-hover:scale-105">
                             <FirecrawlIcon className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>
                    <div className="text-center bg-white dark:bg-[#050505] px-6 py-3 rounded-xl relative z-20 border border-neutral-100 dark:border-neutral-900 shadow-xl">
                        <h4 className="font-pixel font-bold text-xl text-black dark:text-white tracking-wide mb-1">Firecrawl V2</h4>
                        <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Multi-Node Scrape</p>
                    </div>
                </div>

                {/* NODE 2: GEMINI */}
                <div className="flex flex-col items-center gap-6 group relative">
                     <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-[#050505] border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center relative shadow-sm z-10 transition-transform group-hover:scale-105">
                             <GoogleGeminiIcon className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>
                    <div className="text-center bg-white dark:bg-[#050505] px-6 py-3 rounded-xl relative z-20 border border-neutral-100 dark:border-neutral-900 shadow-xl">
                        <h4 className="font-pixel font-bold text-xl text-black dark:text-white tracking-wide mb-1">Gemini 2.0</h4>
                        <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Reasoning Engine</p>
                    </div>
                </div>

                {/* NODE 3: STRUCTURED JOBS */}
                 <div className="flex flex-col items-center gap-6 group relative">
                     <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-[#050505] border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center relative shadow-sm z-10 transition-transform group-hover:scale-105">
                             <FileJson className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    {/* Added extra z-index and background opacity to ensure coverage */}
                    <div className="text-center bg-white dark:bg-[#050505] px-6 py-3 rounded-xl relative z-30 border border-neutral-100 dark:border-neutral-900 shadow-xl">
                        <h4 className="font-pixel font-bold text-xl text-black dark:text-white tracking-wide mb-1">Structured Jobs</h4>
                        <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Verified Listings</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FAQItem = ({ number, question, answer }: { number: string, question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-200 dark:border-neutral-800 relative z-20">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-8 flex items-center justify-between text-left group transition-all">
                <div className="flex items-center gap-6 md:gap-12">
                     <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isOpen ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-white dark:bg-black'}`}>
                         {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                     </div>
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                         <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest min-w-[100px]">[ QUESTION {number} ]</span>
                         <span className={`text-lg md:text-xl font-medium transition-colors ${isOpen ? 'text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'}`}>
                             {question}
                         </span>
                     </div>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans pl-[72px] md:pl-[180px] pr-4 max-w-3xl">
                    {answer}
                </p>
            </div>
        </div>
    );
};

interface JobSearchProps {
    checkCredits?: FeatureGuard;
    onNavigate?: (view: string) => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({ checkCredits, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<JobListing[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'IDLE' | 'WIZARD' | 'LOADING' | 'RESULTS'>('IDLE');
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [legalTab, setLegalTab] = useState<string | null>(null);

  // Typewriter Effect State with Blink Cursor
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const typingWords = ["Product Designer", "Frontend Developer", "Data Scientist", "UX Researcher", "Marketing Intern"];

  // Blinking Cursor Logic
  useEffect(() => {
    const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing Logic
  useEffect(() => {
    const handleType = () => {
      const i = loopNum % typingWords.length;
      const fullText = typingWords[i];

      setPlaceholderText(isDeleting 
        ? fullText.substring(0, placeholderText.length - 1) 
        : fullText.substring(0, placeholderText.length + 1)
      );

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum]);

  useEffect(() => {
    if (step === 'LOADING') {
      setLoadingIndex(0);
      const interval = setInterval(() => {
        setLoadingIndex((prev) => (prev < 4 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [step]);

  const startWizard = (e?: React.FormEvent) => { if (e) e.preventDefault(); setStep('WIZARD'); };
  const handleQuickSearch = (term: string) => { setQuery(term); handleSearch(); };

  const handleSearch = async () => {
    if (checkCredits && !checkCredits()) return;
    if (step === 'WIZARD' && (!query && !location)) return;
    if (step === 'IDLE' && !query) { startWizard(); return; }
    setStep('LOADING'); setError(''); setResults([]);
    try {
      const minTime = new Promise(resolve => setTimeout(resolve, 3000));
      const searchPromise = searchJobsWithAI(query || "Student Jobs", location || "Remote/India", { jobCount: '3', jobType: 'Part-time', minSalary: '', platforms: [] });
      const [_, result] = await Promise.all([minTime, searchPromise]);
      if (result.jobs && result.jobs.length > 0) setResults(result.jobs);
      else setError("Firecrawl successfully scanned but found no matching live listings. Try broader search terms.");
      setStep('RESULTS');
    } catch (err) { console.error(err); setError("Connection to Firecrawl Engine timed out. Please retry."); setStep('RESULTS'); }
  };

  const renderIdleHero = () => (
      <div className="relative min-h-screen flex flex-col items-center pt-32 pb-0 px-4 overflow-hidden w-full bg-white dark:bg-[#050505]">
          
          {/* VISIBLE & MOVING HERO ORBS - DUAL THEME */}
          {/* Light Mode: Yellowish | Dark Mode: Deep Blue/Indigo (Aura) */}
          <div className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] bg-yellow-400/40 dark:bg-blue-900/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-blob z-0" />
          
          {/* Light Mode: Radish/Pink | Dark Mode: Deep Indigo (Aura) */}
          <div className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-rose-500/40 dark:bg-indigo-900/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000 z-0" />
          
          {/* NOISE OVERLAY */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] opacity-30 pointer-events-none z-0 mix-blend-overlay"></div>

          {/* Z-20 Content Layer */}
          <div className="relative z-20 text-center max-w-4xl mx-auto flex flex-col items-center animate-fade-up">
              <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md shadow-sm">
                  <Gift size={14} className="text-pink-500" />
                  <span className="text-xs font-medium text-black dark:text-white">Sign up & get 3 free searches</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-pixel font-bold text-black dark:text-white tracking-tight leading-none mb-6 drop-shadow-2xl">
                  Find your perfect <br/>
                  <div className="relative inline-flex items-center justify-center px-8 py-3 mt-4">
                      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">
                          student job
                      </span>
                  </div>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed mb-12 font-medium">
                   From scraping from internet to detecting ghost jobs — effortless and reliable student hiring.
              </p>

              {/* SEARCH BAR WITH ANIMATED CURSOR */}
              <div className="w-full max-w-xl relative mb-8 group z-30">
                  <div className="relative flex items-center p-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-colors group-hover:border-neutral-400 dark:group-hover:border-neutral-500">
                      <input 
                        type="text" 
                        placeholder={`e.g. ${placeholderText}${showCursor ? '|' : ''}`} 
                        className="w-full bg-transparent text-black dark:text-white h-14 px-8 rounded-full text-lg font-medium outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <button 
                        onClick={() => handleSearch()}
                        className="absolute right-2 top-2 bottom-2 bg-black dark:bg-white text-white dark:text-black px-8 rounded-full font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                      >
                        Search
                      </button>
                  </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-500 z-20 relative">
                <span className="text-neutral-400 font-mono text-xs uppercase tracking-wider mr-2">Try:</span>
                {['Content Writer', 'Data Entry', 'Social Media', 'Graphic Design', 'Tutor'].map(tag => (
                   <button key={tag} onClick={() => handleQuickSearch(tag)} className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all bg-white/50 dark:bg-[#111]/50 backdrop-blur-sm text-xs">
                     {tag}
                   </button>
                ))}
              </div>

              <div className="w-full max-w-5xl mx-auto mt-40 relative z-10 animate-fade-up">
                   <div className="text-center mb-16">
                       <h3 className="text-3xl font-bold font-pixel text-black dark:text-white mb-4">The Features</h3>
                       <p className="text-neutral-500 max-w-xl mx-auto">A complete operating system for your early career. We've automated every step.</p>
                   </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-dashed border-neutral-200 dark:border-neutral-800 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
                      {[
                        { title: 'Job Engine', icon: Code2, desc: 'Autonomous crawling of Naukri, JobHai, and LinkedIn.' },
                        { title: 'Ghost Detection', icon: Cpu, desc: 'AI analyzes "Posted Date" vs "Last Activity" to flag dead listings.' },
                        { title: 'Gig Radar', icon: MapPin, desc: 'Geo-fenced discovery for offline cafes & retail work.' },
                        { title: 'Hidden Market', icon: Ghost, desc: 'Find unlisted opportunities at local businesses.' }
                      ].map((feature, i) => (
                        <div key={i} className="group relative p-10 border-r border-b border-dashed border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#0f0f0f]/80 transition-colors">
                          <div className="mb-6 w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                              <feature.icon size={24} strokeWidth={2} />
                          </div>
                          <h3 className="text-2xl font-bold font-pixel text-black dark:text-white mb-3 flex items-center gap-2">
                              {feature.title} <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-neutral-400" />
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-500 text-base leading-relaxed">{feature.desc}</p>
                        </div>
                      ))}
                  </div>

                  {/* TITLE FOR VOICE MODEL */}
                  <div className="w-full max-w-2xl mx-auto mt-32 mb-10 text-center relative z-10">
                      <h3 className="text-4xl font-pixel font-bold text-black dark:text-white mb-2 tracking-tight">Our Voice Model</h3>
                      <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Real-time Latency. Human Emotion.</p>
                  </div>

                  {/* VOICE DOJO FEATURE SECTION - With Grid Background */}
                  <div className="relative flex flex-col md:flex-row gap-12 items-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
                        
                        <div className="flex-1 text-left space-y-6 relative z-10">
                            <div>
                                <h2 className="text-5xl font-pixel font-bold text-black dark:text-white mb-2 inline-block">
                                    Dojo<span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-indigo-600">.</span>
                                </h2>
                                <p className="text-indigo-500 dark:text-indigo-400 font-mono text-sm uppercase tracking-widest font-bold">The End of Interview Anxiety</p>
                            </div>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                                Most students fail because they panic, not because they lack skills. 
                                <strong className="text-black dark:text-white font-medium"> Dojo is a real-time voice AI</strong> that simulates high-pressure interviews, salary negotiations, and elevator pitches. 
                                It listens, reacts, and coaches you in real-time.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">Mock Interviews</span>
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">Salary Negotiation</span>
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">Confidence Training</span>
                            </div>
                        </div>
                        
                        {/* THE DOJO COMPONENT */}
                        <div className="w-full md:w-[420px] h-[400px] shrink-0 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl bg-white dark:bg-black relative z-10">
                             <LandingVoiceDojo onExpand={() => onNavigate && onNavigate('VOICE_DOJO')} />
                        </div>
                  </div>

              </div>

              {/* NEW TITLE STRUCTURE FOR HOW IT WORKS WITH FULL GRID BACKGROUND */}
              <div className="relative w-full py-20 mt-32">
                  {/* FULL WIDTH GRID BACKGROUND */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 opacity-100" />
                  {/* Fade masks for grid edges */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-[#050505] dark:via-transparent dark:to-[#050505] pointer-events-none z-0" />

                  <div className="w-full max-w-2xl mx-auto text-center relative z-10">
                      <h3 className="text-4xl font-pixel font-bold text-black dark:text-white mb-2 tracking-tight">Structured How it Works</h3>
                      <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">The Engine Under the Hood</p>
                  </div>

                  <ScrapingVisualizer />
              </div>

              <div className="w-full max-w-5xl mt-20 text-left relative z-10">
                  <h3 className="text-5xl font-bold font-pixel text-center text-black dark:text-white mb-20 tracking-tight">Everything You Need to Know</h3>
                  <div className="flex flex-col">
                    <FAQItem number="1" question="How does the Voice Dojo reduce interview anxiety?" answer="Voice Dojo exposes you to realistic, high-pressure scenarios in a safe environment. By practicing with an AI that reacts dynamically to your tone and content, you build muscle memory and confidence, making the real interview feel like just another practice session." />
                    <FAQItem number="2" question="Is this platform really free for students?" answer="Yes! Every student gets 3 free Search Credits and 5 minutes of Dojo time daily. You can earn more credits by completing your profile or inviting friends. We also offer a Pro plan for unlimited power usage." />
                    <FAQItem number="3" question="Can I find remote work or internships here?" answer="Absolutely. Our Job Engine scrapes major platforms like Naukri, LinkedIn, and JobHai specifically filtering for 'Remote', 'Part-time', and 'Internship' tags to save you hours of scrolling." />
                    <FAQItem number="4" question="What are 'Ghost Jobs' and how do you detect them?" answer="Ghost jobs are listings that companies leave up despite not hiring. Our AI analyzes the 'Posted Date' vs 'Last Active' date and cross-references multiple boards to flag dead listings." />
                    <FAQItem number="5" question="Is my data safe when using Firecrawl V2?" answer="Completely. Firecrawl V2 acts as a proxy that reads public HTML data. We do not store your personal information or credentials for external sites. All data processing happens anonymously via our secure cloud nodes." />
                    <FAQItem number="6" question="How is 'Hidden Market' different from Job Search?" answer="The Job Search finds listings that are already public. The Hidden Market tool uses AI to find local businesses (agencies, cafes, startups) that match your skills but *haven't* posted a job yet. It then generates a cold email for you to pitch them directly." />
                    <FAQItem number="7" question="Can the AI write my cover letter?" answer="Yes. In the search results, click 'Ghost Mode' on any job card. The AI will analyze the job description and your profile to generate a tailored cover letter, custom application answers, and a cold email draft instantly." />
                  </div>
              </div>
              
              {/* PROFESSIONAL FOOTER - THEME RESPONSIVE - FIXED ORBS */}
              <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 mt-40 pt-20 pb-12 bg-white dark:bg-black relative z-20 overflow-hidden text-black dark:text-white transition-colors">
                  
                  {/* FOOTER AMBIENT ORBS - SIDE POSITIONED & MOVING - FIXED "BLOCKED" LOOK */}
                  {/* Left Yellowish Orb - Large and Diffuse */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[-15%] w-[800px] h-[800px] bg-yellow-400/20 rounded-full blur-[128px] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen animate-blob" />
                  
                  {/* Right Radish Orb - Large and Diffuse */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-[-15%] w-[800px] h-[800px] bg-rose-500/20 rounded-full blur-[128px] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
                  
                  {/* EXTRA GRAIN FOR FOOTER */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] opacity-20 pointer-events-none z-0 mix-blend-overlay"></div>
                  
                  {/* Side fade masks to ensure smooth transition at edges */}
                  <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none opacity-50" />
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none opacity-50" />

                  <div className="max-w-7xl mx-auto px-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                          <div className="col-span-1 md:col-span-2 space-y-6">
                               <h2 className="text-3xl font-pixel font-bold text-black dark:text-white">StudentGig.AI</h2>
                               <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                                   The first AI-powered career operating system designed exclusively for students. We automate the hunt so you can focus on the interview.
                               </p>
                               <div className="flex gap-4">
                                   <button className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"><Twitter size={16} /></button>
                                   <button className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"><Instagram size={16} /></button>
                                   <button className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"><Linkedin size={16} /></button>
                               </div>
                          </div>
                          
                          <div>
                              <h4 className="font-bold text-black dark:text-white mb-6 uppercase text-xs tracking-widest">Platform</h4>
                              <ul className="space-y-4 text-sm text-neutral-500">
                                  <li><button onClick={() => onNavigate?.('JOB_SEARCH')} className="hover:text-black dark:hover:text-white transition-colors">Job Search</button></li>
                                  <li><button onClick={() => onNavigate?.('VOICE_DOJO')} className="hover:text-black dark:hover:text-white transition-colors">Voice Dojo</button></li>
                                  <li><button onClick={() => onNavigate?.('GIG_RADAR')} className="hover:text-black dark:hover:text-white transition-colors">Gig Radar</button></li>
                                  <li><button onClick={() => onNavigate?.('DOCS')} className="hover:text-black dark:hover:text-white transition-colors">Documentation</button></li>
                              </ul>
                          </div>

                          <div>
                              <h4 className="font-bold text-black dark:text-white mb-6 uppercase text-xs tracking-widest">Company</h4>
                              <ul className="space-y-4 text-sm text-neutral-500">
                                  <li><button onClick={() => onNavigate?.('ABOUT')} className="hover:text-black dark:hover:text-white transition-colors">About Us</button></li>
                                  <li><button onClick={() => setLegalTab('privacy')} className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</button></li>
                                  <li><button onClick={() => setLegalTab('terms')} className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</button></li>
                                  <li><button onClick={() => setLegalTab('security')} className="hover:text-black dark:hover:text-white transition-colors">Security</button></li>
                              </ul>
                          </div>
                      </div>
                      
                      <div className="pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                              © 2025 StudentGig.AI Inc. All rights reserved.
                          </div>
                          <div className="flex gap-2">
                               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Systems Operational</span>
                          </div>
                      </div>
                  </div>
              </footer>
          </div>
      </div>
  );

  // --- RENDER LOGIC ---

  const renderLoading = () => (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
           <div className="max-w-xl w-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-800"><div className="h-full bg-black dark:bg-white animate-shine" style={{ width: '50%' }} /></div>
               <h2 className="text-3xl font-pixel text-black dark:text-white text-center mb-8 animate-pulse">Agent Active</h2>
               <div className="space-y-6">
                  {["Initializing Firecrawl...", "Scanning Nodes...", "Extracting Data...", "Filtering Ghosts...", "Formatting..."].map((s, i) => (
                      <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i <= loadingIndex ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'}`}>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${i < loadingIndex ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' : i === loadingIndex ? 'bg-transparent border-black dark:border-white animate-spin-slow' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}>
                               {i < loadingIndex ? <CheckCircle2 size={12} /> : i === loadingIndex ? <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" /> : null}
                           </div>
                           <span className={`font-mono text-xs uppercase tracking-widest ${i === loadingIndex ? 'text-black dark:text-white font-bold' : 'text-neutral-500'}`}>{s}</span>
                      </div>
                  ))}
               </div>
           </div>
      </div>
  );

  const renderResults = () => (
    <div className="min-h-screen pt-32 px-4 pb-20 max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-pixel font-bold text-black dark:text-white mb-2">Search Results</h2>
                <p className="text-neutral-500 text-sm">Found {results.length} verified opportunities for "{query}"</p>
            </div>
            <button onClick={() => setStep('IDLE')} className="px-6 py-2 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                New Search
            </button>
        </div>

        {results.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                <p className="text-neutral-500">{error || "No jobs found. Try adjusting your filters."}</p>
                <button onClick={() => setStep('IDLE')} className="mt-4 text-black dark:text-white font-bold underline">Try Again</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        )}
    </div>
  );

  return (
    <>
      {step === 'IDLE' && renderIdleHero()}
      {step === 'WIZARD' && <div className="pt-32"><div className="text-center p-20">Wizard Placeholder</div></div>}
      {step === 'LOADING' && renderLoading()}
      {step === 'RESULTS' && renderResults()}
      {legalTab && <LegalModal initialTab={legalTab} onClose={() => setLegalTab(null)} />}
    </>
  );
};