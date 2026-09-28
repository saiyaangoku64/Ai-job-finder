import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, KeyRound, RefreshCw, HelpCircle, UserCircle2 } from 'lucide-react';
import { supabase, checkSupabaseConfig } from '../services/supabase';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleGuestLogin = () => {
      onLogin({ id: 'guest', email: 'guest@studentgig.ai', user_metadata: { name: 'Guest' } });
  };

  const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!checkSupabaseConfig()) { setError("Supabase keys missing."); return; }
    if (isResend && cooldown > 0) return;

    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw error;
        setSuccessMsg(isResend ? `Resent to ${email}` : `Code sent to ${email}`);
        setStep('OTP');
        setCooldown(60);
    } catch (err: any) {
        setError(err.message || "Failed to send code");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
        if (error) throw error;
        if (data.user) onLogin(data.user);
    } catch (err: any) {
        setError(err.message || "Invalid code");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
             <GraduationCap size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-pixel font-bold text-black dark:text-white mb-2">StudentGig.AI</h1>
          <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
            Secure Passwordless Entry
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/50 dark:bg-[#111]/50 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={step === 'EMAIL' ? (e) => handleSendOtp(e) : handleVerifyOtp} className="space-y-6">
                
                {step === 'EMAIL' ? (
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest font-pixel">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white py-4 pl-12 rounded-xl focus:border-black dark:focus:border-white outline-none transition-colors font-sans"
                                placeholder="student@university.edu"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest font-pixel">Verification Code</label>
                            <button type="button" onClick={() => setStep('EMAIL')} className="text-[10px] text-blue-500 hover:underline uppercase tracking-widest">Change?</button>
                        </div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white py-4 text-center text-2xl tracking-[0.5em] rounded-xl focus:border-black dark:focus:border-white outline-none font-mono"
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                        />
                         {/* Resend Logic */}
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                disabled={cooldown > 0}
                                onClick={() => handleSendOtp(undefined, true)}
                                className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <RefreshCw size={10} className={cooldown > 0 ? 'animate-spin' : ''} /> {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend Code'}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-xs">
                        <CheckCircle2 size={14} /> {successMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 font-pixel shadow-lg"
                >
                    {loading ? 'Processing...' : (step === 'EMAIL' ? 'Send Magic Link' : 'Verify Login')} <ArrowRight size={18} />
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                 <button onClick={handleGuestLogin} className="text-neutral-500 hover:text-black dark:hover:text-white text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                    <UserCircle2 size={14} /> Continue as Guest
                 </button>
            </div>
        </div>
    </div>
  );
};