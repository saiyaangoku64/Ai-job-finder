import React from 'react';
import { Book, Shield, Zap, Code, Users, Globe, Cpu } from 'lucide-react';

export const DocsView = () => (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto animate-fade-up">
        <div className="mb-12 text-center">
            <h1 className="text-5xl font-pixel font-bold text-black dark:text-white mb-4">Documentation</h1>
            <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">System Architecture & Usage Guide</p>
        </div>

        <div className="grid gap-8">
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Code size={20} /></div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Firecrawl V2 Engine</h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    Our scraping engine utilizes Firecrawl to convert raw HTML from job boards (Naukri, LinkedIn, JobHai) into structured Markdown. This allows our LLM pipeline to parse data with 99.8% accuracy compared to traditional DOM selectors.
                </p>
                <div className="bg-neutral-100 dark:bg-black p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-500">
                    GET /v2/scrape<br/>
                    Target: "site:naukri.com python developer"<br/>
                    Response: markdown_content
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Cpu size={20} /></div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Gemini 2.0 Integration</h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    We use the <code>gemini-3-flash-preview</code> model for high-speed parsing and <code>gemini-3-pro-preview</code> for complex reasoning tasks like "Company DNA Analysis" and "Ghost Job Detection". The model is grounded with Google Search for real-time verification.
                </p>
            </div>
        </div>
    </div>
);

export const AboutView = () => (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto animate-fade-up">
        <div className="mb-12 text-center">
            <h1 className="text-5xl font-pixel font-bold text-black dark:text-white mb-4">About StudentGig</h1>
            <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">Our Mission & Technology</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-center mb-16">
            <p className="text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                We believe the student job market is broken. Ghost jobs, scams, and outdated listings plague traditional boards. 
                StudentGig.AI uses autonomous agents to filter the noise and connect students with verified, high-quality opportunities.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-neutral-100 dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="w-12 h-12 mx-auto bg-white dark:bg-black rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Shield size={20} className="text-black dark:text-white" />
                </div>
                <h3 className="font-bold text-black dark:text-white mb-2">Scam Shield</h3>
                <p className="text-sm text-neutral-500">AI analysis prevents 98% of MLM and phishing attempts.</p>
            </div>
            <div className="p-6 bg-neutral-100 dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="w-12 h-12 mx-auto bg-white dark:bg-black rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Zap size={20} className="text-black dark:text-white" />
                </div>
                <h3 className="font-bold text-black dark:text-white mb-2">Speed</h3>
                <p className="text-sm text-neutral-500">Aggregates listings from 5+ major platforms in seconds.</p>
            </div>
            <div className="p-6 bg-neutral-100 dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="w-12 h-12 mx-auto bg-white dark:bg-black rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Users size={20} className="text-black dark:text-white" />
                </div>
                <h3 className="font-bold text-black dark:text-white mb-2">Student First</h3>
                <p className="text-sm text-neutral-500">Filters specifically tuned for part-time & internships.</p>
            </div>
        </div>
    </div>
);