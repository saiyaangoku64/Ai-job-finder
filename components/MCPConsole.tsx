import React, { useState, useEffect } from 'react';
import { Terminal, Database, Play, Save, Layers, Table, Trash2, Plus, RefreshCw, X, Code, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '../services/supabase';
import { generateDatabaseSQL } from '../services/gemini';

export const MCPConsole = () => {
    const [mode, setMode] = useState<'ARCHITECT' | 'EXPLORER'>('ARCHITECT');
    const [prompt, setPrompt] = useState('');
    const [generatedSql, setGeneratedSql] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Explorer State
    const [tableName, setTableName] = useState('');
    const [tableData, setTableData] = useState<any[]>([]);
    const [fetchError, setFetchError] = useState('');

    const handleArchitect = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        const sql = await generateDatabaseSQL(prompt);
        setGeneratedSql(sql);
        setLoading(false);
    };

    const handleExplore = async () => {
        if (!tableName.trim()) return;
        setLoading(true);
        setFetchError('');
        setTableData([]);
        
        try {
            const { data, error } = await supabase.from(tableName).select('*').limit(20);
            if (error) throw error;
            setTableData(data || []);
        } catch (err: any) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-[#050505] text-green-500 font-mono p-4 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r border-green-900/30 pr-4 flex flex-col gap-2 mb-4 md:mb-0">
                <div className="p-4 border border-green-900/30 bg-green-900/10 rounded mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Terminal size={20} /> MCP://ROOT
                    </h2>
                    <p className="text-[10px] uppercase opacity-70 mt-1">Master Control Protocol</p>
                </div>
                
                <button 
                    onClick={() => setMode('ARCHITECT')}
                    className={`p-3 text-left border rounded flex items-center gap-3 transition-all ${mode === 'ARCHITECT' ? 'bg-green-500/10 border-green-500 text-green-400' : 'border-transparent hover:bg-green-900/10 opacity-50'}`}
                >
                    <Code size={16} /> Architect Mode
                </button>
                <button 
                    onClick={() => setMode('EXPLORER')}
                    className={`p-3 text-left border rounded flex items-center gap-3 transition-all ${mode === 'EXPLORER' ? 'bg-green-500/10 border-green-500 text-green-400' : 'border-transparent hover:bg-green-900/10 opacity-50'}`}
                >
                    <Database size={16} /> Data Explorer
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {mode === 'ARCHITECT' ? (
                    <div className="max-w-3xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Zap size={18} /> Database Architect (Natural Language to SQL)
                        </h3>
                        <div className="flex gap-4 mb-4">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-green-900/10 border border-green-900/30 p-4 rounded text-green-400 focus:border-green-500 outline-none h-32 font-mono"
                                placeholder="e.g. Create a table for student_applications with fields for user_id, job_id, and status..."
                            />
                        </div>
                        <button 
                            onClick={handleArchitect}
                            disabled={loading}
                            className="bg-green-600 text-black font-bold px-6 py-2 rounded hover:bg-green-500 flex items-center gap-2 mb-8"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />} Generate SQL
                        </button>

                        {generatedSql && (
                            <div className="bg-black border border-green-900/50 p-4 rounded relative group">
                                <pre className="text-xs text-green-300 whitespace-pre-wrap">{generatedSql}</pre>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(generatedSql)}
                                    className="absolute top-2 right-2 text-green-700 hover:text-green-400"
                                >
                                    Copy
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="flex gap-4 mb-4">
                            <input 
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="bg-green-900/10 border border-green-900/30 p-2 rounded text-green-400 outline-none w-64"
                                placeholder="Table Name (e.g. users)"
                            />
                            <button 
                                onClick={handleExplore}
                                disabled={loading}
                                className="bg-green-900/30 border border-green-900/50 px-4 rounded text-green-400 hover:bg-green-900/50"
                            >
                                {loading ? 'Loading...' : 'Fetch Data'}
                            </button>
                        </div>

                        {fetchError && (
                            <div className="text-red-400 mb-4 text-xs font-mono bg-red-900/10 p-2 border border-red-900/30">
                                Error: {fetchError}
                            </div>
                        )}

                        <div className="flex-1 overflow-auto border border-green-900/30 rounded bg-green-900/5">
                            {tableData.length > 0 ? (
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-green-900/20 text-green-300">
                                        <tr>
                                            {Object.keys(tableData[0]).map(key => (
                                                <th key={key} className="p-3 border-b border-green-900/30 font-mono">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, i) => (
                                            <tr key={i} className="hover:bg-green-900/10 transition-colors border-b border-green-900/10">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="p-3 text-green-400/80 truncate max-w-[200px]">
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex items-center justify-center text-green-900 uppercase tracking-widest">
                                    No Data Loaded
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};