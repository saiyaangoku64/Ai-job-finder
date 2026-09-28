import React, { useState } from 'react';
import { ExternalLink, MapPin, Building2, Globe, Sparkles, CheckCircle2, AlertTriangle, Layers, Copy, X, FileDown, DollarSign, Activity, Mail, Layout, Eye, Clock, Ghost } from 'lucide-react';
import { JobListing, ApplicationPayload, CompanyDNA } from '../types';
import { generateGhostFill, analyzeCompanyDNA, generateSalaryNegotiation } from '../services/gemini';
import { MOCK_USER } from '../constants';

interface JobCardProps {
  job: JobListing;
}

export const JobCard: React.FC<JobCardProps> = ({ job: initialJob }) => {
  const [job, setJob] = useState(initialJob);
  const [ghostModalOpen, setGhostModalOpen] = useState(false);
  const [fillPayload, setFillPayload] = useState<ApplicationPayload | null>(null);
  const [loadingFill, setLoadingFill] = useState(false);
  
  // New Feature States
  const [dnaAnalysis, setDnaAnalysis] = useState<CompanyDNA | null>(null);
  const [loadingDna, setLoadingDna] = useState(false);
  const [negotiationScript, setNegotiationScript] = useState('');
  
  // Tracking State
  const statusColors = {
      'NEW': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'SAVED': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'APPLIED': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'INTERVIEWING': 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  const handleGhostFill = async () => {
    setGhostModalOpen(true);
    if (!fillPayload) {
        setLoadingFill(true);
        const payload = await generateGhostFill(job, MOCK_USER);
        setFillPayload(payload);
        setLoadingFill(false);
    }
  };

  const handleCompanyDNA = async () => {
      if(dnaAnalysis) return;
      setLoadingDna(true);
      const dna = await analyzeCompanyDNA(job.company);
      setDnaAnalysis(dna);
      setLoadingDna(false);
  };

  const handleNegotiation = async () => {
      const script = await generateSalaryNegotiation(job.title, job.salary || "market rate");
      setNegotiationScript(script);
  };
  
  const cycleStatus = () => {
      const statuses: any[] = ['NEW', 'SAVED', 'APPLIED', 'INTERVIEWING'];
      const nextIdx = (statuses.indexOf(job.applicationStatus || 'NEW') + 1) % statuses.length;
      setJob({...job, applicationStatus: statuses[nextIdx]});
  };

  return (
    <>
    <div className={`group relative bg-[#0a0a0a] border hover:border-neutral-500 transition-all duration-300 p-6 flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl z-20 ${job.isGhostJob ? 'border-red-900/30 opacity-70' : 'border-neutral-800'} ${job.isRecommended ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : ''}`}>
      
      {/* Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none z-0" />

      {/* Ghost Job Indicator */}
      {job.isGhostJob && (
         <div className="absolute top-0 left-0 w-full bg-red-900/20 py-1 text-center z-10">
             <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertTriangle size={10} /> Ghost Job Risk
             </span>
         </div>
      )}

      {/* Recommended Badge */}
      {job.isRecommended && (
          <div className="absolute top-4 right-4 z-20">
              <Sparkles size={16} className="text-amber-500 animate-pulse" fill="currentColor" />
          </div>
      )}

      <div className={`flex justify-between items-start mb-4 relative z-10 ${job.isGhostJob ? 'mt-4' : ''}`}>
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-white leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider">
            <Building2 size={12} strokeWidth={2} />
            <span className="text-neutral-400">{job.company}</span>
            <span className="text-neutral-700">|</span>
            {job.isVerified ? (
                <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20" title="Verified Direct Link">
                    <CheckCircle2 size={10} /> Verified
                </span>
            ) : (
                <span className="flex items-center gap-1 text-neutral-500">
                    <Globe size={10} /> Web
                </span>
            )}
            
            {/* DATE DISPLAY */}
            {job.postedAt && (
                <>
                <span className="text-neutral-700">|</span>
                <span className="flex items-center gap-1 text-neutral-400" title="Posted Date">
                    <Clock size={10} /> {job.postedAt}
                </span>
                </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
            <button 
                onClick={cycleStatus}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-widest transition-colors ${statusColors[job.applicationStatus || 'NEW']}`}
            >
                {job.applicationStatus || 'NEW'}
            </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md text-[10px] text-neutral-300 font-mono uppercase">
          <MapPin size={10} /> {job.location}
        </span>
        <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md text-[10px] text-neutral-300 font-mono uppercase">
           {job.platforms && job.platforms.length > 1 ? (
               <><Layers size={10} /> {job.source} +{job.platforms.length - 1}</>
           ) : (
               <><Globe size={10} /> {job.source}</>
           )}
        </span>
        {job.salary && (
           <span className="flex items-center gap-1.5 bg-white text-black border border-transparent px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide">
             {job.salary}
           </span>
        )}
      </div>

      <p className="text-sm text-neutral-400 leading-relaxed mb-6 font-light flex-grow relative z-10">
        {job.description}
      </p>

      {/* Advanced Features Toolbar */}
      <div className="flex gap-2 mb-6 border-t border-neutral-800 pt-4 overflow-x-auto pb-2 custom-scrollbar relative z-10">
          <button onClick={handleCompanyDNA} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white bg-neutral-900/50 px-3 py-2 rounded-lg whitespace-nowrap transition-colors">
              <Activity size={12} /> {loadingDna ? 'Scanning...' : 'Company DNA'}
          </button>
          <button onClick={handleNegotiation} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white bg-neutral-900/50 px-3 py-2 rounded-lg whitespace-nowrap transition-colors">
              <DollarSign size={12} /> Salary Script
          </button>
          {job.recruiterEmail && (
              <a href={`mailto:${job.recruiterEmail}`} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white bg-neutral-900/50 px-3 py-2 rounded-lg whitespace-nowrap transition-colors">
                  <Mail size={12} /> Email HR
              </a>
          )}
      </div>

      {/* DNA Result Area */}
      {dnaAnalysis && (
          <div className="mb-4 bg-neutral-900/30 p-4 rounded-lg border-l-2 border-purple-500 text-xs text-neutral-300 space-y-2 relative z-10">
              <div className="flex justify-between">
                  <span className="font-bold text-white">Stability:</span>
                  <span>{dnaAnalysis.stability}</span>
              </div>
              <div className="flex justify-between">
                  <span className="font-bold text-white">Sentiment:</span>
                  <span>{dnaAnalysis.employeeSentiment}</span>
              </div>
              <div className="flex justify-between">
                  <span className="font-bold text-white">Hiring:</span>
                  <span className="text-green-400">{dnaAnalysis.hiringTrend}</span>
              </div>
          </div>
      )}
      
      {/* Negotiation Result Area */}
      {negotiationScript && (
          <div className="mb-4 bg-neutral-900/30 p-4 rounded-lg border-l-2 border-green-500 text-xs text-neutral-300 leading-relaxed font-mono relative z-10">
              <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-green-400 uppercase">Negotiation Script</span>
                  <button onClick={() => navigator.clipboard.writeText(negotiationScript)} className="text-[10px] hover:text-white">Copy</button>
              </div>
              {negotiationScript}
          </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
          <button 
            onClick={handleGhostFill}
            className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-none"
          >
             <Ghost size={14} /> Ghost Mode
          </button>

          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-black hover:bg-neutral-200 border-transparent py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {job.isVerified ? 'Apply Now' : 'Find Apply Link'} <ExternalLink size={14} />
          </a>
      </div>
    </div>

    {/* Ghost Fill Modal */}
    {ghostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-2xl rounded-2xl p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <Ghost size={16} />
                        </div>
                        <div>
                             <h3 className="text-white font-medium">Ghost Fill Agent</h3>
                             <p className="text-neutral-500 text-xs font-mono uppercase">Generating application assets for {job.company}</p>
                        </div>
                    </div>
                    <button onClick={() => setGhostModalOpen(false)} className="text-neutral-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {loadingFill ? (
                        <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-4">
                            <div className="w-8 h-8 border-2 border-neutral-800 border-t-purple-500 rounded-full animate-spin"></div>
                            <p className="text-xs font-mono uppercase tracking-widest">Writing customized cover letter...</p>
                        </div>
                    ) : (
                        fillPayload && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Cover Letter</label>
                                        <button className="text-[10px] flex items-center gap-1 text-purple-400 hover:opacity-70" onClick={() => navigator.clipboard.writeText(fillPayload.coverLetter)}>
                                            <Copy size={10} /> Copy
                                        </button>
                                    </div>
                                    <div className="bg-black border border-neutral-800 p-4 rounded-xl text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-light">
                                        {fillPayload.coverLetter}
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    )}
    </>
  );
};