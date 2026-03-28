"use client";
import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { ButtonLogout } from "@/components/AuthButtons";
import { CodeSquare, Key, Users, Copy, Check, ChevronLeft, Globe, Database, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState({ openai: "", gemini: "", copilot: "" });
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollab, setNewCollab] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    // Load saved keys and collabs
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

  if (status === "loading") return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
           <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <div className="flex items-center gap-2">
              <Settings className="text-indigo-400 w-6 h-6"/>
              <h1 className="text-xl font-bold tracking-tight text-white">Owner Dashboard</h1>
           </div>
        </div>
        <ButtonLogout />
      </header>

      <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
               <img src={session?.user?.image || ""} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20" alt="Avatar" />
               <h3 className="font-bold text-lg text-white">{session?.user?.name}</h3>
               <p className="text-sm text-slate-400">{session?.user?.email}</p>
            </div>
            
            <nav className="space-y-1">
               <button className="w-full text-left px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-300 font-semibold flex items-center gap-3">
                  <Database className="w-5 h-5" /> Personal Keys
               </button>
               <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition flex items-center gap-3">
                  <Users className="w-5 h-5" /> Collaborators
               </button>
               <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition flex items-center gap-3">
                  <Globe className="w-5 h-5" /> Web Hooks
               </button>
            </nav>
          </div>

          {/* Main Settings Area */}
          <div className="md:col-span-2 space-y-8">
            {/* API Keys Section */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Key className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-white text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400">Personal API Integrations</h3>
               </div>
               <p className="text-sm text-slate-400 mb-6 italic opacity-80">Provide your own model keys here to use custom AI configurations. Keys are stored locally in your browser.</p>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">OpenAI / Codex API Key</label>
                    <input 
                      type="password" 
                      value={keys.openai}
                      onChange={(e) => setKeys({...keys, openai: e.target.value})}
                      placeholder="sk-..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google Gemini API Key</label>
                    <input 
                      type="password" 
                      value={keys.gemini}
                      onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                      placeholder="AIza..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GitHub Copilot Token</label>
                    <input 
                      type="password" 
                      value={keys.copilot}
                      onChange={(e) => setKeys({...keys, copilot: e.target.value})}
                      placeholder="ghp_..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-hidden"
                    />
                  </div>
               </div>
               
               <button 
                 onClick={saveSettings}
                 className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
               >
                 {saved ? "Settings Saved! ✓" : "Save All Configuration"}
               </button>
            </section>

            {/* Collaborators Section */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 border-indigo-500/20">
               <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-white">Team Management</h3>
               </div>
               
               <form onSubmit={addCollaborator} className="flex gap-2">
                  <input 
                    value={newCollab}
                    onChange={(e) => setNewCollab(e.target.value)}
                    placeholder="Enter email to invite..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-hidden"
                  />
                  <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl font-bold transition-all">Invite</button>
               </form>

               <div className="space-y-2">
                  {collaborators.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition">
                       <span className="text-sm text-slate-300">{c}</span>
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">Pending Invite</span>
                    </div>
                  ))}
                  {collaborators.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No collaborators added yet.</p>}
               </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
