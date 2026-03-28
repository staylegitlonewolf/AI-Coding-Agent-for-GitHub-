"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ButtonLogout } from "@/components/AuthButtons";
import { Key, Users, Copy, Check, ChevronLeft, Database, Settings, ShieldCheck, ExternalLink, Zap, Bot, Tag, Play, Plus, X, ListOrdered, FileJson, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Agent = {
  id: string;
  name: string;
  role: string;
  order: number | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState({ openai: "", gemini: "", copilot: "" });
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollab, setNewCollab] = useState("");
  const [saved, setSaved] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  // Agent Orchestration State
  const [agents, setAgents] = useState<Agent[]>([
    { id: "1", name: "Agent Neo", role: "PLAN", order: null },
    { id: "2", name: "Agent Trinity", role: "TASK", order: null },
    { id: "3", name: "Agent Morpheus", role: "CODE", order: null },
    { id: "4", name: "Agent Oracle", role: "UI", order: null },
  ]);
  const [sequence, setSequence] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    const savedKeys = localStorage.getItem("agent_user_keys");
    if (savedKeys) setKeys(JSON.parse(savedKeys));
    
    const savedCollabs = localStorage.getItem("agent_collaborators");
    if (savedCollabs) setCollaborators(JSON.parse(savedCollabs));

    const savedSequence = localStorage.getItem("agent_sequence");
    if (savedSequence) setSequence(JSON.parse(savedSequence));
  }, [status]);

  const saveSettings = () => {
    localStorage.setItem("agent_user_keys", JSON.stringify(keys));
    localStorage.setItem("agent_collaborators", JSON.stringify(collaborators));
    localStorage.setItem("agent_sequence", JSON.stringify(sequence));
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
     const code = "NEO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
     setGeneratedCode(code);
  };

  const tagAgent = (id: string) => {
    if (sequence.includes(id)) {
       setSequence(sequence.filter(s => s !== id));
    } else {
       setSequence([...sequence, id]);
    }
  };

  const updateAgentRole = (id: string, role: string) => {
     setAgents(agents.map(a => a.id === id ? { ...a, role } : a));
  };

  const handleStartOrchestration = async () => {
     setIsStarting(true);
     // Build the AGENT_NEO.MD content
     const selectedAgents = sequence.map((id, index) => {
        const agent = agents.find(a => a.id === id);
        return `| ${index + 1} | ${agent?.name} | ${agent?.role} | Initializing... |`;
     }).join("\n");

     const markdownContent = `# AGENT_NEO.MD - MASTER ORCHESTRATION\n\nGenerated on ${new Date().toLocaleString()}\n\n| Order | Agent | Role | Status |\n|---|---|---|---|\n${selectedAgents}\n\n## Instructions\nThis team is configured to work in sequence as defined by the Neo Matrix. Do not deviate from the plan.`;
     
     try {
        await fetch("/api/agents/save", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ content: markdownContent })
        });
     } catch (e) {
        console.error("Failed to save master file", e);
     }
     
     // Save to local storage mock
     localStorage.setItem("AGENT_NEO_CONTENT", markdownContent);
     
     // Mock push to files
     console.log("Saving MASTER AGENT FILE:", markdownContent);
     
     setTimeout(() => {
        setIsStarting(false);
        alert("MASTER AGENT FILE (AGENT_NEO.MD) CREATED AND SYNCED. TEAM INITIALIZED.");
     }, 1500);
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
              <GraduationCap className="text-indigo-400 w-6 h-6 animate-pulse"/>
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

      <div className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/10 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <img src={session?.user?.image || ""} className="w-28 h-28 rounded-full mx-auto mb-6 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 relative z-10" alt="Avatar" />
               <h3 className="font-extrabold text-xl text-white relative z-10">{session?.user?.name}</h3>
               <p className="text-xs text-slate-500 font-mono tracking-tighter opacity-80 relative z-10">{session?.user?.email}</p>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 flex items-center gap-2"><ListOrdered className="w-4 h-4 text-indigo-400"/> Agent Workspace Link</h4>
               <div className="space-y-4">
                  {sequence.length === 0 ? <p className="text-[10px] text-slate-600 italic px-2">No agents linked to the Matrix sequence yet.</p> : (
                     <div className="space-y-2">
                        {sequence.map((id, idx) => {
                           const agent = agents.find(a => a.id === id);
                           return (
                              <div key={id} className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in slide-in-from-left-4 duration-300">
                                 <span className="text-xs font-black text-indigo-400 w-4">{idx + 1}</span>
                                 <span className="text-sm font-bold text-white flex-1">{agent?.name}</span>
                                 <span className="text-[9px] font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest">{agent?.role}</span>
                                 <button onClick={() => tagAgent(id)} className="p-1 hover:bg-white/10 rounded transition">
                                    <X className="w-3 h-3 text-slate-600" />
                                 </button>
                              </div>
                           )
                        })}
                     </div>
                  )}
               </div>
               
               {sequence.length > 0 && (
                  <button 
                    onClick={handleStartOrchestration}
                    disabled={isStarting}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                     {isStarting ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                     {isStarting ? "Initializing..." : "Start Matrix"}
                  </button>
               )}
            </div>
          </div>

          {/* Main Orchestration Grid */}
          <div className="lg:col-span-8 space-y-10">
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Bot className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Agent Team Orchestrator</h2>
                        <p className="text-sm text-slate-500">Configure your multi-agent hierarchy. Tag agents to define execution order.</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-1">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className={`relative p-8 rounded-[2.5rem] bg-white/5 border transition-all duration-500 cursor-pointer overflow-hidden group ${sequence.includes(agent.id) ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-white/10 hover:border-white/20 hover:scale-[1.02]'}`}
                      onClick={() => tagAgent(agent.id)}
                    >
                       {/* Ribbon/Tag */}
                       <div className="absolute top-0 right-8 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-lg border-x border-b border-indigo-400/30 flex items-center gap-2 uppercase tracking-widest min-w-[80px] justify-center">
                             <Tag className="w-3 h-3" />
                             <input 
                               value={agent.role}
                               onChange={(e) => {
                                 e.stopPropagation();
                                 updateAgentRole(agent.id, e.target.value);
                               }}
                               className="bg-transparent border-none outline-none text-center w-full placeholder-indigo-300"
                               onClick={(e) => e.stopPropagation()}
                             />
                          </div>
                       </div>

                       {/* Sequencing Badge */}
                       {sequence.includes(agent.id) && (
                          <div className="absolute top-8 left-8 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black text-lg shadow-lg border-2 border-indigo-400 animate-in zoom-in duration-300">
                             {sequence.indexOf(agent.id) + 1}
                          </div>
                       )}

                       <div className="flex flex-col items-center gap-6 mt-4">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${sequence.includes(agent.id) ? 'bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.4)] rotate-3' : 'bg-white/5 border border-white/10 group-hover:bg-indigo-500/20'}`}>
                             <Bot className={`w-10 h-10 transition-colors ${sequence.includes(agent.id) ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'}`} />
                          </div>
                          <div className="text-center">
                             <h3 className={`text-xl font-black transition-colors ${sequence.includes(agent.id) ? 'text-white' : 'text-slate-400'}`}>{agent.name}</h3>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-60">Ready for OPS</p>
                          </div>
                       </div>

                       <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all ${sequence.includes(agent.id) ? 'bg-indigo-500/20 text-indigo-300 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {sequence.includes(agent.id) ? "Tagged in Sequence" : "Click to Tag"}
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Standard Dashboard Sections below... */}
            <div className="border-t border-white/10 pt-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white tracking-tight">Personal API Integrations</h3>
                    <p className="text-sm text-slate-500">Provide keys locally for your personal agent team.</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reuse existing key inputs here if needed, or keep compact */}
                   <input 
                    type="password" 
                    value={keys.openai}
                    onChange={(e) => setKeys({...keys, openai: e.target.value})}
                    placeholder="OpenAI API Key" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500/50 outline-none text-sm font-mono"
                  />
                  <input 
                    type="password" 
                    value={keys.gemini}
                    onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                    placeholder="Google Gemini API Key" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500/50 outline-none text-sm font-mono"
                  />
               </div>
               
               <button 
                 onClick={saveSettings}
                 className="mt-8 px-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-[0.3em]"
               >
                 {saved ? "Settings Saved" : "Save Matrix Config"}
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
