"use client";
import { LogOut, KeyRound } from "lucide-react";
import { useAppContext } from "./Providers";
import { useState } from "react";

export function TokenLoginForm() {
  const { setTokens } = useAppContext();
  const [gh, setGh] = useState("");
  const [oai, setOai] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gh && oai) setTokens(gh.trim(), oai.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto w-full relative z-20">
      <div className="flex flex-col gap-2 text-left">
         <label className="text-sm font-semibold text-slate-300">GitHub Personal Access Token (PAT)</label>
         <input 
           type="password"
           required
           value={gh} 
           onChange={e => setGh(e.target.value)}
           placeholder="ghp_xxx..."
           className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
         />
      </div>
      <div className="flex flex-col gap-2 text-left">
         <label className="text-sm font-semibold text-slate-300">OpenAI API Key</label>
         <input 
           type="password"
           required
           value={oai} 
           onChange={e => setOai(e.target.value)}
           placeholder="sk-xxx..."
           className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
         />
      </div>
      <button 
        type="submit"
        disabled={!gh || !oai}
        className="mt-4 flex justify-center items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
      >
        <KeyRound className="w-5 h-5" />
        Save Keys Securely
      </button>
      <p className="text-xs text-slate-500 mt-2 text-center">Keys are stored locally in your browser and never sent to a database.</p>
    </form>
  );
}

export function ButtonLogout() {
  const { clearTokens } = useAppContext();
  return (
    <button 
      onClick={clearTokens}
      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-slate-300 rounded-full text-sm font-medium transition-all cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Remove Local Keys
    </button>
  );
}
