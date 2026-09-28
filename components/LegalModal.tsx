import React, { useState } from 'react';
import { X, Shield, Lock, FileText, Cookie } from 'lucide-react';

interface LegalModalProps {
  initialTab: string;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab, onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className="space-y-4 text-neutral-300">
            <h3 className="text-xl font-bold text-white mb-4">Privacy Policy</h3>
            <p className="text-xs text-neutral-500 mb-6">Last Updated: October 24, 2025</p>
            
            <h4 className="font-bold text-white">1. Data Collection</h4>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our AI search features. This includes your name, email address, educational background, and job preferences.</p>
            
            <h4 className="font-bold text-white">2. AI Processing</h4>
            <p>Our "Firecrawl" and "Gemini" integrations process public data to find job listings. We do not store the full content of external sites, only the metadata required to link you to the opportunity.</p>
            
            <h4 className="font-bold text-white">3. Data Usage</h4>
            <p>We use your data to: Provide, maintain, and improve our services; personalize your job feed; and detect "Ghost Jobs" or scams using our proprietary algorithms.</p>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4 text-neutral-300">
            <h3 className="text-xl font-bold text-white mb-4">Terms of Service</h3>
            
            <h4 className="font-bold text-white">1. Acceptance of Terms</h4>
            <p>By accessing StudentGig.AI, you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
            
            <h4 className="font-bold text-white">2. User Conduct</h4>
            <p>You agree not to misuse the platform, scrape our data without permission, or attempt to reverse-engineer our AI models.</p>
            
            <h4 className="font-bold text-white">3. Credits & Payments</h4>
            <p>Free accounts are limited to 3 searches per session. Pro accounts ($9/mo) offer unlimited access. Refunds are processed within 14 days of purchase if the service was not used.</p>
          </div>
        );
      case 'cookies':
        return (
          <div className="space-y-4 text-neutral-300">
             <h3 className="text-xl font-bold text-white mb-4">Cookie Policy</h3>
             <p>We use cookies to enhance your experience. Essential cookies are required for login (Supabase Auth). Analytics cookies help us understand how you use the site.</p>
             <ul className="list-disc pl-5 space-y-2">
                 <li><strong>Essential:</strong> Auth tokens, session management.</li>
                 <li><strong>Functional:</strong> Saving your "Gig Radar" location preferences.</li>
                 <li><strong>Analytics:</strong> Anonymous usage data to improve search algorithms.</li>
             </ul>
          </div>
        );
      case 'security':
        return (
           <div className="space-y-4 text-neutral-300">
              <h3 className="text-xl font-bold text-white mb-4">Security Infrastructure</h3>
              <p>Security is our top priority. We use industry-standard encryption to protect your data.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                      <h5 className="font-bold text-white mb-2">Encryption</h5>
                      <p className="text-xs">AES-256 encryption at rest and TLS 1.3 in transit.</p>
                  </div>
                  <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                      <h5 className="font-bold text-white mb-2">Authentication</h5>
                      <p className="text-xs">Powered by Supabase Auth with Row Level Security (RLS).</p>
                  </div>
              </div>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden text-neutral-500 hover:text-white z-50"
        >
          <X size={24} />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                <Shield className="text-emerald-500" size={20} /> Legal Center
            </h2>
            <nav className="space-y-2 flex-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                            activeTab === tab.id 
                            ? 'bg-neutral-900 text-white border border-neutral-700' 
                            : 'text-neutral-500 hover:text-white hover:bg-neutral-900/50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="text-[10px] text-neutral-600 font-mono mt-auto pt-6">
                ID: REF-{Math.floor(Math.random() * 10000)}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            <div className="h-16 border-b border-neutral-800 flex items-center justify-end px-6 hidden md:flex">
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
