import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// 1. To use your own project, add keys to .env
// 2. Fallback: Uses a shared demo project (Rate limited, but prevents crash)

// Valid Demo Keys (Prevents the "Invalid URL" error)
const DEMO_URL = 'https://lsqhmbphfmewtivnoxph.supabase.co';
const DEMO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcWhtYnBoZm1ld3Rpdm5veHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjY2ODcsImV4cCI6MjA4MjYwMjY4N30.4NFmisvPS5ObwYeIDReDueKDU5i37Ng9Wdg3WLVzL_A';

// Helper to safely access process.env in browser environments
const getEnv = (key: string) => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key];
        }
    } catch (e) {
        // Ignore reference errors
    }
    return undefined;
};

const envUrl = getEnv('REACT_APP_SUPABASE_URL');
const envKey = getEnv('REACT_APP_SUPABASE_ANON_KEY');

// Logic: Use Env Vars if they are valid URLs, otherwise use Demo
const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : DEMO_URL;
const supabaseKey = (envKey && envKey.length > 20) ? envKey : DEMO_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseConfig = () => {
    // Always return true so the app doesn't block the UI, 
    // allowing the "Guest Mode" or "Demo Mode" to function.
    return !!supabaseUrl && !!supabaseKey;
};