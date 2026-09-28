import React, { useState, useEffect } from 'react';
import { JobSearch } from './components/JobSearch';
import { 
    InterviewSim, 
    GigRadar,
    HiddenMarket,
    FreelanceCalc
} from './components/SmartFeatures';
import { VoiceInterviewDojo } from './components/VoiceInterviewDojo';
import { DocsView, AboutView } from './components/StaticPages';
import { Auth } from './components/Auth';
import { UpgradeModal } from './components/UpgradeModal';
import { supabase } from './services/supabase';
import { NAVIGATION_ITEMS, MOCK_USER } from './constants';
import { User as UserType } from './types';
import { Menu, X, User as UserIcon, Zap, Snowflake, Sun, Moon, LogOut, ChevronRight, LayoutGrid } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState<string>('JOB_SEARCH');
  const [menuOpen, setMenuOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  // UI States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Initialize Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize Supabase Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSessionToUser(session.user);
      } else {
        setInitializing(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSessionToUser(session.user);
      } else {
        setUser(null);
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSessionToUser = (authUser: any) => {
      const mappedUser: UserType = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Student',
          skills: MOCK_USER.skills, 
          availability: MOCK_USER.availability,
          isAuthenticated: true,
          credits: 3 
      };
      setUser(mappedUser);
      setInitializing(false);
      setShowAuthModal(false); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('JOB_SEARCH');
    setMenuOpen(false);
  };

  const handleFeatureAttempt = (): boolean => {
    if (!user) {
        setShowAuthModal(true);
        return false;
    }
    if (user.credits <= 0) {
        setShowUpgradeModal(true);
        return false;
    }
    setUser({ ...user, credits: user.credits - 1 });
    return true;
  };

  const renderView = () => {
    const commonProps = { checkCredits: handleFeatureAttempt };
    switch (currentView) {
      case 'JOB_SEARCH': return <JobSearch {...commonProps} onNavigate={(view) => setCurrentView(view)} />;
      case 'GIG_RADAR': return <GigRadar {...commonProps} />;
      case 'HIDDEN_MARKET': return <HiddenMarket {...commonProps} />;
      case 'FREELANCE_CALC': return <FreelanceCalc {...commonProps} />;
      case 'INTERVIEW_SIM': return <InterviewSim {...commonProps} />;
      case 'VOICE_DOJO': return <VoiceInterviewDojo {...commonProps} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'DOCS': return <DocsView />;
      case 'ABOUT': return <AboutView />;
      case 'PROFILE': 
        return user ? (
            <div className="max-w-md mx-auto p-12 text-center border border-neutral-200 dark:border-neutral-800 mt-32 rounded-3xl bg-white/50 dark:bg-[#0a0a0a] backdrop-blur-md animate-fade-up">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full mx-auto mb-6 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                    <UserIcon size={40} className="text-black dark:text-white" strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-pixel text-black dark:text-white mb-2">{user.name}</h2>
                <p className="text-neutral-500 font-mono text-sm mb-4 uppercase tracking-widest">{user.email}</p>
                <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-full mb-8">
                     <Zap size={14} className={user.credits > 0 ? "text-yellow-500 dark:text-yellow-400" : "text-red-500"} fill="currentColor" />
                     <span className="text-xs font-bold text-black dark:text-white tracking-widest">{user.credits} CREDITS LEFT</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-neutral-600 hover:text-black dark:hover:text-white underline">Sign Out</button>
            </div>
        ) : null;
      default: return <JobSearch {...commonProps} onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  // --- FLOATING NAV ---
  const FloatingNav = () => (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-full shadow-2xl transition-all duration-300 w-max max-w-[95vw]">
          
          {/* 1. Logo */}
          <div className="pl-2 pr-2">
               <div onClick={() => setCurrentView('JOB_SEARCH')} className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-transparent dark:border-white/20 shrink-0 cursor-pointer">
                   <Snowflake size={16} />
               </div>
          </div>
          
          {/* 2. Primary Features (Job Engine + Voice Dojo Only) */}
          <nav className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentView('JOB_SEARCH')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'JOB_SEARCH'
                    ? 'bg-neutral-100 dark:bg-white/10 text-black dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
              >
                 Job Engine
              </button>
              
              <button 
                onClick={() => setCurrentView('VOICE_DOJO')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'VOICE_DOJO'
                    ? 'bg-neutral-100 dark:bg-white/10 text-black dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
              >
                 Voice Dojo
              </button>
          </nav>

          <div className="w-px h-6 bg-neutral-200 dark:bg-white/10 mx-1"></div>

          {/* 3. Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 4. Auth / Credits */}
          {user ? (
               <button 
                   onClick={() => setCurrentView('PROFILE')}
                   className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ml-1 flex items-center gap-2 shadow-lg animate-fade-in ${
                       user.credits > 0 
                       ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none' 
                       : 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500'
                   }`}
               >
                   {user.credits > 0 && <Zap size={12} fill="currentColor" />}
                   {user.credits} CR
               </button>
          ) : (
               <button 
                   onClick={() => setShowAuthModal(true)}
                   className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest ml-1 hover:opacity-80 transition-opacity"
               >
                   Sign In
               </button>
          )}

          {/* 5. Burger Menu */}
          <button 
            onClick={() => setMenuOpen(true)} 
            className="w-9 h-9 rounded-full flex items-center justify-center text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors ml-1"
          >
              <Menu size={16} />
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white font-sans transition-colors duration-300 selection:bg-yellow-400 selection:text-black">
      
      <FloatingNav />

      {/* NEW LEFT-SIDE DRAWER MENU */}
      {menuOpen && (
          <div className="fixed inset-0 z-[60] flex">
              {/* Backdrop */}
              <div 
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
                  onClick={() => setMenuOpen(false)}
              />
              
              {/* Sidebar Drawer */}
              <div className="relative w-80 h-full bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-neutral-800 p-6 flex flex-col shadow-2xl animate-slide-in-left">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8 pb-8 border-b border-neutral-100 dark:border-neutral-900">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                              <LayoutGrid size={16} />
                          </div>
                          <span className="text-lg font-bold font-pixel">Menu</span>
                      </div>
                      <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                          <X className="text-neutral-500" size={20} />
                      </button>
                  </div>

                  {/* Apps List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Core Features</h3>
                      <div className="space-y-2">
                          {NAVIGATION_ITEMS.filter(i => i.id !== 'PROFILE').map(item => (
                              <button 
                                key={item.id} 
                                onClick={() => { setCurrentView(item.id); setMenuOpen(false); }} 
                                className={`w-full group flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md text-left ${
                                    currentView === item.id 
                                    ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-black dark:text-white' 
                                    : 'bg-transparent border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                          currentView === item.id 
                                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                                      }`}>
                                          <item.icon size={16} strokeWidth={2} />
                                      </div>
                                      <span className="text-sm font-medium">{item.label}</span>
                                  </div>
                                  {currentView === item.id && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Footer User Profile */}
                  <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                      {user ? (
                          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                              <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                      <UserIcon size={20} className="text-neutral-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm truncate">{user.name}</p>
                                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{user.credits} Credits</p>
                                  </div>
                              </div>
                              <button onClick={handleLogout} className="w-full py-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                                  Sign Out
                              </button>
                          </div>
                      ) : (
                          <button onClick={() => { setMenuOpen(false); setShowAuthModal(true); }} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90">
                              Sign In / Sign Up
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      <main className="w-full relative z-10">
          {renderView()}
      </main>

      {/* Global Modals */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-blur">
              <div className="relative w-full max-w-md">
                   <button onClick={() => setShowAuthModal(false)} className="absolute -top-12 right-0 text-black dark:text-white hover:text-neutral-500"><X size={24} /></button>
                   <Auth onLogin={mapSessionToUser} />
              </div>
          </div>
      )}

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}