import React from 'react';
import { Sparkles, CheckCircle2, Zap, X, Crown } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-lg rounded-3xl p-0 shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-b from-neutral-900 to-[#0f0f0f] p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
           <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
               <Crown size={32} strokeWidth={1.5} />
           </div>
           <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
           <p className="text-neutral-400 text-sm font-mono uppercase tracking-widest">
             You've used all your free credits
           </p>
        </div>

        {/* Content */}
        <div className="p-8">
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-neutral-300 text-sm">Unlimited AI Job Searches</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-neutral-300 text-sm">Access Hidden Job Market</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-neutral-300 text-sm">Automated Resume Tailoring</span>
                </div>
            </div>

            <button className="w-full bg-white hover:bg-neutral-200 text-black py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all mb-4">
                <Zap size={18} fill="currentColor" /> Unlock Pro Access - $9/mo
            </button>
            
            <p className="text-center text-[10px] text-neutral-600 font-mono">
                Secure payment via Stripe. Cancel anytime.
            </p>
        </div>
      </div>
    </div>
  );
};