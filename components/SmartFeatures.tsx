import React, { useState } from 'react';
import { 
    MapPin,
    Ghost,
    Mail,
    Calculator,
    MessagesSquare,
    ExternalLink,
    ArrowRight
} from 'lucide-react';
import { 
    findLocalGigs,
    findHiddenMarket,
    calculateFreelanceRates,
    getInterviewQuestion
} from '../services/gemini';
import { FeatureSkeleton } from './Skeleton';
import { 
    LocalGig, 
    HiddenMarketOpportunity, 
    FreelanceRate,
    FeatureGuard
} from '../types';

interface FeatureProps {
    checkCredits?: FeatureGuard;
}

// Styles updated for pixel font and light/dark compatibility
const FeatureHeader = ({ title, subtitle, icon: Icon }: any) => (
    <div className="mb-10 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-bold font-pixel text-black dark:text-white tracking-tight">{title}</h2>
        </div>
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest ml-16">
            {subtitle}
        </p>
    </div>
);

// --- FEATURE 7: GIG RADAR ---
export const GigRadar: React.FC<FeatureProps> = ({ checkCredits }) => {
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Coffee Shops');
    const [results, setResults] = useState<LocalGig[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if(!location) return;
        if(checkCredits && !checkCredits()) return; 

        setLoading(true);
        const res = await findLocalGigs(location, type);
        setResults(res);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto pt-24 p-8 animate-fade-up">
            <FeatureHeader title="Gig Radar" subtitle="Hyper-local Offline Job Discovery" icon={MapPin} />
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input className="flex-1 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none focus:border-black dark:focus:border-white" 
                    value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter Location (e.g. Koramangala)" />
                <select className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none"
                    value={type} onChange={e => setType(e.target.value)}>
                    <option>Coffee Shops</option>
                    <option>Bookstores</option>
                    <option>Retail Stores</option>
                </select>
                <button onClick={handleSearch} disabled={loading} className="bg-black dark:bg-white text-white dark:text-black font-bold font-pixel uppercase px-8 py-4 rounded-xl tracking-widest hover:opacity-90 transition-opacity">Scan</button>
            </div>
            
            {loading ? <FeatureSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((gig, i) => (
                        <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:border-black dark:hover:border-white transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-black dark:text-white font-pixel">{gig.name}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${gig.hiringProbability === 'High' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                                    {gig.hiringProbability} Chance
                                </span>
                            </div>
                            <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2">
                                <MapPin size={12} className="shrink-0"/> 
                                <span className="truncate">{gig.address}</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <span className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded text-neutral-500">{gig.distance}</span>
                                <span className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded text-neutral-500">{gig.rating} Stars</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- FEATURE 8: HIDDEN MARKET HUNTER ---
export const HiddenMarket: React.FC<FeatureProps> = ({ checkCredits }) => {
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [results, setResults] = useState<HiddenMarketOpportunity[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        if(checkCredits && !checkCredits()) return; 
        setLoading(true);
        const res = await findHiddenMarket(skills.split(','), location);
        setResults(res);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto pt-24 p-8 animate-fade-up">
             <FeatureHeader title="Hidden Market" subtitle="Unlisted Opportunity Discovery" icon={Ghost} />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <input className="md:col-span-2 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none focus:border-black dark:focus:border-white" 
                    value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (e.g. Video Editing)" />
                 <input className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none focus:border-black dark:focus:border-white" 
                    value={location} onChange={e => setLocation(e.target.value)} placeholder="City" />
             </div>
             <button onClick={handleScan} disabled={loading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold font-pixel uppercase py-4 rounded-xl mb-8 tracking-widest hover:opacity-90">
                Reveal Hidden Jobs
             </button>

             {loading ? <FeatureSkeleton /> : (
                 <div className="space-y-6">
                     {results.map((opp, i) => (
                         <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm">
                             <div className="flex justify-between mb-4">
                                 <div>
                                     <h3 className="text-xl font-bold font-pixel text-black dark:text-white">{opp.companyName}</h3>
                                     <p className="text-sm text-neutral-500">{opp.industry}</p>
                                 </div>
                             </div>
                             <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-l-4 border-purple-500">
                                 <p className="text-xs text-purple-600 dark:text-purple-300 font-bold mb-1 uppercase tracking-wider">Why You Fit</p>
                                 <p className="text-sm text-neutral-600 dark:text-neutral-300">{opp.reasonForFit}</p>
                             </div>
                             <div className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] uppercase font-bold text-neutral-500">Cold Outreach Draft</span>
                                     <button onClick={() => navigator.clipboard.writeText(opp.outreachEmail)} className="text-[10px] flex items-center gap-1 text-black dark:text-white hover:opacity-70"><Mail size={10}/> Copy</button>
                                 </div>
                                 <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono whitespace-pre-wrap">{opp.outreachEmail}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );
};

// --- FEATURE 9: FREELANCE RATE ARCHITECT ---
export const FreelanceCalc: React.FC<FeatureProps> = ({ checkCredits }) => {
    // Component logic remains same, just update styles to match light/dark theme
    const [skill, setSkill] = useState('');
    const [country, setCountry] = useState('Global');
    const [data, setData] = useState<FreelanceRate | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalc = async () => {
        if(checkCredits && !checkCredits()) return;
        setLoading(true);
        const res = await calculateFreelanceRates(skill, country);
        setData(res);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto pt-24 p-8 animate-fade-up">
            <FeatureHeader title="Rate Architect" subtitle="Market Value Calculator" icon={Calculator} />
            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <input className="flex-1 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none" 
                    value={skill} onChange={e => setSkill(e.target.value)} placeholder="Skill (e.g. Logo Design)" />
                <input className="w-full md:w-48 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-4 text-black dark:text-white rounded-xl outline-none" 
                    value={country} onChange={e => setCountry(e.target.value)} placeholder="Target Market" />
                <button onClick={handleCalc} disabled={loading} className="bg-black dark:bg-white text-white dark:text-black font-bold font-pixel uppercase px-8 py-4 rounded-xl tracking-widest">Calculate</button>
            </div>

            {loading ? <FeatureSkeleton /> : data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                        <h3 className="text-neutral-500 text-sm uppercase tracking-widest mb-4 font-mono">Hourly Rate Range</h3>
                        <div className="text-5xl font-bold font-pixel text-black dark:text-white mb-2">
                            {data.hourlyRateLow} - {data.hourlyRateHigh}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs">Student Level in {country}</p>
                    </div>
                    {/* Additional details omitted for brevity but follow same styling pattern */}
                </div>
            )}
        </div>
    );
};

// --- INTERVIEW SIM ---
export const InterviewSim: React.FC<FeatureProps> = ({ checkCredits }) => {
    // Logic remains same, styles updated
    const [role, setRole] = useState('');
    const [history, setHistory] = useState<{role: 'ai'|'user', text: string}[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);

    const handleStart = async () => {
        if(!role) return;
        if(checkCredits && !checkCredits()) return;
        setStarted(true);
        setLoading(true);
        const q = await getInterviewQuestion(role, "Start.");
        setHistory([{role: 'ai', text: q}]);
        setLoading(false);
    };

    const handleReply = async () => {
        if(!userInput) return;
        const newHistory = [...history, {role: 'user' as const, text: userInput}];
        setHistory(newHistory);
        setUserInput('');
        setLoading(true);
        const context = newHistory.slice(-3).map(h => `${h.role}: ${h.text}`).join('\n');
        const q = await getInterviewQuestion(role, context);
        setHistory(prev => [...prev, {role: 'ai', text: q}]);
        setLoading(false);
    };

    if (loading && !started) return <div className="max-w-4xl mx-auto pt-24"><FeatureSkeleton /></div>;

    return (
        <div className="max-w-3xl mx-auto pt-24 h-[calc(100vh-50px)] flex flex-col p-8 animate-fade-up">
            <FeatureHeader title="AI Interview" subtitle="Behavioral Simulation" icon={MessagesSquare} />
            {!started ? (
                <div className="flex-1 flex flex-col justify-center items-center space-y-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-[#0a0a0a] p-12 shadow-xl">
                     <input 
                        type="text" 
                        placeholder="Target Role (e.g. Junior Dev)"
                        className="bg-transparent border-b-2 border-neutral-300 dark:border-neutral-700 text-center text-3xl font-pixel text-black dark:text-white py-4 w-full outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                     />
                     <button onClick={handleStart} className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-bold font-pixel uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg">
                        Initialize Session
                     </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-2xl">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-black text-white dark:bg-white dark:text-black font-medium' : 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-4 bg-white dark:bg-black">
                        <input 
                            className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your answer..."
                            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                        />
                        <button onClick={handleReply} disabled={loading} className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-xl hover:opacity-80 transition-opacity">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};