"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ButtonLogout } from "@/components/AuthButtons";
import { Key, Users, Copy, Check, ChevronLeft, Database, Settings, ShieldCheck, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState({ openai: "", gemini: "", copilot: "" });
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollab, setNewCollab] = useState("");
  const [saved, setSaved] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    const savedKeys = localStorage.getItem("agent_user_keys");
    if (savedKeys) setKeys(JSON.parse(savedKeys));
    
    const savedCollabs = localStorage.getItem("agent_collaborators");
    if (savedCollabs) setCollaborators(JSON.parse(savedCollabs));
  }, [status]);

  const saveSettings = () => {
    localStorage.setItem("agent_user_keys", JSON.stringify(keys));
    localStorage.setItem("agent_collaborators", JSON.stringify(collaborators));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollab.trim() && !collaborators.includes(newCollab)) {
      const updated = [...collaborators, newCollab];
      setCollaborators(updated);
      setNewCollab("");
    }
  };

  const generateCode = () => {
     // Mock code generation for the owner
     const code = "NEO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
     setGeneratedCode(code);
  };

  if (status === "loading") return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">Syncing with Neo Matrix...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
           <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <div className="flex items-center gap-2">
              <Settings className="text-indigo-400 w-6 h-6 animate-pulse"/>
              <h1 className="text-xl font-bold tracking-tight text-white">Owner Dashboard</h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <a href="https://github.com/users/staylegitlonewolf/projects/5" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <ExternalLink className="w-4 h-4" /> Client Requests
           </a>
           <ButtonLogout />
        </div>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Profile Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/10 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <img src={session?.user?.image || ""} className="w-28 h-28 rounded-full mx-auto mb-6 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 relative z-10" alt="Avatar" />
               <h3 className="font-extrabold text-xl text-white relative z-10">{session?.user?.name}</h3>
               <p className="text-xs text-slate-500 font-mono tracking-tighter opacity-80 relative z-10">{session?.user?.email}</p>
               <div className="mt-6 flex justify-center gap-2 relative z-10">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Verified</span>
               </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Access Control</h4>
               <button onClick={generateCode} className="w-full text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-indigo-400" />
                     <span className="text-sm font-bold text-slate-300">Generate Access Code</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition translate-x--1 group-hover:translate-x-0" />
               </button>
               {generatedCode && (
                  <div className="p-4 bg-indigo-600/20 border border-indigo-400/30 rounded-2xl animate-in zoom-in-95 duration-200">
                     <p className="text-[10px] text-indigo-300 mb-1 font-bold uppercase tracking-widest">Temporary Secure Code</p>
                     <div className="flex items-center justify-between">
                        <code className="text-lg font-mono font-bold text-white tracking-widest">{generatedCode}</code>
                        <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="p-2 hover:bg-white/10 rounded-lg transition active:scale-90">
                           <Copy className="w-4 h-4 text-indigo-300" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </div>

          {/* Main Settings Area */}
          <div className="md:col-span-8 space-y-8 animate-in fade-in duration-500">
            {/* API Keys Section */}
            <section className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-8 shadow-2xl">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white tracking-tight">Personal API Integrations</h3>
                    <p className="text-sm text-slate-500">Provide your own model keys here to use custom AI configurations. Keys are stored safely and locally in your browser.</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">OpenAI / Codex API Key</label>
                    <input 
                      type="password" 
                      value={keys.openai}
                      onChange={(e) => setKeys({...keys, openai: e.target.value})}
                      placeholder="sk-..." 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Google Gemini API Key</label>
                    <input 
                      type="password" 
                      value={keys.gemini}
                      onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                      placeholder="AIza..." 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">GitHub Copilot Token</label>
                    <input 
                      type="password" 
                      value={keys.copilot}
                      onChange={(e) => setKeys({...keys, copilot: e.target.value})}
                      placeholder="ghp_..." 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden font-mono"
                    />
                  </div>
               </div>
               
               <button 
                 onClick={saveSettings}
                 className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold py-5 rounded-3xl transition-all shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-98 flex items-center justify-center gap-3"
               >
                 {saved ? <Check className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                 {saved ? "Settings Updated!" : "Save All Configuration"}
               </button>
            </section>

            {/* Collaborators Section */}
            <section className="p-8 rounded-3xl bg-white/5 border border-indigo-500/20 space-y-6">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white tracking-tight">Team Management</h3>
                    <p className="text-sm text-slate-500">Add trusted developers by email to give them access to this dashboard.</p>
                  </div>
               </div>
               
               <form onSubmit={addCollaborator} className="flex gap-4">
                  <input 
                    value={newCollab}
                    onChange={(e) => setNewCollab(e.target.value)}
                    placeholder="Enter email to invite..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white outline-hidden focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  <button type="submit" className="bg-white/10 hover:bg-white text-slate-100 hover:text-black px-8 rounded-2xl font-extrabold transition-all uppercase text-xs tracking-widest">Invite</button>
               </form>

               <div className="space-y-3 mt-8">
                  {collaborators.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition group">
                       <span className="text-sm font-bold text-slate-300">{c}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg">Pending Invite</span>
                          <button 
                            onClick={() => setCollaborators(collaborators.filter(col => col !== c))} 
                            className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                          >
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
                  {collaborators.length === 0 && (
                     <div className="text-center py-10 opacity-30 flex flex-col items-center gap-2">
                        <Users className="w-8 h-8" />
                        <p className="text-sm font-bold uppercase tracking-widest">No collaborators added yet.</p>
                     </div>
                  )}
               </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
